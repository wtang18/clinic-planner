/**
 * Action creator functions for the EHR state management
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
import type {
  ChartItemAction,
  SuggestionAction,
  TaskAction,
  CareGapAction,
  SessionAction,
  CollaborationAction,
  SyncAction,
} from './types';

// ============================================================================
// Chart Item Action Creators
// ============================================================================

export const itemAdded = (
  item: ChartItem,
  source: ItemSource,
  triggeredBy?: string
): ChartItemAction => ({
  type: 'ITEM_ADDED',
  payload: { item, source, triggeredBy },
});

export const itemUpdated = (
  id: string,
  changes: Partial<ChartItem>,
  reason: 'user-edit' | 'ai-enrichment' | 'external-update' | 'result-received',
  actor?: string
): ChartItemAction => ({
  type: 'ITEM_UPDATED',
  payload: { id, changes, reason, ...(actor !== undefined && { actor }) },
});

export const itemConfirmed = (id: string): ChartItemAction => ({
  type: 'ITEM_CONFIRMED',
  payload: { id },
});

export const itemCancelled = (id: string, reason?: string): ChartItemAction => ({
  type: 'ITEM_CANCELLED',
  payload: { id, reason },
});

export const itemDxLinked = (itemId: string, dxId: string): ChartItemAction => ({
  type: 'ITEM_DX_LINKED',
  payload: { itemId, dxId },
});

export const itemDxUnlinked = (itemId: string, dxId: string): ChartItemAction => ({
  type: 'ITEM_DX_UNLINKED',
  payload: { itemId, dxId },
});

export const itemDeleted = (id: string): ChartItemAction => ({
  type: 'ITEM_DELETED',
  payload: { id },
});

export const itemSent = (
  id: string,
  destination: string,
  method: string
): ChartItemAction => ({
  type: 'ITEM_SENT',
  payload: { id, destination, method },
});

export const itemsBatchSent = (ids: string[], destination: string): ChartItemAction => ({
  type: 'ITEMS_BATCH_SENT',
  payload: { ids, destination },
});

export const itemResultReceived = (id: string, result: unknown): ChartItemAction => ({
  type: 'ITEM_RESULT_RECEIVED',
  payload: { id, result },
});

// ============================================================================
// Suggestion Action Creators
// ============================================================================

export const suggestionReceived = (
  suggestion: Suggestion,
  source: SuggestionSource
): SuggestionAction => ({
  type: 'SUGGESTION_RECEIVED',
  payload: { suggestion, source },
});

export const suggestionAccepted = (id: string): SuggestionAction => ({
  type: 'SUGGESTION_ACCEPTED',
  payload: { id },
});

export const suggestionAcceptedWithChanges = (
  id: string,
  changes: Partial<ChartItem>
): SuggestionAction => ({
  type: 'SUGGESTION_ACCEPTED_WITH_CHANGES',
  payload: { id, changes },
});

export const suggestionDismissed = (id: string, reason?: string): SuggestionAction => ({
  type: 'SUGGESTION_DISMISSED',
  payload: { id, reason },
});

export const suggestionExpired = (id: string): SuggestionAction => ({
  type: 'SUGGESTION_EXPIRED',
  payload: { id },
});

export const suggestionsCleared = (olderThan: Date): SuggestionAction => ({
  type: 'SUGGESTIONS_CLEARED',
  payload: { olderThan },
});

// ============================================================================
// Task Action Creators
// ============================================================================

export const taskCreated = (
  task: BackgroundTask,
  relatedItemId?: string
): TaskAction => ({
  type: 'TASK_CREATED',
  payload: { task, relatedItemId },
});

export const taskProgress = (
  id: string,
  progress: number,
  status?: string
): TaskAction => ({
  type: 'TASK_PROGRESS',
  payload: { id, progress, status },
});

export const taskCompleted = (id: string, result: unknown): TaskAction => ({
  type: 'TASK_COMPLETED',
  payload: { id, result },
});

export const taskFailed = (id: string, error: string): TaskAction => ({
  type: 'TASK_FAILED',
  payload: { id, error },
});

export const taskApproved = (id: string): TaskAction => ({
  type: 'TASK_APPROVED',
  payload: { id },
});

export const taskRejected = (id: string, reason?: string): TaskAction => ({
  type: 'TASK_REJECTED',
  payload: { id, reason },
});

export const tasksBatchApproved = (ids: string[]): TaskAction => ({
  type: 'TASKS_BATCH_APPROVED',
  payload: { ids },
});

// ============================================================================
// Care Gap Action Creators
// ============================================================================

export const careGapIdentified = (
  gap: CareGapInstance,
  source: 'system-scan' | 'import' | 'manual'
): CareGapAction => ({
  type: 'CARE_GAP_IDENTIFIED',
  payload: { gap, source },
});

export const careGapAddressed = (
  gapId: string,
  itemId: string,
  result: 'pending' | 'closed'
): CareGapAction => ({
  type: 'CARE_GAP_ADDRESSED',
  payload: { gapId, itemId, result },
});

export const careGapClosed = (
  gapId: string,
  closedBy: { itemId: string; method: 'automatic' | 'manual' }
): CareGapAction => ({
  type: 'CARE_GAP_CLOSED',
  payload: { gapId, closedBy },
});

export const careGapExcluded = (
  gapId: string,
  reason: CareGapExclusionReason
): CareGapAction => ({
  type: 'CARE_GAP_EXCLUDED',
  payload: { gapId, reason },
});

export const careGapReopened = (
  gapId: string,
  reason: 'result-expired' | 'new-measurement-period' | 'manual'
): CareGapAction => ({
  type: 'CARE_GAP_REOPENED',
  payload: { gapId, reason },
});

export const careGapsRefreshed = (gaps: CareGapInstance[]): CareGapAction => ({
  type: 'CARE_GAPS_REFRESHED',
  payload: { gaps },
});

// ============================================================================
// Session Action Creators
// ============================================================================

export const modeChanged = (to: Mode, trigger: 'user' | 'auto'): SessionAction => ({
  type: 'MODE_CHANGED',
  payload: { to, trigger },
});

export const transcriptionStarted = (): SessionAction => ({
  type: 'TRANSCRIPTION_STARTED',
  payload: {},
});

export const transcriptionPaused = (): SessionAction => ({
  type: 'TRANSCRIPTION_PAUSED',
  payload: {},
});

export const transcriptionStopped = (): SessionAction => ({
  type: 'TRANSCRIPTION_STOPPED',
  payload: {},
});

export const transcriptionSegmentReceived = (
  segment: TranscriptSegment
): SessionAction => ({
  type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
  payload: { segment },
});

export const encounterOpened = (
  encounterId: string,
  patient: PatientContext,
  encounter: EncounterMeta,
  visit?: VisitMeta
): SessionAction => ({
  type: 'ENCOUNTER_OPENED',
  payload: { encounterId, patient, encounter, visit },
});

export const encounterClosed = (save: boolean): SessionAction => ({
  type: 'ENCOUNTER_CLOSED',
  payload: { save },
});

// ============================================================================
// Collaboration Action Creators
// ============================================================================

export const handoffInitiated = (to: User, role: Role): CollaborationAction => ({
  type: 'HANDOFF_INITIATED',
  payload: { to, role },
});

export const handoffAccepted = (by: User): CollaborationAction => ({
  type: 'HANDOFF_ACCEPTED',
  payload: { by },
});

export const itemLockAcquired = (
  itemId: string,
  userId: string
): CollaborationAction => ({
  type: 'ITEM_LOCK_ACQUIRED',
  payload: { itemId, userId },
});

export const itemLockReleased = (itemId: string): CollaborationAction => ({
  type: 'ITEM_LOCK_RELEASED',
  payload: { itemId },
});

// ============================================================================
// Sync Action Creators
// ============================================================================

export const syncStarted = (): SyncAction => ({
  type: 'SYNC_STARTED',
  payload: {},
});

export const syncCompleted = (serverVersion: number): SyncAction => ({
  type: 'SYNC_COMPLETED',
  payload: { serverVersion },
});

export const syncFailed = (error: string, retryable: boolean): SyncAction => ({
  type: 'SYNC_FAILED',
  payload: { error, retryable },
});

export const syncConflictDetected = (
  itemId: string,
  local: unknown,
  server: unknown
): SyncAction => ({
  type: 'SYNC_CONFLICT_DETECTED',
  payload: { itemId, local, server },
});

export const syncConflictResolved = (
  itemId: string,
  resolution: 'local' | 'server' | 'merge'
): SyncAction => ({
  type: 'SYNC_CONFLICT_RESOLVED',
  payload: { itemId, resolution },
});
