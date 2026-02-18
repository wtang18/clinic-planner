/**
 * Details Pane + Activity Log Tests — Phase 3
 *
 * Tests for:
 * 1. Activity log utilities (createLogEntry, formatLogTimestamp, describeFieldChanges)
 * 2. Reducer activity log appending (auto-generated entries on item mutations)
 * 3. Delete item action
 */

import { describe, it, expect } from 'vitest';
import { createLogEntry, formatLogTimestamp, describeFieldChanges } from '../../utils/activity-log';
import { itemsReducer } from '../../state/reducers/entities';
import type { ChartItem, MedicationItem, LabItem, ActivityLogEntry } from '../../types/chart-items';

// ============================================================================
// Test Helpers
// ============================================================================

function makeMedicationItem(overrides?: Partial<MedicationItem>): MedicationItem {
  return {
    id: 'med-1',
    category: 'medication',
    displayText: 'Amoxicillin 500mg PO TID',
    displaySubtext: 'Take 1 capsule by mouth three times daily',
    createdAt: new Date('2024-01-15T10:00:00'),
    createdBy: { id: 'user-1', name: 'Dr. Anderson' },
    modifiedAt: new Date('2024-01-15T10:00:00'),
    modifiedBy: { id: 'user-1', name: 'Dr. Anderson' },
    source: { type: 'manual' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [{
      timestamp: new Date('2024-01-15T10:00:00'),
      action: 'created',
      actor: 'Dr. Anderson',
      details: 'Added via OmniAdd (medication)',
    }],
    _meta: {
      syncStatus: 'synced',
      aiGenerated: false,
      requiresReview: false,
      reviewed: true,
    },
    data: {
      drugName: 'Amoxicillin',
      dosage: '500mg',
      route: 'PO',
      frequency: 'TID',
      sig: 'Take 1 capsule by mouth three times daily',
      daw: false,
      quantity: 30,
      refills: 0,
      duration: '10 days',
      isControlled: false,
      prescriptionType: 'new',
    },
    ...overrides,
  } as MedicationItem;
}

function makeLabItem(overrides?: Partial<LabItem>): LabItem {
  return {
    id: 'lab-1',
    category: 'lab',
    displayText: 'CBC with Differential',
    createdAt: new Date('2024-01-15T10:00:00'),
    createdBy: { id: 'user-1', name: 'Dr. Anderson' },
    modifiedAt: new Date('2024-01-15T10:00:00'),
    modifiedBy: { id: 'user-1', name: 'Dr. Anderson' },
    source: { type: 'manual' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [{
      timestamp: new Date('2024-01-15T10:00:00'),
      action: 'created',
      actor: 'Dr. Anderson',
    }],
    _meta: {
      syncStatus: 'synced',
      aiGenerated: false,
      requiresReview: false,
      reviewed: true,
    },
    data: {
      testName: 'CBC with Differential',
      priority: 'routine',
      collectionType: 'in-house',
      orderStatus: 'draft',
      fastingRequired: false,
    },
    ...overrides,
  } as LabItem;
}

// ============================================================================
// Activity Log Utilities: createLogEntry
// ============================================================================

describe('createLogEntry', () => {
  it('creates entry with correct shape', () => {
    const entry = createLogEntry('edited', 'Dr. Anderson', 'Changed dosage');
    expect(entry).toMatchObject({
      action: 'edited',
      actor: 'Dr. Anderson',
      details: 'Changed dosage',
    });
    expect(entry.timestamp).toBeInstanceOf(Date);
  });

  it('omits details when not provided', () => {
    const entry = createLogEntry('confirmed', 'Dr. Anderson');
    expect(entry.action).toBe('confirmed');
    expect(entry.actor).toBe('Dr. Anderson');
    expect(entry).not.toHaveProperty('details');
  });

  it('includes details when explicitly undefined', () => {
    const entry = createLogEntry('created', 'System');
    expect(entry).not.toHaveProperty('details');
  });
});

// ============================================================================
// Activity Log Utilities: formatLogTimestamp
// ============================================================================

describe('formatLogTimestamp', () => {
  it('formats morning time', () => {
    const date = new Date('2024-01-15T10:02:00');
    expect(formatLogTimestamp(date)).toBe('10:02a');
  });

  it('formats afternoon time', () => {
    const date = new Date('2024-01-15T14:15:00');
    expect(formatLogTimestamp(date)).toBe('2:15p');
  });

  it('formats noon', () => {
    const date = new Date('2024-01-15T12:00:00');
    expect(formatLogTimestamp(date)).toBe('12:00p');
  });

  it('formats midnight', () => {
    const date = new Date('2024-01-15T00:00:00');
    expect(formatLogTimestamp(date)).toBe('12:00a');
  });

  it('formats single-digit hour without leading zero', () => {
    const date = new Date('2024-01-15T09:05:00');
    expect(formatLogTimestamp(date)).toBe('9:05a');
  });

  it('pads single-digit minutes with zero', () => {
    const date = new Date('2024-01-15T10:03:00');
    expect(formatLogTimestamp(date)).toBe('10:03a');
  });
});

// ============================================================================
// Activity Log Utilities: describeFieldChanges
// ============================================================================

describe('describeFieldChanges', () => {
  it('describes a single field change', () => {
    const result = describeFieldChanges(
      { dosage: '100mg' },
      { dosage: '200mg' }
    );
    expect(result).toBe("Changed dosage from '100mg' to '200mg'");
  });

  it('describes multiple field changes', () => {
    const result = describeFieldChanges(
      { dosage: '100mg', frequency: 'TID' },
      { dosage: '200mg', frequency: 'BID' }
    );
    expect(result).toContain("Changed dosage from '100mg' to '200mg'");
    expect(result).toContain("Changed frequency from 'TID' to 'BID'");
  });

  it('skips unchanged fields', () => {
    const result = describeFieldChanges(
      { dosage: '100mg', route: 'PO' },
      { dosage: '100mg', route: 'PO' }
    );
    expect(result).toBe('');
  });

  it('skips internal fields (modifiedAt, activityLog, _meta)', () => {
    const result = describeFieldChanges(
      { dosage: '100mg', modifiedAt: new Date() },
      { dosage: '200mg', modifiedAt: new Date(), activityLog: [] }
    );
    expect(result).toBe("Changed dosage from '100mg' to '200mg'");
    expect(result).not.toContain('modifiedAt');
    expect(result).not.toContain('activityLog');
  });

  it('uses custom label map when provided', () => {
    const result = describeFieldChanges(
      { daw: false },
      { daw: true },
      { daw: 'Dispense As Written' }
    );
    expect(result).toBe("Changed Dispense As Written from 'no' to 'yes'");
  });

  it('handles null/undefined values', () => {
    const result = describeFieldChanges(
      { specialInstructions: undefined },
      { specialInstructions: 'Fasting required' }
    );
    expect(result).toBe("Changed special instructions from 'none' to 'Fasting required'");
  });

  it('recurses into nested data object', () => {
    const result = describeFieldChanges(
      { data: { dosage: '100mg', route: 'PO' } },
      { data: { dosage: '200mg', route: 'PO' } }
    );
    expect(result).toBe("Changed dosage from '100mg' to '200mg'");
  });

  it('returns empty string when no changes', () => {
    const result = describeFieldChanges({}, {});
    expect(result).toBe('');
  });
});

// ============================================================================
// Reducer: ITEM_UPDATED appends activity log
// ============================================================================

describe('itemsReducer — activity log appending', () => {
  it('appends edit log entry on ITEM_UPDATED (user-edit)', () => {
    const state: Record<string, ChartItem> = { 'med-1': makeMedicationItem() };

    const result = itemsReducer(state, {
      type: 'ITEM_UPDATED',
      payload: {
        id: 'med-1',
        changes: { displayText: 'Amoxicillin 250mg PO TID' },
        reason: 'user-edit',
        actor: 'Dr. Anderson',
      },
    });

    const item = result['med-1'];
    expect(item.activityLog).toHaveLength(2);
    expect(item.activityLog[1].action).toBe('edited');
    expect(item.activityLog[1].actor).toBe('Dr. Anderson');
  });

  it('appends AI enrichment log entry on ITEM_UPDATED (ai-enrichment)', () => {
    const state: Record<string, ChartItem> = { 'med-1': makeMedicationItem() };

    const result = itemsReducer(state, {
      type: 'ITEM_UPDATED',
      payload: {
        id: 'med-1',
        changes: { displaySubtext: 'AI-updated sig' },
        reason: 'ai-enrichment',
      },
    });

    const item = result['med-1'];
    expect(item.activityLog).toHaveLength(2);
    expect(item.activityLog[1].action).toBe('ai_enriched');
    expect(item.activityLog[1].details).toContain('AI enriched');
  });

  it('appends confirmed log entry on ITEM_CONFIRMED', () => {
    const state: Record<string, ChartItem> = { 'med-1': makeMedicationItem() };

    const result = itemsReducer(state, {
      type: 'ITEM_CONFIRMED',
      payload: { id: 'med-1' },
    });

    const item = result['med-1'];
    expect(item.activityLog).toHaveLength(2);
    expect(item.activityLog[1].action).toBe('confirmed');
  });

  it('appends cancelled log entry on ITEM_CANCELLED', () => {
    const state: Record<string, ChartItem> = { 'med-1': makeMedicationItem() };

    const result = itemsReducer(state, {
      type: 'ITEM_CANCELLED',
      payload: { id: 'med-1', reason: 'Patient declined' },
    });

    const item = result['med-1'];
    expect(item.activityLog).toHaveLength(2);
    expect(item.activityLog[1].action).toBe('cancelled');
    expect(item.activityLog[1].details).toBe('Patient declined');
  });

  it('appends dx_associated log entry on ITEM_DX_LINKED', () => {
    const state: Record<string, ChartItem> = { 'med-1': makeMedicationItem() };

    const result = itemsReducer(state, {
      type: 'ITEM_DX_LINKED',
      payload: { itemId: 'med-1', dxId: 'dx-acute-bronchitis' },
    });

    const item = result['med-1'];
    expect(item.activityLog).toHaveLength(2);
    expect(item.activityLog[1].action).toBe('dx_associated');
    expect(item.activityLog[1].details).toContain('dx-acute-bronchitis');
  });

  it('appends dx_removed log entry on ITEM_DX_UNLINKED', () => {
    const med = makeMedicationItem({ linkedDiagnoses: ['dx-1'] });
    const state: Record<string, ChartItem> = { 'med-1': med };

    const result = itemsReducer(state, {
      type: 'ITEM_DX_UNLINKED',
      payload: { itemId: 'med-1', dxId: 'dx-1' },
    });

    const item = result['med-1'];
    expect(item.activityLog).toHaveLength(2);
    expect(item.activityLog[1].action).toBe('dx_removed');
  });

  it('appends sent log entry on ITEM_SENT', () => {
    const state: Record<string, ChartItem> = { 'med-1': makeMedicationItem() };

    const result = itemsReducer(state, {
      type: 'ITEM_SENT',
      payload: { id: 'med-1', destination: 'CVS Pharmacy', method: 'e-prescribe' },
    });

    const item = result['med-1'];
    expect(item.activityLog).toHaveLength(2);
    expect(item.activityLog[1].action).toBe('sent');
    expect(item.activityLog[1].details).toContain('CVS Pharmacy');
    expect(item.activityLog[1].details).toContain('e-prescribe');
  });

  it('appends result_received log entry on ITEM_RESULT_RECEIVED (lab)', () => {
    const state: Record<string, ChartItem> = { 'lab-1': makeLabItem() };

    const result = itemsReducer(state, {
      type: 'ITEM_RESULT_RECEIVED',
      payload: { id: 'lab-1', result: [{ name: 'WBC', value: '8.5', unit: 'K/uL' }] },
    });

    const item = result['lab-1'];
    expect(item.activityLog).toHaveLength(2);
    expect(item.activityLog[1].action).toBe('result_received');
    expect(item.activityLog[1].details).toBe('Results received');
  });

  it('accumulates multiple log entries from sequential updates', () => {
    let state: Record<string, ChartItem> = { 'med-1': makeMedicationItem() };

    // First edit
    state = itemsReducer(state, {
      type: 'ITEM_UPDATED',
      payload: {
        id: 'med-1',
        changes: { displayText: 'Updated name' },
        reason: 'user-edit',
        actor: 'Dr. Anderson',
      },
    });

    // Second edit
    state = itemsReducer(state, {
      type: 'ITEM_UPDATED',
      payload: {
        id: 'med-1',
        changes: { displayText: 'Updated name again' },
        reason: 'user-edit',
        actor: 'Dr. Anderson',
      },
    });

    // Confirm
    state = itemsReducer(state, {
      type: 'ITEM_CONFIRMED',
      payload: { id: 'med-1' },
    });

    const item = state['med-1'];
    expect(item.activityLog).toHaveLength(4); // created + 2 edits + confirmed
    expect(item.activityLog[0].action).toBe('created');
    expect(item.activityLog[1].action).toBe('edited');
    expect(item.activityLog[2].action).toBe('edited');
    expect(item.activityLog[3].action).toBe('confirmed');
  });

  it('appends batch sent log entries for ITEMS_BATCH_SENT', () => {
    const state: Record<string, ChartItem> = {
      'med-1': makeMedicationItem(),
      'lab-1': makeLabItem(),
    };

    const result = itemsReducer(state, {
      type: 'ITEMS_BATCH_SENT',
      payload: { ids: ['med-1', 'lab-1'], destination: 'Quest Diagnostics' },
    });

    expect(result['med-1'].activityLog).toHaveLength(2);
    expect(result['med-1'].activityLog[1].action).toBe('sent');
    expect(result['lab-1'].activityLog).toHaveLength(2);
    expect(result['lab-1'].activityLog[1].details).toContain('Quest Diagnostics');
  });
});

// ============================================================================
// Reducer: ITEM_DELETED removes item
// ============================================================================

describe('itemsReducer — ITEM_DELETED', () => {
  it('removes the item from state', () => {
    const state: Record<string, ChartItem> = {
      'med-1': makeMedicationItem(),
      'lab-1': makeLabItem(),
    };

    const result = itemsReducer(state, {
      type: 'ITEM_DELETED',
      payload: { id: 'med-1' },
    });

    expect(result).not.toHaveProperty('med-1');
    expect(result).toHaveProperty('lab-1');
  });

  it('no-ops for non-existent item', () => {
    const state: Record<string, ChartItem> = { 'med-1': makeMedicationItem() };

    const result = itemsReducer(state, {
      type: 'ITEM_DELETED',
      payload: { id: 'nonexistent' },
    });

    expect(result).toEqual(state);
  });
});

// ============================================================================
// Reducer: no-op guards
// ============================================================================

describe('itemsReducer — no-op guards', () => {
  it('ITEM_UPDATED no-ops for non-existent item', () => {
    const state: Record<string, ChartItem> = {};

    const result = itemsReducer(state, {
      type: 'ITEM_UPDATED',
      payload: { id: 'nonexistent', changes: {}, reason: 'user-edit' },
    });

    expect(result).toBe(state);
  });

  it('ITEM_DX_LINKED no-ops if dx already linked', () => {
    const med = makeMedicationItem({ linkedDiagnoses: ['dx-1'] });
    const state: Record<string, ChartItem> = { 'med-1': med };

    const result = itemsReducer(state, {
      type: 'ITEM_DX_LINKED',
      payload: { itemId: 'med-1', dxId: 'dx-1' },
    });

    expect(result).toBe(state); // Same reference = no mutation
  });
});
