/**
 * Priority Computation Tests
 *
 * Tests for derivePriorityItems, assignBadge, computePriorityQueue,
 * isStaleAtNode, badgeWeight, and buildContextLine.
 */

import { describe, it, expect } from 'vitest';
import {
  derivePriorityItems,
  assignBadge,
  computePriorityQueue,
  isStaleAtNode,
  badgeWeight,
  buildContextLine,
  deriveResponsibility,
  groupBySection,
  computeResponsibilityCounts,
} from '../../utils/priority-computation';
import type {
  Pathway,
  PathwayPatient,
  PathwayNode,
  EscalationFlag,
  PriorityItem,
  PriorityBadge,
  PatientPathwayAssignment,
} from '../../types/population-health';

// ============================================================================
// Test data factories
// ============================================================================

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000);

function makeNode(overrides: Partial<PathwayNode> & { id: string }): PathwayNode {
  return {
    type: 'action',
    label: overrides.id,
    columnIndex: 0,
    verticalPosition: 0,
    pills: [],
    config: {},
    lifecycleState: 'active',
    ...overrides,
  };
}

function makePathway(overrides: Partial<Pathway> & { id: string; nodes: PathwayNode[] }): Pathway {
  return {
    name: overrides.id,
    cohortId: 'coh-test',
    status: 'active',
    connections: [],
    ...overrides,
  };
}

function makePatient(overrides: Partial<PathwayPatient> & { patientId: string }): PathwayPatient {
  return {
    name: overrides.patientId,
    age: 50,
    gender: 'M',
    riskTier: 'stable',
    pathways: [],
    clinicalData: {},
    ...overrides,
  };
}

function makeAssignment(overrides: Partial<PatientPathwayAssignment>): PatientPathwayAssignment {
  return {
    pathwayId: 'pw-test',
    currentNodeId: 'n1',
    stageEntryDate: d(5),
    status: 'active',
    history: [],
    ...overrides,
  };
}

// ============================================================================
// badgeWeight
// ============================================================================

describe('badgeWeight', () => {
  it('returns ascending weights: URGENT < REVIEW < ACTION < MONITOR', () => {
    expect(badgeWeight('URGENT')).toBe(0);
    expect(badgeWeight('REVIEW')).toBe(1);
    expect(badgeWeight('ACTION')).toBe(2);
    expect(badgeWeight('MONITOR')).toBe(3);
  });

  it('URGENT sorts before MONITOR', () => {
    expect(badgeWeight('URGENT')).toBeLessThan(badgeWeight('MONITOR'));
  });
});

// ============================================================================
// isStaleAtNode
// ============================================================================

describe('isStaleAtNode', () => {
  it('uses 2× avgDaysInStage as threshold', () => {
    const node = makeNode({
      id: 'n1',
      flowState: {
        inbound: { natural: 0, error: 0 },
        atStage: { inProgress: 0, waiting: 0, error: 0 },
        outbound: { completed: 0 },
        throughput: { avgDaysInStage: 5 },
      },
    });
    // threshold = ceil(5 * 2) = 10
    expect(isStaleAtNode(10, node)).toBe(false); // exactly at threshold
    expect(isStaleAtNode(11, node)).toBe(true);  // over threshold
    expect(isStaleAtNode(5, node)).toBe(false);
  });

  it('falls back to 14 days when no throughput data', () => {
    const node = makeNode({ id: 'n1' });
    expect(isStaleAtNode(14, node)).toBe(false); // exactly at threshold
    expect(isStaleAtNode(15, node)).toBe(true);
    expect(isStaleAtNode(7, node)).toBe(false);
  });

  it('falls back to 14 days when avgDaysInStage is 0', () => {
    const node = makeNode({
      id: 'n1',
      flowState: {
        inbound: { natural: 0, error: 0 },
        atStage: { inProgress: 0, waiting: 0, error: 0 },
        outbound: { completed: 0 },
        throughput: { avgDaysInStage: 0 },
      },
    });
    expect(isStaleAtNode(15, node)).toBe(true);
    expect(isStaleAtNode(14, node)).toBe(false);
  });

  it('returns false for 0 days', () => {
    const node = makeNode({ id: 'n1' });
    expect(isStaleAtNode(0, node)).toBe(false);
  });
});

// ============================================================================
// assignBadge
// ============================================================================

describe('assignBadge', () => {
  const actionNode = makeNode({ id: 'n1', type: 'action' });
  const branchNode = makeNode({ id: 'n2', type: 'branch' });
  const escalationNode = makeNode({ id: 'n3', type: 'escalation' });
  const filterNode = makeNode({ id: 'n4', type: 'filter' });
  const waitNode = makeNode({ id: 'n5', type: 'wait-monitor' });

  it('returns URGENT when escalation flag exists', () => {
    const assignment = makeAssignment({});
    expect(assignBadge(assignment, actionNode, true, false, 'stable')).toBe('URGENT');
  });

  it('returns URGENT when patient status is escalated', () => {
    const assignment = makeAssignment({ status: 'escalated' });
    expect(assignBadge(assignment, actionNode, false, false, 'stable')).toBe('URGENT');
  });

  it('returns URGENT for escalation node type', () => {
    const assignment = makeAssignment({});
    expect(assignBadge(assignment, escalationNode, false, false, 'stable')).toBe('URGENT');
  });

  it('returns URGENT when gapCount > 0 and daysAtStage >= 14', () => {
    const gapNode = makeNode({ id: 'n-gap', type: 'action', gapCount: 2 });
    const assignment = makeAssignment({ stageEntryDate: d(14) });
    expect(assignBadge(assignment, gapNode, false, false, 'stable')).toBe('URGENT');
  });

  it('does NOT return URGENT for gapCount with daysAtStage < 14', () => {
    const gapNode = makeNode({ id: 'n-gap', type: 'action', gapCount: 2 });
    const assignment = makeAssignment({ stageEntryDate: d(13) });
    // Will be ACTION (action node, non-stale, non-high-risk)
    expect(assignBadge(assignment, gapNode, false, false, 'stable')).toBe('ACTION');
  });

  it('returns REVIEW for branch node', () => {
    const assignment = makeAssignment({});
    expect(assignBadge(assignment, branchNode, false, false, 'stable')).toBe('REVIEW');
  });

  it('returns REVIEW when stale at action node', () => {
    const assignment = makeAssignment({});
    expect(assignBadge(assignment, actionNode, false, true, 'stable')).toBe('REVIEW');
  });

  it('returns REVIEW for high-risk at action node', () => {
    const assignment = makeAssignment({});
    expect(assignBadge(assignment, actionNode, false, false, 'high')).toBe('REVIEW');
  });

  it('returns REVIEW for high-risk at wait-monitor node', () => {
    const assignment = makeAssignment({});
    expect(assignBadge(assignment, waitNode, false, false, 'high')).toBe('REVIEW');
  });

  it('returns ACTION for action node (non-stale, non-high-risk)', () => {
    const assignment = makeAssignment({});
    expect(assignBadge(assignment, actionNode, false, false, 'stable')).toBe('ACTION');
  });

  it('returns ACTION for filter node', () => {
    const assignment = makeAssignment({});
    expect(assignBadge(assignment, filterNode, false, false, 'stable')).toBe('ACTION');
  });

  it('returns MONITOR for wait-monitor node (non-high-risk)', () => {
    const assignment = makeAssignment({});
    expect(assignBadge(assignment, waitNode, false, false, 'stable')).toBe('MONITOR');
  });
});

// ============================================================================
// buildContextLine
// ============================================================================

describe('buildContextLine', () => {
  it('shows A1c value for diabetes pathway', () => {
    const actionNode = makeNode({ id: 'da-6b', type: 'action', label: 'Adjust Medication', description: 'A1c 7-9%' });
    const pathway = makePathway({ id: 'pw-diabetes-a1c', nodes: [actionNode] });
    const patient = makePatient({
      patientId: 'p1',
      clinicalData: { lastA1c: 8.5 },
    });
    const line = buildContextLine(patient, actionNode, pathway);
    expect(line).toContain('A1c 8.5%');
    expect(line).toContain('A1c 7-9%');
  });

  it('falls back to node description for diabetes pathway without A1c', () => {
    const node = makeNode({ id: 'da-2', type: 'filter', label: 'A1c Due', description: 'Last A1c > 90 days ago' });
    const pathway = makePathway({ id: 'pw-diabetes-a1c', nodes: [node] });
    const patient = makePatient({ patientId: 'p1', clinicalData: {} });
    expect(buildContextLine(patient, node, pathway)).toBe('Last A1c > 90 days ago');
  });

  it('shows screening type for colon screening pathway', () => {
    const node = makeNode({ id: 'cs-4a', type: 'action', label: 'Schedule Colonoscopy', description: 'Never screened or overdue' });
    const pathway = makePathway({ id: 'pw-colon-screening', nodes: [node] });
    const patient = makePatient({
      patientId: 'p1',
      clinicalData: { screeningType: 'Colonoscopy', lastScreeningDate: null },
    });
    const line = buildContextLine(patient, node, pathway);
    expect(line).toContain('Colonoscopy');
    expect(line).toContain('never screened');
  });

  it('shows follow-up status for post-discharge pathway', () => {
    const node = makeNode({ id: 'pd-3a', type: 'action', label: '48h Phone Call' });
    const pathway = makePathway({ id: 'pw-post-discharge', nodes: [node] });
    const patient = makePatient({
      patientId: 'p1',
      clinicalData: { followUpStatus: 'Phone call pending' },
    });
    expect(buildContextLine(patient, node, pathway)).toBe('Phone call pending');
  });

  it('falls back to node label for unknown pathway', () => {
    const node = makeNode({ id: 'x1', type: 'action', label: 'Something' });
    const pathway = makePathway({ id: 'pw-unknown', nodes: [node] });
    const patient = makePatient({ patientId: 'p1' });
    expect(buildContextLine(patient, node, pathway)).toBe('Something');
  });
});

// ============================================================================
// derivePriorityItems
// ============================================================================

describe('derivePriorityItems', () => {
  const actionNode = makeNode({ id: 'n-action', type: 'action', label: 'Action Step' });
  const cohortNode = makeNode({ id: 'n-source', type: 'cohort-source', label: 'Cohort' });
  const metricNode = makeNode({ id: 'n-metric', type: 'metric', label: 'Metric' });
  const loopNode = makeNode({ id: 'n-loop', type: 'loop-reference', label: 'Loop' });
  const draftNode = makeNode({ id: 'n-draft', type: 'action', label: 'Draft', lifecycleState: 'draft' });

  const pathway = makePathway({
    id: 'pw-test',
    nodes: [actionNode, cohortNode, metricNode, loopNode, draftNode],
  });

  it('excludes cohort-source, metric, and loop-reference node types', () => {
    const patients = [
      makePatient({ patientId: 'p1', pathways: [makeAssignment({ currentNodeId: 'n-source' })] }),
      makePatient({ patientId: 'p2', pathways: [makeAssignment({ currentNodeId: 'n-metric' })] }),
      makePatient({ patientId: 'p3', pathways: [makeAssignment({ currentNodeId: 'n-loop' })] }),
    ];
    const items = derivePriorityItems([pathway], patients, []);
    expect(items).toHaveLength(0);
  });

  it('excludes draft lifecycle nodes', () => {
    const patients = [
      makePatient({ patientId: 'p1', pathways: [makeAssignment({ currentNodeId: 'n-draft' })] }),
    ];
    const items = derivePriorityItems([pathway], patients, []);
    expect(items).toHaveLength(0);
  });

  it('includes action nodes with active lifecycle', () => {
    const patients = [
      makePatient({ patientId: 'p1', pathways: [makeAssignment({ currentNodeId: 'n-action' })] }),
    ];
    const items = derivePriorityItems([pathway], patients, []);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('p1::n-action');
    expect(items[0].nodeLabel).toBe('Action Step');
    expect(items[0].pathwayId).toBe('pw-test');
  });

  it('maps escalation flags to items', () => {
    const escalation: EscalationFlag = {
      nodeId: 'n-action',
      careFlowId: 'pw-test',
      targetProviderId: 'prov-current',
      sourceItemIds: ['p1'],
      reason: 'Needs urgent review',
      createdAt: d(1),
    };
    const patients = [
      makePatient({ patientId: 'p1', pathways: [makeAssignment({ currentNodeId: 'n-action' })] }),
    ];
    const items = derivePriorityItems([pathway], patients, [escalation]);
    expect(items[0].isEscalated).toBe(true);
    expect(items[0].escalationReason).toBe('Needs urgent review');
    expect(items[0].badge).toBe('URGENT');
  });

  it('marks assigned nodes', () => {
    const assignedNode = makeNode({
      id: 'n-assigned',
      type: 'action',
      label: 'Assigned',
      assignedProviderId: 'prov-current',
    });
    const pw = makePathway({ id: 'pw-test', nodes: [assignedNode] });
    const patients = [
      makePatient({
        patientId: 'p1',
        pathways: [makeAssignment({ currentNodeId: 'n-assigned' })],
      }),
    ];
    const items = derivePriorityItems([pw], patients, []);
    expect(items[0].isAssigned).toBe(true);
  });

  it('handles patients in multiple pathways', () => {
    const node2 = makeNode({ id: 'n-other', type: 'action', label: 'Other' });
    const pw2 = makePathway({ id: 'pw-other', nodes: [node2] });
    const patients = [
      makePatient({
        patientId: 'p1',
        pathways: [
          makeAssignment({ pathwayId: 'pw-test', currentNodeId: 'n-action' }),
          makeAssignment({ pathwayId: 'pw-other', currentNodeId: 'n-other' }),
        ],
      }),
    ];
    const items = derivePriorityItems([pathway, pw2], patients, []);
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.id).sort()).toEqual(['p1::n-action', 'p1::n-other']);
  });

  it('builds complete item shape', () => {
    const patients = [
      makePatient({
        patientId: 'p1',
        name: 'Test Patient',
        riskTier: 'high',
        pathways: [makeAssignment({ currentNodeId: 'n-action', status: 'active', stageEntryDate: d(5) })],
      }),
    ];
    const items = derivePriorityItems([pathway], patients, []);
    const item = items[0];
    expect(item.patientName).toBe('Test Patient');
    expect(item.patientId).toBe('p1');
    expect(item.nodeId).toBe('n-action');
    expect(item.pathwayName).toBe('pw-test');
    expect(item.daysAtStage).toBeGreaterThanOrEqual(4); // approximately 5
    expect(item.riskTier).toBe('high');
    expect(item.patientStatus).toBe('active');
    expect(typeof item.contextLine).toBe('string');
    expect(typeof item.isStale).toBe('boolean');
    expect(['mine', 'team', 'ai']).toContain(item.responsibility);
  });

  it('returns empty array when no patients', () => {
    const items = derivePriorityItems([pathway], [], []);
    expect(items).toEqual([]);
  });

  it('returns empty array when no pathways', () => {
    const patients = [
      makePatient({ patientId: 'p1', pathways: [makeAssignment({ currentNodeId: 'n-action' })] }),
    ];
    const items = derivePriorityItems([], patients, []);
    expect(items).toEqual([]);
  });
});

// ============================================================================
// computePriorityQueue
// ============================================================================

describe('computePriorityQueue', () => {
  function makeItem(overrides: Partial<PriorityItem> & { id: string }): PriorityItem {
    return {
      patientName: overrides.id,
      patientId: overrides.id,
      badge: 'ACTION',
      nodeId: 'n1',
      nodeLabel: 'Node',
      pathwayId: 'pw-test',
      pathwayName: 'Test',
      daysAtStage: 5,
      contextLine: '',
      isEscalated: false,
      riskTier: 'stable',
      patientStatus: 'active',
      isAssigned: false,
      isStale: false,
      responsibility: 'mine',
      ...overrides,
    };
  }

  describe('filtering by selectedNodeIds', () => {
    it('returns all items when no nodes are selected', () => {
      const items = [
        makeItem({ id: 'a', nodeId: 'n1' }),
        makeItem({ id: 'b', nodeId: 'n2' }),
      ];
      const result = computePriorityQueue(items, [], 'urgency');
      expect(result).toHaveLength(2);
    });

    it('filters to only matching node IDs', () => {
      const items = [
        makeItem({ id: 'a', nodeId: 'n1' }),
        makeItem({ id: 'b', nodeId: 'n2' }),
        makeItem({ id: 'c', nodeId: 'n1' }),
      ];
      const result = computePriorityQueue(items, ['n1'], 'urgency');
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.nodeId === 'n1')).toBe(true);
    });

    it('supports multiple selected nodes', () => {
      const items = [
        makeItem({ id: 'a', nodeId: 'n1' }),
        makeItem({ id: 'b', nodeId: 'n2' }),
        makeItem({ id: 'c', nodeId: 'n3' }),
      ];
      const result = computePriorityQueue(items, ['n1', 'n3'], 'urgency');
      expect(result).toHaveLength(2);
    });

    it('returns empty when no nodes match', () => {
      const items = [makeItem({ id: 'a', nodeId: 'n1' })];
      const result = computePriorityQueue(items, ['n99'], 'urgency');
      expect(result).toHaveLength(0);
    });
  });

  describe('urgency sort', () => {
    it('sorts by badge weight ascending, then daysAtStage descending', () => {
      const items = [
        makeItem({ id: 'monitor', badge: 'MONITOR', daysAtStage: 20 }),
        makeItem({ id: 'urgent-new', badge: 'URGENT', daysAtStage: 1 }),
        makeItem({ id: 'urgent-old', badge: 'URGENT', daysAtStage: 10 }),
        makeItem({ id: 'action', badge: 'ACTION', daysAtStage: 5 }),
      ];
      const result = computePriorityQueue(items, [], 'urgency');
      expect(result.map((i) => i.id)).toEqual([
        'urgent-old',   // URGENT, 10d
        'urgent-new',   // URGENT, 1d
        'action',       // ACTION, 5d
        'monitor',      // MONITOR, 20d
      ]);
    });
  });

  describe('by-node sort', () => {
    it('sorts alphabetically by nodeLabel, then by badge weight', () => {
      const items = [
        makeItem({ id: 'b-action', nodeLabel: 'Zulu', badge: 'ACTION' }),
        makeItem({ id: 'a-urgent', nodeLabel: 'Alpha', badge: 'URGENT' }),
        makeItem({ id: 'a-monitor', nodeLabel: 'Alpha', badge: 'MONITOR' }),
      ];
      const result = computePriorityQueue(items, [], 'by-node');
      expect(result.map((i) => i.id)).toEqual([
        'a-urgent',    // Alpha, URGENT
        'a-monitor',   // Alpha, MONITOR
        'b-action',    // Zulu, ACTION
      ]);
    });
  });

  describe('by-date sort', () => {
    it('sorts by daysAtStage descending (longest first)', () => {
      const items = [
        makeItem({ id: 'new', daysAtStage: 1 }),
        makeItem({ id: 'old', daysAtStage: 30 }),
        makeItem({ id: 'mid', daysAtStage: 10 }),
      ];
      const result = computePriorityQueue(items, [], 'by-date');
      expect(result.map((i) => i.id)).toEqual(['old', 'mid', 'new']);
    });
  });

  describe('empty inputs', () => {
    it('returns empty array for empty items', () => {
      expect(computePriorityQueue([], [], 'urgency')).toEqual([]);
      expect(computePriorityQueue([], ['n1'], 'by-node')).toEqual([]);
    });
  });
});

// ============================================================================
// deriveResponsibility
// ============================================================================

describe('deriveResponsibility', () => {
  it('returns "mine" for assigned-to-current-provider with URGENT badge', () => {
    const node = makeNode({ id: 'n1', type: 'action', assignedProviderId: 'prov-current' });
    expect(deriveResponsibility('URGENT', node)).toBe('mine');
  });

  it('returns "mine" for assigned-to-current-provider with REVIEW badge', () => {
    const node = makeNode({ id: 'n1', type: 'action', assignedProviderId: 'prov-current' });
    expect(deriveResponsibility('REVIEW', node)).toBe('mine');
  });

  it('returns "mine" for assigned-to-current-provider with ACTION badge', () => {
    const node = makeNode({ id: 'n1', type: 'action', assignedProviderId: 'prov-current' });
    expect(deriveResponsibility('ACTION', node)).toBe('mine');
  });

  it('returns "ai" for MONITOR badge at wait-monitor node', () => {
    const node = makeNode({ id: 'n1', type: 'wait-monitor' });
    expect(deriveResponsibility('MONITOR', node)).toBe('ai');
  });

  it('returns "ai" for MONITOR at wait-monitor even if assigned to current', () => {
    const node = makeNode({ id: 'n1', type: 'wait-monitor', assignedProviderId: 'prov-current' });
    expect(deriveResponsibility('MONITOR', node)).toBe('ai');
  });

  it('returns "team" for nodes assigned to another provider', () => {
    const node = makeNode({ id: 'n1', type: 'action', assignedProviderId: 'prov-ma-chen' });
    expect(deriveResponsibility('ACTION', node)).toBe('team');
  });

  it('returns "team" for MONITOR at non-wait-monitor node assigned to other', () => {
    const node = makeNode({ id: 'n1', type: 'action', assignedProviderId: 'prov-ma-chen' });
    expect(deriveResponsibility('MONITOR', node)).toBe('team');
  });

  it('returns "mine" for unassigned nodes (fallback)', () => {
    const node = makeNode({ id: 'n1', type: 'action' });
    expect(deriveResponsibility('ACTION', node)).toBe('mine');
  });

  it('returns "mine" for MONITOR at non-wait-monitor unassigned node', () => {
    const node = makeNode({ id: 'n1', type: 'action' });
    expect(deriveResponsibility('MONITOR', node)).toBe('mine');
  });
});

// ============================================================================
// groupBySection
// ============================================================================

describe('groupBySection', () => {
  function makeItem(overrides: Partial<PriorityItem> & { id: string }): PriorityItem {
    return {
      patientName: overrides.id,
      patientId: overrides.id,
      badge: 'ACTION',
      nodeId: 'n1',
      nodeLabel: 'Node',
      pathwayId: 'pw-test',
      pathwayName: 'Test',
      daysAtStage: 5,
      contextLine: '',
      isEscalated: false,
      riskTier: 'stable',
      patientStatus: 'active',
      isAssigned: false,
      isStale: false,
      responsibility: 'mine',
      ...overrides,
    };
  }

  describe('urgency mode', () => {
    it('groups by badge in fixed order', () => {
      const items = [
        makeItem({ id: 'a', badge: 'MONITOR' }),
        makeItem({ id: 'b', badge: 'URGENT' }),
        makeItem({ id: 'c', badge: 'ACTION' }),
        makeItem({ id: 'd', badge: 'REVIEW' }),
      ];
      const groups = groupBySection(items, 'urgency');
      const keys = Array.from(groups.keys());
      expect(keys).toEqual(['URGENT', 'REVIEW', 'ACTION', 'MONITOR']);
    });

    it('omits empty badge groups', () => {
      const items = [
        makeItem({ id: 'a', badge: 'ACTION' }),
        makeItem({ id: 'b', badge: 'MONITOR' }),
      ];
      const groups = groupBySection(items, 'urgency');
      expect(Array.from(groups.keys())).toEqual(['ACTION', 'MONITOR']);
    });

    it('returns empty map for no items', () => {
      const groups = groupBySection([], 'urgency');
      expect(groups.size).toBe(0);
    });
  });

  describe('by-node mode', () => {
    it('groups by nodeLabel', () => {
      const items = [
        makeItem({ id: 'a', nodeLabel: 'Order Lab' }),
        makeItem({ id: 'b', nodeLabel: 'Schedule Visit' }),
        makeItem({ id: 'c', nodeLabel: 'Order Lab' }),
      ];
      const groups = groupBySection(items, 'by-node');
      expect(groups.size).toBe(2);
      expect(groups.get('Order Lab')!).toHaveLength(2);
      expect(groups.get('Schedule Visit')!).toHaveLength(1);
    });
  });

  describe('by-date mode', () => {
    it('groups by recency bucket', () => {
      const items = [
        makeItem({ id: 'today', daysAtStage: 0 }),
        makeItem({ id: 'yesterday', daysAtStage: 1 }),
        makeItem({ id: 'this-week', daysAtStage: 5 }),
        makeItem({ id: 'older', daysAtStage: 14 }),
      ];
      const groups = groupBySection(items, 'by-date');
      expect(groups.get('Today')!).toHaveLength(1);
      expect(groups.get('Yesterday')!).toHaveLength(1);
      expect(groups.get('This week')!).toHaveLength(1);
      expect(groups.get('Older')!).toHaveLength(1);
    });

    it('handles boundary: 7 days is "This week"', () => {
      const items = [makeItem({ id: 'a', daysAtStage: 7 })];
      const groups = groupBySection(items, 'by-date');
      expect(groups.has('This week')).toBe(true);
    });

    it('handles boundary: 8 days is "Older"', () => {
      const items = [makeItem({ id: 'a', daysAtStage: 8 })];
      const groups = groupBySection(items, 'by-date');
      expect(groups.has('Older')).toBe(true);
    });
  });
});

// ============================================================================
// computeResponsibilityCounts
// ============================================================================

describe('computeResponsibilityCounts', () => {
  function makeItem(overrides: Partial<PriorityItem> & { id: string }): PriorityItem {
    return {
      patientName: overrides.id,
      patientId: overrides.id,
      badge: 'ACTION',
      nodeId: 'n1',
      nodeLabel: 'Node',
      pathwayId: 'pw-test',
      pathwayName: 'Test',
      daysAtStage: 5,
      contextLine: '',
      isEscalated: false,
      riskTier: 'stable',
      patientStatus: 'active',
      isAssigned: false,
      isStale: false,
      responsibility: 'mine',
      ...overrides,
    };
  }

  it('counts items per responsibility category', () => {
    const items = [
      makeItem({ id: 'a', responsibility: 'mine' }),
      makeItem({ id: 'b', responsibility: 'mine' }),
      makeItem({ id: 'c', responsibility: 'team' }),
      makeItem({ id: 'd', responsibility: 'ai' }),
    ];
    const counts = computeResponsibilityCounts(items);
    expect(counts).toEqual({ mine: 2, team: 1, ai: 1 });
  });

  it('returns zeros for empty array', () => {
    const counts = computeResponsibilityCounts([]);
    expect(counts).toEqual({ mine: 0, team: 0, ai: 0 });
  });

  it('handles all-same responsibility', () => {
    const items = [
      makeItem({ id: 'a', responsibility: 'team' }),
      makeItem({ id: 'b', responsibility: 'team' }),
    ];
    const counts = computeResponsibilityCounts(items);
    expect(counts).toEqual({ mine: 0, team: 2, ai: 0 });
  });
});
