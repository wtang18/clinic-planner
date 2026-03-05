/**
 * AppShell
 *
 * Thin layout shell that owns AdaptiveLayout and delegates canvas/overview/header
 * rendering to scope-specific routers. Reads encounter state from EncounterContext
 * for menu badges, workspace tabs, and transcription drawer.
 *
 * Shell state: viewMode, selectedNavItem, selectedCohortId, todoViewState, todoSearchQuery.
 * Encounter state: from useEncounterContext().
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useEncounterContext } from '../EncounterWorkspace/EncounterProvider';
import { getPatientByMrn } from '../../scenarios/patientData';
import { getCohortById } from '../../data/mock-population-health';
import {
  getCategoryById,
  getItemsByCategory,
  type ToDoItem,
} from '../../scenarios/todoData';

import { AdaptiveLayout } from '../../components/layout/AdaptiveLayout';
import { LeftPaneContainer, ViewIconsRow, AIDrawerFooter } from '../../components/LeftPane';
import { WORKFLOW_PHASES } from '../IntakeView/intakeChecklist';
import type { VisitSubItemConfig } from '../../components/layout/PatientWorkspaceItem';

import { PopHealthProvider } from '../../context/PopHealthContext';
import { colors } from '../../styles/foundations';
import { captureViewAnimations } from '../CaptureView/CaptureView.styles';

import type { ViewMode, ToDoViewState } from '../EncounterWorkspace/EncounterWorkspace';
import {
  EncounterWorkspace,
  EncounterCanvasHeader,
  EncounterOverviewHeader,
  EncounterCollapsedIdentity,
  EncounterScrolledContent,
  EncounterOverview,
  EncounterAIBar,
} from '../EncounterWorkspace/EncounterWorkspace';
import {
  ScopeOverview,
  ScopeOverviewHeader,
  ScopeCanvasHeader,
  ScopeCanvasPane,
  ScopeCollapsedIdentity,
  ScopeAIBar,
} from './ScopeRouters';

// ============================================================================
// Helpers
// ============================================================================

const formatDate = (date: Date | undefined) => {
  if (!date) return 'Unknown';
  return date instanceof Date ? date.toLocaleDateString() : String(date);
};

// ============================================================================
// Component
// ============================================================================

export const AppShell: React.FC = () => {
  const ctx = useEncounterContext();
  const {
    state, items, captureView, workspace, todoNav, handleTabClick,
    workflowState, transcriptionStatus, aiActions, aiConversation,
    activeSuggestions, openCareGaps,
    mergedSuggestions, handleMergedAccept, handleMergedDismiss, handleMergedAcceptWithChanges,
    paneState, barState, barActions, actions, activeSession,
    drawerSegments, startRecording, pauseRecording, resumeRecording, stopRecording, recordingDuration,
  } = ctx;

  const patient = state.context.patient;
  const encounter = state.context.encounter;

  // ---- Shell state ----
  const [viewMode, setViewMode] = useState<ViewMode>('patient');
  const [todoViewState, setTodoViewState] = useState<ToDoViewState | null>(null);
  const [selectedNavItem, setSelectedNavItem] = useState<string>('');
  const [todoSearchQuery, setTodoSearchQuery] = useState<string>('');
  const [canvasScrolled, setCanvasScrolled] = useState(false);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

  // Derive the effective cohort ID for data lookups (strip :overview and special IDs)
  const effectiveCohortId = useMemo(() => {
    if (!selectedCohortId) return null;
    if (selectedCohortId.endsWith(':overview')) return null;
    if (selectedCohortId === 'all-patients') return null;
    return selectedCohortId;
  }, [selectedCohortId]);

  // Derived cohort data (only for actual cohorts, not overview)
  const selectedCohort = useMemo(
    () => effectiveCohortId ? getCohortById(effectiveCohortId) ?? null : null,
    [effectiveCohortId]
  );

  // ---- AI context effects ----
  useEffect(() => {
    if (viewMode === 'patient') {
      aiActions.setContext('encounter');
    } else if (viewMode === 'todo-list') {
      aiActions.setContext('toDoList');
    } else if (viewMode === 'cohort') {
      aiActions.setContext('encounter'); // fallback — cohort AI context is future work
    } else {
      aiActions.setContext('todoReview');
    }
  }, [viewMode, aiActions]);

  useEffect(() => {
    aiActions.setSuggestionCount(activeSuggestions.length);
  }, [activeSuggestions.length, aiActions]);

  useEffect(() => {
    aiActions.setCareGapCount(openCareGaps.length);
  }, [openCareGaps.length, aiActions]);

  useEffect(() => {
    if (todoNav.shouldShowContextBar && todoNav.state) {
      const items = getItemsByCategory(todoNav.state.categoryId);
      const filteredItems = items.filter(
        item => item.filterId === todoNav.state!.filterId || todoNav.state!.filterId.startsWith('all')
      );
      aiActions.setToDoNavigation({
        filterLabel: todoNav.sourceFilterLabel || '',
        currentIndex: todoNav.state.currentIndex,
        totalCount: filteredItems.length,
        items: filteredItems.map(item => ({ id: item.id, title: item.title })),
      });
    } else {
      aiActions.setToDoNavigation(undefined);
    }
  }, [todoNav.shouldShowContextBar, todoNav.state, todoNav.sourceFilterLabel, aiActions]);

  // ---- Menu handlers ----
  const handleToDoFilterSelect = (categoryId: string, filterId: string) => {
    setViewMode('todo-list');
    setTodoViewState({ categoryId, filterId });
    setSelectedNavItem('todo');
    setSelectedCohortId(null);
    todoNav.clearNavigation();
  };

  const handleNavItemSelect = (id: string) => {
    setSelectedNavItem(id);
    if (id === 'home' || id === 'visits' || id === 'agent') {
      setViewMode(id === 'visits' ? 'visits' : id === 'home' ? 'home' : 'home');
      setTodoViewState(null);
      setSelectedCohortId(null);
      todoNav.clearNavigation();
    }
  };

  const handleCohortSelect = (cohortId: string) => {
    if (cohortId === 'recent') {
      setSelectedNavItem('recent-patients');
      setViewMode('patient');
      setSelectedCohortId(null);
      setTodoViewState(null);
      todoNav.clearNavigation();
      return;
    }
    setViewMode('cohort');
    setSelectedCohortId(cohortId);
    setSelectedNavItem('cohort');
    setTodoViewState(null);
    todoNav.clearNavigation();
  };

  const handlePatientSelect = useCallback((workspaceId: string) => {
    const existingWorkspace = workspace.getWorkspace(workspaceId);
    if (!existingWorkspace) {
      const currentPatient = state.context.patient;
      const patientName = currentPatient && currentPatient.mrn === workspaceId
        ? `${currentPatient.demographics.firstName} ${currentPatient.demographics.lastName}`
        : 'Unknown Patient';
      workspace.openWorkspace(workspaceId, 'patient', patientName);
    }
    setViewMode('patient');
    setTodoViewState(null);
    setSelectedCohortId(null);
    setSelectedNavItem(`patient-${workspaceId}`);
  }, [workspace, state.context.patient]);

  const handleTabClose = useCallback((patientId: string, tabId: string) => {
    workspace.closeTab(patientId, tabId);
  }, [workspace]);

  const handleOpenPatientFromToDo = useCallback((item: ToDoItem) => {
    const workspaceId = item.patient.mrn;
    workspace.openWorkspace(workspaceId, 'patient', item.patient.name);
    if (todoViewState) {
      todoNav.navigateToItem(item, todoViewState.categoryId, todoViewState.filterId);
    }
    setViewMode('patient');
    setTodoViewState(null);
    setSelectedNavItem(`patient-${workspaceId}`);
  }, [workspace, todoViewState, todoNav]);

  const handleWorkspaceClose = useCallback((workspaceId: string) => {
    workspace.closeWorkspace(workspaceId);
    if (selectedNavItem === `patient-${workspaceId}`) {
      if (patient) {
        setSelectedNavItem(`patient-${patient.mrn}`);
      } else {
        setSelectedNavItem('');
      }
    }
  }, [workspace, selectedNavItem, patient]);

  const handleNavBack = () => {
    if (viewMode === 'todo-detail') {
      if (todoViewState) {
        setViewMode('todo-list');
        setTodoViewState({ ...todoViewState, selectedItem: undefined });
      }
    } else if (viewMode === 'todo-list') {
      setViewMode('patient');
      setTodoViewState(null);
      setTodoSearchQuery('');
    } else if (viewMode === 'cohort') {
      setViewMode('patient');
      setSelectedCohortId(null);
    }
  };

  const handleTabClickShell = useCallback((patientId: string, tabId: string) => {
    handleTabClick(patientId, tabId);
    setSelectedNavItem(`patient-${patientId}`);
    setViewMode('patient');
    setTodoViewState(null);
    todoNav.clearNavigation();
  }, [handleTabClick, todoNav]);

  // ---- Derived data ----
  const selectedWorkspaceId = selectedNavItem.startsWith('patient-')
    ? selectedNavItem.replace('patient-', '')
    : patient?.mrn;

  const isViewingEncounterPatient = patient && selectedWorkspaceId === patient.mrn;

  const selectedPatient = useMemo(() => {
    if (!selectedWorkspaceId) return null;
    if (isViewingEncounterPatient && patient) return patient;
    return getPatientByMrn(selectedWorkspaceId) || null;
  }, [selectedWorkspaceId, isViewingEncounterPatient, patient]);

  const selectedPatientOverviewData = useMemo(() => {
    if (!selectedPatient) return null;
    const { demographics, clinicalSummary } = selectedPatient;
    return {
      name: demographics.preferredName
        ? `${demographics.preferredName} (${demographics.firstName}) ${demographics.lastName}`
        : `${demographics.firstName} ${demographics.lastName}`,
      mrn: selectedPatient.mrn,
      dob: formatDate(demographics.dateOfBirth),
      age: demographics.age,
      gender: demographics.gender,
      pronouns: demographics.pronouns,
      allergies: (clinicalSummary?.allergies || []).map((a, i) => ({
        id: `allergy-${i}`, allergen: a.allergen, reaction: a.reaction, severity: a.severity,
      })),
      medications: (clinicalSummary?.medications || []).map((m, i) => ({
        id: `med-${i}`, name: m.name, dosage: m.dosage, frequency: m.frequency, status: 'active' as const,
      })),
      problems: (clinicalSummary?.problemList || []).map((c, i) => ({
        id: `problem-${i}`, name: c.description, icdCode: c.icdCode, status: 'active' as const, isPrimary: i === 0,
      })),
      vitals: [],
    };
  }, [selectedPatient]);

  // Build patient overview name
  const patientOverviewName = useMemo(() => {
    if (!patient) return '';
    return patient.demographics.preferredName
      ? `${patient.demographics.preferredName} (${patient.demographics.firstName}) ${patient.demographics.lastName}`
      : `${patient.demographics.firstName} ${patient.demographics.lastName}`;
  }, [patient]);

  // Current to-do category
  const currentCategory = todoViewState ? getCategoryById(todoViewState.categoryId) : null;
  const todoItems = todoViewState ? getItemsByCategory(todoViewState.categoryId) : [];

  const filteredTodoCount = useMemo(() => {
    if (!todoViewState) return 0;
    let result = todoItems.filter(
      (item) => item.filterId === todoViewState.filterId || todoViewState.filterId.startsWith('all')
    );
    if (todoSearchQuery) {
      const query = todoSearchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.patient.name.toLowerCase().includes(query)
      );
    }
    return result.length;
  }, [todoItems, todoViewState, todoSearchQuery]);

  // ---- Workspace init ----
  useEffect(() => {
    if (patient && encounter) {
      const existingWorkspace = workspace.getWorkspace(patient.mrn);
      if (!existingWorkspace) {
        workspace.openWorkspace(patient.mrn, 'patient', patientOverviewName);
        const visitType = state.context.visit?.chiefComplaint || encounter.type || 'Visit';
        const dateStr = (encounter.scheduledAt || encounter.startedAt)
          ? (encounter.scheduledAt || encounter.startedAt)!.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
          : undefined;
        const visitLabel = dateStr ? `${dateStr} · ${visitType}` : visitType;
        workspace.openTab(patient.mrn, {
          type: 'visit',
          label: visitLabel,
          specialty: encounter.specialty,
        });
      }
    }
  }, [patient?.mrn, patientOverviewName, workspace, encounter]);

  // Set default patient nav item only on initial mount (when nothing is selected yet)
  useEffect(() => {
    if (patient && selectedNavItem === '') {
      setSelectedNavItem(`patient-${patient.mrn}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount
  }, [patient?.mrn]);

  // ---- Patient workspaces for menu ----
  const patientWorkspaces = useMemo(() => {
    const allWorkspaces = workspace.workspaces.filter(w => w.type === 'patient');

    if (allWorkspaces.length === 0 && patient) {
      return [{
        id: patient.mrn,
        name: patientOverviewName,
        initials: patient.demographics.firstName[0] + patient.demographics.lastName[0],
        avatarColor: colors.fg.accent.primary,
        workspaceTabs: [],
        activeTabId: '',
        currentVisit: state.context.visit?.chiefComplaint || encounter?.type,
        tabRecordingStatuses: {},
      }];
    }

    return allWorkspaces.map((ws, index) => {
      const isCurrentPatient = patient && ws.id === patient.mrn;
      const nameParts = (ws.patientName || 'Unknown').split(' ');
      const initials = nameParts.length >= 2
        ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
        : nameParts[0].slice(0, 2);

      const avatarColors = [
        colors.fg.accent.primary,
        colors.fg.positive.primary,
        colors.fg.attention.primary,
        colors.fg.alert.primary,
      ];

      const visitSubItems: VisitSubItemConfig[] = isCurrentPatient
        ? ws.tabs
            .filter((t) => t.type === 'visit')
            .map((t) => {
              const phaseMeta = WORKFLOW_PHASES.find((p) => p.key === workflowState.activePhase);
              const allComplete = WORKFLOW_PHASES.every((p) => workflowState.completedPhases.has(p.key));
              const workflowBadge: VisitSubItemConfig['workflowBadge'] = allComplete
                ? { text: 'Complete', colorScheme: 'positive' }
                : phaseMeta
                ? { text: phaseMeta.label, colorScheme: captureView.viewContext === 'workflow' ? 'attention' : 'accent' }
                : undefined;
              return {
                visitTabId: t.id,
                activeSubItem: captureView.viewContext,
                workflowBadge,
                onSubItemClick: (view) => {
                  captureView.setViewContext(view);
                  workspace.switchTab(ws.id, t.id);
                  setViewMode('patient');
                  setTodoViewState(null);
                  setSelectedNavItem(`patient-${ws.id}`);
                },
              };
            })
        : [];

      return {
        id: ws.id,
        name: ws.patientName || 'Unknown Patient',
        initials: isCurrentPatient
          ? patient!.demographics.firstName[0] + patient!.demographics.lastName[0]
          : initials.toUpperCase(),
        avatarColor: avatarColors[index % avatarColors.length],
        workspaceTabs: ws.tabs,
        activeTabId: ws.activeTabId,
        currentVisit: isCurrentPatient
          ? state.context.visit?.chiefComplaint || encounter?.type
          : undefined,
        tabRecordingStatuses: isCurrentPatient
          ? Object.fromEntries(
              ws.tabs
                .filter(t => t.type === 'visit')
                .map(t => [t.id, transcriptionStatus])
            )
          : {},
        visitSubItems,
      };
    });
  }, [patient, patientOverviewName, workspace.workspaces, state.context.visit, encounter, transcriptionStatus, captureView.viewContext, workflowState.activePhase, workflowState.completedPhases]);

  // ---- Render ----
  const mainContent = (
    <>
      <style>{captureViewAnimations}</style>

      <AdaptiveLayout
        menuPane={
          <LeftPaneContainer
            menuPaneProps={{
              patientWorkspaces,
              selectedItemId: viewMode === 'cohort' ? undefined : selectedNavItem,
              selectedToDoFilter: todoViewState && !selectedNavItem.startsWith('patient-')
                ? `${todoViewState.categoryId}/${todoViewState.filterId}`
                : undefined,
              onNavItemSelect: handleNavItemSelect,
              onToDoFilterSelect: handleToDoFilterSelect,
              selectedCohortId: viewMode === 'cohort' ? selectedCohortId : null,
              onCohortSelect: handleCohortSelect,
              onPatientSelect: handlePatientSelect,
              onTabClick: handleTabClickShell,
              onTabClose: handleTabClose,
              onWorkspaceClose: handleWorkspaceClose,
            }}
            hasTranscriptionSession={viewMode === 'patient' && !!activeSession}
            onViewChange={actions.switchView}
            onCollapse={actions.collapse}
            transcriptionDrawerProps={{
              patientName: patientOverviewName,
              patientInitials: patient
                ? patient.demographics.firstName[0] + patient.demographics.lastName[0]
                : '',
              status: transcriptionStatus ?? 'idle',
              duration: recordingDuration,
              segments: drawerSegments,
              onStart: startRecording,
              onPause: pauseRecording,
              onResume: resumeRecording,
              onStop: stopRecording,
              onDiscard: captureView.handleTranscriptionToggle,
            }}
            aiDrawerProps={{
              scope: 'encounter',
              patientName: patientOverviewName,
              encounterLabel: state.context.visit?.chiefComplaint || encounter?.type,
              messages: aiConversation.messages,
              isLoading: aiConversation.isLoading,
              nonChartFollowUps: aiConversation.nonChartFollowUps,
              onNonChartAction: aiConversation.handleNonChartAction,
              availableContextLevels: ['encounter', 'patient', 'section'],
            }}
            aiDrawerFooter={
              <AIDrawerFooter
                suggestions={mergedSuggestions}
                onSuggestionAccept={handleMergedAccept}
                onSuggestionDismiss={handleMergedDismiss}
                onSuggestionAcceptWithChanges={handleMergedAcceptWithChanges}
                quickActions={aiActions.getQuickActions()}
                onQuickActionClick={aiConversation.handleQuickAction}
                onSend={aiConversation.sendMessage}
                disabled={aiConversation.isLoading}
                placeholder="Ask AI..."
                cannedQueries={aiConversation.cannedQueries.map(q => q.text)}
              />
            }
          />
        }
        menuPaneHeaderContent={
          <ViewIconsRow
            activeView={paneState.activeView}
            onViewChange={actions.switchView}
            showTranscript={viewMode === 'patient' && !!activeSession}
          />
        }
        overviewPane={
          // Render overview pane for patient + all cohort views (including category overviews)
          (viewMode === 'patient' || viewMode === 'cohort')
            ? <ScopeOverview
                viewMode={viewMode}
                selectedCohortId={selectedCohortId}
                selectedPatient={selectedPatient}
                selectedPatientOverviewData={selectedPatientOverviewData}
              />
            : undefined
        }
        overviewHeaderContent={
          (viewMode === 'patient' || viewMode === 'cohort')
            ? <ScopeOverviewHeader
                viewMode={viewMode}
                selectedCohort={selectedCohort}
                selectedCohortId={selectedCohortId}
                selectedPatient={selectedPatient}
                selectedPatientOverviewData={selectedPatientOverviewData}
              />
            : undefined
        }
        canvasHeaderContent={
          <ScopeCanvasHeader
            viewMode={viewMode}
            isViewingEncounterPatient={!!isViewingEncounterPatient}
            selectedCohortId={selectedCohortId}
          />
        }
        scrolledCanvasContent={
          viewMode === 'patient' && isViewingEncounterPatient
            ? <EncounterScrolledContent canvasScrolled={canvasScrolled} />
            : undefined
        }
        collapsedIdentityContent={
          <ScopeCollapsedIdentity
            viewMode={viewMode}
            selectedCohort={selectedCohort}
            selectedCohortId={selectedCohortId}
            selectedPatient={selectedPatient}
          />
        }
        canvasViewMode={viewMode === 'todo-list' || viewMode === 'todo-detail' ? 'list' : 'standard'}
        canvasViewTitle={currentCategory?.label}
        canvasViewCount={filteredTodoCount}
        searchQuery={todoSearchQuery}
        onSearchChange={setTodoSearchQuery}
        onBack={ctx.canPopScope ? ctx.popScope : handleNavBack}
        canvasPane={
          <ScopeCanvasPane
            viewMode={viewMode}
            selectedCohortId={selectedCohortId}
            todoViewState={todoViewState}
            selectedNavItem={selectedNavItem}
            todoSearchQuery={todoSearchQuery}
            onSetViewMode={setViewMode}
            onSetTodoViewState={setTodoViewState}
            onSetSelectedNavItem={setSelectedNavItem}
            onOpenPatientFromToDo={handleOpenPatientFromToDo}
            onCanvasScrolledChange={setCanvasScrolled}
          />
        }
        aiControlSurface={
          <ScopeAIBar viewMode={viewMode} selectedCohortId={selectedCohortId} />
        }
      />
    </>
  );

  // Always render PopHealthProvider so the menu tree never remounts when switching
  // between cohort/overview/patient modes. The provider holds pop health state and
  // resets via COHORT_SELECTED dispatch when initialCohortId changes.
  return (
    <PopHealthProvider initialCohortId={effectiveCohortId ?? undefined}>
      {mainContent}
    </PopHealthProvider>
  );
};

AppShell.displayName = 'AppShell';
