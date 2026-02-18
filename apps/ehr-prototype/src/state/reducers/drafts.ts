/**
 * Drafts Reducer
 *
 * Manages the AI draft collection lifecycle: generate → pending → accept/edit/dismiss.
 * Clears on encounter close (without save).
 */

import type { AIDraft } from '../../types/drafts';
import type { EncounterAction } from '../actions/types';

/**
 * Reducer for AI drafts collection
 */
export function draftsReducer(
  state: Record<string, AIDraft>,
  action: EncounterAction
): Record<string, AIDraft> {
  switch (action.type) {
    case 'DRAFT_GENERATED': {
      const { draft } = action.payload;
      return {
        ...state,
        [draft.id]: draft,
      };
    }

    case 'DRAFT_ACCEPTED': {
      const { id } = action.payload;
      const existing = state[id];
      if (!existing) return state;

      return {
        ...state,
        [id]: {
          ...existing,
          status: 'accepted',
        },
      };
    }

    case 'DRAFT_EDITED': {
      const { id, content } = action.payload;
      const existing = state[id];
      if (!existing) return state;

      return {
        ...state,
        [id]: {
          ...existing,
          content,
        },
      };
    }

    case 'DRAFT_DISMISSED': {
      const { id } = action.payload;
      const existing = state[id];
      if (!existing) return state;

      return {
        ...state,
        [id]: {
          ...existing,
          status: 'dismissed',
        },
      };
    }

    case 'ENCOUNTER_CLOSED': {
      if (!action.payload.save) {
        return {};
      }
      return state;
    }

    default:
      return state;
  }
}
