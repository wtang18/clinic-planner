/**
 * AllPatientsContextPane
 *
 * Center pane for the all-patients scope. Shows:
 * 1. DynamicStatsModule — dashboard metrics from current selection
 * 2. DimensionSections — 4 collapsible sections with eye toggle + item rows
 *    (Conditions, Preventive, Risk Level, Action Status)
 */

import React, { useMemo, useState, useCallback } from 'react';
import { Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { CohortContextPane } from './CohortContextPane';
import { Dashboard } from './Dashboard';
import { computeSelectionStats, RISK_TIER_ORDER, ACTION_STATUS_ORDER, RISK_TIER_LABELS, ACTION_STATUS_LABELS } from '../../utils/sankey-computation';
import { computeSankeyData } from '../../utils/sankey-computation';
import { ALL_PATIENTS, CONDITION_COHORTS, PREVENTIVE_COHORTS } from '../../data/mock-all-patients';
import { colors, typography, spaceAround, spaceBetween, borderRadius, transitions, LAYOUT } from '../../styles/foundations';
import type { DimensionSelection, DashboardMetric, AxisVisibility, RiskTier, ActionStatus } from '../../types/population-health';

// ============================================================================
// DynamicStatsModule
// ============================================================================

const DynamicStatsModule: React.FC = () => {
  const { state } = usePopHealth();

  const stats = useMemo(
    () => computeSelectionStats(ALL_PATIENTS, state.dimensionSelection),
    [state.dimensionSelection],
  );

  const hasSelection =
    state.dimensionSelection.conditions.length > 0 ||
    state.dimensionSelection.preventive.length > 0 ||
    state.dimensionSelection.riskTiers.length > 0 ||
    state.dimensionSelection.actionStatuses.length > 0;

  const metrics: DashboardMetric[] = useMemo(() => [
    { id: 'ap-total', label: 'Total Patients', value: stats.totalPatients },
    { id: 'ap-attention', label: 'Needs Attention', value: stats.needsAttention },
    { id: 'ap-not-enrolled', label: 'Not Enrolled', value: stats.notEnrolled },
    { id: 'ap-enrollment', label: 'Enrollment Rate', value: stats.enrollmentRate },
  ], [stats]);

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: `${spaceAround.compact}px ${spaceAround.default}px ${spaceAround.tight}px`,
      }}>
        <span style={{
          fontSize: 11,
          fontFamily: typography.fontFamily.sans,
          fontWeight: typography.fontWeight.semibold,
          color: colors.fg.neutral.spotReadable,
          textTransform: 'uppercase' as const,
          letterSpacing: 0.5,
        }}>
          {stats.contextLabel}
        </span>
      </div>

      <Dashboard metrics={metrics} alerts={[]} testID="all-patients-stats" />

      {/* Investigate button */}
      <div style={{ padding: `0 ${spaceAround.default}px ${spaceAround.compact}px` }}>
        <button
          type="button"
          onClick={() => {/* future: open investigation modal */}}
          disabled={!hasSelection}
          style={{
            width: '100%',
            height: 32,
            borderRadius: borderRadius.sm,
            border: `1px solid ${colors.border.neutral.low}`,
            background: 'transparent',
            cursor: hasSelection ? 'pointer' : 'default',
            fontSize: 13,
            fontFamily: typography.fontFamily.sans,
            color: hasSelection ? colors.fg.neutral.secondary : colors.fg.neutral.spotReadable,
            opacity: hasSelection ? 1 : 0.5,
          }}
        >
          Investigate Selection…
        </button>
      </div>
    </div>
  );
};

DynamicStatsModule.displayName = 'DynamicStatsModule';

// ============================================================================
// DimensionSection — reusable collapsible section with eye toggle
// ============================================================================

interface DimensionItem {
  id: string;
  label: string;
  count: number;
}

interface DimensionSectionProps {
  title: string;
  items: DimensionItem[];
  selectedIds: string[];
  axisKey: keyof AxisVisibility;
  dimensionKey: keyof DimensionSelection;
  isVisible: boolean;
}

const DimensionSection: React.FC<DimensionSectionProps> = ({
  title,
  items,
  selectedIds,
  axisKey,
  dimensionKey,
  isVisible,
}) => {
  const { dispatch } = usePopHealth();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleEyeToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: 'AXIS_VISIBILITY_CHANGED', axis: axisKey, visible: !isVisible });
    },
    [dispatch, axisKey, isVisible],
  );

  const handleItemClick = useCallback(
    (id: string) => {
      dispatch({ type: 'DIMENSION_TOGGLED', axis: dimensionKey, id });
    },
    [dispatch, dimensionKey],
  );

  return (
    <div style={{
      borderTop: `1px solid ${colors.border.neutral.low}`,
    }}>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spaceAround.compact}px ${spaceAround.default}px`,
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.relatedCompact }}>
          {isExpanded
            ? <ChevronDown size={14} color={colors.fg.neutral.spotReadable} />
            : <ChevronRight size={14} color={colors.fg.neutral.spotReadable} />
          }
          <span style={{
            fontSize: 11,
            fontFamily: typography.fontFamily.sans,
            fontWeight: typography.fontWeight.semibold,
            color: colors.fg.neutral.spotReadable,
            textTransform: 'uppercase' as const,
            letterSpacing: 0.5,
          }}>
            {title}
          </span>
        </div>
        <button
          type="button"
          onClick={handleEyeToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
            color: isVisible ? colors.fg.neutral.primary : colors.fg.neutral.spotReadable,
          }}
          aria-label={isVisible ? `Hide ${title} axis` : `Show ${title} axis`}
          title={isVisible ? `Hide ${title} axis` : `Show ${title} axis`}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>

      {/* Item rows */}
      {isExpanded && (
        <div style={{ padding: `0 ${spaceAround.default}px ${spaceAround.compact}px` }}>
          {items.map((item) => {
            const selected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: 28,
                  padding: `0 ${spaceAround.tight}px`,
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer',
                  backgroundColor: selected ? colors.bg.accent.subtle : 'transparent',
                  transition: `background-color ${transitions.fast}`,
                }}
              >
                <span style={{
                  fontSize: 13,
                  fontFamily: typography.fontFamily.sans,
                  color: selected ? colors.fg.accent.primary : colors.fg.neutral.primary,
                  fontWeight: selected ? typography.fontWeight.medium : typography.fontWeight.regular,
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: 12,
                  fontFamily: typography.fontFamily.sans,
                  color: colors.fg.neutral.spotReadable,
                }}>
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

DimensionSection.displayName = 'DimensionSection';

// ============================================================================
// AllPatientsContextPane (main export)
// ============================================================================

export const AllPatientsContextPane: React.FC = () => {
  const { state } = usePopHealth();

  // When routing-navigated, delegate to cohort context pane
  if (state.routingTargetCohortId) {
    return <CohortContextPane cohortId={state.routingTargetCohortId} hideHeader />;
  }

  // Compute full Sankey data for counts (unfiltered — dimension counts should show full panel)
  const fullData = useMemo(
    () => computeSankeyData(ALL_PATIENTS, CONDITION_COHORTS, PREVENTIVE_COHORTS),
    [],
  );

  // Build dimension items
  const conditionItems: DimensionItem[] = useMemo(() => {
    const condGroup = fullData.leftAxis.find((g) => g.zone === 'conditions');
    return (condGroup?.bands ?? []).map((b) => ({
      id: b.id,
      label: b.label,
      count: b.count,
    }));
  }, [fullData]);

  const preventiveItems: DimensionItem[] = useMemo(() => {
    const prevGroup = fullData.leftAxis.find((g) => g.zone === 'preventive');
    return (prevGroup?.bands ?? []).map((b) => ({
      id: b.id,
      label: b.label,
      count: b.count,
    }));
  }, [fullData]);

  const riskItems: DimensionItem[] = useMemo(
    () => RISK_TIER_ORDER.map((tier) => {
      const band = fullData.centerAxis.find((b) => b.id === `risk-${tier}`);
      return { id: tier, label: RISK_TIER_LABELS[tier], count: band?.count ?? 0 };
    }),
    [fullData],
  );

  const actionItems: DimensionItem[] = useMemo(
    () => ACTION_STATUS_ORDER.map((status) => {
      const band = fullData.rightAxis.find((b) => b.id === `action-${status}`);
      return { id: status, label: ACTION_STATUS_LABELS[status], count: band?.count ?? 0 };
    }),
    [fullData],
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: colors.bg.neutral.min,
      overflow: 'hidden',
      paddingTop: LAYOUT.headerHeight,
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        <DynamicStatsModule />

        <DimensionSection
          title="Conditions"
          items={conditionItems}
          selectedIds={state.dimensionSelection.conditions}
          axisKey="conditions"
          dimensionKey="conditions"
          isVisible={state.axisVisibility.conditions}
        />

        <DimensionSection
          title="Preventive"
          items={preventiveItems}
          selectedIds={state.dimensionSelection.preventive}
          axisKey="preventive"
          dimensionKey="preventive"
          isVisible={state.axisVisibility.preventive}
        />

        <DimensionSection
          title="Risk Level"
          items={riskItems}
          selectedIds={state.dimensionSelection.riskTiers}
          axisKey="riskLevel"
          dimensionKey="riskTiers"
          isVisible={state.axisVisibility.riskLevel}
        />

        <DimensionSection
          title="Action Status"
          items={actionItems}
          selectedIds={state.dimensionSelection.actionStatuses}
          axisKey="actionStatus"
          dimensionKey="actionStatuses"
          isVisible={state.axisVisibility.actionStatus}
        />
      </div>
    </div>
  );
};

AllPatientsContextPane.displayName = 'AllPatientsContextPane';
