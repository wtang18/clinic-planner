/**
 * CareGapSummary Component
 *
 * Compact summary of care gaps for header display.
 */

import React from 'react';
import { Heart, ChevronRight } from 'lucide-react';
import type { CareGapInstance } from '../../types/care-gaps';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { Badge } from '../primitives/Badge';

// ============================================================================
// Types
// ============================================================================

export interface CareGapSummaryProps {
  /** The care gaps to summarize */
  gaps: CareGapInstance[];
  /** Called when clicked to expand full list */
  onClick: () => void;
  /** Whether to show expanded view */
  expanded?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const CareGapSummary: React.FC<CareGapSummaryProps> = ({
  gaps,
  onClick,
  expanded = false,
  style,
}) => {
  // Count by priority
  const openGaps = gaps.filter(g => g.status === 'open' && !g.excluded);
  const criticalCount = openGaps.filter(g => g._display.priority === 'critical').length;
  const importantCount = openGaps.filter(g => g._display.priority === 'important').length;
  const routineCount = openGaps.filter(g => g._display.priority === 'routine').length;
  const totalOpen = openGaps.length;

  // Count overdue
  const overdueCount = openGaps.filter(g => {
    if (!g.dueBy) return false;
    return new Date(g.dueBy) < new Date();
  }).length;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: totalOpen > 0 ? colors.bg.attention.subtle : colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
    ...style,
  };

  const iconColor = totalOpen > 0 ? colors.fg.attention.secondary : colors.fg.neutral.disabled;

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
  };

  const dotsContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  };

  const dotStyle = (color: string, count: number): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  });

  const priorityDotStyle = (color: string): React.CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: borderRadius.full,
    backgroundColor: color,
  });

  const countStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.secondary,
    fontWeight: typography.fontWeight.medium,
  };

  const chevronStyle: React.CSSProperties = {
    transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
    transition: `transform ${transitions.fast}`,
  };

  // Empty state
  if (totalOpen === 0) {
    return (
      <div
        style={containerStyle}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        <Heart size={24} color={iconColor} />
        <span style={{ ...labelStyle, color: colors.fg.neutral.spotReadable }}>
          No open care gaps
        </span>
        <ChevronRight size={16} color={colors.fg.neutral.disabled} style={chevronStyle} />
      </div>
    );
  }

  return (
    <div
      style={containerStyle}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Icon */}
      <Heart size={24} color={iconColor} />

      {/* Content */}
      <div style={contentStyle}>
        {/* Label */}
        <span style={labelStyle}>
          {totalOpen} open gap{totalOpen !== 1 ? 's' : ''}
        </span>

        {/* Priority breakdown */}
        <div style={dotsContainerStyle}>
          {criticalCount > 0 && (
            <div style={dotStyle(colors.fg.alert.secondary, criticalCount)}>
              <span style={priorityDotStyle(colors.fg.alert.secondary)} />
              <span style={countStyle}>{criticalCount}</span>
            </div>
          )}
          {importantCount > 0 && (
            <div style={dotStyle(colors.fg.attention.secondary, importantCount)}>
              <span style={priorityDotStyle(colors.fg.attention.secondary)} />
              <span style={countStyle}>{importantCount}</span>
            </div>
          )}
          {routineCount > 0 && (
            <div style={dotStyle(colors.fg.positive.secondary, routineCount)}>
              <span style={priorityDotStyle(colors.fg.positive.secondary)} />
              <span style={countStyle}>{routineCount}</span>
            </div>
          )}
        </div>

        {/* Overdue indicator */}
        {overdueCount > 0 && (
          <Badge variant="error" size="sm">
            {overdueCount} overdue
          </Badge>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight size={16} color={colors.fg.neutral.disabled} style={chevronStyle} />
    </div>
  );
};

CareGapSummary.displayName = 'CareGapSummary';
