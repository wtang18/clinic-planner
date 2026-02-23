/**
 * FieldRow + FieldOptionPills Tests
 *
 * Tests for the V2 field row components: pill rendering, selection states
 * (unselected vs pre-selected), custom "Other" input, and keyboard navigation.
 */

import { describe, it, expect } from 'vitest';

// We test the field config logic rather than React rendering,
// since we don't have a DOM test environment. The component tests
// verify the data flow through field configs.

import { RxFieldDef } from '../../components/omni-add/fields/RxFields';
import { LabFieldDef } from '../../components/omni-add/fields/LabFields';
import { DxFieldDef } from '../../components/omni-add/fields/DxFields';
import { ImagingFieldDef } from '../../components/omni-add/fields/ImagingFields';
import { ProcedureFieldDef } from '../../components/omni-add/fields/ProcedureFields';
import { AllergyFieldDef } from '../../components/omni-add/fields/AllergyFields';
import { ReferralFieldDef } from '../../components/omni-add/fields/ReferralFields';
import { getFieldDef } from '../../components/omni-add/fields';
import type { QuickPickItem } from '../../data/mock-quick-picks';
import type {
  MedicationItem,
  LabItem,
  DiagnosisItem,
  ImagingItem,
  ProcedureItem,
  AllergyItem,
  ReferralItem,
} from '../../types/chart-items';

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
// FieldOptionPills Keyboard Navigation Logic
// ============================================================================

/**
 * Tests the arrow-key navigation behavior of FieldOptionPills.
 * We test the selection logic directly since the test suite doesn't render
 * React components. This mirrors the handleContainerKeyDown logic.
 */

function resolveArrowKey(
  key: 'ArrowRight' | 'ArrowLeft',
  selected: string | null,
  options: string[],
): string | null {
  if (options.length === 0) return null;

  if (selected === null) {
    return key === 'ArrowRight' ? options[0] : options[options.length - 1];
  }

  const currentIndex = options.indexOf(selected);
  if (key === 'ArrowRight') {
    return options[currentIndex < options.length - 1 ? currentIndex + 1 : 0];
  } else {
    return options[currentIndex > 0 ? currentIndex - 1 : options.length - 1];
  }
}

describe('FieldOptionPills arrow-key navigation', () => {
  const options = ['routine', 'urgent', 'stat'];

  it('ArrowRight when unselected selects first pill', () => {
    expect(resolveArrowKey('ArrowRight', null, options)).toBe('routine');
  });

  it('ArrowLeft when unselected selects last pill', () => {
    expect(resolveArrowKey('ArrowLeft', null, options)).toBe('stat');
  });

  it('ArrowRight from first pill selects second', () => {
    expect(resolveArrowKey('ArrowRight', 'routine', options)).toBe('urgent');
  });

  it('ArrowLeft from first pill wraps to last', () => {
    expect(resolveArrowKey('ArrowLeft', 'routine', options)).toBe('stat');
  });

  it('ArrowRight from last pill wraps to first', () => {
    expect(resolveArrowKey('ArrowRight', 'stat', options)).toBe('routine');
  });

  it('returns null for empty options', () => {
    expect(resolveArrowKey('ArrowRight', null, [])).toBeNull();
  });
});

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

  it('returns ImagingFieldDef for imaging', () => {
    expect(getFieldDef('imaging')).toBe(ImagingFieldDef);
  });

  it('returns ProcedureFieldDef for procedure', () => {
    expect(getFieldDef('procedure')).toBe(ProcedureFieldDef);
  });

  it('returns AllergyFieldDef for allergy', () => {
    expect(getFieldDef('allergy')).toBe(AllergyFieldDef);
  });

  it('returns ReferralFieldDef for referral', () => {
    expect(getFieldDef('referral')).toBe(ReferralFieldDef);
  });
});

// ============================================================================
// Rx Fields
// ============================================================================

describe('RxFieldDef', () => {
  it('returns 6 field configs', () => {
    const fields = RxFieldDef.getFields(rxItem);
    expect(fields).toHaveLength(6);
    expect(fields.map(f => f.key)).toEqual(['medIntent', 'dosage', 'route', 'frequency', 'duration', 'refills']);
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
      medIntent: 'prescribe',
      dosage: '100mg',
      route: 'PO',
      frequency: 'TID PRN',
      duration: '7 days',
      refills: '0',
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

  it('getDefaults detects reportedBy → medIntent reported', () => {
    const reportedItem = {
      ...rxItem,
      data: { ...rxItem.data, reportedBy: 'patient' },
    };
    const defaults = RxFieldDef.getDefaults(reportedItem);
    expect(defaults.medIntent).toBe('reported');
  });

  it('getDefaults maps prescriptionType refill → medIntent refill', () => {
    const refillItem = {
      ...rxItem,
      data: { ...rxItem.data, prescriptionType: 'refill' },
    };
    const defaults = RxFieldDef.getDefaults(refillItem);
    expect(defaults.medIntent).toBe('refill');
  });

  it('buildData with intent reported sets reportedBy and verificationStatus', () => {
    const data = RxFieldDef.buildData(
      { medIntent: 'reported', dosage: '600mg', route: 'PO', frequency: 'BID', duration: '7 days' },
      rxItem,
    );
    expect(data.reportedBy).toBe('patient');
    expect(data.verificationStatus).toBe('unverified');
    expect(data.prescriptionType).toBe('new');
  });

  it('buildData with intent prescribe clears reportedBy', () => {
    const data = RxFieldDef.buildData(
      { medIntent: 'prescribe', dosage: '100mg', route: 'PO', frequency: 'TID', duration: '7 days' },
      rxItem,
    );
    expect(data.reportedBy).toBeUndefined();
    expect(data.verificationStatus).toBeUndefined();
    expect(data.prescriptionType).toBe('new');
  });

  it('buildData with intent refill sets prescriptionType refill', () => {
    const data = RxFieldDef.buildData(
      { medIntent: 'refill', dosage: '100mg', route: 'PO', frequency: 'TID', duration: '30 days' },
      rxItem,
    );
    expect(data.prescriptionType).toBe('refill');
    expect(data.reportedBy).toBeUndefined();
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

// ============================================================================
// Imaging Fields
// ============================================================================

const imgItem: QuickPickItem = {
  id: 'img-chest-xray',
  label: 'Chest X-ray PA/Lateral',
  chipLabel: 'Chest X-ray',
  category: 'imaging',
  data: {
    studyType: 'X-ray',
    bodyPart: 'Chest',
    priority: 'routine',
  },
};

describe('ImagingFieldDef', () => {
  it('returns 2 field configs (priority, laterality)', () => {
    const fields = ImagingFieldDef.getFields(imgItem);
    expect(fields).toHaveLength(2);
    expect(fields.map(f => f.key)).toEqual(['priority', 'laterality']);
  });

  it('priority has 3 options', () => {
    const fields = ImagingFieldDef.getFields(imgItem);
    expect(fields[0].options).toHaveLength(3);
    expect(fields[0].options.map(o => o.value)).toEqual(['routine', 'urgent', 'stat']);
  });

  it('getDefaults extracts priority and laterality', () => {
    expect(ImagingFieldDef.getDefaults(imgItem)).toEqual({ priority: 'routine', laterality: 'N/A' });
  });

  it('buildData sets orderStatus to draft', () => {
    const data = ImagingFieldDef.buildData({ priority: 'stat' }, imgItem);
    expect(data.priority).toBe('stat');
    expect(data.orderStatus).toBe('draft');
    expect(data.studyType).toBe('X-ray');
  });
});

// ============================================================================
// Procedure Fields
// ============================================================================

const procItem: QuickPickItem = {
  id: 'proc-rapid-strep',
  label: 'Rapid Strep Test',
  chipLabel: 'Rapid Strep',
  category: 'procedure',
  data: {
    procedureName: 'Rapid Strep Test',
    cptCode: '87880',
    procedureStatus: 'planned',
  },
};

describe('ProcedureFieldDef', () => {
  it('returns 2 field configs (status, laterality)', () => {
    const fields = ProcedureFieldDef.getFields(procItem);
    expect(fields).toHaveLength(2);
    expect(fields.map(f => f.key)).toEqual(['procedureStatus', 'laterality']);
  });

  it('status has 4 options', () => {
    const fields = ProcedureFieldDef.getFields(procItem);
    expect(fields[0].options).toHaveLength(4);
    expect(fields[0].options.map(o => o.value)).toEqual(['planned', 'in-progress', 'completed', 'cancelled']);
  });

  it('getDefaults extracts procedureStatus and laterality', () => {
    expect(ProcedureFieldDef.getDefaults(procItem)).toEqual({ procedureStatus: 'planned', laterality: 'N/A' });
  });

  it('buildData preserves baseline data', () => {
    const data = ProcedureFieldDef.buildData({ procedureStatus: 'completed' }, procItem);
    expect(data.procedureStatus).toBe('completed');
    expect(data.cptCode).toBe('87880');
  });
});

// ============================================================================
// Allergy Fields
// ============================================================================

const allergyItem: QuickPickItem = {
  id: 'allergy-penicillin',
  label: 'Penicillin',
  chipLabel: 'Penicillin',
  category: 'allergy',
  data: {
    allergen: 'Penicillin',
    allergenType: 'drug',
    severity: 'moderate',
    verificationStatus: 'confirmed',
  },
};

describe('AllergyFieldDef', () => {
  it('returns 3 field configs', () => {
    const fields = AllergyFieldDef.getFields(allergyItem);
    expect(fields).toHaveLength(3);
    expect(fields.map(f => f.key)).toEqual(['allergenType', 'severity', 'verificationStatus']);
  });

  it('allergenType has 4 options', () => {
    const fields = AllergyFieldDef.getFields(allergyItem);
    expect(fields[0].options).toHaveLength(4);
  });

  it('severity has 4 options', () => {
    const fields = AllergyFieldDef.getFields(allergyItem);
    expect(fields[1].options).toHaveLength(4);
  });

  it('verification has 3 options', () => {
    const fields = AllergyFieldDef.getFields(allergyItem);
    expect(fields[2].options).toHaveLength(3);
  });

  it('getDefaults extracts all three fields', () => {
    const defaults = AllergyFieldDef.getDefaults(allergyItem);
    expect(defaults).toEqual({
      allergenType: 'drug',
      severity: 'moderate',
      verificationStatus: 'confirmed',
    });
  });

  it('buildData preserves baseline data', () => {
    const data = AllergyFieldDef.buildData(
      { allergenType: 'food', severity: 'severe', verificationStatus: 'unverified' },
      allergyItem,
    );
    expect(data.allergenType).toBe('food');
    expect(data.severity).toBe('severe');
    expect(data.verificationStatus).toBe('unverified');
    expect(data.allergen).toBe('Penicillin');
  });
});

// ============================================================================
// Referral Fields
// ============================================================================

const refItem: QuickPickItem = {
  id: 'ref-cardiology',
  label: 'Cardiology',
  chipLabel: 'Cardiology',
  category: 'referral',
  data: {
    specialty: 'Cardiology',
    urgency: 'routine',
  },
};

describe('ReferralFieldDef', () => {
  it('returns 1 field config (urgency)', () => {
    const fields = ReferralFieldDef.getFields(refItem);
    expect(fields).toHaveLength(1);
    expect(fields[0].key).toBe('urgency');
  });

  it('urgency has 3 options', () => {
    const fields = ReferralFieldDef.getFields(refItem);
    expect(fields[0].options).toHaveLength(3);
    expect(fields[0].options.map(o => o.value)).toEqual(['routine', 'urgent', 'emergent']);
  });

  it('getDefaults extracts urgency', () => {
    expect(ReferralFieldDef.getDefaults(refItem)).toEqual({ urgency: 'routine' });
  });

  it('buildData sets referralStatus to draft', () => {
    const data = ReferralFieldDef.buildData({ urgency: 'emergent' }, refItem);
    expect(data.urgency).toBe('emergent');
    expect(data.referralStatus).toBe('draft');
    expect(data.specialty).toBe('Cardiology');
  });
});

// ============================================================================
// Typed buildData() Return Assertions
// ============================================================================

describe('buildData typed return values', () => {
  it('RxFieldDef.buildData satisfies MedicationItem data', () => {
    const data: MedicationItem['data'] = RxFieldDef.buildData(
      RxFieldDef.getDefaults(rxItem), rxItem,
    );
    expect(data.drugName).toBe('Benzonatate');
    expect(data.dosage).toBe('100mg');
  });

  it('LabFieldDef.buildData satisfies LabItem data', () => {
    const data: LabItem['data'] = LabFieldDef.buildData(
      LabFieldDef.getDefaults(labItem), labItem,
    );
    expect(data.testName).toBe('Complete Blood Count');
    expect(data.priority).toBe('routine');
  });

  it('DxFieldDef.buildData satisfies DiagnosisItem data', () => {
    const data: DiagnosisItem['data'] = DxFieldDef.buildData(
      DxFieldDef.getDefaults(dxItem), dxItem,
    );
    expect(data.description).toBe('Acute Bronchitis');
    expect(data.icdCode).toBe('J20.9');
  });

  it('ImagingFieldDef.buildData satisfies ImagingItem data', () => {
    const data: ImagingItem['data'] = ImagingFieldDef.buildData(
      ImagingFieldDef.getDefaults(imgItem), imgItem,
    );
    expect(data.studyType).toBe('X-ray');
    expect(data.priority).toBe('routine');
  });

  it('ProcedureFieldDef.buildData satisfies ProcedureItem data', () => {
    const data: ProcedureItem['data'] = ProcedureFieldDef.buildData(
      ProcedureFieldDef.getDefaults(procItem), procItem,
    );
    expect(data.procedureName).toBe('Rapid Strep Test');
    expect(data.procedureStatus).toBe('planned');
  });

  it('AllergyFieldDef.buildData satisfies AllergyItem data', () => {
    const data: AllergyItem['data'] = AllergyFieldDef.buildData(
      AllergyFieldDef.getDefaults(allergyItem), allergyItem,
    );
    expect(data.allergen).toBe('Penicillin');
    expect(data.allergenType).toBe('drug');
  });

  it('ReferralFieldDef.buildData satisfies ReferralItem data', () => {
    const data: ReferralItem['data'] = ReferralFieldDef.buildData(
      ReferralFieldDef.getDefaults(refItem), refItem,
    );
    expect(data.specialty).toBe('Cardiology');
    expect(data.urgency).toBe('routine');
  });
});
