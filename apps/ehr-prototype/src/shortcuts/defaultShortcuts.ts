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
  /** Context-dependent segment switch: 1/2/3 map to phase (workflow) or mode (charting) */
  contextSegment: (index: number) => void;
  openPalette: () => void;
  save: () => void;
  help: () => void;
  /** Navigate to a named screen */
  navigate: (screen: string) => void;
  /** Navigate to a patient workspace slot (1–9) */
  navigateWorkspace: (slot: number) => void;
  /** Toggle between Workflow and Charting views */
  toggleWorkflow: () => void;
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
    // Context-dependent segment switching (1/2/3)
    // In charting: Capture/Process/Review; in workflow: Check-in/Triage/Checkout
    {
      id: 'mode-capture',
      key: '1',
      description: 'First segment (Capture / Check-in)',
      category: 'charting',
      handler: () => actions.contextSegment(1),
    },
    {
      id: 'mode-process',
      key: '2',
      description: 'Second segment (Process / Triage)',
      category: 'charting',
      handler: () => actions.contextSegment(2),
    },
    {
      id: 'mode-review',
      key: '3',
      description: 'Third segment (Review / Checkout)',
      category: 'charting',
      handler: () => actions.contextSegment(3),
    },

    // Toggle Workflow view
    {
      id: 'visit-workflow',
      key: '0',
      description: 'Toggle Workflow / Chart',
      category: 'charting',
      handler: () => actions.toggleWorkflow(),
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
      key: 'r',
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
      description: 'Home',
      category: 'navigation',
      handler: () => actions.navigate('home'),
    },
    {
      id: 'nav-visits',
      leader: 'g',
      follower: 'v',
      description: 'Visits',
      category: 'navigation',
      handler: () => {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('ehr:chord-placeholder'));
      },
    },
    {
      id: 'nav-patients',
      leader: 'g',
      follower: 'p',
      description: 'All Patients',
      category: 'navigation',
      handler: () => {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('ehr:chord-placeholder'));
      },
    },
    {
      id: 'nav-search',
      leader: 'g',
      follower: 's',
      description: 'Search',
      category: 'navigation',
      handler: () => {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('ehr:chord-placeholder'));
      },
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
      description: 'Tasks',
      category: 'navigation',
      handler: () => {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('ehr:chord-placeholder'));
      },
    },
    {
      id: 'nav-fax',
      leader: 'g',
      follower: 'f',
      description: 'Fax Inbox',
      category: 'navigation',
      handler: () => {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('ehr:chord-placeholder'));
      },
    },
    {
      id: 'nav-messages',
      leader: 'g',
      follower: 'm',
      description: 'Messages',
      category: 'navigation',
      handler: () => {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('ehr:chord-placeholder'));
      },
    },
    {
      id: 'nav-care',
      leader: 'g',
      follower: 'c',
      description: 'Care Adherence',
      category: 'navigation',
      handler: () => {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('ehr:chord-placeholder'));
      },
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
