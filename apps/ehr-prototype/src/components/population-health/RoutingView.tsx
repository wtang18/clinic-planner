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
import { ALL_PATIENTS, CONDITION_COHORTS, PREVENTIVE_COHORTS } from '../../data/mock-all-patients';
import { colors, typography, spaceAround, spaceBetween, borderRadius, transitions, LAYOUT } from '../../styles/foundations';
import type { RoutingCohortCard, RoutingCategory, UnenrolledGroup, DimensionSelection } from '../../types/population-health';

// ============================================================================
// Constants
// ============================================================================

const MAX_VISIBLE_NODES = 4;

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
// CohortCard
// ============================================================================

const CohortCard: React.FC<{
  card: RoutingCohortCard;
  isSelected: boolean;
  showFilteredCount: boolean;
  onToggle: () => void;
}> = ({ card, isSelected, showFilteredCount, onToggle }) => {
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
          style={{ flexShrink: 0 }}
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

      {/* Node concentration */}
      {card.nodeConcentration.length > 0 && (
        <div style={{
          marginTop: 4,
          fontSize: 12,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.secondary,
          lineHeight: 1.4,
        }}>
          {card.nodeConcentration.slice(0, MAX_VISIBLE_NODES).map((node, i) => (
            <span key={node.nodeLabel}>
              {i > 0 && ' · '}
              <span>{node.nodeLabel} ({node.patientCount})</span>
            </span>
          ))}
          {card.nodeConcentration.length > MAX_VISIBLE_NODES && (
            <span style={{ color: colors.fg.neutral.spotReadable }}>
              {' '}+{card.nodeConcentration.length - MAX_VISIBLE_NODES} more
            </span>
          )}
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
}> = ({ group, showFilteredCount }) => {
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
          style={{ flexShrink: 0 }}
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
        paddingBottom: spaceAround.spacious,
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
            gap: spaceBetween.related,
            marginTop: spaceBetween.related,
          }}>
            {category.cards.map((card) => (
              <CohortCard
                key={card.cohortId}
                card={card}
                isSelected={selectedCohortIds.has(card.cohortId)}
                showFilteredCount={isFiltered}
                onToggle={() => handleCardToggle(card.cohortId, category.key)}
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
            />
          </div>
        </div>
      )}
    </div>
  );
};

RoutingView.displayName = 'RoutingView';
