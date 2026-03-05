/**
 * Sankey Computation Engine
 *
 * Pure functions that transform patient data into SankeyData for rendering.
 * Three axes: left (conditions+preventive), center (risk tier), right (action status).
 *
 * - Left axis over-counts the panel (patients in multiple conditions appear in each)
 * - Center and right axes sum to exact panel size
 * - Flows count patients per (source, target) pair
 */

import type {
  AllPatientsPatient,
  SankeyCohortDef,
  SankeyData,
  SankeyBand,
  SankeyAxisGroup,
  SankeyFlow,
  DimensionSelection,
  RiskTier,
  ActionStatus,
  SelectionStats,
} from '../types/population-health';

// ============================================================================
// Constants
// ============================================================================

const RISK_TIER_ORDER: RiskTier[] = ['critical', 'high', 'moderate', 'low', 'unassessed'];

const ACTION_STATUS_ORDER: ActionStatus[] = ['urgent', 'action-needed', 'monitoring', 'all-current', 'not-enrolled'];

const RISK_TIER_LABELS: Record<RiskTier, string> = {
  critical: 'Critical',
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
  unassessed: 'Unassessed',
};

const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  urgent: 'Urgent',
  'action-needed': 'Action Needed',
  monitoring: 'Monitoring',
  'all-current': 'All Current',
  'not-enrolled': 'Not Enrolled',
};

const ATTENTION_ACTION_STATUSES: ActionStatus[] = ['urgent', 'action-needed'];

// ============================================================================
// computeSankeyData
// ============================================================================

/**
 * Compute full Sankey data from patient list and cohort definitions.
 * Left axis: bands per condition + per preventive (over-counts panel).
 * Center axis: bands per risk tier (sums to panel size).
 * Right axis: bands per action status (sums to panel size).
 */
export function computeSankeyData(
  patients: AllPatientsPatient[],
  conditionDefs: SankeyCohortDef[],
  preventiveDefs: SankeyCohortDef[],
): SankeyData {
  // --- Left axis ---
  const conditionBands: SankeyBand[] = conditionDefs.map((def) => ({
    id: def.id,
    label: def.label,
    count: patients.filter((p) =>
      p.conditionAssignments.some((a) => a.conditionCohortId === def.id),
    ).length,
    zone: 'conditions' as const,
  }));

  const preventiveBands: SankeyBand[] = preventiveDefs.map((def) => ({
    id: def.id,
    label: def.label,
    count: patients.filter((p) =>
      p.preventiveAssignments.some((a) => a.preventiveCohortId === def.id),
    ).length,
    zone: 'preventive' as const,
  }));

  const leftAxis: SankeyAxisGroup[] = [
    { zone: 'conditions', bands: conditionBands },
    { zone: 'preventive', bands: preventiveBands },
  ];

  // --- Center axis (risk tiers) ---
  const centerAxis: SankeyBand[] = RISK_TIER_ORDER.map((tier) => ({
    id: `risk-${tier}`,
    label: RISK_TIER_LABELS[tier],
    count: patients.filter((p) => p.riskTier === tier).length,
  }));

  // --- Right axis (action statuses) ---
  const rightAxis: SankeyBand[] = ACTION_STATUS_ORDER.map((status) => ({
    id: `action-${status}`,
    label: ACTION_STATUS_LABELS[status],
    count: patients.filter((p) => p.actionStatus === status).length,
    attention: ATTENTION_ACTION_STATUSES.includes(status),
  }));

  // --- Left-to-center flows ---
  const leftToCenterFlows: SankeyFlow[] = [];
  const allLeftBands = [...conditionBands, ...preventiveBands];
  const allLeftDefs = [...conditionDefs, ...preventiveDefs];

  for (const leftBand of allLeftBands) {
    const def = allLeftDefs.find((d) => d.id === leftBand.id);
    if (!def) continue;

    for (const tier of RISK_TIER_ORDER) {
      const matchingPatients = patients.filter((p) => {
        const inLeft = def.zone === 'conditions'
          ? p.conditionAssignments.some((a) => a.conditionCohortId === def.id)
          : p.preventiveAssignments.some((a) => a.preventiveCohortId === def.id);
        return inLeft && p.riskTier === tier;
      });

      if (matchingPatients.length > 0) {
        const isAttentionFlow = (tier === 'critical' || tier === 'high');
        leftToCenterFlows.push({
          sourceId: leftBand.id,
          targetId: `risk-${tier}`,
          patientCount: matchingPatients.length,
          patientIds: matchingPatients.map((p) => p.patientId),
          attention: isAttentionFlow,
        });
      }
    }
  }

  // --- Center-to-right flows ---
  const centerToRightFlows: SankeyFlow[] = [];

  for (const tier of RISK_TIER_ORDER) {
    for (const status of ACTION_STATUS_ORDER) {
      const matchingPatients = patients.filter(
        (p) => p.riskTier === tier && p.actionStatus === status,
      );

      if (matchingPatients.length > 0) {
        // Attention: high/critical risk going to not-enrolled
        const isAttentionGap = (tier === 'critical' || tier === 'high') && status === 'not-enrolled';
        const isAttentionFlow = ATTENTION_ACTION_STATUSES.includes(status) || isAttentionGap;
        centerToRightFlows.push({
          sourceId: `risk-${tier}`,
          targetId: `action-${status}`,
          patientCount: matchingPatients.length,
          patientIds: matchingPatients.map((p) => p.patientId),
          attention: isAttentionFlow,
        });
      }
    }
  }

  // --- Totals ---
  const totalPatients = patients.length;
  const totalEnrollments =
    patients.reduce((sum, p) => sum + p.conditionAssignments.length + p.preventiveAssignments.length, 0);

  return {
    leftAxis,
    centerAxis,
    rightAxis,
    leftToCenterFlows,
    centerToRightFlows,
    totalPatients,
    totalEnrollments,
  };
}

// ============================================================================
// filterSankeyData
// ============================================================================

/**
 * Filter patients by dimension selection, then recompute Sankey data.
 * - Within-axis: OR (Diabetes OR CHF = union)
 * - Cross-axis: AND (Diabetes AND High Risk = intersection)
 * - Empty selection = full data (no filter)
 */
export function filterSankeyData(
  patients: AllPatientsPatient[],
  selection: DimensionSelection,
  conditionDefs: SankeyCohortDef[],
  preventiveDefs: SankeyCohortDef[],
): SankeyData {
  const filtered = filterPatients(patients, selection);
  return computeSankeyData(filtered, conditionDefs, preventiveDefs);
}

/**
 * Filter patient list by dimension selection.
 * Exported for use in context pane stats.
 */
export function filterPatients(
  patients: AllPatientsPatient[],
  selection: DimensionSelection,
): AllPatientsPatient[] {
  const hasConditions = selection.conditions.length > 0;
  const hasPreventive = selection.preventive.length > 0;
  const hasRisk = selection.riskTiers.length > 0;
  const hasAction = selection.actionStatuses.length > 0;

  // No selection = full data
  if (!hasConditions && !hasPreventive && !hasRisk && !hasAction) {
    return patients;
  }

  return patients.filter((p) => {
    // Within-axis: OR. Cross-axis: AND.
    // Each active axis must match (AND). Within each axis, any match suffices (OR).

    if (hasConditions) {
      const matchesCondition = selection.conditions.some((id) =>
        p.conditionAssignments.some((a) => a.conditionCohortId === id),
      );
      if (!matchesCondition) return false;
    }

    if (hasPreventive) {
      const matchesPreventive = selection.preventive.some((id) =>
        p.preventiveAssignments.some((a) => a.preventiveCohortId === id),
      );
      if (!matchesPreventive) return false;
    }

    if (hasRisk) {
      if (!selection.riskTiers.includes(p.riskTier)) return false;
    }

    if (hasAction) {
      if (!selection.actionStatuses.includes(p.actionStatus)) return false;
    }

    return true;
  });
}

// ============================================================================
// computeSelectionStats
// ============================================================================

/**
 * Compute summary stats for the current selection.
 */
export function computeSelectionStats(
  patients: AllPatientsPatient[],
  selection: DimensionSelection,
): SelectionStats {
  const filtered = filterPatients(patients, selection);
  const total = filtered.length;
  const needsAttention = filtered.filter(
    (p) => p.actionStatus === 'urgent' || p.actionStatus === 'action-needed',
  ).length;
  const notEnrolled = filtered.filter((p) => p.actionStatus === 'not-enrolled').length;
  const enrolled = total - notEnrolled;
  const enrollmentRate = total > 0 ? `${Math.round((enrolled / total) * 100)}%` : '—';

  // Build context label from selection
  const parts: string[] = [];
  if (selection.conditions.length > 0) parts.push(`${selection.conditions.length} condition(s)`);
  if (selection.preventive.length > 0) parts.push(`${selection.preventive.length} preventive`);
  if (selection.riskTiers.length > 0) parts.push(`${selection.riskTiers.length} risk tier(s)`);
  if (selection.actionStatuses.length > 0) parts.push(`${selection.actionStatuses.length} status(es)`);

  const contextLabel = parts.length > 0 ? parts.join(' + ') : 'Panel Overview';

  return { totalPatients: total, needsAttention, notEnrolled, enrollmentRate, contextLabel };
}

// ============================================================================
// Exports for display labels
// ============================================================================

export { RISK_TIER_ORDER, ACTION_STATUS_ORDER, RISK_TIER_LABELS, ACTION_STATUS_LABELS };
