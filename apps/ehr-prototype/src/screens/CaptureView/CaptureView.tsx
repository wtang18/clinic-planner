/**
 * CaptureView Screen
 *
 * The primary charting interface during patient encounters.
 * Displays chronological list of chart items with real-time AI suggestions.
 * Uses the new AdaptiveLayout with 3+1 pane architecture.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  useEncounterState,
  useChartItems,
  useActiveSuggestions,
  useOpenCareGaps,
  usePendingReviewCount,
  useToDoNavigation,
  useDrawerCoordination,
} from '../../hooks';
import { useTranscription } from '../../context/TranscriptionContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getPatientByMrn } from '../../scenarios/patientData';
import {
  selectCaptureViewData,
} from '../../state/selectors/views';

import { AdaptiveLayout } from '../../components/layout/AdaptiveLayout';
import { MenuPane, type RegistryViewId } from '../../components/layout/MenuPane';
import { LeftPaneContainer, ViewIconsRow, AIDrawerFooter, type TranscriptSegment as DrawerTranscriptSegment } from '../../components/LeftPane';
import { PatientOverviewPane } from '../../components/layout/PatientOverviewPane';
import { CanvasPane } from '../../components/layout/CanvasPane';
import { EncounterContextBar } from '../../components/layout/EncounterContextBar';
import { ModeSelector } from '../../components/layout/ModeSelector';
import { PatientIdentityHeader } from '../../components/layout/PatientIdentityHeader';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';
import { OmniAddBar } from '../../components/omni-add/OmniAddBar';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { BottomBarContainer } from '../../components/bottom-bar/BottomBarContainer';
import { TaskPane } from '../../components/tasks/TaskPane';
import { DetailsPane } from '../../components/details-pane';
import { ToDoListView, TaskDetailView, FaxDetailView, MessageDetailView, CareDetailView } from '../../components/todo';
import { ContextBar } from '../../components/navigation/ContextBar';
import {
  getCategoryById,
  getItemsByCategory,
  getFilterById,
  type ToDoItem,
} from '../../scenarios/todoData';

import { ClipboardList } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'patient' | 'todo-list' | 'todo-detail';

interface ToDoViewState {
  categoryId: string;
  filterId: string;
  selectedItem?: ToDoItem;
}

import { useCaptureView } from './useCaptureView';
import { captureViewStyles, captureViewAnimations } from './CaptureView.styles';
import { colors, spaceAround } from '../../styles/foundations';

// ============================================================================
// Component
// ============================================================================

export const CaptureView: React.FC = () => {
  const state = useEncounterState();
  const {
    status: transcriptionStatus,
    segments: transcriptSegments,
    duration: recordingDuration,
    start: startRecording,
    pause: pauseRecording,
    resume: resumeRecording,
    stop: stopRecording,
  } = useTranscription();
  const workspace = useWorkspace();
  const todoNav = useToDoNavigation();

  // Map context segments to drawer segment format
  const drawerSegments = useMemo<DrawerTranscriptSegment[]>(() =>
    transcriptSegments.map((seg) => ({
      id: seg.id,
      speaker: (seg.speaker === 'other' ? 'unknown' : seg.speaker) || 'unknown',
      speakerName: seg.speaker === 'provider' ? 'Provider' : seg.speaker === 'patient' ? 'Patient' : 'Unknown',
      timestamp: seg.startTime,
      text: seg.text,
      confidence: seg.confidence,
    })),
    [transcriptSegments]
  );

  // Selectors
  const viewData = selectCaptureViewData(state);
  const items = useChartItems();
  const activeSuggestions = useActiveSuggestions();
  const openCareGaps = useOpenCareGaps();
  const pendingReviewCount = usePendingReviewCount();

  // Drawer coordination (cross-surface actions)
  const { paneState, barState, barActions, actions, activeSession } = useDrawerCoordination();

  // AI Assistant state (content, context, loading — mode is now from coordination)
  const [aiState, aiActions] = useAIAssistant('encounter');

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('patient');
  const [todoViewState, setTodoViewState] = useState<ToDoViewState | null>(null);
  const [selectedNavItem, setSelectedNavItem] = useState<string>('');
  const [todoSearchQuery, setTodoSearchQuery] = useState<string>('');

  // Update AI context based on view mode
  useEffect(() => {
    if (viewMode === 'patient') {
      aiActions.setContext('encounter');
    } else if (viewMode === 'todo-list') {
      aiActions.setContext('toDoList');
    } else {
      aiActions.setContext('todoReview');
    }
  }, [viewMode, aiActions]);

  // Update suggestion/care gap counts for AI minibar
  useEffect(() => {
    aiActions.setSuggestionCount(activeSuggestions.length);
  }, [activeSuggestions.length, aiActions]);

  useEffect(() => {
    aiActions.setCareGapCount(openCareGaps.length);
  }, [openCareGaps.length, aiActions]);

  // Update To-Do navigation in AI assistant when navigating from To-Do
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

  // Handle To-Do filter selection
  const handleToDoFilterSelect = (categoryId: string, filterId: string) => {
    setViewMode('todo-list');
    setTodoViewState({ categoryId, filterId });
    setSelectedNavItem('');
    // Clear navigation context when navigating to To-Do list
    todoNav.clearNavigation();
  };

  // Handle To-Do item click - shows detail view (stays in To-Do category)
  const handleToDoItemClick = (item: ToDoItem) => {
    if (todoViewState) {
      setViewMode('todo-detail');
      setTodoViewState({ ...todoViewState, selectedItem: item });
    }
  };

  // Handle opening patient workspace from To-Do detail view
  // This is the explicit action to switch context
  const handleOpenPatientFromToDo = useCallback((item: ToDoItem) => {
    const workspaceId = item.patient.mrn;
    const patientName = item.patient.name;

    // Create/open workspace for this patient
    workspace.openWorkspace(workspaceId, 'patient', patientName);

    // Set context bar navigation state
    if (todoViewState) {
      todoNav.navigateToItem(item, todoViewState.categoryId, todoViewState.filterId);
    }

    // Switch to patient view
    setViewMode('patient');
    setTodoViewState(null);
    setSelectedNavItem(`patient-${workspaceId}`);
  }, [workspace, todoViewState, todoNav]);

  // Handle back to list from detail (legacy - now using tabs)
  const handleBackToList = () => {
    if (todoViewState) {
      setViewMode('todo-list');
      setTodoViewState({ ...todoViewState, selectedItem: undefined });
    }
  };

  // Handle nav row back button - context-sensitive
  const handleNavBack = () => {
    if (viewMode === 'todo-detail') {
      // From detail, go back to list
      handleBackToList();
    } else if (viewMode === 'todo-list') {
      // From list, go back to patient view
      setViewMode('patient');
      setTodoViewState(null);
      setTodoSearchQuery('');
    }
    // For patient view, back button would navigate to previous canvas (future)
  };

  // Handle nav item selection (hubs, workspaces)
  const handleNavItemSelect = (id: string) => {
    setSelectedNavItem(id);
    // If selecting a hub or workspace, switch back to patient view
    if (id === 'home' || id === 'visits' || id === 'agent') {
      setViewMode('patient');
      setTodoViewState(null);
      // Clear navigation context when navigating via menu
      todoNav.clearNavigation();
    }
  };

  // Handle registry view selection (population health views under My Patients)
  const handleRegistryViewSelect = (viewId: RegistryViewId) => {
    setSelectedNavItem(`registry-${viewId}`);
    setViewMode('patient');
    setTodoViewState(null);
    todoNav.clearNavigation();
  };

  // Handle patient/workspace selection
  const handlePatientSelect = useCallback((workspaceId: string) => {
    // Set this as the active workspace
    const existingWorkspace = workspace.getWorkspace(workspaceId);
    if (existingWorkspace) {
      // Workspace already exists, just switch to it
    } else {
      // Create workspace (should rarely happen as workspaces are created on To-Do click)
      const currentPatient = state.context.patient;
      const patientName = currentPatient && currentPatient.mrn === workspaceId
        ? `${currentPatient.demographics.firstName} ${currentPatient.demographics.lastName}`
        : 'Unknown Patient';
      workspace.openWorkspace(workspaceId, 'patient', patientName);
    }

    setViewMode('patient');
    setTodoViewState(null);
    setSelectedNavItem(`patient-${workspaceId}`);
  }, [workspace, state.context.patient]);

  // Handle workspace tab click
  const handleTabClick = useCallback((patientId: string, tabId: string) => {
    workspace.switchTab(patientId, tabId);
    setViewMode('patient');
    setTodoViewState(null);
    setSelectedNavItem(`patient-${patientId}`);
  }, [workspace]);

  // Handle workspace tab close
  const handleTabClose = useCallback((patientId: string, tabId: string) => {
    workspace.closeTab(patientId, tabId);
  }, [workspace]);

  // Handle context bar "Return to list"
  const handleContextBarReturn = useCallback(() => {
    const result = todoNav.returnToList();
    if (result) {
      setViewMode('todo-list');
      setTodoViewState({ categoryId: result.categoryId, filterId: result.filterId });
      setSelectedNavItem('');
    }
  }, [todoNav]);

  // Handle context bar "Next"
  const handleContextBarNext = useCallback(() => {
    const nextItem = todoNav.navigateToNext();
    if (nextItem) {
      // Open workspace for the next item
      const workspaceId = nextItem.patient.mrn;
      const patientName = nextItem.patient.name;
      workspace.openWorkspace(workspaceId, 'patient', patientName);
      setSelectedNavItem(`patient-${workspaceId}`);
    }
  }, [todoNav, workspace]);

  // Handle context bar dismiss
  const handleContextBarDismiss = useCallback(() => {
    todoNav.dismissContextBar();
  }, [todoNav]);

  // Get current To-Do category and items
  const currentCategory = todoViewState ? getCategoryById(todoViewState.categoryId) : null;
  const todoItems = todoViewState ? getItemsByCategory(todoViewState.categoryId) : [];

  // Compute filtered count (matching ToDoListView filtering logic)
  const filteredTodoCount = useMemo(() => {
    if (!todoViewState) return 0;

    let result = todoItems.filter(
      (item) => item.filterId === todoViewState.filterId || todoViewState.filterId.startsWith('all')
    );

    // Apply search filter
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

  // Capture view logic
  const {
    selectedItemId,
    isPaletteOpen,
    setIsPaletteOpen,
    isTaskPaneOpen,
    setIsTaskPaneOpen,
    handleItemAdd,
    handleUndo,
    handleItemSelect,
    handleItemUpdate,
    handleItemRemove,
    handleCloseDetailsPane,
    handleSuggestionAccept,
    handleSuggestionDismiss,
    handleTranscriptionToggle,
    handleModeChange,
  } = useCaptureView();

  // Patient and encounter context
  const patient = state.context.patient;
  const encounter = state.context.encounter;

  // Determine which workspace is currently selected
  const selectedWorkspaceId = selectedNavItem.startsWith('patient-')
    ? selectedNavItem.replace('patient-', '')
    : patient?.mrn;

  // Check if we're viewing the encounter patient (has full overview data)
  const isViewingEncounterPatient = patient && selectedWorkspaceId === patient.mrn;

  // Helper to format dates
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    return date instanceof Date ? date.toLocaleDateString() : String(date);
  };

  // Get the selected patient data (for non-encounter patients, look up from registry)
  const selectedPatient = useMemo(() => {
    if (!selectedWorkspaceId) return null;
    if (isViewingEncounterPatient && patient) return patient;
    // Look up from patient registry
    return getPatientByMrn(selectedWorkspaceId) || null;
  }, [selectedWorkspaceId, isViewingEncounterPatient, patient]);

  // Build overview data for the selected patient
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
        id: `allergy-${i}`,
        allergen: a.allergen,
        reaction: a.reaction,
        severity: a.severity,
      })),
      medications: (clinicalSummary?.medications || []).map((m, i) => ({
        id: `med-${i}`,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        status: 'active' as const,
      })),
      problems: (clinicalSummary?.problemList || []).map((c, i) => ({
        id: `problem-${i}`,
        name: c.description,
        icdCode: c.icdCode,
        status: 'active' as const,
        isPrimary: i === 0,
      })),
      vitals: [],
    };
  }, [selectedPatient]);

  // Handle closing entire workspace (must be after patient is defined)
  const handleWorkspaceClose = useCallback((workspaceId: string) => {
    workspace.closeWorkspace(workspaceId);

    // If we closed the currently selected workspace, switch to the encounter patient
    if (selectedNavItem === `patient-${workspaceId}`) {
      if (patient) {
        setSelectedNavItem(`patient-${patient.mrn}`);
      } else {
        setSelectedNavItem('');
      }
    }
  }, [workspace, selectedNavItem, patient]);

  // If no patient/encounter loaded, show empty state
  if (!patient || !encounter) {
    return (
      <div style={captureViewStyles.container}>
        <div style={captureViewStyles.chartItemsEmpty}>
          <ClipboardList size={64} color={colors.border.neutral.medium} style={{ marginBottom: spaceAround.default }} />
          <div style={captureViewStyles.emptyTitle}>No Encounter Loaded</div>
          <div style={captureViewStyles.emptyDescription}>
            Select a patient and encounter to begin charting.
          </div>
        </div>
      </div>
    );
  }

  // Sort items chronologically (newest at bottom)
  const sortedItems = [...items].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  // Selected item for details pane
  const selectedItem = selectedItemId
    ? items.find(i => i.id === selectedItemId) ?? null
    : null;

  // Build patient overview data
  const patientOverviewData = {
    name: patient.demographics.preferredName
      ? `${patient.demographics.preferredName} (${patient.demographics.firstName}) ${patient.demographics.lastName}`
      : `${patient.demographics.firstName} ${patient.demographics.lastName}`,
    mrn: patient.mrn,
    dob: formatDate(patient.demographics.dateOfBirth),
    age: patient.demographics.age,
    gender: patient.demographics.gender,
    pronouns: patient.demographics.pronouns,
    allergies: (patient.clinicalSummary?.allergies || []).map((a, i) => ({
      id: `allergy-${i}`,
      allergen: a.allergen,
      reaction: a.reaction,
      severity: a.severity,
    })),
    medications: (patient.clinicalSummary?.medications || []).map((m, i) => ({
      id: `med-${i}`,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      status: 'active' as const,
    })),
    problems: (patient.clinicalSummary?.problemList || []).map((c, i) => ({
      id: `problem-${i}`,
      name: c.description,
      icdCode: c.icdCode,
      status: 'active' as const,
      isPrimary: i === 0,
    })),
    vitals: [], // Would come from vitals data if available
  };

  // Initialize workspace for current patient with Visit tab
  useEffect(() => {
    if (patient && encounter) {
      const existingWorkspace = workspace.getWorkspace(patient.mrn);
      if (!existingWorkspace) {
        workspace.openWorkspace(patient.mrn, 'patient', patientOverviewData.name);
        // Add Visit tab for encounter patient
        const visitLabel = state.context.visit?.chiefComplaint || encounter.type || 'Visit';
        workspace.openTab(patient.mrn, {
          type: 'visit',
          label: visitLabel,
        });
      }
    }
  }, [patient?.mrn, patientOverviewData.name, workspace, encounter]);

  // Create transcription session for BottomBarContainer's TranscriptionModule
  useEffect(() => {
    if (patient && encounter && !activeSession) {
      barActions.createSession(encounter.id || 'enc-current', {
        id: patient.mrn,
        name: patientOverviewData.name,
        initials: patient.demographics.firstName[0] + patient.demographics.lastName[0],
      });
    }
  }, [patient?.mrn, encounter]);

  // Build patient workspaces for menu from ALL open workspaces in context
  const patientWorkspaces = useMemo(() => {
    // Get all patient workspaces from context
    const allWorkspaces = workspace.workspaces.filter(w => w.type === 'patient');

    // Determine recording status for encounter patient
    const getRecordingStatus = (isEncounterPatient: boolean): 'recording' | 'complete' | 'none' => {
      if (!isEncounterPatient) return 'none';
      if (transcriptionStatus === 'recording') return 'recording';
      if (transcriptionStatus === 'processing') return 'complete';
      return 'none';
    };

    if (allWorkspaces.length === 0 && patient) {
      // Fallback to current patient if no workspaces yet
      return [{
        id: patient.mrn,
        name: patientOverviewData.name,
        initials: patient.demographics.firstName[0] + patient.demographics.lastName[0],
        avatarColor: colors.fg.accent.primary,
        workspaceTabs: [],
        activeTabId: '',
        currentVisit: state.context.visit?.chiefComplaint || encounter?.type,
        recordingStatus: getRecordingStatus(true),
      }];
    }

    // Build from all open workspaces
    return allWorkspaces.map((ws, index) => {
      // Check if this is the current encounter patient
      const isCurrentPatient = patient && ws.id === patient.mrn;

      // Generate initials from patient name
      const nameParts = (ws.patientName || 'Unknown').split(' ');
      const initials = nameParts.length >= 2
        ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
        : nameParts[0].slice(0, 2);

      // Assign different colors based on index
      const avatarColors = [
        colors.fg.accent.primary,
        colors.fg.positive.primary,
        colors.fg.attention.primary,
        colors.fg.alert.primary,
      ];

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
        recordingStatus: getRecordingStatus(!!isCurrentPatient),
      };
    });
  }, [patient, patientOverviewData.name, workspace.workspaces, state.context.visit, encounter, transcriptionStatus]);

  // Canvas header content - contextual controls for encounters
  const currentUser = state.session.currentUser;
  const visit = state.context.visit;

  // ModeSelector is a contextual control in the floating nav row
  const canvasHeaderContent = (
    <ModeSelector
      currentMode={state.session.mode}
      onModeChange={handleModeChange}
    />
  );

  // Patient identity header for the overview section of floating nav row
  // Uses selected patient data (works for any patient, not just encounter patient)
  const selectedOverviewHeaderContent = selectedPatientOverviewData && selectedPatient ? (
    <PatientIdentityHeader
      name={selectedPatientOverviewData.name}
      mrn={selectedPatient.mrn}
      dob={selectedPatientOverviewData.dob}
      age={selectedPatient.demographics.age}
      gender={selectedPatient.demographics.gender}
      pronouns={selectedPatient.demographics.pronouns}
      onPatientClick={() => {}}
      onCopyMrn={() => navigator.clipboard?.writeText(selectedPatient.mrn)}
      variant="stacked"
      showMenuButton={false}
    />
  ) : null;

  // Patient identity for floating nav row (shown when overview collapsed)
  const selectedPatientIdentity = selectedPatientOverviewData && selectedPatient ? {
    name: selectedPatientOverviewData.name,
    mrn: selectedPatient.mrn,
    dob: selectedPatientOverviewData.dob,
    age: selectedPatient.demographics.age,
    gender: selectedPatient.demographics.gender,
    pronouns: selectedPatient.demographics.pronouns,
  } : undefined;

  // Canvas pane internal header
  const canvasPaneHeader = (
    <EncounterContextBar
      encounter={encounter}
      chiefComplaint={visit?.chiefComplaint}
      providerName={currentUser?.name}
      providerCredentials={currentUser?.credentials?.join(', ')}
    />
  );

  // Compact canvas header for collapsed state
  const compactCanvasHeader = (
    <EncounterContextBar
      encounter={encounter}
      chiefComplaint={visit?.chiefComplaint}
      providerName={currentUser?.name}
      compact
    />
  );

  // Enrich To-Do context content with navigation callbacks for AI minibar
  let enrichedContent = aiState.content;
  if (aiState.content.type === 'todo-context') {
    enrichedContent = {
      ...aiState.content,
      onPrev: () => {
        const prevItem = todoNav.navigateToPrev();
        if (prevItem) {
          const workspaceId = prevItem.patient.mrn;
          const patientName = prevItem.patient.name;
          workspace.openWorkspace(workspaceId, 'patient', patientName);
          setSelectedNavItem(`patient-${workspaceId}`);
        }
      },
      onNext: () => {
        const nextItem = todoNav.navigateToNext();
        if (nextItem) {
          const workspaceId = nextItem.patient.mrn;
          const patientName = nextItem.patient.name;
          workspace.openWorkspace(workspaceId, 'patient', patientName);
          setSelectedNavItem(`patient-${workspaceId}`);
        }
      },
    };
  }

  return (
    <>
      {/* Inject animations */}
      <style>{captureViewAnimations}</style>

      <AdaptiveLayout
        menuPane={
          <LeftPaneContainer
            menuPaneProps={{
              patientWorkspaces,
              selectedItemId: selectedNavItem,
              selectedToDoFilter: todoViewState ? `${todoViewState.categoryId}/${todoViewState.filterId}` : undefined,
              onNavItemSelect: handleNavItemSelect,
              onToDoFilterSelect: handleToDoFilterSelect,
              onRegistryViewSelect: handleRegistryViewSelect,
              onPatientSelect: handlePatientSelect,
              onTabClick: handleTabClick,
              onTabClose: handleTabClose,
              onWorkspaceClose: handleWorkspaceClose,
            }}
            hasTranscriptionSession={!!activeSession}
            onViewChange={actions.switchView}
            onCollapse={actions.collapse}
            transcriptionDrawerProps={{
              patientName: patientOverviewData.name,
              patientInitials: patient.demographics.firstName[0] + patient.demographics.lastName[0],
              status: transcriptionStatus ?? 'idle',
              duration: recordingDuration,
              segments: drawerSegments,
              onStart: startRecording,
              onPause: pauseRecording,
              onResume: resumeRecording,
              onStop: stopRecording,
              onDiscard: handleTranscriptionToggle,
            }}
            aiDrawerProps={{
              scope: 'encounter',
              patientName: patientOverviewData.name,
              encounterLabel: state.context.visit?.chiefComplaint || encounter?.type,
              suggestions: activeSuggestions,
              messages: [],
              isLoading: aiState.isLoading,
              onSuggestionAccept: handleSuggestionAccept,
              onSuggestionDismiss: handleSuggestionDismiss,
              availableContextLevels: ['encounter', 'patient', 'section'],
              onContextLevelChange: (level: string) => console.log('Drawer context:', level),
            }}
            aiDrawerFooter={
              <AIDrawerFooter
                quickActions={aiActions.getQuickActions()}
                onQuickActionClick={(actionId) => {
                  console.log('Quick action:', actionId);
                }}
                onSend={(message) => {
                  console.log('AI message:', message);
                }}
                disabled={aiState.isLoading}
                placeholder="Ask AI..."
              />
            }
          />
        }
        menuPaneHeaderContent={
          <ViewIconsRow
            activeView={paneState.activeView}
            onViewChange={actions.switchView}
            showTranscript={!!activeSession}
          />
        }
        overviewPane={
          viewMode === 'patient' && selectedPatientOverviewData && selectedPatient ? (
            <PatientOverviewPane
              patient={selectedPatientOverviewData}
              onPatientClick={() => {}}
              onCopyMrn={() => navigator.clipboard?.writeText(selectedPatient.mrn)}
              hideHeader={true}
            />
          ) : undefined
        }
        overviewHeaderContent={viewMode === 'patient' && selectedOverviewHeaderContent ? selectedOverviewHeaderContent : undefined}
        canvasHeaderContent={viewMode === 'patient' && isViewingEncounterPatient ? canvasHeaderContent : undefined}
        patientIdentity={viewMode === 'patient' && selectedPatientIdentity ? selectedPatientIdentity : undefined}
        isToDoView={viewMode !== 'patient'}
        todoTitle={currentCategory?.label}
        todoCount={filteredTodoCount}
        searchQuery={todoSearchQuery}
        onSearchChange={setTodoSearchQuery}
        onBack={handleNavBack}
        canvasPane={
          <CanvasPane
            headerContent={viewMode === 'patient' ? canvasPaneHeader : undefined}
            compactHeaderContent={viewMode === 'patient' ? compactCanvasHeader : undefined}
          >
            {/* To-Do List View */}
            {viewMode === 'todo-list' && todoViewState && currentCategory && (
              <ToDoListView
                categoryId={todoViewState.categoryId}
                filterId={todoViewState.filterId}
                filters={currentCategory.filters}
                items={todoItems}
                searchQuery={todoSearchQuery}
                onFilterChange={(filterId) => {
                  setTodoViewState({ ...todoViewState, filterId });
                }}
                onItemClick={handleToDoItemClick}
              />
            )}

            {/* To-Do Detail View */}
            {viewMode === 'todo-detail' && todoViewState?.selectedItem && (
              <>
                {/* Back button */}
                <div
                  style={{
                    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
                    borderBottom: `1px solid ${colors.border.neutral.low}`,
                  }}
                >
                  <button
                    onClick={handleBackToList}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
                      backgroundColor: colors.bg.neutral.subtle,
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      color: colors.fg.neutral.secondary,
                      cursor: 'pointer',
                    }}
                  >
                    ← Back to {currentCategory?.label}
                  </button>
                </div>

                {/* Detail view based on category */}
                {todoViewState.categoryId === 'tasks' && (
                  <TaskDetailView
                    item={todoViewState.selectedItem}
                    onComplete={handleBackToList}
                    onNavigateToPatient={() => {
                      if (todoViewState.selectedItem) {
                        handleOpenPatientFromToDo(todoViewState.selectedItem);
                      }
                    }}
                  />
                )}
                {todoViewState.categoryId === 'inbox' && (
                  <FaxDetailView
                    item={todoViewState.selectedItem}
                    onNavigateToPatient={() => {
                      if (todoViewState.selectedItem) {
                        handleOpenPatientFromToDo(todoViewState.selectedItem);
                      }
                    }}
                  />
                )}
                {todoViewState.categoryId === 'messages' && (
                  <MessageDetailView
                    item={todoViewState.selectedItem}
                    onNavigateToPatient={() => {
                      if (todoViewState.selectedItem) {
                        handleOpenPatientFromToDo(todoViewState.selectedItem);
                      }
                    }}
                  />
                )}
                {todoViewState.categoryId === 'care' && (
                  <CareDetailView
                    item={todoViewState.selectedItem}
                    onComplete={handleBackToList}
                    onNavigateToPatient={() => {
                      if (todoViewState.selectedItem) {
                        handleOpenPatientFromToDo(todoViewState.selectedItem);
                      }
                    }}
                  />
                )}
              </>
            )}

            {/* Patient Workspace View - renders based on active tab */}
            {viewMode === 'patient' && (() => {
              // Get the selected workspace ID from nav state (format: "patient-{id}")
              const selectedWorkspaceId = selectedNavItem.startsWith('patient-')
                ? selectedNavItem.replace('patient-', '')
                : patient?.mrn;

              // Get the active workspace and tab
              const currentWorkspace = selectedWorkspaceId
                ? workspace.getWorkspace(selectedWorkspaceId)
                : null;
              const activeTab = currentWorkspace
                ? currentWorkspace.tabs.find(t => t.id === currentWorkspace.activeTabId)
                : null;

              // Check if this is the current encounter patient
              const isEncounterPatient = patient && selectedWorkspaceId === patient.mrn;

              // Get context bar filter label
              const contextBarFilterLabel = todoNav.sourceFilterLabel || '';

              // Handle close tab - go back to overview and close tab
              const handleCloseActiveTab = () => {
                if (currentWorkspace && activeTab && selectedWorkspaceId) {
                  // Find overview tab
                  const overviewTab = currentWorkspace.tabs.find(t => t.type === 'overview');
                  if (overviewTab) {
                    workspace.switchTab(selectedWorkspaceId, overviewTab.id);
                  }
                  workspace.closeTab(selectedWorkspaceId, activeTab.id);
                }
              };

              // Render context bar if we navigated from To-Do
              const contextBar = todoNav.shouldShowContextBar ? (
                <ContextBar
                  sourceFilter={contextBarFilterLabel}
                  sourceCategoryId={todoNav.state?.categoryId || ''}
                  remainingCount={todoNav.remainingCount}
                  currentTaskTitle={todoNav.currentItemTitle || ''}
                  hasNext={todoNav.hasNext}
                  onReturn={handleContextBarReturn}
                  onNext={handleContextBarNext}
                  onDismiss={handleContextBarDismiss}
                  testID="context-bar"
                />
              ) : null;

              // If no active tab or it's the overview tab, show the encounter view (only for encounter patient)
              if (!activeTab || activeTab.type === 'overview' || activeTab.type === 'visit') {
                // For non-encounter patients with overview tab, show a placeholder
                if (!isEncounterPatient && currentWorkspace) {
                  return (
                    <>
                      {contextBar}
                      <div style={captureViewStyles.contentWrapper}>
                        <div style={captureViewStyles.chartItemsEmpty}>
                          <ClipboardList size={64} color={colors.border.neutral.medium} style={{ marginBottom: spaceAround.default }} />
                          <div style={captureViewStyles.emptyTitle}>
                            {currentWorkspace.patientName}
                          </div>
                          <div style={captureViewStyles.emptyDescription}>
                            Select a task from the menu to view details.
                          </div>
                        </div>
                      </div>
                    </>
                  );
                }

                // Current encounter patient - show chart items
                return (
                  <>
                    {contextBar}
                    <div style={captureViewStyles.contentWrapper}>
                      {/* Chart items list */}
                      <div style={captureViewStyles.chartItemsList}>
                        {sortedItems.length === 0 ? (
                          <div style={captureViewStyles.chartItemsEmpty}>
                            <ClipboardList size={64} color={colors.border.neutral.medium} style={{ marginBottom: spaceAround.default }} />
                            <div style={captureViewStyles.emptyTitle}>
                              Start Your Encounter
                            </div>
                            <div style={captureViewStyles.emptyDescription}>
                              Choose a category below to add items to the chart.
                              AI will help with suggestions as you go.
                            </div>
                          </div>
                        ) : (
                          sortedItems.map((item) => (
                            <div key={item.id} style={captureViewStyles.chartItemCard}>
                              <ChartItemCard
                                item={item}
                                variant="compact"
                                selected={item.id === selectedItemId}
                                onSelect={() => handleItemSelect(item.id)}
                              />
                            </div>
                          ))
                        )}
                      </div>

                      {/* OmniAdd bar (always open) */}
                      <div style={{ marginTop: spaceAround.default }}>
                        <OmniAddBar onItemAdd={handleItemAdd} onUndo={handleUndo} />
                      </div>
                    </div>
                  </>
                );
              }

              // Render tab content based on type
              if (activeTab.type === 'task' && activeTab.todoItem) {
                return (
                  <>
                    {contextBar}
                    <TaskDetailView
                      item={activeTab.todoItem}
                      onComplete={handleCloseActiveTab}
                      onNavigateToPatient={() => {}}
                    />
                  </>
                );
              }

              if (activeTab.type === 'fax' && activeTab.todoItem) {
                return (
                  <>
                    {contextBar}
                    <FaxDetailView
                      item={activeTab.todoItem}
                      onNavigateToPatient={() => {}}
                    />
                  </>
                );
              }

              if (activeTab.type === 'message' && activeTab.todoItem) {
                return (
                  <>
                    {contextBar}
                    <MessageDetailView
                      item={activeTab.todoItem}
                      onNavigateToPatient={() => {}}
                    />
                  </>
                );
              }

              if (activeTab.type === 'care' && activeTab.todoItem) {
                return (
                  <>
                    {contextBar}
                    <CareDetailView
                      item={activeTab.todoItem}
                      onComplete={handleCloseActiveTab}
                      onNavigateToPatient={() => {}}
                    />
                  </>
                );
              }

              // Fallback - show overview
              return (
                <>
                  {contextBar}
                  <div style={captureViewStyles.contentWrapper}>
                    <div style={captureViewStyles.chartItemsList}>
                      {sortedItems.length === 0 ? (
                        <div style={captureViewStyles.chartItemsEmpty}>
                          <ClipboardList size={64} color={colors.border.neutral.medium} style={{ marginBottom: spaceAround.default }} />
                          <div style={captureViewStyles.emptyTitle}>
                            Start Your Encounter
                          </div>
                          <div style={captureViewStyles.emptyDescription}>
                            Choose a category below to add items to the chart.
                            AI will help with suggestions as you go.
                          </div>
                        </div>
                      ) : (
                        sortedItems.map((item) => (
                          <div key={item.id} style={captureViewStyles.chartItemCard}>
                            <ChartItemCard
                              item={item}
                              variant="compact"
                              selected={item.id === selectedItemId}
                              onSelect={() => handleItemSelect(item.id)}
                            />
                          </div>
                        ))
                      )}
                    </div>

                    {/* OmniAdd bar (always open) */}
                    <div style={{ marginTop: spaceAround.default }}>
                      <OmniAddBar onItemAdd={handleItemAdd} onUndo={handleUndo} />
                    </div>
                  </div>
                </>
              );
            })()}
          </CanvasPane>
        }
        aiControlSurface={
          <BottomBarContainer
            aiContent={enrichedContent}
            suggestions={activeSuggestions}
            onSuggestionAccept={handleSuggestionAccept}
            onSuggestionDismiss={handleSuggestionDismiss}
            patientName={patientOverviewData.name}
            contextTarget={{ type: 'encounter', label: state.context.visit?.chiefComplaint || encounter?.type || 'Visit' }}
            availableContextLevels={['encounter', 'patient', 'section']}
            onContextLevelChange={(level) => console.log('Context level:', level)}
            quickActions={aiActions.getQuickActions()}
            onQuickActionClick={(actionId) => console.log('Quick action:', actionId)}
            transcriptionEnabled={true}
          />
        }
      />

      {/* Details pane overlay */}
      <DetailsPane
        item={selectedItem}
        onClose={handleCloseDetailsPane}
        onUpdate={handleItemUpdate}
        onRemove={handleItemRemove}
      />

      {/* Task pane overlay */}
      {isTaskPaneOpen && (
        <div
          style={captureViewStyles.taskPaneOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsTaskPaneOpen(false);
            }
          }}
        >
          <div style={captureViewStyles.taskPaneContainer}>
            <TaskPane
              isOpen={isTaskPaneOpen}
              onClose={() => setIsTaskPaneOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

CaptureView.displayName = 'CaptureView';
