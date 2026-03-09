/**
 * Protocol reducer — manages ActiveProtocolState instances within encounters.
 *
 * Handles 10 protocol actions covering the full lifecycle:
 * load → activate → address/skip items → update severity → dismiss/complete/clear
 */

import type { ActiveProtocolState } from '../../types/protocol';
import type { EncounterAction } from '../actions/types';

type ProtocolsState = Record<string, ActiveProtocolState>;

/**
 * Reducer for the protocols entity collection.
 */
export function protocolsReducer(
  state: ProtocolsState,
  action: EncounterAction
): ProtocolsState {
  switch (action.type) {
    case 'PROTOCOL_LOADED': {
      const { protocol } = action.payload;
      // Initialize cardStates and itemStates from template
      const cardStates: ActiveProtocolState['cardStates'] = {};
      const itemStates: ActiveProtocolState['itemStates'] = {};

      protocol.templateSnapshot.cards.forEach((card, cardIndex) => {
        cardStates[card.id] = {
          expanded: cardIndex === 0 && protocol.templateSnapshot.autoExpandFirstCard,
          manuallyToggled: false,
        };
        card.items.forEach(item => {
          // Advisory items are not addressable — mark them not-applicable
          if (item.itemType.type === 'advisory') {
            itemStates[item.id] = { status: 'not-applicable' };
          } else {
            itemStates[item.id] = { status: 'pending' };
          }
        });
      });

      return {
        ...state,
        [protocol.id]: {
          ...protocol,
          cardStates: { ...protocol.cardStates, ...cardStates },
          itemStates: { ...protocol.itemStates, ...itemStates },
        },
      };
    }

    case 'PROTOCOL_ACTIVATED': {
      const { protocolId, source } = action.payload;
      const existing = state[protocolId];
      if (!existing) return state;

      return {
        ...state,
        [protocolId]: {
          ...existing,
          status: 'active',
          activationSource: source,
          activatedAt: new Date(),
        },
      };
    }

    case 'PROTOCOL_ITEM_ADDRESSED': {
      const { protocolId, itemId, addressedBy } = action.payload;
      const existing = state[protocolId];
      if (!existing) return state;

      return {
        ...state,
        [protocolId]: {
          ...existing,
          itemStates: {
            ...existing.itemStates,
            [itemId]: {
              status: 'addressed',
              addressedBy,
              addressedAt: new Date(),
            },
          },
        },
      };
    }

    case 'PROTOCOL_ITEM_SKIPPED': {
      const { protocolId, itemId, reason } = action.payload;
      const existing = state[protocolId];
      if (!existing) return state;

      return {
        ...state,
        [protocolId]: {
          ...existing,
          itemStates: {
            ...existing.itemStates,
            [itemId]: {
              status: 'skipped',
              skipReason: reason,
            },
          },
        },
      };
    }

    case 'PROTOCOL_CARD_TOGGLED': {
      const { protocolId, cardId, expanded } = action.payload;
      const existing = state[protocolId];
      if (!existing) return state;

      return {
        ...state,
        [protocolId]: {
          ...existing,
          cardStates: {
            ...existing.cardStates,
            [cardId]: {
              expanded,
              manuallyToggled: true,
            },
          },
        },
      };
    }

    case 'PROTOCOL_SEVERITY_UPDATED': {
      const { protocolId, score, pathId } = action.payload;
      const existing = state[protocolId];
      if (!existing) return state;

      return {
        ...state,
        [protocolId]: {
          ...existing,
          severity: {
            score,
            selectedPathId: pathId,
            isManualOverride: existing.severity?.isManualOverride ?? false,
          },
        },
      };
    }

    case 'PROTOCOL_PATH_OVERRIDDEN': {
      const { protocolId, pathId } = action.payload;
      const existing = state[protocolId];
      if (!existing) return state;

      return {
        ...state,
        [protocolId]: {
          ...existing,
          severity: {
            score: existing.severity?.score ?? 0,
            selectedPathId: pathId,
            isManualOverride: true,
          },
        },
      };
    }

    case 'PROTOCOL_DISMISSED': {
      const { protocolId } = action.payload;
      const existing = state[protocolId];
      if (!existing) return state;

      return {
        ...state,
        [protocolId]: {
          ...existing,
          status: 'dismissed',
        },
      };
    }

    case 'PROTOCOL_COMPLETED': {
      const { protocolId } = action.payload;
      const existing = state[protocolId];
      if (!existing) return state;

      return {
        ...state,
        [protocolId]: {
          ...existing,
          status: 'completed',
        },
      };
    }

    case 'PROTOCOL_CLEARED': {
      const { protocolId } = action.payload;
      const { [protocolId]: _removed, ...rest } = state;
      return rest;
    }

    // Reset on encounter close
    case 'ENCOUNTER_CLOSED': {
      return {};
    }

    default:
      return state;
  }
}
