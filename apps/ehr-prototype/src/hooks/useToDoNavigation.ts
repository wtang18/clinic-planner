/**
 * useToDoNavigation Hook
 *
 * Manages navigation context when working through To-Do items.
 * Tracks source filter, current position, and enables next/return navigation.
 */

import { useState, useCallback, useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { getItemsByFilter, getCategoryById, type ToDoItem } from '../scenarios/todoData';

// ============================================================================
// Types
// ============================================================================

export interface ToDoNavigationState {
  /** Source category ID */
  categoryId: string;
  /** Source filter ID */
  filterId: string;
  /** Current item in the list */
  currentItem: ToDoItem;
  /** Index of current item in filtered list */
  currentIndex: number;
  /** Total items in filtered list */
  totalCount: number;
  /** Whether context bar has been dismissed for this session */
  dismissed: boolean;
}

export interface ToDoNavigationContext {
  /** Current navigation state (null if not navigating from To-Do) */
  state: ToDoNavigationState | null;
  /** Source filter label for display */
  sourceFilterLabel: string | null;
  /** Remaining items after current */
  remainingCount: number;
  /** Whether there's a previous item */
  hasPrev: boolean;
  /** Whether there's a next item */
  hasNext: boolean;
  /** Current item title */
  currentItemTitle: string | null;
  /** Navigate to an item from To-Do list (sets context) */
  navigateToItem: (item: ToDoItem, categoryId: string, filterId: string) => void;
  /** Navigate to the previous item in the list */
  navigateToPrev: () => ToDoItem | null;
  /** Navigate to the next item in the list */
  navigateToNext: () => ToDoItem | null;
  /** Return to the source list */
  returnToList: () => { categoryId: string; filterId: string } | null;
  /** Dismiss the context bar */
  dismissContextBar: () => void;
  /** Clear navigation state (when navigating away via menu) */
  clearNavigation: () => void;
  /** Check if context bar should be shown */
  shouldShowContextBar: boolean;
}

// ============================================================================
// Hook
// ============================================================================

export function useToDoNavigation(): ToDoNavigationContext {
  const [state, setState] = useState<ToDoNavigationState | null>(null);
  const workspace = useWorkspace();

  // Get filtered items for current navigation state
  const filteredItems = useMemo(() => {
    if (!state) return [];
    return getItemsByFilter(state.categoryId, state.filterId);
  }, [state?.categoryId, state?.filterId]);

  // Get source filter label
  const sourceFilterLabel = useMemo(() => {
    if (!state) return null;
    const category = getCategoryById(state.categoryId);
    const filter = category?.filters.find((f) => f.id === state.filterId);
    return filter?.label || state.filterId;
  }, [state?.categoryId, state?.filterId]);

  // Calculate remaining count (items after current)
  const remainingCount = useMemo(() => {
    if (!state) return 0;
    return Math.max(0, state.totalCount - state.currentIndex - 1);
  }, [state?.currentIndex, state?.totalCount]);

  // Check if there's a previous item
  const hasPrev = useMemo(() => {
    if (!state) return false;
    return state.currentIndex > 0;
  }, [state?.currentIndex]);

  // Check if there's a next item
  const hasNext = useMemo(() => {
    if (!state) return false;
    return state.currentIndex < state.totalCount - 1;
  }, [state?.currentIndex, state?.totalCount]);

  // Current item title
  const currentItemTitle = state?.currentItem.title || null;

  // Navigate to an item from To-Do list
  const navigateToItem = useCallback(
    (item: ToDoItem, categoryId: string, filterId: string) => {
      const items = getItemsByFilter(categoryId, filterId);
      const index = items.findIndex((i) => i.id === item.id);

      // Compute label fresh here to avoid stale closure issue
      const category = getCategoryById(categoryId);
      const filter = category?.filters.find((f) => f.id === filterId);
      const label = filter?.label || filterId;

      setState({
        categoryId,
        filterId,
        currentItem: item,
        currentIndex: index >= 0 ? index : 0,
        totalCount: items.length,
        dismissed: false,
      });

      // Also set context bar state in workspace for this patient
      const workspaceId = item.patient.mrn;
      if (workspaceId) {
        workspace.setContextBar(workspaceId, {
          sourceFilter: label,
          sourceCategoryId: categoryId,
          currentIndex: index >= 0 ? index : 0,
          totalCount: items.length,
          dismissed: false,
        });
      }
    },
    [workspace]
  );

  // Navigate to previous item
  const navigateToPrev = useCallback((): ToDoItem | null => {
    if (!state || !hasPrev) return null;

    const items = getItemsByFilter(state.categoryId, state.filterId);
    const prevIndex = state.currentIndex - 1;
    const prevItem = items[prevIndex];

    if (!prevItem) return null;

    // Compute label fresh here to avoid stale closure issue
    const category = getCategoryById(state.categoryId);
    const filter = category?.filters.find((f) => f.id === state.filterId);
    const label = filter?.label || state.filterId;

    setState({
      ...state,
      currentItem: prevItem,
      currentIndex: prevIndex,
    });

    // Update workspace context bar
    const workspaceId = prevItem.patient.mrn;
    if (workspaceId) {
      workspace.setContextBar(workspaceId, {
        sourceFilter: label,
        sourceCategoryId: state.categoryId,
        currentIndex: prevIndex,
        totalCount: state.totalCount,
        dismissed: false,
      });
    }

    return prevItem;
  }, [state, hasPrev, workspace]);

  // Navigate to next item
  const navigateToNext = useCallback((): ToDoItem | null => {
    if (!state || !hasNext) return null;

    const items = getItemsByFilter(state.categoryId, state.filterId);
    const nextIndex = state.currentIndex + 1;
    const nextItem = items[nextIndex];

    if (!nextItem) return null;

    // Compute label fresh here to avoid stale closure issue
    const category = getCategoryById(state.categoryId);
    const filter = category?.filters.find((f) => f.id === state.filterId);
    const label = filter?.label || state.filterId;

    setState({
      ...state,
      currentItem: nextItem,
      currentIndex: nextIndex,
    });

    // Update workspace context bar
    const workspaceId = nextItem.patient.mrn;
    if (workspaceId) {
      workspace.setContextBar(workspaceId, {
        sourceFilter: label,
        sourceCategoryId: state.categoryId,
        currentIndex: nextIndex,
        totalCount: state.totalCount,
        dismissed: false,
      });
    }

    return nextItem;
  }, [state, hasNext, workspace]);

  // Return to source list
  const returnToList = useCallback(() => {
    if (!state) return null;

    const { categoryId, filterId } = state;
    setState(null);

    return { categoryId, filterId };
  }, [state]);

  // Dismiss context bar
  const dismissContextBar = useCallback(() => {
    if (!state) return;

    setState({
      ...state,
      dismissed: true,
    });

    // Also dismiss in workspace context
    const workspaceId = state.currentItem.patient.mrn;
    if (workspaceId) {
      workspace.dismissContextBar(workspaceId);
    }
  }, [state, workspace]);

  // Clear navigation state
  const clearNavigation = useCallback(() => {
    setState(null);
  }, []);

  // Should show context bar
  const shouldShowContextBar = state !== null && !state.dismissed;

  return {
    state,
    sourceFilterLabel,
    remainingCount,
    hasPrev,
    hasNext,
    currentItemTitle,
    navigateToItem,
    navigateToPrev,
    navigateToNext,
    returnToList,
    dismissContextBar,
    clearNavigation,
    shouldShowContextBar,
  };
}
