/**
 * ShortcutManager
 *
 * Manages keyboard shortcuts for web users.
 * Platform-guarded to only run on web (Expo Web).
 */

import { Platform } from 'react-native';

// ============================================================================
// Types
// ============================================================================

type ShortcutHandler = () => void;
type KeyCombo = string;

export interface Shortcut {
  id: string;
  key: KeyCombo;
  description: string;
  category: 'navigation' | 'editing' | 'actions' | 'ai';
  handler: ShortcutHandler;
  /** Optional condition - shortcut only fires when this returns true */
  when?: () => boolean;
}

// ============================================================================
// ShortcutManager
// ============================================================================

export class ShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map();
  private keyMap: Map<string, string> = new Map();
  private enabled: boolean = true;

  constructor() {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      this.handleKeyDown = this.handleKeyDown.bind(this);
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  /**
   * Register a shortcut
   */
  register(shortcut: Shortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
    this.keyMap.set(this.normalizeKey(shortcut.key), shortcut.id);
  }

  /**
   * Register multiple shortcuts at once
   */
  registerAll(shortcuts: Shortcut[]): void {
    shortcuts.forEach((s) => this.register(s));
  }

  /**
   * Unregister a shortcut by id
   */
  unregister(id: string): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      this.keyMap.delete(this.normalizeKey(shortcut.key));
      this.shortcuts.delete(id);
    }
  }

  /**
   * Unregister multiple shortcuts
   */
  unregisterAll(ids: string[]): void {
    ids.forEach((id) => this.unregister(id));
  }

  /**
   * Enable shortcut processing
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable shortcut processing
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if shortcuts are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get all registered shortcuts
   */
  getAll(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by category
   */
  getByCategory(category: Shortcut['category']): Shortcut[] {
    return this.getAll().filter((s) => s.category === category);
  }

  /**
   * Get a specific shortcut by id
   */
  get(id: string): Shortcut | undefined {
    return this.shortcuts.get(id);
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
    this.shortcuts.clear();
    this.keyMap.clear();
  }

  // Private methods
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    // Ignore if typing in input/textarea/select
    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      // Only allow global shortcuts (Escape, Cmd/Ctrl combos) while typing
      if (!this.isGlobalShortcut(event)) return;
    }

    // Also ignore if content-editable
    if (target.isContentEditable) {
      if (!this.isGlobalShortcut(event)) return;
    }

    const keyCombo = this.eventToKeyCombo(event);
    const shortcutId = this.keyMap.get(keyCombo);

    if (shortcutId) {
      const shortcut = this.shortcuts.get(shortcutId);
      if (shortcut) {
        // Check condition if provided
        if (shortcut.when && !shortcut.when()) return;

        event.preventDefault();
        shortcut.handler();
      }
    }
  }

  private eventToKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey || event.metaKey) parts.push('mod');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');

    const key = event.key.toLowerCase();
    if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
      parts.push(key);
    }

    return parts.join('+');
  }

  private normalizeKey(key: KeyCombo): string {
    return key
      .toLowerCase()
      .replace('ctrl', 'mod')
      .replace('cmd', 'mod')
      .replace('command', 'mod');
  }

  private isGlobalShortcut(event: KeyboardEvent): boolean {
    // Escape always works
    if (event.key === 'Escape') return true;
    // Cmd/Ctrl combos work globally
    if (event.ctrlKey || event.metaKey) return true;
    return false;
  }
}

// Singleton instance
export const shortcutManager = new ShortcutManager();
