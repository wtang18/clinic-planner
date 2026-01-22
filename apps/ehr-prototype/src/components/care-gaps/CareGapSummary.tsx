/**
 * CareGapSummary Component
 *
 * Compact summary of care gaps for header display.
 */

import React from 'react';
import type { CareGapInstance } from '../../types/care-gaps';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
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
// Icons
// ============================================================================

const HeartIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

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
    gap: spacing[3],
    padding: `${spacing[2]} ${spacing[3]}`,
    backgroundColor: totalOpen > 0 ? colors.status.warningLight : colors.neutral[100],
    borderRadius: radii.lg,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
    ...style,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    color: totalOpen > 0 ? colors.status.warning : colors.neutral[400],
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  };

  const labelStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm[0],
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
  };

  const dotsContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
  };

  const dotStyle = (color: string, count: number): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[0.5],
  });

  const priorityDotStyle = (color: string): React.CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: radii.full,
    backgroundColor: color,
  });

  const countStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[600],
    fontWeight: typography.fontWeight.medium,
  };

  const chevronStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    color: colors.neutral[400],
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
        <div style={iconContainerStyle}>
          <HeartIcon />
        </div>
        <span style={{ ...labelStyle, color: colors.neutral[500] }}>
          No open care gaps
        </span>
        <span style={chevronStyle}>
          <ChevronRightIcon />
        </span>
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
      <div style={iconContainerStyle}>
        <HeartIcon />
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {/* Label */}
        <span style={labelStyle}>
          {totalOpen} open gap{totalOpen !== 1 ? 's' : ''}
        </span>

        {/* Priority breakdown */}
        <div style={dotsContainerStyle}>
          {criticalCount > 0 && (
            <div style={dotStyle(colors.status.error, criticalCount)}>
              <span style={priorityDotStyle(colors.status.error)} />
              <span style={countStyle}>{criticalCount}</span>
            </div>
          )}
          {importantCount > 0 && (
            <div style={dotStyle(colors.status.warning, importantCount)}>
              <span style={priorityDotStyle(colors.status.warning)} />
              <span style={countStyle}>{importantCount}</span>
            </div>
          )}
          {routineCount > 0 && (
            <div style={dotStyle(colors.status.success, routineCount)}>
              <span style={priorityDotStyle(colors.status.success)} />
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
      <span style={chevronStyle}>
        <ChevronRightIcon />
      </span>
    </div>
  );
};

CareGapSummary.displayName = 'CareGapSummary';
