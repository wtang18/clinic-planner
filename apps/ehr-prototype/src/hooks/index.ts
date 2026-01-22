/**
 * Custom Hooks
 *
 * React hooks for state management and service integration.
 */

// Encounter State Hooks
export {
  EncounterStoreProvider,
  useStore,
  useEncounterState,
  useSelector,
  useDispatch,
  useEncounterContext,
  usePatient,
  useEncounterMeta,
  useMode,
  useCurrentUser,
  useTranscriptionState,
  useSyncStatus,
  useHasPendingSync,
  useCounts,
} from './useEncounterState';
export type { EncounterStoreProviderProps } from './useEncounterState';

// Chart Item Hooks
export {
  useChartItems,
  useChartItem,
  useItemsByCategory,
  useItemsByStatus,
  useItemsRequiringReview,
  useAiGeneratedItems,
  useDiagnoses,
  useMedications,
  useAllergies,
  useItemActions,
  useChartItemsWithActions,
  useItemCountsByCategory,
  useHasUnsavedItems,
  useItemsLinkedToDiagnosis,
} from './useChartItems';
export type { ChartItemActions } from './useChartItems';

// Suggestion Hooks
export {
  useSuggestions,
  useSuggestion,
  useActiveSuggestions,
  useSuggestionsBySource,
  useHighConfidenceSuggestions,
  useSuggestionActions,
  useSuggestionsWithActions,
  useActiveSuggestionCount,
  useSuggestionsForItem,
  useSuggestionsGroupedByType,
  useHasPendingSuggestions,
  useTranscriptionSuggestions,
  useAiAnalysisSuggestions,
  useCareGapSuggestions,
} from './useSuggestions';
export type { SuggestionActions } from './useSuggestions';

// Task Hooks
export {
  useTasks,
  useTask,
  useTasksByStatus,
  usePendingTasks,
  useProcessingTasks,
  useReadyTasks,
  useCompletedTasks,
  useFailedTasks,
  useTaskActions,
  useTasksWithActions,
  usePendingReviewCount,
  useTasksForItem,
  useTasksGroupedByStatus,
  useHasActiveTasks,
  useHasFailedTasks,
  useOverallTaskProgress,
  useTaskPaneGroups,
} from './useTasks';
export type { TaskActions } from './useTasks';

// Care Gap Hooks
export {
  useCareGaps,
  useCareGap,
  useOpenCareGaps,
  usePendingCareGaps,
  useCareGapsByCategory,
  useCareGapsAddressedThisEncounter,
  useOverdueCareGaps,
  useCareGapActions,
  useCareGapsWithActions,
  useOpenCareGapCount,
  useOverdueCareGapCount,
  useCareGapsGroupedByPriority,
  useCareGapsGroupedByCategory,
  useCareGapPriorityBreakdown,
  useHasCriticalCareGaps,
  useCareGapsForItemCategory,
  useCanAddressGap,
} from './useCareGaps';
export type { CareGapActions } from './useCareGaps';
