/**
 * ShortcutManager
 *
 * Manages keyboard shortcuts for web users, including multi-key chord sequences
 * (e.g., G→H for "Go to Home") and an event bus for external observers.
 * Platform-guarded to only run on web (Expo Web).
 */

import { Platform } from 'react-native';

// ============================================================================
// Types
// ============================================================================

type ShortcutHandler = () => void;
type KeyCombo = string;

export type ShortcutCategory = 'navigation' | 'charting' | 'panes' | 'editing' | 'actions' | 'ai';

export interface Shortcut {
  id: string;
  key: KeyCombo;
  description: string;
  category: ShortcutCategory;
  handler: ShortcutHandler;
  /** Optional condition - shortcut only fires when this returns true */
  when?: () => boolean;
  /** Optional display key override (e.g., "0" might display as "⓪") */
  displayKey?: string;
}

export interface ChordShortcut {
  id: string;
  /** First key in the chord sequence (e.g., "g") */
  leader: string;
  /** Second key in the chord sequence (e.g., "h") */
  follower: string;
  description: string;
  category: ShortcutCategory;
  handler: ShortcutHandler;
  /** Optional condition */
  when?: () => boolean;
  /** Optional display key override */
  displayKey?: string;
}

export type ShortcutEventType =
  | 'fired'
  | 'chord-start'
  | 'chord-complete'
  | 'chord-cancel';

export interface ShortcutEvent {
  type: ShortcutEventType;
  /** Shortcut or chord ID that was fired (absent for chord-start/cancel) */
  shortcutId?: string;
  /** The leader key (present for chord events) */
  leader?: string;
  /** The follower key (present for chord-complete) */
  follower?: string;
  /** Timestamp */
  timestamp: number;
}

export type ShortcutListener = (event: ShortcutEvent) => void;

/** Legend tab identifier for the 3-tab legend model */
export type LegendTab = 'navigate' | 'panes' | 'charting';

// ============================================================================
// Pure Key Combo Utilities (exported for testing)
// ============================================================================

/**
 * Convert a KeyboardEvent into a normalized key combo string.
 * Shift is omitted for shifted symbols (?, !, @, etc.) where the character
 * itself encodes the shift — prevents "shift+?" when "?" is the registration.
 */
export function eventToKeyCombo(event: KeyboardEvent): string {
  const parts: string[] = [];
  const hasCmd = event.ctrlKey || event.metaKey;

  if (hasCmd) parts.push('mod');
  if (event.altKey) parts.push('alt');

  const key = event.key.toLowerCase();
  const isModifier = ['control', 'shift', 'alt', 'meta'].includes(key);

  if (event.shiftKey) {
    const isLetter = /^[a-z]$/i.test(event.key);
    if (hasCmd || event.altKey || isLetter) {
      parts.push('shift');
    }
  }

  if (!isModifier) {
    parts.push(key);
  }

  return parts.join('+');
}

/**
 * Normalize a key combo string for consistent lookup.
 * Maps ctrl/cmd/command → mod, lowercases.
 */
export function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace('ctrl', 'mod')
    .replace('cmd', 'mod')
    .replace('command', 'mod');
}

/**
 * Check if a KeyboardEvent represents a "global" shortcut that should
 * work even when typing in input fields.
 */
export function isGlobalShortcut(event: KeyboardEvent): boolean {
  if (event.key === 'Escape') return true;
  if (event.ctrlKey || event.metaKey) return true;
  return false;
}

/**
 * Map shortcut categories to the 3-tab legend model.
 * navigation → 'navigate', panes → 'panes', everything else → 'charting'.
 */
export function categoryToLegendTab(category: ShortcutCategory): LegendTab {
  if (category === 'navigation') return 'navigate';
  if (category === 'panes') return 'panes';
  return 'charting';
}

// ============================================================================
// Constants
// ============================================================================

/** Chord timeout: how long after pressing a leader key before the chord is cancelled */
const CHORD_TIMEOUT_MS = 1500;

// ============================================================================
// ShortcutManager
// ============================================================================

export class ShortcutManager {
  // --- Flat shortcuts ---
  private shortcuts: Map<string, Shortcut> = new Map();
  private keyMap: Map<string, string> = new Map();
  private enabled: boolean = true;

  // --- Chord shortcuts ---
  /** leader → Map<follower, chordId> */
  private chordMap: Map<string, Map<string, string>> = new Map();
  private chordShortcuts: Map<string, ChordShortcut> = new Map();
  private chordLeader: string | null = null;
  private chordTimeout: ReturnType<typeof setTimeout> | null = null;

  // --- Event bus ---
  private listeners: Set<ShortcutListener> = new Set();

  constructor() {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      this.handleKeyDown = this.handleKeyDown.bind(this);
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  // ========================================================================
  // Flat shortcut methods
  // ========================================================================

  register(shortcut: Shortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
    this.keyMap.set(normalizeKey(shortcut.key), shortcut.id);
  }

  registerAll(shortcuts: Shortcut[]): void {
    shortcuts.forEach((s) => this.register(s));
  }

  unregister(id: string): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      this.keyMap.delete(normalizeKey(shortcut.key));
      this.shortcuts.delete(id);
    }
  }

  unregisterAll(ids: string[]): void {
    ids.forEach((id) => this.unregister(id));
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getAll(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  getByCategory(category: ShortcutCategory): Shortcut[] {
    return this.getAll().filter((s) => s.category === category);
  }

  get(id: string): Shortcut | undefined {
    return this.shortcuts.get(id);
  }

  // ========================================================================
  // Chord shortcut methods
  // ========================================================================

  registerChord(chord: ChordShortcut): void {
    this.chordShortcuts.set(chord.id, chord);
    const leader = normalizeKey(chord.leader);
    const follower = normalizeKey(chord.follower);
    if (!this.chordMap.has(leader)) {
      this.chordMap.set(leader, new Map());
    }
    this.chordMap.get(leader)!.set(follower, chord.id);
  }

  unregisterChord(id: string): void {
    const chord = this.chordShortcuts.get(id);
    if (chord) {
      const leader = normalizeKey(chord.leader);
      const follower = normalizeKey(chord.follower);
      const followers = this.chordMap.get(leader);
      if (followers) {
        followers.delete(follower);
        if (followers.size === 0) this.chordMap.delete(leader);
      }
      this.chordShortcuts.delete(id);
    }
  }

  getAllChords(): ChordShortcut[] {
    return Array.from(this.chordShortcuts.values());
  }

  /** Get the current chord state: the pending leader key or null */
  getChordState(): string | null {
    return this.chordLeader;
  }

  // ========================================================================
  // Event bus
  // ========================================================================

  /** Emit a 'fired' event for shortcuts handled outside ShortcutManager (e.g., ⌘K). */
  notifyFired(shortcutId: string): void {
    this.emit({ type: 'fired', shortcutId, timestamp: Date.now() });
  }

  /** Subscribe to shortcut events. Returns an unsubscribe function. */
  subscribe(listener: ShortcutListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event: ShortcutEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  // ========================================================================
  // Lifecycle
  // ========================================================================

  destroy(): void {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
    this.cancelChord();
    this.shortcuts.clear();
    this.keyMap.clear();
    this.chordShortcuts.clear();
    this.chordMap.clear();
    this.listeners.clear();
  }

  // ========================================================================
  // Key event handling
  // ========================================================================

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    // Ignore if typing in input/textarea/select
    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      if (!isGlobalShortcut(event)) return;
    }

    // Also ignore if content-editable
    if (target.isContentEditable) {
      if (!isGlobalShortcut(event)) return;
    }

    const keyCombo = eventToKeyCombo(event);

    // --- Step 1: If chord is pending, check for follower ---
    if (this.chordLeader !== null) {
      event.preventDefault();

      // Escape cancels the chord
      if (event.key === 'Escape') {
        this.cancelChord();
        return;
      }

      const followers = this.chordMap.get(this.chordLeader);
      const chordId = followers?.get(keyCombo);

      if (chordId) {
        const chord = this.chordShortcuts.get(chordId);
        if (chord) {
          if (chord.when && !chord.when()) {
            this.cancelChord();
            return;
          }
          const leader = this.chordLeader;
          this.clearChordState();
          chord.handler();
          this.emit({
            type: 'chord-complete',
            shortcutId: chordId,
            leader,
            follower: keyCombo,
            timestamp: Date.now(),
          });
          return;
        }
      }

      // Invalid follower — cancel the chord
      this.cancelChord();
      return;
    }

    // --- Step 2: Check if key is a chord leader (no modifiers) ---
    if (
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !event.shiftKey &&
      this.chordMap.has(keyCombo)
    ) {
      // Only enter chord mode if the key isn't ALSO a flat shortcut,
      // or if it is, the chord takes priority (user presses G, we wait for follower)
      event.preventDefault();
      this.chordLeader = keyCombo;
      this.chordTimeout = setTimeout(() => this.cancelChord(), CHORD_TIMEOUT_MS);
      this.emit({
        type: 'chord-start',
        leader: keyCombo,
        timestamp: Date.now(),
      });
      return;
    }

    // --- Step 3: Normal flat shortcut lookup ---
    const shortcutId = this.keyMap.get(keyCombo);
    if (shortcutId) {
      const shortcut = this.shortcuts.get(shortcutId);
      if (shortcut) {
        if (shortcut.when && !shortcut.when()) return;
        event.preventDefault();
        shortcut.handler();
        this.emit({
          type: 'fired',
          shortcutId,
          timestamp: Date.now(),
        });
      }
    }
  }

  // ========================================================================
  // Chord state helpers
  // ========================================================================

  private cancelChord(): void {
    if (this.chordLeader !== null) {
      this.emit({
        type: 'chord-cancel',
        leader: this.chordLeader,
        timestamp: Date.now(),
      });
    }
    this.clearChordState();
  }

  private clearChordState(): void {
    this.chordLeader = null;
    if (this.chordTimeout !== null) {
      clearTimeout(this.chordTimeout);
      this.chordTimeout = null;
    }
  }
}

// Singleton instance
export const shortcutManager = new ShortcutManager();
