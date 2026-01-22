/**
 * useSuggestions Hooks
 *
 * Hooks for accessing and managing AI suggestions.
 */

import React from 'react';
import type { Suggestion, SuggestionSource, ChartItem } from '../types';
import {
  selectAllSuggestions,
  selectSuggestion,
} from '../state/selectors/entities';
import {
  selectActiveSuggestions,
  selectSuggestionsBySource,
  selectHighConfidenceSuggestions,
} from '../state/selectors/derived';
import {
  suggestionAccepted,
  suggestionAcceptedWithChanges,
  suggestionDismissed,
} from '../state/actions/creators';
import { useSelector, useDispatch } from './useEncounterState';

// ============================================================================
// Basic Suggestion Hooks
// ============================================================================

/**
 * Get all suggestions
 */
export function useSuggestions(): Suggestion[] {
  return useSelector(selectAllSuggestions);
}

/**
 * Get a single suggestion by ID
 */
export function useSuggestion(id: string): Suggestion | undefined {
  return useSelector((state) => selectSuggestion(state, id));
}

/**
 * Get active suggestions (not expired, dismissed, etc.)
 */
export function useActiveSuggestions(): Suggestion[] {
  return useSelector(selectActiveSuggestions);
}

/**
 * Get suggestions filtered by source
 */
export function useSuggestionsBySource(source: SuggestionSource): Suggestion[] {
  return useSelector((state) => selectSuggestionsBySource(state, source));
}

/**
 * Get high-confidence suggestions (>0.85)
 */
export function useHighConfidenceSuggestions(): Suggestion[] {
  return useSelector(selectHighConfidenceSuggestions);
}

// ============================================================================
// Suggestion Actions
// ============================================================================

export interface SuggestionActions {
  /** Accept a suggestion as-is */
  acceptSuggestion: (id: string) => void;
  /** Accept a suggestion with modifications */
  acceptWithChanges: (id: string, changes: Partial<ChartItem>) => void;
  /** Dismiss a suggestion */
  dismissSuggestion: (id: string, reason?: string) => void;
}

/**
 * Get actions for managing suggestions
 */
export function useSuggestionActions(): SuggestionActions {
  const dispatch = useDispatch();

  return React.useMemo(
    () => ({
      acceptSuggestion: (id: string) => {
        dispatch(suggestionAccepted(id));
      },

      acceptWithChanges: (id: string, changes: Partial<ChartItem>) => {
        dispatch(suggestionAcceptedWithChanges(id, changes));
      },

      dismissSuggestion: (id: string, reason?: string) => {
        dispatch(suggestionDismissed(id, reason));
      },
    }),
    [dispatch]
  );
}

// ============================================================================
// Combined Hook
// ============================================================================

/**
 * Combined hook for suggestions and actions
 */
export function useSuggestionsWithActions(): {
  suggestions: Suggestion[];
  activeSuggestions: Suggestion[];
  actions: SuggestionActions;
} {
  const suggestions = useSuggestions();
  const activeSuggestions = useActiveSuggestions();
  const actions = useSuggestionActions();

  return { suggestions, activeSuggestions, actions };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Get count of active suggestions
 */
export function useActiveSuggestionCount(): number {
  return useSelector((state) => selectActiveSuggestions(state).length);
}

/**
 * Get suggestions related to a specific item
 */
export function useSuggestionsForItem(itemId: string): Suggestion[] {
  return useSelector((state) => {
    const suggestions = selectActiveSuggestions(state);
    return suggestions.filter((s) => s.relatedItemId === itemId);
  });
}

/**
 * Get suggestions grouped by type
 */
export function useSuggestionsGroupedByType(): Record<string, Suggestion[]> {
  return useSelector((state) => {
    const suggestions = selectActiveSuggestions(state);
    const grouped: Record<string, Suggestion[]> = {};

    for (const suggestion of suggestions) {
      if (!grouped[suggestion.type]) {
        grouped[suggestion.type] = [];
      }
      grouped[suggestion.type].push(suggestion);
    }

    return grouped;
  });
}

/**
 * Check if there are any pending suggestions
 */
export function useHasPendingSuggestions(): boolean {
  return useSelector((state) => selectActiveSuggestions(state).length > 0);
}

/**
 * Get suggestions from transcription
 */
export function useTranscriptionSuggestions(): Suggestion[] {
  return useSuggestionsBySource('transcription');
}

/**
 * Get suggestions from AI analysis
 */
export function useAiAnalysisSuggestions(): Suggestion[] {
  return useSuggestionsBySource('ai-analysis');
}

/**
 * Get care gap related suggestions
 */
export function useCareGapSuggestions(): Suggestion[] {
  return useSuggestionsBySource('care-gap');
}
