/**
 * Processing Rail + AI Drafts Tests — Phase 4a
 *
 * Tests for:
 * 1. Drafts reducer lifecycle (generate → pending → accept/edit/dismiss)
 * 2. No-op guards (dismiss non-existent, accept non-existent)
 * 3. Encounter close clears drafts
 * 4. Batch grouping selectors (tasks + drafts into correct batches)
 * 5. Aggregate status computation
 * 6. Draft selectors (by status, by category, active, has-draft-for-category)
 */

import { describe, it, expect } from 'vitest';
import type { AIDraft } from '../../types/drafts';
import type { BackgroundTask } from '../../types/suggestions';
import type { ChartItem, ItemSource } from '../../types/chart-items';
import type { EncounterState } from '../../state/types';
import { draftsReducer } from '../../state/reducers/drafts';
import { rootReducer } from '../../state/reducers/root';
import { itemAdded, taskCreated } from '../../state/actions/creators';
import { draftGenerated, draftAccepted } from '../../state/actions/draft-actions';
import { TASK_TEMPLATES } from '../../mocks/generators/tasks';
import {
  selectAllDrafts,
  selectDraft,
  selectPendingDrafts,
  selectGeneratingDrafts,
  selectActiveDrafts,
  selectDraftsByCategory,
  selectPendingDraftCount,
  selectHasDraftForCategory,
} from '../../state/selectors/drafts';
import {
  selectProcessingBatches,
  selectNonEmptyBatches,
  selectTotalNeedsAttentionCount,
} from '../../state/selectors/batches';
import { createInitialState } from '../../state/initialState';
import type { EncounterAction } from '../../state/actions/types';

// ============================================================================
// Test Helpers
// ============================================================================

function makeDraft(overrides?: Partial<AIDraft>): AIDraft {
  return {
    id: 'draft-hpi-1',
    category: 'hpi',
    content: '42-year-old female presents with cough x 5 days. Cough is non-productive, worse at night.',
    status: 'pending',
    generatedAt: new Date('2024-01-15T10:15:00'),
    source: 'ambient-recording',
    label: 'HPI Draft',
    confidence: 0.85,
    ...overrides,
  };
}

function makeGeneratingDraft(overrides?: Partial<AIDraft>): AIDraft {
  return makeDraft({
    id: 'draft-ros-1',
    category: 'ros',
    content: '',
    status: 'generating',
    label: 'ROS Draft',
    ...overrides,
  });
}

function makeMedicationItem(overrides?: Partial<ChartItem>): ChartItem {
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
    activityLog: [{ timestamp: new Date('2024-01-15T10:00:00'), action: 'created', actor: 'Dr. Anderson' }],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: true },
    data: {
      drugName: 'Amoxicillin',
      dosage: '500mg',
      route: 'PO',
      frequency: 'TID',
      isControlled: false,
      prescriptionType: 'new' as const,
    },
    ...overrides,
  } as ChartItem;
}

function makeLabItem(overrides?: Partial<ChartItem>): ChartItem {
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
    activityLog: [{ timestamp: new Date('2024-01-15T10:01:00'), action: 'created', actor: 'Dr. Anderson' }],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: true },
    data: {
      testName: 'CBC with Differential',
      priority: 'routine' as const,
      collectionType: 'in-house' as const,
      orderStatus: 'draft' as const,
    },
    ...overrides,
  } as ChartItem;
}

function makeTask(overrides?: Partial<BackgroundTask>): BackgroundTask {
  return {
    id: 'task-dx-1',
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

function dispatch(
  state: Record<string, AIDraft>,
  action: EncounterAction
): Record<string, AIDraft> {
  return draftsReducer(state, action);
}

function stateWith(overrides: {
  drafts?: Record<string, AIDraft>;
  items?: Record<string, ChartItem>;
  tasks?: Record<string, BackgroundTask>;
  taskToItem?: Record<string, string>;
}): EncounterState {
  const base = createInitialState();
  return {
    ...base,
    entities: {
      ...base.entities,
      drafts: overrides.drafts || {},
      items: overrides.items || {},
      tasks: overrides.tasks || {},
    },
    relationships: {
      ...base.relationships,
      taskToItem: overrides.taskToItem || {},
    },
  };
}

// ============================================================================
// 1. Drafts Reducer Lifecycle
// ============================================================================

describe('Drafts Reducer', () => {
  describe('DRAFT_GENERATED', () => {
    it('adds a new draft to state', () => {
      const draft = makeDraft();
      const result = dispatch({}, {
        type: 'DRAFT_GENERATED',
        payload: { draft },
      });

      expect(result[draft.id]).toBe(draft);
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('adds multiple drafts', () => {
      const draft1 = makeDraft({ id: 'draft-1' });
      const draft2 = makeDraft({ id: 'draft-2', category: 'ros' });

      let state = dispatch({}, { type: 'DRAFT_GENERATED', payload: { draft: draft1 } });
      state = dispatch(state, { type: 'DRAFT_GENERATED', payload: { draft: draft2 } });

      expect(Object.keys(state)).toHaveLength(2);
      expect(state['draft-1']).toBe(draft1);
      expect(state['draft-2']).toBe(draft2);
    });
  });

  describe('DRAFT_ACCEPTED', () => {
    it('transitions draft to accepted status', () => {
      const draft = makeDraft({ status: 'pending' });
      const state: Record<string, AIDraft> = { [draft.id]: draft };

      const result = dispatch(state, {
        type: 'DRAFT_ACCEPTED',
        payload: { id: draft.id },
      });

      expect(result[draft.id].status).toBe('accepted');
    });

    it('preserves other draft fields', () => {
      const draft = makeDraft();
      const state: Record<string, AIDraft> = { [draft.id]: draft };

      const result = dispatch(state, {
        type: 'DRAFT_ACCEPTED',
        payload: { id: draft.id },
      });

      expect(result[draft.id].content).toBe(draft.content);
      expect(result[draft.id].category).toBe(draft.category);
      expect(result[draft.id].label).toBe(draft.label);
    });
  });

  describe('DRAFT_EDITED', () => {
    it('updates draft content', () => {
      const draft = makeDraft();
      const state: Record<string, AIDraft> = { [draft.id]: draft };
      const newContent = 'Edited content here.';

      const result = dispatch(state, {
        type: 'DRAFT_EDITED',
        payload: { id: draft.id, content: newContent },
      });

      expect(result[draft.id].content).toBe(newContent);
    });

    it('does not change status', () => {
      const draft = makeDraft({ status: 'pending' });
      const state: Record<string, AIDraft> = { [draft.id]: draft };

      const result = dispatch(state, {
        type: 'DRAFT_EDITED',
        payload: { id: draft.id, content: 'New content' },
      });

      expect(result[draft.id].status).toBe('pending');
    });
  });

  describe('DRAFT_DISMISSED', () => {
    it('transitions draft to dismissed status', () => {
      const draft = makeDraft({ status: 'pending' });
      const state: Record<string, AIDraft> = { [draft.id]: draft };

      const result = dispatch(state, {
        type: 'DRAFT_DISMISSED',
        payload: { id: draft.id },
      });

      expect(result[draft.id].status).toBe('dismissed');
    });
  });

  describe('ENCOUNTER_CLOSED', () => {
    it('clears all drafts when save is false', () => {
      const state: Record<string, AIDraft> = {
        'draft-1': makeDraft({ id: 'draft-1' }),
        'draft-2': makeDraft({ id: 'draft-2', category: 'ros' }),
      };

      const result = dispatch(state, {
        type: 'ENCOUNTER_CLOSED',
        payload: { save: false },
      });

      expect(Object.keys(result)).toHaveLength(0);
    });

    it('preserves drafts when save is true', () => {
      const state: Record<string, AIDraft> = {
        'draft-1': makeDraft({ id: 'draft-1' }),
      };

      const result = dispatch(state, {
        type: 'ENCOUNTER_CLOSED',
        payload: { save: true },
      });

      expect(Object.keys(result)).toHaveLength(1);
    });
  });
});

// ============================================================================
// 2. No-op Guards
// ============================================================================

describe('Drafts Reducer — No-op Guards', () => {
  it('DRAFT_ACCEPTED on non-existent draft returns same state', () => {
    const state: Record<string, AIDraft> = {};
    const result = dispatch(state, {
      type: 'DRAFT_ACCEPTED',
      payload: { id: 'nonexistent' },
    });
    expect(result).toBe(state);
  });

  it('DRAFT_EDITED on non-existent draft returns same state', () => {
    const state: Record<string, AIDraft> = {};
    const result = dispatch(state, {
      type: 'DRAFT_EDITED',
      payload: { id: 'nonexistent', content: 'new content' },
    });
    expect(result).toBe(state);
  });

  it('DRAFT_DISMISSED on non-existent draft returns same state', () => {
    const state: Record<string, AIDraft> = {};
    const result = dispatch(state, {
      type: 'DRAFT_DISMISSED',
      payload: { id: 'nonexistent' },
    });
    expect(result).toBe(state);
  });

  it('unrelated action returns same state', () => {
    const state: Record<string, AIDraft> = { 'draft-1': makeDraft() };
    const result = dispatch(state, {
      type: 'ITEM_ADDED',
      payload: { item: makeMedicationItem(), source: { type: 'manual' } },
    });
    expect(result).toBe(state);
  });
});

// ============================================================================
// 3. Draft Selectors
// ============================================================================

describe('Draft Selectors', () => {
  const pendingDraft = makeDraft({ id: 'draft-hpi', status: 'pending', category: 'hpi' });
  const generatingDraft = makeGeneratingDraft({ id: 'draft-ros' });
  const acceptedDraft = makeDraft({ id: 'draft-cc', status: 'accepted', category: 'chief-complaint', label: 'CC Draft' });
  const dismissedDraft = makeDraft({ id: 'draft-pe', status: 'dismissed', category: 'physical-exam', label: 'PE Draft' });

  const state = stateWith({
    drafts: {
      'draft-hpi': pendingDraft,
      'draft-ros': generatingDraft,
      'draft-cc': acceptedDraft,
      'draft-pe': dismissedDraft,
    },
  });

  it('selectAllDrafts returns all 4 drafts', () => {
    expect(selectAllDrafts(state)).toHaveLength(4);
  });

  it('selectDraft returns a specific draft', () => {
    expect(selectDraft(state, 'draft-hpi')).toBe(pendingDraft);
    expect(selectDraft(state, 'nonexistent')).toBeUndefined();
  });

  it('selectPendingDrafts returns only pending', () => {
    const pending = selectPendingDrafts(state);
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe('draft-hpi');
  });

  it('selectGeneratingDrafts returns only generating', () => {
    const generating = selectGeneratingDrafts(state);
    expect(generating).toHaveLength(1);
    expect(generating[0].id).toBe('draft-ros');
  });

  it('selectActiveDrafts returns pending + generating', () => {
    const active = selectActiveDrafts(state);
    expect(active).toHaveLength(2);
    const ids = active.map(d => d.id).sort();
    expect(ids).toEqual(['draft-hpi', 'draft-ros']);
  });

  it('selectDraftsByCategory returns drafts for a category', () => {
    const hpiDrafts = selectDraftsByCategory(state, 'hpi');
    expect(hpiDrafts).toHaveLength(1);
    expect(hpiDrafts[0].id).toBe('draft-hpi');
  });

  it('selectPendingDraftCount returns count of pending', () => {
    expect(selectPendingDraftCount(state)).toBe(1);
  });

  it('selectHasDraftForCategory returns true for active category', () => {
    expect(selectHasDraftForCategory(state, 'hpi')).toBe(true);
    expect(selectHasDraftForCategory(state, 'ros')).toBe(true);
  });

  it('selectHasDraftForCategory returns false for non-active category', () => {
    // chief-complaint is accepted, not active
    expect(selectHasDraftForCategory(state, 'chief-complaint')).toBe(false);
    // physical-exam is dismissed, not active
    expect(selectHasDraftForCategory(state, 'physical-exam')).toBe(false);
    // plan has no draft at all
    expect(selectHasDraftForCategory(state, 'plan')).toBe(false);
  });
});

// ============================================================================
// 4. Batch Grouping Selectors
// ============================================================================

describe('Batch Grouping Selectors', () => {
  it('returns 5 batches even when empty', () => {
    const state = stateWith({});
    const batches = selectProcessingBatches(state);
    expect(batches).toHaveLength(5);
    expect(batches.map(b => b.type)).toEqual([
      'ai-drafts', 'prescriptions', 'labs', 'imaging', 'referrals',
    ]);
  });

  it('all empty batches have count 0 and idle status', () => {
    const state = stateWith({});
    const batches = selectProcessingBatches(state);
    for (const batch of batches) {
      expect(batch.count).toBe(0);
      expect(batch.aggregateStatus).toBe('idle');
    }
  });

  it('groups active drafts into ai-drafts batch', () => {
    const state = stateWith({
      drafts: {
        'draft-1': makeDraft({ id: 'draft-1', status: 'pending' }),
        'draft-2': makeGeneratingDraft({ id: 'draft-2' }),
        'draft-3': makeDraft({ id: 'draft-3', status: 'accepted' }), // should not appear
      },
    });
    const batches = selectProcessingBatches(state);
    const aiBatch = batches.find(b => b.type === 'ai-drafts')!;
    expect(aiBatch.count).toBe(2);
    expect(aiBatch.aggregateStatus).toBe('needs-attention'); // has pending
  });

  it('groups medication tasks into prescriptions batch', () => {
    const medItem = makeMedicationItem();
    const dxTask = makeTask({ id: 'task-dx', type: 'dx-association', trigger: { action: 'ITEM_ADDED', itemId: 'med-1' } });
    const drugTask = makeTask({ id: 'task-drug', type: 'drug-interaction', trigger: { action: 'ITEM_ADDED', itemId: 'med-1' }, status: 'processing' });

    const state = stateWith({
      items: { 'med-1': medItem },
      tasks: { 'task-dx': dxTask, 'task-drug': drugTask },
    });
    const batches = selectProcessingBatches(state);
    const rxBatch = batches.find(b => b.type === 'prescriptions')!;
    expect(rxBatch.count).toBe(2);
  });

  it('groups lab tasks into labs batch', () => {
    const labItem = makeLabItem();
    const labTask = makeTask({
      id: 'task-lab-dx',
      type: 'dx-association',
      trigger: { action: 'ITEM_ADDED', itemId: 'lab-1' },
    });

    const state = stateWith({
      items: { 'lab-1': labItem },
      tasks: { 'task-lab-dx': labTask },
    });
    const batches = selectProcessingBatches(state);
    const labBatch = batches.find(b => b.type === 'labs')!;
    expect(labBatch.count).toBe(1);
  });

  it('excludes completed and cancelled tasks from batches', () => {
    const medItem = makeMedicationItem();
    const completedTask = makeTask({
      id: 'task-done',
      status: 'completed',
      trigger: { action: 'ITEM_ADDED', itemId: 'med-1' },
    });
    const cancelledTask = makeTask({
      id: 'task-cancel',
      status: 'cancelled',
      trigger: { action: 'ITEM_ADDED', itemId: 'med-1' },
    });

    const state = stateWith({
      items: { 'med-1': medItem },
      tasks: { 'task-done': completedTask, 'task-cancel': cancelledTask },
    });
    const batches = selectProcessingBatches(state);
    const rxBatch = batches.find(b => b.type === 'prescriptions')!;
    expect(rxBatch.count).toBe(0);
  });

  it('selectNonEmptyBatches filters out empty batches', () => {
    const state = stateWith({
      drafts: {
        'draft-1': makeDraft({ id: 'draft-1', status: 'pending' }),
      },
    });
    const nonEmpty = selectNonEmptyBatches(state);
    expect(nonEmpty).toHaveLength(1);
    expect(nonEmpty[0].type).toBe('ai-drafts');
  });
});

// ============================================================================
// 5. Aggregate Status Computation
// ============================================================================

describe('Aggregate Status', () => {
  it('draft batch: needs-attention when any pending', () => {
    const state = stateWith({
      drafts: { 'd1': makeDraft({ id: 'd1', status: 'pending' }) },
    });
    const batch = selectProcessingBatches(state).find(b => b.type === 'ai-drafts')!;
    expect(batch.aggregateStatus).toBe('needs-attention');
  });

  it('draft batch: in-progress when only generating', () => {
    const state = stateWith({
      drafts: { 'd1': makeGeneratingDraft({ id: 'd1' }) },
    });
    const batch = selectProcessingBatches(state).find(b => b.type === 'ai-drafts')!;
    expect(batch.aggregateStatus).toBe('in-progress');
  });

  it('task batch: needs-attention when pending-review', () => {
    const medItem = makeMedicationItem();
    const task = makeTask({ id: 't1', status: 'pending-review', trigger: { action: 'ITEM_ADDED', itemId: 'med-1' } });
    const state = stateWith({ items: { 'med-1': medItem }, tasks: { 't1': task } });
    const batch = selectProcessingBatches(state).find(b => b.type === 'prescriptions')!;
    expect(batch.aggregateStatus).toBe('needs-attention');
  });

  it('task batch: needs-attention when failed', () => {
    const medItem = makeMedicationItem();
    const task = makeTask({ id: 't1', status: 'failed', trigger: { action: 'ITEM_ADDED', itemId: 'med-1' } });
    const state = stateWith({ items: { 'med-1': medItem }, tasks: { 't1': task } });
    const batch = selectProcessingBatches(state).find(b => b.type === 'prescriptions')!;
    expect(batch.aggregateStatus).toBe('needs-attention');
  });

  it('task batch: in-progress when processing', () => {
    const medItem = makeMedicationItem();
    const task = makeTask({ id: 't1', status: 'processing', trigger: { action: 'ITEM_ADDED', itemId: 'med-1' } });
    const state = stateWith({ items: { 'med-1': medItem }, tasks: { 't1': task } });
    const batch = selectProcessingBatches(state).find(b => b.type === 'prescriptions')!;
    expect(batch.aggregateStatus).toBe('in-progress');
  });

  it('task batch: complete when all ready', () => {
    const medItem = makeMedicationItem();
    const task = makeTask({ id: 't1', status: 'ready', trigger: { action: 'ITEM_ADDED', itemId: 'med-1' } });
    const state = stateWith({ items: { 'med-1': medItem }, tasks: { 't1': task } });
    const batch = selectProcessingBatches(state).find(b => b.type === 'prescriptions')!;
    expect(batch.aggregateStatus).toBe('complete');
  });

  it('selectTotalNeedsAttentionCount counts items in needs-attention batches', () => {
    const medItem = makeMedicationItem();
    const failedTask = makeTask({ id: 't1', status: 'failed', trigger: { action: 'ITEM_ADDED', itemId: 'med-1' } });
    const state = stateWith({
      items: { 'med-1': medItem },
      tasks: { 't1': failedTask },
      drafts: { 'd1': makeDraft({ id: 'd1', status: 'pending' }) },
    });
    const count = selectTotalNeedsAttentionCount(state);
    expect(count).toBe(2); // 1 draft (needs-attention) + 1 task (needs-attention)
  });
});

// ============================================================================
// 6. Draft Item Previews in Batches
// ============================================================================

describe('Batch Item Shape', () => {
  it('draft batch items have kind=draft with preview text', () => {
    const longContent = 'Patient presents with cough for 5 days. Cough is non-productive and worse at night. No fever or shortness of breath.';
    const state = stateWith({
      drafts: {
        'd1': makeDraft({ id: 'd1', content: longContent }),
      },
    });
    const batch = selectProcessingBatches(state).find(b => b.type === 'ai-drafts')!;
    const item = batch.items[0];
    expect(item.kind).toBe('draft');
    if (item.kind === 'draft') {
      expect(item.draftId).toBe('d1');
      expect(item.preview.length).toBeLessThanOrEqual(63); // 60 chars + '...'
      expect(item.preview).toContain('Patient presents');
    }
  });

  it('task batch items have kind=task', () => {
    const medItem = makeMedicationItem();
    const task = makeTask({ id: 't1', trigger: { action: 'ITEM_ADDED', itemId: 'med-1' } });
    const state = stateWith({ items: { 'med-1': medItem }, tasks: { 't1': task } });
    const batch = selectProcessingBatches(state).find(b => b.type === 'prescriptions')!;
    const item = batch.items[0];
    expect(item.kind).toBe('task');
    if (item.kind === 'task') {
      expect(item.taskId).toBe('t1');
      expect(item.label).toBe('Link diagnosis to Amoxicillin');
    }
  });
});

// ============================================================================
// 7. Integration Tests — Phase 4d
// ============================================================================

describe('Integration: Draft Accept → Chart Item', () => {
  it('accepting a draft marks it accepted in state', () => {
    const draft = makeDraft({ id: 'draft-1', status: 'pending' });
    const state = stateWith({ drafts: { 'draft-1': draft } });

    const action = draftAccepted('draft-1');
    const newDrafts = draftsReducer(state.entities.drafts, action);
    expect(newDrafts['draft-1'].status).toBe('accepted');
  });

  it('accepted drafts no longer appear in active drafts', () => {
    const draft1 = makeDraft({ id: 'd1', status: 'pending' });
    const draft2 = makeDraft({ id: 'd2', status: 'pending', category: 'ros', label: 'ROS Draft' });
    let state = stateWith({ drafts: { 'd1': draft1, 'd2': draft2 } });

    // Accept draft 1
    const action = draftAccepted('d1');
    const newDrafts = draftsReducer(state.entities.drafts, action);
    state = stateWith({ drafts: newDrafts });

    expect(selectActiveDrafts(state)).toHaveLength(1);
    expect(selectActiveDrafts(state)[0].id).toBe('d2');
    expect(selectPendingDraftCount(state)).toBe(1);
  });

  it('accepted draft disappears from ai-drafts batch', () => {
    const draft = makeDraft({ id: 'd1', status: 'pending' });
    let state = stateWith({ drafts: { 'd1': draft } });

    // Before accept: 1 draft in batch
    let aiBatch = selectProcessingBatches(state).find(b => b.type === 'ai-drafts')!;
    expect(aiBatch.count).toBe(1);

    // Accept
    const newDrafts = draftsReducer(state.entities.drafts, draftAccepted('d1'));
    state = stateWith({ drafts: newDrafts });

    // After accept: 0 drafts in batch
    aiBatch = selectProcessingBatches(state).find(b => b.type === 'ai-drafts')!;
    expect(aiBatch.count).toBe(0);
    expect(aiBatch.aggregateStatus).toBe('idle');
  });
});

describe('Integration: Draft Generation → Batch Lifecycle', () => {
  it('generating draft appears in batch as in-progress, then pending switches to needs-attention', () => {
    // 1. Draft starts generating
    const generating = makeGeneratingDraft({ id: 'gen-1', category: 'hpi' });
    let state = stateWith({ drafts: { 'gen-1': generating } });
    let batch = selectProcessingBatches(state).find(b => b.type === 'ai-drafts')!;
    expect(batch.aggregateStatus).toBe('in-progress');

    // 2. Draft completes (becomes pending)
    const completed = { ...generating, status: 'pending' as const, content: 'Full HPI content here.' };
    state = stateWith({ drafts: { 'gen-1': completed } });
    batch = selectProcessingBatches(state).find(b => b.type === 'ai-drafts')!;
    expect(batch.aggregateStatus).toBe('needs-attention');
  });
});

describe('Integration: Auto-task Creation on Item Add', () => {
  it('TASK_TEMPLATES.medicationAdded creates 3 tasks for a medication', () => {
    const tasks = TASK_TEMPLATES.medicationAdded('med-1', 'Amoxicillin 500mg');
    expect(tasks).toHaveLength(3);
    const types = tasks.map(t => t.type).sort();
    expect(types).toEqual(['drug-interaction', 'dx-association', 'formulary-check']);
  });

  it('TASK_TEMPLATES.labAdded creates 2 tasks for a lab', () => {
    const tasks = TASK_TEMPLATES.labAdded('lab-1', 'CBC');
    expect(tasks).toHaveLength(2);
    const types = tasks.map(t => t.type).sort();
    expect(types).toEqual(['care-gap-evaluation', 'dx-association']);
  });

  it('TASK_TEMPLATES.imagingAdded creates 2 tasks for imaging', () => {
    const tasks = TASK_TEMPLATES.imagingAdded('img-1', 'Chest X-Ray');
    expect(tasks).toHaveLength(2);
    const types = tasks.map(t => t.type).sort();
    expect(types).toEqual(['dx-association', 'prior-auth-check']);
  });

  it('medication tasks appear in prescriptions batch', () => {
    const medItem = makeMedicationItem({ id: 'med-rx' });
    const tasks = TASK_TEMPLATES.medicationAdded('med-rx', 'Amoxicillin 500mg');
    const taskMap: Record<string, BackgroundTask> = {};
    for (const t of tasks) {
      taskMap[t.id] = t;
    }

    const state = stateWith({ items: { 'med-rx': medItem }, tasks: taskMap });
    const rxBatch = selectProcessingBatches(state).find(b => b.type === 'prescriptions')!;
    expect(rxBatch.count).toBe(3);
    expect(rxBatch.aggregateStatus).not.toBe('idle');
  });

  it('lab tasks appear in labs batch', () => {
    const labItem = makeLabItem({ id: 'lab-cbc' });
    const tasks = TASK_TEMPLATES.labAdded('lab-cbc', 'CBC');
    const taskMap: Record<string, BackgroundTask> = {};
    for (const t of tasks) {
      taskMap[t.id] = t;
    }

    const state = stateWith({ items: { 'lab-cbc': labItem }, tasks: taskMap });
    const labBatch = selectProcessingBatches(state).find(b => b.type === 'labs')!;
    expect(labBatch.count).toBe(2);
  });
});

describe('Integration: Full Draft Lifecycle Through Reducer', () => {
  it('draft generate → accept flow through rootReducer', () => {
    const baseState = createInitialState();
    const draft = makeDraft({ id: 'draft-lifecycle', status: 'generating', content: '' });

    // 1. Generate draft
    const afterGenerate = rootReducer(baseState, draftGenerated(draft));
    expect(afterGenerate.entities.drafts['draft-lifecycle']).toBeDefined();
    expect(afterGenerate.entities.drafts['draft-lifecycle'].status).toBe('generating');

    // 2. Update to pending (simulate content ready — via a second DRAFT_GENERATED with content)
    const readyDraft = { ...draft, status: 'pending' as const, content: 'Full content' };
    const afterReady = rootReducer(afterGenerate, draftGenerated(readyDraft));
    expect(afterReady.entities.drafts['draft-lifecycle'].status).toBe('pending');
    expect(afterReady.entities.drafts['draft-lifecycle'].content).toBe('Full content');

    // 3. Accept draft
    const afterAccept = rootReducer(afterReady, draftAccepted('draft-lifecycle'));
    expect(afterAccept.entities.drafts['draft-lifecycle'].status).toBe('accepted');

    // 4. Verify no longer in active/pending selectors
    expect(selectActiveDrafts(afterAccept)).toHaveLength(0);
    expect(selectPendingDraftCount(afterAccept)).toBe(0);
  });
});
