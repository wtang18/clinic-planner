/**
 * Pill Component
 *
 * Compact status indicator with optional icon and click handler.
 * Used for inline metadata like allergy indicators and care gap counts.
 */

import React from 'react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type PillColor = 'default' | 'alert' | 'attention' | 'success' | 'accent';

export interface PillProps {
  /** Color class */
  color?: PillColor;
  /** Size: sm = tighter padding, md = standard */
  size?: 'sm' | 'md';
  /** Leading icon */
  icon?: React.ReactNode;
  /** Click handler (makes it interactive) */
  onClick?: () => void;
  /** Children text content */
  children: React.ReactNode;
  /** Override styles */
  style?: React.CSSProperties;
  /** Test ID for E2E testing */
  'data-testid'?: string;
}

// ============================================================================
// Color Mapping
// ============================================================================

const colorTokens: Record<PillColor, { bg: string; fg: string }> = {
  default: {
    bg: colors.bg.neutral.subtle,
    fg: colors.fg.neutral.secondary,
  },
  alert: {
    bg: colors.bg.alert.subtle,
    fg: colors.fg.alert.secondary,
  },
  attention: {
    bg: colors.bg.attention.subtle,
    fg: colors.fg.attention.secondary,
  },
  success: {
    bg: colors.bg.positive.subtle,
    fg: colors.fg.positive.secondary,
  },
  accent: {
    bg: colors.bg.accent.subtle,
    fg: colors.fg.accent.primary,
  },
};

const sizeStyles: Record<'sm' | 'md', React.CSSProperties> = {
  sm: {
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
  },
  md: {
    padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
  },
};

// ============================================================================
// Component
// ============================================================================

export const Pill: React.FC<PillProps> = ({
  color = 'default',
  size = 'md',
  icon,
  onClick,
  children,
  style,
  'data-testid': testId,
}) => {
  const tokens = colorTokens[color];

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    backgroundColor: tokens.bg,
    color: tokens.fg,
    borderRadius: borderRadius.sm,
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    whiteSpace: 'nowrap',
    transition: `background-color ${transitions.fast}`,
    ...(onClick && { cursor: 'pointer' }),
    ...sizeStyles[size],
    ...style,
  };

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    flexShrink: 0,
  };

  return (
    <span
      style={containerStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
      data-testid={testId}
    >
      {icon && <span style={iconStyle}>{icon}</span>}
      {children}
    </span>
  );
};

Pill.displayName = 'Pill';
