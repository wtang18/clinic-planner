/**
 * Population Health Types
 *
 * Data model for the population health workspace: cohort management,
 * pathway visualization, patient tracking, and dashboard metrics.
 *
 * Terminology: "Pathway" = population health flows (multi-patient journeys).
 * "Protocol" = encounter-level care guidelines (see chart-items.ts).
 */

// ============================================================================
// Cohort Definitions
// ============================================================================

export type CohortCategory =
  | 'chronic-disease'
  | 'preventive-care'
  | 'risk-tiers'
  | 'care-transitions'
  | 'custom'
  | 'overview';

export interface Cohort {
  id: string;
  name: string;
  category: CohortCategory;
  parentGroupId?: string;
  criteria: CohortCriteria[];
  patientIds: string[];
  patientCount: number;
}

export interface CohortCriteria {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'in' | 'between';
  value: unknown;
  label: string;
}

export interface CohortGroup {
  id: string;
  label: string;
  category: CohortCategory;
  cohortIds: string[];
}

// ============================================================================
// Pathway Definitions
// ============================================================================

export type PathwayStatus = 'active' | 'paused' | 'draft' | 'archived';

export type NodeType =
  | 'cohort-source'
  | 'filter'
  | 'branch'
  | 'action'
  | 'wait-monitor'
  | 'escalation'
  | 'metric'
  | 'loop-reference';

/** Node lifecycle state — 7 states, prototype renders Active + Paused + Draft */
export type NodeLifecycleState =
  | 'active'
  | 'paused'
  | 'draft'
  | 'needs-review'
  | 'test'
  | 'archived'
  | 'error';

/** Node ownership (future — typed now, not rendered in v1) */
export interface NodeOwnership {
  ownerId: string;
  ownerType: 'provider' | 'ai-agent' | 'integration';
}

/** Flow state for a pathway node — static mock data, structured for future real-time engine */
export interface NodeFlowState {
  inbound: {
    natural: number;
    error: number;
  };
  atStage: {
    inProgress: number;
    waiting: number;
    error: number;
  };
  outbound: {
    completed: number;
    byPath?: Record<string, number>;
  };
  throughput?: {
    avgDaysInStage: number;
    patientsPerDay?: number;
  };
}

export interface Pathway {
  id: string;
  name: string;
  cohortId: string;
  status: PathwayStatus;
  nodes: PathwayNode[];
  connections: PathwayConnection[];
  description?: string;
}

export interface PathwayNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  icon?: string;
  columnIndex: number;
  verticalPosition: number;
  pills: NodePill[];
  config: Record<string, unknown>;
  patientCount?: number;
  gapCount?: number;
  disabled?: boolean;
  lifecycleState: NodeLifecycleState;
  ownership?: NodeOwnership;
  flowState?: NodeFlowState;
  /** Provider ID assigned to manage this node's stage */
  assignedProviderId?: string;
}

// ============================================================================
// Assignment & Escalation Markers
// ============================================================================

/** Assignment of a care flow node to a provider */
export interface NodeAssignment {
  nodeId: string;
  careFlowId: string;
  assignedProviderId: string;
  assignmentType: 'primary' | 'backup';
}

/** Escalation flag targeting a provider for attention on a node they may not own */
export interface EscalationFlag {
  nodeId: string;
  careFlowId: string;
  targetProviderId: string;
  sourceItemIds: string[];
  reason: string;
  createdAt: Date;
}

export interface NodePill {
  label: string;
  variant?: 'default' | 'info' | 'warning';
}

export interface PathwayConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  patientCount?: number;
}

// ============================================================================
// Patient in Pathway Context
// ============================================================================

export type PathwayPatientStatus = 'active' | 'escalated' | 'stalled' | 'completed';

export interface PathwayPatient {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  riskTier: 'high' | 'rising' | 'stable';
  pathways: PatientPathwayAssignment[];
  clinicalData: Record<string, unknown>;
}

export interface PatientPathwayAssignment {
  pathwayId: string;
  currentNodeId: string;
  stageEntryDate: Date;
  status: PathwayPatientStatus;
  history: PatientPathwayEvent[];
}

export interface PatientPathwayEvent {
  nodeId: string;
  action: string;
  date: Date;
  result?: string;
}

// ============================================================================
// Recent Patients
// ============================================================================

export interface RecentPatient {
  patientId: string;
  name: string;
  lastSeen: Date;
  reason: string;
  riskTier: 'high' | 'rising' | 'stable';
}

// ============================================================================
// Filters
// ============================================================================

export type FilterCategory = 'status' | 'lifecycle-state' | 'patient-attribute' | 'pathway-specific';

export interface PopHealthFilter {
  id: string;
  category: FilterCategory;
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'in' | 'between';
  value: unknown;
  label: string;
}

// ============================================================================
// Dashboard
// ============================================================================

export interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

export interface DashboardAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  pathwayId?: string;
  nodeId?: string;
}

// ============================================================================
// All-Patients Sankey Types
// ============================================================================

/** 5-tier risk assessment for panel-level view */
export type RiskTier = 'critical' | 'high' | 'moderate' | 'low' | 'unassessed';

/** Action status across a patient's care programs */
export type ActionStatus = 'urgent' | 'action-needed' | 'monitoring' | 'all-current' | 'not-enrolled';

export interface ConditionAssignment {
  patientId: string;
  conditionCohortId: string;
  diagnosisDate?: Date;
  currentNodeLabel?: string;
}

export interface PreventiveAssignment {
  patientId: string;
  preventiveCohortId: string;
  eligibilityBasis: string;
  lastScreeningDate?: Date;
  nextDueDate?: Date;
  currentNodeLabel?: string;
}

/** A patient in the all-patients panel view with enriched assignments */
export interface AllPatientsPatient {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  riskTier: RiskTier;
  actionStatus: ActionStatus;
  conditionAssignments: ConditionAssignment[];
  preventiveAssignments: PreventiveAssignment[];
  clinicalData: Record<string, unknown>;
  daysWaiting?: number;
}

/** Condition or preventive cohort definition for Sankey axis */
export interface SankeyCohortDef {
  id: string;
  label: string;
  zone: 'conditions' | 'preventive';
  /** Abbreviated label for compact display (e.g. "HTN" for "Hypertension") */
  shortLabel?: string;
}

/** A single band (row) on a Sankey axis */
export interface SankeyBand {
  id: string;
  label: string;
  count: number;
  zone?: 'conditions' | 'preventive';
  attention?: boolean;
  /** Abbreviated label for compact display */
  shortLabel?: string;
}

/** A group of bands on one side of the Sankey (grouped by zone) */
export interface SankeyAxisGroup {
  zone: 'conditions' | 'preventive';
  bands: SankeyBand[];
}

/** A flow between two bands (rendered as a filled ribbon) */
export interface SankeyFlow {
  sourceId: string;
  targetId: string;
  patientCount: number;
  patientIds: string[];
  attention?: boolean;
}

/** Complete Sankey data model */
export interface SankeyData {
  leftAxis: SankeyAxisGroup[];
  centerAxis: SankeyBand[];
  rightAxis: SankeyBand[];
  leftToCenterFlows: SankeyFlow[];
  centerToRightFlows: SankeyFlow[];
  totalPatients: number;
  totalEnrollments: number;
}

/** Dimension selection state for filtering */
export interface DimensionSelection {
  conditions: string[];
  preventive: string[];
  riskTiers: RiskTier[];
  actionStatuses: ActionStatus[];
}

/** Which axes are visible in the Sankey */
export interface AxisVisibility {
  conditions: boolean;
  preventive: boolean;
  riskLevel: boolean;
  actionStatus: boolean;
}

/** All-patients canvas view mode */
export type AllPatientsView = 'map' | 'table';

/** Selection stats for the context pane */
export interface SelectionStats {
  totalPatients: number;
  needsAttention: number;
  notEnrolled: number;
  enrollmentRate: string;
  contextLabel: string;
}

// ============================================================================
// Selection / View State
// ============================================================================

export type ActiveView = 'priorities' | 'flow' | 'table';

// ============================================================================
// Priority View Types
// ============================================================================

export type PriorityBadge = 'URGENT' | 'REVIEW' | 'ACTION' | 'MONITOR';

export type PrioritySortMode = 'urgency' | 'by-node' | 'by-date';

export type Responsibility = 'mine' | 'team' | 'ai';

export interface PriorityItem {
  /** Composite key: `${patientId}::${nodeId}` */
  id: string;
  patientName: string;
  patientId: string;
  badge: PriorityBadge;
  nodeId: string;
  nodeLabel: string;
  pathwayId: string;
  pathwayName: string;
  daysAtStage: number;
  contextLine: string;
  isEscalated: boolean;
  escalationReason?: string;
  riskTier: 'high' | 'rising' | 'stable';
  patientStatus: PathwayPatientStatus;
  isAssigned: boolean;
  isStale: boolean;
  /** AI reasoning for REVIEW items — mock text explaining why this needs human review */
  aiReasoning?: string;
  /** Who is responsible for acting on this item */
  responsibility: Responsibility;
}

export type DrawerView =
  | { type: 'node-detail'; nodeId: string }
  | { type: 'patient-preview'; patientId: string }
  | { type: 'priority-detail'; priorityItemId: string }
  | { type: 'filter' }
  | { type: 'dimension-detail'; dimensionId: string; axis: string };

export interface PopHealthState {
  selectedCohortId: string | null;
  selectedPathwayIds: string[];
  selectedNodeIds: string[];
  selectedPatientId: string | null;
  activeView: ActiveView;
  filters: PopHealthFilter[];
  drawerStack: DrawerView[];
  focusedColumnIndex: number | null;
  lifecycleFilter: NodeLifecycleState[];
  searchQuery: string;
  // All-patients state
  dimensionSelection: DimensionSelection;
  axisVisibility: AxisVisibility;
  allPatientsView: AllPatientsView;
  hoveredBandId: string | null;
  // Sankey navigator: which band is drilled into
  sankeyNavigatorBandId: string | null;
  // Layer tree "Show Mine" preset
  showMineActive: boolean;
  // Snapshot of All-Patients dimension/axis state for scope-change persistence
  allPatientsSnapshot: {
    dimensionSelection: DimensionSelection;
    axisVisibility: AxisVisibility;
  } | null;
}
