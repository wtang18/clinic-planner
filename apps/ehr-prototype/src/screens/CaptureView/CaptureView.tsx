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
import { useCoordination } from '../../hooks/useCoordination';
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
import { PatientIdentityHeader } from '../../components/layout/PatientIdentityHeader';
import { SegmentedControl, type Segment } from '../../components/primitives/SegmentedControl';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';
import { OmniAddBarV2 as OmniAddBar } from '../../components/omni-add/OmniAddBarV2';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useAIConversation } from '../../hooks/useAIConversation';
import { BottomBarContainer } from '../../components/bottom-bar/BottomBarContainer';
import { TaskPane } from '../../components/tasks/TaskPane';
import { DetailsPane } from '../../components/details-pane';
import { ProcessingRail, RailFloatingStatus } from '../../components/processing-rail';
import { TriageModule } from '../../components/triage';
import type { VitalsItem, NarrativeItem, PhysicalExamItem } from '../../types/chart-items';
import { ToDoListView, TaskDetailView, FaxDetailView, MessageDetailView, CareDetailView } from '../../components/todo';
import { ContextBar } from '../../components/navigation/ContextBar';
import { ScopeReturnBar } from '../../components/navigation/ScopeReturnBar';
import {
  getCategoryById,
  getItemsByCategory,
  getFilterById,
  type ToDoItem,
} from '../../scenarios/todoData';

import { ClipboardList, Check } from 'lucide-react';
import { useCurrentMode, useNavigation } from '../../navigation/NavigationContext';
import { ProcessCanvas } from '../ProcessView';
import { ReviewCanvas } from '../ReviewView';
import { WorkflowCanvas, useWorkflowState } from '../WorkflowView';
import { getScenarioWorkflowDefaults } from '../WorkflowView/workflowScenarios';
import type { WorkflowPhase } from '../IntakeView/intakeChecklist';
import { WORKFLOW_PHASES } from '../IntakeView/intakeChecklist';
import type { Mode } from '../../state/types';
import type { VisitSubItemConfig } from '../../components/layout/PatientWorkspaceItem';

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
import { usePaneShortcuts } from '../../shortcuts/usePaneShortcuts';
import { captureViewStyles, captureViewAnimations } from './CaptureView.styles';
import { colors, spaceAround, spaceBetween, typography, LAYOUT, getRailTier } from '../../styles/foundations';
import { useContainerWidth } from '../../hooks/useContainerWidth';

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
  const mode = useCurrentMode();
  const { navigateToSection, canPopScope, scopeOriginLabel, popScope } = useNavigation();

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

  // Pane keyboard shortcuts (⌘\, ⌘], etc.)
  const { state: coordState, dispatch: coordDispatch } = useCoordination();
  usePaneShortcuts(coordState, coordDispatch);

  // AI Assistant state (content, context, loading — mode is now from coordination)
  const [aiState, aiActions] = useAIAssistant('encounter');

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('patient');
  const [todoViewState, setTodoViewState] = useState<ToDoViewState | null>(null);
  const [selectedNavItem, setSelectedNavItem] = useState<string>('');
  const [todoSearchQuery, setTodoSearchQuery] = useState<string>('');
  const [canvasScrolled, setCanvasScrolled] = useState(false);

  // Responsive rail — measure canvas grid container to derive rail tier
  const [gridWidth, gridRef] = useContainerWidth();
  const railTier = getRailTier(gridWidth);

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
    setSelectedNavItem('todo');
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
      setSelectedNavItem('todo');
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
      setTodoViewState(null);
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
    handleSuggestionAcceptWithChanges,
    handleSuggestionDismiss,
    handleTranscriptionToggle,
    handleModeChange,
    viewContext,
    setViewContext,
  } = useCaptureView();

  // AI Conversation state (canned queries/responses for demo)
  const aiConversation = useAIConversation('uc-cough', { onAddChartItem: handleItemAdd });

  // Merge ambient + follow-up suggestions into a single array
  const mergedSuggestions = useMemo(
    () => [...activeSuggestions, ...aiConversation.followUpSuggestions],
    [activeSuggestions, aiConversation.followUpSuggestions],
  );

  // Unified handlers that route by ID prefix (ai-fu- → follow-up, else → ambient)
  const handleMergedAccept = useCallback(
    (id: string) => {
      id.startsWith('ai-fu-')
        ? aiConversation.handleFollowUpAccept(id)
        : handleSuggestionAccept(id);
    },
    [aiConversation.handleFollowUpAccept, handleSuggestionAccept],
  );

  const handleMergedDismiss = useCallback(
    (id: string) => {
      id.startsWith('ai-fu-')
        ? aiConversation.handleFollowUpDismiss(id)
        : handleSuggestionDismiss(id);
    },
    [aiConversation.handleFollowUpDismiss, handleSuggestionDismiss],
  );

  const handleMergedAcceptWithChanges = useCallback(
    (id: string, data: Record<string, unknown>) => {
      id.startsWith('ai-fu-')
        ? aiConversation.handleFollowUpAcceptWithChanges(id, data)
        : handleSuggestionAcceptWithChanges(id, data);
    },
    [aiConversation.handleFollowUpAcceptWithChanges, handleSuggestionAcceptWithChanges],
  );

  // Rail navigation hub — deep-linking from unified rail rows to Process/Review sections
  const handleRailRowTap = useCallback((deepLink: { mode: 'review' | 'process'; sectionId: string }) => {
    navigateToSection(deepLink.mode, deepLink.sectionId);
    handleModeChange(deepLink.mode);
  }, [navigateToSection, handleModeChange]);

  // Workflow state (phases, sections, accordion)
  const workflowState = useWorkflowState();

  // Handle workspace tab click (after workflowState/setViewContext are available)
  const handleTabClick = useCallback((patientId: string, tabId: string) => {
    workspace.switchTab(patientId, tabId);
    setSelectedNavItem(`patient-${patientId}`);

    // Location forwarding: auto-set viewContext based on visit tab workflow phase
    const ws = workspace.getWorkspace(patientId);
    const tab = ws?.tabs.find(t => t.id === tabId);
    if (tab?.type === 'visit') {
      const phase = workflowState.activePhase;
      setViewContext(phase === 'checkout' ? 'charting' : 'workflow');
    }

    setViewMode('patient');
    setTodoViewState(null);
    todoNav.clearNavigation();
  }, [workspace, workflowState.activePhase, setViewContext, todoNav]);

  // Listen for context-dependent segment shortcuts (1/2/3)
  const MODES_BY_INDEX: Mode[] = ['capture', 'process', 'review'];
  const PHASES_BY_INDEX: WorkflowPhase[] = ['check-in', 'triage', 'checkout'];
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const { index } = (e as CustomEvent).detail;
      if (index < 1 || index > 3) return;
      if (viewContext === 'workflow') {
        workflowState.setActivePhase(PHASES_BY_INDEX[index - 1]);
      } else {
        handleModeChange(MODES_BY_INDEX[index - 1]);
      }
    };
    window.addEventListener('ehr:context-segment', handler);
    return () => window.removeEventListener('ehr:context-segment', handler);
  }, [viewContext, handleModeChange, workflowState.setActivePhase]);

  // Patient and encounter context
  const patient = state.context.patient;
  const encounter = state.context.encounter;

  // Vitals items from chart state (seeded by EncounterLoader)
  const encounterVitals = useMemo(
    () => items.filter((item): item is VitalsItem => item.category === 'vitals'),
    [items],
  );

  // Triage narrative/PE items from chart state (seeded by EncounterLoader)
  const ccItem = useMemo(
    () => items.find((item): item is NarrativeItem => item.category === 'chief-complaint'),
    [items],
  );
  const hpiItem = useMemo(
    () => items.find((item): item is NarrativeItem => item.category === 'hpi'),
    [items],
  );
  const rosItem = useMemo(
    () => items.find((item): item is NarrativeItem => item.category === 'ros'),
    [items],
  );
  const peItems = useMemo(
    () => items.filter((item): item is PhysicalExamItem => item.category === 'physical-exam'),
    [items],
  );
  // Initialize workflow state from scenario defaults on encounter load
  useEffect(() => {
    if (!encounter?.id) return;
    const defaults = getScenarioWorkflowDefaults(encounter.id);
    workflowState.initFromScenario(defaults.completedPhases, defaults.activePhase);
    setViewContext(defaults.activeView);
  }, [encounter?.id]);

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
        // Add Visit tab for encounter patient with date prefix
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
  }, [patient?.mrn, patientOverviewData.name, workspace, encounter]);

  // Auto-initialize selectedNavItem when patient loads
  useEffect(() => {
    if (patient && !selectedNavItem) {
      setSelectedNavItem(`patient-${patient.mrn}`);
    }
  }, [patient?.mrn, selectedNavItem]);

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
        tabRecordingStatuses: {},
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

      // Build visit sub-items for encounter patient's visit tabs
      const visitSubItems: VisitSubItemConfig[] = isCurrentPatient
        ? ws.tabs
            .filter((t) => t.type === 'visit')
            .map((t) => {
              // Determine workflow badge based on active phase and completion
              const phaseMeta = WORKFLOW_PHASES.find((p) => p.key === workflowState.activePhase);
              const allComplete = WORKFLOW_PHASES.every((p) => workflowState.completedPhases.has(p.key));
              const workflowBadge: VisitSubItemConfig['workflowBadge'] = allComplete
                ? { text: 'Complete', colorScheme: 'positive' }
                : phaseMeta
                ? { text: phaseMeta.label, colorScheme: viewContext === 'workflow' ? 'attention' : 'accent' }
                : undefined;
              return {
                visitTabId: t.id,
                activeSubItem: viewContext,
                workflowBadge,
                onSubItemClick: (view) => {
                  setViewContext(view);
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
  }, [patient, patientOverviewData.name, workspace.workspaces, state.context.visit, encounter, transcriptionStatus, viewContext, workflowState.activePhase, workflowState.completedPhases]);

  // Canvas header content - contextual controls for encounters
  const currentUser = state.session.currentUser;
  const visit = state.context.visit;

  // Build segments for the context-dependent SegmentedControl
  const chartSegments: Segment<Mode>[] = [
    { key: 'capture', label: 'Capture' },
    { key: 'process', label: 'Process' },
    { key: 'review', label: 'Review' },
  ];

  const workflowSegments: Segment<WorkflowPhase>[] = WORKFLOW_PHASES.map((p) => ({
    key: p.key,
    label: p.label,
    badge: workflowState.completedPhases.has(p.key)
      ? <Check size={12} color={colors.fg.positive.primary} />
      : undefined,
  }));

  const canvasHeaderContent = viewContext === 'workflow'
    ? (
      <SegmentedControl<WorkflowPhase>
        segments={workflowSegments}
        value={workflowState.activePhase}
        onChange={workflowState.setActivePhase}
        variant="topBar"
      />
    )
    : (
      <SegmentedControl<Mode>
        segments={chartSegments}
        value={state.session.mode}
        onChange={handleModeChange}
        variant="topBar"
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

  // Patient identity content for floating nav row (shown when overview collapsed)
  const collapsedIdentityContent = selectedPatientOverviewData && selectedPatient ? (
    <PatientIdentityHeader
      name={selectedPatientOverviewData.name}
      mrn={selectedPatient.mrn}
      dob={selectedPatientOverviewData.dob}
      age={selectedPatient.demographics.age}
      gender={selectedPatient.demographics.gender}
      pronouns={selectedPatient.demographics.pronouns}
      variant="stacked"
      showMenuButton={false}
    />
  ) : undefined;

  // Canvas pane internal header
  const canvasPaneHeader = (
    <EncounterContextBar
      encounter={encounter}
      specialty={encounter.specialty}
      chiefComplaint={visit?.chiefComplaint}
      providerName={currentUser?.name}
      providerCredentials={currentUser?.credentials?.join(', ')}
    />
  );

  // Compact canvas header for collapsed state
  const compactCanvasHeader = (
    <EncounterContextBar
      encounter={encounter}
      specialty={encounter.specialty}
      chiefComplaint={visit?.chiefComplaint}
      providerName={currentUser?.name}
      compact
    />
  );

  // Encounter context shown in nav row when canvas scrolls past the in-canvas context bar.
  // Styled identically to PatientIdentityHeader stacked variant (15px semibold name / 12px meta).
  const scrolledCanvasContent = useMemo(() => {
    if (!canvasScrolled || !encounter) return undefined;

    // Build the same date · provider · status line that compact EncounterContextBar shows
    const dateSource = encounter.scheduledAt || encounter.startedAt;
    const dateStr = dateSource
      ? `${dateSource.getMonth() + 1}/${dateSource.getDate()}/${dateSource.getFullYear()}`
      : undefined;
    const provider = currentUser?.name
      ? (currentUser.credentials ? `${currentUser.name}, ${currentUser.credentials.join(', ')}` : currentUser.name)
      : undefined;
    const statusLabel = encounter.status.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

    const metaParts = [dateStr, provider, statusLabel].filter(Boolean);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.coupled, minWidth: 0 }}>
        <div style={{
          fontSize: 15,
          fontFamily: typography.fontFamily.sans,
          fontWeight: typography.fontWeight.semibold,
          color: colors.fg.neutral.primary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {visit?.chiefComplaint || encounter.type || 'Visit'}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spaceBetween.coupled,
          fontSize: 12,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.secondary,
          whiteSpace: 'nowrap',
        }}>
          {metaParts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: colors.fg.neutral.disabled }}>&middot;</span>}
              <span>{part}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }, [canvasScrolled, encounter, currentUser, visit?.chiefComplaint]);

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
              selectedToDoFilter: todoViewState && !selectedNavItem.startsWith('patient-')
                ? `${todoViewState.categoryId}/${todoViewState.filterId}`
                : undefined,
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
        scrolledCanvasContent={viewMode === 'patient' && isViewingEncounterPatient ? scrolledCanvasContent : undefined}
        collapsedIdentityContent={viewMode === 'patient' && collapsedIdentityContent ? collapsedIdentityContent : undefined}
        canvasViewMode={viewMode !== 'patient' ? 'list' : 'standard'}
        canvasViewTitle={currentCategory?.label}
        canvasViewCount={filteredTodoCount}
        searchQuery={todoSearchQuery}
        onSearchChange={setTodoSearchQuery}
        onBack={handleNavBack}
        canvasPane={
          <CanvasPane
            headerContent={undefined}
            compactHeaderContent={undefined}
            onScrolledChange={setCanvasScrolled}
          >
            {/* Workflow canvas */}
            {viewContext === 'workflow' && (
              <WorkflowCanvas
                phase={workflowState.activePhase}
                workflowState={workflowState}
                encounter={encounter}
                specialty={encounter.specialty}
                chiefComplaint={visit?.chiefComplaint}
                providerName={currentUser?.name}
                providerCredentials={currentUser?.credentials?.join(', ')}
                room={encounter.room}
                payer={patient.insurance?.primary?.payerName}
                groupName={patient.insurance?.primary?.groupName}
                caseId={encounter.caseId}
                tags={encounter.tags}
                locked={encounter.locked}
              />
            )}

            {/* Process/Review canvas when in non-capture mode */}
            {viewContext === 'charting' && mode === 'process' && <ProcessCanvas />}
            {viewContext === 'charting' && mode === 'review' && <ReviewCanvas />}

            {/* Capture mode content */}
            {viewContext === 'charting' && mode === 'capture' && viewMode === 'todo-list' && todoViewState && currentCategory && (
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
            {viewContext === 'charting' && mode === 'capture' && viewMode === 'todo-detail' && todoViewState?.selectedItem && (
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
            {viewContext === 'charting' && mode === 'capture' && viewMode === 'patient' && (() => {
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

              // Render scope return bar (drill-through from cohort) or context bar (To-Do navigation).
              // ScopeReturnBar takes precedence over ContextBar when both apply.
              const contextBar = canPopScope && scopeOriginLabel ? (
                <ScopeReturnBar
                  originLabel={scopeOriginLabel}
                  onReturn={popScope}
                  testID="scope-return-bar"
                />
              ) : todoNav.shouldShowContextBar ? (
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

                // Current encounter patient - show chart items + processing rail
                return (
                  <>
                    {contextBar}
                    <div ref={gridRef} style={{
                      display: 'grid',
                      gridTemplateColumns: railTier === 'full' ? 'minmax(0, 1fr) auto' : '1fr',
                      gridTemplateRows: 'auto auto 1fr',
                      flex: 1,
                      minHeight: 0,
                      columnGap: railTier === 'full' ? spaceAround.defaultPlus : 0,
                    }}>
                      <EncounterContextBar
                        encounter={encounter}
                        specialty={encounter.specialty}
                        chiefComplaint={visit?.chiefComplaint}
                        providerName={currentUser?.name}
                        providerCredentials={currentUser?.credentials?.join(', ')}
                        room={encounter.room}
                        payer={patient.insurance?.primary?.payerName}
                        groupName={patient.insurance?.primary?.groupName}
                        caseId={encounter.caseId}
                        tags={encounter.tags}
                        locked={encounter.locked}
                        style={{ paddingLeft: 0, paddingRight: 0, gridColumn: 1, gridRow: 1 }}
                      />

                      {/* Triage module — between context bar and chart items */}
                      <div style={{
                        ...captureViewStyles.contentWrapper,
                        gridColumn: 1, gridRow: 2,
                        marginBottom: spaceBetween.repeating,
                      }}>
                        {railTier === 'float' && (
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spaceBetween.repeating }}>
                            <RailFloatingStatus onTap={() => handleModeChange('process')} />
                          </div>
                        )}
                        <TriageModule
                          vitals={encounterVitals}
                          chiefComplaint={visit?.chiefComplaint}
                          ccItem={ccItem}
                          hpiItem={hpiItem}
                          rosItem={rosItem}
                          peItems={peItems}
                          onItemClick={(itemId) => handleItemSelect(itemId)}
                        />
                      </div>

                      <div style={{
                        ...captureViewStyles.contentWrapper,
                        gridColumn: 1, gridRow: 3,
                        minWidth: 0, overflowY: 'auto', paddingBottom: 80,
                      }}>
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
                        <div style={{ marginTop: spaceAround.spacious }}>
                          <OmniAddBar onItemAdd={handleItemAdd} onUndo={handleUndo} />
                        </div>
                      </div>

                      {/* Processing Rail — spans rows 2-3, sticky to stay visible */}
                      {railTier === 'full' && (
                        <div style={{
                          gridColumn: 2, gridRow: '2 / -1', alignSelf: 'start',
                          position: 'sticky', top: LAYOUT.headerHeight + LAYOUT.canvasContentPadding,
                          display: 'flex', flexDirection: 'column', gap: spaceBetween.repeating,
                        }}>
                          <ProcessingRail
                            onRowTap={handleRailRowTap}
                          />
                        </div>
                      )}
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

              // Fallback - show overview with processing rail
              return (
                <>
                  {contextBar}
                  <div ref={gridRef} style={{
                    display: 'grid',
                    gridTemplateColumns: railTier === 'full' ? 'minmax(0, 1fr) auto' : '1fr',
                    gridTemplateRows: 'auto auto 1fr',
                    flex: 1,
                    minHeight: 0,
                    columnGap: railTier === 'full' ? spaceAround.defaultPlus : 0,
                  }}>
                    <EncounterContextBar
                      encounter={encounter}
                      specialty={encounter.specialty}
                      chiefComplaint={visit?.chiefComplaint}
                      providerName={currentUser?.name}
                      providerCredentials={currentUser?.credentials?.join(', ')}
                      room={encounter.room}
                      payer={patient.insurance?.primary?.payerName}
                      groupName={patient.insurance?.primary?.groupName}
                      caseId={encounter.caseId}
                      tags={encounter.tags}
                      locked={encounter.locked}
                      style={{ paddingLeft: 0, paddingRight: 0, gridColumn: 1, gridRow: 1 }}
                    />

                    {/* Triage module */}
                    <div style={{
                      ...captureViewStyles.contentWrapper,
                      gridColumn: 1, gridRow: 2,
                      marginBottom: spaceBetween.repeating,
                    }}>
                      {railTier === 'float' && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spaceBetween.repeating }}>
                          <RailFloatingStatus onTap={() => handleModeChange('process')} />
                        </div>
                      )}
                      <TriageModule
                        vitals={encounterVitals}
                        chiefComplaint={visit?.chiefComplaint}
                        ccItem={ccItem}
                        hpiItem={hpiItem}
                        rosItem={rosItem}
                        peItems={peItems}
                        onItemClick={(itemId) => handleItemSelect(itemId)}
                      />
                    </div>

                    <div style={{
                      ...captureViewStyles.contentWrapper,
                      gridColumn: 1, gridRow: 3,
                      minWidth: 0, overflowY: 'auto', paddingBottom: 80,
                    }}>
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
                      <div style={{ marginTop: spaceAround.spacious }}>
                        <OmniAddBar onItemAdd={handleItemAdd} onUndo={handleUndo} />
                      </div>
                    </div>

                    {/* Processing Rail — spans rows 2-3, sticky to stay visible */}
                    {railTier === 'full' && (
                      <div style={{
                        gridColumn: 2, gridRow: '2 / -1', alignSelf: 'start',
                        position: 'sticky', top: LAYOUT.headerHeight + LAYOUT.canvasContentPadding,
                        display: 'flex', flexDirection: 'column', gap: spaceBetween.repeating,
                      }}>
                        <ProcessingRail
                          onRowTap={handleRailRowTap}
                        />
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </CanvasPane>
        }
        aiControlSurface={
          <BottomBarContainer
            aiContent={enrichedContent}
            suggestions={mergedSuggestions}
            onSuggestionAccept={handleMergedAccept}
            onSuggestionDismiss={handleMergedDismiss}
            onSuggestionAcceptWithChanges={handleMergedAcceptWithChanges}
            patientName={patientOverviewData.name}
            contextTarget={{ type: 'encounter', label: state.context.visit?.chiefComplaint || encounter?.type || 'Visit' }}
            availableContextLevels={['encounter', 'patient', 'section']}
            quickActions={aiActions.getQuickActions()}
            onQuickActionClick={aiConversation.handleQuickAction}
            onSend={aiConversation.sendMessage}
            paletteResponse={aiConversation.paletteResponse}
            nonChartFollowUps={aiConversation.nonChartFollowUps}
            onNonChartAction={aiConversation.handleNonChartAction}
            onClearResponse={aiConversation.clearPaletteResponse}
            cannedQueries={aiConversation.cannedQueries.map(q => q.text)}
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
