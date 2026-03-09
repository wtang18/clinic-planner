/**
 * Protocol Adaptation Utilities
 *
 * Computes patient-specific annotations for protocol items and
 * evaluates protocol conditions against chart state.
 *
 * Level 2 adaptation: comorbidity, medication interaction, allergy
 * contraindication, and recency annotations based on patient context.
 */

import type {
  ProtocolTemplate,
  ProtocolCondition,
  ProtocolAnnotation,
  ProtocolItemDef,
} from '../types/protocol';
import type { PatientOverviewData } from '../components/layout/PatientOverviewPane';

// ============================================================================
// Condition Evaluation
// ============================================================================

/**
 * Evaluate a protocol condition against a chart state object.
 * The state is a flat key-value map representing current chart context.
 *
 * Supports dot-notation field paths (e.g., 'severity.selectedPathId').
 */
export function evaluateCondition(
  condition: ProtocolCondition,
  state: Record<string, unknown>
): boolean {
  const value = getNestedValue(state, condition.field);

  switch (condition.operator) {
    case 'exists':
      return value !== undefined && value !== null;
    case 'not-exists':
      return value === undefined || value === null;
    case 'equals':
      return value === condition.value;
    case 'includes':
      if (Array.isArray(value)) return value.includes(condition.value);
      if (typeof value === 'string') return value.includes(String(condition.value));
      return false;
    case 'gt':
      return typeof value === 'number' && typeof condition.value === 'number'
        ? value > condition.value
        : false;
    case 'lt':
      return typeof value === 'number' && typeof condition.value === 'number'
        ? value < condition.value
        : false;
    default:
      return false;
  }
}

/** Resolve a dot-notation path (e.g., 'severity.selectedPathId') on an object. */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// ============================================================================
// Patient Adaptation — Annotation Computation
// ============================================================================

/**
 * Compute patient-specific annotations for protocol items.
 *
 * Checks:
 * 1. Comorbidity: patient's problems match items in treatment cards
 * 2. Medication interaction: current medications vs ordered medications
 * 3. Allergy contraindication: patient allergies vs orderable medications
 * 4. Recency: lab/assessment recency annotations (stubbed for now)
 */
export function computeAnnotations(
  template: ProtocolTemplate,
  patient: PatientOverviewData | undefined
): ProtocolAnnotation[] {
  if (!patient) return [];

  const annotations: ProtocolAnnotation[] = [];

  for (const card of template.cards) {
    for (const item of card.items) {
      // Only annotate orderables
      if (item.itemType.type !== 'orderable') continue;

      // ── Allergy contraindication check ──
      if (item.itemType.chartCategory === 'medication') {
        const drugName = (item.itemType.defaultData as Record<string, unknown>).drugName;
        if (typeof drugName === 'string') {
          const allergyMatch = patient.allergies.find(a =>
            drugName.toLowerCase().includes(a.allergen.toLowerCase()) ||
            a.allergen.toLowerCase().includes(drugName.toLowerCase())
          );
          if (allergyMatch) {
            annotations.push({
              itemId: item.id,
              type: 'allergy-contraindication',
              severity: 'critical',
              message: `Patient has ${allergyMatch.allergen} allergy`,
              sourceRef: allergyMatch.allergen,
            });
          }
        }
      }

      // ── Medication interaction check ──
      if (item.itemType.chartCategory === 'medication') {
        const drugName = (item.itemType.defaultData as Record<string, unknown>).drugName;
        if (typeof drugName === 'string') {
          checkMedicationInteractions(drugName, patient, item, annotations);
        }
      }

      // ── Comorbidity check ──
      checkComorbidityAnnotations(item, patient, annotations);
    }
  }

  return annotations;
}

// ============================================================================
// Internal Helpers
// ============================================================================

/** Known drug interaction pairs (simplified for prototype). */
const INTERACTION_PAIRS: [string, string, string][] = [
  ['ibuprofen', 'warfarin', 'Increased bleeding risk with concurrent NSAID + anticoagulant'],
  ['ibuprofen', 'aspirin', 'May reduce cardioprotective effect of aspirin'],
  ['amoxicillin', 'methotrexate', 'May increase methotrexate toxicity'],
];

function checkMedicationInteractions(
  drugName: string,
  patient: PatientOverviewData,
  item: ProtocolItemDef,
  annotations: ProtocolAnnotation[]
): void {
  const normalizedDrug = drugName.toLowerCase();
  for (const med of patient.medications) {
    const normalizedMed = med.name.toLowerCase();
    for (const [drug1, drug2, message] of INTERACTION_PAIRS) {
      if (
        (normalizedDrug.includes(drug1) && normalizedMed.includes(drug2)) ||
        (normalizedDrug.includes(drug2) && normalizedMed.includes(drug1))
      ) {
        annotations.push({
          itemId: item.id,
          type: 'medication-interaction',
          severity: 'warning',
          message: `${message} (current: ${med.name})`,
          sourceRef: med.name,
        });
      }
    }
  }
}

/** Conditions that warrant comorbidity annotations on NSAID/pain items. */
const COMORBIDITY_CONCERNS: { problemKeywords: string[]; itemCategories: string[]; message: string }[] = [
  {
    problemKeywords: ['diabetes', 'dm', 'a1c'],
    itemCategories: ['medication'],
    message: 'Consider renal function with diabetes — monitor GFR',
  },
  {
    problemKeywords: ['hypertension', 'htn'],
    itemCategories: ['medication'],
    message: 'NSAIDs may elevate blood pressure — monitor BP',
  },
  {
    problemKeywords: ['kidney', 'renal', 'ckd'],
    itemCategories: ['medication'],
    message: 'Renal impairment — adjust dose or avoid nephrotoxic agents',
  },
];

function checkComorbidityAnnotations(
  item: ProtocolItemDef,
  patient: PatientOverviewData,
  annotations: ProtocolAnnotation[]
): void {
  if (item.itemType.type !== 'orderable') return;

  for (const concern of COMORBIDITY_CONCERNS) {
    if (!concern.itemCategories.includes(item.itemType.chartCategory)) continue;

    const matchingProblem = patient.problems.find(p =>
      concern.problemKeywords.some(kw => p.name.toLowerCase().includes(kw))
    );

    if (matchingProblem) {
      annotations.push({
        itemId: item.id,
        type: 'comorbidity',
        severity: 'info',
        message: `${concern.message} (${matchingProblem.name})`,
        sourceRef: matchingProblem.name,
      });
    }
  }
}
