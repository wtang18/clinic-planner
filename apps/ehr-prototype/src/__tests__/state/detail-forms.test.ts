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

// ============================================================================
// Mock Data Completeness: Imaging (Phase 6)
// ============================================================================

describe('Imaging mock data', () => {
  const imaging = getQuickPicks('imaging');

  it('has at least 6 items', () => {
    expect(imaging.length).toBeGreaterThanOrEqual(6);
  });

  it('all items have required imaging fields', () => {
    for (const img of imaging) {
      expect(img.id).toBeTruthy();
      expect(img.label).toBeTruthy();
      expect(img.chipLabel).toBeTruthy();
      expect(img.category).toBe('imaging');
      expect(img.data.studyType).toBeTruthy();
      expect(img.data.bodyPart).toBeTruthy();
      expect(img.data.indication).toBeTruthy();
      expect(['routine', 'urgent', 'stat']).toContain(img.data.priority);
      expect(typeof img.data.requiresAuth).toBe('boolean');
      expect(img.data.orderStatus).toBe('draft');
    }
  });

  it('CT studies require auth', () => {
    const ctStudies = imaging.filter(i => String(i.data.studyType) === 'CT');
    expect(ctStudies.length).toBeGreaterThanOrEqual(2);
    for (const ct of ctStudies) {
      expect(ct.data.requiresAuth).toBe(true);
    }
  });

  it('X-ray studies do not require auth', () => {
    const xrayStudies = imaging.filter(i => String(i.data.studyType) === 'X-ray');
    for (const xr of xrayStudies) {
      expect(xr.data.requiresAuth).toBe(false);
    }
  });
});

// ============================================================================
// Mock Data Completeness: Procedures (Phase 6)
// ============================================================================

describe('Procedure mock data', () => {
  const procedures = getQuickPicks('procedure');

  it('has at least 6 items', () => {
    expect(procedures.length).toBeGreaterThanOrEqual(6);
  });

  it('all items have required procedure fields', () => {
    for (const proc of procedures) {
      expect(proc.id).toBeTruthy();
      expect(proc.label).toBeTruthy();
      expect(proc.chipLabel).toBeTruthy();
      expect(proc.category).toBe('procedure');
      expect(proc.data.procedureName).toBeTruthy();
      expect(proc.data.indication).toBeTruthy();
      expect(proc.data.procedureStatus).toBe('planned');
    }
  });

  it('most procedures have CPT codes', () => {
    const withCpt = procedures.filter(p => p.data.cptCode);
    expect(withCpt.length).toBeGreaterThanOrEqual(5);
  });
});

// ============================================================================
// Mock Data Completeness: Allergies (Phase 6)
// ============================================================================

describe('Allergy mock data', () => {
  const allergies = getQuickPicks('allergy');

  it('has at least 8 items', () => {
    expect(allergies.length).toBeGreaterThanOrEqual(8);
  });

  it('all items have required allergy fields', () => {
    for (const allergy of allergies) {
      expect(allergy.id).toBeTruthy();
      expect(allergy.label).toBeTruthy();
      expect(allergy.chipLabel).toBeTruthy();
      expect(allergy.category).toBe('allergy');
      expect(allergy.data.allergen).toBeTruthy();
      expect(['drug', 'food', 'environmental', 'other']).toContain(allergy.data.allergenType);
      expect(['mild', 'moderate', 'severe', 'unknown']).toContain(allergy.data.severity);
      expect(['patient', 'caregiver', 'external-record']).toContain(allergy.data.reportedBy);
      expect(['unverified', 'confirmed', 'refuted']).toContain(allergy.data.verificationStatus);
    }
  });

  it('NKDA item is confirmed', () => {
    const nkda = allergies.find(a => a.id === 'allergy-nkda');
    expect(nkda).toBeDefined();
    expect(nkda!.data.verificationStatus).toBe('confirmed');
  });

  it('includes multiple allergen types', () => {
    const types = new Set(allergies.map(a => a.data.allergenType));
    expect(types.size).toBeGreaterThanOrEqual(3); // drug, food, environmental
  });

  it('severe allergies are confirmed', () => {
    const severe = allergies.filter(a => a.data.severity === 'severe');
    expect(severe.length).toBeGreaterThanOrEqual(1);
    for (const allergy of severe) {
      expect(allergy.data.verificationStatus).toBe('confirmed');
    }
  });
});

// ============================================================================
// Mock Data Completeness: Referrals (Phase 6)
// ============================================================================

describe('Referral mock data', () => {
  const referrals = getQuickPicks('referral');

  it('has at least 6 items', () => {
    expect(referrals.length).toBeGreaterThanOrEqual(6);
  });

  it('all items have required referral fields', () => {
    for (const ref of referrals) {
      expect(ref.id).toBeTruthy();
      expect(ref.label).toBeTruthy();
      expect(ref.chipLabel).toBeTruthy();
      expect(ref.category).toBe('referral');
      expect(ref.data.specialty).toBeTruthy();
      expect(ref.data.reason).toBeTruthy();
      expect(['routine', 'urgent', 'emergent']).toContain(ref.data.urgency);
      expect(ref.data.referralStatus).toBe('draft');
      expect(typeof ref.data.requiresAuth).toBe('boolean');
    }
  });

  it('urgent referrals exist', () => {
    const urgent = referrals.filter(r => r.data.urgency === 'urgent');
    expect(urgent.length).toBeGreaterThanOrEqual(1);
  });

  it('some referrals require auth', () => {
    const needsAuth = referrals.filter(r => r.data.requiresAuth === true);
    expect(needsAuth.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// Search: Expanded categories (Phase 6)
// ============================================================================

describe('Search with Phase 6 categories', () => {
  it('cross-category search finds imaging items', () => {
    const results = searchAllCategories('chest');
    const imagingResults = results.filter(r => r.category === 'imaging');
    expect(imagingResults.length).toBeGreaterThanOrEqual(2);
  });

  it('imaging search filters correctly', () => {
    const results = searchCategory('imaging', 'sinus');
    expect(results.length).toBe(1);
    expect(results[0].data.bodyPart).toBe('Sinuses');
  });

  it('allergy search finds by allergen name', () => {
    const results = searchCategory('allergy', 'penicillin');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('allergy-penicillin');
  });

  it('referral search finds by specialty', () => {
    const results = searchCategory('referral', 'cardiology');
    expect(results.length).toBe(1);
    expect(results[0].data.specialty).toBe('Cardiology');
  });

  it('procedure search finds by name', () => {
    const results = searchCategory('procedure', 'spirometry');
    expect(results.length).toBe(1);
    expect(results[0].data.cptCode).toBe('94010');
  });
});

// ============================================================================
// Side-Effect Task Templates (Phase 6)
// ============================================================================

describe('Side-effect task templates', () => {
  // Import is deferred to avoid circular deps in test; test the exported object shape
  it('referralAdded template creates dx-association + prior-auth tasks', async () => {
    const { TASK_TEMPLATES } = await import('../../mocks/generators/tasks');
    const tasks = TASK_TEMPLATES.referralAdded('ref-1', 'Cardiology');
    expect(tasks).toHaveLength(2);
    expect(tasks[0].type).toBe('dx-association');
    expect(tasks[0].displayTitle).toContain('Cardiology referral');
    // Second task should be prior auth
    expect(tasks[1].type).toBe('prior-auth-check');
    expect(tasks[1].displayTitle).toContain('Cardiology referral');
  });

  it('procedureAdded template creates dx-association task', async () => {
    const { TASK_TEMPLATES } = await import('../../mocks/generators/tasks');
    const tasks = TASK_TEMPLATES.procedureAdded('proc-1', 'Spirometry');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].type).toBe('dx-association');
    expect(tasks[0].displayTitle).toContain('Spirometry');
  });
});
