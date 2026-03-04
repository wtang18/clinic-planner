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
// Selection / View State
// ============================================================================

export type ActiveView = 'flow' | 'table';

export type DrawerView =
  | { type: 'node-detail'; nodeId: string }
  | { type: 'patient-preview'; patientId: string };

export interface PopHealthState {
  selectedCohortId: string | null;
  selectedPathwayIds: string[];
  selectedNodeId: string | null;
  selectedPatientId: string | null;
  activeView: ActiveView;
  filters: PopHealthFilter[];
  drawerStack: DrawerView[];
  focusedColumnIndex: number | null;
  lifecycleFilter: NodeLifecycleState[];
  searchQuery: string;
}
