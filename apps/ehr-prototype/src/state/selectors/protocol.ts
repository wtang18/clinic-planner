/**
 * Protocol selectors — derived state for care protocol instances.
 *
 * Entity and completion selectors are fully functional.
 * Severity scoring (CP6) and suggestion matching (CP5) remain stubs.
 */

import type { EncounterState } from '../types';
import type {
  ActiveProtocolState,
  ProtocolItemState,
} from '../../types/protocol';
import type { ChartItem, Suggestion } from '../../types';

// ============================================================================
// Protocol Entity Selectors
// ============================================================================

/** Select all protocol instances. */
export const selectAllProtocols = (
  state: EncounterState
): ActiveProtocolState[] => Object.values(state.entities.protocols);

/** Select a single protocol by ID. */
export const selectProtocol = (
  state: EncounterState,
  protocolId: string
): ActiveProtocolState | undefined => state.entities.protocols[protocolId];

/** Select the primary active protocol (if any). */
export const selectActiveProtocol = (
  state: EncounterState
): ActiveProtocolState | null => {
  const protocols = Object.values(state.entities.protocols);
  return protocols.find(p => p.isPrimary && p.status === 'active') ?? null;
};

/** Select non-primary active protocols (for addenda). */
export const selectAddendaProtocols = (
  state: EncounterState
): ActiveProtocolState[] => {
  return Object.values(state.entities.protocols).filter(
    p => !p.isPrimary && (p.status === 'active' || p.status === 'available')
  );
};

// ============================================================================
// Protocol Completion Selectors
// ============================================================================

/** Completion stats for a protocol. */
export const selectProtocolCompletion = (
  state: EncounterState,
  protocolId: string
): { addressed: number; total: number; ratio: number } => {
  const protocol = state.entities.protocols[protocolId];
  if (!protocol) return { addressed: 0, total: 0, ratio: 0 };

  const itemStates = Object.values(protocol.itemStates);
  // Only count addressable items (orderable + documentable), not guidance/advisory
  const addressable = itemStates.length;
  const addressed = itemStates.filter(
    s => s.status === 'addressed' || s.status === 'skipped'
  ).length;

  return {
    addressed,
    total: addressable,
    ratio: addressable === 0 ? 0 : addressed / addressable,
  };
};

/** State of a single protocol item. */
export const selectProtocolItemState = (
  state: EncounterState,
  protocolId: string,
  itemId: string
): ProtocolItemState | undefined => {
  const protocol = state.entities.protocols[protocolId];
  return protocol?.itemStates[itemId];
};

// ============================================================================
// Severity & Scoring Selectors
// ============================================================================

/**
 * Compute severity score from assessment chart items + scoring model inputs.
 * Reads assessment items from entities.items, matches by assessmentType,
 * and computes weighted sum for the scoring formula.
 */
export const selectSeverityScore = (
  state: EncounterState,
  protocolId: string
): { score: number; recommendedPathId: string; inputs: { id: string; value: number | null }[] } | null => {
  const protocol = state.entities.protocols[protocolId];
  if (!protocol?.severity) return null;

  const scoringModel = protocol.templateSnapshot.severityScoringModel;
  if (!scoringModel) return null;

  // Collect all assessment items from the chart
  const assessmentItems = Object.values(state.entities.items).filter(
    (item): item is ChartItem => item !== undefined && item.category === 'assessment'
  );

  // Map scoring inputs to their current values from chart
  const inputValues = scoringModel.inputs.map(input => {
    let value: number | null = null;

    if (input.source === 'assessment' && input.assessmentType) {
      const matchingItem = assessmentItems.find(
        a => (a as any).data?.assessmentType === input.assessmentType
      );
      if (matchingItem) {
        value = (matchingItem as any).data?.value ?? null;
      }
    }

    return { id: input.id, value };
  });

  // Compute weighted sum
  let score = 0;
  if (scoringModel.scoringLogic.type === 'weighted-sum') {
    for (let i = 0; i < scoringModel.inputs.length; i++) {
      const inputValue = inputValues[i].value;
      if (inputValue != null) {
        score += inputValue * scoringModel.inputs[i].weight;
      }
    }
  }

  // Find matching path
  let recommendedPathId = protocol.severity.selectedPathId;
  for (const path of scoringModel.paths) {
    if (score >= path.scoreRange.min && score <= path.scoreRange.max) {
      recommendedPathId = path.id;
      break;
    }
  }

  return { score, recommendedPathId, inputs: inputValues };
};

// ============================================================================
// Cross-Surface Selectors (stubs — CP5)
// ============================================================================

/** Chart items linked to a protocol. */
export const selectProtocolLinkedItems = (
  state: EncounterState,
  protocolId: string
): ChartItem[] => {
  const itemIds = state.relationships.protocolToItems[protocolId] ?? [];
  return itemIds
    .map(id => state.entities.items[id])
    .filter((item): item is ChartItem => item !== undefined);
};

/** Find a matching suggestion for a protocol orderable. Stub: returns null. */
export const selectProtocolItemSuggestionMatch = (
  _state: EncounterState,
  _protocolId: string,
  _itemId: string
): Suggestion | null => {
  // Stub — full implementation in CP5
  return null;
};
