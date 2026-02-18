/**
 * Draft Action Types and Creators
 *
 * Actions for the AI draft lifecycle: generate → pending → accept/edit/dismiss.
 */

import type { AIDraft } from '../../types/drafts';

// ============================================================================
// Action Types
// ============================================================================

export type DraftAction =
  | {
      type: 'DRAFT_GENERATED';
      payload: { draft: AIDraft };
    }
  | {
      type: 'DRAFT_ACCEPTED';
      payload: { id: string };
    }
  | {
      type: 'DRAFT_EDITED';
      payload: { id: string; content: string };
    }
  | {
      type: 'DRAFT_DISMISSED';
      payload: { id: string };
    };

export const DRAFT_ACTION_TYPES = [
  'DRAFT_GENERATED',
  'DRAFT_ACCEPTED',
  'DRAFT_EDITED',
  'DRAFT_DISMISSED',
] as const;

// ============================================================================
// Action Creators
// ============================================================================

export const draftGenerated = (draft: AIDraft): DraftAction => ({
  type: 'DRAFT_GENERATED',
  payload: { draft },
});

export const draftAccepted = (id: string): DraftAction => ({
  type: 'DRAFT_ACCEPTED',
  payload: { id },
});

export const draftEdited = (id: string, content: string): DraftAction => ({
  type: 'DRAFT_EDITED',
  payload: { id, content },
});

export const draftDismissed = (id: string): DraftAction => ({
  type: 'DRAFT_DISMISSED',
  payload: { id },
});
