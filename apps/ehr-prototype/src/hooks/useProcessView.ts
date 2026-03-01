/**
 * useProcessView Hook
 *
 * Orchestration hook for the Process view — combines batch data,
 * draft actions, sign-off state, item selection, and scoped add.
 */

import { useCallback, useState, useMemo } from 'react';
import type { ChartItem, ItemCategory, AIDraft } from '../types';
import type { Mode } from '../state/types';
import type { BatchType } from '../types/drafts';
import type { SignOffBlocker } from '../screens/ReviewView/SignOffSection';
import { useNavigation } from '../navigation/NavigationContext';
import {
  selectProcessViewBatches,
  selectProcessViewDrafts,
  selectCompletenessChecklist,
  selectMockEMLevel,
  selectOutstandingItemCount,
} from '../state/selectors/process-view';
import type {
  ProcessBatch,
  ChecklistItem,
  EMLevel,
} from '../state/selectors/process-view';
import {
  useEncounterState,
  useDispatch,
  useItemActions,
  useTaskActions,
  useDraftActions,
  useChartItems,
  usePendingTasks,
  useItemsRequiringReview,
  useDiagnoses,
} from '../hooks';
import { useStore } from './useEncounterState';
import { selectDraft } from '../state/selectors/drafts';
import { materializeChartItem } from '../utils/chart-item-factory';
import { getMockDraftContent, getMockConfidence } from '../services/draft-engine';

// ============================================================================
// Types
// ============================================================================

export interface UseProcessViewResult {
  /** Operational batches (Rx, Labs, Imaging, Referrals) */
  batches: ProcessBatch[];
  /** Active AI drafts for the draft section */
  drafts: AIDraft[];
  /** Encounter completeness checklist (8 sections) */
  checklist: ChecklistItem[];
  /** Mock E&M level */
  emLevel: EMLevel;
  /** Count of items needing attention */
  outstandingCount: number;
  /** Sign-off blockers */
  signOffBlockers: SignOffBlocker[];
  /** Whether sign-off is in progress */
  isSigningOff: boolean;
  /** Currently selected item ID (opens details pane) */
  selectedItemId: string | null;
  /** Category for scoped add (set by inline "+") */
  scopedAddCategory: ItemCategory | null;

  // Actions
  handleItemSelect: (itemId: string) => void;
  handleCloseDetailsPane: () => void;
  handleAcceptDraft: (draftId: string) => void;
  handleEditDraft: (draftId: string) => void;
  handleDismissDraft: (draftId: string) => void;
  handleRefreshDraft: (draftId: string) => void;
  handleCancelRefresh: (draftId: string) => void;
  handleBatchAction: (batchType: BatchType, action: string, taskIds?: string[]) => void;
  handleSignOff: () => void;
  handleModeChange: (mode: Mode) => void;
  handleScopedAdd: (category: ItemCategory) => void;
  handleClearScopedAdd: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useProcessView(): UseProcessViewResult {
  const state = useEncounterState();
  const dispatch = useDispatch();
  const store = useStore();
  const { setMode: setNavigationMode } = useNavigation();
  const { addItem, updateItem } = useItemActions();
  const { approveTask, batchApprove } = useTaskActions();
  const { acceptDraft: acceptDraftAction, dismissDraft: dismissDraftAction } = useDraftActions();
  const allItems = useChartItems();
  const pendingTasks = usePendingTasks();
  const itemsRequiringReview = useItemsRequiringReview();
  const diagnoses = useDiagnoses();

  // Local state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSigningOff, setIsSigningOff] = useState(false);
  const [scopedAddCategory, setScopedAddCategory] = useState<ItemCategory | null>(null);

  // Derived state from selectors
  const batches = selectProcessViewBatches(state);
  const drafts = selectProcessViewDrafts(state);
  const checklist = selectCompletenessChecklist(state);
  const emLevel = selectMockEMLevel(state);
  const outstandingCount = selectOutstandingItemCount(state);

  // Sign-off blockers (same logic as ReviewView)
  const signOffBlockers = useMemo((): SignOffBlocker[] => {
    const blockers: SignOffBlocker[] = [];

    if (itemsRequiringReview.length > 0) {
      blockers.push({
        type: 'unreviewed-ai',
        message: `${itemsRequiringReview.length} AI-generated item${itemsRequiringReview.length !== 1 ? 's' : ''} require${itemsRequiringReview.length === 1 ? 's' : ''} review`,
        severity: 'error',
      });
    }

    if (pendingTasks.length > 0) {
      blockers.push({
        type: 'pending-task',
        message: `${pendingTasks.length} task${pendingTasks.length !== 1 ? 's' : ''} still pending`,
        severity: 'error',
      });
    }

    if (diagnoses.length === 0) {
      blockers.push({
        type: 'missing-dx',
        message: 'No diagnosis documented',
        severity: 'warning',
      });
    }

    const noteItems = allItems.filter((i) => i.category === 'note');
    if (noteItems.length === 0) {
      blockers.push({
        type: 'missing-note',
        message: 'No visit note generated',
        severity: 'warning',
      });
    }

    const incompleteItems = allItems.filter(
      (item) => item.status === 'pending-review'
    );
    if (incompleteItems.length > 0) {
      blockers.push({
        type: 'incomplete-item',
        message: `${incompleteItems.length} item${incompleteItems.length !== 1 ? 's' : ''} pending review`,
        severity: 'warning',
      });
    }

    return blockers;
  }, [itemsRequiringReview, pendingTasks, diagnoses, allItems]);

  // ---- Actions ----

  const handleItemSelect = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
  }, []);

  const handleCloseDetailsPane = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  // Accept AI draft — same logic as CaptureView
  const handleAcceptDraft = useCallback(
    (draftId: string) => {
      const currentState = store.getState();
      const draft = selectDraft(currentState, draftId);
      if (!draft) return;

      acceptDraftAction(draftId);

      if (draft.enrichesItemId) {
        updateItem(draft.enrichesItemId, {
          displayText: draft.content,
          source: { type: 'aiDraft', draftId },
        });
      } else {
        addItem(
          materializeChartItem(
            { category: draft.category, displayText: draft.content, displaySubtext: draft.label },
            {
              source: { type: 'aiDraft', draftId },
              status: 'confirmed',
              aiGenerated: true,
              activityDetail: `Accepted AI draft (${draft.category})`,
            },
          ),
          { type: 'aiDraft', draftId },
        );
      }
    },
    [store, acceptDraftAction, updateItem, addItem]
  );

  // Edit AI draft — accept + create item + open details pane
  const handleEditDraft = useCallback(
    (draftId: string) => {
      const currentState = store.getState();
      const draft = selectDraft(currentState, draftId);
      if (!draft) return;

      acceptDraftAction(draftId);

      const item = materializeChartItem(
        { category: draft.category, displayText: draft.content, displaySubtext: draft.label },
        {
          source: { type: 'aiDraft', draftId },
          status: 'confirmed',
          aiGenerated: true,
          requiresReview: true,
          reviewed: false,
          activityDetail: `AI-generated from ambient, editing (${draft.category})`,
        },
      );

      addItem(item, { type: 'aiDraft', draftId });
      setSelectedItemId(item.id);
    },
    [store, acceptDraftAction, addItem]
  );

  const handleDismissDraft = useCallback(
    (draftId: string) => {
      dismissDraftAction(draftId);
    },
    [dismissDraftAction]
  );

  // Handle refreshing/cancelling an AI draft
  const { refreshDraft: refreshAction, cancelRefresh: cancelRefreshAction, completeRefresh: completeRefreshAction } = useDraftActions();
  const handleRefreshDraft = useCallback(
    (draftId: string) => {
      const currentState = store.getState();
      const draft = selectDraft(currentState, draftId);
      if (!draft || draft.status !== 'pending') return;

      refreshAction(draftId);

      setTimeout(() => {
        const content = getMockDraftContent(draft.category);
        const confidence = getMockConfidence(draft.category);
        completeRefreshAction(draftId, content, confidence);
      }, 2500);
    },
    [store, refreshAction, completeRefreshAction]
  );

  // Cancel an in-progress refresh — reverts updating → pending without changing content
  const handleCancelRefresh = useCallback(
    (draftId: string) => {
      cancelRefreshAction(draftId);
    },
    [cancelRefreshAction]
  );

  // Batch actions: send all, collect samples, associate all Dx
  const handleBatchAction = useCallback(
    (batchType: BatchType, action: string, taskIds?: string[]) => {
      if (action === 'send-all' || action === 'approve-all') {
        if (taskIds && taskIds.length > 0) {
          batchApprove(taskIds);
        }
      } else if (action === 'approve' && taskIds) {
        for (const id of taskIds) {
          approveTask(id);
        }
      }
      // associate-dx and other batch actions are handled at the UI level
      // (opening a dx picker dialog) — the actual linking dispatches individual ITEM_UPDATED
    },
    [batchApprove, approveTask]
  );

  const handleSignOff = useCallback(async () => {
    setIsSigningOff(true);
    try {
      dispatch({
        type: 'ENCOUNTER_SIGNED',
        payload: { signedAt: new Date() },
      });
    } catch (error) {
      console.error('Sign-off failed:', error);
    } finally {
      setIsSigningOff(false);
    }
  }, [dispatch]);

  const handleModeChange = useCallback(
    (mode: Mode) => {
      dispatch({
        type: 'MODE_CHANGED',
        payload: { to: mode, trigger: 'user' },
      });
      setNavigationMode(mode);
    },
    [dispatch, setNavigationMode]
  );

  const handleScopedAdd = useCallback((category: ItemCategory) => {
    setScopedAddCategory(category);
  }, []);

  const handleClearScopedAdd = useCallback(() => {
    setScopedAddCategory(null);
  }, []);

  return {
    batches,
    drafts,
    checklist,
    emLevel,
    outstandingCount,
    signOffBlockers,
    isSigningOff,
    selectedItemId,
    scopedAddCategory,
    handleItemSelect,
    handleCloseDetailsPane,
    handleAcceptDraft,
    handleEditDraft,
    handleDismissDraft,
    handleRefreshDraft,
    handleCancelRefresh,
    handleBatchAction,
    handleSignOff,
    handleModeChange,
    handleScopedAdd,
    handleClearScopedAdd,
  };
}
