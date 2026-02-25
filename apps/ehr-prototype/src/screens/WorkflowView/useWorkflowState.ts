/**
 * useWorkflowState Hook
 *
 * Manages the full visit workflow state: active phase, section expansion,
 * section completion, phase completion, and progress tracking.
 *
 * Pure local state — no persistence or backend wiring.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { WorkflowPhase, SectionState } from '../IntakeView/intakeChecklist';
import { WORKFLOW_PHASES } from '../IntakeView/intakeChecklist';

// ============================================================================
// Types
// ============================================================================

export interface PhaseProgress {
  done: number;
  total: number;
}

export interface UseWorkflowStateResult {
  /** Currently active workflow phase */
  activePhase: WorkflowPhase;
  /** Set the active phase directly */
  setActivePhase: (phase: WorkflowPhase) => void;
  /** Per-section completion state */
  sectionStates: Record<string, SectionState>;
  /** Phases that are fully complete */
  completedPhases: Set<WorkflowPhase>;
  /** Currently expanded section ID (null = all collapsed) */
  expandedSectionId: string | null;
  /** Toggle a section open/closed */
  toggleSection: (sectionId: string) => void;
  /** Mark a section as complete; auto-expands next section */
  completeSection: (sectionId: string) => void;
  /** Mark an optional section as skipped */
  skipSection: (sectionId: string) => void;
  /** Complete an entire phase: mark all sections complete, advance to next */
  completePhase: (phase: WorkflowPhase) => void;
  /** Get progress (done/total) for a phase */
  phaseProgress: (phase: WorkflowPhase) => PhaseProgress;
  /** Initialize from scenario defaults */
  initFromScenario: (completed: WorkflowPhase[], phase?: WorkflowPhase) => void;
}

// ============================================================================
// Helpers
// ============================================================================

const PHASE_ORDER: WorkflowPhase[] = ['check-in', 'triage', 'checkout'];

function nextPhase(phase: WorkflowPhase): WorkflowPhase | undefined {
  const idx = PHASE_ORDER.indexOf(phase);
  return idx >= 0 && idx < PHASE_ORDER.length - 1 ? PHASE_ORDER[idx + 1] : undefined;
}

function getSectionsForPhase(phase: WorkflowPhase) {
  return WORKFLOW_PHASES.find((p) => p.key === phase)?.sections ?? [];
}

// ============================================================================
// Hook
// ============================================================================

export function useWorkflowState(): UseWorkflowStateResult {
  const [activePhase, setActivePhaseRaw] = useState<WorkflowPhase>('check-in');
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>({});
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  // Auto-expand the first incomplete section for a given phase.
  // Called on phase transitions (setActivePhase, completePhase, initFromScenario).
  const autoExpandFirstIncomplete = useCallback(
    (phase: WorkflowPhase, states: Record<string, SectionState>) => {
      const sections = getSectionsForPhase(phase);
      // Don't auto-expand if all sections are already done
      const allDone = sections.every((s) => {
        const st = states[s.id];
        return st === 'complete' || st === 'skipped';
      });
      if (allDone) {
        setExpandedSectionId(null);
        return;
      }
      const first = sections.find((s) => {
        const st = states[s.id];
        return st !== 'complete' && st !== 'skipped';
      });
      if (first) {
        setExpandedSectionId(first.id);
        setSectionStates((prev) => {
          const current = prev[first.id];
          if (current === 'complete' || current === 'skipped') return prev;
          return { ...prev, [first.id]: 'in_progress' };
        });
      }
    },
    [],
  );

  // Derived: completed phases
  const completedPhases = useMemo(() => {
    const result = new Set<WorkflowPhase>();
    for (const phaseMeta of WORKFLOW_PHASES) {
      const sections = phaseMeta.sections;
      if (sections.length === 0) continue;
      const allDone = sections.every((s) => {
        const state = sectionStates[s.id];
        return state === 'complete' || state === 'skipped';
      });
      if (allDone) result.add(phaseMeta.key);
    }
    return result;
  }, [sectionStates]);

  // Public setActivePhase: change phase + auto-expand first incomplete section
  const setActivePhase = useCallback(
    (phase: WorkflowPhase) => {
      setActivePhaseRaw(phase);
      // Read latest sectionStates via updater to avoid stale closure
      setSectionStates((currentStates) => {
        autoExpandFirstIncomplete(phase, currentStates);
        return currentStates; // no mutation, just reading
      });
    },
    [autoExpandFirstIncomplete],
  );

  // Auto-expand on initial mount for the default phase
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    autoExpandFirstIncomplete(activePhase, sectionStates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSectionId((prev) => {
      if (prev === sectionId) return null; // collapse
      return sectionId; // expand
    });
    // Mark in_progress when expanding (if not already complete/skipped)
    setSectionStates((prev) => {
      const current = prev[sectionId];
      if (current === 'complete' || current === 'skipped') return prev;
      return { ...prev, [sectionId]: 'in_progress' };
    });
  }, []);

  const completeSection = useCallback((sectionId: string) => {
    setSectionStates((prev) => ({ ...prev, [sectionId]: 'complete' }));

    // Auto-expand next uncompleted section in the same phase
    // Find which phase this section belongs to
    for (const phaseMeta of WORKFLOW_PHASES) {
      const sectionIds = phaseMeta.sections.map((s) => s.id);
      const idx = sectionIds.indexOf(sectionId);
      if (idx < 0) continue;

      // Find next section that's not complete/skipped
      for (let i = idx + 1; i < sectionIds.length; i++) {
        setSectionStates((prev) => {
          const nextState = prev[sectionIds[i]];
          if (nextState !== 'complete' && nextState !== 'skipped') {
            setExpandedSectionId(sectionIds[i]);
            return { ...prev, [sectionIds[i]]: 'in_progress' };
          }
          return prev;
        });
        // Check if next section is already done
        setSectionStates((prev) => {
          if (prev[sectionIds[i]] !== 'complete' && prev[sectionIds[i]] !== 'skipped') {
            return prev; // already set expandedSectionId above
          }
          return prev;
        });
        break;
      }
      break;
    }
  }, []);

  const skipSection = useCallback((sectionId: string) => {
    setSectionStates((prev) => ({ ...prev, [sectionId]: 'skipped' }));
    // Collapse it
    setExpandedSectionId((prev) => (prev === sectionId ? null : prev));
  }, []);

  const completePhase = useCallback((phase: WorkflowPhase) => {
    const sections = getSectionsForPhase(phase);
    const newStates: Record<string, SectionState> = {};

    setSectionStates((prev) => {
      const next = { ...prev };
      for (const section of sections) {
        if (next[section.id] !== 'complete' && next[section.id] !== 'skipped') {
          next[section.id] = 'complete';
        }
      }
      Object.assign(newStates, next);
      return next;
    });

    // Auto-advance to next phase + auto-expand its first section
    const nextP = nextPhase(phase);
    if (nextP) {
      setActivePhaseRaw(nextP);
      autoExpandFirstIncomplete(nextP, newStates);
    } else {
      setExpandedSectionId(null);
    }
  }, [autoExpandFirstIncomplete]);

  const phaseProgress = useCallback(
    (phase: WorkflowPhase): PhaseProgress => {
      const sections = getSectionsForPhase(phase);
      const total = sections.length;
      const done = sections.filter((s) => {
        const state = sectionStates[s.id];
        return state === 'complete' || state === 'skipped';
      }).length;
      return { done, total };
    },
    [sectionStates],
  );

  const initFromScenario = useCallback(
    (completed: WorkflowPhase[], phase?: WorkflowPhase) => {
      const newStates: Record<string, SectionState> = {};
      for (const p of completed) {
        const sections = getSectionsForPhase(p);
        for (const s of sections) {
          newStates[s.id] = 'complete';
        }
      }
      setSectionStates(newStates);

      // Determine target phase
      let targetPhase: WorkflowPhase | undefined = phase;
      if (!targetPhase && completed.length > 0) {
        targetPhase = nextPhase(completed[completed.length - 1]);
      }

      if (targetPhase) {
        setActivePhaseRaw(targetPhase);
        autoExpandFirstIncomplete(targetPhase, newStates);
      } else {
        setExpandedSectionId(null);
      }
    },
    [autoExpandFirstIncomplete],
  );

  return {
    activePhase,
    setActivePhase,
    sectionStates,
    completedPhases,
    expandedSectionId,
    toggleSection,
    completeSection,
    skipSection,
    completePhase,
    phaseProgress,
    initFromScenario,
  };
}
