/**
 * Detail Forms Tests
 *
 * Tests for Phase 2 detail form logic:
 * - Rx auto-calculation (sig generation, quantity calculation)
 * - Smart defaults (quick-pick data pre-fills form fields)
 * - Mock data completeness (all items have required fields)
 */

import { describe, it, expect } from 'vitest';
import { generateSig, calculateQuantity } from '../../components/omni-add/form/rx-helpers';
import { getQuickPicks, searchAllCategories, searchCategory } from '../../data/mock-quick-picks';

// ============================================================================
// Rx Auto-Calculation: generateSig
// ============================================================================

describe('generateSig', () => {
  it('generates sig for oral medication (PO)', () => {
    const sig = generateSig('100mg', 'PO', 'TID PRN');
    expect(sig).toBe('Take 1 tablet (100mg) by mouth three times daily as needed');
  });

  it('generates sig for inhaled medication', () => {
    const sig = generateSig('90mcg/actuation', 'Inhalation', 'Q4-6H PRN');
    expect(sig).toBe('Inhale 1 puff (90mcg/actuation) by inhalation every 4-6 hours as needed');
  });

  it('generates sig for daily oral medication', () => {
    const sig = generateSig('20mg', 'PO', 'daily');
    expect(sig).toBe('Take 1 tablet (20mg) by mouth once daily');
  });

  it('generates sig for topical medication', () => {
    const sig = generateSig('0.1%', 'topical', 'BID');
    expect(sig).toBe('Apply 1 application (0.1%) topically twice daily');
  });

  it('generates sig for IM medication', () => {
    const sig = generateSig('500mg', 'IM', 'daily');
    expect(sig).toBe('Take 1 dose (500mg) intramuscularly once daily');
  });

  it('generates sig for BID frequency', () => {
    const sig = generateSig('250mg', 'PO', 'BID');
    expect(sig).toBe('Take 1 tablet (250mg) by mouth twice daily');
  });

  it('generates sig for QHS (at bedtime)', () => {
    const sig = generateSig('10mg', 'PO', 'QHS');
    expect(sig).toBe('Take 1 tablet (10mg) by mouth at bedtime');
  });

  it('generates sig for "See Sig" frequency (pack instructions)', () => {
    const sig = generateSig('250mg', 'PO', 'See Sig');
    expect(sig).toBe('Take 1 tablet (250mg) by mouth as directed');
  });

  it('returns empty string when any field is empty', () => {
    expect(generateSig('', 'PO', 'daily')).toBe('');
    expect(generateSig('100mg', '', 'daily')).toBe('');
    expect(generateSig('100mg', 'PO', '')).toBe('');
  });

  it('handles unknown route gracefully', () => {
    const sig = generateSig('100mg', 'sublingual', 'daily');
    expect(sig).toContain('sublingual');
    expect(sig).toContain('100mg');
  });

  it('handles unknown frequency gracefully', () => {
    const sig = generateSig('100mg', 'PO', 'Q12H');
    expect(sig).toContain('q12h');
    expect(sig).toContain('100mg');
  });
});

// ============================================================================
// Rx Auto-Calculation: calculateQuantity
// ============================================================================

describe('calculateQuantity', () => {
  it('calculates for TID PRN x 7 days', () => {
    expect(calculateQuantity('TID PRN', '7 days')).toBe(21);
  });

  it('calculates for daily x 30 days', () => {
    expect(calculateQuantity('daily', '30 days')).toBe(30);
  });

  it('calculates for BID x 14 days', () => {
    expect(calculateQuantity('BID', '14 days')).toBe(28);
  });

  it('calculates for QID x 5 days', () => {
    expect(calculateQuantity('QID', '5 days')).toBe(20);
  });

  it('calculates for Q4-6H PRN x 7 days', () => {
    // 5 times per day * 7 = 35
    expect(calculateQuantity('Q4-6H PRN', '7 days')).toBe(35);
  });

  it('calculates for Q6H x 10 days', () => {
    // 4 times per day * 10 = 40
    expect(calculateQuantity('Q6H', '10 days')).toBe(40);
  });

  it('rounds up fractional quantities', () => {
    // weekly x 30 days = 1/7 * 30 ≈ 4.28 → 5
    expect(calculateQuantity('weekly', '30 days')).toBe(5);
  });

  it('returns null for unparseable duration', () => {
    expect(calculateQuantity('daily', 'ongoing')).toBeNull();
    expect(calculateQuantity('daily', '')).toBeNull();
  });

  it('returns null when frequency is empty', () => {
    expect(calculateQuantity('', '7 days')).toBeNull();
  });

  it('handles "days" with and without trailing s', () => {
    expect(calculateQuantity('daily', '1 day')).toBe(1);
    expect(calculateQuantity('daily', '1 days')).toBe(1);
  });
});

// ============================================================================
// Mock Data Completeness: Medications
// ============================================================================

describe('Medication mock data', () => {
  const meds = getQuickPicks('medication');

  it('has at least 15 items', () => {
    expect(meds.length).toBeGreaterThanOrEqual(15);
  });

  it('all items have required medication fields', () => {
    for (const med of meds) {
      expect(med.id).toBeTruthy();
      expect(med.label).toBeTruthy();
      expect(med.chipLabel).toBeTruthy();
      expect(med.category).toBe('medication');
      expect(med.data.drugName).toBeTruthy();
      expect(med.data.dosage).toBeTruthy();
      expect(med.data.route).toBeTruthy();
      expect(med.data.frequency).toBeTruthy();
      expect(med.data.duration).toBeTruthy();
      expect(typeof med.data.quantity).toBe('number');
      expect(typeof med.data.refills).toBe('number');
      expect(typeof med.data.isControlled).toBe('boolean');
      expect(med.data.prescriptionType).toBeTruthy();
    }
  });

  it('controlled substances have schedule', () => {
    const controlled = meds.filter(m => m.data.isControlled);
    for (const med of controlled) {
      expect(med.data.controlSchedule).toBeTruthy();
    }
  });
});

// ============================================================================
// Mock Data Completeness: Labs
// ============================================================================

describe('Lab mock data', () => {
  const labs = getQuickPicks('lab');

  it('has at least 15 items', () => {
    expect(labs.length).toBeGreaterThanOrEqual(15);
  });

  it('all items have required lab fields', () => {
    for (const lab of labs) {
      expect(lab.id).toBeTruthy();
      expect(lab.label).toBeTruthy();
      expect(lab.chipLabel).toBeTruthy();
      expect(lab.category).toBe('lab');
      expect(lab.data.testName).toBeTruthy();
      expect(lab.data.testCode).toBeTruthy();
      expect(['routine', 'urgent', 'stat']).toContain(lab.data.priority);
      expect(['in-house', 'send-out']).toContain(lab.data.collectionType);
      expect(lab.data.orderStatus).toBe('draft');
    }
  });

  it('fasting labs have fastingRequired flag', () => {
    const lipid = labs.find(l => l.id === 'lab-lipid');
    expect(lipid).toBeDefined();
    expect(lipid!.data.fastingRequired).toBe(true);
  });
});

// ============================================================================
// Mock Data Completeness: Diagnoses
// ============================================================================

describe('Diagnosis mock data', () => {
  const diagnoses = getQuickPicks('diagnosis');

  it('has at least 15 items', () => {
    expect(diagnoses.length).toBeGreaterThanOrEqual(15);
  });

  it('all items have required diagnosis fields', () => {
    for (const dx of diagnoses) {
      expect(dx.id).toBeTruthy();
      expect(dx.label).toBeTruthy();
      expect(dx.chipLabel).toBeTruthy();
      expect(dx.category).toBe('diagnosis');
      expect(dx.data.description).toBeTruthy();
      expect(dx.data.icdCode).toBeTruthy();
      expect(['encounter', 'chronic', 'historical']).toContain(dx.data.type);
      expect(['active', 'resolved', 'inactive']).toContain(dx.data.clinicalStatus);
    }
  });

  it('ICD codes match label format', () => {
    for (const dx of diagnoses) {
      // Label should contain the ICD code in parentheses
      const icdCode = String(dx.data.icdCode);
      expect(dx.label).toContain(`(${icdCode})`);
    }
  });

  it('chronic conditions are typed correctly', () => {
    const gerd = diagnoses.find(d => d.id === 'dx-gerd');
    expect(gerd).toBeDefined();
    expect(gerd!.data.type).toBe('chronic');

    const allergicRhinitis = diagnoses.find(d => d.id === 'dx-allergic-rhinitis');
    expect(allergicRhinitis).toBeDefined();
    expect(allergicRhinitis!.data.type).toBe('chronic');
  });
});

// ============================================================================
// Search: Cross-category and per-category
// ============================================================================

describe('Search with expanded data', () => {
  it('cross-category search finds items across categories', () => {
    // "rapid" matches lab items (COVID, Flu, Strep) and procedure items (Rapid Strep Test)
    const results = searchAllCategories('rapid');
    const categories = new Set(results.map(r => r.category));
    expect(categories.size).toBeGreaterThanOrEqual(2);
  });

  it('medication search filters correctly', () => {
    const results = searchCategory('medication', 'ibuprofen');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('rx-ibuprofen');
  });

  it('lab search finds new items', () => {
    const results = searchCategory('lab', 'troponin');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('lab-troponin');
  });

  it('diagnosis search finds new items', () => {
    const results = searchCategory('diagnosis', 'GERD');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('dx-gerd');
  });
});

// ============================================================================
// Smart Defaults: Verify quick-pick data has sensible defaults
// ============================================================================

describe('Smart defaults', () => {
  it('acute medications default to 0 refills', () => {
    const acuteMeds = getQuickPicks('medication').filter(m => {
      const duration = String(m.data.duration);
      const days = parseInt(duration);
      return days <= 14;
    });
    for (const med of acuteMeds) {
      expect(med.data.refills).toBe(0);
    }
  });

  it('chronic medications have non-zero refills', () => {
    const chronicMeds = getQuickPicks('medication').filter(m => {
      const duration = String(m.data.duration);
      const days = parseInt(duration);
      return days >= 30;
    });
    for (const med of chronicMeds) {
      expect(Number(med.data.refills)).toBeGreaterThan(0);
    }
  });

  it('rapid tests default to stat priority', () => {
    const rapidLabs = getQuickPicks('lab').filter(l =>
      l.label.toLowerCase().includes('rapid')
    );
    for (const lab of rapidLabs) {
      expect(lab.data.priority).toBe('stat');
    }
  });

  it('rapid tests default to in-house collection', () => {
    const rapidLabs = getQuickPicks('lab').filter(l =>
      l.label.toLowerCase().includes('rapid')
    );
    for (const lab of rapidLabs) {
      expect(lab.data.collectionType).toBe('in-house');
    }
  });

  it('quantity is consistent with frequency and duration for tablet-based meds', () => {
    const meds = getQuickPicks('medication');
    // Skip items where quantity represents non-tablet units:
    // - Codeine/Guaif (liquid, quantity in mL)
    // - Albuterol (inhaler, quantity = 1 device)
    // - Azithromycin (Z-pack, special dosing regimen)
    const SPECIAL_QUANTITY_IDS = ['rx-codeine-guaifenesin', 'rx-albuterol-inhaler', 'rx-azithromycin'];

    for (const med of meds) {
      if (SPECIAL_QUANTITY_IDS.includes(med.id)) continue;
      const calc = calculateQuantity(
        String(med.data.frequency),
        String(med.data.duration),
      );
      if (calc !== null) {
        expect(Number(med.data.quantity)).toBe(calc);
      }
    }
  });
});
