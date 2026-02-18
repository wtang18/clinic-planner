/**
 * useCaptureView Hook
 *
 * Custom hook for capture view logic and state management.
 */

import { useCallback, useState } from 'react';
import type { ChartItem, ItemSource } from '../../types';
import type { Mode } from '../../state/types';
import { useDispatch } from '../../hooks';
import { useItemActions, useSuggestionActions } from '../../hooks';
import { useTranscription } from '../../context/TranscriptionContext';

// ============================================================================
// Types
// ============================================================================

export interface UseCaptureViewResult {
  /** Currently editing item ID */
  editingItemId: string | null;
  /** Set the editing item ID */
  setEditingItemId: (id: string | null) => void;
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
  /** Handle editing an item */
  handleEditItem: (itemId: string) => void;
  /** Handle accepting a suggestion */
  handleSuggestionAccept: (suggestionId: string) => void;
  /** Handle dismissing a suggestion */
  handleSuggestionDismiss: (suggestionId: string, reason?: string) => void;
  /** Handle transcription toggle */
  handleTranscriptionToggle: () => void;
  /** Handle mode change */
  handleModeChange: (mode: Mode) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useCaptureView(): UseCaptureViewResult {
  const dispatch = useDispatch();
  const { addItem } = useItemActions();
  const { acceptSuggestion, dismissSuggestion } = useSuggestionActions();
  const transcription = useTranscription();

  // Local state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
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

  // Handle undo (remove last added item)
  // Note: Full item removal requires a store action (future work).
  // For now, we log the undo intent. The OmniAdd state machine tracks
  // its own undo stack; the parent is responsible for actual removal.
  const handleUndo = useCallback(
    (_itemId: string) => {
      // TODO: dispatch REMOVE_ITEM action when the store supports it
      console.debug('[CaptureView] Undo requested for item:', _itemId);
    },
    []
  );

  // Handle editing an item
  const handleEditItem = useCallback((itemId: string) => {
    setEditingItemId(itemId);
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
    },
    [dispatch]
  );

  return {
    editingItemId,
    setEditingItemId,
    isPaletteOpen,
    setIsPaletteOpen,
    isTaskPaneOpen,
    setIsTaskPaneOpen,
    handleItemAdd,
    handleUndo,
    handleEditItem,
    handleSuggestionAccept,
    handleSuggestionDismiss,
    handleTranscriptionToggle,
    handleModeChange,
  };
}
