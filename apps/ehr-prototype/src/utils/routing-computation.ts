/**
 * Routing Computation Engine
 *
 * Pure functions that transform patient data into RoutingData for the
 * Routing view. Groups patients by cohort within categories, computes
 * per-card attention metrics and node concentration, applies dimension
 * filters (OR within axis, AND across axes — same logic as Sankey).
 */

import type {
  AllPatientsPatient,
  SankeyCohortDef,
  DimensionSelection,
  RiskTier,
  RoutingData,
  RoutingCategory,
  RoutingCohortCard,
  NodeConcentrationItem,
  UnenrolledGroup,
} from '../types/population-health';
import { filterPatients } from './sankey-computation';

// ============================================================================
// Constants
// ============================================================================

const EMPTY_RISK_BREAKDOWN: Record<RiskTier, number> = {
  critical: 0,
  high: 0,
  moderate: 0,
  low: 0,
  unassessed: 0,
};

// ============================================================================
// hasActiveSelection
// ============================================================================

/** Check if any dimension filter is active */
export function hasActiveSelection(selection: DimensionSelection): boolean {
  return (
    selection.conditions.length > 0 ||
    selection.preventive.length > 0 ||
    selection.riskTiers.length > 0 ||
    selection.actionStatuses.length > 0
  );
}

// ============================================================================
// computeNodeConcentration
// ============================================================================

/**
 * Compute node concentration for a cohort — groups patients by their
 * currentNodeLabel, counts, and sorts descending.
 */
export function computeNodeConcentration(
  patients: AllPatientsPatient[],
  cohortId: string,
  isCondition: boolean,
): NodeConcentrationItem[] {
  const counts = new Map<string, number>();

  for (const patient of patients) {
    const assignments = isCondition
      ? patient.conditionAssignments
      : patient.preventiveAssignments;

    for (const assignment of assignments) {
      const id = isCondition
        ? (assignment as { conditionCohortId: string }).conditionCohortId
        : (assignment as { preventiveCohortId: string }).preventiveCohortId;

      if (id !== cohortId) continue;

      const label = assignment.currentNodeLabel;
      if (label) {
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .map(([nodeLabel, patientCount]) => ({ nodeLabel, patientCount }))
    .sort((a, b) => b.patientCount - a.patientCount);
}

// ============================================================================
// computeRoutingData
// ============================================================================

/**
 * Compute routing data from patient list, cohort definitions, and current
 * dimension selection. Returns categories with sorted cohort cards and
 * an unenrolled group.
 */
export function computeRoutingData(
  patients: AllPatientsPatient[],
  conditionCohorts: SankeyCohortDef[],
  preventiveCohorts: SankeyCohortDef[],
  selection: DimensionSelection,
): RoutingData {
  const isFiltered = hasActiveSelection(selection);
  const filteredPatients = isFiltered ? filterPatients(patients, selection) : patients;
  const filteredIds = new Set(filteredPatients.map((p) => p.patientId));

  // --- Build condition cards ---
  const conditionCards: RoutingCohortCard[] = [];
  for (const def of conditionCohorts) {
    const allInCohort = patients.filter((p) =>
      p.conditionAssignments.some((a) => a.conditionCohortId === def.id),
    );
    const filteredInCohort = allInCohort.filter((p) => filteredIds.has(p.patientId));

    // Hide cards with 0 filtered patients when selection is active
    if (isFiltered && filteredInCohort.length === 0) continue;

    conditionCards.push(buildCard(def.id, def.label, allInCohort, filteredInCohort, true));
  }

  // --- Build preventive cards ---
  const preventiveCards: RoutingCohortCard[] = [];
  for (const def of preventiveCohorts) {
    const allInCohort = patients.filter((p) =>
      p.preventiveAssignments.some((a) => a.preventiveCohortId === def.id),
    );
    const filteredInCohort = allInCohort.filter((p) => filteredIds.has(p.patientId));

    if (isFiltered && filteredInCohort.length === 0) continue;

    preventiveCards.push(buildCard(def.id, def.label, allInCohort, filteredInCohort, false));
  }

  // Sort cards by attention priority: urgent+action-needed desc, then filtered count desc
  const sortCards = (cards: RoutingCohortCard[]) =>
    cards.sort((a, b) => {
      const aAttention = a.urgentCount + a.actionNeededCount;
      const bAttention = b.urgentCount + b.actionNeededCount;
      if (bAttention !== aAttention) return bAttention - aAttention;
      return b.filteredPatients - a.filteredPatients;
    });

  sortCards(conditionCards);
  sortCards(preventiveCards);

  // --- Assemble categories (hide empty) ---
  const categories: RoutingCategory[] = [];
  if (conditionCards.length > 0) {
    categories.push({ key: 'chronic-disease', label: 'Chronic Disease', cards: conditionCards });
  }
  if (preventiveCards.length > 0) {
    categories.push({ key: 'preventive-care', label: 'Preventive Care', cards: preventiveCards });
  }

  // --- Unenrolled group ---
  const unenrolled = buildUnenrolledGroup(patients, filteredPatients);

  return { categories, unenrolled };
}

// ============================================================================
// Internal helpers
// ============================================================================

function buildCard(
  cohortId: string,
  cohortName: string,
  allPatients: AllPatientsPatient[],
  filteredPatients: AllPatientsPatient[],
  isCondition: boolean,
): RoutingCohortCard {
  const source = filteredPatients;

  const urgentCount = source.filter((p) => p.actionStatus === 'urgent').length;
  const actionNeededCount = source.filter((p) => p.actionStatus === 'action-needed').length;

  const waitingDays = source
    .map((p) => p.daysWaiting ?? 0)
    .filter((d) => d > 0);
  const avgDaysWaiting = waitingDays.length > 0
    ? Math.round(waitingDays.reduce((sum, d) => sum + d, 0) / waitingDays.length)
    : 0;

  const riskBreakdown = { ...EMPTY_RISK_BREAKDOWN };
  for (const p of source) {
    riskBreakdown[p.riskTier]++;
  }

  const nodeConcentration = computeNodeConcentration(source, cohortId, isCondition);

  return {
    cohortId,
    cohortName,
    totalPatients: allPatients.length,
    filteredPatients: source.length,
    urgentCount,
    actionNeededCount,
    avgDaysWaiting,
    riskBreakdown,
    nodeConcentration,
  };
}

function buildUnenrolledGroup(
  allPatients: AllPatientsPatient[],
  filteredPatients: AllPatientsPatient[],
): UnenrolledGroup {
  const isUnenrolled = (p: AllPatientsPatient) =>
    p.conditionAssignments.length === 0 && p.preventiveAssignments.length === 0;

  const allUnenrolled = allPatients.filter(isUnenrolled);
  const filteredUnenrolled = filteredPatients.filter(isUnenrolled);

  const riskBreakdown = { ...EMPTY_RISK_BREAKDOWN };
  for (const p of filteredUnenrolled) {
    riskBreakdown[p.riskTier]++;
  }

  return {
    totalCount: allUnenrolled.length,
    filteredCount: filteredUnenrolled.length,
    riskBreakdown,
    conditionLabels: [],
  };
}
