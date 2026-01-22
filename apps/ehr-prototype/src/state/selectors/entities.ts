/**
 * Primitive entity selectors
 */

import type { EncounterState } from '../types';
import type {
  ChartItem,
  Suggestion,
  BackgroundTask,
  CareGapInstance,
} from '../../types';

// ============================================================================
// Items Selectors
// ============================================================================

/**
 * Select a single item by ID
 */
export const selectItem = (
  state: EncounterState,
  id: string
): ChartItem | undefined => state.entities.items[id];

/**
 * Select all items in display order
 */
export const selectAllItems = (state: EncounterState): ChartItem[] =>
  state.relationships.itemOrder
    .map(id => state.entities.items[id])
    .filter((item): item is ChartItem => item !== undefined);

/**
 * Select all item IDs in display order
 */
export const selectItemIds = (state: EncounterState): string[] =>
  state.relationships.itemOrder;

/**
 * Select items as a record (for direct access)
 */
export const selectItemsRecord = (
  state: EncounterState
): Record<string, ChartItem> => state.entities.items;

// ============================================================================
// Suggestions Selectors
// ============================================================================

/**
 * Select a single suggestion by ID
 */
export const selectSuggestion = (
  state: EncounterState,
  id: string
): Suggestion | undefined => state.entities.suggestions[id];

/**
 * Select all suggestions
 */
export const selectAllSuggestions = (state: EncounterState): Suggestion[] =>
  Object.values(state.entities.suggestions);

/**
 * Select suggestion IDs
 */
export const selectSuggestionIds = (state: EncounterState): string[] =>
  Object.keys(state.entities.suggestions);

// ============================================================================
// Tasks Selectors
// ============================================================================

/**
 * Select a single task by ID
 */
export const selectTask = (
  state: EncounterState,
  id: string
): BackgroundTask | undefined => state.entities.tasks[id];

/**
 * Select all tasks
 */
export const selectAllTasks = (state: EncounterState): BackgroundTask[] =>
  Object.values(state.entities.tasks);

/**
 * Select task IDs
 */
export const selectTaskIds = (state: EncounterState): string[] =>
  Object.keys(state.entities.tasks);

// ============================================================================
// Care Gaps Selectors
// ============================================================================

/**
 * Select a single care gap by ID
 */
export const selectCareGap = (
  state: EncounterState,
  id: string
): CareGapInstance | undefined => state.entities.careGaps[id];

/**
 * Select all care gaps
 */
export const selectAllCareGaps = (state: EncounterState): CareGapInstance[] =>
  Object.values(state.entities.careGaps);

/**
 * Select care gap IDs
 */
export const selectCareGapIds = (state: EncounterState): string[] =>
  Object.keys(state.entities.careGaps);
