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

// Layout Hooks
export {
  useBreakpoint,
  useMinBreakpoint,
  useMaxBreakpoint,
  BREAKPOINTS,
} from './useBreakpoint';
export type { Breakpoint, BreakpointConfig, BreakpointState } from './useBreakpoint';

// Navigation Hooks
export { useToDoNavigation } from './useToDoNavigation';
export type { ToDoNavigationState, ToDoNavigationContext } from './useToDoNavigation';

// AI Assistant Hooks
export { useAIAssistant } from './useAIAssistant';
export type {
  AIAssistantMode,
  AIContext,
  QuickAction,
  AIAssistantState,
  AIAssistantActions,
} from './useAIAssistant';

// Bottom Bar Hooks
export {
  BottomBarProvider,
  BottomBarContext,
  useBottomBar,
  useTranscription,
  useTierControls,
  useDemoTranscription,
} from './useBottomBar';
export type {
  BottomBarProviderProps,
  BottomBarActions,
  UseBottomBarReturn,
  UseTranscriptionReturn,
  UseTierControlsReturn,
} from './useBottomBar';

// Left Pane Hooks
export {
  LeftPaneProvider,
  useLeftPane,
  useLeftPaneState,
  useBottomBarVisibility,
  useTranscriptViewAvailable,
} from './useLeftPane';
export type {
  LeftPaneProviderProps,
  LeftPaneActions,
  UseLeftPaneReturn,
  UseBottomBarVisibilityParams,
} from './useLeftPane';

// Drawer Coordination Hooks
export {
  useDrawerCoordination,
  useIsAIInDrawer,
  useIsTranscriptionInDrawer,
} from './useDrawerCoordination';
export type {
  CoordinatedActions,
  UseDrawerCoordinationReturn,
} from './useDrawerCoordination';

// AI Keyboard Shortcuts
export {
  useAIKeyboardShortcuts,
  useAIInputRegistry,
  AIKeyboardShortcutsProvider,
} from './useAIKeyboardShortcuts';
export type {
  AIKeyboardShortcutsConfig,
  UseAIKeyboardShortcutsReturn,
  AIKeyboardShortcutsProviderProps,
} from './useAIKeyboardShortcuts';

// Coordination Provider (single source of truth for tiers + pane)
export {
  CoordinationProvider,
  CoordinationContext,
  useCoordination,
} from './useCoordination';
export type {
  CoordinationProviderProps,
  UseCoordinationReturn,
} from './useCoordination';

// Note: useSynchronizedTransition removed - using CSS Grid transitions instead
