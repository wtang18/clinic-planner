/**
 * Batch Grouping Selectors
 *
 * Combines tasks and drafts into operational batch summaries for the Processing Rail.
 * Each batch groups items by how they get executed physically in the clinic.
 */

import type { EncounterState } from '../types';
import type { BackgroundTask } from '../../types/suggestions';
import type {
  BatchSummary,
  BatchItem,
  BatchAggregateStatus,
  BatchType,
} from '../../types/drafts';
import { selectAllTasks } from './entities';
import { selectActiveDrafts } from './drafts';

// ============================================================================
// Batch Selectors
// ============================================================================

/**
 * Select all processing batches for the rail.
 * Returns batches in display order: AI Drafts, Prescriptions, Labs, Imaging, Referrals.
 * Empty batches are included (rail shows "--" for them).
 */
export function selectProcessingBatches(state: EncounterState): BatchSummary[] {
  const tasks = selectAllTasks(state);
  const activeDrafts = selectActiveDrafts(state);

  // Group tasks by their related item's category
  const itemsRecord = state.entities.items;
  const taskToItem = state.relationships.taskToItem;

  const rxTasks: BackgroundTask[] = [];
  const labTasks: BackgroundTask[] = [];
  const imagingTasks: BackgroundTask[] = [];
  const referralTasks: BackgroundTask[] = [];

  for (const task of tasks) {
    // Skip completed/cancelled/failed tasks from batch display
    if (task.status === 'completed' || task.status === 'cancelled') continue;

    const relatedItemId = task.trigger.itemId || taskToItem[task.id];
    const relatedItem = relatedItemId ? itemsRecord[relatedItemId] : undefined;

    if (relatedItem) {
      switch (relatedItem.category) {
        case 'medication':
          rxTasks.push(task);
          break;
        case 'lab':
          labTasks.push(task);
          break;
        case 'imaging':
          imagingTasks.push(task);
          break;
        case 'referral':
          referralTasks.push(task);
          break;
      }
    } else if (task.type === 'rx-send' || task.type === 'drug-interaction' || task.type === 'formulary-check') {
      rxTasks.push(task);
    } else if (task.type === 'lab-send') {
      labTasks.push(task);
    }
  }

  return [
    buildDraftBatch(activeDrafts),
    buildTaskBatch('prescriptions', 'Prescriptions', rxTasks),
    buildTaskBatch('labs', 'Labs', labTasks),
    buildTaskBatch('imaging', 'Imaging', imagingTasks),
    buildTaskBatch('referrals', 'Referrals', referralTasks),
  ];
}

/**
 * Select only non-empty batches (for compact rail display).
 */
export function selectNonEmptyBatches(state: EncounterState): BatchSummary[] {
  return selectProcessingBatches(state).filter(b => b.count > 0);
}

/**
 * Select total count of items needing attention across all batches.
 */
export function selectTotalNeedsAttentionCount(state: EncounterState): number {
  const batches = selectProcessingBatches(state);
  return batches.reduce((sum, b) => {
    if (b.aggregateStatus === 'needs-attention') return sum + b.count;
    return sum;
  }, 0);
}

// ============================================================================
// Helpers
// ============================================================================

function buildDraftBatch(
  drafts: import('../../types/drafts').AIDraft[]
): BatchSummary {
  const items: BatchItem[] = drafts.map(d => ({
    kind: 'draft' as const,
    draftId: d.id,
    label: d.label,
    preview: d.content.substring(0, 60) + (d.content.length > 60 ? '...' : ''),
    status: d.status,
  }));

  return {
    type: 'ai-drafts',
    label: 'AI Drafts',
    items,
    aggregateStatus: computeDraftAggregateStatus(drafts),
    count: items.length,
  };
}

function buildTaskBatch(
  type: BatchType,
  label: string,
  tasks: BackgroundTask[]
): BatchSummary {
  const items: BatchItem[] = tasks.map(t => ({
    kind: 'task' as const,
    taskId: t.id,
    label: t.displayTitle,
    status: t.displayStatus,
  }));

  return {
    type,
    label,
    items,
    aggregateStatus: computeTaskAggregateStatus(tasks),
    count: items.length,
  };
}

function computeDraftAggregateStatus(
  drafts: import('../../types/drafts').AIDraft[]
): BatchAggregateStatus {
  if (drafts.length === 0) return 'idle';
  const hasPending = drafts.some(d => d.status === 'pending');
  const hasGenerating = drafts.some(d => d.status === 'generating');
  if (hasPending) return 'needs-attention';
  if (hasGenerating) return 'in-progress';
  return 'idle';
}

function computeTaskAggregateStatus(tasks: BackgroundTask[]): BatchAggregateStatus {
  if (tasks.length === 0) return 'idle';
  const hasPendingReview = tasks.some(t => t.status === 'pending-review');
  const hasFailed = tasks.some(t => t.status === 'failed');
  if (hasPendingReview || hasFailed) return 'needs-attention';
  const hasProcessing = tasks.some(t => t.status === 'processing' || t.status === 'queued');
  if (hasProcessing) return 'in-progress';
  const allReady = tasks.every(t => t.status === 'ready');
  if (allReady) return 'complete';
  return 'idle';
}
