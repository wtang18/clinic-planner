/**
 * Protocol action types and creators for the care protocol system.
 *
 * 10 action types covering the full protocol lifecycle:
 * load → activate → address/skip items → update severity → dismiss/complete/clear
 */

import type { ActiveProtocolState, ProtocolItemAddressedBy } from '../../types/protocol';

// ============================================================================
// Protocol Action Types
// ============================================================================

export type ProtocolAction =
  | { type: 'PROTOCOL_LOADED'; payload: { protocol: ActiveProtocolState } }
  | { type: 'PROTOCOL_ACTIVATED'; payload: { protocolId: string; source: ActiveProtocolState['activationSource'] } }
  | { type: 'PROTOCOL_ITEM_ADDRESSED'; payload: { protocolId: string; itemId: string; addressedBy: ProtocolItemAddressedBy } }
  | { type: 'PROTOCOL_ITEM_SKIPPED'; payload: { protocolId: string; itemId: string; reason?: string } }
  | { type: 'PROTOCOL_CARD_TOGGLED'; payload: { protocolId: string; cardId: string; expanded: boolean } }
  | { type: 'PROTOCOL_SEVERITY_UPDATED'; payload: { protocolId: string; score: number; pathId: string } }
  | { type: 'PROTOCOL_PATH_OVERRIDDEN'; payload: { protocolId: string; pathId: string } }
  | { type: 'PROTOCOL_DISMISSED'; payload: { protocolId: string } }
  | { type: 'PROTOCOL_COMPLETED'; payload: { protocolId: string } }
  | { type: 'PROTOCOL_CLEARED'; payload: { protocolId: string } };

// ============================================================================
// Action Type Constants
// ============================================================================

export const PROTOCOL_ACTION_TYPES = [
  'PROTOCOL_LOADED',
  'PROTOCOL_ACTIVATED',
  'PROTOCOL_ITEM_ADDRESSED',
  'PROTOCOL_ITEM_SKIPPED',
  'PROTOCOL_CARD_TOGGLED',
  'PROTOCOL_SEVERITY_UPDATED',
  'PROTOCOL_PATH_OVERRIDDEN',
  'PROTOCOL_DISMISSED',
  'PROTOCOL_COMPLETED',
  'PROTOCOL_CLEARED',
] as const;

// ============================================================================
// Action Creators
// ============================================================================

export const protocolLoaded = (protocol: ActiveProtocolState): ProtocolAction => ({
  type: 'PROTOCOL_LOADED',
  payload: { protocol },
});

export const protocolActivated = (
  protocolId: string,
  source: ActiveProtocolState['activationSource']
): ProtocolAction => ({
  type: 'PROTOCOL_ACTIVATED',
  payload: { protocolId, source },
});

export const protocolItemAddressed = (
  protocolId: string,
  itemId: string,
  addressedBy: ProtocolItemAddressedBy
): ProtocolAction => ({
  type: 'PROTOCOL_ITEM_ADDRESSED',
  payload: { protocolId, itemId, addressedBy },
});

export const protocolItemSkipped = (
  protocolId: string,
  itemId: string,
  reason?: string
): ProtocolAction => ({
  type: 'PROTOCOL_ITEM_SKIPPED',
  payload: { protocolId, itemId, reason },
});

export const protocolCardToggled = (
  protocolId: string,
  cardId: string,
  expanded: boolean
): ProtocolAction => ({
  type: 'PROTOCOL_CARD_TOGGLED',
  payload: { protocolId, cardId, expanded },
});

export const protocolSeverityUpdated = (
  protocolId: string,
  score: number,
  pathId: string
): ProtocolAction => ({
  type: 'PROTOCOL_SEVERITY_UPDATED',
  payload: { protocolId, score, pathId },
});

export const protocolPathOverridden = (
  protocolId: string,
  pathId: string
): ProtocolAction => ({
  type: 'PROTOCOL_PATH_OVERRIDDEN',
  payload: { protocolId, pathId },
});

export const protocolDismissed = (protocolId: string): ProtocolAction => ({
  type: 'PROTOCOL_DISMISSED',
  payload: { protocolId },
});

export const protocolCompleted = (protocolId: string): ProtocolAction => ({
  type: 'PROTOCOL_COMPLETED',
  payload: { protocolId },
});

export const protocolCleared = (protocolId: string): ProtocolAction => ({
  type: 'PROTOCOL_CLEARED',
  payload: { protocolId },
});
