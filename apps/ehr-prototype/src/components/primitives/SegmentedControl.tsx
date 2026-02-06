/**
 * SegmentedControl Component
 *
 * A pill-shaped segmented control for switching between views/tabs.
 * Used in Overview pane for Overview/Activity tabs.
 */

import React from 'react';
import { colors, borderRadius, transitions, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface Segment {
  id: string;
  label: string;
  badge?: number;
}

export interface SegmentedControlProps {
  /** Available segments */
  segments: Segment[];
  /** Currently active segment ID */
  activeSegment: string;
  /** Called when segment changes */
  onChange: (segmentId: string) => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  activeSegment,
  onChange,
  size = 'md',
  style,
  testID,
}) => {
  const isSmall = size === 'sm';

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    padding: 2,
    gap: 2,
    ...style,
  };

  const segmentStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: isSmall ? '4px 10px' : '6px 14px',
    borderRadius: borderRadius.sm - 2,
    backgroundColor: isActive ? colors.bg.neutral.base : 'transparent',
    color: isActive ? colors.fg.neutral.primary : colors.fg.neutral.secondary,
    fontSize: isSmall ? 12 : 13,
    fontWeight: isActive ? 500 : 400,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: `all ${transitions.fast}`,
    boxShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
    whiteSpace: 'nowrap',
  });

  const badgeStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16,
    height: 16,
    padding: '0 4px',
    borderRadius: borderRadius.full,
    backgroundColor: isActive ? colors.bg.accent.subtle : colors.bg.neutral.base,
    color: isActive ? colors.fg.accent.primary : colors.fg.neutral.secondary,
    fontSize: 10,
    fontWeight: 500,
  });

  return (
    <div style={containerStyle} data-testid={testID} role="tablist">
      {segments.map((segment) => {
        const isActive = segment.id === activeSegment;
        return (
          <button
            key={segment.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            style={segmentStyle(isActive)}
            onClick={() => onChange(segment.id)}
            data-testid={testID ? `${testID}-${segment.id}` : undefined}
          >
            {segment.label}
            {segment.badge !== undefined && segment.badge > 0 && (
              <span style={badgeStyle(isActive)}>{segment.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

SegmentedControl.displayName = 'SegmentedControl';
