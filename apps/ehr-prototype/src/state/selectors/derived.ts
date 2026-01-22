/**
 * Derived selectors with filtering and grouping
 */

import type { EncounterState } from '../types';
import type {
  ChartItem,
  ItemCategory,
  ItemStatus,
  Suggestion,
  SuggestionSource,
  BackgroundTask,
  TaskStatus,
  CareGapInstance,
  CareGapCategory,
  DiagnosisItem,
  MedicationItem,
  AllergyItem,
} from '../../types';
import { selectAllItems, selectAllSuggestions, selectAllTasks, selectAllCareGaps } from './entities';

// ============================================================================
// Items Derived Selectors
// ============================================================================

/**
 * Select items by category
 */
export const selectItemsByCategory = (
  state: EncounterState,
  category: ItemCategory
): ChartItem[] => selectAllItems(state).filter(item => item.category === category);

/**
 * Select items by status
 */
export const selectItemsByStatus = (
  state: EncounterState,
  status: ItemStatus
): ChartItem[] => selectAllItems(state).filter(item => item.status === status);

/**
 * Select items requiring review
 */
export const selectItemsRequiringReview = (state: EncounterState): ChartItem[] =>
  selectAllItems(state).filter(item => item._meta.requiresReview);

/**
 * Select AI-generated items
 */
export const selectAiGeneratedItems = (state: EncounterState): ChartItem[] =>
  selectAllItems(state).filter(item => item._meta.aiGenerated);

/**
 * Select diagnosis items
 */
export const selectDiagnoses = (state: EncounterState): DiagnosisItem[] =>
  selectItemsByCategory(state, 'diagnosis') as DiagnosisItem[];

/**
 * Select medication items
 */
export const selectMedications = (state: EncounterState): MedicationItem[] =>
  selectItemsByCategory(state, 'medication') as MedicationItem[];

/**
 * Select allergy items
 */
export const selectAllergies = (state: EncounterState): AllergyItem[] =>
  selectItemsByCategory(state, 'allergy') as AllergyItem[];

/**
 * Group items by category
 */
export const selectItemsGroupedByCategory = (
  state: EncounterState
): Record<ItemCategory, ChartItem[]> => {
  const items = selectAllItems(state);
  const grouped: Partial<Record<ItemCategory, ChartItem[]>> = {};
  
  for (const item of items) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category]!.push(item);
  }
  
  return grouped as Record<ItemCategory, ChartItem[]>;
};

// ============================================================================
// Suggestions Derived Selectors
// ============================================================================

/**
 * Select active suggestions (not expired, dismissed, etc.)
 */
export const selectActiveSuggestions = (state: EncounterState): Suggestion[] =>
  selectAllSuggestions(state).filter(s => s.status === 'active');

/**
 * Select suggestions by source
 */
export const selectSuggestionsBySource = (
  state: EncounterState,
  source: SuggestionSource
): Suggestion[] => selectAllSuggestions(state).filter(s => s.source === source);

/**
 * Select high-confidence suggestions (>0.85)
 */
export const selectHighConfidenceSuggestions = (
  state: EncounterState
): Suggestion[] =>
  selectActiveSuggestions(state).filter(s => s.confidence > 0.85);

// ============================================================================
// Tasks Derived Selectors
// ============================================================================

/**
 * Select tasks by status
 */
export const selectTasksByStatus = (
  state: EncounterState,
  status: TaskStatus
): BackgroundTask[] => selectAllTasks(state).filter(t => t.status === status);

/**
 * Select pending tasks (needs action)
 */
export const selectPendingTasks = (state: EncounterState): BackgroundTask[] =>
  selectAllTasks(state).filter(
    t => t.status === 'pending-review' || t.status === 'queued'
  );

/**
 * Select processing tasks
 */
export const selectProcessingTasks = (state: EncounterState): BackgroundTask[] =>
  selectTasksByStatus(state, 'processing');

/**
 * Select ready tasks
 */
export const selectReadyTasks = (state: EncounterState): BackgroundTask[] =>
  selectTasksByStatus(state, 'ready');

/**
 * Select completed tasks
 */
export const selectCompletedTasks = (state: EncounterState): BackgroundTask[] =>
  selectTasksByStatus(state, 'completed');

/**
 * Select failed tasks
 */
export const selectFailedTasks = (state: EncounterState): BackgroundTask[] =>
  selectTasksByStatus(state, 'failed');

// ============================================================================
// Care Gaps Derived Selectors
// ============================================================================

/**
 * Select open care gaps
 */
export const selectOpenCareGaps = (state: EncounterState): CareGapInstance[] =>
  selectAllCareGaps(state).filter(g => g.status === 'open');

/**
 * Select pending care gaps
 */
export const selectPendingCareGaps = (state: EncounterState): CareGapInstance[] =>
  selectAllCareGaps(state).filter(g => g.status === 'pending');

/**
 * Select care gaps by category
 */
export const selectCareGapsByCategory = (
  state: EncounterState,
  category: CareGapCategory
): CareGapInstance[] =>
  selectAllCareGaps(state).filter(g => g._display.category === category);

/**
 * Select care gaps addressed this encounter
 */
export const selectCareGapsAddressedThisEncounter = (
  state: EncounterState
): CareGapInstance[] =>
  selectAllCareGaps(state).filter(g => g.addressedThisEncounter);

/**
 * Select overdue care gaps
 */
export const selectOverdueCareGaps = (state: EncounterState): CareGapInstance[] => {
  const now = new Date();
  return selectOpenCareGaps(state).filter(
    g => g.dueBy && g.dueBy < now
  );
};

// ============================================================================
// Count Selectors
// ============================================================================

/**
 * Select counts for various entities
 */
export const selectCounts = (state: EncounterState) => ({
  items: Object.keys(state.entities.items).length,
  activeSuggestions: selectActiveSuggestions(state).length,
  pendingTasks: selectPendingTasks(state).length,
  openCareGaps: selectOpenCareGaps(state).length,
  itemsRequiringReview: selectItemsRequiringReview(state).length,
});
