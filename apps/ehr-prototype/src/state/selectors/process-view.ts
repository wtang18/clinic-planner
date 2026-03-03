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
import type { BatchAggregateStatus, BatchType, RailRow, RailGroup, StatusBreakdown, BatchItem } from '../../types/drafts';
import { selectAllItems, selectAllTasks } from './entities';
import { selectActiveDrafts } from './drafts';
import { selectProcessingBatches } from './batches';

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
  { id: 'sign-off', label: 'Sign-off', categories: [] },  // special case — derived from blockers
];

/**
 * Select encounter completeness checklist.
 */
export function selectCompletenessChecklist(state: EncounterState): ChecklistItem[] {
  const allItems = selectAllItems(state);

  return CHECKLIST_SECTIONS.map(section => {
    // Sign-off is a special case — derived from blocker conditions, not chart items
    if (section.id === 'sign-off') {
      return computeSignOffChecklistItem(allItems);
    }

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

/**
 * Compute sign-off checklist status from blocker conditions.
 * Mirrors the logic in useReviewView's signOffBlockers.
 */
function computeSignOffChecklistItem(allItems: ChartItem[]): ChecklistItem {
  const hasUnreviewedAI = allItems.some(i => i._meta?.reviewed === false);
  const hasPendingReview = allItems.some(i => i.status === 'pending-review');
  const hasDiagnosis = allItems.some(i => i.category === 'diagnosis');
  const hasNote = allItems.some(i => i.category === 'note');

  // Error-level blockers prevent sign-off
  const hasErrorBlockers = hasUnreviewedAI || hasPendingReview;
  // Warning-level: missing dx or note
  const hasWarnings = !hasDiagnosis || !hasNote;

  let status: ChecklistItem['status'];
  let blockerCount = 0;

  if (hasErrorBlockers) {
    status = 'not-documented';
    if (hasUnreviewedAI) blockerCount++;
    if (hasPendingReview) blockerCount++;
  } else if (hasWarnings) {
    status = 'pending';
    if (!hasDiagnosis) blockerCount++;
    if (!hasNote) blockerCount++;
  } else {
    status = 'documented';
  }

  return {
    id: 'sign-off',
    label: 'Sign-off',
    categories: [],
    status,
    itemCount: blockerCount,
  };
}

// ============================================================================
// Unified Rail Rows
// ============================================================================

/**
 * Row definition — static config for each of the 14 unified rail rows.
 * `checklistId`: maps to a completeness checklist item (documentation rows)
 * `batchType`: maps to a processing batch (order/processing rows)
 * Exactly one of these should be non-null per row.
 */
interface RailRowDef {
  id: string;
  label: string;
  group: RailGroup;
  /** Completeness checklist id (for documentation rows) */
  checklistId: string | null;
  /** Processing batch type (for order/processing rows) */
  batchType: BatchType | null;
  /** Categories whose chart items contribute to this row's presence */
  categories: ItemCategory[];
  /** Navigation target on row tap */
  deepLink: { mode: 'review' | 'process'; sectionId: string };
}

const RAIL_ROW_DEFS: RailRowDef[] = [
  // History
  { id: 'cc', label: 'Chief Complaint', group: 'history', checklistId: 'cc', batchType: null, categories: ['chief-complaint'], deepLink: { mode: 'review', sectionId: 'cc-hpi' } },
  { id: 'hpi', label: 'HPI', group: 'history', checklistId: 'hpi', batchType: null, categories: ['hpi'], deepLink: { mode: 'review', sectionId: 'cc-hpi' } },
  { id: 'ros', label: 'ROS', group: 'history', checklistId: 'ros', batchType: null, categories: ['ros'], deepLink: { mode: 'review', sectionId: 'ros' } },
  { id: 'pe', label: 'Physical Exam', group: 'history', checklistId: 'pe', batchType: null, categories: ['physical-exam'], deepLink: { mode: 'review', sectionId: 'pe' } },
  // Reasoning
  { id: 'assessment', label: 'Assessment', group: 'reasoning', checklistId: 'assessment', batchType: null, categories: ['diagnosis'], deepLink: { mode: 'review', sectionId: 'assessment' } },
  { id: 'plan', label: 'Plan', group: 'reasoning', checklistId: 'plan', batchType: null, categories: ['plan'], deepLink: { mode: 'review', sectionId: 'plan' } },
  // Orders
  { id: 'prescriptions', label: 'Rx', group: 'orders', checklistId: null, batchType: 'prescriptions', categories: ['medication'], deepLink: { mode: 'process', sectionId: 'prescriptions' } },
  { id: 'labs', label: 'Labs', group: 'orders', checklistId: null, batchType: 'labs', categories: ['lab'], deepLink: { mode: 'process', sectionId: 'labs' } },
  { id: 'imaging', label: 'Imaging', group: 'orders', checklistId: null, batchType: 'imaging', categories: ['imaging'], deepLink: { mode: 'process', sectionId: 'imaging' } },
  { id: 'referrals', label: 'Referrals', group: 'orders', checklistId: null, batchType: 'referrals', categories: ['referral'], deepLink: { mode: 'process', sectionId: 'referrals' } },
  // Documentation
  { id: 'instructions', label: 'Instructions', group: 'documentation', checklistId: 'instructions', batchType: null, categories: ['instruction'], deepLink: { mode: 'review', sectionId: 'plan' } },
  { id: 'visit-note', label: 'Visit Note', group: 'documentation', checklistId: null, batchType: 'visit-note', categories: ['note'], deepLink: { mode: 'process', sectionId: 'visit-note' } },
  // Closure
  { id: 'charge-nav', label: 'Charge Nav', group: 'closure', checklistId: null, batchType: 'charge-nav', categories: [], deepLink: { mode: 'review', sectionId: 'charge-nav' } },
  { id: 'sign-off', label: 'Sign-off', group: 'closure', checklistId: 'sign-off', batchType: null, categories: [], deepLink: { mode: 'review', sectionId: 'sign-off' } },
];

/** Rows that always show a presence icon (expected documentation sections) */
const ALWAYS_SHOW_PRESENCE = new Set(['cc', 'hpi', 'ros', 'pe', 'assessment', 'plan', 'sign-off']);

/**
 * Select the unified rail rows — 14 rows combining completeness and processing
 * dimensions into a single scannable list grouped by clinical workflow phase.
 *
 * Each row has:
 * - Left side: presence icon (✓ dark / ○ gray) for documentation rows,
 *   or null for processing rows (component shows chevron when items exist)
 * - Right side: item count, processing chips, special label, or "—"
 */
export function selectUnifiedRailRows(state: EncounterState): RailRow[] {
  const allItems = selectAllItems(state);
  const checklist = selectCompletenessChecklist(state);
  const batches = selectProcessingBatches(state);
  const emLevel = selectMockEMLevel(state);
  const activeDrafts = selectActiveDrafts(state);

  const checklistMap = new Map(checklist.map(c => [c.id, c]));
  const batchMap = new Map(batches.map(b => [b.type, b]));

  // Build category → active drafts map for routing drafts to documentation rows
  const draftsByCategory = new Map<string, AIDraft[]>();
  for (const draft of activeDrafts) {
    const existing = draftsByCategory.get(draft.category) || [];
    existing.push(draft);
    draftsByCategory.set(draft.category, existing);
  }

  // Count chart items per category for presence checks on processing rows
  const categoryItemCount: Record<string, number> = {};
  for (const item of allItems) {
    categoryItemCount[item.category] = (categoryItemCount[item.category] || 0) + 1;
  }

  return RAIL_ROW_DEFS.map(def => {
    // Documentation row — presence from completeness checklist + draft routing
    if (def.checklistId !== null) {
      const cl = checklistMap.get(def.checklistId);
      const alwaysShow = ALWAYS_SHOW_PRESENCE.has(def.id);

      // Find active drafts matching this row's categories
      const matchingDrafts: AIDraft[] = [];
      for (const cat of def.categories) {
        const catDrafts = draftsByCategory.get(cat);
        if (catDrafts) matchingDrafts.push(...catDrafts);
      }

      // Build processing data from matching drafts
      let processing: RailRow['processing'] = null;
      if (matchingDrafts.length > 0) {
        processing = {
          chips: computeDraftBreakdownLocal(matchingDrafts),
          items: matchingDrafts.map(d => ({
            kind: 'draft' as const,
            draftId: d.id,
            label: d.label,
            preview: d.content.substring(0, 60) + (d.content.length > 60 ? '...' : ''),
            status: d.status,
            deepLink: { mode: 'process' as const, sectionId: 'visit-note' },
          })),
        };
      }

      let presence: RailRow['presence'];
      if (cl) {
        const hasActiveDrafts = matchingDrafts.length > 0;
        if (cl.status === 'documented' && !hasActiveDrafts) {
          presence = 'present';
        } else if (alwaysShow || cl.itemCount > 0 || hasActiveDrafts) {
          presence = 'not-present';
        } else {
          presence = null;
        }
      } else {
        presence = alwaysShow ? 'not-present' : null;
      }

      return {
        id: def.id,
        label: def.label,
        group: def.group,
        presence,
        itemCount: cl?.itemCount ?? 0,
        processing,
        deepLink: def.deepLink,
        blockerCount: def.id === 'sign-off' ? cl?.itemCount : undefined,
      };
    }

    // Processing row — presence + processing from batch data
    const batch = def.batchType ? batchMap.get(def.batchType) : undefined;
    const chartItemsExist = def.categories.some(cat => (categoryItemCount[cat] || 0) > 0);

    // Charge Nav special case — E&M code as label
    if (def.id === 'charge-nav') {
      const hasEM = emLevel.elements.some(e => e.documented);
      return {
        id: def.id,
        label: def.label,
        group: def.group,
        presence: hasEM ? 'present' : null,
        itemCount: 0,
        processing: null,
        deepLink: def.deepLink,
        specialLabel: hasEM ? emLevel.code : undefined,
      };
    }

    // Standard processing row
    const hasActiveProcessing = batch
      ? batch.statusBreakdown.inProgress > 0 || batch.statusBreakdown.needsAttention > 0
      : false;
    const hasItems = batch ? batch.count > 0 : false;

    let presence: RailRow['presence'];
    if (chartItemsExist && !hasActiveProcessing) {
      presence = 'present';
    } else if (chartItemsExist || hasItems) {
      presence = 'not-present';
    } else {
      presence = null;
    }

    return {
      id: def.id,
      label: def.label,
      group: def.group,
      presence,
      itemCount: def.categories.reduce((sum, cat) => sum + (categoryItemCount[cat] || 0), 0),
      processing: batch && batch.count > 0
        ? {
            chips: batch.statusBreakdown,
            items: batch.items.map(item => ({
              ...item,
              deepLink: def.deepLink,
            })),
          }
        : null,
      deepLink: def.deepLink,
    };
  });
}

/** The rail group display order */
export const RAIL_GROUPS: RailGroup[] = ['history', 'reasoning', 'orders', 'documentation', 'closure'];

/** Local draft breakdown to avoid circular import with batches.ts */
function computeDraftBreakdownLocal(drafts: AIDraft[]): StatusBreakdown {
  let inProgress = 0;
  let needsAttention = 0;
  for (const d of drafts) {
    if (d.status === 'generating' || d.status === 'updating') inProgress++;
    else if (d.status === 'pending') needsAttention++;
  }
  return { inProgress, needsAttention, complete: 0 };
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
