/**
 * Priority Computation Engine
 *
 * Pure functions that transform pathway + patient + escalation data into
 * PriorityItems for the Priorities View. Follows the routing-computation.ts
 * pattern: no React, no side effects, memoization-friendly.
 */

import type {
  Pathway,
  PathwayPatient,
  PathwayNode,
  EscalationFlag,
  PriorityBadge,
  PriorityItem,
  PrioritySortMode,
  Responsibility,
  NodeType,
  PatientPathwayAssignment,
} from '../types/population-health';

// ============================================================================
// Constants
// ============================================================================

/** Node types excluded from the priority queue */
const EXCLUDED_NODE_TYPES: Set<NodeType> = new Set([
  'cohort-source',
  'metric',
  'loop-reference',
]);

/** Default stale threshold when node has no avgDaysInStage */
const DEFAULT_STALE_THRESHOLD_DAYS = 14;

/** Mock AI reasoning text for REVIEW-badge items, keyed by pathway */
const AI_REASONING_BY_PATHWAY: Record<string, string> = {
  'pw-diabetes-a1c':
    'Patient\'s A1c has increased from 7.2% to 8.1% over the past two quarters despite current metformin regimen. Recommend reviewing medication titration or adding a second-line agent. Adherence data suggests possible compliance gaps — patient missed two refill windows.',
  'pw-colon-screening':
    'Colonoscopy is overdue by 8 months based on age-appropriate screening guidelines. Patient has family history of colorectal cancer (first-degree relative). Risk stratification suggests this should be prioritized over routine scheduling.',
  'pw-post-discharge':
    'Medication reconciliation shows a potential gap: discharge summary lists amlodipine 10mg but pharmacy records show the prescription was never filled. Patient has two follow-up appointments missed since discharge. Readmission risk score is elevated.',
};

/** Stale multiplier — patient is stale if daysAtStage > multiplier × avgDaysInStage */
const STALE_MULTIPLIER = 2;

// ============================================================================
// badgeWeight
// ============================================================================

/** Numeric weight for sort ordering: lower = more urgent */
export function badgeWeight(badge: PriorityBadge): number {
  switch (badge) {
    case 'URGENT': return 0;
    case 'REVIEW': return 1;
    case 'ACTION': return 2;
    case 'MONITOR': return 3;
  }
}

// ============================================================================
// isStaleAtNode
// ============================================================================

/**
 * A patient is stale if they've been at the node longer than
 * 2× the node's avgDaysInStage (or 14 days if no throughput data).
 */
export function isStaleAtNode(daysAtStage: number, node: PathwayNode): boolean {
  const avg = node.flowState?.throughput?.avgDaysInStage;
  const threshold = avg != null && avg > 0
    ? Math.ceil(avg * STALE_MULTIPLIER)
    : DEFAULT_STALE_THRESHOLD_DAYS;
  return daysAtStage > threshold;
}

// ============================================================================
// assignBadge
// ============================================================================

/**
 * Classify a priority item's urgency badge.
 * Evaluated in order — first match wins.
 */
export function assignBadge(
  assignment: PatientPathwayAssignment,
  node: PathwayNode,
  hasEscalation: boolean,
  isStale: boolean,
  riskTier: 'high' | 'rising' | 'stable',
): PriorityBadge {
  // URGENT: escalation flag, escalated status, escalation node type,
  // or gap with daysAtStage ≥ 14
  if (hasEscalation) return 'URGENT';
  if (assignment.status === 'escalated') return 'URGENT';
  if (node.type === 'escalation') return 'URGENT';
  const daysAtStage = computeDaysAtStage(assignment.stageEntryDate);
  if ((node.gapCount ?? 0) > 0 && daysAtStage >= 14) return 'URGENT';

  // REVIEW: branch node, or stale at action node, or high-risk at action/wait-monitor
  if (node.type === 'branch') return 'REVIEW';
  if (isStale && node.type === 'action') return 'REVIEW';
  if (riskTier === 'high' && (node.type === 'action' || node.type === 'wait-monitor')) return 'REVIEW';

  // ACTION: action or filter node (non-stale, non-high-risk — those caught above)
  if (node.type === 'action' || node.type === 'filter') return 'ACTION';

  // MONITOR: wait-monitor and everything else
  return 'MONITOR';
}

// ============================================================================
// buildContextLine
// ============================================================================

/** Build a clinical summary line from patient + node + pathway context */
export function buildContextLine(
  patient: PathwayPatient,
  node: PathwayNode,
  pathway: Pathway,
): string {
  const data = patient.clinicalData;

  // Diabetes pathway — show A1c + relevant info
  if (pathway.id === 'pw-diabetes-a1c') {
    const a1c = data.lastA1c;
    if (a1c != null) {
      const parts: string[] = [`A1c ${a1c}%`];
      if (node.type === 'escalation' || node.type === 'action') {
        parts.push(node.description ?? node.label);
      }
      return parts.join(' — ');
    }
    return node.description ?? node.label;
  }

  // Cancer screening pathway
  if (pathway.id === 'pw-colon-screening') {
    const screenType = data.screeningType;
    if (screenType) {
      const parts: string[] = [String(screenType)];
      if (data.lastScreeningDate === null) {
        parts.push('never screened');
      } else if (node.description) {
        parts.push(node.description);
      }
      return parts.join(' — ');
    }
    return node.description ?? node.label;
  }

  // Post-discharge pathway
  if (pathway.id === 'pw-post-discharge') {
    const status = data.followUpStatus;
    if (status) {
      return String(status);
    }
    return node.description ?? node.label;
  }

  // Fallback
  return node.description ?? node.label;
}

// ============================================================================
// deriveResponsibility
// ============================================================================

/**
 * Determine who is responsible for acting on a priority item.
 * - 'mine': assigned to current provider AND has an active badge (URGENT/REVIEW/ACTION)
 * - 'ai': automated monitoring at wait-monitor nodes with MONITOR badge
 * - 'team': assigned to someone else (not current provider)
 * - Fallback: 'mine'
 */
export function deriveResponsibility(
  badge: PriorityBadge,
  node: PathwayNode,
): Responsibility {
  const isCurrentProvider = node.assignedProviderId === 'prov-current';
  const activeBadges: Set<PriorityBadge> = new Set(['URGENT', 'REVIEW', 'ACTION']);

  // AI handles automated monitoring at wait-monitor nodes
  if (badge === 'MONITOR' && node.type === 'wait-monitor') return 'ai';

  // Assigned to current provider with active badge
  if (isCurrentProvider && activeBadges.has(badge)) return 'mine';

  // Assigned to someone else (not current provider, has an assignee)
  if (node.assignedProviderId && !isCurrentProvider) return 'team';

  // Unassigned nodes — fall back to mine (provider's panel)
  return 'mine';
}

// ============================================================================
// groupBySection
// ============================================================================

/**
 * Group priority items by the current sort axis.
 * Returns a Map with insertion-ordered keys (group label → items).
 */
export function groupBySection(
  items: PriorityItem[],
  sortMode: PrioritySortMode,
): Map<string, PriorityItem[]> {
  const groups = new Map<string, PriorityItem[]>();

  if (sortMode === 'urgency') {
    // Fixed order: URGENT, REVIEW, ACTION, MONITOR
    const order: PriorityBadge[] = ['URGENT', 'REVIEW', 'ACTION', 'MONITOR'];
    for (const badge of order) {
      const matching = items.filter((item) => item.badge === badge);
      if (matching.length > 0) {
        groups.set(badge, matching);
      }
    }
  } else if (sortMode === 'by-node') {
    for (const item of items) {
      const existing = groups.get(item.nodeLabel);
      if (existing) {
        existing.push(item);
      } else {
        groups.set(item.nodeLabel, [item]);
      }
    }
  } else {
    // by-date: bucket by recency
    for (const item of items) {
      const bucket = dateBucket(item.daysAtStage);
      const existing = groups.get(bucket);
      if (existing) {
        existing.push(item);
      } else {
        groups.set(bucket, [item]);
      }
    }
  }

  return groups;
}

/** Map daysAtStage to a human-readable recency bucket */
function dateBucket(daysAtStage: number): string {
  if (daysAtStage <= 0) return 'Today';
  if (daysAtStage === 1) return 'Yesterday';
  if (daysAtStage <= 7) return 'This week';
  return 'Older';
}

// ============================================================================
// computeResponsibilityCounts
// ============================================================================

/**
 * Count items per responsibility category.
 * Operates on the full (unfiltered) item list for ambient counts.
 */
export function computeResponsibilityCounts(
  items: PriorityItem[],
): Record<Responsibility, number> {
  const counts: Record<Responsibility, number> = { mine: 0, team: 0, ai: 0 };
  for (const item of items) {
    counts[item.responsibility]++;
  }
  return counts;
}

// ============================================================================
// derivePriorityItems
// ============================================================================

/** Compute days since a date */
function computeDaysAtStage(stageEntryDate: Date): number {
  const now = Date.now();
  const entry = stageEntryDate instanceof Date ? stageEntryDate.getTime() : new Date(stageEntryDate).getTime();
  return Math.max(0, Math.floor((now - entry) / 86400000));
}

/**
 * Build all PriorityItems from source data.
 * Iterates patients × their pathway assignments, excludes non-actionable
 * node types and draft lifecycle nodes.
 */
export function derivePriorityItems(
  pathways: Pathway[],
  patients: PathwayPatient[],
  escalationFlags: EscalationFlag[],
): PriorityItem[] {
  // Build lookup maps
  const pathwayMap = new Map<string, Pathway>();
  const nodeMap = new Map<string, PathwayNode>();
  for (const pw of pathways) {
    pathwayMap.set(pw.id, pw);
    for (const node of pw.nodes) {
      nodeMap.set(node.id, node);
    }
  }

  // Build escalation lookup: nodeId → EscalationFlag
  const escalationByNode = new Map<string, EscalationFlag>();
  for (const flag of escalationFlags) {
    escalationByNode.set(flag.nodeId, flag);
  }

  const items: PriorityItem[] = [];

  for (const patient of patients) {
    for (const assignment of patient.pathways) {
      const pathway = pathwayMap.get(assignment.pathwayId);
      if (!pathway) continue;

      const node = nodeMap.get(assignment.currentNodeId);
      if (!node) continue;

      // Exclusion: skip excluded node types
      if (EXCLUDED_NODE_TYPES.has(node.type)) continue;

      // Exclusion: skip draft lifecycle
      if (node.lifecycleState === 'draft') continue;

      const daysAtStage = computeDaysAtStage(assignment.stageEntryDate);
      const stale = isStaleAtNode(daysAtStage, node);
      const escalation = escalationByNode.get(node.id);
      const hasEscalation = !!escalation;
      const isAssigned = node.assignedProviderId === 'prov-current';

      const badge = assignBadge(assignment, node, hasEscalation, stale, patient.riskTier);
      const contextLine = buildContextLine(patient, node, pathway);

      // AI reasoning for REVIEW items — canned mock text per pathway
      const aiReasoning = badge === 'REVIEW'
        ? AI_REASONING_BY_PATHWAY[pathway.id]
        : undefined;

      const responsibility = deriveResponsibility(badge, node);

      items.push({
        id: `${patient.patientId}::${node.id}`,
        patientName: patient.name,
        patientId: patient.patientId,
        badge,
        nodeId: node.id,
        nodeLabel: node.label,
        pathwayId: pathway.id,
        pathwayName: pathway.name,
        daysAtStage,
        contextLine,
        isEscalated: hasEscalation || assignment.status === 'escalated',
        escalationReason: escalation?.reason,
        riskTier: patient.riskTier,
        patientStatus: assignment.status,
        isAssigned,
        isStale: stale,
        aiReasoning,
        responsibility,
      });
    }
  }

  return items;
}

// ============================================================================
// computePriorityQueue
// ============================================================================

/**
 * Filter items by selected node IDs (empty = show all) and sort
 * according to the chosen sort mode.
 */
export function computePriorityQueue(
  items: PriorityItem[],
  selectedNodeIds: string[],
  sortMode: PrioritySortMode,
): PriorityItem[] {
  // Filter by selected nodes (empty selection = include all)
  const filtered = selectedNodeIds.length > 0
    ? items.filter((item) => selectedNodeIds.includes(item.nodeId))
    : items;

  // Sort
  const sorted = [...filtered];
  switch (sortMode) {
    case 'urgency':
      sorted.sort((a, b) => {
        const wDiff = badgeWeight(a.badge) - badgeWeight(b.badge);
        if (wDiff !== 0) return wDiff;
        return b.daysAtStage - a.daysAtStage; // longest waiting first
      });
      break;

    case 'by-node':
      sorted.sort((a, b) => {
        const labelCmp = a.nodeLabel.localeCompare(b.nodeLabel);
        if (labelCmp !== 0) return labelCmp;
        return badgeWeight(a.badge) - badgeWeight(b.badge);
      });
      break;

    case 'by-date':
      sorted.sort((a, b) => b.daysAtStage - a.daysAtStage);
      break;
  }

  return sorted;
}
