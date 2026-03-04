/**
 * useEncounterLayout Hook
 *
 * Extracts shared AdaptiveLayout wiring used by CaptureView, ProcessView,
 * and ReviewView. Provides patient overview, patient identity, mode selector,
 * and bottom bar — everything needed for the 3-pane encounter layout.
 *
 * View-specific concerns (transcription, workspaces, To-Do nav, AI drawers)
 * remain in CaptureView. Process/Review use this hook directly for a simpler setup.
 */

import React, { useMemo } from 'react';
import type { Mode } from '../state/types';
import { useEncounterState } from './useEncounterState';
import { useActiveSuggestions } from './useSuggestions';
import { useAIAssistant } from './useAIAssistant';
import { PatientOverviewPane } from '../components/layout/PatientOverviewPane';
import { PatientIdentityHeader } from '../components/layout/PatientIdentityHeader';
import { EncounterContextBar } from '../components/layout/EncounterContextBar';
import { ModeSelector } from '../components/layout/ModeSelector';
import { BottomBarContainer } from '../components/bottom-bar/BottomBarContainer';
import { MenuPane } from '../components/layout/MenuPane';
import { ViewIconsRow } from '../components/LeftPane';

// ============================================================================
// Hook
// ============================================================================

export function useEncounterLayout(
  handleModeChange: (mode: Mode) => void,
) {
  const state = useEncounterState();
  const activeSuggestions = useActiveSuggestions();
  const [aiState, aiActions] = useAIAssistant('encounter');

  const patient = state.context.patient;
  const encounter = state.context.encounter;

  // Helper to format dates
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    return date instanceof Date ? date.toLocaleDateString() : String(date);
  };

  // Build patient overview data
  const patientOverviewData = useMemo(() => {
    if (!patient) return null;
    const { demographics, clinicalSummary } = patient;
    return {
      name: demographics.preferredName
        ? `${demographics.preferredName} (${demographics.firstName}) ${demographics.lastName}`
        : `${demographics.firstName} ${demographics.lastName}`,
      mrn: patient.mrn,
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
      vitals: [] as Array<never>,
    };
  }, [patient]);

  const patientName = patientOverviewData?.name || '';

  // Overview pane
  const overviewPane = useMemo(() => {
    if (!patientOverviewData || !patient) return undefined;
    return React.createElement(PatientOverviewPane, {
      patient: patientOverviewData,
      onPatientClick: () => {},
      onCopyMrn: () => navigator.clipboard?.writeText(patient.mrn),
      hideHeader: true,
    });
  }, [patientOverviewData, patient]);

  // Overview header content (PatientIdentityHeader)
  const overviewHeaderContent = useMemo(() => {
    if (!patientOverviewData || !patient) return undefined;
    return React.createElement(PatientIdentityHeader, {
      name: patientOverviewData.name,
      mrn: patient.mrn,
      dob: patientOverviewData.dob,
      age: patient.demographics.age,
      gender: patient.demographics.gender,
      pronouns: patient.demographics.pronouns,
      onPatientClick: () => {},
      onCopyMrn: () => navigator.clipboard?.writeText(patient.mrn),
      variant: 'stacked',
      showMenuButton: false,
    });
  }, [patientOverviewData, patient]);

  // Canvas header content (ModeSelector)
  const canvasHeaderContent = useMemo(() => {
    return React.createElement(ModeSelector, {
      currentMode: state.session.mode,
      onModeChange: handleModeChange,
    });
  }, [state.session.mode, handleModeChange]);

  // Patient identity content for floating nav row (shown when overview collapsed)
  const collapsedIdentityContent = useMemo(() => {
    if (!patientOverviewData || !patient) return undefined;
    return React.createElement(PatientIdentityHeader, {
      name: patientOverviewData.name,
      mrn: patient.mrn,
      dob: patientOverviewData.dob,
      age: patient.demographics.age,
      gender: patient.demographics.gender,
      pronouns: patient.demographics.pronouns,
      variant: 'stacked' as const,
      showMenuButton: false,
    });
  }, [patientOverviewData, patient]);

  // AI control surface (BottomBarContainer)
  const aiControlSurface = useMemo(() => {
    return React.createElement(BottomBarContainer, {
      aiContent: aiState.content,
      suggestions: activeSuggestions,
      onSuggestionAccept: () => {},
      onSuggestionDismiss: () => {},
      patientName,
      contextTarget: {
        type: 'encounter' as const,
        label: state.context.visit?.chiefComplaint || encounter?.type || 'Visit',
      },
      availableContextLevels: ['encounter', 'patient', 'section'],
      onContextLevelChange: (level: string) => {},
      quickActions: aiActions.getQuickActions(),
      onQuickActionClick: (actionId: string) => {},
      transcriptionEnabled: true,
    });
  }, [aiState.content, activeSuggestions, patientName, state.context.visit, encounter, aiActions]);

  // Menu pane — simplified MenuPane with single patient workspace, no To-Do filters
  const menuPane = useMemo(() => {
    if (!patient || !patientOverviewData) return undefined;
    const patientWorkspaces = [{
      id: patient.mrn,
      name: patientOverviewData.name,
      initials: patient.demographics.firstName[0] + patient.demographics.lastName[0],
      currentVisit: state.context.visit?.chiefComplaint || encounter?.type,
    }];
    return React.createElement(MenuPane, {
      patientWorkspaces,
      selectedItemId: `patient-${patient.mrn}`,
      onNavItemSelect: () => {},
      onPatientSelect: () => {},
    });
  }, [patient, patientOverviewData, state.context.visit, encounter]);

  // Menu pane header content — view icons (menu only, no transcript)
  const menuPaneHeaderContent = useMemo(() => {
    return React.createElement(ViewIconsRow, {
      activeView: 'menu' as const,
      onViewChange: () => {},
      showTranscript: false,
    });
  }, []);

  // Canvas pane internal header — encounter context bar (visit type, provider, etc.)
  const canvasPaneHeader = useMemo(() => {
    if (!encounter) return undefined;
    const currentUser = state.session.currentUser;
    return React.createElement(EncounterContextBar, {
      encounter,
      chiefComplaint: state.context.visit?.chiefComplaint,
      providerName: currentUser?.name,
      providerCredentials: currentUser?.credentials?.join(', '),
    });
  }, [encounter, state.context.visit, state.session.currentUser]);

  // Compact canvas header for collapsed state
  const compactCanvasPaneHeader = useMemo(() => {
    if (!encounter) return undefined;
    const currentUser = state.session.currentUser;
    return React.createElement(EncounterContextBar, {
      encounter,
      chiefComplaint: state.context.visit?.chiefComplaint,
      providerName: currentUser?.name,
      compact: true,
    });
  }, [encounter, state.context.visit, state.session.currentUser]);

  return {
    overviewPane,
    overviewHeaderContent,
    canvasHeaderContent,
    collapsedIdentityContent,
    aiControlSurface,
    patientName,
    patientOverviewData,
    menuPane,
    menuPaneHeaderContent,
    canvasPaneHeader,
    compactCanvasPaneHeader,
  };
}
