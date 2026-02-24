/**
 * Workflow State Tests
 *
 * Tests for:
 * - Legacy checklist data utilities (getAllLeafIds, INTAKE_CHECKLIST)
 * - Workflow types and constants (WORKFLOW_PHASES)
 * - useWorkflowState hook logic (via direct import — pure state, no React)
 * - Scenario defaults
 */

import { describe, it, expect } from 'vitest';
import {
  INTAKE_CHECKLIST,
  getAllLeafIds,
  WORKFLOW_PHASES,
} from '../../screens/IntakeView/intakeChecklist';
import type {
  WorkflowPhase,
  SectionState,
  ViewContext,
} from '../../screens/IntakeView/intakeChecklist';
import {
  SCENARIO_WORKFLOW_DEFAULTS,
  getScenarioWorkflowDefaults,
} from '../../screens/WorkflowView/workflowScenarios';

// ============================================================================
// getAllLeafIds (legacy)
// ============================================================================

describe('getAllLeafIds', () => {
  it('returns correct leaf count (excludes parent items with children)', () => {
    const ids = getAllLeafIds(INTAKE_CHECKLIST);
    expect(ids).toHaveLength(15);
  });

  it('does not include parent item IDs', () => {
    const ids = getAllLeafIds(INTAKE_CHECKLIST);
    expect(ids).not.toContain('ci-patient-cards');
    expect(ids).not.toContain('ci-responsible-party');
  });

  it('includes all child item IDs', () => {
    const ids = getAllLeafIds(INTAKE_CHECKLIST);
    expect(ids).toContain('ci-cards-id');
    expect(ids).toContain('ci-cards-insurance');
    expect(ids).toContain('ci-rp-insurance');
    expect(ids).toContain('ci-rp-workers-comp');
    expect(ids).toContain('ci-rp-org-school');
    expect(ids).toContain('ci-rp-patient');
  });

  it('includes standalone leaf items', () => {
    const ids = getAllLeafIds(INTAKE_CHECKLIST);
    expect(ids).toContain('ci-patient-info');
    expect(ids).toContain('ci-specialty');
    expect(ids).toContain('ci-consent');
    expect(ids).toContain('ci-payment');
    expect(ids).toContain('tr-room');
    expect(ids).toContain('tr-hpi');
    expect(ids).toContain('tr-vitals');
    expect(ids).toContain('tr-history');
    expect(ids).toContain('tr-rx-renewals');
  });

  it('returns empty array for empty sections', () => {
    const ids = getAllLeafIds([]);
    expect(ids).toEqual([]);
  });

  it('handles sections with no children items', () => {
    const ids = getAllLeafIds([
      { id: 'test', title: 'Test', items: [{ id: 'a', label: 'A' }] },
    ]);
    expect(ids).toEqual(['a']);
  });
});

// ============================================================================
// INTAKE_CHECKLIST structure
// ============================================================================

describe('INTAKE_CHECKLIST', () => {
  it('has exactly 2 sections', () => {
    expect(INTAKE_CHECKLIST).toHaveLength(2);
  });

  it('first section is Check In', () => {
    expect(INTAKE_CHECKLIST[0].id).toBe('check-in');
    expect(INTAKE_CHECKLIST[0].title).toBe('Check In');
  });

  it('second section is Triage', () => {
    expect(INTAKE_CHECKLIST[1].id).toBe('triage');
    expect(INTAKE_CHECKLIST[1].title).toBe('Triage');
  });

  it('all item IDs are unique', () => {
    const allIds: string[] = [];
    for (const section of INTAKE_CHECKLIST) {
      for (const item of section.items) {
        allIds.push(item.id);
        if (item.children) {
          for (const child of item.children) {
            allIds.push(child.id);
          }
        }
      }
    }
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});

// ============================================================================
// WORKFLOW_PHASES structure
// ============================================================================

describe('WORKFLOW_PHASES', () => {
  it('has 3 phases: check-in, triage, checkout', () => {
    expect(WORKFLOW_PHASES).toHaveLength(3);
    expect(WORKFLOW_PHASES.map((p) => p.key)).toEqual(['check-in', 'triage', 'checkout']);
  });

  it('check-in has 9 sections', () => {
    const checkIn = WORKFLOW_PHASES.find((p) => p.key === 'check-in');
    expect(checkIn?.sections).toHaveLength(9);
  });

  it('triage has 5 sections', () => {
    const triage = WORKFLOW_PHASES.find((p) => p.key === 'triage');
    expect(triage?.sections).toHaveLength(5);
  });

  it('checkout has 3 sections', () => {
    const checkout = WORKFLOW_PHASES.find((p) => p.key === 'checkout');
    expect(checkout?.sections).toHaveLength(3);
  });

  it('all section IDs are unique across all phases', () => {
    const allIds = WORKFLOW_PHASES.flatMap((p) => p.sections.map((s) => s.id));
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('each section references its parent phase', () => {
    for (const phase of WORKFLOW_PHASES) {
      for (const section of phase.sections) {
        expect(section.phase).toBe(phase.key);
      }
    }
  });

  it('credit-card section is marked optional', () => {
    const checkIn = WORKFLOW_PHASES.find((p) => p.key === 'check-in');
    const creditCard = checkIn?.sections.find((s) => s.id === 'credit-card');
    expect(creditCard?.optional).toBe(true);
  });
});

// ============================================================================
// ViewContext type (compile-time assertion)
// ============================================================================

describe('ViewContext type', () => {
  it('accepts charting and workflow values', () => {
    const ctx1: ViewContext = 'charting';
    const ctx2: ViewContext = 'workflow';
    expect(ctx1).toBe('charting');
    expect(ctx2).toBe('workflow');
  });
});

// ============================================================================
// Scenario Workflow Defaults
// ============================================================================

describe('SCENARIO_WORKFLOW_DEFAULTS', () => {
  it('has defaults for uc-cough', () => {
    const d = SCENARIO_WORKFLOW_DEFAULTS['uc-cough'];
    expect(d).toBeDefined();
    expect(d.completedPhases).toEqual(['check-in']);
    expect(d.activeView).toBe('charting');
    expect(d.activePhase).toBe('triage');
  });

  it('has defaults for pc-diabetes', () => {
    const d = SCENARIO_WORKFLOW_DEFAULTS['pc-diabetes'];
    expect(d).toBeDefined();
    expect(d.completedPhases).toEqual(['check-in', 'triage']);
    expect(d.activeView).toBe('charting');
  });

  it('has defaults for awv', () => {
    const d = SCENARIO_WORKFLOW_DEFAULTS['awv'];
    expect(d).toBeDefined();
    expect(d.completedPhases).toEqual([]);
    expect(d.activeView).toBe('workflow');
    expect(d.activePhase).toBe('check-in');
  });
});

describe('getScenarioWorkflowDefaults', () => {
  it('returns known scenario defaults', () => {
    const d = getScenarioWorkflowDefaults('uc-cough');
    expect(d.completedPhases).toEqual(['check-in']);
  });

  it('returns fallback for unknown scenario', () => {
    const d = getScenarioWorkflowDefaults('unknown-scenario');
    expect(d.activeView).toBe('charting');
    expect(d.completedPhases).toEqual([]);
  });

  it('returns fallback for undefined', () => {
    const d = getScenarioWorkflowDefaults(undefined);
    expect(d.activeView).toBe('charting');
    expect(d.completedPhases).toEqual([]);
  });
});
