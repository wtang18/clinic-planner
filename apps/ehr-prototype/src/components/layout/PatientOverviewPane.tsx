/**
 * PatientOverviewPane Component
 *
 * Patient context pane with longitudinal data sections.
 * Shows patient identity and collapsible clinical summary sections.
 * Supports Overview and Activity tabs via segmented control.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { colors, spaceAround, spaceBetween, LAYOUT } from '../../styles/foundations';
import { SegmentedControl } from '../primitives/SegmentedControl';
import type { Segment } from '../primitives/SegmentedControl';
import { PatientIdentityHeader } from './PatientIdentityHeader';
import { AllergiesSection, Allergy } from '../overview/AllergiesSection';
import { MedicationsSection, Medication } from '../overview/MedicationsSection';
import { ProblemsSection, Problem } from '../overview/ProblemsSection';
import { VitalsSection, Vital } from '../overview/VitalsSection';
import { ActivityTab, TimelineEvent } from '../overview/ActivityTab';
import type { ProtocolTabState } from '../../types/protocol';
import { ProtocolSearch } from '../protocol/ProtocolSearch';

// ============================================================================
// Types
// ============================================================================

export interface PatientOverviewData {
  /** Patient display name */
  name: string;
  /** Medical Record Number */
  mrn: string;
  /** Date of birth */
  dob: string;
  /** Age in years */
  age: number;
  /** Gender */
  gender: string;
  /** Pronouns (optional) */
  pronouns?: string;
  /** Allergies */
  allergies: Allergy[];
  /** Medications */
  medications: Medication[];
  /** Problems/conditions */
  problems: Problem[];
  /** Vitals */
  vitals: Vital[];
}

export type OverviewTab = 'overview' | 'activity' | 'protocol';

export interface PatientOverviewPaneProps {
  /** Patient data */
  patient?: PatientOverviewData;
  /** Timeline events for Activity tab */
  timelineEvents?: TimelineEvent[];
  /** Initial active tab */
  defaultTab?: OverviewTab;
  /** Controlled active tab */
  activeTab?: OverviewTab;
  /** Called when tab changes */
  onTabChange?: (tab: OverviewTab) => void;
  /** Called when patient identity is clicked */
  onPatientClick?: () => void;
  /** Called when MRN is copied */
  onCopyMrn?: () => void;
  /** Called when "Open full chart" is clicked */
  onOpenFullChart?: () => void;
  /** Called when a medication is clicked */
  onMedicationClick?: (medicationId: string) => void;
  /** Called when a problem is clicked */
  onProblemClick?: (problemId: string) => void;
  /** Called when a vital is clicked */
  onVitalClick?: (vitalId: string) => void;
  /** Called when a timeline event is clicked */
  onTimelineEventClick?: (eventId: string) => void;
  /** Whether to hide the internal header (if it's shown in floating nav row) */
  hideHeader?: boolean;
  /** Whether to show the tab control */
  showTabs?: boolean;
  /** Protocol tab visibility state (from coordination). Hidden = 2 tabs, else 3. */
  protocolTabState?: ProtocolTabState;
  /** Content to render when protocol tab is active (slot). */
  protocolContent?: React.ReactNode;
  /** Badge for the protocol tab segment ('check' for completed, null otherwise). */
  protocolBadge?: 'check' | null;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

/** Badge check for completed protocol tab. */
const ProtocolCheckBadge: React.FC = () => (
  <span style={{
    fontSize: 10,
    lineHeight: 1,
    color: colors.fg.positive.primary,
  }}>
    ✓
  </span>
);

/** Build tab segments dynamically based on protocol tab state. */
function getTabSegments(
  protocolTabState: ProtocolTabState | undefined,
  protocolBadge: 'check' | null | undefined
): Segment<OverviewTab>[] {
  const segments: Segment<OverviewTab>[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'activity', label: 'Activity' },
  ];

  if (protocolTabState && protocolTabState !== 'hidden') {
    segments.push({
      key: 'protocol',
      label: 'Protocols',
      badge: protocolBadge === 'check'
        ? React.createElement(ProtocolCheckBadge)
        : undefined,
    });
  }

  return segments;
}

export const PatientOverviewPane: React.FC<PatientOverviewPaneProps> = ({
  patient,
  timelineEvents,
  defaultTab = 'overview',
  activeTab: controlledActiveTab,
  onTabChange,
  onPatientClick,
  onCopyMrn,
  onOpenFullChart,
  onMedicationClick,
  onProblemClick,
  onVitalClick,
  onTimelineEventClick,
  hideHeader = false,
  showTabs = true,
  protocolTabState,
  protocolContent,
  protocolBadge,
  style,
  testID,
}) => {
  // Support both controlled and uncontrolled tab state
  const [internalTab, setInternalTab] = useState<OverviewTab>(defaultTab);
  const currentTab = controlledActiveTab ?? internalTab;

  const tabSegments = useMemo(
    () => getTabSegments(protocolTabState, protocolBadge),
    [protocolTabState, protocolBadge]
  );

  const handleTabChange = (tabId: string) => {
    const newTab = tabId as OverviewTab;
    if (!controlledActiveTab) {
      setInternalTab(newTab);
    }
    onTabChange?.(newTab);
  };

  // Listen for keyboard-driven tab cycling (from usePaneShortcuts → ehr:cycle-overview-tab)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      // Cycle through visible tabs (2 or 3 depending on protocol visibility)
      const tabKeys = tabSegments.map(s => s.key);
      const currentIndex = tabKeys.indexOf(currentTab);
      const next = tabKeys[(currentIndex + 1) % tabKeys.length];
      if (!controlledActiveTab) {
        setInternalTab(next);
      }
      onTabChange?.(next);
    };
    window.addEventListener('ehr:cycle-overview-tab', handler);
    return () => window.removeEventListener('ehr:cycle-overview-tab', handler);
  }, [currentTab, controlledActiveTab, onTabChange, tabSegments]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.bg.neutral.min,
    overflow: 'hidden',
    // Content starts below nav row
    paddingTop: LAYOUT.headerHeight,
    ...style,
  };

  const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    padding: `${spaceAround.compact}px ${LAYOUT.overviewContentPadding}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
  };

  const scrollContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  };

  const sectionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
    padding: LAYOUT.overviewContentPadding,
    paddingBottom: 80,
  };

  if (!patient) {
    return (
      <div style={containerStyle} data-testid={testID}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spaceAround.default,
            color: colors.fg.neutral.spotReadable,
            fontSize: 14,
            textAlign: 'center',
          }}
        >
          Select a patient to view their overview
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Patient Identity Header - only if not in floating nav row */}
      {!hideHeader && (
        <PatientIdentityHeader
          name={patient.name}
          mrn={patient.mrn}
          dob={patient.dob}
          age={patient.age}
          gender={patient.gender}
          pronouns={patient.pronouns}
          onPatientClick={onPatientClick}
          onCopyMrn={onCopyMrn}
          onOpenFullChart={onOpenFullChart}
        />
      )}

      {/* Tab bar */}
      {showTabs && (
        <div style={tabBarStyle}>
          <SegmentedControl<OverviewTab>
            segments={tabSegments}
            value={currentTab}
            onChange={handleTabChange as (key: OverviewTab) => void}
            variant="inline"
            size="sm"
            testID="overview-tabs"
          />
        </div>
      )}

      {/* Tab content */}
      {currentTab === 'overview' && (
        <div style={scrollContainerStyle}>
          <div style={sectionsContainerStyle}>
            {/* Allergies - Safety critical, always first */}
            <AllergiesSection
              allergies={patient.allergies}
              testID="allergies-section"
            />

            {/* Medications */}
            <MedicationsSection
              medications={patient.medications}
              onMedicationClick={onMedicationClick}
              testID="medications-section"
            />

            {/* Problems */}
            <ProblemsSection
              problems={patient.problems}
              onProblemClick={onProblemClick}
              testID="problems-section"
            />

            {/* Vitals */}
            <VitalsSection
              vitals={patient.vitals}
              onVitalClick={onVitalClick}
              testID="vitals-section"
            />
          </div>
        </div>
      )}
      {currentTab === 'activity' && (
        <ActivityTab
          events={timelineEvents}
          onEventClick={onTimelineEventClick}
          testID="activity-tab"
        />
      )}
      {currentTab === 'protocol' && (
        <div style={scrollContainerStyle} data-testid="protocol-tab">
          <div style={sectionsContainerStyle}>
            {protocolContent ?? (
              <ProtocolEmptyState />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

PatientOverviewPane.displayName = 'PatientOverviewPane';

/** Empty state shown when protocol tab is active but no protocol is loaded. */
const ProtocolEmptyState: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  }}>
    <ProtocolSearch testID="protocol-search" />
    <div style={{
      textAlign: 'center',
      padding: `${spaceAround.default}px 0`,
    }}>
      <div style={{
        fontSize: 14,
        fontWeight: 500,
        color: colors.fg.neutral.primary,
      }}>
        No active protocol
      </div>
      <div style={{
        fontSize: 13,
        color: colors.fg.neutral.spotReadable,
        lineHeight: 1.4,
        marginTop: spaceBetween.coupled,
      }}>
        Protocols appear here when clinical relevance is confirmed.
      </div>
    </div>
  </div>
);

// Re-export types for convenience
export type { Allergy } from '../overview/AllergiesSection';
export type { Medication } from '../overview/MedicationsSection';
export type { Problem } from '../overview/ProblemsSection';
export type { Vital, VitalReading } from '../overview/VitalsSection';
export type { TimelineEvent } from '../overview/ActivityTab';
