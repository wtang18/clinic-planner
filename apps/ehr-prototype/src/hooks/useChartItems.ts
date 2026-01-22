/**
 * useChartItems Hooks
 *
 * Hooks for accessing and manipulating chart items in the encounter state.
 */

import React from 'react';
import type { ChartItem, ItemCategory, ItemSource, ItemStatus } from '../types';
import {
  selectAllItems,
  selectItem,
} from '../state/selectors/entities';
import {
  selectItemsByCategory,
  selectItemsByStatus,
  selectItemsRequiringReview,
  selectAiGeneratedItems,
  selectDiagnoses,
  selectMedications,
  selectAllergies,
} from '../state/selectors/derived';
import {
  itemAdded,
  itemUpdated,
  itemConfirmed,
  itemCancelled,
  itemDxLinked,
  itemDxUnlinked,
} from '../state/actions/creators';
import { useSelector, useDispatch } from './useEncounterState';

// ============================================================================
// Basic Chart Item Hooks
// ============================================================================

/**
 * Get all chart items in display order
 */
export function useChartItems(): ChartItem[] {
  return useSelector(selectAllItems);
}

/**
 * Get a single chart item by ID
 */
export function useChartItem(id: string): ChartItem | undefined {
  return useSelector((state) => selectItem(state, id));
}

/**
 * Get chart items filtered by category
 */
export function useItemsByCategory(category: ItemCategory): ChartItem[] {
  return useSelector((state) => selectItemsByCategory(state, category));
}

/**
 * Get chart items filtered by status
 */
export function useItemsByStatus(status: ItemStatus): ChartItem[] {
  return useSelector((state) => selectItemsByStatus(state, status));
}

// ============================================================================
// Specialized Chart Item Hooks
// ============================================================================

/**
 * Get items that require review
 */
export function useItemsRequiringReview(): ChartItem[] {
  return useSelector(selectItemsRequiringReview);
}

/**
 * Get AI-generated items
 */
export function useAiGeneratedItems(): ChartItem[] {
  return useSelector(selectAiGeneratedItems);
}

/**
 * Get all diagnoses
 */
export function useDiagnoses() {
  return useSelector(selectDiagnoses);
}

/**
 * Get all medications
 */
export function useMedications() {
  return useSelector(selectMedications);
}

/**
 * Get all allergies
 */
export function useAllergies() {
  return useSelector(selectAllergies);
}

// ============================================================================
// Chart Item Actions
// ============================================================================

export interface ChartItemActions {
  /** Add a new chart item */
  addItem: (item: ChartItem, source: ItemSource) => void;
  /** Update an existing chart item */
  updateItem: (id: string, changes: Partial<ChartItem>) => void;
  /** Confirm a pending/draft item */
  confirmItem: (id: string) => void;
  /** Cancel/delete an item */
  cancelItem: (id: string, reason?: string) => void;
  /** Link an item to a diagnosis */
  linkToDiagnosis: (itemId: string, diagnosisId: string) => void;
  /** Unlink an item from a diagnosis */
  unlinkFromDiagnosis: (itemId: string, diagnosisId: string) => void;
}

/**
 * Get actions for manipulating chart items
 */
export function useItemActions(): ChartItemActions {
  const dispatch = useDispatch();

  return React.useMemo(
    () => ({
      addItem: (item: ChartItem, source: ItemSource) => {
        dispatch(itemAdded(item, source));
      },

      updateItem: (id: string, changes: Partial<ChartItem>) => {
        dispatch(itemUpdated(id, changes, 'user-edit'));
      },

      confirmItem: (id: string) => {
        dispatch(itemConfirmed(id));
      },

      cancelItem: (id: string, reason?: string) => {
        dispatch(itemCancelled(id, reason));
      },

      linkToDiagnosis: (itemId: string, diagnosisId: string) => {
        dispatch(itemDxLinked(itemId, diagnosisId));
      },

      unlinkFromDiagnosis: (itemId: string, diagnosisId: string) => {
        dispatch(itemDxUnlinked(itemId, diagnosisId));
      },
    }),
    [dispatch]
  );
}

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for items and actions
 */
export function useChartItemsWithActions(): {
  items: ChartItem[];
  actions: ChartItemActions;
} {
  const items = useChartItems();
  const actions = useItemActions();

  return { items, actions };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Get count of items by category
 */
export function useItemCountsByCategory(): Record<ItemCategory, number> {
  return useSelector((state) => {
    const counts: Partial<Record<ItemCategory, number>> = {};
    const items = selectAllItems(state);

    for (const item of items) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }

    return counts as Record<ItemCategory, number>;
  });
}

/**
 * Check if there are any unsaved items
 */
export function useHasUnsavedItems(): boolean {
  return useSelector((state) => {
    const items = selectAllItems(state);
    return items.some(
      (item) => item.status === 'draft' || item.status === 'pending-review'
    );
  });
}

/**
 * Get items linked to a specific diagnosis
 */
export function useItemsLinkedToDiagnosis(diagnosisId: string): ChartItem[] {
  return useSelector((state) => {
    const items = selectAllItems(state);
    return items.filter(
      (item) => item.linkedDiagnoses && item.linkedDiagnoses.includes(diagnosisId)
    );
  });
}
