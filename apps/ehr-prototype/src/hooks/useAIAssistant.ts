/**
 * useAIAssistant Hook
 *
 * State management for the AI assistant tri-state interface:
 * - Minibar: Collapsed state showing current content type
 * - Palette: Expanded state with quick actions and suggestions
 * - Drawer: Full panel for chat history and detailed views
 *
 * Also manages content priority and context-aware quick actions.
 */

import { useState, useCallback, useMemo } from 'react';
import type { AIMinibarContent, ToDoContextContent } from '../components/ai-ui/AIMinibar';

// ============================================================================
// Types
// ============================================================================

export type AIAssistantMode = 'minibar' | 'palette' | 'drawer';

export type AIContext =
  | 'encounter'      // During a patient encounter
  | 'todoReview'     // Reviewing To-Do items
  | 'patientChart'   // Viewing patient chart (not in encounter)
  | 'toDoList'       // In To-Do list view
  | 'none';          // No specific context

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  context: AIContext[];
}

export interface AIAssistantState {
  /** Current display mode */
  mode: AIAssistantMode;
  /** Current context */
  context: AIContext;
  /** Current minibar content */
  content: AIMinibarContent;
  /** Whether there's a pending AI operation */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Active suggestions count */
  suggestionCount: number;
  /** Care gap alerts count */
  careGapCount: number;
  /** To-Do navigation state (when in todoReview context) */
  todoNavigation?: {
    filterLabel: string;
    currentIndex: number;
    totalCount: number;
    items: Array<{ id: string; title: string }>;
  };
  /** Whether context bar is dismissed for this session */
  isContextDismissed: boolean;
  /** Recording complete data (for AI minibar handoff) */
  recordingComplete?: {
    duration: number;
    timestamp: Date;
  };
}

export interface AIAssistantActions {
  /** Switch to a specific mode */
  setMode: (mode: AIAssistantMode) => void;
  /** Toggle palette open/closed */
  togglePalette: () => void;
  /** Open drawer */
  openDrawer: () => void;
  /** Close to minibar */
  closeToPill: () => void;
  /** Update context */
  setContext: (context: AIContext) => void;
  /** Set content manually */
  setContent: (content: AIMinibarContent) => void;
  /** Set loading state */
  setLoading: (isLoading: boolean, message?: string) => void;
  /** Set error state */
  setError: (error: string | null) => void;
  /** Update suggestion count */
  setSuggestionCount: (count: number) => void;
  /** Update care gap count */
  setCareGapCount: (count: number) => void;
  /** Set To-Do navigation state */
  setToDoNavigation: (nav: AIAssistantState['todoNavigation']) => void;
  /** Navigate to next To-Do item */
  navigateToNextToDo: () => void;
  /** Navigate to previous To-Do item */
  navigateToPrevToDo: () => void;
  /** Get quick actions for current context */
  getQuickActions: () => QuickAction[];
  /** Dismiss context bar for this session */
  dismissContext: () => void;
  /** Reset context dismiss state */
  resetContextDismiss: () => void;
  /** Set recording complete data (triggers AI minibar notification) */
  setRecordingComplete: (duration: number) => void;
  /** Clear recording complete notification */
  clearRecordingComplete: () => void;
}

// ============================================================================
// Quick Actions Configuration
// ============================================================================

const QUICK_ACTIONS: QuickAction[] = [
  // Encounter context
  { id: 'review-chart', label: 'Review chart', icon: 'FileText', context: ['encounter'] },
  { id: 'suggest-orders', label: 'Suggest orders', icon: 'ClipboardList', context: ['encounter'] },
  { id: 'summarize-visit', label: 'Summarize', icon: 'FileText', context: ['encounter'] },
  { id: 'check-interactions', label: 'Check interactions', icon: 'AlertTriangle', context: ['encounter'] },

  // To-Do review context
  { id: 'next-item', label: 'Next item', icon: 'ArrowRight', context: ['todoReview'] },
  { id: 'complete-task', label: 'Complete task', icon: 'Check', context: ['todoReview'] },
  { id: 'skip-item', label: 'Skip', icon: 'SkipForward', context: ['todoReview'] },

  // Patient chart context
  { id: 'care-gaps', label: 'Care gaps', icon: 'Heart', context: ['patientChart'] },
  { id: 'med-review', label: 'Med review', icon: 'Pill', context: ['patientChart'] },
  { id: 'problem-list', label: 'Problem list', icon: 'List', context: ['patientChart'] },

  // To-Do list context
  { id: 'whats-urgent', label: "What's urgent?", icon: 'AlertTriangle', context: ['toDoList'] },
  { id: 'prioritize', label: 'Prioritize', icon: 'ListOrdered', context: ['toDoList'] },
  { id: 'summarize-day', label: 'Summarize day', icon: 'Calendar', context: ['toDoList'] },
];

// ============================================================================
// Hook
// ============================================================================

export function useAIAssistant(initialContext: AIContext = 'none'): [AIAssistantState, AIAssistantActions] {
  // State
  const [mode, setModeState] = useState<AIAssistantMode>('minibar');
  const [context, setContextState] = useState<AIContext>(initialContext);
  const [content, setContentState] = useState<AIMinibarContent>({ type: 'idle' });
  const [isLoading, setIsLoadingState] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const [suggestionCount, setSuggestionCountState] = useState(0);
  const [careGapCount, setCareGapCountState] = useState(0);
  const [todoNavigation, setToDoNavigationState] = useState<AIAssistantState['todoNavigation']>();
  const [isContextDismissed, setIsContextDismissed] = useState(false);
  const [recordingComplete, setRecordingCompleteState] = useState<AIAssistantState['recordingComplete']>();

  // Derive content based on priority
  const derivedContent = useMemo<AIMinibarContent>(() => {
    // Priority 1: Error
    if (error) {
      return { type: 'error', message: error };
    }

    // Priority 2: Loading
    if (isLoading) {
      return { type: 'loading', message: 'Thinking...' };
    }

    // Priority 3: To-Do context (when in todoReview)
    if (context === 'todoReview' && todoNavigation) {
      const remaining = todoNavigation.totalCount - todoNavigation.currentIndex - 1;
      return {
        type: 'todo-context',
        filterLabel: todoNavigation.filterLabel,
        remainingCount: remaining,
        hasPrev: todoNavigation.currentIndex > 0,
        hasNext: todoNavigation.currentIndex < todoNavigation.totalCount - 1,
      } as ToDoContextContent;
    }

    // Priority 4: Manual content (suggestions, care gaps, etc.)
    if (content.type !== 'idle') {
      return content;
    }

    // Priority 5: Suggestion nudge (if we have suggestions)
    if (suggestionCount > 0) {
      return {
        type: 'suggestion',
        id: 'nudge',
        text: suggestionCount === 1
          ? '1 suggestion available'
          : `${suggestionCount} suggestions available`,
      };
    }

    // Priority 6: Care gap alert (if we have care gaps)
    if (careGapCount > 0) {
      return {
        type: 'care-gap',
        id: 'alert',
        text: careGapCount === 1
          ? '1 care gap to review'
          : `${careGapCount} care gaps to review`,
      };
    }

    // Default: Idle
    return { type: 'idle' };
  }, [error, isLoading, context, todoNavigation, content, suggestionCount, careGapCount]);

  // Actions
  const setMode = useCallback((newMode: AIAssistantMode) => {
    setModeState(newMode);
  }, []);

  const togglePalette = useCallback(() => {
    setModeState(current => current === 'palette' ? 'minibar' : 'palette');
  }, []);

  const openDrawer = useCallback(() => {
    setModeState('drawer');
  }, []);

  const closeToPill = useCallback(() => {
    setModeState('minibar');
  }, []);

  const setContext = useCallback((newContext: AIContext) => {
    setContextState(newContext);
  }, []);

  const setContent = useCallback((newContent: AIMinibarContent) => {
    setContentState(newContent);
  }, []);

  const setLoading = useCallback((loading: boolean, message?: string) => {
    setIsLoadingState(loading);
    if (loading && message) {
      setContentState({ type: 'loading', message });
    }
  }, []);

  const setError = useCallback((err: string | null) => {
    setErrorState(err);
  }, []);

  const setSuggestionCount = useCallback((count: number) => {
    setSuggestionCountState(count);
  }, []);

  const setCareGapCount = useCallback((count: number) => {
    setCareGapCountState(count);
  }, []);

  const setToDoNavigation = useCallback((nav: AIAssistantState['todoNavigation']) => {
    setToDoNavigationState(nav);
  }, []);

  const navigateToNextToDo = useCallback(() => {
    setToDoNavigationState(current => {
      if (!current) return current;
      const nextIndex = Math.min(current.currentIndex + 1, current.totalCount - 1);
      return { ...current, currentIndex: nextIndex };
    });
  }, []);

  const navigateToPrevToDo = useCallback(() => {
    setToDoNavigationState(current => {
      if (!current) return current;
      const prevIndex = Math.max(current.currentIndex - 1, 0);
      return { ...current, currentIndex: prevIndex };
    });
  }, []);

  const getQuickActions = useCallback(() => {
    return QUICK_ACTIONS.filter(action => action.context.includes(context));
  }, [context]);

  const dismissContext = useCallback(() => {
    setIsContextDismissed(true);
  }, []);

  const resetContextDismiss = useCallback(() => {
    setIsContextDismissed(false);
  }, []);

  const setRecordingComplete = useCallback((duration: number) => {
    setRecordingCompleteState({ duration, timestamp: new Date() });
  }, []);

  const clearRecordingComplete = useCallback(() => {
    setRecordingCompleteState(undefined);
  }, []);

  // Build state object
  const state: AIAssistantState = {
    mode,
    context,
    content: derivedContent,
    isLoading,
    error,
    suggestionCount,
    careGapCount,
    todoNavigation,
    isContextDismissed,
    recordingComplete,
  };

  const actions: AIAssistantActions = {
    setMode,
    togglePalette,
    openDrawer,
    closeToPill,
    setContext,
    setContent,
    setLoading,
    setError,
    setSuggestionCount,
    setCareGapCount,
    setToDoNavigation,
    navigateToNextToDo,
    navigateToPrevToDo,
    getQuickActions,
    dismissContext,
    resetContextDismiss,
    setRecordingComplete,
    clearRecordingComplete,
  };

  return [state, actions];
}

export default useAIAssistant;
