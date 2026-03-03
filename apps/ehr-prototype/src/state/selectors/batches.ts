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
  StatusBreakdown,
  AIDraft,
} from '../../types/drafts';
import { selectAllTasks } from './entities';
import { selectActiveDrafts } from './drafts';
import { selectMockEMLevel } from './process-view';

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

  const emLevel = selectMockEMLevel(state);

  return [
    buildDraftBatch(activeDrafts),
    buildTaskBatch('prescriptions', 'Rx', rxTasks),
    buildTaskBatch('labs', 'Labs', labTasks),
    buildTaskBatch('imaging', 'Imaging', imagingTasks),
    buildTaskBatch('referrals', 'Referrals', referralTasks),
    buildVisitNoteBatch(activeDrafts),
    buildChargeNavBatch(emLevel),
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
    statusBreakdown: computeDraftBreakdown(drafts),
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
    statusBreakdown: computeTaskBreakdown(tasks),
    count: items.length,
  };
}

function computeDraftAggregateStatus(
  drafts: import('../../types/drafts').AIDraft[]
): BatchAggregateStatus {
  if (drafts.length === 0) return 'idle';
  const hasPending = drafts.some(d => d.status === 'pending');
  const hasGenerating = drafts.some(d => d.status === 'generating' || d.status === 'updating');
  if (hasPending) return 'needs-attention';
  if (hasGenerating) return 'in-progress';
  return 'idle';
}

function computeDraftBreakdown(
  drafts: import('../../types/drafts').AIDraft[]
): StatusBreakdown {
  let inProgress = 0;
  let needsAttention = 0;
  for (const d of drafts) {
    if (d.status === 'generating' || d.status === 'updating') inProgress++;
    else if (d.status === 'pending') needsAttention++;
  }
  return { inProgress, needsAttention, complete: 0 };
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

function computeTaskBreakdown(tasks: BackgroundTask[]): StatusBreakdown {
  let inProgress = 0;
  let needsAttention = 0;
  let complete = 0;
  for (const t of tasks) {
    if (t.status === 'queued' || t.status === 'processing') inProgress++;
    else if (t.status === 'pending-review' || t.status === 'failed') needsAttention++;
    else if (t.status === 'ready') complete++;
  }
  return { inProgress, needsAttention, complete };
}

/**
 * Build a Visit Note batch from active drafts.
 * Surfaces narrative drafts (HPI, Assessment, Plan, Note) as a first-class
 * processing row alongside operational batches.
 */
function buildVisitNoteBatch(drafts: AIDraft[]): BatchSummary {
  // Only include drafts with category 'note' — other categories route to
  // their respective documentation rows via selectUnifiedRailRows.
  const noteDrafts = drafts.filter(d => d.category === 'note');

  const items: BatchItem[] = noteDrafts.map(d => ({
    kind: 'draft' as const,
    draftId: d.id,
    label: d.label,
    preview: d.content.substring(0, 60) + (d.content.length > 60 ? '...' : ''),
    status: d.status,
  }));

  const hasPending = noteDrafts.some(d => d.status === 'pending');
  const hasActive = noteDrafts.some(d => d.status === 'generating' || d.status === 'updating');

  let aggregateStatus: BatchAggregateStatus = 'idle';
  if (hasPending) aggregateStatus = 'needs-attention';
  else if (hasActive) aggregateStatus = 'in-progress';

  return {
    type: 'visit-note',
    label: 'Visit Note',
    items,
    aggregateStatus,
    statusBreakdown: computeDraftBreakdown(noteDrafts),
    count: items.length,
  };
}

/**
 * Build a Charge Nav batch from the computed E&M level.
 * Shows the auto-calculated E&M code as a single-item processing row.
 */
function buildChargeNavBatch(
  emLevel: import('./process-view').EMLevel
): BatchSummary {
  const hasItems = emLevel.elements.some(e => e.documented);
  const items: BatchItem[] = hasItems
    ? [{
        kind: 'task' as const,
        taskId: 'em-level',
        label: `${emLevel.code} — ${emLevel.description.split(' — ')[1] || emLevel.description}`,
        status: 'complete',
      }]
    : [];

  return {
    type: 'charge-nav',
    label: 'Charge Nav',
    items,
    aggregateStatus: hasItems ? 'complete' : 'idle',
    statusBreakdown: { inProgress: 0, needsAttention: 0, complete: hasItems ? 1 : 0 },
    count: hasItems ? 1 : 0,
  };
}
