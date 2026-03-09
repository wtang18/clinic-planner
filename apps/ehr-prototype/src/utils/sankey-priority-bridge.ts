/**
 * Sankey Priority Bridge
 *
 * Pure functions that connect the all-patients Sankey view to the priority
 * system. Given a clicked Sankey band, derives which patients belong to it
 * and returns matching PriorityItems for the navigator column.
 */

import type {
  AllPatientsPatient,
  DimensionSelection,
  PriorityItem,
} from '../types/population-health';
import {
  ALL_PATIENTS,
  CONDITION_COHORTS,
  PREVENTIVE_COHORTS,
} from '../data/mock-all-patients';
import {
  PATHWAYS,
  MOCK_POP_HEALTH_PATIENTS,
  MOCK_ESCALATION_FLAGS,
} from '../data/mock-population-health';
import { RISK_TIER_LABELS, ACTION_STATUS_LABELS } from './sankey-computation';
import { derivePriorityItems } from './priority-computation';
import type { RiskTier, ActionStatus } from '../types/population-health';

// ============================================================================
// matchesBand
// ============================================================================

/**
 * Check if a patient belongs to a specific Sankey band.
 * Band IDs follow prefixed conventions:
 *   cond-*    → condition assignment
 *   prev-*    → preventive assignment
 *   risk-*    → risk tier
 *   action-*  → action status
 */
export function matchesBand(
  patient: AllPatientsPatient,
  bandId: string,
): boolean {
  if (bandId.startsWith('cond-')) {
    return patient.conditionAssignments.some(
      (a) => a.conditionCohortId === bandId,
    );
  }
  if (bandId.startsWith('prev-')) {
    return patient.preventiveAssignments.some(
      (a) => a.preventiveCohortId === bandId,
    );
  }
  if (bandId.startsWith('risk-')) {
    const tier = bandId.replace('risk-', '');
    return patient.riskTier === tier;
  }
  if (bandId.startsWith('action-')) {
    const status = bandId.replace('action-', '');
    return patient.actionStatus === status;
  }
  return false;
}

// ============================================================================
// patientMatchesSelection
// ============================================================================

/**
 * Check if a single patient matches the current dimension selection.
 * Same logic as filterPatients() in sankey-computation.ts:
 *   Within-axis: OR (any match suffices)
 *   Cross-axis: AND (all active axes must match)
 *   Empty selection: matches all
 */
export function patientMatchesSelection(
  patient: AllPatientsPatient,
  selection: DimensionSelection,
): boolean {
  const hasConditions = selection.conditions.length > 0;
  const hasPreventive = selection.preventive.length > 0;
  const hasRisk = selection.riskTiers.length > 0;
  const hasAction = selection.actionStatuses.length > 0;

  if (!hasConditions && !hasPreventive && !hasRisk && !hasAction) return true;

  if (hasConditions) {
    const match = selection.conditions.some((id) =>
      patient.conditionAssignments.some((a) => a.conditionCohortId === id),
    );
    if (!match) return false;
  }

  if (hasPreventive) {
    const match = selection.preventive.some((id) =>
      patient.preventiveAssignments.some((a) => a.preventiveCohortId === id),
    );
    if (!match) return false;
  }

  if (hasRisk) {
    if (!selection.riskTiers.includes(patient.riskTier)) return false;
  }

  if (hasAction) {
    if (!selection.actionStatuses.includes(patient.actionStatus)) return false;
  }

  return true;
}

// ============================================================================
// deriveSankeyPriorityItems
// ============================================================================

/**
 * Derive PriorityItems for patients in a specific Sankey band,
 * further filtered by the current dimension selection.
 *
 * Data flow:
 * 1. Filter ALL_PATIENTS by band membership AND dimension selection
 * 2. Collect matching patient IDs
 * 3. Derive all PriorityItems (all pathways, not cohort-scoped)
 * 4. Filter to matching patient IDs
 *
 * Note: Patients with no PathwayPatient entry produce no PriorityItems.
 */
export function deriveSankeyPriorityItems(
  bandId: string,
  dimensionSelection: DimensionSelection,
): PriorityItem[] {
  // Filter to patients matching the band AND current dimension filters
  const matchingPatients = ALL_PATIENTS.filter(
    (p) => matchesBand(p, bandId) && patientMatchesSelection(p, dimensionSelection),
  );

  const matchingIds = new Set(matchingPatients.map((p) => p.patientId));
  if (matchingIds.size === 0) return [];

  // Derive all priority items across all pathways
  const allItems = derivePriorityItems(
    PATHWAYS,
    MOCK_POP_HEALTH_PATIENTS,
    MOCK_ESCALATION_FLAGS,
  );

  // Filter to items for matching patients
  return allItems.filter((item) => matchingIds.has(item.patientId));
}

// ============================================================================
// getBandLabel
// ============================================================================

/**
 * Look up the display label for a band ID.
 */
export function getBandLabel(bandId: string): string {
  if (bandId.startsWith('cond-')) {
    return CONDITION_COHORTS.find((c) => c.id === bandId)?.label ?? bandId;
  }
  if (bandId.startsWith('prev-')) {
    return PREVENTIVE_COHORTS.find((c) => c.id === bandId)?.label ?? bandId;
  }
  if (bandId.startsWith('risk-')) {
    const tier = bandId.replace('risk-', '') as RiskTier;
    return RISK_TIER_LABELS[tier] ?? bandId;
  }
  if (bandId.startsWith('action-')) {
    const status = bandId.replace('action-', '') as ActionStatus;
    return ACTION_STATUS_LABELS[status] ?? bandId;
  }
  return bandId;
}

// ============================================================================
// getBandPatientCount
// ============================================================================

/**
 * Count total patients in a band (before priority item filtering).
 */
export function getBandPatientCount(bandId: string): number {
  return ALL_PATIENTS.filter((p) => matchesBand(p, bandId)).length;
}
