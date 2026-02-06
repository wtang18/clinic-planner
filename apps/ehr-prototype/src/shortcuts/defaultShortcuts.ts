/**
 * Default Shortcuts
 *
 * Registers the default set of keyboard shortcuts for the application.
 */

import { shortcutManager, Shortcut } from './ShortcutManager';

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
}

// ============================================================================
// Registration
// ============================================================================

/**
 * Register the default set of shortcuts.
 * Returns a cleanup function to unregister them.
 */
export function registerDefaultShortcuts(actions: ShortcutActions): () => void {
  const shortcuts: Shortcut[] = [
    // Navigation
    {
      id: 'mode-capture',
      key: '1',
      description: 'Switch to Capture mode',
      category: 'navigation',
      handler: () => actions.switchMode('capture'),
    },
    {
      id: 'mode-process',
      key: '2',
      description: 'Switch to Process mode',
      category: 'navigation',
      handler: () => actions.switchMode('process'),
    },
    {
      id: 'mode-review',
      key: '3',
      description: 'Switch to Review mode',
      category: 'navigation',
      handler: () => actions.switchMode('review'),
    },

    // Editing
    {
      id: 'omni-add',
      key: 'a',
      description: 'Open Add to Chart',
      category: 'editing',
      handler: actions.openOmniAdd,
    },
    {
      id: 'save',
      key: 'mod+s',
      description: 'Save encounter',
      category: 'editing',
      handler: actions.save,
    },
    {
      id: 'search',
      key: 'mod+k',
      description: 'Quick search',
      category: 'editing',
      handler: actions.openOmniAdd,
    },

    // Actions
    {
      id: 'transcription',
      key: 't',
      description: 'Toggle transcription',
      category: 'actions',
      handler: actions.toggleTranscription,
    },
    {
      id: 'escape',
      key: 'escape',
      description: 'Close current panel',
      category: 'actions',
      handler: () => {
        // Escape is usually handled by individual modals
        // This is a fallback
      },
    },

    // AI
    {
      id: 'palette',
      key: 'p',
      description: 'Open AI Palette',
      category: 'ai',
      handler: actions.openPalette,
    },

    // Help
    {
      id: 'help',
      key: '?',
      description: 'Show keyboard shortcuts',
      category: 'navigation',
      handler: actions.help,
    },
    {
      id: 'help-shift',
      key: 'shift+/',
      description: 'Show keyboard shortcuts',
      category: 'navigation',
      handler: actions.help,
    },
  ];

  shortcuts.forEach((s) => shortcutManager.register(s));

  // Return cleanup function
  return () => {
    shortcuts.forEach((s) => shortcutManager.unregister(s.id));
  };
}

/**
 * Get the formatted key display for a given key combo
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
    .replace('+', ' + ')
    .toUpperCase();
}
