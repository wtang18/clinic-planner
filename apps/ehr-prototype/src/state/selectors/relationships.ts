/**
 * Relationship-based selectors
 */

import type { EncounterState } from '../types';
import type {
  ChartItem,
  Suggestion,
  BackgroundTask,
  DiagnosisItem,
} from '../../types';

// ============================================================================
// Task → Item Relationships
// ============================================================================

/**
 * Get tasks for a specific item
 */
export const selectTasksForItem = (
  state: EncounterState,
  itemId: string
): BackgroundTask[] => {
  const taskIds = Object.entries(state.relationships.taskToItem)
    .filter(([_, relatedItemId]) => relatedItemId === itemId)
    .map(([taskId]) => taskId);
  
  return taskIds
    .map(id => state.entities.tasks[id])
    .filter((task): task is BackgroundTask => task !== undefined);
};

/**
 * Get the item related to a task
 */
export const selectItemForTask = (
  state: EncounterState,
  taskId: string
): ChartItem | undefined => {
  const itemId = state.relationships.taskToItem[taskId];
  return itemId ? state.entities.items[itemId] : undefined;
};

// ============================================================================
// Suggestion → Item Relationships
// ============================================================================

/**
 * Get suggestions for a specific item
 */
export const selectSuggestionsForItem = (
  state: EncounterState,
  itemId: string
): Suggestion[] => {
  const suggestionIds = Object.entries(state.relationships.suggestionToItem)
    .filter(([_, relatedItemId]) => relatedItemId === itemId)
    .map(([suggestionId]) => suggestionId);
  
  return suggestionIds
    .map(id => state.entities.suggestions[id])
    .filter((suggestion): suggestion is Suggestion => suggestion !== undefined);
};

/**
 * Get the item related to a suggestion
 */
export const selectItemForSuggestion = (
  state: EncounterState,
  suggestionId: string
): ChartItem | undefined => {
  const itemId = state.relationships.suggestionToItem[suggestionId];
  return itemId ? state.entities.items[itemId] : undefined;
};

/**
 * Get general suggestions (not related to any item)
 */
export const selectGeneralSuggestions = (state: EncounterState): Suggestion[] => {
  return Object.entries(state.relationships.suggestionToItem)
    .filter(([_, itemId]) => itemId === null)
    .map(([suggestionId]) => state.entities.suggestions[suggestionId])
    .filter((s): s is Suggestion => s !== undefined && s.status === 'active');
};

// ============================================================================
// Care Gap → Item Relationships
// ============================================================================

/**
 * Get items addressing a care gap
 */
export const selectItemsForCareGap = (
  state: EncounterState,
  gapId: string
): ChartItem[] => {
  const itemIds = state.relationships.careGapToItems[gapId] || [];
  return itemIds
    .map(id => state.entities.items[id])
    .filter((item): item is ChartItem => item !== undefined);
};

/**
 * Get care gaps addressed by an item
 */
export const selectCareGapsForItem = (
  state: EncounterState,
  itemId: string
): import('../../types').CareGapInstance[] => {
  const gapIds = Object.entries(state.relationships.careGapToItems)
    .filter(([_, itemIds]) => itemIds.includes(itemId))
    .map(([gapId]) => gapId);
  
  return gapIds
    .map(id => state.entities.careGaps[id])
    .filter((gap): gap is import('../../types').CareGapInstance => gap !== undefined);
};

// ============================================================================
// Diagnosis Linkages
// ============================================================================

/**
 * Get diagnosis items linked to an item
 */
export const selectLinkedDiagnoses = (
  state: EncounterState,
  itemId: string
): DiagnosisItem[] => {
  const item = state.entities.items[itemId];
  if (!item) return [];
  
  return item.linkedDiagnoses
    .map(dxId => state.entities.items[dxId])
    .filter((dx): dx is DiagnosisItem => dx?.category === 'diagnosis');
};

/**
 * Get items linked to a diagnosis
 */
export const selectItemsLinkedToDiagnosis = (
  state: EncounterState,
  dxId: string
): ChartItem[] => {
  return Object.values(state.entities.items).filter(
    item => item.linkedDiagnoses.includes(dxId)
  );
};

/**
 * Get items without diagnosis linkage (for orders)
 */
export const selectItemsWithoutDiagnosis = (
  state: EncounterState
): ChartItem[] => {
  const orderableCategories = ['medication', 'lab', 'imaging', 'procedure', 'referral'];
  return Object.values(state.entities.items).filter(
    item =>
      orderableCategories.includes(item.category) &&
      item.linkedDiagnoses.length === 0
  );
};
