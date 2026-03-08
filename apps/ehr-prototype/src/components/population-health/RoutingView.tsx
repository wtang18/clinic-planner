/**
 * RoutingView
 *
 * Canvas content for the Routing tab in the all-patients scope. Decomposes
 * the current dimension selection into cohort subgroup cards with care flow
 * node-level detail, bridging the Map view (comprehension) and Table view
 * (patient inspection).
 *
 * Cards are grouped by category (Chronic Disease, Preventive Care) and
 * sorted by attention priority. Each card shows patient counts, urgent/
 * action-needed indicators, average days waiting, and node concentration.
 * Clicking a card toggles the corresponding dimension filter.
 */

import React, { useMemo, useEffect, useRef, useState } from 'react';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { usePopHealth } from '../../context/PopHealthContext';
import { computeRoutingData, hasActiveSelection } from '../../utils/routing-computation';
import { RISK_TIER_LABELS, ACTION_STATUS_LABELS } from '../../utils/sankey-computation';
import { ALL_PATIENTS, CONDITION_COHORTS, PREVENTIVE_COHORTS, ROUTING_TO_COHORT_MAP } from '../../data/mock-all-patients';
import { colors, typography, spaceAround, spaceBetween, borderRadius, transitions, LAYOUT } from '../../styles/foundations';
import type { RoutingCohortCard, RoutingCategory, UnenrolledGroup, DimensionSelection, RiskTier, ActionStatus } from '../../types/population-health';

// ============================================================================
// Constants
// ============================================================================

const MAX_VISIBLE_NODES = 4;

// Color + opacity: top two tiers use vibrant bg.* colors at full opacity,
// lower tiers use neutral with descending opacity for progressive fade.
// Color + opacity: top two tiers use semantic bg colors at full opacity,
// lower tiers use neutral with descending opacity for progressive fade.
const RISK_TIER_STYLE: Record<RiskTier, { color: string; opacity: number }> = {
  critical:   { color: colors.bg.alert.high,      opacity: 1.0 },
  high:       { color: colors.bg.attention.medium, opacity: 1.0 },
  moderate:   { color: colors.fg.neutral.primary,  opacity: 0.40 },
  low:        { color: colors.fg.neutral.primary,  opacity: 0.22 },
  unassessed: { color: colors.fg.neutral.primary,  opacity: 0.10 },
};

const ACTION_STATUS_STYLE: Record<ActionStatus, { color: string; opacity: number }> = {
  urgent:          { color: colors.bg.alert.high,      opacity: 1.0 },
  'action-needed': { color: colors.bg.attention.medium, opacity: 1.0 },
  monitoring:      { color: colors.fg.neutral.primary,  opacity: 0.40 },
  'all-current':   { color: colors.fg.neutral.primary,  opacity: 0.22 },
  'not-enrolled':  { color: colors.fg.neutral.primary,  opacity: 0.10 },
};

// ============================================================================
// BreakdownBar — horizontal stacked bar with legend
// ============================================================================

const BreakdownBar: React.FC<{
  segments: { key: string; label: string; count: number; color: string; opacity: number }[];
  total: number;
  title: string;
}> = ({ segments, total, title }) => {
  const nonZero = segments.filter((s) => s.count > 0);
  if (nonZero.length === 0 || total === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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

      {/* Separated mini-bars */}
      <div style={{
        display: 'flex',
        gap: 4,
      }}>
        {nonZero.map((seg) => (
          <div
            key={seg.key}
            style={{
              flex: seg.count,
              height: 6,
              borderRadius: borderRadius.full,
              backgroundColor: seg.color,
              opacity: seg.opacity,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2px 8px',
      }}>
        {nonZero.map((seg) => (
          <span
            key={seg.key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontFamily: typography.fontFamily.sans,
              color: colors.fg.neutral.secondary,
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: borderRadius.full,
              backgroundColor: seg.color,
              opacity: seg.opacity,
              flexShrink: 0,
            }} />
            {seg.label} {seg.count}
          </span>
        ))}
      </div>
    </div>
  );
};

BreakdownBar.displayName = 'BreakdownBar';

// ============================================================================
// CategoryHeader
// ============================================================================

const CategoryHeader: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    padding: `0 ${spaceAround.default}px`,
  }}>
    {label}
  </div>
);

CategoryHeader.displayName = 'CategoryHeader';

// ============================================================================
// NodeLabel — interactive node name that navigates to cohort on click
// ============================================================================

const NodeLabel: React.FC<{
  nodeLabel: string;
  patientCount: number;
  onClick: (e: React.MouseEvent) => void;
}> = ({ nodeLabel, patientCount, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      style={{
        cursor: 'pointer',
        textDecoration: isHovered ? 'underline' : 'none',
        transition: `text-decoration ${transitions.fast}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {nodeLabel} ({patientCount})
    </span>
  );
};

NodeLabel.displayName = 'NodeLabel';

// ============================================================================
// CohortCard
// ============================================================================

const CohortCard: React.FC<{
  card: RoutingCohortCard;
  isSelected: boolean;
  showFilteredCount: boolean;
  onToggle: () => void;
  onNavigate: (cohortId: string) => void;
}> = ({ card, isSelected, showFilteredCount, onToggle, onNavigate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasAttention = card.urgentCount > 0 || card.actionNeededCount > 0;

  // Build attention summary parts
  const attentionParts: string[] = [];
  if (card.urgentCount > 0) attentionParts.push(`${card.urgentCount} urgent`);
  if (card.actionNeededCount > 0) attentionParts.push(`${card.actionNeededCount} action needed`);
  if (card.avgDaysWaiting > 0) attentionParts.push(`avg ${card.avgDaysWaiting}d`);

  // Patient count display
  const countLabel = showFilteredCount
    ? `${card.filteredPatients} of ${card.totalPatients} pts`
    : `${card.totalPatients} patients`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: spaceAround.default,
        backgroundColor: isSelected
          ? colors.bg.accent.subtle
          : isHovered
            ? colors.bg.neutral.low
            : colors.bg.neutral.subtle,
        borderRadius: borderRadius.sm,
        border: isSelected ? `1px solid ${colors.border.accent.medium}` : '1px solid transparent',
        cursor: 'pointer',
        transition: `all ${transitions.fast}`,
      }}
    >
      {/* Header row: name + count + chevron */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          flex: 1,
          fontSize: 14,
          fontFamily: typography.fontFamily.sans,
          fontWeight: typography.fontWeight.semibold,
          color: colors.fg.neutral.primary,
        }}>
          {card.cohortName}
        </span>
        <span style={{
          fontSize: 13,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.secondary,
          whiteSpace: 'nowrap',
        }}>
          {countLabel}
        </span>
        <ChevronRight
          size={16}
          color={colors.fg.neutral.spotReadable}
          style={{ flexShrink: 0, cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onNavigate(card.cohortId); }}
        />
      </div>

      {/* Attention summary */}
      {attentionParts.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 4,
          fontSize: 12,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.spotReadable,
        }}>
          {hasAttention && (
            <AlertTriangle size={12} color={colors.fg.attention.primary} style={{ flexShrink: 0 }} />
          )}
          <span>{attentionParts.join(' · ')}</span>
        </div>
      )}

      {/* Node concentration — labels are clickable deep links */}
      {card.nodeConcentration.length > 0 && (
        <div style={{
          marginTop: 4,
          fontSize: 12,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.secondary,
          lineHeight: 1.4,
        }}>
          {(isSelected ? card.nodeConcentration : card.nodeConcentration.slice(0, MAX_VISIBLE_NODES)).map((node, i) => (
            <span key={node.nodeLabel}>
              {i > 0 && ' · '}
              <NodeLabel
                nodeLabel={node.nodeLabel}
                patientCount={node.patientCount}
                onClick={(e) => { e.stopPropagation(); onNavigate(card.cohortId); }}
              />
            </span>
          ))}
          {!isSelected && card.nodeConcentration.length > MAX_VISIBLE_NODES && (
            <span style={{ color: colors.fg.neutral.spotReadable }}>
              {' '}+{card.nodeConcentration.length - MAX_VISIBLE_NODES} more
            </span>
          )}
        </div>
      )}

      {/* Expanded sections — visible when card is selected */}
      {isSelected && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginTop: 8,
          paddingTop: 8,
          borderTop: `1px solid ${colors.border.neutral.low}`,
        }}>
          <BreakdownBar
            title="Risk Level"
            total={card.filteredPatients}
            segments={(['critical', 'high', 'moderate', 'low', 'unassessed'] as RiskTier[]).map((tier) => ({
              key: tier,
              label: RISK_TIER_LABELS[tier],
              count: card.riskBreakdown[tier],
              color: RISK_TIER_STYLE[tier].color,
              opacity: RISK_TIER_STYLE[tier].opacity,
            }))}
          />

          <div style={{ borderTop: `1px solid ${colors.border.neutral.low}`, paddingTop: 8 }}>
            <BreakdownBar
              title="Action Status"
              total={card.filteredPatients}
              segments={(['urgent', 'action-needed', 'monitoring', 'all-current', 'not-enrolled'] as ActionStatus[]).map((status) => ({
                key: status,
                label: ACTION_STATUS_LABELS[status],
                count: card.actionStatusBreakdown[status],
                color: ACTION_STATUS_STYLE[status].color,
                opacity: ACTION_STATUS_STYLE[status].opacity,
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

CohortCard.displayName = 'CohortCard';

// ============================================================================
// UnenrolledCard
// ============================================================================

const UnenrolledCard: React.FC<{
  group: UnenrolledGroup;
  showFilteredCount: boolean;
  onNavigate: () => void;
}> = ({ group, showFilteredCount, onNavigate }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (group.totalCount === 0) return null;

  const highRiskCount = group.riskBreakdown.critical + group.riskBreakdown.high;
  const countLabel = showFilteredCount
    ? `${group.filteredCount} of ${group.totalCount} patients not enrolled`
    : `${group.totalCount} patients not enrolled`;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: spaceAround.default,
        backgroundColor: isHovered ? colors.bg.neutral.low : colors.bg.neutral.subtle,
        borderRadius: borderRadius.sm,
        border: '1px solid transparent',
        transition: `all ${transitions.fast}`,
      }}
    >
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          flex: 1,
          fontSize: 14,
          fontFamily: typography.fontFamily.sans,
          fontWeight: typography.fontWeight.semibold,
          color: colors.fg.neutral.primary,
        }}>
          {countLabel}
        </span>
        <ChevronRight
          size={16}
          color={colors.fg.neutral.spotReadable}
          style={{ flexShrink: 0, cursor: 'pointer' }}
          onClick={onNavigate}
        />
      </div>

      {/* Risk warning */}
      {highRiskCount > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 4,
          fontSize: 12,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.spotReadable,
        }}>
          <AlertTriangle size={12} color={colors.fg.attention.primary} style={{ flexShrink: 0 }} />
          <span>{highRiskCount} high/critical risk</span>
        </div>
      )}
    </div>
  );
};

UnenrolledCard.displayName = 'UnenrolledCard';

// ============================================================================
// RoutingView (main export)
// ============================================================================

export const RoutingView: React.FC = () => {
  const { state, dispatch } = usePopHealth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Compute routing data
  const routingData = useMemo(
    () => computeRoutingData(
      ALL_PATIENTS,
      CONDITION_COHORTS,
      PREVENTIVE_COHORTS,
      state.dimensionSelection,
    ),
    [state.dimensionSelection],
  );

  const isFiltered = hasActiveSelection(state.dimensionSelection);

  // Staged entrance: fade in after first paint
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Determine which cohort IDs are currently selected in the dimension selection
  const selectedCohortIds = useMemo(() => {
    const ids = new Set<string>();
    for (const id of state.dimensionSelection.conditions) ids.add(id);
    for (const id of state.dimensionSelection.preventive) ids.add(id);
    return ids;
  }, [state.dimensionSelection.conditions, state.dimensionSelection.preventive]);

  // Card click handler: toggle dimension
  const handleCardToggle = (cohortId: string, categoryKey: string) => {
    const axis: keyof DimensionSelection = categoryKey === 'chronic-disease' ? 'conditions' : 'preventive';
    dispatch({ type: 'DIMENSION_TOGGLED', axis, id: cohortId });
  };

  // Card chevron / node label: navigate into cohort (map routing ID → pathway ID)
  const handleNavigate = (routingCohortId: string) => {
    const cohortId = ROUTING_TO_COHORT_MAP[routingCohortId] ?? routingCohortId;
    dispatch({ type: 'ROUTING_NAVIGATED', cohortId });
  };

  // Unenrolled chevron: switch to Table view with "Not Enrolled" filter
  const handleUnenrolledNavigate = () => {
    dispatch({ type: 'ALL_PATIENTS_VIEW_CHANGED', view: 'table' });
    dispatch({ type: 'DIMENSION_TOGGLED', axis: 'actionStatuses', id: 'not-enrolled' });
  };

  // Empty state
  if (routingData.categories.length === 0 && routingData.unenrolled.filteredCount === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 12,
        padding: spaceAround.spacious,
        paddingTop: LAYOUT.headerHeight,
      }}>
        <span style={{
          fontSize: 15,
          fontFamily: typography.fontFamily.sans,
          fontWeight: typography.fontWeight.semibold,
          color: colors.fg.neutral.secondary,
        }}>
          No cohorts match the current selection
        </span>
        <span style={{
          fontSize: 13,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.spotReadable,
          textAlign: 'center',
          maxWidth: 300,
        }}>
          Adjust dimension filters or clear the selection to see routing cards.
        </span>
        <button
          type="button"
          onClick={() => dispatch({ type: 'DIMENSIONS_CLEARED' })}
          style={{
            height: 32,
            padding: '0 16px',
            borderRadius: borderRadius.sm,
            border: `1px solid ${colors.border.neutral.low}`,
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.accent.primary,
          }}
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflow: 'auto',
        paddingTop: LAYOUT.headerHeight + spaceAround.default,
        paddingLeft: spaceAround.default,
        paddingRight: spaceAround.default,
        paddingBottom: 80,
        opacity: visible ? 1 : 0,
        transition: `opacity 200ms ease`,
      }}
    >
      {routingData.categories.map((category, catIndex) => (
        <div
          key={category.key}
          style={{
            marginTop: catIndex > 0 ? spaceAround.spacious : 0,
          }}
        >
          <CategoryHeader label={category.label} />

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spaceBetween.repeating,
            marginTop: spaceBetween.related,
          }}>
            {category.cards.map((card) => (
              <CohortCard
                key={card.cohortId}
                card={card}
                isSelected={selectedCohortIds.has(card.cohortId)}
                showFilteredCount={isFiltered}
                onToggle={() => handleCardToggle(card.cohortId, category.key)}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Unenrolled section */}
      {(routingData.unenrolled.totalCount > 0) && (
        <div style={{ marginTop: spaceAround.spacious }}>
          <CategoryHeader label="Not in Any Care Flow" />
          <div style={{ marginTop: spaceBetween.related }}>
            <UnenrolledCard
              group={routingData.unenrolled}
              showFilteredCount={isFiltered}
              onNavigate={handleUnenrolledNavigate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

RoutingView.displayName = 'RoutingView';
