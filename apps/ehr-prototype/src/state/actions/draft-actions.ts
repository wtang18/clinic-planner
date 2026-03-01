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
      type: 'DRAFT_CONTENT_READY';
      payload: { id: string; content: string; confidence?: number };
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
    }
  | {
      type: 'DRAFT_REFRESH';
      payload: { id: string };
    }
  | {
      type: 'DRAFT_CANCEL_REFRESH';
      payload: { id: string };
    }
  | {
      type: 'DRAFT_REFRESH_COMPLETE';
      payload: { id: string; content: string; confidence?: number };
    };

export const DRAFT_ACTION_TYPES = [
  'DRAFT_GENERATED',
  'DRAFT_CONTENT_READY',
  'DRAFT_ACCEPTED',
  'DRAFT_EDITED',
  'DRAFT_DISMISSED',
  'DRAFT_REFRESH',
  'DRAFT_CANCEL_REFRESH',
  'DRAFT_REFRESH_COMPLETE',
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

export const draftContentReady = (
  id: string,
  content: string,
  confidence?: number
): DraftAction => ({
  type: 'DRAFT_CONTENT_READY',
  payload: { id, content, confidence },
});

export const draftRefresh = (id: string): DraftAction => ({
  type: 'DRAFT_REFRESH',
  payload: { id },
});

export const draftCancelRefresh = (id: string): DraftAction => ({
  type: 'DRAFT_CANCEL_REFRESH',
  payload: { id },
});

export const draftRefreshComplete = (
  id: string,
  content: string,
  confidence?: number
): DraftAction => ({
  type: 'DRAFT_REFRESH_COMPLETE',
  payload: { id, content, confidence },
});
