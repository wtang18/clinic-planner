/**
 * CareGapList Component
 *
 * Grouped list of care gaps for patient overview.
 */

import React from 'react';
import { Heart } from 'lucide-react';
import type { CareGapInstance, CareGapCategory, CareGapExclusionReason } from '../../types/care-gaps';
import { colors, spaceAround, spaceBetween, borderRadius } from '../../styles/foundations';
import { CareGapCard, type ClosureAction } from './CareGapCard';
import { CollapsibleGroup } from '../primitives/CollapsibleGroup';
import { EmptyState } from '../primitives/EmptyState';

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
        color: colors.fg.neutral.spotReadable,
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
      <EmptyState
        icon={<Heart size={48} />}
        title="No care gaps"
        size="lg"
        style={style}
      />
    );
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
    ...style,
  };

  const gapListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
    paddingLeft: spaceAround.tight,
  };

  return (
    <div style={containerStyle} data-testid="care-gap-panel">
      {groups.map((group) => (
        <CollapsibleGroup
          key={group.key}
          title={group.label}
          isCollapsed={collapsedGroups.has(group.key)}
          onToggle={() => toggleGroup(group.key)}
          badge={{ label: group.gaps.length, variant: 'default' }}
          trailing={
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: borderRadius.full,
                backgroundColor: group.color,
                display: 'inline-block',
              }}
            />
          }
        >
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
        </CollapsibleGroup>
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
      return colors.fg.alert.secondary;
    case 'important':
      return colors.fg.attention.secondary;
    case 'routine':
      return colors.fg.positive.secondary;
    default:
      return colors.fg.neutral.spotReadable;
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
      return colors.fg.attention.secondary;
    case 'pending':
      return colors.fg.information.secondary;
    case 'closed':
      return colors.fg.positive.secondary;
    case 'excluded':
      return colors.fg.neutral.disabled;
    default:
      return colors.fg.neutral.spotReadable;
  }
}

CareGapList.displayName = 'CareGapList';
