/**
 * CareGapList Component
 *
 * Grouped list of care gaps for patient overview.
 */

import React from 'react';
import type { CareGapInstance, CareGapCategory, CareGapExclusionReason } from '../../types/care-gaps';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { CareGapCard, type ClosureAction } from './CareGapCard';
import { Badge } from '../primitives/Badge';

// ============================================================================
// Types
// ============================================================================

export interface CareGapListProps {
  /** The care gaps to display */
  gaps: CareGapInstance[];
  /** How to group the gaps */
  groupBy?: 'category' | 'priority' | 'status';
  /** Called when an action is taken */
  onAction: (gapId: string, action: ClosureAction) => void;
  /** Called when a gap is excluded */
  onExclude: (gapId: string, reason: CareGapExclusionReason) => void;
  /** Whether to show compact cards */
  compact?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const ChevronDownIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

const HeartIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// ============================================================================
// Types for grouping
// ============================================================================

interface GapGroup {
  key: string;
  label: string;
  gaps: CareGapInstance[];
  color: string;
}

// ============================================================================
// Component
// ============================================================================

export const CareGapList: React.FC<CareGapListProps> = ({
  gaps,
  groupBy = 'priority',
  onAction,
  onExclude,
  compact = false,
  style,
}) => {
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());

  // Toggle group collapse
  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Group gaps
  const groups = React.useMemo<GapGroup[]>(() => {
    if (groupBy === 'priority') {
      const order = ['critical', 'important', 'routine'] as const;
      const grouped = new Map<string, CareGapInstance[]>();

      gaps.forEach((gap) => {
        const key = gap._display.priority;
        const existing = grouped.get(key) || [];
        grouped.set(key, [...existing, gap]);
      });

      return order
        .filter((p) => grouped.has(p))
        .map((p) => ({
          key: p,
          label: formatPriority(p),
          gaps: sortByDueDate(grouped.get(p) || []),
          color: getPriorityColor(p),
        }));
    }

    if (groupBy === 'category') {
      const grouped = new Map<CareGapCategory, CareGapInstance[]>();

      gaps.forEach((gap) => {
        const key = gap._display.category;
        const existing = grouped.get(key) || [];
        grouped.set(key, [...existing, gap]);
      });

      return Array.from(grouped.entries()).map(([cat, catGaps]) => ({
        key: cat,
        label: formatCategory(cat),
        gaps: sortByDueDate(catGaps),
        color: colors.neutral[500],
      }));
    }

    if (groupBy === 'status') {
      const order = ['open', 'pending', 'closed', 'excluded'] as const;
      const grouped = new Map<string, CareGapInstance[]>();

      gaps.forEach((gap) => {
        const key = gap.excluded ? 'excluded' : gap.status;
        const existing = grouped.get(key) || [];
        grouped.set(key, [...existing, gap]);
      });

      return order
        .filter((s) => grouped.has(s))
        .map((s) => ({
          key: s,
          label: formatStatus(s),
          gaps: grouped.get(s) || [],
          color: getStatusColor(s),
        }));
    }

    return [];
  }, [gaps, groupBy]);

  // Empty state
  if (gaps.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[8],
        color: colors.neutral[400],
        ...style,
      }}>
        <span style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          marginBottom: spacing[3],
        }}>
          <HeartIcon />
        </span>
        <span style={{
          fontSize: typography.fontSize.sm[0],
          textAlign: 'center',
        }}>
          No care gaps
        </span>
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
    ...style,
  };

  const groupHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing[2]} ${spacing[3]}`,
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
    cursor: 'pointer',
    userSelect: 'none',
    transition: `background-color ${transitions.fast}`,
  };

  const groupTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontSize: typography.fontSize.sm[0],
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
  };

  const gapListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    paddingLeft: spacing[2],
  };

  return (
    <div style={containerStyle}>
      {groups.map((group) => (
        <div key={group.key}>
          {/* Group Header */}
          <div
            style={groupHeaderStyle}
            onClick={() => toggleGroup(group.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleGroup(group.key)}
          >
            <div style={groupTitleStyle}>
              <span style={{
                width: '16px',
                height: '16px',
                display: 'flex',
                color: colors.neutral[500],
                transform: collapsedGroups.has(group.key) ? 'rotate(0deg)' : 'rotate(0deg)',
                transition: `transform ${transitions.fast}`,
              }}>
                {collapsedGroups.has(group.key) ? <ChevronRightIcon /> : <ChevronDownIcon />}
              </span>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: radii.full,
                  backgroundColor: group.color,
                }}
              />
              <span>{group.label}</span>
              <Badge variant="default" size="sm">
                {group.gaps.length}
              </Badge>
            </div>
          </div>

          {/* Gap List */}
          {!collapsedGroups.has(group.key) && (
            <div style={gapListStyle}>
              {group.gaps.map((gap) => (
                <CareGapCard
                  key={gap.id}
                  gap={gap}
                  onAction={(action) => onAction(gap.id, action)}
                  onExclude={(reason) => onExclude(gap.id, reason)}
                  compact={compact}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function sortByDueDate(gaps: CareGapInstance[]): CareGapInstance[] {
  return [...gaps].sort((a, b) => {
    if (!a.dueBy && !b.dueBy) return 0;
    if (!a.dueBy) return 1;
    if (!b.dueBy) return -1;
    return new Date(a.dueBy).getTime() - new Date(b.dueBy).getTime();
  });
}

function formatPriority(priority: 'critical' | 'important' | 'routine'): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function getPriorityColor(priority: 'critical' | 'important' | 'routine'): string {
  switch (priority) {
    case 'critical':
      return colors.status.error;
    case 'important':
      return colors.status.warning;
    case 'routine':
      return colors.status.success;
    default:
      return colors.neutral[500];
  }
}

function formatCategory(category: CareGapCategory): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return colors.status.warning;
    case 'pending':
      return colors.status.info;
    case 'closed':
      return colors.status.success;
    case 'excluded':
      return colors.neutral[400];
    default:
      return colors.neutral[500];
  }
}

CareGapList.displayName = 'CareGapList';
