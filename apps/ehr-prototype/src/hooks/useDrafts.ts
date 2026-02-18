/**
 * useDrafts Hooks
 *
 * Hooks for accessing and managing AI drafts.
 */

import React from 'react';
import type { AIDraft, DraftStatus } from '../types/drafts';
import type { ItemCategory } from '../types/chart-items';
import {
  selectAllDrafts,
  selectDraft,
  selectPendingDrafts,
  selectGeneratingDrafts,
  selectActiveDrafts,
  selectDraftsByCategory,
  selectDraftsByStatus,
  selectPendingDraftCount,
  selectHasDraftForCategory,
} from '../state/selectors/drafts';
import {
  draftGenerated,
  draftAccepted,
  draftEdited,
  draftDismissed,
} from '../state/actions/draft-actions';
import { useSelector, useDispatch } from './useEncounterState';

// ============================================================================
// Basic Draft Hooks
// ============================================================================

/** Get all drafts */
export function useDrafts(): AIDraft[] {
  return useSelector(selectAllDrafts);
}

/** Get a single draft by ID */
export function useDraft(id: string): AIDraft | undefined {
  return useSelector((state) => selectDraft(state, id));
}

/** Get drafts by status */
export function useDraftsByStatus(status: DraftStatus): AIDraft[] {
  return useSelector((state) => selectDraftsByStatus(state, status));
}

/** Get drafts by category */
export function useDraftsByCategory(category: ItemCategory): AIDraft[] {
  return useSelector((state) => selectDraftsByCategory(state, category));
}

// ============================================================================
// Status-Specific Hooks
// ============================================================================

/** Get pending drafts (ready for review) */
export function usePendingDrafts(): AIDraft[] {
  return useSelector(selectPendingDrafts);
}

/** Get generating drafts */
export function useGeneratingDrafts(): AIDraft[] {
  return useSelector(selectGeneratingDrafts);
}

/** Get active drafts (pending or generating — visible in rail) */
export function useActiveDrafts(): AIDraft[] {
  return useSelector(selectActiveDrafts);
}

/** Count of pending drafts */
export function usePendingDraftCount(): number {
  return useSelector(selectPendingDraftCount);
}

/** Check if a draft exists for a given category */
export function useHasDraftForCategory(category: ItemCategory): boolean {
  return useSelector((state) => selectHasDraftForCategory(state, category));
}

// ============================================================================
// Draft Actions
// ============================================================================

export interface DraftActions {
  /** Add a newly generated draft */
  addDraft: (draft: AIDraft) => void;
  /** Accept a draft (promotes to chart item — caller handles item creation) */
  acceptDraft: (id: string) => void;
  /** Edit a draft's content */
  editDraft: (id: string, content: string) => void;
  /** Dismiss a draft */
  dismissDraft: (id: string) => void;
}

/** Get actions for managing drafts */
export function useDraftActions(): DraftActions {
  const dispatch = useDispatch();

  return React.useMemo(
    () => ({
      addDraft: (draft: AIDraft) => {
        dispatch(draftGenerated(draft));
      },
      acceptDraft: (id: string) => {
        dispatch(draftAccepted(id));
      },
      editDraft: (id: string, content: string) => {
        dispatch(draftEdited(id, content));
      },
      dismissDraft: (id: string) => {
        dispatch(draftDismissed(id));
      },
    }),
    [dispatch]
  );
}

// ============================================================================
// Combined Hook
// ============================================================================

/** Combined hook for drafts and actions */
export function useDraftsWithActions(): {
  drafts: AIDraft[];
  pendingDrafts: AIDraft[];
  actions: DraftActions;
} {
  const drafts = useDrafts();
  const pendingDrafts = usePendingDrafts();
  const actions = useDraftActions();

  return { drafts, pendingDrafts, actions };
}
