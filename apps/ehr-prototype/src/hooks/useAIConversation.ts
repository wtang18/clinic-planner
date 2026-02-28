/**
 * useAIConversation Hook
 *
 * Manages conversation messages for both the AI palette (ephemeral, single-turn)
 * and the AI drawer (persistent conversation history). Matches user input against
 * canned scenario responses and simulates typing delay.
 *
 * Follow-up actions that suggest chart items are materialized as real Suggestion
 * objects, enabling the standard accept/dismiss/edit flow via SuggestionList.
 */

import { useState, useCallback, useRef } from 'react';
import type { ConversationMessage } from '../components/LeftPane/AIDrawer/ConversationHistory';
import type { ChartItem, ItemCategory } from '../types/chart-items';
import type { ItemSource } from '../types/chart-items';
import type { Suggestion, SuggestionContent } from '../types/suggestions';
import {
  getScenarioData,
  QUICK_ACTION_TO_QUERY,
  type CannedQuery,
  type FollowUpAction,
} from '../data/canned-ai-responses';

// ============================================================================
// Types
// ============================================================================

interface UseAIConversationOptions {
  onAddChartItem: (partial: Partial<ChartItem>, source?: ItemSource) => void;
}

interface UseAIConversationResult {
  messages: ConversationMessage[];
  paletteResponse: ConversationMessage | null;
  isLoading: boolean;
  sendMessage: (text: string) => void;
  handleQuickAction: (actionId: string) => void;
  /** Suggestion objects materialized from follow-up actions with chart items */
  followUpSuggestions: Suggestion[];
  /** Accept a follow-up suggestion (adds chart item) */
  handleFollowUpAccept: (id: string) => void;
  /** Dismiss a follow-up suggestion */
  handleFollowUpDismiss: (id: string) => void;
  /** Accept a follow-up suggestion with field changes */
  handleFollowUpAcceptWithChanges: (id: string, data: Record<string, unknown>) => void;
  /** Non-chart follow-up actions (e.g., "Copy to clipboard") */
  nonChartFollowUps: Array<{ id: string; label: string }>;
  /** Handle a non-chart follow-up action */
  handleNonChartAction: (actionId: string) => void;
  cannedQueries: CannedQuery[];
  clearPaletteResponse: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

let idCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

/** Convert a follow-up action with a chartItem into a Suggestion object */
function followUpToSuggestion(action: FollowUpAction): Suggestion | null {
  if (!action.chartItem) return null;

  const category = (action.chartItem.category ?? 'note') as ItemCategory;
  const content: SuggestionContent = {
    type: 'new-item',
    itemTemplate: action.chartItem,
    category,
  };

  return {
    id: `ai-fu-${action.id}`,
    type: 'chart-item',
    status: 'active',
    content,
    source: 'ai-analysis',
    confidence: 0.9,
    reasoning: 'Suggested by AI assistant based on query response',
    createdAt: new Date(),
    displayText: action.chartItem.displayText ?? action.label,
    displaySubtext: action.chartItem.displaySubtext,
    // Let SuggestionActionRow fall through to displayText (clean entity name).
    // action.label (e.g., "+ Add Dx: Acute bronchitis") was meant for button text
    // and is redundant next to the badge + Add button.
  };
}

// ============================================================================
// Hook
// ============================================================================

export function useAIConversation(
  scenarioId: string,
  options: UseAIConversationOptions,
): UseAIConversationResult {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [paletteResponse, setPaletteResponse] = useState<ConversationMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<Suggestion[]>([]);
  const [nonChartFollowUps, setNonChartFollowUps] = useState<Array<{ id: string; label: string }>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = getScenarioData(scenarioId);
  const cannedQueries = scenario?.queries ?? [];

  // Store original follow-up actions for chart item lookup during accept-with-changes
  const latestFollowUpsRef = useRef<FollowUpAction[]>([]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!scenario || !text.trim()) return;

      // Clear any pending timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Add user message immediately
      const userMessage: ConversationMessage = {
        id: nextId('msg'),
        type: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setPaletteResponse(null);
      setFollowUpSuggestions([]);
      setNonChartFollowUps([]);

      // Match query to canned response
      const matchedQuery = scenario.queries.find(
        (q) => q.text.toLowerCase() === text.trim().toLowerCase(),
      );
      const response = matchedQuery
        ? scenario.responses[matchedQuery.id]
        : scenario.fallbackResponse;

      const delay = response.delay ?? 800;

      timerRef.current = setTimeout(() => {
        const followUps = response.followUpActions ?? [];
        latestFollowUpsRef.current = followUps;

        // Separate chart-item follow-ups (become Suggestions) from non-chart actions
        const chartSuggestions: Suggestion[] = [];
        const otherActions: Array<{ id: string; label: string }> = [];

        for (const fu of followUps) {
          const suggestion = followUpToSuggestion(fu);
          if (suggestion) {
            chartSuggestions.push(suggestion);
          } else {
            otherActions.push({ id: fu.id, label: fu.label });
          }
        }

        // AI message — only include non-chart follow-ups as message actions
        const aiMessage: ConversationMessage = {
          id: nextId('msg'),
          type: 'ai',
          content: response.content,
          timestamp: new Date(),
          followUpActions: otherActions.length > 0 ? otherActions : undefined,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setPaletteResponse(aiMessage);
        setFollowUpSuggestions(chartSuggestions);
        setNonChartFollowUps(otherActions);
        setIsLoading(false);
        timerRef.current = null;
      }, delay);
    },
    [scenario],
  );

  const handleQuickAction = useCallback(
    (actionId: string) => {
      if (!scenario) return;
      const queryId = QUICK_ACTION_TO_QUERY[actionId];
      if (!queryId) return;
      const query = scenario.queries.find((q) => q.id === queryId);
      if (query) {
        sendMessage(query.text);
      }
    },
    [scenario, sendMessage],
  );

  // Accept a follow-up suggestion — materialize its chart item
  const handleFollowUpAccept = useCallback(
    (id: string) => {
      const suggestion = followUpSuggestions.find((s) => s.id === id);
      if (!suggestion || suggestion.content.type !== 'new-item') return;

      options.onAddChartItem(suggestion.content.itemTemplate, {
        type: 'aiSuggestion',
        suggestionId: id,
      });

      // Mark as accepted
      setFollowUpSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'accepted' as const, actedAt: new Date() } : s)),
      );
    },
    [followUpSuggestions, options],
  );

  // Dismiss a follow-up suggestion
  const handleFollowUpDismiss = useCallback(
    (id: string) => {
      setFollowUpSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'dismissed' as const, actedAt: new Date() } : s)),
      );
    },
    [],
  );

  // Accept with changes — merge edited data into the template, then add
  const handleFollowUpAcceptWithChanges = useCallback(
    (id: string, data: Record<string, unknown>) => {
      const suggestion = followUpSuggestions.find((s) => s.id === id);
      if (!suggestion || suggestion.content.type !== 'new-item') return;

      const mergedItem = {
        ...suggestion.content.itemTemplate,
        ...data,
      };

      options.onAddChartItem(mergedItem, {
        type: 'aiSuggestion',
        suggestionId: id,
      });

      setFollowUpSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'accepted-modified' as const, actedAt: new Date() } : s)),
      );
    },
    [followUpSuggestions, options],
  );

  // Handle non-chart follow-up actions (e.g., copy to clipboard)
  const handleNonChartAction = useCallback(
    (actionId: string) => {
      if (actionId === 'copy-summary') {
        const latestAI = [...messages].reverse().find((m) => m.type === 'ai');
        if (latestAI) {
          navigator.clipboard?.writeText(latestAI.content);
        }
      }
    },
    [messages],
  );

  const clearPaletteResponse = useCallback(() => {
    setPaletteResponse(null);
  }, []);

  return {
    messages,
    paletteResponse,
    isLoading,
    sendMessage,
    handleQuickAction,
    followUpSuggestions,
    handleFollowUpAccept,
    handleFollowUpDismiss,
    handleFollowUpAcceptWithChanges,
    nonChartFollowUps,
    handleNonChartAction,
    cannedQueries,
    clearPaletteResponse,
  };
}
