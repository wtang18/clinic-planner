/**
 * Legend Data Assembly
 *
 * Merges flat shortcuts + chord shortcuts into a unified list of legend entries
 * with group labels. Consolidates G→1-9 into a single row.
 * Used by ShortcutLegendPanel to render the 3-tab grouped legend.
 */

import { shortcutManager, categoryToLegendTab } from './ShortcutManager';
import { formatKeyCombo, formatChordDisplay } from './defaultShortcuts';
import type { LegendTab } from './ShortcutManager';

// ============================================================================
// Types
// ============================================================================

export interface LegendEntry {
  /** Shortcut or chord ID */
  id: string;
  /** Human-readable description */
  description: string;
  /** Display-formatted key string (e.g., "⌘ + S" or "G → H") */
  displayKey: string;
  /** Which legend tab this belongs to */
  tab: LegendTab;
  /** Group label within the tab (e.g., "Go To", "Mode", "Left Pane") */
  group: string;
}

// ============================================================================
// Group assignment
// ============================================================================

/** IDs that belong to the "Quick Nav" group (utility/workspace destinations). */
const QUICK_NAV_IDS = new Set(['nav-todo', 'nav-settings', 'nav-workspace']);

/** IDs that belong to the "Input" group (data entry tools). */
const INPUT_IDS = new Set(['omni-add', 'palette']);

/** Assign a group label based on shortcut/chord ID. */
function assignGroup(id: string, tab: LegendTab): string {
  switch (tab) {
    case 'navigate':
      if (id.startsWith('nav-') && QUICK_NAV_IDS.has(id)) return 'Quick Nav';
      if (id.startsWith('nav-')) return 'Go To';
      return 'General';
    case 'charting':
      if (id.startsWith('mode-') || id === 'visit-workflow') return 'Mode';
      if (INPUT_IDS.has(id)) return 'Input';
      return 'Actions';
    case 'panes':
      if (id.startsWith('overview-')) return 'Overview';
      return 'Left Pane';
    default:
      return 'Other';
  }
}

// ============================================================================
// Sort order within groups
// ============================================================================

/** Explicit sort order for entries within their group. Lower = first. */
const SORT_ORDER: Record<string, number> = {
  // Navigate → Go To (main screen destinations)
  'nav-home': 0,
  'nav-visits': 1,
  'nav-patients': 2,
  'nav-search': 3,
  // Navigate → Quick Nav (utility/workspace)
  'nav-todo': 0,
  'nav-settings': 1,
  'nav-workspace': 2,
  // Navigate → General
  'help': 0,
  // Charting → Mode
  'mode-capture': 0,
  'mode-process': 1,
  'mode-review': 2,
  'visit-workflow': 3,
  // Charting → Input
  'omni-add': 0,
  'palette': 1,
  // Charting → Actions
  'save': 0,
  'transcription': 1,
  'escape': 2,
  // Panes → Left Pane
  'pane-toggle': 0,
  'pane-cycle-fwd': 1,
  'pane-cycle-back': 2,
  // Panes → Overview
  'overview-toggle': 0,
  'overview-cycle-fwd': 1,
  'overview-cycle-back': 2,
};

// ============================================================================
// Builder
// ============================================================================

/**
 * Build a grouped, sorted list of legend entries from all registered shortcuts + chords.
 * Consolidates G→1 through G→9 into a single "Patient workspace" entry.
 */
export function buildLegendEntries(isMac: boolean): LegendEntry[] {
  const entries: LegendEntry[] = [];

  // Flat shortcuts
  for (const shortcut of shortcutManager.getAll()) {
    const tab = categoryToLegendTab(shortcut.category);
    entries.push({
      id: shortcut.id,
      description: shortcut.description,
      displayKey: shortcut.displayKey ?? formatKeyCombo(shortcut.key, isMac),
      tab,
      group: assignGroup(shortcut.id, tab),
    });
  }

  // Chord shortcuts — consolidate G→1-9 into single entry
  let hasWorkspaceChord = false;
  for (const chord of shortcutManager.getAllChords()) {
    // Collapse nav-workspace-1 through nav-workspace-9 into one row
    if (chord.id.startsWith('nav-workspace-')) {
      if (!hasWorkspaceChord) {
        hasWorkspaceChord = true;
        const tab = categoryToLegendTab(chord.category);
        entries.push({
          id: 'nav-workspace',
          description: 'Patient workspace',
          displayKey: 'G → 1-9',
          tab,
          group: assignGroup('nav-workspace', tab),
        });
      }
      continue;
    }

    const tab = categoryToLegendTab(chord.category);
    entries.push({
      id: chord.id,
      description: chord.description,
      displayKey: chord.displayKey ?? formatChordDisplay(chord.leader, chord.follower),
      tab,
      group: assignGroup(chord.id, tab),
    });
  }

  // Static legend entry for AI Palette — ⌘K is handled by useAIKeyboardShortcuts,
  // not ShortcutManager, so we add it here for display only.
  entries.push({
    id: 'palette',
    description: 'AI Palette',
    displayKey: isMac ? '\u2318 + K' : 'Ctrl + K',
    tab: 'charting',
    group: assignGroup('palette', 'charting'),
  });

  // Sort by explicit order within groups
  entries.sort((a, b) => {
    const orderA = SORT_ORDER[a.id] ?? 99;
    const orderB = SORT_ORDER[b.id] ?? 99;
    return orderA - orderB;
  });

  return entries;
}
