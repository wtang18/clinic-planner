/**
 * Allergy Checker
 *
 * Cross-references a drug name against patient allergies using a static
 * allergen-to-drug map. Returns SafetyAlerts when matches are found.
 *
 * Severity mapping:
 * - Exact allergen match + severe allergy → critical
 * - Same drug class match → warning
 * - Related class (cross-reactivity) → info
 */

import type { AllergySummary } from '../../types/patient';
import type { SafetyAlert, SafetyAlertSeverity } from './types';

// ============================================================================
// Allergen → Drug Map
// ============================================================================

interface AllergyDrugEntry {
  /** The allergen name (matches AllergySummary.allergen) */
  allergen: string;
  /** Drugs in the same class */
  drugs: string[];
  /** Related drugs with cross-reactivity (lower severity) */
  crossReactive?: string[];
}

const ALLERGY_DRUG_MAP: AllergyDrugEntry[] = [
  {
    allergen: 'penicillin',
    drugs: [
      'amoxicillin', 'ampicillin', 'augmentin', 'amoxicillin-clavulanate',
      'piperacillin', 'nafcillin', 'oxacillin', 'dicloxacillin',
    ],
    crossReactive: ['cephalexin', 'cefazolin', 'ceftriaxone', 'cefdinir'],
  },
  {
    allergen: 'sulfa',
    drugs: [
      'sulfamethoxazole', 'bactrim', 'trimethoprim-sulfamethoxazole',
      'sulfasalazine', 'dapsone',
    ],
  },
  {
    allergen: 'aspirin',
    drugs: ['aspirin', 'acetylsalicylic acid'],
    crossReactive: ['ibuprofen', 'naproxen', 'ketorolac', 'meloxicam', 'celecoxib'],
  },
  {
    allergen: 'codeine',
    drugs: ['codeine', 'hydrocodone', 'oxycodone', 'morphine', 'tramadol'],
  },
  {
    allergen: 'erythromycin',
    drugs: ['erythromycin', 'azithromycin', 'clarithromycin'],
  },
  {
    allergen: 'tetracycline',
    drugs: ['tetracycline', 'doxycycline', 'minocycline'],
  },
  {
    allergen: 'fluoroquinolone',
    drugs: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin'],
  },
];

// ============================================================================
// Checker
// ============================================================================

/**
 * Check if a drug conflicts with any of the patient's known allergies.
 */
export function checkAllergyConflicts(
  drugName: string,
  patientAllergies: AllergySummary[],
  itemId: string,
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  const normalizedDrug = drugName.toLowerCase().trim();

  for (const allergy of patientAllergies) {
    const normalizedAllergen = allergy.allergen.toLowerCase().trim();

    // Direct allergen-is-drug match (e.g., patient allergic to "Aspirin" and drug is "aspirin")
    if (normalizedDrug === normalizedAllergen) {
      alerts.push(buildAlert(
        itemId,
        drugName,
        allergy,
        allergy.severity === 'severe' ? 'critical' : 'warning',
        'direct',
      ));
      continue;
    }

    // Check the allergen→drug map
    for (const entry of ALLERGY_DRUG_MAP) {
      if (entry.allergen !== normalizedAllergen) continue;

      // Same-class drug match
      if (entry.drugs.includes(normalizedDrug)) {
        alerts.push(buildAlert(
          itemId,
          drugName,
          allergy,
          allergy.severity === 'severe' ? 'critical' : 'warning',
          'same-class',
        ));
        break;
      }

      // Cross-reactive match
      if (entry.crossReactive?.includes(normalizedDrug)) {
        alerts.push(buildAlert(
          itemId,
          drugName,
          allergy,
          'info',
          'cross-reactive',
        ));
        break;
      }
    }
  }

  return alerts;
}

// ============================================================================
// Helpers
// ============================================================================

function buildAlert(
  itemId: string,
  drugName: string,
  allergy: AllergySummary,
  severity: SafetyAlertSeverity,
  matchType: 'direct' | 'same-class' | 'cross-reactive',
): SafetyAlert {
  const detail = matchType === 'cross-reactive'
    ? `${drugName} has cross-reactivity with ${allergy.allergen} allergy`
    : `${drugName} is contraindicated — patient is allergic to ${allergy.allergen}`;

  const reaction = allergy.reaction ? ` (reaction: ${allergy.reaction})` : '';

  return {
    id: `allergy:${itemId}:${allergy.allergen.toLowerCase()}`,
    type: 'allergy',
    severity,
    message: `Allergy conflict: ${allergy.allergen}${reaction}`,
    details: detail,
    relatedItemId: itemId,
    dismissible: severity !== 'critical',
    acknowledged: false,
  };
}
