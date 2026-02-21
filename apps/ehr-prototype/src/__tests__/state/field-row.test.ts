/**
 * FieldRow + FieldOptionPills Tests
 *
 * Tests for the V2 field row components: pill rendering, selection states
 * (unselected vs pre-selected), custom "Other" input, and keyboard navigation.
 */

import { describe, it, expect, vi } from 'vitest';

// We test the field config logic rather than React rendering,
// since we don't have a DOM test environment. The component tests
// verify the data flow through field configs.

import { RxFieldDef } from '../../components/omni-add/fields/RxFields';
import { LabFieldDef } from '../../components/omni-add/fields/LabFields';
import { DxFieldDef } from '../../components/omni-add/fields/DxFields';
import { getFieldDef } from '../../components/omni-add/fields';
import type { QuickPickItem } from '../../data/mock-quick-picks';

// ============================================================================
// Test Fixtures
// ============================================================================

const rxItem: QuickPickItem = {
  id: 'rx-benzonatate',
  label: 'Benzonatate 100mg',
  chipLabel: 'Benzonatate',
  category: 'medication',
  data: {
    drugName: 'Benzonatate',
    dosage: '100mg',
    route: 'PO',
    frequency: 'TID PRN',
    duration: '7 days',
    quantity: 21,
    refills: 0,
  },
};

const labItem: QuickPickItem = {
  id: 'lab-cbc',
  label: 'Complete Blood Count',
  chipLabel: 'CBC',
  category: 'lab',
  data: {
    testName: 'Complete Blood Count',
    testCode: '58410-2',
    priority: 'routine',
    collectionType: 'in-house',
  },
};

const dxItem: QuickPickItem = {
  id: 'dx-bronchitis',
  label: 'Acute Bronchitis',
  chipLabel: 'Acute Bronchitis',
  category: 'diagnosis',
  data: {
    description: 'Acute Bronchitis',
    icdCode: 'J20.9',
    ranking: 'primary',
    type: 'encounter',
    clinicalStatus: 'active',
  },
};

// ============================================================================
// Field Config Registry
// ============================================================================

describe('Field config registry', () => {
  it('returns RxFieldDef for medication', () => {
    expect(getFieldDef('medication')).toBe(RxFieldDef);
  });

  it('returns LabFieldDef for lab', () => {
    expect(getFieldDef('lab')).toBe(LabFieldDef);
  });

  it('returns DxFieldDef for diagnosis', () => {
    expect(getFieldDef('diagnosis')).toBe(DxFieldDef);
  });

  it('returns undefined for narrative category', () => {
    expect(getFieldDef('chief-complaint')).toBeUndefined();
  });

  it('returns undefined for vitals', () => {
    expect(getFieldDef('vitals')).toBeUndefined();
  });
});

// ============================================================================
// Rx Fields
// ============================================================================

describe('RxFieldDef', () => {
  it('returns 4 field configs', () => {
    const fields = RxFieldDef.getFields(rxItem);
    expect(fields).toHaveLength(4);
    expect(fields.map(f => f.key)).toEqual(['dosage', 'route', 'frequency', 'duration']);
  });

  it('dosage options include item default', () => {
    const fields = RxFieldDef.getFields(rxItem);
    const dosageField = fields.find(f => f.key === 'dosage')!;
    expect(dosageField.options.some(o => o.value === '100mg')).toBe(true);
    expect(dosageField.allowOther).toBe(true);
  });

  it('route has 8 options', () => {
    const fields = RxFieldDef.getFields(rxItem);
    const routeField = fields.find(f => f.key === 'route')!;
    expect(routeField.options).toHaveLength(8);
    expect(routeField.options.map(o => o.value)).toContain('PO');
    expect(routeField.options.map(o => o.value)).toContain('IM');
  });

  it('frequency has 8 options with allowOther', () => {
    const fields = RxFieldDef.getFields(rxItem);
    const freqField = fields.find(f => f.key === 'frequency')!;
    expect(freqField.options).toHaveLength(8);
    expect(freqField.allowOther).toBe(true);
  });

  it('duration has 6 options with allowOther', () => {
    const fields = RxFieldDef.getFields(rxItem);
    const durField = fields.find(f => f.key === 'duration')!;
    expect(durField.options).toHaveLength(6);
    expect(durField.allowOther).toBe(true);
  });

  it('getDefaults extracts values from item data', () => {
    const defaults = RxFieldDef.getDefaults(rxItem);
    expect(defaults).toEqual({
      dosage: '100mg',
      route: 'PO',
      frequency: 'TID PRN',
      duration: '7 days',
    });
  });

  it('buildData produces complete Rx data with auto-calc', () => {
    const data = RxFieldDef.buildData(
      { dosage: '200mg', route: 'PO', frequency: 'BID', duration: '10 days' },
      rxItem,
    );
    expect(data.dosage).toBe('200mg');
    expect(data.route).toBe('PO');
    expect(data.frequency).toBe('BID');
    expect(data.duration).toBe('10 days');
    expect(data.quantity).toBe(20); // BID × 10 days = 20
    expect(data.sig).toContain('200mg');
    expect(data.sig).toContain('twice daily');
    expect(data.daw).toBe(false);
  });

  it('buildData preserves item baseline data', () => {
    const data = RxFieldDef.buildData(RxFieldDef.getDefaults(rxItem), rxItem);
    expect(data.drugName).toBe('Benzonatate');
    expect(data.refills).toBe(0);
  });

  it('buildData auto-calculates quantity from frequency + duration', () => {
    const data = RxFieldDef.buildData(
      { dosage: '100mg', route: 'PO', frequency: 'daily', duration: '30 days' },
      rxItem,
    );
    expect(data.quantity).toBe(30);
  });
});

// ============================================================================
// Lab Fields
// ============================================================================

describe('LabFieldDef', () => {
  it('returns 2 field configs', () => {
    const fields = LabFieldDef.getFields(labItem);
    expect(fields).toHaveLength(2);
    expect(fields.map(f => f.key)).toEqual(['priority', 'collectionType']);
  });

  it('priority has 3 options', () => {
    const fields = LabFieldDef.getFields(labItem);
    const priorityField = fields.find(f => f.key === 'priority')!;
    expect(priorityField.options).toHaveLength(3);
    expect(priorityField.options.map(o => o.value)).toEqual(['routine', 'urgent', 'stat']);
  });

  it('collection has 2 options', () => {
    const fields = LabFieldDef.getFields(labItem);
    const collField = fields.find(f => f.key === 'collectionType')!;
    expect(collField.options).toHaveLength(2);
  });

  it('getDefaults extracts values from item data', () => {
    const defaults = LabFieldDef.getDefaults(labItem);
    expect(defaults).toEqual({
      priority: 'routine',
      collectionType: 'in-house',
    });
  });

  it('buildData produces lab data with orderStatus', () => {
    const data = LabFieldDef.buildData(
      { priority: 'stat', collectionType: 'in-house' },
      labItem,
    );
    expect(data.priority).toBe('stat');
    expect(data.collectionType).toBe('in-house');
    expect(data.orderStatus).toBe('draft');
  });

  it('buildData preserves item baseline data', () => {
    const data = LabFieldDef.buildData(LabFieldDef.getDefaults(labItem), labItem);
    expect(data.testName).toBe('Complete Blood Count');
    expect(data.testCode).toBe('58410-2');
  });
});

// ============================================================================
// Dx Fields
// ============================================================================

describe('DxFieldDef', () => {
  it('returns 3 field configs', () => {
    const fields = DxFieldDef.getFields(dxItem);
    expect(fields).toHaveLength(3);
    expect(fields.map(f => f.key)).toEqual(['ranking', 'type', 'clinicalStatus']);
  });

  it('designation has 2 options', () => {
    const fields = DxFieldDef.getFields(dxItem);
    const rankField = fields.find(f => f.key === 'ranking')!;
    expect(rankField.options).toHaveLength(2);
    expect(rankField.options.map(o => o.value)).toEqual(['primary', 'secondary']);
  });

  it('type has 3 options', () => {
    const fields = DxFieldDef.getFields(dxItem);
    const typeField = fields.find(f => f.key === 'type')!;
    expect(typeField.options).toHaveLength(3);
  });

  it('clinical status has 3 options', () => {
    const fields = DxFieldDef.getFields(dxItem);
    const statusField = fields.find(f => f.key === 'clinicalStatus')!;
    expect(statusField.options).toHaveLength(3);
  });

  it('getDefaults extracts values from item data', () => {
    const defaults = DxFieldDef.getDefaults(dxItem);
    expect(defaults).toEqual({
      ranking: 'primary',
      type: 'encounter',
      clinicalStatus: 'active',
    });
  });

  it('buildData produces dx data with onsetDate', () => {
    const data = DxFieldDef.buildData(
      { ranking: 'secondary', type: 'chronic', clinicalStatus: 'active' },
      dxItem,
    );
    expect(data.ranking).toBe('secondary');
    expect(data.type).toBe('chronic');
    expect(data.clinicalStatus).toBe('active');
    expect(data.onsetDate).toBeDefined();
  });

  it('buildData preserves item baseline data', () => {
    const data = DxFieldDef.buildData(DxFieldDef.getDefaults(dxItem), dxItem);
    expect(data.description).toBe('Acute Bronchitis');
    expect(data.icdCode).toBe('J20.9');
  });
});
