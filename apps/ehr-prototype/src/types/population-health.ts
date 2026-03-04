/**
 * Population Health Types
 *
 * Data model for the population health workspace: cohort management,
 * protocol visualization, patient tracking, and dashboard metrics.
 */

// ============================================================================
// Cohort Definitions
// ============================================================================

export type CohortCategory =
  | 'chronic-disease'
  | 'preventive-care'
  | 'risk-tiers'
  | 'care-transitions'
  | 'custom';

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
// Protocol Definitions
// ============================================================================

export type ProtocolStatus = 'active' | 'paused' | 'completed';

export type NodeType =
  | 'cohort-source'
  | 'filter'
  | 'branch'
  | 'action'
  | 'wait-monitor'
  | 'escalation'
  | 'metric'
  | 'loop-reference';

export interface Protocol {
  id: string;
  name: string;
  cohortId: string;
  status: ProtocolStatus;
  nodes: ProtocolNode[];
  connections: ProtocolConnection[];
  description?: string;
}

export interface ProtocolNode {
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
}

export interface NodePill {
  label: string;
  variant?: 'default' | 'info' | 'warning';
}

export interface ProtocolConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  patientCount?: number;
}

// ============================================================================
// Patient in Protocol Context
// ============================================================================

export type ProtocolPatientStatus = 'active' | 'escalated' | 'stalled' | 'completed';

export interface ProtocolPatient {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  riskTier: 'high' | 'rising' | 'stable';
  protocols: PatientProtocolAssignment[];
  clinicalData: Record<string, unknown>;
}

export interface PatientProtocolAssignment {
  protocolId: string;
  currentNodeId: string;
  stageEntryDate: Date;
  status: ProtocolPatientStatus;
  history: PatientProtocolEvent[];
}

export interface PatientProtocolEvent {
  nodeId: string;
  action: string;
  date: Date;
  result?: string;
}

// ============================================================================
// Filters
// ============================================================================

export type FilterCategory = 'status' | 'patient-attribute' | 'protocol-specific';

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
  protocolId?: string;
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
  selectedProtocolIds: string[];
  selectedNodeId: string | null;
  selectedPatientId: string | null;
  activeView: ActiveView;
  filters: PopHealthFilter[];
  drawerStack: DrawerView[];
  focusedColumnIndex: number | null;
}
