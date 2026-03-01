/**
 * useCaptureView Hook
 *
 * Custom hook for capture view logic and state management.
 */

import { useCallback, useState, useEffect } from 'react';
import type { ChartItem, ItemSource } from '../../types';
import type { Mode } from '../../state/types';
import type { ViewContext, WorkflowPhase } from '../IntakeView/intakeChecklist';
import { useDispatch } from '../../hooks';
import { useItemActions, useSuggestionActions, useDraftActions } from '../../hooks';
import { materializeChartItem } from '../../utils/chart-item-factory';
import { useTranscription } from '../../context/TranscriptionContext';
import { useStore } from '../../hooks/useEncounterState';
import { useNavigation } from '../../navigation/NavigationContext';
import { selectDraft } from '../../state/selectors/drafts';
import { getMockDraftContent, getMockConfidence } from '../../services/draft-engine';

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
  /** Handle accepting a suggestion with field changes */
  handleSuggestionAcceptWithChanges: (suggestionId: string, fieldData: Record<string, unknown>) => void;
  /** Handle dismissing a suggestion */
  handleSuggestionDismiss: (suggestionId: string, reason?: string) => void;
  /** Handle transcription toggle */
  handleTranscriptionToggle: () => void;
  /** Handle mode change */
  handleModeChange: (mode: Mode) => void;
  /** Current view context (charting vs intake) */
  viewContext: ViewContext;
  /** Set view context */
  setViewContext: (ctx: ViewContext) => void;
  /** Accept an AI draft — promotes to chart item */
  handleAcceptDraft: (draftId: string) => void;
  /** Edit an AI draft — opens details pane with draft content */
  handleEditDraft: (draftId: string) => void;
  /** Dismiss an AI draft */
  handleDismissDraft: (draftId: string) => void;
  /** Refresh an AI draft — re-generates content */
  handleRefreshDraft: (draftId: string) => void;
  /** Cancel an in-progress draft refresh */
  handleCancelRefresh: (draftId: string) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useCaptureView(): UseCaptureViewResult {
  const dispatch = useDispatch();
  const store = useStore();
  const { setMode: setNavigationMode } = useNavigation();
  const { addItem, updateItem, deleteItem } = useItemActions();
  const { acceptSuggestion, acceptWithChanges, dismissSuggestion } = useSuggestionActions();
  const { acceptDraft: acceptDraftAction, dismissDraft: dismissDraftAction } = useDraftActions();
  const transcription = useTranscription();

  // Local state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isTaskPaneOpen, setIsTaskPaneOpen] = useState(false);
  const [viewContext, setViewContext] = useState<ViewContext>('charting');

  // Handle adding a new item
  const handleItemAdd = useCallback(
    (partialItem: Partial<ChartItem>, source: ItemSource = { type: 'manual' }) => {
      addItem(
        materializeChartItem(partialItem, {
          source,
          activityDetail: `Added via OmniAdd (${partialItem.category || 'note'})`,
        }),
        source,
      );
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

  // Handle accepting a suggestion — creates a ChartItem from the suggestion template
  const handleSuggestionAccept = useCallback(
    (suggestionId: string) => {
      const state = store.getState();
      const suggestion = Object.values(state.entities.suggestions).find(
        (s: any) => s.id === suggestionId
      ) as import('../../types/suggestions').Suggestion | undefined;

      if (suggestion) {
        let template: Partial<ChartItem> | null = null;

        if (suggestion.content.type === 'new-item') {
          template = {
            ...suggestion.content.itemTemplate,
            category: suggestion.content.itemTemplate.category || suggestion.content.category,
            displayText: suggestion.content.itemTemplate.displayText
              || suggestion.actionLabel || suggestion.displayText,
          } as Partial<ChartItem>;
        } else if (suggestion.content.type === 'care-gap-action') {
          template = {
            ...suggestion.content.actionTemplate,
            displayText: suggestion.content.actionTemplate.displayText
              || suggestion.actionLabel || suggestion.displayText,
          } as Partial<ChartItem>;
        }

        if (template) {
          addItem(
            materializeChartItem(template, {
              source: { type: 'aiSuggestion', suggestionId },
              activityDetail: `Accepted AI suggestion: ${suggestion.displayText}`,
            }),
            { type: 'aiSuggestion', suggestionId },
          );
        }
      }

      acceptSuggestion(suggestionId);
    },
    [acceptSuggestion, addItem, store]
  );

  // Handle accepting a suggestion with field changes
  const handleSuggestionAcceptWithChanges = useCallback(
    (suggestionId: string, fieldData: Record<string, unknown>) => {
      const state = store.getState();
      const suggestion = Object.values(state.entities.suggestions).find(
        (s: any) => s.id === suggestionId
      ) as import('../../types/suggestions').Suggestion | undefined;

      if (suggestion) {
        let baseTemplate: Partial<ChartItem> | null = null;

        if (suggestion.content.type === 'new-item') {
          baseTemplate = {
            ...suggestion.content.itemTemplate,
            category: suggestion.content.itemTemplate.category || suggestion.content.category,
            displayText: suggestion.content.itemTemplate.displayText
              || suggestion.actionLabel || suggestion.displayText,
          } as Partial<ChartItem>;
        } else if (suggestion.content.type === 'care-gap-action') {
          baseTemplate = {
            ...suggestion.content.actionTemplate,
            displayText: suggestion.content.actionTemplate.displayText
              || suggestion.actionLabel || suggestion.displayText,
          } as Partial<ChartItem>;
        }

        if (baseTemplate) {
          const template = {
            ...baseTemplate,
            data: { ...(baseTemplate.data ?? {}), ...fieldData },
          } as Partial<ChartItem>;
          addItem(
            materializeChartItem(template, {
              source: { type: 'aiSuggestion', suggestionId },
              activityDetail: `Accepted AI suggestion with changes: ${suggestion.displayText}`,
            }),
            { type: 'aiSuggestion', suggestionId },
          );
        }
      }

      acceptWithChanges(suggestionId, fieldData as any);
    },
    [acceptWithChanges, addItem, store]
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

  // Listen for transcription toggle shortcut event (fired by ShortcutManager)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => handleTranscriptionToggle();
    window.addEventListener('ehr:toggle-transcription', handler);
    return () => window.removeEventListener('ehr:toggle-transcription', handler);
  }, [handleTranscriptionToggle]);

  // Listen for workflow toggle shortcut event (fired by ShortcutManager)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setViewContext((prev) => (prev === 'charting' ? 'workflow' : 'charting'));
    window.addEventListener('ehr:toggle-workflow', handler);
    return () => window.removeEventListener('ehr:toggle-workflow', handler);
  }, []);

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
          },
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

      acceptDraftAction(draftId);

      const item = materializeChartItem(
        { category: draft.category, displayText: draft.content, displaySubtext: draft.label },
        {
          source: { type: 'aiDraft', draftId },
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

  // Handle dismissing an AI draft
  const handleDismissDraft = useCallback(
    (draftId: string) => {
      dismissDraftAction(draftId);
    },
    [dismissDraftAction]
  );

  // Handle refreshing/cancelling an AI draft
  const { refreshDraft: refreshDraftAction, cancelRefresh: cancelRefreshAction, completeRefresh: completeRefreshAction } = useDraftActions();
  const handleRefreshDraft = useCallback(
    (draftId: string) => {
      const currentState = store.getState();
      const draft = selectDraft(currentState, draftId);
      if (!draft || draft.status !== 'pending') return;

      refreshDraftAction(draftId);

      // After short delay, complete with refreshed content
      setTimeout(() => {
        const content = getMockDraftContent(draft.category);
        const confidence = getMockConfidence(draft.category);
        completeRefreshAction(draftId, content, confidence);
      }, 2500);
    },
    [store, refreshDraftAction, completeRefreshAction]
  );

  // Cancel an in-progress draft refresh — reverts updating → pending
  const handleCancelRefresh = useCallback(
    (draftId: string) => {
      cancelRefreshAction(draftId);
    },
    [cancelRefreshAction]
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
    handleSuggestionAcceptWithChanges,
    handleSuggestionDismiss,
    handleTranscriptionToggle,
    handleModeChange,
    viewContext,
    setViewContext,
    handleAcceptDraft,
    handleEditDraft,
    handleDismissDraft,
    handleRefreshDraft,
    handleCancelRefresh,
  };
}
