/**
 * Workflow Types & Static Data
 *
 * Defines types for the visit workflow (check-in / triage / checkout),
 * the checklist data structure, and scenario-level workflow state.
 *
 * Renamed from intake-only to full workflow scope.
 */

// ============================================================================
// Core Types
// ============================================================================

/** Top-level view context: charting vs. workflow. */
export type ViewContext = 'charting' | 'workflow';

/** Three-phase visit workflow. */
export type WorkflowPhase = 'check-in' | 'triage' | 'checkout';

/** Per-section completion state. */
export type SectionState = 'not_started' | 'in_progress' | 'complete' | 'skipped';

// ============================================================================
// Checklist Types (still used for section item data)
// ============================================================================

export interface ChecklistItem {
  id: string;
  label: string;
  children?: ChecklistItem[];
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

// ============================================================================
// Workflow Section (for accordion canvas)
// ============================================================================

export interface PlaceholderField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'grid' | 'upload' | 'textarea';
}

export interface WorkflowSectionDef {
  id: string;
  title: string;
  phase: WorkflowPhase;
  optional?: boolean;
}

// ============================================================================
// Phase Metadata
// ============================================================================

export interface WorkflowPhaseMeta {
  key: WorkflowPhase;
  label: string;
  sections: WorkflowSectionDef[];
}

export const WORKFLOW_PHASES: WorkflowPhaseMeta[] = [
  {
    key: 'check-in',
    label: 'Check-in',
    sections: [
      { id: 'billing-provider', title: 'Billing Provider', phase: 'check-in' },
      { id: 'supervisor', title: 'Supervisor', phase: 'check-in' },
      { id: 'patient-info', title: 'Patient Info', phase: 'check-in' },
      { id: 'patient-cards', title: 'Patient Cards', phase: 'check-in' },
      { id: 'specialty', title: 'Specialty', phase: 'check-in' },
      { id: 'responsible-party', title: 'Responsible Party', phase: 'check-in' },
      { id: 'credit-card', title: 'Credit Card on File', phase: 'check-in', optional: true },
      { id: 'consent-forms', title: 'Consent Forms', phase: 'check-in' },
      { id: 'payment-collection', title: 'Payment Collection', phase: 'check-in' },
    ],
  },
  {
    key: 'triage',
    label: 'Triage',
    sections: [
      { id: 'assign-room', title: 'Assign Room', phase: 'triage' },
      { id: 'vitals', title: 'Vitals', phase: 'triage' },
      { id: 'hpi', title: 'HPI', phase: 'triage' },
      { id: 'medical-history', title: 'Medical History', phase: 'triage' },
      { id: 'rx-renewals', title: 'Rx Renewals', phase: 'triage' },
    ],
  },
  {
    key: 'checkout',
    label: 'Checkout',
    sections: [
      { id: 'review-bill', title: 'Review Bill', phase: 'checkout' },
      { id: 'additional-charges', title: 'Additional Charges', phase: 'checkout' },
      { id: 'book-follow-up', title: 'Book Follow-Up', phase: 'checkout' },
    ],
  },
];

// ============================================================================
// Scenario-level Workflow State
// ============================================================================

export interface ScenarioWorkflowState {
  completedPhases: WorkflowPhase[];
  activeView: ViewContext;
  activePhase: WorkflowPhase | undefined;
  activeMode: 'capture' | 'process' | 'review';
}

// ============================================================================
// Legacy Checklist Data (still used for test assertions)
// ============================================================================

export const INTAKE_CHECKLIST: ChecklistSection[] = [
  {
    id: 'check-in',
    title: 'Check In',
    items: [
      { id: 'ci-patient-info', label: 'Patient info' },
      {
        id: 'ci-patient-cards',
        label: 'Patient cards',
        children: [
          { id: 'ci-cards-id', label: 'ID' },
          { id: 'ci-cards-insurance', label: 'Insurance' },
        ],
      },
      { id: 'ci-specialty', label: 'Specialty' },
      {
        id: 'ci-responsible-party',
        label: 'Responsible Party',
        children: [
          { id: 'ci-rp-insurance', label: 'Insurance (in + out of network)' },
          { id: 'ci-rp-workers-comp', label: "Worker's comp" },
          { id: 'ci-rp-org-school', label: 'Org/school' },
          { id: 'ci-rp-patient', label: 'Patient' },
        ],
      },
      { id: 'ci-consent', label: 'Consent forms' },
      { id: 'ci-payment', label: 'Payment methods, collect payments, patient balance' },
    ],
  },
  {
    id: 'triage',
    title: 'Triage',
    items: [
      { id: 'tr-room', label: 'Assign room' },
      { id: 'tr-hpi', label: 'HPI' },
      { id: 'tr-vitals', label: 'Vitals' },
      { id: 'tr-history', label: 'Medical history' },
      { id: 'tr-rx-renewals', label: 'Rx renewals' },
    ],
  },
];

// ============================================================================
// Utilities
// ============================================================================

/** Collect all leaf item IDs (items without children). */
export function getAllLeafIds(sections: ChecklistSection[]): string[] {
  const ids: string[] = [];

  function collectLeaves(items: ChecklistItem[]) {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        collectLeaves(item.children);
      } else {
        ids.push(item.id);
      }
    }
  }

  for (const section of sections) {
    collectLeaves(section.items);
  }

  return ids;
}
