/**
 * ScopeRouters
 *
 * Thin switch components that route AdaptiveLayout slots based on viewMode.
 * Each returns the appropriate scope-specific component for its slot.
 */

import React from 'react';
import { CohortContextPane, CohortIdentityHeader } from '../../components/population-health/CohortContextPane';
import type { Cohort } from '../../types/population-health';
import {
  EncounterWorkspace,
  EncounterCanvasHeader,
  EncounterOverviewHeader,
  EncounterCollapsedIdentity,
  EncounterOverview,
  EncounterAIBar,
} from '../EncounterWorkspace/EncounterWorkspace';
import type { ViewMode, ToDoViewState } from '../EncounterWorkspace/EncounterWorkspace';
import { CohortWorkspace, CohortCanvasHeader, CohortAIBar } from '../CohortWorkspace/CohortWorkspace';
import type { ToDoItem } from '../../scenarios/todoData';

// ============================================================================
// ScopeOverview
// ============================================================================

export const ScopeOverview: React.FC<{
  viewMode: ViewMode;
  selectedCohortId: string | null;
  selectedPatient: any;
  selectedPatientOverviewData: any;
}> = ({ viewMode, selectedCohortId, selectedPatient, selectedPatientOverviewData }) => {
  if (viewMode === 'cohort' && selectedCohortId) {
    return <CohortContextPane cohortId={selectedCohortId} hideHeader />;
  }
  if (viewMode === 'patient' && selectedPatient) {
    return (
      <EncounterOverview selectedPatient={selectedPatient} />
    );
  }
  return undefined as unknown as React.ReactElement;
};

ScopeOverview.displayName = 'ScopeOverview';

// ============================================================================
// ScopeOverviewHeader
// ============================================================================

export const ScopeOverviewHeader: React.FC<{
  viewMode: ViewMode;
  selectedCohort: Cohort | null;
  selectedPatient: any;
  selectedPatientOverviewData: any;
}> = ({ viewMode, selectedCohort, selectedPatient, selectedPatientOverviewData }) => {
  if (viewMode === 'cohort' && selectedCohort) {
    return (
      <CohortIdentityHeader
        name={selectedCohort.name}
        patientCount={selectedCohort.patientCount}
        category={selectedCohort.category}
        variant="stacked"
      />
    );
  }
  if (viewMode === 'patient' && selectedPatient) {
    return <EncounterOverviewHeader selectedPatient={selectedPatient} />;
  }
  return null;
};

ScopeOverviewHeader.displayName = 'ScopeOverviewHeader';

// ============================================================================
// ScopeCanvasHeader
// ============================================================================

export const ScopeCanvasHeader: React.FC<{
  viewMode: ViewMode;
  isViewingEncounterPatient: boolean;
}> = ({ viewMode, isViewingEncounterPatient }) => {
  if (viewMode === 'cohort') {
    return <CohortCanvasHeader />;
  }
  if (viewMode === 'patient' && isViewingEncounterPatient) {
    return <EncounterCanvasHeader />;
  }
  return null;
};

ScopeCanvasHeader.displayName = 'ScopeCanvasHeader';

// ============================================================================
// ScopeCanvasPane
// ============================================================================

export const ScopeCanvasPane: React.FC<{
  viewMode: ViewMode;
  selectedCohortId: string | null;
  todoViewState: ToDoViewState | null;
  selectedNavItem: string;
  todoSearchQuery: string;
  onSetViewMode: (mode: ViewMode) => void;
  onSetTodoViewState: (state: ToDoViewState | null) => void;
  onSetSelectedNavItem: (id: string) => void;
  onOpenPatientFromToDo: (item: ToDoItem) => void;
  onCanvasScrolledChange: (scrolled: boolean) => void;
}> = (props) => {
  if (props.viewMode === 'cohort' && props.selectedCohortId) {
    return <CohortWorkspace cohortId={props.selectedCohortId} />;
  }
  return (
    <EncounterWorkspace
      viewMode={props.viewMode}
      todoViewState={props.todoViewState}
      selectedNavItem={props.selectedNavItem}
      todoSearchQuery={props.todoSearchQuery}
      onSetViewMode={props.onSetViewMode}
      onSetTodoViewState={props.onSetTodoViewState}
      onSetSelectedNavItem={props.onSetSelectedNavItem}
      onOpenPatientFromToDo={props.onOpenPatientFromToDo}
      onCanvasScrolledChange={props.onCanvasScrolledChange}
    />
  );
};

ScopeCanvasPane.displayName = 'ScopeCanvasPane';

// ============================================================================
// ScopeCollapsedIdentity
// ============================================================================

export const ScopeCollapsedIdentity: React.FC<{
  viewMode: ViewMode;
  selectedCohort: Cohort | null;
  selectedPatient: any;
}> = ({ viewMode, selectedCohort, selectedPatient }) => {
  if (viewMode === 'cohort' && selectedCohort) {
    return (
      <CohortIdentityHeader
        name={selectedCohort.name}
        patientCount={selectedCohort.patientCount}
        category={selectedCohort.category}
        variant="stacked"
      />
    );
  }
  if (viewMode === 'patient' && selectedPatient) {
    return <EncounterCollapsedIdentity selectedPatient={selectedPatient} />;
  }
  return null;
};

ScopeCollapsedIdentity.displayName = 'ScopeCollapsedIdentity';

// ============================================================================
// ScopeAIBar
// ============================================================================

export const ScopeAIBar: React.FC<{
  viewMode: ViewMode;
}> = ({ viewMode }) => {
  if (viewMode === 'cohort') {
    return <CohortAIBar />;
  }
  return <EncounterAIBar />;
};

ScopeAIBar.displayName = 'ScopeAIBar';
