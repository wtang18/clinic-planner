/**
 * CohortContextPane Component
 *
 * Center pane for cohort scope — identity parity with PatientOverviewPane.
 * Shows cohort identity header, Overview/Activity tabs, and per-tab content.
 *
 * Overview tab: Dashboard metrics + alerts, LayerTree (branch-only indented).
 * Activity tab: CohortActivityFeed with temporal cohort events.
 *
 * Supports both controlled and uncontrolled tab state, same pattern as
 * PatientOverviewPane. The `hideHeader` prop suppresses the identity header
 * when it's already shown in the floating nav row.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Users } from 'lucide-react';
import { SegmentedControl } from '../primitives/SegmentedControl';
import { Dashboard } from './Dashboard';
import { LayerTree } from './LayerTree';
import { CohortActivityFeed } from './CohortActivityFeed';
import { usePopHealth } from '../../context/PopHealthContext';
import {
  getCohortById,
  getMetricsForPathway,
  getMetricsForCohort,
  getAlertsForPathway,
  DASHBOARD_ALERTS,
} from '../../data/mock-population-health';
import type { DashboardAlert, CohortCategory } from '../../types/population-health';
import { colors, spaceAround, spaceBetween, typography, borderRadius, LAYOUT } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type CohortTab = 'overview' | 'activity';

export interface CohortContextPaneProps {
  /** ID of the cohort to display */
  cohortId: string;
  /** Initial active tab (uncontrolled) */
  defaultTab?: CohortTab;
  /** Controlled active tab */
  activeTab?: CohortTab;
  /** Called when tab changes */
  onTabChange?: (tab: CohortTab) => void;
  /** Hide the identity header (when shown in floating nav row) */
  hideHeader?: boolean;
  /** Whether to show the tab control (default true) */
  showTabs?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const CATEGORY_LABELS: Record<CohortCategory, string> = {
  'chronic-disease': 'Chronic Disease',
  'preventive-care': 'Preventive Care',
  'risk-tiers': 'Risk Tiers',
  'care-transitions': 'Care Transitions',
  'custom': 'Custom',
  'overview': 'Overview',
};

const TAB_SEGMENTS = [
  { key: 'overview', label: 'Overview' },
  { key: 'activity', label: 'Activity' },
];

// ============================================================================
// CohortIdentityHeader
// ============================================================================

interface CohortIdentityHeaderProps {
  name: string;
  patientCount: number;
  category: CohortCategory;
  variant?: 'stacked' | 'inline';
  style?: React.CSSProperties;
  testID?: string;
}

const CohortIdentityHeader: React.FC<CohortIdentityHeaderProps> = ({
  name,
  patientCount,
  category,
  variant = 'stacked',
  style,
  testID,
}) => {
  const isStacked = variant === 'stacked';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: isStacked ? 'flex-start' : 'center',
        gap: spaceBetween.relatedCompact,
        padding: `${spaceAround.compact}px ${LAYOUT.overviewContentPadding}px`,
        ...style,
      }}
      data-testid={testID}
    >
      {/* Cohort icon */}
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: isStacked ? 32 : 24,
        height: isStacked ? 32 : 24,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.bg.accent.subtle,
        color: colors.fg.accent.primary,
        flexShrink: 0,
      }}>
        <Users size={isStacked ? 16 : 14} />
      </span>

      {/* Info */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: isStacked ? 'column' : 'row',
        alignItems: isStacked ? 'flex-start' : 'center',
        gap: isStacked ? spaceBetween.coupled : spaceBetween.relatedCompact,
        minWidth: 0,
      }}>
        {/* Name */}
        <span style={{
          fontSize: isStacked ? 15 : 14,
          fontFamily: typography.fontFamily.sans,
          fontWeight: typography.fontWeight.semibold,
          color: colors.fg.neutral.primary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {name}
        </span>

        {/* Metadata row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spaceBetween.coupled,
          fontSize: 12,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.secondary,
        }}>
          <span>{patientCount} patients</span>
          <span>&middot;</span>
          <span>{CATEGORY_LABELS[category]}</span>
        </div>
      </div>
    </div>
  );
};

CohortIdentityHeader.displayName = 'CohortIdentityHeader';

// Re-export for use in floating nav row collapsed identity
export { CohortIdentityHeader };

// ============================================================================
// CohortContextPane Component
// ============================================================================

export const CohortContextPane: React.FC<CohortContextPaneProps> = ({
  cohortId,
  defaultTab = 'overview',
  activeTab: controlledActiveTab,
  onTabChange,
  hideHeader = false,
  showTabs = true,
  style,
  testID = 'cohort-context-pane',
}) => {
  const { state, dispatch } = usePopHealth();

  // Support both controlled and uncontrolled tab state
  const [internalTab, setInternalTab] = useState<CohortTab>(defaultTab);
  const currentTab = controlledActiveTab ?? internalTab;

  const handleTabChange = useCallback((tabId: string) => {
    const newTab = tabId as CohortTab;
    if (!controlledActiveTab) {
      setInternalTab(newTab);
    }
    onTabChange?.(newTab);
  }, [controlledActiveTab, onTabChange]);

  // Resolve cohort data
  const cohort = useMemo(() => getCohortById(cohortId), [cohortId]);

  // Compute dashboard metrics from context selection
  const dashboardMetrics = useMemo(() => {
    if (state.selectedPathwayIds.length === 1) {
      return getMetricsForPathway(state.selectedPathwayIds[0]);
    }
    return getMetricsForCohort(cohortId);
  }, [state.selectedPathwayIds, cohortId]);

  const dashboardAlerts = useMemo(() => {
    if (state.selectedPathwayIds.length === 1) {
      return getAlertsForPathway(state.selectedPathwayIds[0]);
    }
    return DASHBOARD_ALERTS.slice(0, 3);
  }, [state.selectedPathwayIds]);

  const handleAlertClick = useCallback((alert: DashboardAlert) => {
    if (alert.pathwayId) {
      dispatch({ type: 'PATHWAY_SELECTED', pathwayId: alert.pathwayId });
      if (alert.nodeId) {
        dispatch({ type: 'NODE_SELECTED', nodeId: alert.nodeId });
      }
    }
  }, [dispatch]);

  // Container
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.bg.neutral.min,
    overflow: 'hidden',
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

  // Empty state when cohort not found
  if (!cohort) {
    return (
      <div style={containerStyle} data-testid={testID}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spaceAround.default,
          color: colors.fg.neutral.spotReadable,
          fontSize: 14,
          fontFamily: typography.fontFamily.sans,
          textAlign: 'center',
        }}>
          Select a cohort to view details
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Cohort Identity Header — hidden when shown in floating nav row */}
      {!hideHeader && (
        <CohortIdentityHeader
          name={cohort.name}
          patientCount={cohort.patientCount}
          category={cohort.category}
          testID="cohort-identity-header"
        />
      )}

      {/* Tab bar */}
      {showTabs && (
        <div style={tabBarStyle}>
          <SegmentedControl
            segments={TAB_SEGMENTS}
            value={currentTab}
            onChange={handleTabChange as (key: string) => void}
            variant="inline"
            size="sm"
            testID="cohort-tabs"
          />
        </div>
      )}

      {/* Tab content */}
      {currentTab === 'overview' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ overflowY: 'auto', flexShrink: 0 }}>
            <Dashboard
              metrics={dashboardMetrics}
              alerts={dashboardAlerts}
              onAlertClick={handleAlertClick}
              testID="cohort-dashboard"
            />
          </div>
          <LayerTree />
        </div>
      ) : (
        <CohortActivityFeed
          cohortId={cohortId}
          testID="cohort-activity"
        />
      )}
    </div>
  );
};

CohortContextPane.displayName = 'CohortContextPane';
