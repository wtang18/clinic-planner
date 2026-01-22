/**
 * Type guard functions for action categories
 */

import type {
  EncounterAction,
  ChartItemAction,
  SuggestionAction,
  TaskAction,
  CareGapAction,
  SessionAction,
  CollaborationAction,
  SyncAction,
  CHART_ITEM_ACTION_TYPES,
  SUGGESTION_ACTION_TYPES,
  TASK_ACTION_TYPES,
  CARE_GAP_ACTION_TYPES,
  SESSION_ACTION_TYPES,
  COLLABORATION_ACTION_TYPES,
  SYNC_ACTION_TYPES,
} from './types';

// Helper type for action type strings
type ChartItemActionType = typeof CHART_ITEM_ACTION_TYPES[number];
type SuggestionActionType = typeof SUGGESTION_ACTION_TYPES[number];
type TaskActionType = typeof TASK_ACTION_TYPES[number];
type CareGapActionType = typeof CARE_GAP_ACTION_TYPES[number];
type SessionActionType = typeof SESSION_ACTION_TYPES[number];
type CollaborationActionType = typeof COLLABORATION_ACTION_TYPES[number];
type SyncActionType = typeof SYNC_ACTION_TYPES[number];

const CHART_ITEM_TYPES: ReadonlySet<string> = new Set([
  'ITEM_ADDED',
  'ITEM_UPDATED',
  'ITEM_CONFIRMED',
  'ITEM_CANCELLED',
  'ITEM_DX_LINKED',
  'ITEM_DX_UNLINKED',
  'ITEM_SENT',
  'ITEMS_BATCH_SENT',
  'ITEM_RESULT_RECEIVED',
]);

const SUGGESTION_TYPES: ReadonlySet<string> = new Set([
  'SUGGESTION_RECEIVED',
  'SUGGESTION_ACCEPTED',
  'SUGGESTION_ACCEPTED_WITH_CHANGES',
  'SUGGESTION_DISMISSED',
  'SUGGESTION_EXPIRED',
  'SUGGESTIONS_CLEARED',
]);

const TASK_TYPES: ReadonlySet<string> = new Set([
  'TASK_CREATED',
  'TASK_PROGRESS',
  'TASK_COMPLETED',
  'TASK_FAILED',
  'TASK_APPROVED',
  'TASK_REJECTED',
  'TASKS_BATCH_APPROVED',
]);

const CARE_GAP_TYPES: ReadonlySet<string> = new Set([
  'CARE_GAP_IDENTIFIED',
  'CARE_GAP_ADDRESSED',
  'CARE_GAP_CLOSED',
  'CARE_GAP_EXCLUDED',
  'CARE_GAP_REOPENED',
  'CARE_GAPS_REFRESHED',
]);

const SESSION_TYPES: ReadonlySet<string> = new Set([
  'MODE_CHANGED',
  'TRANSCRIPTION_STARTED',
  'TRANSCRIPTION_PAUSED',
  'TRANSCRIPTION_STOPPED',
  'TRANSCRIPTION_SEGMENT_RECEIVED',
  'ENCOUNTER_OPENED',
  'ENCOUNTER_CLOSED',
]);

const COLLABORATION_TYPES: ReadonlySet<string> = new Set([
  'HANDOFF_INITIATED',
  'HANDOFF_ACCEPTED',
  'ITEM_LOCK_ACQUIRED',
  'ITEM_LOCK_RELEASED',
]);

const SYNC_TYPES: ReadonlySet<string> = new Set([
  'SYNC_STARTED',
  'SYNC_COMPLETED',
  'SYNC_FAILED',
  'SYNC_CONFLICT_DETECTED',
  'SYNC_CONFLICT_RESOLVED',
]);

/**
 * Check if action is a chart item action
 */
export function isChartItemAction(action: EncounterAction): action is ChartItemAction {
  return CHART_ITEM_TYPES.has(action.type);
}

/**
 * Check if action is a suggestion action
 */
export function isSuggestionAction(action: EncounterAction): action is SuggestionAction {
  return SUGGESTION_TYPES.has(action.type);
}

/**
 * Check if action is a task action
 */
export function isTaskAction(action: EncounterAction): action is TaskAction {
  return TASK_TYPES.has(action.type);
}

/**
 * Check if action is a care gap action
 */
export function isCareGapAction(action: EncounterAction): action is CareGapAction {
  return CARE_GAP_TYPES.has(action.type);
}

/**
 * Check if action is a session action
 */
export function isSessionAction(action: EncounterAction): action is SessionAction {
  return SESSION_TYPES.has(action.type);
}

/**
 * Check if action is a collaboration action
 */
export function isCollaborationAction(action: EncounterAction): action is CollaborationAction {
  return COLLABORATION_TYPES.has(action.type);
}

/**
 * Check if action is a sync action
 */
export function isSyncAction(action: EncounterAction): action is SyncAction {
  return SYNC_TYPES.has(action.type);
}

/**
 * Get the category of an action
 */
export function getActionCategory(action: EncounterAction): string {
  if (isChartItemAction(action)) return 'chart-item';
  if (isSuggestionAction(action)) return 'suggestion';
  if (isTaskAction(action)) return 'task';
  if (isCareGapAction(action)) return 'care-gap';
  if (isSessionAction(action)) return 'session';
  if (isCollaborationAction(action)) return 'collaboration';
  if (isSyncAction(action)) return 'sync';
  return 'unknown';
}
