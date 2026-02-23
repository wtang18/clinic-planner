/**
 * Keyboard Shortcuts System
 *
 * Manager (with chord support + event bus), default shortcuts, legend panel,
 * and help UI for web users.
 */

export {
  ShortcutManager,
  shortcutManager,
  eventToKeyCombo,
  normalizeKey,
  isGlobalShortcut,
  categoryToLegendTab,
} from './ShortcutManager';
export type {
  Shortcut,
  ChordShortcut,
  ShortcutCategory,
  ShortcutEvent,
  ShortcutEventType,
  ShortcutListener,
  LegendTab,
} from './ShortcutManager';

export {
  registerDefaultShortcuts,
  formatKeyCombo,
  formatChordDisplay,
} from './defaultShortcuts';
export type { ShortcutActions } from './defaultShortcuts';

export { ChordBadge } from './ChordBadge';
export { usePaneShortcuts } from './usePaneShortcuts';
export { ShortcutLegendPanel } from './ShortcutLegendPanel';
export { getTriedShortcuts, markShortcutTried, clearTriedShortcuts } from './shortcutProgress';
export { buildLegendEntries } from './legendData';
export type { LegendEntry } from './legendData';
