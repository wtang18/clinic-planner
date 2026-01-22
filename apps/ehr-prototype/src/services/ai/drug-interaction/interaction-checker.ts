/**
 * Drug Interaction Checker
 *
 * Logic for checking drug interactions against a known database.
 * Uses a mock interaction database - production would use a real
 * drug database service (e.g., Lexicomp, First Databank).
 */

import type { MedicationItem } from '../../../types/chart-items';
import type {
  DrugInteractionConfig,
  InteractionCheckResult,
  DrugInteraction,
  DrugReference,
  InteractionSeverity,
} from './types';
import { DEFAULT_DRUG_INTERACTION_CONFIG } from './types';

// ============================================================================
// Main Check Function
// ============================================================================

/**
 * Check drug interactions for a medication against current medications
 */
export async function checkDrugInteractions(
  newMedication: MedicationItem,
  currentMedications: MedicationItem[],
  config: DrugInteractionConfig = DEFAULT_DRUG_INTERACTION_CONFIG
): Promise<InteractionCheckResult> {
  const interactions: DrugInteraction[] = [];
  const checkedAgainst: DrugReference[] = [];

  const newDrugName = normalizeDrugName(newMedication.data.drugName);

  // Filter medications to check against
  const medsToCheck = currentMedications.filter((med) => {
    // Skip self
    if (med.id === newMedication.id) return false;

    // Skip discontinued medications
    if (med.data.prescriptionType === 'discontinue') return false;

    // Check based on config
    const isActive = med.status === 'confirmed' || med.status === 'ordered';
    const isProposed = med.status === 'draft' || med.status === 'pending-review';

    if (isActive && !config.checkAgainstActive) return false;
    if (isProposed && !config.checkAgainstProposed) return false;

    return true;
  });

  // Check each medication
  for (const med of medsToCheck) {
    const drugName = normalizeDrugName(med.data.drugName);

    checkedAgainst.push({
      name: med.data.drugName,
      rxNorm: med.data.rxNorm,
      ndc: med.data.ndc,
    });

    const interaction = findInteractions(newDrugName, drugName);
    if (interaction && shouldReportInteraction(interaction, config)) {
      interactions.push({
        ...interaction,
        drug1: {
          name: newMedication.data.drugName,
          rxNorm: newMedication.data.rxNorm,
        },
        drug2: {
          name: med.data.drugName,
          rxNorm: med.data.rxNorm,
        },
      });
    }
  }

  // Sort by severity
  interactions.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  return {
    medication: newMedication,
    interactions,
    checkedAgainst,
    checkTimestamp: new Date(),
  };
}

// ============================================================================
// Lookup Functions
// ============================================================================

/**
 * Find interactions between two drugs
 */
export function findInteractions(
  drug1: string,
  drug2: string
): Omit<DrugInteraction, 'drug1' | 'drug2'> | null {
  const normalized1 = normalizeDrugName(drug1);
  const normalized2 = normalizeDrugName(drug2);

  // Check both orderings
  for (const interaction of KNOWN_INTERACTIONS) {
    const iDrug1 = normalizeDrugName(interaction.drug1);
    const iDrug2 = normalizeDrugName(interaction.drug2);

    if (
      (normalized1 === iDrug1 && normalized2 === iDrug2) ||
      (normalized1 === iDrug2 && normalized2 === iDrug1)
    ) {
      return {
        severity: interaction.severity,
        description: interaction.description,
        clinicalEffects: interaction.clinicalEffects,
        recommendation: interaction.recommendation,
        source: interaction.source,
      };
    }
  }

  // Check drug classes
  const class1 = getDrugClass(normalized1);
  const class2 = getDrugClass(normalized2);

  if (class1 && class2) {
    for (const interaction of CLASS_INTERACTIONS) {
      if (
        (class1 === interaction.class1 && class2 === interaction.class2) ||
        (class1 === interaction.class2 && class2 === interaction.class1)
      ) {
        return {
          severity: interaction.severity,
          description: interaction.description,
          clinicalEffects: interaction.clinicalEffects,
          recommendation: interaction.recommendation,
          source: interaction.source,
        };
      }
    }
  }

  return null;
}

/**
 * Normalize a drug name for comparison
 */
export function normalizeDrugName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\d+\s*(mg|mcg|ml|%)/gi, '')
    .trim();
}

// ============================================================================
// Helpers
// ============================================================================

function shouldReportInteraction(
  interaction: { severity: InteractionSeverity },
  config: DrugInteractionConfig
): boolean {
  return severityRank(interaction.severity) >= severityRank(config.severityThreshold);
}

function severityRank(severity: InteractionSeverity): number {
  const ranks: Record<InteractionSeverity, number> = {
    mild: 1,
    moderate: 2,
    severe: 3,
    contraindicated: 4,
  };
  return ranks[severity];
}

function getDrugClass(drugName: string): string | null {
  for (const [className, drugs] of Object.entries(DRUG_CLASSES)) {
    if (drugs.includes(drugName)) {
      return className;
    }
  }
  return null;
}

// ============================================================================
// Known Interactions Database
// ============================================================================

interface KnownInteraction {
  drug1: string;
  drug2: string;
  severity: InteractionSeverity;
  description: string;
  clinicalEffects: string;
  recommendation: string;
  source: string;
}

/**
 * Mock database of known drug interactions
 */
export const KNOWN_INTERACTIONS: KnownInteraction[] = [
  // Metformin + Contrast dye
  {
    drug1: 'metformin',
    drug2: 'contrast dye',
    severity: 'severe',
    description: 'Metformin and contrast dye interaction',
    clinicalEffects: 'Risk of lactic acidosis, especially with impaired renal function',
    recommendation: 'Hold metformin for 48 hours before and after contrast administration. Verify renal function before resuming.',
    source: 'FDA',
  },

  // Warfarin + NSAIDs
  {
    drug1: 'warfarin',
    drug2: 'ibuprofen',
    severity: 'moderate',
    description: 'Anticoagulant and NSAID interaction',
    clinicalEffects: 'Increased bleeding risk due to additive effects and gastric irritation',
    recommendation: 'Consider alternative pain medication. If used together, monitor INR closely and watch for signs of bleeding.',
    source: 'Lexicomp',
  },
  {
    drug1: 'warfarin',
    drug2: 'naproxen',
    severity: 'moderate',
    description: 'Anticoagulant and NSAID interaction',
    clinicalEffects: 'Increased bleeding risk due to additive effects and gastric irritation',
    recommendation: 'Consider alternative pain medication. If used together, monitor INR closely.',
    source: 'Lexicomp',
  },

  // ACE inhibitors + Potassium
  {
    drug1: 'lisinopril',
    drug2: 'potassium',
    severity: 'moderate',
    description: 'ACE inhibitor and potassium supplement interaction',
    clinicalEffects: 'Hyperkalemia risk due to reduced potassium excretion',
    recommendation: 'Monitor serum potassium levels. Consider reducing potassium supplementation.',
    source: 'FDA',
  },
  {
    drug1: 'losartan',
    drug2: 'potassium',
    severity: 'moderate',
    description: 'ARB and potassium supplement interaction',
    clinicalEffects: 'Hyperkalemia risk due to reduced potassium excretion',
    recommendation: 'Monitor serum potassium levels. Consider reducing potassium supplementation.',
    source: 'FDA',
  },

  // SSRIs + MAOIs (Contraindicated)
  {
    drug1: 'sertraline',
    drug2: 'phenelzine',
    severity: 'contraindicated',
    description: 'SSRI and MAOI contraindication',
    clinicalEffects: 'Serotonin syndrome - potentially fatal hyperthermia, rigidity, autonomic instability',
    recommendation: 'DO NOT use together. Allow at least 14 days washout between medications.',
    source: 'FDA',
  },
  {
    drug1: 'fluoxetine',
    drug2: 'phenelzine',
    severity: 'contraindicated',
    description: 'SSRI and MAOI contraindication',
    clinicalEffects: 'Serotonin syndrome - potentially fatal hyperthermia, rigidity, autonomic instability',
    recommendation: 'DO NOT use together. Allow at least 5 weeks washout after stopping fluoxetine.',
    source: 'FDA',
  },

  // Statins + Grapefruit
  {
    drug1: 'simvastatin',
    drug2: 'grapefruit',
    severity: 'mild',
    description: 'Statin and grapefruit interaction',
    clinicalEffects: 'Increased statin levels leading to increased risk of myopathy and rhabdomyolysis',
    recommendation: 'Avoid grapefruit consumption or consider switching to a statin less affected by CYP3A4 (pravastatin, rosuvastatin).',
    source: 'FDA',
  },
  {
    drug1: 'atorvastatin',
    drug2: 'grapefruit',
    severity: 'mild',
    description: 'Statin and grapefruit interaction',
    clinicalEffects: 'Moderately increased statin levels',
    recommendation: 'Limit grapefruit intake. Monitor for muscle pain or weakness.',
    source: 'FDA',
  },

  // Digoxin + Amiodarone
  {
    drug1: 'digoxin',
    drug2: 'amiodarone',
    severity: 'severe',
    description: 'Digoxin and amiodarone interaction',
    clinicalEffects: 'Significantly increased digoxin levels (50-100%), risk of toxicity',
    recommendation: 'Reduce digoxin dose by 50% when starting amiodarone. Monitor digoxin levels.',
    source: 'Lexicomp',
  },

  // Ciprofloxacin + Tizanidine
  {
    drug1: 'ciprofloxacin',
    drug2: 'tizanidine',
    severity: 'contraindicated',
    description: 'Fluoroquinolone and tizanidine contraindication',
    clinicalEffects: 'Markedly increased tizanidine levels causing severe hypotension and sedation',
    recommendation: 'DO NOT use together. Use alternative antibiotic or muscle relaxant.',
    source: 'FDA',
  },

  // Lithium + NSAIDs
  {
    drug1: 'lithium',
    drug2: 'ibuprofen',
    severity: 'moderate',
    description: 'Lithium and NSAID interaction',
    clinicalEffects: 'Increased lithium levels and risk of toxicity',
    recommendation: 'Monitor lithium levels closely. Consider alternative pain medication.',
    source: 'Lexicomp',
  },
];

/**
 * Class-based interactions
 */
interface ClassInteraction {
  class1: string;
  class2: string;
  severity: InteractionSeverity;
  description: string;
  clinicalEffects: string;
  recommendation: string;
  source: string;
}

const CLASS_INTERACTIONS: ClassInteraction[] = [
  {
    class1: 'ssri',
    class2: 'maoi',
    severity: 'contraindicated',
    description: 'SSRI and MAOI contraindication',
    clinicalEffects: 'Serotonin syndrome',
    recommendation: 'DO NOT use together',
    source: 'FDA',
  },
  {
    class1: 'ace-inhibitor',
    class2: 'arb',
    severity: 'moderate',
    description: 'Dual RAAS blockade',
    clinicalEffects: 'Hypotension, hyperkalemia, renal impairment',
    recommendation: 'Avoid combination unless specifically indicated',
    source: 'FDA',
  },
];

/**
 * Drug class mappings
 */
const DRUG_CLASSES: Record<string, string[]> = {
  ssri: ['sertraline', 'fluoxetine', 'paroxetine', 'citalopram', 'escitalopram'],
  maoi: ['phenelzine', 'tranylcypromine', 'isocarboxazid', 'selegiline'],
  'ace-inhibitor': ['lisinopril', 'enalapril', 'ramipril', 'benazepril', 'captopril'],
  arb: ['losartan', 'valsartan', 'irbesartan', 'olmesartan', 'telmisartan'],
  statin: ['atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin', 'lovastatin'],
  nsaid: ['ibuprofen', 'naproxen', 'meloxicam', 'celecoxib', 'diclofenac'],
  anticoagulant: ['warfarin', 'apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban'],
};
