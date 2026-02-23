/**
 * Default Shortcuts
 *
 * Registers the default set of keyboard shortcuts (flat + chord) for the application.
 */

import { shortcutManager } from './ShortcutManager';
import type { Shortcut, ChordShortcut } from './ShortcutManager';

// ============================================================================
// Types
// ============================================================================

export interface ShortcutActions {
  openOmniAdd: () => void;
  toggleTranscription: () => void;
  switchMode: (mode: string) => void;
  openPalette: () => void;
  save: () => void;
  help: () => void;
  /** Navigate to a named screen */
  navigate: (screen: string) => void;
  /** Navigate to a patient workspace slot (1–9) */
  navigateWorkspace: (slot: number) => void;
}

// ============================================================================
// Registration
// ============================================================================

/**
 * Register the default set of shortcuts (flat + chord).
 * Returns a cleanup function to unregister them all.
 */
export function registerDefaultShortcuts(actions: ShortcutActions): () => void {
  // ------------------------------------------------------------------
  // Flat shortcuts
  // ------------------------------------------------------------------
  const shortcuts: Shortcut[] = [
    // Charting — mode switching
    {
      id: 'mode-capture',
      key: '1',
      description: 'Switch to Capture mode',
      category: 'charting',
      handler: () => actions.switchMode('capture'),
    },
    {
      id: 'mode-process',
      key: '2',
      description: 'Switch to Process mode',
      category: 'charting',
      handler: () => actions.switchMode('process'),
    },
    {
      id: 'mode-review',
      key: '3',
      description: 'Switch to Review mode',
      category: 'charting',
      handler: () => actions.switchMode('review'),
    },

    // Visit Workflow (canvas pane toggle — future)
    {
      id: 'visit-workflow',
      key: '0',
      description: 'Visit Workflow (Coming soon)',
      category: 'charting',
      handler: () => {},
    },

    // Charting — actions
    {
      id: 'omni-add',
      key: '/',
      description: 'Add to Chart',
      category: 'charting',
      handler: actions.openOmniAdd,
    },
    {
      id: 'save',
      key: 'mod+s',
      description: 'Save encounter',
      category: 'charting',
      handler: actions.save,
    },
    // Note: ⌘K is handled by useAIKeyboardShortcuts hook for left pane awareness

    {
      id: 'transcription',
      key: 'mod+shift+t',
      description: 'Start/Pause transcription',
      category: 'charting',
      handler: actions.toggleTranscription,
    },
    {
      id: 'escape',
      key: 'escape',
      description: 'Close current panel',
      category: 'charting',
      handler: () => {
        // Escape is usually handled by individual modals — this is a fallback
      },
    },

    // Note: AI Palette (⌘K) is handled by useAIKeyboardShortcuts, not here.
    // A legend-only entry is added in legendData.ts for display.

    // Help
    {
      id: 'help',
      key: '?',
      description: 'Show keyboard shortcuts',
      category: 'navigation',
      handler: actions.help,
    },
  ];

  // ------------------------------------------------------------------
  // G-chord navigation shortcuts
  // ------------------------------------------------------------------
  const chords: ChordShortcut[] = [
    {
      id: 'nav-home',
      leader: 'g',
      follower: 'h',
      description: 'Go to Home',
      category: 'navigation',
      handler: () => actions.navigate('home'),
    },
    {
      id: 'nav-visits',
      leader: 'g',
      follower: 'v',
      description: 'Go to Visits',
      category: 'navigation',
      handler: () => actions.navigate('home'), // placeholder until Visits screen exists
    },
    {
      id: 'nav-patients',
      leader: 'g',
      follower: 'p',
      description: 'Go to All Patients',
      category: 'navigation',
      handler: () => actions.navigate('home'), // placeholder
    },
    {
      id: 'nav-search',
      leader: 'g',
      follower: 's',
      description: 'Go to Search',
      category: 'navigation',
      handler: () => actions.navigate('home'), // placeholder
    },
    {
      id: 'nav-settings',
      leader: 'g',
      follower: ',',
      description: 'Go to Settings',
      category: 'navigation',
      handler: () => actions.navigate('settings'),
    },
    {
      id: 'nav-todo',
      leader: 'g',
      follower: 't',
      description: 'Go to To-Do',
      category: 'navigation',
      handler: () => actions.navigate('home'), // placeholder
    },
    // G→1 through G→9: patient workspace slots
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `nav-workspace-${i + 1}`,
      leader: 'g',
      follower: String(i + 1),
      description: `Go to Patient ${i + 1}`,
      category: 'navigation' as const,
      handler: () => actions.navigateWorkspace(i + 1),
    })),
  ];

  // Register all
  shortcuts.forEach((s) => shortcutManager.register(s));
  chords.forEach((c) => shortcutManager.registerChord(c));

  // Cleanup
  return () => {
    shortcuts.forEach((s) => shortcutManager.unregister(s.id));
    chords.forEach((c) => shortcutManager.unregisterChord(c.id));
  };
}

// ============================================================================
// Display Formatting
// ============================================================================

/**
 * Get the formatted key display for a given key combo.
 * Handles brackets and backslash for display.
 */
export function formatKeyCombo(
  key: string,
  isMac: boolean = false
): string {
  const modKey = isMac ? '\u2318' : 'Ctrl';

  return key
    .replace('mod', modKey)
    .replace('shift', isMac ? '\u21E7' : 'Shift')
    .replace('alt', isMac ? '\u2325' : 'Alt')
    .replace('escape', 'Esc')
    .replace(/\+/g, ' + ')
    .toUpperCase();
}

/**
 * Format a chord shortcut for display.
 * Returns e.g., "G → H" for leader='g', follower='h'.
 */
export function formatChordDisplay(
  leader: string,
  follower: string,
): string {
  return `${leader.toUpperCase()} → ${follower.toUpperCase()}`;
}
