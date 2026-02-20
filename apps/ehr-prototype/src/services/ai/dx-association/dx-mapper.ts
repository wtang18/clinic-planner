/**
 * Diagnosis Mapper
 *
 * Logic for suggesting diagnosis associations for chart items.
 * Uses rule-based mapping with patient context ranking.
 */

import type {
  ChartItem,
  DiagnosisItem,
  MedicationItem,
  LabItem,
  ImagingItem,
} from '../../../types/chart-items';
import type { PatientContext } from '../../../types/patient';
import type {
  DxAssociationConfig,
  DxAssociationResult,
  DxSuggestion,
  DxMappingRule,
} from './types';
import { DEFAULT_DX_ASSOCIATION_CONFIG } from './types';

// ============================================================================
// Main Mapping Function
// ============================================================================

/**
 * Suggest diagnosis associations for an item
 */
export async function suggestDxAssociation(
  item: ChartItem,
  existingDiagnoses: DiagnosisItem[],
  patientContext: PatientContext | null,
  config: DxAssociationConfig = DEFAULT_DX_ASSOCIATION_CONFIG
): Promise<DxAssociationResult> {
  // Get rule-based suggestions
  let suggestions = applyMappingRules(item);

  // Match against existing diagnoses
  suggestions = matchToExistingDiagnoses(suggestions, existingDiagnoses);

  // Rank by patient context
  suggestions = rankByPatientContext(suggestions, patientContext);

  // Filter by threshold and limit
  suggestions = suggestions
    .filter((s) => s.confidence >= config.suggestionThreshold)
    .slice(0, config.maxSuggestions);

  // Check for auto-link
  const autoLinked = suggestions.find(
    (s) => s.confidence >= config.autoLinkThreshold && !s.isNew
  );

  return {
    itemId: item.id,
    suggestions,
    autoLinked,
  };
}

// ============================================================================
// Rule-Based Mapping
// ============================================================================

/**
 * Apply mapping rules to get initial suggestions
 */
export function applyMappingRules(item: ChartItem): DxSuggestion[] {
  const suggestions: DxSuggestion[] = [];

  for (const rule of DX_MAPPING_RULES) {
    if (matchesRule(item, rule)) {
      for (const dx of rule.suggestedDx) {
        suggestions.push({
          description: dx.description,
          icdCode: dx.icdCode,
          confidence: dx.confidence,
          reasoning: `Common association for ${getItemName(item)}`,
          isNew: true, // Will be updated when matching to existing
        });
      }
    }
  }

  return deduplicateSuggestions(suggestions);
}

/**
 * Check if an item matches a mapping rule
 */
function matchesRule(item: ChartItem, rule: DxMappingRule): boolean {
  if (item.category !== rule.itemPattern.category) {
    return false;
  }

  const name = getItemName(item).toLowerCase();
  const code = getItemCode(item);

  if (rule.itemPattern.namePattern && !rule.itemPattern.namePattern.test(name)) {
    return false;
  }

  if (rule.itemPattern.codePattern && code && !rule.itemPattern.codePattern.test(code)) {
    return false;
  }

  return true;
}

/**
 * Get the primary name of an item
 */
function getItemName(item: ChartItem): string {
  switch (item.category) {
    case 'medication':
      return (item as MedicationItem).data.drugName;
    case 'lab':
      return (item as LabItem).data.testName;
    case 'imaging':
      return (item as ImagingItem).data.studyType;
    default:
      return item.displayText;
  }
}

/**
 * Get the primary code of an item
 */
function getItemCode(item: ChartItem): string | null {
  switch (item.category) {
    case 'medication':
      return (item as MedicationItem).data.rxNorm || null;
    case 'lab':
      return (item as LabItem).data.testCode || null;
    default:
      return null;
  }
}

// ============================================================================
// Existing Diagnosis Matching
// ============================================================================

/**
 * Match suggestions to existing diagnoses in the chart
 */
function matchToExistingDiagnoses(
  suggestions: DxSuggestion[],
  existingDiagnoses: DiagnosisItem[]
): DxSuggestion[] {
  return suggestions.map((suggestion) => {
    // Find matching existing diagnosis
    const existing = existingDiagnoses.find(
      (dx) =>
        dx.data.icdCode === suggestion.icdCode ||
        dx.data.description.toLowerCase() === suggestion.description.toLowerCase()
    );

    if (existing) {
      return {
        ...suggestion,
        diagnosisId: existing.id,
        isNew: false,
        confidence: Math.min(suggestion.confidence + 0.1, 1), // Boost for existing
      };
    }

    return suggestion;
  });
}

// ============================================================================
// Context-Aware Ranking
// ============================================================================

/**
 * Rank suggestions by patient context relevance
 */
export function rankByPatientContext(
  suggestions: DxSuggestion[],
  patientContext: PatientContext | null
): DxSuggestion[] {
  if (!patientContext) {
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  return suggestions
    .map((suggestion) => {
      let confidenceBoost = 0;

      // Check if patient has relevant conditions in problem list
      const hasProblem = patientContext.clinicalSummary?.problemList?.some(
        (problem: { icdCode?: string; description: string }) =>
          problem.icdCode === suggestion.icdCode ||
          problem.description.toLowerCase().includes(suggestion.description.toLowerCase())
      );
      if (hasProblem) {
        confidenceBoost += 0.15;
      }

      // Age-based relevance (e.g., diabetes more likely in older patients)
      if (patientContext.demographics?.age) {
        const age = patientContext.demographics.age;
        if (isAgeRelevant(suggestion.icdCode, age)) {
          confidenceBoost += 0.05;
        }
      }

      return {
        ...suggestion,
        confidence: Math.min(suggestion.confidence + confidenceBoost, 1),
      };
    })
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Check if a diagnosis is age-relevant
 */
function isAgeRelevant(icdCode: string, age: number): boolean {
  // Type 2 diabetes more common in older adults
  if (icdCode === 'E11.9' && age >= 40) return true;

  // Hypertension more common in older adults
  if (icdCode === 'I10' && age >= 30) return true;

  // Hyperlipidemia more common in adults
  if (icdCode === 'E78.5' && age >= 20) return true;

  return false;
}

// ============================================================================
// Helpers
// ============================================================================

function deduplicateSuggestions(suggestions: DxSuggestion[]): DxSuggestion[] {
  const seen = new Set<string>();
  return suggestions.filter((s) => {
    const key = s.icdCode;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// ============================================================================
// Mapping Rules
// ============================================================================

/**
 * Common diagnosis mapping rules
 */
export const DX_MAPPING_RULES: DxMappingRule[] = [
  // Diabetes medications
  {
    itemPattern: {
      category: 'medication',
      namePattern: /metformin|glipizide|glyburide|sitagliptin|empagliflozin|liraglutide|insulin/i,
    },
    suggestedDx: [
      { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', confidence: 0.9 },
    ],
  },

  // Hypertension medications
  {
    itemPattern: {
      category: 'medication',
      namePattern: /lisinopril|losartan|amlodipine|metoprolol|atenolol|hydrochlorothiazide|hctz|carvedilol|valsartan/i,
    },
    suggestedDx: [
      { description: 'Essential hypertension', icdCode: 'I10', confidence: 0.85 },
    ],
  },

  // Statin medications
  {
    itemPattern: {
      category: 'medication',
      namePattern: /atorvastatin|simvastatin|rosuvastatin|pravastatin|lovastatin/i,
    },
    suggestedDx: [
      { description: 'Hyperlipidemia, unspecified', icdCode: 'E78.5', confidence: 0.85 },
    ],
  },

  // Thyroid medications
  {
    itemPattern: {
      category: 'medication',
      namePattern: /levothyroxine|synthroid|armour thyroid/i,
    },
    suggestedDx: [
      { description: 'Hypothyroidism, unspecified', icdCode: 'E03.9', confidence: 0.9 },
    ],
  },

  // Asthma/COPD medications
  {
    itemPattern: {
      category: 'medication',
      namePattern: /albuterol|budesonide|fluticasone|montelukast|tiotropium|symbicort|advair/i,
    },
    suggestedDx: [
      { description: 'Asthma, unspecified', icdCode: 'J45.909', confidence: 0.7 },
      { description: 'COPD, unspecified', icdCode: 'J44.9', confidence: 0.6 },
    ],
  },

  // Depression/Anxiety medications
  {
    itemPattern: {
      category: 'medication',
      namePattern: /sertraline|fluoxetine|escitalopram|citalopram|duloxetine|venlafaxine|bupropion/i,
    },
    suggestedDx: [
      { description: 'Major depressive disorder', icdCode: 'F32.9', confidence: 0.75 },
      { description: 'Anxiety disorder, unspecified', icdCode: 'F41.9', confidence: 0.7 },
    ],
  },

  // GERD medications
  {
    itemPattern: {
      category: 'medication',
      namePattern: /omeprazole|pantoprazole|esomeprazole|lansoprazole|famotidine|ranitidine/i,
    },
    suggestedDx: [
      { description: 'Gastroesophageal reflux disease', icdCode: 'K21.0', confidence: 0.8 },
    ],
  },

  // Anticoagulants
  {
    itemPattern: {
      category: 'medication',
      namePattern: /warfarin|eliquis|apixaban|xarelto|rivaroxaban|pradaxa|dabigatran/i,
    },
    suggestedDx: [
      { description: 'Atrial fibrillation', icdCode: 'I48.91', confidence: 0.7 },
      { description: 'Venous thromboembolism', icdCode: 'I82.90', confidence: 0.6 },
    ],
  },

  // A1C lab
  {
    itemPattern: {
      category: 'lab',
      namePattern: /a1c|hemoglobin a1c|hba1c|glycated hemoglobin/i,
    },
    suggestedDx: [
      { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', confidence: 0.85 },
    ],
  },

  // Lipid panel
  {
    itemPattern: {
      category: 'lab',
      namePattern: /lipid panel|cholesterol|ldl|hdl|triglycerides/i,
    },
    suggestedDx: [
      { description: 'Hyperlipidemia, unspecified', icdCode: 'E78.5', confidence: 0.75 },
    ],
  },

  // TSH
  {
    itemPattern: {
      category: 'lab',
      namePattern: /tsh|thyroid stimulating|thyroid function/i,
    },
    suggestedDx: [
      { description: 'Hypothyroidism, unspecified', icdCode: 'E03.9', confidence: 0.7 },
    ],
  },

  // Microalbumin
  {
    itemPattern: {
      category: 'lab',
      namePattern: /microalbumin|albumin.*creatinine|uacr/i,
    },
    suggestedDx: [
      { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9', confidence: 0.8 },
      { description: 'Essential hypertension', icdCode: 'I10', confidence: 0.6 },
    ],
  },

  // Chest X-ray
  {
    itemPattern: {
      category: 'imaging',
      namePattern: /chest.*x-?ray|cxr/i,
    },
    suggestedDx: [
      { description: 'Cough', icdCode: 'R05.9', confidence: 0.65 },
      { description: 'Pneumonia, unspecified', icdCode: 'J18.9', confidence: 0.6 },
    ],
  },
];
