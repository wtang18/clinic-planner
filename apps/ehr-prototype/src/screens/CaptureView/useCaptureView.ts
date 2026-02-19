/**
 * useCaptureView Hook
 *
 * Custom hook for capture view logic and state management.
 */

import { useCallback, useState } from 'react';
import type { ChartItem, ItemSource } from '../../types';
import type { Mode } from '../../state/types';
import { useDispatch } from '../../hooks';
import { useItemActions, useSuggestionActions, useDraftActions } from '../../hooks';
import { useTranscription } from '../../context/TranscriptionContext';
import { useStore } from '../../hooks/useEncounterState';
import { useNavigation } from '../../navigation/NavigationContext';
import { selectDraft } from '../../state/selectors/drafts';

// ============================================================================
// Types
// ============================================================================

export interface UseCaptureViewResult {
  /** Currently selected item ID (opens details pane) */
  selectedItemId: string | null;
  /** Set the selected item ID */
  setSelectedItemId: (id: string | null) => void;
  /** Whether the palette is open */
  isPaletteOpen: boolean;
  /** Set palette open state */
  setIsPaletteOpen: (open: boolean) => void;
  /** Whether the task pane is open */
  isTaskPaneOpen: boolean;
  /** Set task pane open state */
  setIsTaskPaneOpen: (open: boolean) => void;
  /** Handle adding a new item */
  handleItemAdd: (item: Partial<ChartItem>, source?: ItemSource) => void;
  /** Handle undo (remove last added item) */
  handleUndo: (itemId: string) => void;
  /** Handle selecting an item (opens details pane) */
  handleItemSelect: (itemId: string) => void;
  /** Handle updating an item from the details pane */
  handleItemUpdate: (itemId: string, changes: Partial<ChartItem>) => void;
  /** Handle removing an item from the chart */
  handleItemRemove: (itemId: string) => void;
  /** Handle closing the details pane */
  handleCloseDetailsPane: () => void;
  /** Handle accepting a suggestion */
  handleSuggestionAccept: (suggestionId: string) => void;
  /** Handle dismissing a suggestion */
  handleSuggestionDismiss: (suggestionId: string, reason?: string) => void;
  /** Handle transcription toggle */
  handleTranscriptionToggle: () => void;
  /** Handle mode change */
  handleModeChange: (mode: Mode) => void;
  /** Accept an AI draft — promotes to chart item */
  handleAcceptDraft: (draftId: string) => void;
  /** Edit an AI draft — opens details pane with draft content */
  handleEditDraft: (draftId: string) => void;
  /** Dismiss an AI draft */
  handleDismissDraft: (draftId: string) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useCaptureView(): UseCaptureViewResult {
  const dispatch = useDispatch();
  const store = useStore();
  const { setMode: setNavigationMode } = useNavigation();
  const { addItem, updateItem, deleteItem } = useItemActions();
  const { acceptSuggestion, dismissSuggestion } = useSuggestionActions();
  const { acceptDraft: acceptDraftAction, dismissDraft: dismissDraftAction } = useDraftActions();
  const transcription = useTranscription();

  // Local state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isTaskPaneOpen, setIsTaskPaneOpen] = useState(false);

  // Handle adding a new item
  const handleItemAdd = useCallback(
    (partialItem: Partial<ChartItem>, source: ItemSource = { type: 'manual' }) => {
      // Create a complete ChartItem with defaults for missing fields
      const now = new Date();
      const item: ChartItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: partialItem.category || 'note',
        displayText: partialItem.displayText || '',
        displaySubtext: partialItem.displaySubtext,
        createdAt: now,
        createdBy: { id: 'current-user', name: 'Current User' },
        modifiedAt: now,
        modifiedBy: { id: 'current-user', name: 'Current User' },
        source,
        status: 'active',
        tags: partialItem.tags || [],
        linkedDiagnoses: partialItem.linkedDiagnoses || [],
        linkedEncounters: partialItem.linkedEncounters || [],
        activityLog: [{
          timestamp: now,
          action: 'created',
          actor: 'Current User',
          details: `Added via OmniAdd (${partialItem.category || 'note'})`,
        }],
        _meta: {
          syncStatus: 'pending',
          aiGenerated: false,
          requiresReview: false,
          reviewed: true,
        },
        ...partialItem,
      } as ChartItem;

      addItem(item, source);
    },
    [addItem]
  );

  // Handle undo — now uses deleteItem
  const handleUndo = useCallback(
    (itemId: string) => {
      deleteItem(itemId);
    },
    [deleteItem]
  );

  // Handle selecting an item — opens details pane
  // If the item is unreviewed (MA handoff), auto-marks it as reviewed.
  const handleItemSelect = useCallback(
    (itemId: string) => {
      setSelectedItemId(itemId);
    },
    []
  );

  // Handle updating an item from the details pane
  const handleItemUpdate = useCallback(
    (itemId: string, changes: Partial<ChartItem>) => {
      updateItem(itemId, changes);
    },
    [updateItem]
  );

  // Handle removing an item from the chart
  const handleItemRemove = useCallback(
    (itemId: string) => {
      deleteItem(itemId);
      setSelectedItemId(null);
    },
    [deleteItem]
  );

  // Handle closing the details pane
  const handleCloseDetailsPane = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  // Handle accepting a suggestion
  const handleSuggestionAccept = useCallback(
    (suggestionId: string) => {
      acceptSuggestion(suggestionId);
    },
    [acceptSuggestion]
  );

  // Handle dismissing a suggestion
  const handleSuggestionDismiss = useCallback(
    (suggestionId: string, reason?: string) => {
      dismissSuggestion(suggestionId, reason);
    },
    [dismissSuggestion]
  );

  // Handle transcription toggle
  const handleTranscriptionToggle = useCallback(() => {
    if (transcription.status === 'recording') {
      transcription.pause();
    } else if (transcription.status === 'paused') {
      transcription.resume();
    } else {
      transcription.start();
    }
  }, [transcription]);

  // Handle mode change
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

  // Handle accepting an AI draft — promotes to chart item
  const handleAcceptDraft = useCallback(
    (draftId: string) => {
      const state = store.getState();
      const draft = selectDraft(state, draftId);
      if (!draft) return;

      // Mark draft as accepted
      acceptDraftAction(draftId);

      if (draft.enrichesItemId) {
        // Update existing MA-documented item with AI-enriched content
        updateItem(draft.enrichesItemId, {
          displayText: draft.content,
          source: { type: 'aiDraft', draftId },
        });
      } else {
        // Create new chart item from draft content
        handleItemAdd(
          {
            category: draft.category,
            displayText: draft.content,
            displaySubtext: draft.label,
            _meta: {
              syncStatus: 'pending' as const,
              aiGenerated: true,
              requiresReview: false,
              reviewed: true,
            },
          } as unknown as Partial<ChartItem>,
          { type: 'aiDraft', draftId }
        );
      }
    },
    [store, acceptDraftAction, updateItem, handleItemAdd]
  );

  // Handle editing an AI draft — accept + create item + open details pane
  const handleEditDraft = useCallback(
    (draftId: string) => {
      const state = store.getState();
      const draft = selectDraft(state, draftId);
      if (!draft) return;

      // Accept and create the item (same as accept flow)
      acceptDraftAction(draftId);

      const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      const item: ChartItem = {
        id: itemId,
        category: draft.category,
        displayText: draft.content,
        displaySubtext: draft.label,
        createdAt: now,
        createdBy: { id: 'current-user', name: 'Current User' },
        modifiedAt: now,
        modifiedBy: { id: 'current-user', name: 'Current User' },
        source: { type: 'aiDraft', draftId },
        status: 'active',
        tags: [],
        linkedDiagnoses: [],
        linkedEncounters: [],
        activityLog: [{
          timestamp: now,
          action: 'created',
          actor: 'Current User',
          details: `AI-generated from ambient, editing (${draft.category})`,
        }],
        _meta: {
          syncStatus: 'pending' as const,
          aiGenerated: true,
          requiresReview: true,
          reviewed: false,
        },
      } as unknown as ChartItem;

      addItem(item, { type: 'aiDraft', draftId });

      // Open details pane for editing
      setSelectedItemId(itemId);
    },
    [store, acceptDraftAction, addItem]
  );

  // Handle dismissing an AI draft
  const handleDismissDraft = useCallback(
    (draftId: string) => {
      dismissDraftAction(draftId);
    },
    [dismissDraftAction]
  );

  return {
    selectedItemId,
    setSelectedItemId,
    isPaletteOpen,
    setIsPaletteOpen,
    isTaskPaneOpen,
    setIsTaskPaneOpen,
    handleItemAdd,
    handleUndo,
    handleItemSelect,
    handleItemUpdate,
    handleItemRemove,
    handleCloseDetailsPane,
    handleSuggestionAccept,
    handleSuggestionDismiss,
    handleTranscriptionToggle,
    handleModeChange,
    handleAcceptDraft,
    handleEditDraft,
    handleDismissDraft,
  };
}
