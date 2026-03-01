/**
 * Process View Selectors Tests — Phase 5
 *
 * Tests for:
 * 1. Batch grouping (items into correct batches)
 * 2. Sub-grouping (In-House vs vendor/pharmacy/facility)
 * 3. Completeness checklist (8 sections)
 * 4. E&M level (mock code based on documented elements)
 * 5. Outstanding item count
 * 6. Empty state handling
 */

import { describe, it, expect } from 'vitest';
import type { ChartItem, MedicationItem, LabItem, ImagingItem, ReferralItem, BackgroundTask } from '../../types';
import type { AIDraft } from '../../types/drafts';
import type { EncounterState } from '../../state/types';
import { createInitialState } from '../../state/initialState';
import {
  selectProcessViewBatches,
  selectNonEmptyProcessBatches,
  selectProcessViewDrafts,
  selectCompletenessChecklist,
  selectMockEMLevel,
  selectOutstandingItemCount,
} from '../../state/selectors/process-view';

// ============================================================================
// Test Helpers
// ============================================================================

function makeMedication(overrides?: Partial<MedicationItem>): MedicationItem {
  return {
    id: 'med-1',
    category: 'medication',
    displayText: 'Amoxicillin 500mg PO TID',
    displaySubtext: '#30, 0 refills',
    createdAt: new Date('2024-01-15T10:00:00'),
    createdBy: { id: 'dr-1', name: 'Dr. Anderson' },
    modifiedAt: new Date('2024-01-15T10:00:00'),
    modifiedBy: { id: 'dr-1', name: 'Dr. Anderson' },
    source: { type: 'manual' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: true },
    data: {
      drugName: 'Amoxicillin',
      dosage: '500mg',
      route: 'PO',
      frequency: 'TID',
      isControlled: false,
      prescriptionType: 'new' as const,
    },
    actions: ['e-prescribe'],
    ...overrides,
  } as MedicationItem;
}

function makeLab(overrides?: Partial<LabItem>): LabItem {
  return {
    id: 'lab-1',
    category: 'lab',
    displayText: 'CBC with Differential',
    createdAt: new Date('2024-01-15T10:01:00'),
    createdBy: { id: 'dr-1', name: 'Dr. Anderson' },
    modifiedAt: new Date('2024-01-15T10:01:00'),
    modifiedBy: { id: 'dr-1', name: 'Dr. Anderson' },
    source: { type: 'manual' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: true },
    data: {
      testName: 'CBC with Differential',
      priority: 'routine' as const,
      collectionType: 'in-house' as const,
      orderStatus: 'draft' as const,
    },
    ...overrides,
  } as LabItem;
}

function makeImaging(overrides?: Partial<ImagingItem>): ImagingItem {
  return {
    id: 'img-1',
    category: 'imaging',
    displayText: 'Chest X-ray PA/Lateral',
    createdAt: new Date('2024-01-15T10:02:00'),
    createdBy: { id: 'dr-1', name: 'Dr. Anderson' },
    modifiedAt: new Date('2024-01-15T10:02:00'),
    modifiedBy: { id: 'dr-1', name: 'Dr. Anderson' },
    source: { type: 'manual' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: true },
    data: {
      studyType: 'X-ray',
      bodyPart: 'Chest',
      indication: 'Cough',
      priority: 'routine' as const,
      requiresAuth: false,
      orderStatus: 'draft' as const,
    },
    ...overrides,
  } as ImagingItem;
}

function makeReferral(overrides?: Partial<ReferralItem>): ReferralItem {
  return {
    id: 'ref-1',
    category: 'referral',
    displayText: 'Cardiology Referral',
    createdAt: new Date('2024-01-15T10:03:00'),
    createdBy: { id: 'dr-1', name: 'Dr. Anderson' },
    modifiedAt: new Date('2024-01-15T10:03:00'),
    modifiedBy: { id: 'dr-1', name: 'Dr. Anderson' },
    source: { type: 'manual' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: true },
    data: {
      specialty: 'Cardiology',
      reason: 'Persistent palpitations',
      urgency: 'routine' as const,
      referralStatus: 'draft' as const,
      requiresAuth: false,
    },
    ...overrides,
  } as ReferralItem;
}

function makeNarrative(
  category: 'chief-complaint' | 'hpi' | 'ros' | 'physical-exam' | 'plan' | 'instruction' | 'note' | 'diagnosis',
  overrides?: Partial<ChartItem>
): ChartItem {
  return {
    id: `${category}-1`,
    category,
    displayText: `Mock ${category} content`,
    createdAt: new Date('2024-01-15T10:00:00'),
    createdBy: { id: 'dr-1', name: 'Dr. Anderson' },
    modifiedAt: new Date('2024-01-15T10:00:00'),
    modifiedBy: { id: 'dr-1', name: 'Dr. Anderson' },
    source: { type: 'manual' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: true },
    data: category === 'diagnosis'
      ? { description: 'Acute bronchitis', icdCode: 'J20.9', type: 'encounter' as const, clinicalStatus: 'active' as const }
      : { text: `Mock ${category} text`, format: 'plain' as const },
    ...overrides,
  } as unknown as ChartItem;
}

function makeTask(overrides?: Partial<BackgroundTask>): BackgroundTask {
  return {
    id: 'task-1',
    type: 'dx-association',
    status: 'queued',
    priority: 'normal',
    trigger: { action: 'ITEM_ADDED', itemId: 'med-1' },
    createdAt: new Date('2024-01-15T10:00:00'),
    displayTitle: 'Link diagnosis to Amoxicillin',
    displayStatus: 'Finding matching diagnoses...',
    ...overrides,
  };
}

function makeDraft(overrides?: Partial<AIDraft>): AIDraft {
  return {
    id: 'draft-hpi-1',
    category: 'hpi',
    content: '42-year-old female presents with cough.',
    status: 'pending',
    generatedAt: new Date('2024-01-15T10:15:00'),
    source: 'ambient-recording',
    label: 'HPI Draft',
    confidence: 0.85,
    ...overrides,
  };
}

function stateWith(overrides: {
  items?: Record<string, ChartItem>;
  tasks?: Record<string, BackgroundTask>;
  taskToItem?: Record<string, string>;
  drafts?: Record<string, AIDraft>;
  itemOrder?: string[];
}): EncounterState {
  const base = createInitialState();
  const items = overrides.items || {};
  return {
    ...base,
    entities: {
      ...base.entities,
      items,
      tasks: overrides.tasks || {},
      drafts: overrides.drafts || {},
    },
    relationships: {
      ...base.relationships,
      itemOrder: overrides.itemOrder || Object.keys(items),
      taskToItem: overrides.taskToItem || {},
    },
  };
}

// ============================================================================
// 1. Batch Grouping
// ============================================================================

describe('selectProcessViewBatches', () => {
  it('returns 4 batches in correct order', () => {
    const state = stateWith({});
    const batches = selectProcessViewBatches(state);
    expect(batches).toHaveLength(4);
    expect(batches.map(b => b.type)).toEqual(['prescriptions', 'labs', 'imaging', 'referrals']);
  });

  it('groups medications into prescriptions batch', () => {
    const med = makeMedication();
    const state = stateWith({ items: { [med.id]: med } });
    const batches = selectProcessViewBatches(state);
    const rxBatch = batches.find(b => b.type === 'prescriptions')!;
    expect(rxBatch.totalCount).toBe(1);
    expect(rxBatch.subGroups.flatMap(g => g.items)).toHaveLength(1);
  });

  it('groups labs into labs batch', () => {
    const lab = makeLab();
    const state = stateWith({ items: { [lab.id]: lab } });
    const batches = selectProcessViewBatches(state);
    const labBatch = batches.find(b => b.type === 'labs')!;
    expect(labBatch.totalCount).toBe(1);
  });

  it('groups imaging into imaging batch', () => {
    const img = makeImaging();
    const state = stateWith({ items: { [img.id]: img } });
    const batches = selectProcessViewBatches(state);
    const imgBatch = batches.find(b => b.type === 'imaging')!;
    expect(imgBatch.totalCount).toBe(1);
  });

  it('groups referrals into referrals batch', () => {
    const ref = makeReferral();
    const state = stateWith({ items: { [ref.id]: ref } });
    const batches = selectProcessViewBatches(state);
    const refBatch = batches.find(b => b.type === 'referrals')!;
    expect(refBatch.totalCount).toBe(1);
  });

  it('does NOT include narrative items in any batch', () => {
    const cc = makeNarrative('chief-complaint');
    const hpi = makeNarrative('hpi');
    const state = stateWith({ items: { [cc.id]: cc, [hpi.id]: hpi } });
    const batches = selectProcessViewBatches(state);
    const totalItems = batches.reduce((sum, b) => sum + b.totalCount, 0);
    expect(totalItems).toBe(0);
  });

  it('joins tasks to their related items', () => {
    const med = makeMedication();
    const task = makeTask({ trigger: { action: 'ITEM_ADDED', itemId: med.id } });
    const state = stateWith({
      items: { [med.id]: med },
      tasks: { [task.id]: task },
    });
    const batches = selectProcessViewBatches(state);
    const rxBatch = batches.find(b => b.type === 'prescriptions')!;
    const pvi = rxBatch.subGroups[0].items[0];
    expect(pvi.tasks).toHaveLength(1);
    expect(pvi.tasks[0].id).toBe(task.id);
  });

  it('returns empty batches when no items', () => {
    const state = stateWith({});
    const batches = selectProcessViewBatches(state);
    for (const batch of batches) {
      expect(batch.totalCount).toBe(0);
      expect(batch.subGroups).toHaveLength(0);
    }
  });
});

// ============================================================================
// 2. Sub-grouping
// ============================================================================

describe('Sub-grouping', () => {
  it('groups medications by pharmacy (In-House vs External)', () => {
    const inHouse = makeMedication({
      id: 'med-ih',
      data: {
        drugName: 'Ibuprofen',
        dosage: '400mg',
        route: 'PO',
        frequency: 'TID',
        isControlled: false,
        prescriptionType: 'new' as const,
        pharmacy: { id: 'ph-1', name: 'In-House Dispensary' },
      },
    });
    const cvs = makeMedication({
      id: 'med-cvs',
      data: {
        drugName: 'Amoxicillin',
        dosage: '500mg',
        route: 'PO',
        frequency: 'TID',
        isControlled: false,
        prescriptionType: 'new' as const,
        pharmacy: { id: 'ph-2', name: 'CVS Pharmacy' },
      },
    });
    const state = stateWith({
      items: { [inHouse.id]: inHouse, [cvs.id]: cvs },
    });
    const batches = selectProcessViewBatches(state);
    const rxBatch = batches.find(b => b.type === 'prescriptions')!;
    expect(rxBatch.subGroups).toHaveLength(2);
    expect(rxBatch.subGroups[0].label).toBe('In-House Dispensary');
    expect(rxBatch.subGroups[1].label).toBe('CVS Pharmacy');
  });

  it('groups labs by collection type + vendor', () => {
    const inHouse = makeLab({
      id: 'lab-ih',
      data: {
        testName: 'CBC',
        priority: 'routine' as const,
        collectionType: 'in-house' as const,
        orderStatus: 'draft' as const,
      },
    });
    const quest = makeLab({
      id: 'lab-quest',
      data: {
        testName: 'CMP',
        priority: 'routine' as const,
        collectionType: 'send-out' as const,
        labVendor: 'Quest',
        orderStatus: 'draft' as const,
      },
    });
    const state = stateWith({
      items: { [inHouse.id]: inHouse, [quest.id]: quest },
    });
    const batches = selectProcessViewBatches(state);
    const labBatch = batches.find(b => b.type === 'labs')!;
    expect(labBatch.subGroups).toHaveLength(2);
    expect(labBatch.subGroups[0].label).toBe('In-House');
    expect(labBatch.subGroups[1].label).toBe('Quest');
  });

  it('groups imaging by facility', () => {
    const inHouse = makeImaging({
      id: 'img-ih',
      data: {
        studyType: 'X-ray',
        bodyPart: 'Chest',
        indication: 'Cough',
        priority: 'routine' as const,
        requiresAuth: false,
        orderStatus: 'draft' as const,
      },
    });
    const external = makeImaging({
      id: 'img-ext',
      data: {
        studyType: 'MRI',
        bodyPart: 'Brain',
        indication: 'Headache',
        priority: 'routine' as const,
        requiresAuth: true,
        facility: { id: 'f-1', name: 'RadiologyPartners' },
        orderStatus: 'draft' as const,
      },
    });
    const state = stateWith({
      items: { [inHouse.id]: inHouse, [external.id]: external },
    });
    const batches = selectProcessViewBatches(state);
    const imgBatch = batches.find(b => b.type === 'imaging')!;
    expect(imgBatch.subGroups).toHaveLength(2);
    expect(imgBatch.subGroups[0].label).toBe('In-House');
    expect(imgBatch.subGroups[1].label).toBe('RadiologyPartners');
  });
});

// ============================================================================
// 3. selectNonEmptyProcessBatches
// ============================================================================

describe('selectNonEmptyProcessBatches', () => {
  it('filters out empty batches', () => {
    const med = makeMedication();
    const state = stateWith({ items: { [med.id]: med } });
    const nonEmpty = selectNonEmptyProcessBatches(state);
    expect(nonEmpty).toHaveLength(1);
    expect(nonEmpty[0].type).toBe('prescriptions');
  });
});

// ============================================================================
// 4. Aggregate Status
// ============================================================================

describe('Aggregate status', () => {
  it('returns idle for empty batch', () => {
    const state = stateWith({});
    const batches = selectProcessViewBatches(state);
    expect(batches[0].aggregateStatus).toBe('idle');
  });

  it('returns needs-attention when task is pending-review', () => {
    const med = makeMedication();
    const task = makeTask({
      status: 'pending-review',
      trigger: { action: 'ITEM_ADDED', itemId: med.id },
    });
    const state = stateWith({
      items: { [med.id]: med },
      tasks: { [task.id]: task },
    });
    const batches = selectProcessViewBatches(state);
    const rxBatch = batches.find(b => b.type === 'prescriptions')!;
    expect(rxBatch.aggregateStatus).toBe('needs-attention');
  });

  it('returns in-progress when task is processing', () => {
    const med = makeMedication();
    const task = makeTask({
      status: 'processing',
      trigger: { action: 'ITEM_ADDED', itemId: med.id },
    });
    const state = stateWith({
      items: { [med.id]: med },
      tasks: { [task.id]: task },
    });
    const batches = selectProcessViewBatches(state);
    const rxBatch = batches.find(b => b.type === 'prescriptions')!;
    expect(rxBatch.aggregateStatus).toBe('in-progress');
  });

  it('returns complete when all tasks completed', () => {
    const med = makeMedication();
    const task = makeTask({
      status: 'completed',
      trigger: { action: 'ITEM_ADDED', itemId: med.id },
    });
    const state = stateWith({
      items: { [med.id]: med },
      tasks: { [task.id]: task },
    });
    const batches = selectProcessViewBatches(state);
    const rxBatch = batches.find(b => b.type === 'prescriptions')!;
    expect(rxBatch.aggregateStatus).toBe('complete');
  });
});

// ============================================================================
// 5. Processing Steps + Next Action
// ============================================================================

describe('Processing steps and next action', () => {
  it('derives processing steps from tasks', () => {
    const med = makeMedication();
    const task1 = makeTask({
      id: 'task-1',
      status: 'completed',
      trigger: { action: 'ITEM_ADDED', itemId: med.id },
      displayTitle: 'Link diagnosis',
    });
    const task2 = makeTask({
      id: 'task-2',
      type: 'formulary-check',
      status: 'processing',
      trigger: { action: 'ITEM_ADDED', itemId: med.id },
      displayTitle: 'Check formulary',
    });
    const state = stateWith({
      items: { [med.id]: med },
      tasks: { [task1.id]: task1, [task2.id]: task2 },
    });
    const batches = selectProcessViewBatches(state);
    const rxBatch = batches.find(b => b.type === 'prescriptions')!;
    const pvi = rxBatch.subGroups[0].items[0];
    expect(pvi.processingSteps).toHaveLength(2);
    expect(pvi.processingSteps[0].status).toBe('complete');
    expect(pvi.processingSteps[1].status).toBe('active');
  });

  it('derives next action as Review when task needs review', () => {
    const med = makeMedication();
    const task = makeTask({
      status: 'pending-review',
      trigger: { action: 'ITEM_ADDED', itemId: med.id },
    });
    const state = stateWith({
      items: { [med.id]: med },
      tasks: { [task.id]: task },
    });
    const batches = selectProcessViewBatches(state);
    const pvi = batches.find(b => b.type === 'prescriptions')!.subGroups[0].items[0];
    expect(pvi.nextAction).toEqual({
      label: 'Review',
      actionType: 'review',
      taskId: task.id,
    });
  });

  it('derives next action as Associate Dx when no linked diagnoses', () => {
    const med = makeMedication({ linkedDiagnoses: [] });
    const state = stateWith({
      items: { [med.id]: med },
    });
    const batches = selectProcessViewBatches(state);
    const pvi = batches.find(b => b.type === 'prescriptions')!.subGroups[0].items[0];
    expect(pvi.nextAction?.actionType).toBe('associate-dx');
  });
});

// ============================================================================
// 6. Completeness Checklist
// ============================================================================

describe('selectCompletenessChecklist', () => {
  it('returns 8 sections', () => {
    const state = stateWith({});
    const checklist = selectCompletenessChecklist(state);
    expect(checklist).toHaveLength(8);
    expect(checklist.map(c => c.id)).toEqual([
      'cc', 'hpi', 'ros', 'pe', 'assessment', 'plan', 'orders', 'instructions',
    ]);
  });

  it('marks section as not-documented when empty', () => {
    const state = stateWith({});
    const checklist = selectCompletenessChecklist(state);
    expect(checklist[0].status).toBe('not-documented');
    expect(checklist[0].itemCount).toBe(0);
  });

  it('marks section as documented when items present', () => {
    const cc = makeNarrative('chief-complaint');
    const state = stateWith({ items: { [cc.id]: cc } });
    const checklist = selectCompletenessChecklist(state);
    const ccItem = checklist.find(c => c.id === 'cc')!;
    expect(ccItem.status).toBe('documented');
    expect(ccItem.itemCount).toBe(1);
  });

  it('marks section as pending when items are draft or pending-review', () => {
    const cc = makeNarrative('chief-complaint', { status: 'pending-review' });
    const state = stateWith({ items: { [cc.id]: cc } });
    const checklist = selectCompletenessChecklist(state);
    const ccItem = checklist.find(c => c.id === 'cc')!;
    expect(ccItem.status).toBe('pending');
  });

  it('counts orders section across multiple categories', () => {
    const med = makeMedication();
    const lab = makeLab();
    const state = stateWith({ items: { [med.id]: med, [lab.id]: lab } });
    const checklist = selectCompletenessChecklist(state);
    const orders = checklist.find(c => c.id === 'orders')!;
    expect(orders.itemCount).toBe(2);
    expect(orders.status).toBe('documented');
  });
});

// ============================================================================
// 7. E&M Level
// ============================================================================

describe('selectMockEMLevel', () => {
  it('returns level 1 with no documentation', () => {
    const state = stateWith({});
    const em = selectMockEMLevel(state);
    expect(em.code).toBe('99211');
    expect(em.level).toBe(1);
  });

  it('returns higher level with more documentation', () => {
    const items: Record<string, ChartItem> = {};
    for (const cat of ['chief-complaint', 'hpi', 'ros', 'physical-exam', 'diagnosis'] as const) {
      const item = makeNarrative(cat);
      items[item.id] = item;
    }
    // Add a medication for plan
    const med = makeMedication();
    items[med.id] = med;
    // Add an instruction
    const inst = makeNarrative('instruction' as any, { id: 'instr-1', category: 'instruction' });
    items[inst.id] = inst;

    const state = stateWith({ items, itemOrder: Object.keys(items) });
    const em = selectMockEMLevel(state);
    expect(em.level).toBeGreaterThanOrEqual(4);
    expect(em.elements.filter(e => e.documented).length).toBeGreaterThanOrEqual(5);
  });

  it('returns elements with documented status', () => {
    const cc = makeNarrative('chief-complaint');
    const state = stateWith({ items: { [cc.id]: cc } });
    const em = selectMockEMLevel(state);
    const historyElement = em.elements.find(e => e.name.includes('History'))!;
    expect(historyElement.documented).toBe(true);
  });
});

// ============================================================================
// 8. Outstanding Count
// ============================================================================

describe('selectOutstandingItemCount', () => {
  it('returns 0 when no items or drafts', () => {
    const state = stateWith({});
    expect(selectOutstandingItemCount(state)).toBe(0);
  });

  it('counts items with pending-review tasks', () => {
    const med = makeMedication();
    const task = makeTask({
      status: 'pending-review',
      trigger: { action: 'ITEM_ADDED', itemId: med.id },
    });
    const state = stateWith({
      items: { [med.id]: med },
      tasks: { [task.id]: task },
    });
    expect(selectOutstandingItemCount(state)).toBe(1);
  });

  it('counts pending drafts', () => {
    const draft = makeDraft({ status: 'pending' });
    const state = stateWith({ drafts: { [draft.id]: draft } });
    expect(selectOutstandingItemCount(state)).toBe(1);
  });

  it('counts both items and drafts', () => {
    const med = makeMedication();
    const task = makeTask({
      status: 'pending-review',
      trigger: { action: 'ITEM_ADDED', itemId: med.id },
    });
    const draft = makeDraft({ status: 'pending' });
    const state = stateWith({
      items: { [med.id]: med },
      tasks: { [task.id]: task },
      drafts: { [draft.id]: draft },
    });
    expect(selectOutstandingItemCount(state)).toBe(2);
  });
});

// ============================================================================
// 9. Active Drafts
// ============================================================================

describe('selectProcessViewDrafts', () => {
  it('returns active (pending + generating) drafts', () => {
    const pending = makeDraft({ id: 'd1', status: 'pending' });
    const generating = makeDraft({ id: 'd2', status: 'generating', content: '' });
    const accepted = makeDraft({ id: 'd3', status: 'accepted' });
    const state = stateWith({
      drafts: {
        [pending.id]: pending,
        [generating.id]: generating,
        [accepted.id]: accepted,
      },
    });
    const active = selectProcessViewDrafts(state);
    expect(active).toHaveLength(2);
    expect(active.map(d => d.id).sort()).toEqual(['d1', 'd2']);
  });

  it('includes updating drafts in active drafts', () => {
    const pending = makeDraft({ id: 'd1', status: 'pending' });
    const updating = makeDraft({ id: 'd2', status: 'updating', content: 'old content' });
    const dismissed = makeDraft({ id: 'd3', status: 'dismissed' });
    const state = stateWith({
      drafts: {
        [pending.id]: pending,
        [updating.id]: updating,
        [dismissed.id]: dismissed,
      },
    });
    const active = selectProcessViewDrafts(state);
    expect(active).toHaveLength(2);
    expect(active.map(d => d.id).sort()).toEqual(['d1', 'd2']);
  });
});
