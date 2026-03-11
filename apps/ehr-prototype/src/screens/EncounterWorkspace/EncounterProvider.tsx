/**
 * EncounterProvider
 *
 * Context provider that encapsulates all encounter-level hook calls.
 * Sits between EncounterLoader (which provides TranscriptionProvider, store) and
 * AppShell (which reads encounter state for menu badges / layout routing).
 *
 * Both AppShell and EncounterWorkspace consume this context — AppShell for
 * menu wiring (workflow badges, transcription status), EncounterWorkspace for
 * canvas rendering (chart items, AI, processing rail).
 */

import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
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
import { selectCaptureViewData } from '../../state/selectors/views';
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useAIConversation } from '../../hooks/useAIConversation';
import { useCurrentMode, useNavigation } from '../../navigation/NavigationContext';
import { useWorkflowState } from '../WorkflowView';
import { getScenarioWorkflowDefaults } from '../WorkflowView/workflowScenarios';
import { useCaptureView } from '../CaptureView/useCaptureView';
import { usePaneShortcuts } from '../../shortcuts/usePaneShortcuts';
import { useContainerWidth } from '../../hooks/useContainerWidth';
import { getRailTier } from '../../styles/foundations';
import type { VitalsItem, NarrativeItem, PhysicalExamItem } from '../../types/chart-items';
import type { Mode } from '../../state/types';
import type { WorkflowPhase } from '../IntakeView/intakeChecklist';
import type { TranscriptSegment as DrawerTranscriptSegment } from '../../components/LeftPane';

// ============================================================================
// Context Type
// ============================================================================

export interface EncounterContextValue {
  // Store / identity
  state: ReturnType<typeof useEncounterState>;
  items: ReturnType<typeof useChartItems>;
  viewData: ReturnType<typeof selectCaptureViewData>;

  // Capture view hook (item actions, selection, mode, transcription toggle)
  captureView: ReturnType<typeof useCaptureView>;

  // AI + suggestions (merged ambient + follow-up)
  mergedSuggestions: import('../../types/suggestions').Suggestion[];
  handleMergedAccept: (id: string) => void;
  handleMergedDismiss: (id: string) => void;
  handleMergedAcceptWithChanges: (id: string, data: Record<string, unknown>) => void;
  aiState: ReturnType<typeof useAIAssistant>[0];
  aiActions: ReturnType<typeof useAIAssistant>[1];
  aiConversation: ReturnType<typeof useAIConversation>;

  // Transcription
  transcriptionStatus: ReturnType<typeof useTranscription>['status'];
  drawerSegments: DrawerTranscriptSegment[];
  startRecording: ReturnType<typeof useTranscription>['start'];
  pauseRecording: ReturnType<typeof useTranscription>['pause'];
  resumeRecording: ReturnType<typeof useTranscription>['resume'];
  stopRecording: ReturnType<typeof useTranscription>['stop'];
  recordingDuration: number;

  // Workflow
  workflowState: ReturnType<typeof useWorkflowState>;

  // Coordination + drawer
  coordState: ReturnType<typeof useCoordination>['state'];
  coordDispatch: ReturnType<typeof useCoordination>['dispatch'];
  paneState: ReturnType<typeof useDrawerCoordination>['paneState'];
  barState: ReturnType<typeof useDrawerCoordination>['barState'];
  barActions: ReturnType<typeof useDrawerCoordination>['barActions'];
  actions: ReturnType<typeof useDrawerCoordination>['actions'];
  activeSession: ReturnType<typeof useDrawerCoordination>['activeSession'];

  // Navigation
  mode: Mode | null;
  navigateToSection: (mode: Mode, sectionId: string) => void;
  canPopScope: boolean;
  scopeOriginLabel: string | null;
  popScope: () => void;

  // Derived encounter data
  activeSuggestions: ReturnType<typeof useActiveSuggestions>;
  openCareGaps: ReturnType<typeof useOpenCareGaps>;
  pendingReviewCount: ReturnType<typeof usePendingReviewCount>;
  encounterVitals: VitalsItem[];
  ccItem: NarrativeItem | undefined;
  hpiItem: NarrativeItem | undefined;
  peItems: PhysicalExamItem[];

  // Rail
  handleRailRowTap: (deepLink: { mode: 'review' | 'process'; sectionId: string }) => void;
  gridRef: React.RefCallback<HTMLDivElement>;
  railTier: 'full' | 'float';

  // Workspace + todo navigation
  workspace: ReturnType<typeof useWorkspace>;
  todoNav: ReturnType<typeof useToDoNavigation>;
  handleTabClick: (patientId: string, tabId: string) => void;
}

const EncounterContext = createContext<EncounterContextValue | null>(null);

// ============================================================================
// Hooks
// ============================================================================

export function useEncounterContext(): EncounterContextValue {
  const ctx = useContext(EncounterContext);
  if (!ctx) throw new Error('useEncounterContext must be used within EncounterProvider');
  return ctx;
}

export function useEncounterContextOptional(): EncounterContextValue | null {
  return useContext(EncounterContext);
}

// ============================================================================
// Provider
// ============================================================================

export const EncounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ---- Core encounter hooks ----
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

  // Drawer coordination
  const { paneState, barState, barActions, actions, activeSession } = useDrawerCoordination();

  // Pane keyboard shortcuts
  const { state: coordState, dispatch: coordDispatch } = useCoordination();
  usePaneShortcuts(coordState, coordDispatch);

  // AI Assistant
  const [aiState, aiActions] = useAIAssistant('encounter');

  // Responsive rail
  const [gridWidth, gridRef] = useContainerWidth();
  const railTier = getRailTier(gridWidth);

  // Capture view hook (item actions, selection, mode changes, transcription toggle)
  const captureView = useCaptureView();

  // AI Conversation (canned queries/responses)
  const aiConversation = useAIConversation('uc-cough', { onAddChartItem: captureView.handleItemAdd });

  // Merge ambient + follow-up suggestions
  const mergedSuggestions = useMemo(
    () => [...activeSuggestions, ...aiConversation.followUpSuggestions],
    [activeSuggestions, aiConversation.followUpSuggestions],
  );

  // Unified handlers that route by ID prefix
  const handleMergedAccept = useCallback(
    (id: string) => {
      id.startsWith('ai-fu-')
        ? aiConversation.handleFollowUpAccept(id)
        : captureView.handleSuggestionAccept(id);
    },
    [aiConversation.handleFollowUpAccept, captureView.handleSuggestionAccept],
  );

  const handleMergedDismiss = useCallback(
    (id: string) => {
      id.startsWith('ai-fu-')
        ? aiConversation.handleFollowUpDismiss(id)
        : captureView.handleSuggestionDismiss(id);
    },
    [aiConversation.handleFollowUpDismiss, captureView.handleSuggestionDismiss],
  );

  const handleMergedAcceptWithChanges = useCallback(
    (id: string, data: Record<string, unknown>) => {
      id.startsWith('ai-fu-')
        ? aiConversation.handleFollowUpAcceptWithChanges(id, data)
        : captureView.handleSuggestionAcceptWithChanges(id, data);
    },
    [aiConversation.handleFollowUpAcceptWithChanges, captureView.handleSuggestionAcceptWithChanges],
  );

  // Rail deep-linking
  const handleRailRowTap = useCallback((deepLink: { mode: 'review' | 'process'; sectionId: string }) => {
    navigateToSection(deepLink.mode, deepLink.sectionId);
    captureView.handleModeChange(deepLink.mode);
  }, [navigateToSection, captureView.handleModeChange]);

  // Workflow state
  const workflowState = useWorkflowState();

  // Workspace tab click (with location forwarding)
  const handleTabClick = useCallback((patientId: string, tabId: string) => {
    workspace.switchTab(patientId, tabId);

    const ws = workspace.getWorkspace(patientId);
    const tab = ws?.tabs.find(t => t.id === tabId);
    if (tab?.type === 'visit') {
      const phase = workflowState.activePhase;
      captureView.setViewContext(phase === 'checkout' ? 'charting' : 'workflow');
    }
  }, [workspace, workflowState.activePhase, captureView.setViewContext]);

  // Patient and encounter context
  const patient = state.context.patient;
  const encounter = state.context.encounter;

  // Derived clinical items
  const encounterVitals = useMemo(
    () => items.filter((item): item is VitalsItem => item.category === 'vitals'),
    [items],
  );
  const ccItem = useMemo(
    () => items.find((item): item is NarrativeItem => item.category === 'chief-complaint'),
    [items],
  );
  const hpiItem = useMemo(
    () => items.find((item): item is NarrativeItem => item.category === 'hpi'),
    [items],
  );
  const peItems = useMemo(
    () => items.filter((item): item is PhysicalExamItem => item.category === 'physical-exam'),
    [items],
  );

  // Initialize workflow from scenario defaults
  useEffect(() => {
    if (!encounter?.id) return;
    const defaults = getScenarioWorkflowDefaults(encounter.id);
    workflowState.initFromScenario(defaults.completedPhases, defaults.activePhase);
    captureView.setViewContext(defaults.activeView);
  }, [encounter?.id]);

  // Create transcription session
  useEffect(() => {
    if (patient && encounter && !activeSession) {
      const name = patient.demographics.preferredName
        ? `${patient.demographics.preferredName} (${patient.demographics.firstName}) ${patient.demographics.lastName}`
        : `${patient.demographics.firstName} ${patient.demographics.lastName}`;
      barActions.createSession(encounter.id || 'enc-current', {
        id: patient.mrn,
        name,
        initials: patient.demographics.firstName[0] + patient.demographics.lastName[0],
      });
    }
  }, [patient?.mrn, encounter]);

  // Context-dependent segment shortcuts (1/2/3)
  const MODES_BY_INDEX: Mode[] = ['capture', 'process', 'review'];
  const PHASES_BY_INDEX: WorkflowPhase[] = ['check-in', 'triage', 'checkout'];
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const { index } = (e as CustomEvent).detail;
      if (index < 1 || index > 3) return;
      if (captureView.viewContext === 'workflow') {
        workflowState.setActivePhase(PHASES_BY_INDEX[index - 1]);
      } else {
        captureView.handleModeChange(MODES_BY_INDEX[index - 1]);
      }
    };
    window.addEventListener('ehr:context-segment', handler);
    return () => window.removeEventListener('ehr:context-segment', handler);
  }, [captureView.viewContext, captureView.handleModeChange, workflowState.setActivePhase]);

  // ---- Assemble context value ----
  const value = useMemo<EncounterContextValue>(() => ({
    state,
    items,
    viewData,
    captureView,
    mergedSuggestions,
    handleMergedAccept,
    handleMergedDismiss,
    handleMergedAcceptWithChanges,
    aiState,
    aiActions,
    aiConversation,
    transcriptionStatus,
    drawerSegments,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    recordingDuration,
    workflowState,
    coordState,
    coordDispatch,
    paneState,
    barState,
    barActions,
    actions,
    activeSession,
    mode,
    navigateToSection,
    canPopScope,
    scopeOriginLabel,
    popScope,
    activeSuggestions,
    openCareGaps,
    pendingReviewCount,
    encounterVitals,
    ccItem,
    hpiItem,
    peItems,
    handleRailRowTap,
    gridRef,
    railTier,
    workspace,
    todoNav,
    handleTabClick,
  }), [
    state, items, viewData, captureView,
    mergedSuggestions, handleMergedAccept, handleMergedDismiss, handleMergedAcceptWithChanges,
    aiState, aiActions, aiConversation,
    transcriptionStatus, drawerSegments, startRecording, pauseRecording, resumeRecording, stopRecording, recordingDuration,
    workflowState,
    coordState, coordDispatch, paneState, barState, barActions, actions, activeSession,
    mode, navigateToSection, canPopScope, scopeOriginLabel, popScope,
    activeSuggestions, openCareGaps, pendingReviewCount,
    encounterVitals, ccItem, hpiItem, peItems,
    handleRailRowTap, gridRef, railTier,
    workspace, todoNav, handleTabClick,
  ]);

  return (
    <EncounterContext.Provider value={value}>
      {children}
    </EncounterContext.Provider>
  );
};

EncounterProvider.displayName = 'EncounterProvider';
