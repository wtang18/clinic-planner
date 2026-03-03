/**
 * useProcessView Hook
 *
 * Orchestration hook for the Process view — combines batch data,
 * draft actions, item selection, and scoped add.
 * Sign-off lives in ReviewView only.
 */

import { useCallback, useState } from 'react';
import type { ChartItem, ItemCategory, AIDraft } from '../types';
import type { Mode } from '../state/types';
import type { BatchType } from '../types/drafts';
import { useNavigation } from '../navigation/NavigationContext';
import {
  selectProcessViewBatches,
  selectProcessViewDrafts,
} from '../state/selectors/process-view';
import type { ProcessBatch } from '../state/selectors/process-view';
import {
  useEncounterState,
  useDispatch,
  useItemActions,
  useTaskActions,
  useDraftActions,
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

  // Local state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [scopedAddCategory, setScopedAddCategory] = useState<ItemCategory | null>(null);

  // Derived state from selectors
  const batches = selectProcessViewBatches(state);
  const drafts = selectProcessViewDrafts(state);

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
    handleModeChange,
    handleScopedAdd,
    handleClearScopedAdd,
  };
}
