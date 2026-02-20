/**
 * Process View Selectors
 *
 * Selectors that join chart items with their processing tasks for the
 * operational batch view. Also provides completeness checklist and
 * mock E&M level calculation.
 */

import type { EncounterState } from '../types';
import type {
  ChartItem,
  ItemCategory,
  BackgroundTask,
  MedicationItem,
  LabItem,
  ImagingItem,
  ReferralItem,
  AIDraft,
} from '../../types';
import type { BatchAggregateStatus, BatchType } from '../../types/drafts';
import { selectAllItems, selectAllTasks } from './entities';
import { selectActiveDrafts } from './drafts';

// ============================================================================
// Types
// ============================================================================

/** A processing step derived from a task's lifecycle */
export interface ProcessingStep {
  label: string;
  status: 'complete' | 'pending' | 'active' | 'failed';
  taskId?: string;
}

/** An item with its processing context for the Process view */
export interface ProcessViewItem {
  item: ChartItem;
  tasks: BackgroundTask[];
  processingSteps: ProcessingStep[];
  nextAction?: { label: string; actionType: string; taskId?: string };
}

/** A sub-group within a batch (e.g., "In-House", "Quest") */
export interface SubGroup {
  label: string;
  key: string;
  items: ProcessViewItem[];
}

/** A full batch for the Process view */
export interface ProcessBatch {
  type: BatchType;
  label: string;
  subGroups: SubGroup[];
  aggregateStatus: BatchAggregateStatus;
  totalCount: number;
}

/** Completeness checklist item */
export interface ChecklistItem {
  id: string;
  label: string;
  categories: ItemCategory[];
  status: 'documented' | 'pending' | 'not-documented';
  itemCount: number;
}

/** Mock E&M level */
export interface EMLevel {
  code: string;
  level: number;
  description: string;
  elements: EMElement[];
}

export interface EMElement {
  name: string;
  documented: boolean;
  detail?: string;
}

// ============================================================================
// Batch Selectors
// ============================================================================

/**
 * Select all process view batches — items organized by operational category
 * with their associated tasks joined in.
 */
export function selectProcessViewBatches(state: EncounterState): ProcessBatch[] {
  const allItems = selectAllItems(state);
  const allTasks = selectAllTasks(state);
  const taskToItem = state.relationships.taskToItem;

  // Build a map: itemId → tasks
  const tasksByItemId: Record<string, BackgroundTask[]> = {};
  for (const task of allTasks) {
    const itemId = task.trigger.itemId || taskToItem[task.id];
    if (itemId) {
      if (!tasksByItemId[itemId]) tasksByItemId[itemId] = [];
      tasksByItemId[itemId].push(task);
    }
  }

  // Filter items by batch category
  const medications = allItems.filter((i): i is MedicationItem => i.category === 'medication');
  const labs = allItems.filter((i): i is LabItem => i.category === 'lab');
  const imaging = allItems.filter((i): i is ImagingItem => i.category === 'imaging');
  const referrals = allItems.filter((i): i is ReferralItem => i.category === 'referral');

  return [
    buildMedicationBatch(medications, tasksByItemId),
    buildLabBatch(labs, tasksByItemId),
    buildImagingBatch(imaging, tasksByItemId),
    buildReferralBatch(referrals, tasksByItemId),
  ];
}

/**
 * Select only non-empty process view batches.
 */
export function selectNonEmptyProcessBatches(state: EncounterState): ProcessBatch[] {
  return selectProcessViewBatches(state).filter(b => b.totalCount > 0);
}

/**
 * Select active AI drafts for the draft section.
 */
export function selectProcessViewDrafts(state: EncounterState): AIDraft[] {
  return selectActiveDrafts(state);
}

/**
 * Select count of items needing attention across all batches + drafts.
 */
export function selectOutstandingItemCount(state: EncounterState): number {
  const batches = selectProcessViewBatches(state);
  const drafts = selectProcessViewDrafts(state);

  let count = 0;

  // Count items with pending tasks
  for (const batch of batches) {
    for (const group of batch.subGroups) {
      for (const pvi of group.items) {
        const hasNeedsAttention = pvi.tasks.some(
          t => t.status === 'pending-review' || t.status === 'failed'
        );
        const hasPending = pvi.tasks.some(
          t => t.status === 'queued' || t.status === 'processing'
        );
        if (hasNeedsAttention || hasPending) count++;
      }
    }
  }

  // Count pending drafts
  count += drafts.filter(d => d.status === 'pending').length;

  return count;
}

// ============================================================================
// Completeness Checklist
// ============================================================================

const CHECKLIST_SECTIONS: { id: string; label: string; categories: ItemCategory[] }[] = [
  { id: 'cc', label: 'Chief Complaint', categories: ['chief-complaint'] },
  { id: 'hpi', label: 'HPI', categories: ['hpi'] },
  { id: 'ros', label: 'Review of Systems', categories: ['ros'] },
  { id: 'pe', label: 'Physical Exam', categories: ['physical-exam'] },
  { id: 'assessment', label: 'Assessment', categories: ['diagnosis'] },
  { id: 'plan', label: 'Plan', categories: ['plan'] },
  { id: 'orders', label: 'Orders', categories: ['medication', 'lab', 'imaging', 'referral', 'procedure'] },
  { id: 'instructions', label: 'Instructions', categories: ['instruction'] },
];

/**
 * Select encounter completeness checklist.
 */
export function selectCompletenessChecklist(state: EncounterState): ChecklistItem[] {
  const allItems = selectAllItems(state);

  return CHECKLIST_SECTIONS.map(section => {
    const sectionItems = allItems.filter(item =>
      section.categories.includes(item.category)
    );

    let status: ChecklistItem['status'];
    if (sectionItems.length === 0) {
      status = 'not-documented';
    } else if (sectionItems.some(i => i.status === 'pending-review' || i.status === 'draft')) {
      status = 'pending';
    } else {
      status = 'documented';
    }

    return {
      id: section.id,
      label: section.label,
      categories: section.categories,
      status,
      itemCount: sectionItems.length,
    };
  });
}

// ============================================================================
// Mock E&M Level
// ============================================================================

/**
 * Mock E&M level calculation based on documented elements.
 * In reality this would use MDM (Medical Decision Making) or 1995/1997 guidelines.
 * This is purely informational.
 */
export function selectMockEMLevel(state: EncounterState): EMLevel {
  const allItems = selectAllItems(state);

  const elements: EMElement[] = [
    {
      name: 'History (CC + HPI)',
      documented: allItems.some(i => i.category === 'chief-complaint' || i.category === 'hpi'),
      detail: getHistoryDetail(allItems),
    },
    {
      name: 'Review of Systems',
      documented: allItems.some(i => i.category === 'ros'),
    },
    {
      name: 'Physical Exam',
      documented: allItems.some(i => i.category === 'physical-exam'),
      detail: getExamDetail(allItems),
    },
    {
      name: 'Assessment (Diagnosis)',
      documented: allItems.some(i => i.category === 'diagnosis'),
      detail: `${allItems.filter(i => i.category === 'diagnosis').length} diagnosis(es)`,
    },
    {
      name: 'Plan / Orders',
      documented: allItems.some(i =>
        ['medication', 'lab', 'imaging', 'procedure', 'referral', 'plan'].includes(i.category)
      ),
      detail: getPlanDetail(allItems),
    },
    {
      name: 'Instructions',
      documented: allItems.some(i => i.category === 'instruction'),
    },
  ];

  const documentedCount = elements.filter(e => e.documented).length;

  // Simplified E&M mapping
  let level: number;
  let code: string;
  let description: string;

  if (documentedCount <= 1) {
    level = 1;
    code = '99211';
    description = 'Level 1 — Minimal';
  } else if (documentedCount === 2) {
    level = 2;
    code = '99212';
    description = 'Level 2 — Straightforward';
  } else if (documentedCount === 3) {
    level = 3;
    code = '99213';
    description = 'Level 3 — Low Complexity';
  } else if (documentedCount <= 5) {
    level = 4;
    code = '99214';
    description = 'Level 4 — Moderate Complexity';
  } else {
    level = 5;
    code = '99215';
    description = 'Level 5 — High Complexity';
  }

  return { code, level, description, elements };
}

// ============================================================================
// Helpers
// ============================================================================

function getHistoryDetail(items: ChartItem[]): string {
  const hasCC = items.some(i => i.category === 'chief-complaint');
  const hasHPI = items.some(i => i.category === 'hpi');
  if (hasCC && hasHPI) return 'CC + HPI documented';
  if (hasCC) return 'CC only';
  if (hasHPI) return 'HPI only';
  return '';
}

function getExamDetail(items: ChartItem[]): string {
  const examItems = items.filter(i => i.category === 'physical-exam');
  if (examItems.length === 0) return '';
  return `${examItems.length} system(s) examined`;
}

function getPlanDetail(items: ChartItem[]): string {
  const parts: string[] = [];
  const meds = items.filter(i => i.category === 'medication').length;
  const labs = items.filter(i => i.category === 'lab').length;
  const imaging = items.filter(i => i.category === 'imaging').length;
  if (meds) parts.push(`${meds} Rx`);
  if (labs) parts.push(`${labs} Lab`);
  if (imaging) parts.push(`${imaging} Img`);
  return parts.join(', ') || '';
}

/** Build a ProcessViewItem by joining an item with its tasks */
function buildProcessViewItem(
  item: ChartItem,
  tasksByItemId: Record<string, BackgroundTask[]>
): ProcessViewItem {
  const tasks = tasksByItemId[item.id] || [];
  const processingSteps = deriveProcessingSteps(tasks);
  const nextAction = deriveNextAction(item, tasks);

  return { item, tasks, processingSteps, nextAction };
}

/** Derive processing steps from tasks */
function deriveProcessingSteps(tasks: BackgroundTask[]): ProcessingStep[] {
  return tasks.map(task => ({
    label: task.displayTitle,
    status: mapTaskStatusToStepStatus(task.status),
    taskId: task.id,
  }));
}

function mapTaskStatusToStepStatus(
  taskStatus: BackgroundTask['status']
): ProcessingStep['status'] {
  switch (taskStatus) {
    case 'completed':
      return 'complete';
    case 'processing':
    case 'queued':
      return 'active';
    case 'failed':
      return 'failed';
    default:
      return 'pending';
  }
}

/** Derive the next action for an item based on its tasks */
function deriveNextAction(
  item: ChartItem,
  tasks: BackgroundTask[]
): ProcessViewItem['nextAction'] {
  // Check for tasks needing review first
  const needsReview = tasks.find(t => t.status === 'pending-review');
  if (needsReview) {
    return { label: 'Review', actionType: 'review', taskId: needsReview.id };
  }

  // Check for failed tasks
  const failed = tasks.find(t => t.status === 'failed');
  if (failed) {
    return { label: 'Retry', actionType: 'retry', taskId: failed.id };
  }

  // Check for items needing Dx association
  if (item.linkedDiagnoses.length === 0 && needsDxAssociation(item.category)) {
    return { label: 'Associate Dx', actionType: 'associate-dx' };
  }

  // Check for ready-to-send tasks
  const ready = tasks.find(t => t.status === 'ready');
  if (ready) {
    return { label: 'Send', actionType: 'send', taskId: ready.id };
  }

  return undefined;
}

function needsDxAssociation(category: ItemCategory): boolean {
  return ['medication', 'lab', 'imaging', 'referral', 'procedure'].includes(category);
}

// ============================================================================
// Batch Builders
// ============================================================================

function buildMedicationBatch(
  medications: MedicationItem[],
  tasksByItemId: Record<string, BackgroundTask[]>
): ProcessBatch {
  // Sub-group by pharmacy
  const inHouse: ProcessViewItem[] = [];
  const byPharmacy: Record<string, ProcessViewItem[]> = {};

  for (const med of medications) {
    const pvi = buildProcessViewItem(med, tasksByItemId);
    const pharmacy = med.data?.pharmacy;

    if (!pharmacy || pharmacy.name.toLowerCase().includes('in-house') || pharmacy.name.toLowerCase().includes('dispensary')) {
      inHouse.push(pvi);
    } else {
      const key = pharmacy.name;
      if (!byPharmacy[key]) byPharmacy[key] = [];
      byPharmacy[key].push(pvi);
    }
  }

  const subGroups: SubGroup[] = [];
  if (inHouse.length > 0) {
    subGroups.push({ label: 'In-House Dispensary', key: 'in-house', items: inHouse });
  }
  for (const [name, items] of Object.entries(byPharmacy)) {
    subGroups.push({ label: name, key: name.toLowerCase().replace(/\s+/g, '-'), items });
  }
  // If no pharmacy info, put all in a default group
  if (subGroups.length === 0 && medications.length > 0) {
    subGroups.push({
      label: 'Prescriptions',
      key: 'default',
      items: medications.map(m => buildProcessViewItem(m, tasksByItemId)),
    });
  }

  const totalCount = medications.length;

  return {
    type: 'prescriptions',
    label: 'Prescriptions',
    subGroups,
    aggregateStatus: computeBatchAggregateStatus(subGroups),
    totalCount,
  };
}

function buildLabBatch(
  labs: LabItem[],
  tasksByItemId: Record<string, BackgroundTask[]>
): ProcessBatch {
  const inHouse: ProcessViewItem[] = [];
  const byVendor: Record<string, ProcessViewItem[]> = {};

  for (const lab of labs) {
    const pvi = buildProcessViewItem(lab, tasksByItemId);
    if (lab.data?.collectionType === 'in-house') {
      inHouse.push(pvi);
    } else {
      const vendor = lab.data?.labVendor || 'Send-Out';
      if (!byVendor[vendor]) byVendor[vendor] = [];
      byVendor[vendor].push(pvi);
    }
  }

  const subGroups: SubGroup[] = [];
  if (inHouse.length > 0) {
    subGroups.push({ label: 'In-House', key: 'in-house', items: inHouse });
  }
  for (const [vendor, items] of Object.entries(byVendor)) {
    subGroups.push({ label: vendor, key: vendor.toLowerCase().replace(/\s+/g, '-'), items });
  }

  return {
    type: 'labs',
    label: 'Labs',
    subGroups,
    aggregateStatus: computeBatchAggregateStatus(subGroups),
    totalCount: labs.length,
  };
}

function buildImagingBatch(
  imagingItems: ImagingItem[],
  tasksByItemId: Record<string, BackgroundTask[]>
): ProcessBatch {
  const inHouse: ProcessViewItem[] = [];
  const byFacility: Record<string, ProcessViewItem[]> = {};

  for (const img of imagingItems) {
    const pvi = buildProcessViewItem(img, tasksByItemId);
    const facility = img.data?.facility;
    if (!facility || facility.name.toLowerCase().includes('in-house')) {
      inHouse.push(pvi);
    } else {
      const key = facility.name;
      if (!byFacility[key]) byFacility[key] = [];
      byFacility[key].push(pvi);
    }
  }

  const subGroups: SubGroup[] = [];
  if (inHouse.length > 0) {
    subGroups.push({ label: 'In-House', key: 'in-house', items: inHouse });
  }
  for (const [name, items] of Object.entries(byFacility)) {
    subGroups.push({ label: name, key: name.toLowerCase().replace(/\s+/g, '-'), items });
  }

  return {
    type: 'imaging',
    label: 'Imaging',
    subGroups,
    aggregateStatus: computeBatchAggregateStatus(subGroups),
    totalCount: imagingItems.length,
  };
}

function buildReferralBatch(
  referrals: ReferralItem[],
  tasksByItemId: Record<string, BackgroundTask[]>
): ProcessBatch {
  // Referrals are flat (no sub-grouping per spec)
  const items = referrals.map(r => buildProcessViewItem(r, tasksByItemId));
  const subGroups: SubGroup[] = items.length > 0
    ? [{ label: 'Referrals', key: 'referrals', items }]
    : [];

  return {
    type: 'referrals',
    label: 'Referrals',
    subGroups,
    aggregateStatus: computeBatchAggregateStatus(subGroups),
    totalCount: referrals.length,
  };
}

function computeBatchAggregateStatus(subGroups: SubGroup[]): BatchAggregateStatus {
  const allItems = subGroups.flatMap(g => g.items);
  if (allItems.length === 0) return 'idle';

  const allTasks = allItems.flatMap(i => i.tasks);
  if (allTasks.length === 0) return 'idle';

  const hasNeedsAttention = allTasks.some(
    t => t.status === 'pending-review' || t.status === 'failed'
  );
  if (hasNeedsAttention) return 'needs-attention';

  const hasActive = allTasks.some(
    t => t.status === 'processing' || t.status === 'queued'
  );
  if (hasActive) return 'in-progress';

  const allComplete = allTasks.every(
    t => t.status === 'completed' || t.status === 'cancelled'
  );
  if (allComplete) return 'complete';

  return 'idle';
}
