/**
 * Care Gap Evaluator
 *
 * Logic for evaluating care gaps and determining closure.
 */

import type { ChartItem, LabItem, ImagingItem, ProcedureItem } from '../../../types/chart-items';
import type {
  CareGapInstance,
  CareGapClosureCriteria,
  LabResultClosure,
  ImmunizationClosure,
  ProcedureClosure,
  ImagingClosure,
  CompositeClosure,
} from '../../../types/care-gaps';
import type { PatientContext } from '../../../types/patient';
import type {
  PatientGapEvaluation,
  GapEvaluationResult,
  ClosureAction,
} from './types';

// ============================================================================
// Main Evaluation Functions
// ============================================================================

/**
 * Evaluate all gaps for a patient
 */
export async function evaluatePatientGaps(
  patient: PatientContext
): Promise<PatientGapEvaluation> {
  // In production, this would fetch gaps from a care gap service
  // For now, return empty evaluation
  return {
    patientId: patient.id,
    evaluatedAt: new Date(),
    gaps: [],
    newGaps: [],
    closedGaps: [],
  };
}

/**
 * Check if an item closes a specific gap
 */
export async function evaluateGapClosure(
  gap: CareGapInstance,
  item: ChartItem
): Promise<GapEvaluationResult> {
  // Get the closure criteria (would come from gap definition in production)
  const criteria = getGapClosureCriteria(gap);

  if (!criteria) {
    return {
      gapId: gap.id,
      status: 'no-change',
      reason: 'No closure criteria defined',
    };
  }

  const match = matchesClosureCriteria(item, criteria);

  if (match.matches) {
    return {
      gapId: gap.id,
      status: match.pending ? 'pending' : 'closed',
      addressedBy: {
        itemId: item.id,
        itemType: item.category,
      },
      reason: match.reason,
    };
  }

  return {
    gapId: gap.id,
    status: 'no-change',
    reason: match.reason,
  };
}

/**
 * Match an item against closure criteria
 */
export function matchesClosureCriteria(
  item: ChartItem,
  criteria: CareGapClosureCriteria
): { matches: boolean; pending: boolean; reason?: string } {
  switch (criteria.type) {
    case 'lab-result':
      return matchesLabCriteria(item, criteria);

    case 'immunization':
      return matchesImmunizationCriteria(item, criteria);

    case 'procedure':
      return matchesProcedureCriteria(item, criteria);

    case 'imaging':
      return matchesImagingCriteria(item, criteria);

    case 'composite':
      return matchesCompositeCriteria(item, criteria);

    default:
      return { matches: false, pending: false, reason: 'Unsupported criteria type' };
  }
}

/**
 * Get suggested actions to close a gap
 */
export function getClosureActions(gap: CareGapInstance): ClosureAction[] {
  const actions: ClosureAction[] = [];

  // Generate actions based on gap category
  switch (gap._display.category) {
    case 'cancer-screening':
      if (gap._display.name.toLowerCase().includes('mammogram')) {
        actions.push({
          type: 'order-imaging',
          label: 'Order mammogram',
          itemTemplate: {
            category: 'imaging',
            displayText: 'Screening mammogram',
            data: {
              studyType: 'Mammogram',
              bodyPart: 'Bilateral breast',
              indication: gap._display.name,
              priority: 'routine',
              requiresAuth: false,
              orderStatus: 'draft',
            },
          },
        });
      } else if (gap._display.name.toLowerCase().includes('colonoscopy')) {
        actions.push({
          type: 'schedule-procedure',
          label: 'Schedule colonoscopy',
          itemTemplate: {
            category: 'referral',
            displayText: 'Colonoscopy referral',
            data: {
              specialty: 'Gastroenterology',
              reason: gap._display.name,
              urgency: 'routine',
              referralStatus: 'draft',
              requiresAuth: true,
            },
          },
        });
      } else if (gap._display.name.toLowerCase().includes('pap')) {
        actions.push({
          type: 'schedule-procedure',
          label: 'Order Pap smear',
          itemTemplate: {
            category: 'procedure',
            displayText: 'Pap smear',
            data: {
              procedureName: 'Pap smear',
              cptCode: '88175',
              indication: gap._display.name,
              procedureStatus: 'planned',
            },
          },
        });
      }
      break;

    case 'diabetes':
      if (gap._display.name.toLowerCase().includes('a1c')) {
        actions.push({
          type: 'order-lab',
          label: 'Order A1C',
          itemTemplate: {
            category: 'lab',
            displayText: 'Hemoglobin A1C',
            data: {
              testName: 'Hemoglobin A1C',
              testCode: '4548-4',
              priority: 'routine',
              collectionType: 'in-house',
              orderStatus: 'draft',
            },
          },
        });
      } else if (gap._display.name.toLowerCase().includes('eye')) {
        actions.push({
          type: 'schedule-procedure',
          label: 'Refer to ophthalmology',
          itemTemplate: {
            category: 'referral',
            displayText: 'Diabetic eye exam',
            data: {
              specialty: 'Ophthalmology',
              reason: 'Annual diabetic retinopathy screening',
              urgency: 'routine',
              referralStatus: 'draft',
              requiresAuth: false,
            },
          },
        });
      } else if (gap._display.name.toLowerCase().includes('foot')) {
        actions.push({
          type: 'document',
          label: 'Document foot exam',
          itemTemplate: {
            category: 'physical-exam',
            displayText: 'Diabetic foot exam',
            data: {
              system: 'musculoskeletal',
              finding: '',
              isNormal: true,
            },
          },
        });
      }
      break;

    case 'hypertension':
      if (gap._display.name.toLowerCase().includes('bp')) {
        actions.push({
          type: 'document',
          label: 'Record blood pressure',
          itemTemplate: {
            category: 'vitals',
            displayText: 'Blood pressure',
            data: {
              measurements: [],
              capturedAt: new Date(),
            },
          },
        });
      }
      break;

    case 'immunization':
      actions.push({
        type: 'administer',
        label: `Administer ${gap._display.name}`,
        itemTemplate: {
          category: 'procedure',
          displayText: gap._display.name,
          data: {
            procedureName: gap._display.name,
            indication: 'Immunization',
            procedureStatus: 'planned',
          },
        },
      });
      break;

    case 'preventive':
      if (gap._display.name.toLowerCase().includes('wellness')) {
        actions.push({
          type: 'document',
          label: 'Document wellness visit',
        });
      }
      break;

    default:
      // Generic action for unknown gap types
      actions.push({
        type: 'document',
        label: gap._display.actionLabel || `Address ${gap._display.name}`,
      });
  }

  return actions;
}

// ============================================================================
// Criteria Matching Functions
// ============================================================================

function matchesLabCriteria(
  item: ChartItem,
  criteria: LabResultClosure
): { matches: boolean; pending: boolean; reason?: string } {
  if (item.category !== 'lab') {
    return { matches: false, pending: false, reason: 'Not a lab item' };
  }

  const labItem = item as LabItem;

  // Check if test code matches
  const codeMatches = criteria.testCodes.some(
    (code) => labItem.data.testCode?.toLowerCase() === code.toLowerCase()
  );

  if (!codeMatches) {
    return { matches: false, pending: false, reason: 'Test code does not match' };
  }

  // Check if within time window (simplified)
  // In production, would check against the actual date

  // Check if results are available
  if (labItem.data.orderStatus !== 'resulted') {
    return {
      matches: true,
      pending: true,
      reason: 'Lab ordered but awaiting results',
    };
  }

  // Check result criteria if specified
  if (criteria.resultCriteria && labItem.data.results) {
    // Simplified - would need to match specific components
    return {
      matches: true,
      pending: false,
      reason: 'Lab resulted',
    };
  }

  return {
    matches: true,
    pending: false,
    reason: 'Lab criteria met',
  };
}

function matchesImmunizationCriteria(
  item: ChartItem,
  criteria: ImmunizationClosure
): { matches: boolean; pending: boolean; reason?: string } {
  if (item.category !== 'procedure') {
    return { matches: false, pending: false, reason: 'Not a procedure item' };
  }

  const procItem = item as ProcedureItem;

  // Check if procedure name suggests immunization
  // In production, would check CVX codes
  const isImmunization = procItem.data.procedureName
    .toLowerCase()
    .includes('vaccine') ||
    procItem.data.procedureName.toLowerCase().includes('immunization');

  if (!isImmunization) {
    return { matches: false, pending: false, reason: 'Not an immunization' };
  }

  if (procItem.data.procedureStatus === 'completed') {
    return { matches: true, pending: false, reason: 'Immunization administered' };
  }

  return {
    matches: true,
    pending: true,
    reason: 'Immunization planned',
  };
}

function matchesProcedureCriteria(
  item: ChartItem,
  criteria: ProcedureClosure
): { matches: boolean; pending: boolean; reason?: string } {
  if (item.category !== 'procedure') {
    return { matches: false, pending: false, reason: 'Not a procedure item' };
  }

  const procItem = item as ProcedureItem;

  // Check CPT code
  const codeMatches = criteria.cptCodes.some(
    (code) => procItem.data.cptCode?.toLowerCase() === code.toLowerCase()
  );

  if (!codeMatches) {
    return { matches: false, pending: false, reason: 'Procedure code does not match' };
  }

  if (procItem.data.procedureStatus === 'completed') {
    return { matches: true, pending: false, reason: 'Procedure completed' };
  }

  return {
    matches: true,
    pending: true,
    reason: 'Procedure scheduled',
  };
}

function matchesImagingCriteria(
  item: ChartItem,
  criteria: ImagingClosure
): { matches: boolean; pending: boolean; reason?: string } {
  if (item.category !== 'imaging') {
    return { matches: false, pending: false, reason: 'Not an imaging item' };
  }

  const imgItem = item as ImagingItem;

  // Check study type
  const typeMatches = criteria.studyTypes.some(
    (type) => imgItem.data.studyType.toLowerCase().includes(type.toLowerCase())
  );

  if (!typeMatches) {
    return { matches: false, pending: false, reason: 'Study type does not match' };
  }

  if (criteria.requiresResult && imgItem.data.orderStatus !== 'read') {
    return {
      matches: true,
      pending: true,
      reason: 'Imaging ordered, awaiting read',
    };
  }

  if (imgItem.data.orderStatus === 'completed' || imgItem.data.orderStatus === 'read') {
    return { matches: true, pending: false, reason: 'Imaging completed' };
  }

  return {
    matches: true,
    pending: true,
    reason: 'Imaging ordered',
  };
}

function matchesCompositeCriteria(
  item: ChartItem,
  criteria: CompositeClosure
): { matches: boolean; pending: boolean; reason?: string } {
  const results = criteria.criteria.map((c) => matchesClosureCriteria(item, c));

  if (criteria.operator === 'and') {
    const allMatch = results.every((r) => r.matches);
    const anyPending = results.some((r) => r.pending);
    return {
      matches: allMatch,
      pending: allMatch && anyPending,
      reason: allMatch ? 'All criteria met' : 'Not all criteria met',
    };
  } else {
    const anyMatch = results.some((r) => r.matches);
    const matchResult = results.find((r) => r.matches);
    return {
      matches: anyMatch,
      pending: matchResult?.pending || false,
      reason: anyMatch ? 'One or more criteria met' : 'No criteria met',
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get closure criteria for a gap (mock implementation)
 */
function getGapClosureCriteria(gap: CareGapInstance): CareGapClosureCriteria | null {
  // In production, this would fetch from the gap definition
  // For now, generate based on gap category
  switch (gap._display.category) {
    case 'diabetes':
      if (gap._display.name.toLowerCase().includes('a1c')) {
        return {
          type: 'lab-result',
          testCodes: ['4548-4'],
          withinDays: 365,
        };
      }
      break;

    case 'cancer-screening':
      if (gap._display.name.toLowerCase().includes('mammogram')) {
        return {
          type: 'imaging',
          studyTypes: ['mammogram'],
          withinDays: 730, // 2 years
          requiresResult: true,
        };
      }
      break;

    case 'immunization':
      return {
        type: 'immunization',
        cvxCodes: ['999'], // Placeholder
        withinDays: 365,
      };
  }

  return null;
}
