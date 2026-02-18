/**
 * Action type definitions for the EHR state management
 * 
 * Actions represent user intent or system events. They are the only way to modify state.
 * We use intent-based actions that capture "why" something happened, not just "what" changed.
 */

import type {
  ChartItem,
  ItemSource,
  Suggestion,
  SuggestionSource,
  BackgroundTask,
  CareGapInstance,
  CareGapExclusionReason,
  TranscriptSegment,
  PatientContext,
  EncounterMeta,
  VisitMeta,
} from '../../types';
import type { Mode, User } from '../types';
import type { Role } from '../../types/common';
import type { DraftAction } from './draft-actions';

// ============================================================================
// Chart Item Actions
// ============================================================================

export type ChartItemAction =
  | {
      type: 'ITEM_ADDED';
      payload: {
        item: ChartItem;
        source: ItemSource;
        triggeredBy?: string; // suggestionId, transcription segmentId
      };
    }
  | {
      type: 'ITEM_UPDATED';
      payload: {
        id: string;
        changes: Partial<ChartItem>;
        reason: 'user-edit' | 'ai-enrichment' | 'external-update' | 'result-received';
        actor?: string;
      };
    }
  | { type: 'ITEM_CONFIRMED'; payload: { id: string } }
  | { type: 'ITEM_CANCELLED'; payload: { id: string; reason?: string } }
  | { type: 'ITEM_DX_LINKED'; payload: { itemId: string; dxId: string } }
  | { type: 'ITEM_DX_UNLINKED'; payload: { itemId: string; dxId: string } }
  | { type: 'ITEM_DELETED'; payload: { id: string } }
  | { type: 'ITEM_SENT'; payload: { id: string; destination: string; method: string } }
  | { type: 'ITEMS_BATCH_SENT'; payload: { ids: string[]; destination: string } }
  | { type: 'ITEM_RESULT_RECEIVED'; payload: { id: string; result: unknown } };

// ============================================================================
// Suggestion Actions
// ============================================================================

export type SuggestionAction =
  | {
      type: 'SUGGESTION_RECEIVED';
      payload: {
        suggestion: Suggestion;
        source: SuggestionSource;
      };
    }
  | { type: 'SUGGESTION_ACCEPTED'; payload: { id: string } }
  | {
      type: 'SUGGESTION_ACCEPTED_WITH_CHANGES';
      payload: { id: string; changes: Partial<ChartItem> };
    }
  | { type: 'SUGGESTION_DISMISSED'; payload: { id: string; reason?: string } }
  | { type: 'SUGGESTION_EXPIRED'; payload: { id: string } }
  | { type: 'SUGGESTIONS_CLEARED'; payload: { olderThan: Date } };

// ============================================================================
// Task Actions
// ============================================================================

export type TaskAction =
  | {
      type: 'TASK_CREATED';
      payload: {
        task: BackgroundTask;
        relatedItemId?: string;
      };
    }
  | { type: 'TASK_PROGRESS'; payload: { id: string; progress: number; status?: string } }
  | { type: 'TASK_COMPLETED'; payload: { id: string; result: unknown } }
  | { type: 'TASK_FAILED'; payload: { id: string; error: string } }
  | { type: 'TASK_APPROVED'; payload: { id: string } }
  | { type: 'TASK_REJECTED'; payload: { id: string; reason?: string } }
  | { type: 'TASKS_BATCH_APPROVED'; payload: { ids: string[] } };

// ============================================================================
// Care Gap Actions
// ============================================================================

export type CareGapAction =
  | {
      type: 'CARE_GAP_IDENTIFIED';
      payload: {
        gap: CareGapInstance;
        source: 'system-scan' | 'import' | 'manual';
      };
    }
  | {
      type: 'CARE_GAP_ADDRESSED';
      payload: {
        gapId: string;
        itemId: string;
        result: 'pending' | 'closed';
      };
    }
  | {
      type: 'CARE_GAP_CLOSED';
      payload: {
        gapId: string;
        closedBy: { itemId: string; method: 'automatic' | 'manual' };
      };
    }
  | {
      type: 'CARE_GAP_EXCLUDED';
      payload: {
        gapId: string;
        reason: CareGapExclusionReason;
      };
    }
  | {
      type: 'CARE_GAP_REOPENED';
      payload: {
        gapId: string;
        reason: 'result-expired' | 'new-measurement-period' | 'manual';
      };
    }
  | {
      type: 'CARE_GAPS_REFRESHED';
      payload: {
        gaps: CareGapInstance[];
      };
    };

// ============================================================================
// Session Actions
// ============================================================================

export type SessionAction =
  | { type: 'MODE_CHANGED'; payload: { to: Mode; trigger: 'user' | 'auto' } }
  | { type: 'TRANSCRIPTION_STARTED'; payload: Record<string, never> }
  | { type: 'TRANSCRIPTION_PAUSED'; payload: Record<string, never> }
  | { type: 'TRANSCRIPTION_STOPPED'; payload: Record<string, never> }
  | { type: 'TRANSCRIPTION_SEGMENT_RECEIVED'; payload: { segment: TranscriptSegment } }
  | {
      type: 'ENCOUNTER_OPENED';
      payload: {
        encounterId: string;
        patient: PatientContext;
        encounter: EncounterMeta;
        visit?: VisitMeta;
      };
    }
  | { type: 'ENCOUNTER_CLOSED'; payload: { save: boolean } }
  | { type: 'ENCOUNTER_SIGNED'; payload: { signedAt: Date; signedBy?: string } };

// ============================================================================
// Collaboration Actions
// ============================================================================

export type CollaborationAction =
  | { type: 'HANDOFF_INITIATED'; payload: { to: User; role: Role } }
  | { type: 'HANDOFF_ACCEPTED'; payload: { by: User } }
  | { type: 'ITEM_LOCK_ACQUIRED'; payload: { itemId: string; userId: string } }
  | { type: 'ITEM_LOCK_RELEASED'; payload: { itemId: string } };

// ============================================================================
// Sync Actions
// ============================================================================

export type SyncAction =
  | { type: 'SYNC_STARTED'; payload: Record<string, never> }
  | { type: 'SYNC_COMPLETED'; payload: { serverVersion: number } }
  | { type: 'SYNC_FAILED'; payload: { error: string; retryable: boolean } }
  | { type: 'SYNC_CONFLICT_DETECTED'; payload: { itemId: string; local: unknown; server: unknown } }
  | {
      type: 'SYNC_CONFLICT_RESOLVED';
      payload: { itemId: string; resolution: 'local' | 'server' | 'merge' };
    };

// ============================================================================
// Union Type
// ============================================================================

export type EncounterAction =
  | ChartItemAction
  | SuggestionAction
  | TaskAction
  | CareGapAction
  | SessionAction
  | CollaborationAction
  | SyncAction
  | DraftAction;

export type { DraftAction } from './draft-actions';

// ============================================================================
// Action Type Constants
// ============================================================================

export const CHART_ITEM_ACTION_TYPES = [
  'ITEM_ADDED',
  'ITEM_UPDATED',
  'ITEM_CONFIRMED',
  'ITEM_CANCELLED',
  'ITEM_DELETED',
  'ITEM_DX_LINKED',
  'ITEM_DX_UNLINKED',
  'ITEM_SENT',
  'ITEMS_BATCH_SENT',
  'ITEM_RESULT_RECEIVED',
] as const;

export const SUGGESTION_ACTION_TYPES = [
  'SUGGESTION_RECEIVED',
  'SUGGESTION_ACCEPTED',
  'SUGGESTION_ACCEPTED_WITH_CHANGES',
  'SUGGESTION_DISMISSED',
  'SUGGESTION_EXPIRED',
  'SUGGESTIONS_CLEARED',
] as const;

export const TASK_ACTION_TYPES = [
  'TASK_CREATED',
  'TASK_PROGRESS',
  'TASK_COMPLETED',
  'TASK_FAILED',
  'TASK_APPROVED',
  'TASK_REJECTED',
  'TASKS_BATCH_APPROVED',
] as const;

export const CARE_GAP_ACTION_TYPES = [
  'CARE_GAP_IDENTIFIED',
  'CARE_GAP_ADDRESSED',
  'CARE_GAP_CLOSED',
  'CARE_GAP_EXCLUDED',
  'CARE_GAP_REOPENED',
  'CARE_GAPS_REFRESHED',
] as const;

export const SESSION_ACTION_TYPES = [
  'MODE_CHANGED',
  'TRANSCRIPTION_STARTED',
  'TRANSCRIPTION_PAUSED',
  'TRANSCRIPTION_STOPPED',
  'TRANSCRIPTION_SEGMENT_RECEIVED',
  'ENCOUNTER_OPENED',
  'ENCOUNTER_CLOSED',
  'ENCOUNTER_SIGNED',
] as const;

export const COLLABORATION_ACTION_TYPES = [
  'HANDOFF_INITIATED',
  'HANDOFF_ACCEPTED',
  'ITEM_LOCK_ACQUIRED',
  'ITEM_LOCK_RELEASED',
] as const;

export const SYNC_ACTION_TYPES = [
  'SYNC_STARTED',
  'SYNC_COMPLETED',
  'SYNC_FAILED',
  'SYNC_CONFLICT_DETECTED',
  'SYNC_CONFLICT_RESOLVED',
] as const;

export { DRAFT_ACTION_TYPES } from './draft-actions';
