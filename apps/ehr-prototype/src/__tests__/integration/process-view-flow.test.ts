/**
 * Process View Integration Tests — Phase 5
 *
 * End-to-end flow tests:
 * 1. Full view with batches from populated state
 * 2. Draft accept → item appears in batch
 * 3. Sign-off blockers computed correctly from state
 * 4. E&M level updates as documentation changes
 * 5. Outstanding count reflects both tasks and drafts
 */

import { describe, it, expect } from 'vitest';
import type { ChartItem, MedicationItem, LabItem, BackgroundTask } from '../../types';
import type { AIDraft } from '../../types/drafts';
import type { EncounterState } from '../../state/types';
import { createInitialState } from '../../state/initialState';
import { rootReducer } from '../../state/reducers/root';
import { draftGenerated, draftAccepted } from '../../state/actions/draft-actions';
import {
  selectProcessViewBatches,
  selectProcessViewDrafts,
  selectCompletenessChecklist,
  selectMockEMLevel,
  selectOutstandingItemCount,
} from '../../state/selectors/process-view';
import type { EncounterAction } from '../../state/actions/types';

// ============================================================================
// Helpers
// ============================================================================

function makeMed(id: string, name: string, pharmacy?: { id: string; name: string }): MedicationItem {
  return {
    id,
    category: 'medication',
    displayText: `${name} 500mg PO TID`,
    createdAt: new Date(),
    createdBy: { id: 'dr-1', name: 'Dr. Anderson' },
    modifiedAt: new Date(),
    modifiedBy: { id: 'dr-1', name: 'Dr. Anderson' },
    source: { type: 'manual' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: true },
    data: {
      drugName: name,
      dosage: '500mg',
      route: 'PO',
      frequency: 'TID',
      isControlled: false,
      prescriptionType: 'new' as const,
      pharmacy,
    },
    actions: ['e-prescribe'],
  } as MedicationItem;
}

function makeLab(id: string, name: string, collection: 'in-house' | 'send-out', vendor?: string): LabItem {
  return {
    id,
    category: 'lab',
    displayText: name,
    createdAt: new Date(),
    createdBy: { id: 'dr-1', name: 'Dr. Anderson' },
    modifiedAt: new Date(),
    modifiedBy: { id: 'dr-1', name: 'Dr. Anderson' },
    source: { type: 'manual' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: true },
    data: {
      testName: name,
      priority: 'routine' as const,
      collectionType: collection,
      labVendor: vendor,
      orderStatus: 'draft' as const,
    },
  } as LabItem;
}

function makeNarrativeItem(category: string): ChartItem {
  return {
    id: `${category}-int-1`,
    category,
    displayText: `Mock ${category}`,
    createdAt: new Date(),
    createdBy: { id: 'dr-1', name: 'Dr. Anderson' },
    modifiedAt: new Date(),
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
      : { text: `Mock ${category}`, format: 'plain' as const },
  } as unknown as ChartItem;
}

function makeTask(id: string, itemId: string, status: BackgroundTask['status']): BackgroundTask {
  return {
    id,
    type: 'dx-association',
    status,
    priority: 'normal',
    trigger: { action: 'ITEM_ADDED', itemId },
    createdAt: new Date(),
    displayTitle: `Link Dx to ${itemId}`,
    displayStatus: 'Processing...',
  };
}

function makeDraft(overrides?: Partial<AIDraft>): AIDraft {
  return {
    id: 'draft-hpi-int',
    category: 'hpi',
    content: '42-year-old female presents with cough x 5 days.',
    status: 'pending',
    generatedAt: new Date(),
    source: 'ambient-recording',
    label: 'HPI Draft',
    confidence: 0.85,
    ...overrides,
  };
}

function populatedState(): EncounterState {
  const base = createInitialState();

  // Medications
  const med1 = makeMed('med-1', 'Amoxicillin', { id: 'ph-1', name: 'In-House Dispensary' });
  const med2 = makeMed('med-2', 'Metformin', { id: 'ph-2', name: 'CVS Pharmacy' });

  // Labs
  const lab1 = makeLab('lab-1', 'CBC', 'in-house');
  const lab2 = makeLab('lab-2', 'CMP', 'send-out', 'Quest');
  const lab3 = makeLab('lab-3', 'TSH', 'send-out', 'Quest');

  // Narratives
  const cc = makeNarrativeItem('chief-complaint');
  const hpi = makeNarrativeItem('hpi');
  const dx = makeNarrativeItem('diagnosis');

  // Tasks
  const task1 = makeTask('t1', 'med-1', 'completed');
  const task2 = makeTask('t2', 'med-2', 'pending-review');
  const task3 = makeTask('t3', 'lab-1', 'queued');

  // Draft
  const draft = makeDraft();

  const items: Record<string, ChartItem> = {
    [med1.id]: med1,
    [med2.id]: med2,
    [lab1.id]: lab1,
    [lab2.id]: lab2,
    [lab3.id]: lab3,
    [cc.id]: cc,
    [hpi.id]: hpi,
    [dx.id]: dx,
  };

  return {
    ...base,
    entities: {
      ...base.entities,
      items,
      tasks: { [task1.id]: task1, [task2.id]: task2, [task3.id]: task3 },
      drafts: { [draft.id]: draft },
    },
    relationships: {
      ...base.relationships,
      itemOrder: Object.keys(items),
    },
  };
}

// ============================================================================
// 1. Full View with Batches
// ============================================================================

describe('Process View — Populated State', () => {
  it('organizes items into correct batches', () => {
    const state = populatedState();
    const batches = selectProcessViewBatches(state);

    const rx = batches.find(b => b.type === 'prescriptions')!;
    const labs = batches.find(b => b.type === 'labs')!;
    const imaging = batches.find(b => b.type === 'imaging')!;
    const referrals = batches.find(b => b.type === 'referrals')!;

    expect(rx.totalCount).toBe(2);
    expect(labs.totalCount).toBe(3);
    expect(imaging.totalCount).toBe(0);
    expect(referrals.totalCount).toBe(0);
  });

  it('sub-groups medications by pharmacy', () => {
    const state = populatedState();
    const batches = selectProcessViewBatches(state);
    const rx = batches.find(b => b.type === 'prescriptions')!;

    expect(rx.subGroups).toHaveLength(2);
    const groups = rx.subGroups.map(g => g.label);
    expect(groups).toContain('In-House Dispensary');
    expect(groups).toContain('CVS Pharmacy');
  });

  it('sub-groups labs by In-House vs Quest', () => {
    const state = populatedState();
    const batches = selectProcessViewBatches(state);
    const labs = batches.find(b => b.type === 'labs')!;

    expect(labs.subGroups).toHaveLength(2);
    const inHouse = labs.subGroups.find(g => g.label === 'In-House')!;
    const quest = labs.subGroups.find(g => g.label === 'Quest')!;
    expect(inHouse.items).toHaveLength(1);
    expect(quest.items).toHaveLength(2);
  });

  it('joins tasks to items', () => {
    const state = populatedState();
    const batches = selectProcessViewBatches(state);
    const rx = batches.find(b => b.type === 'prescriptions')!;

    // med-1 has task1 (completed), med-2 has task2 (pending-review)
    const allItems = rx.subGroups.flatMap(g => g.items);
    const med1 = allItems.find(i => i.item.id === 'med-1')!;
    const med2 = allItems.find(i => i.item.id === 'med-2')!;

    expect(med1.tasks).toHaveLength(1);
    expect(med1.tasks[0].status).toBe('completed');
    expect(med2.tasks).toHaveLength(1);
    expect(med2.tasks[0].status).toBe('pending-review');
  });
});

// ============================================================================
// 2. Draft Accept → Item in Batch
// ============================================================================

describe('Draft accept flow', () => {
  it('accepting a draft removes it from active drafts', () => {
    const state = populatedState();

    // Before accept
    const draftsBefore = selectProcessViewDrafts(state);
    expect(draftsBefore).toHaveLength(1);

    // After accept
    const nextState = rootReducer(state, draftAccepted('draft-hpi-int'));
    const draftsAfter = selectProcessViewDrafts(nextState);
    expect(draftsAfter).toHaveLength(0);
  });
});

// ============================================================================
// 3. Completeness Checklist from State
// ============================================================================

describe('Completeness checklist integration', () => {
  it('reflects documented sections from state', () => {
    const state = populatedState();
    const checklist = selectCompletenessChecklist(state);

    const cc = checklist.find(c => c.id === 'cc')!;
    const hpi = checklist.find(c => c.id === 'hpi')!;
    const assessment = checklist.find(c => c.id === 'assessment')!;
    const orders = checklist.find(c => c.id === 'orders')!;

    expect(cc.status).toBe('documented');
    expect(hpi.status).toBe('documented');
    expect(assessment.status).toBe('documented');
    expect(orders.status).toBe('documented'); // has meds and labs
    expect(orders.itemCount).toBe(5); // 2 meds + 3 labs
  });
});

// ============================================================================
// 4. E&M Level Updates
// ============================================================================

describe('E&M level from state', () => {
  it('computes level based on documented elements', () => {
    const state = populatedState();
    const em = selectMockEMLevel(state);

    // CC + HPI → History documented
    // No PE → not documented
    // Dx → Assessment documented
    // Meds + Labs → Plan documented
    // No Instructions → not documented
    const documented = em.elements.filter(e => e.documented);
    expect(documented.length).toBeGreaterThanOrEqual(3);
    expect(em.level).toBeGreaterThanOrEqual(3);
  });

  it('level increases when more sections documented', () => {
    const base = populatedState();
    const emBefore = selectMockEMLevel(base);

    // Add PE, Instructions
    const pe = makeNarrativeItem('physical-exam');
    const instr = makeNarrativeItem('instruction');
    const richer: EncounterState = {
      ...base,
      entities: {
        ...base.entities,
        items: {
          ...base.entities.items,
          [pe.id]: pe,
          [instr.id]: instr,
        },
      },
      relationships: {
        ...base.relationships,
        itemOrder: [...base.relationships.itemOrder, pe.id, instr.id],
      },
    };
    const emAfter = selectMockEMLevel(richer);
    expect(emAfter.level).toBeGreaterThan(emBefore.level);
  });
});

// ============================================================================
// 5. Outstanding Count
// ============================================================================

describe('Outstanding count integration', () => {
  it('counts tasks + drafts needing attention', () => {
    const state = populatedState();
    const count = selectOutstandingItemCount(state);

    // med-2 has pending-review task (1)
    // lab-1 has queued task (1)
    // draft-hpi-int is pending (1)
    expect(count).toBe(3);
  });

  it('decreases when draft accepted', () => {
    const state = populatedState();
    const countBefore = selectOutstandingItemCount(state);

    const nextState = rootReducer(state, draftAccepted('draft-hpi-int'));
    const countAfter = selectOutstandingItemCount(nextState);

    expect(countAfter).toBe(countBefore - 1);
  });
});

// ============================================================================
// 6. Batch Aggregate Status
// ============================================================================

describe('Batch aggregate status integration', () => {
  it('prescriptions batch needs-attention when task pending-review', () => {
    const state = populatedState();
    const batches = selectProcessViewBatches(state);
    const rx = batches.find(b => b.type === 'prescriptions')!;
    // med-2 has pending-review task
    expect(rx.aggregateStatus).toBe('needs-attention');
  });

  it('labs batch in-progress when task queued', () => {
    const state = populatedState();
    const batches = selectProcessViewBatches(state);
    const labs = batches.find(b => b.type === 'labs')!;
    // lab-1 has queued task
    expect(labs.aggregateStatus).toBe('in-progress');
  });
});
