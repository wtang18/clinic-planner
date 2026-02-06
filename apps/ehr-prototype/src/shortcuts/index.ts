/**
 * Keyboard Shortcuts System
 *
 * Manager, default shortcuts, and help modal for web users.
 */

export { ShortcutManager, shortcutManager } from './ShortcutManager';
export type { Shortcut } from './ShortcutManager';

export {
  registerDefaultShortcuts,
  formatKeyCombo,
} from './defaultShortcuts';
export type { ShortcutActions } from './defaultShortcuts';

export { ShortcutHelpModal } from './ShortcutHelpModal';
