/**
 * CardIconContainer Component
 *
 * Reusable icon container for the upper-left corner of cards.
 * Provides consistent sizing, shape, and color across all card types.
 */

import React from 'react';
import { colors, borderRadius } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type CardIconColor = 'default' | 'alert' | 'attention' | 'success' | 'accent';

export interface CardIconContainerProps {
  /** Color class */
  color?: CardIconColor;
  /** Size preset: sm=28px, md=32px, lg=40px */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show background (false = icon color only) */
  filled?: boolean;
  /** Icon content */
  children: React.ReactNode;
  /** Override styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Color Mapping
// ============================================================================

const colorTokens: Record<CardIconColor, { bg: string; fg: string }> = {
  default: {
    bg: colors.bg.neutral.subtle,
    fg: colors.fg.neutral.spotReadable,
  },
  alert: {
    bg: colors.bg.alert.low,
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

const sizeValues: Record<'sm' | 'md' | 'lg', number> = {
  sm: 28,
  md: 32,
  lg: 40,
};

// ============================================================================
// Component
// ============================================================================

export const CardIconContainer: React.FC<CardIconContainerProps> = ({
  color = 'default',
  size = 'lg',
  filled = true,
  children,
  style,
}) => {
  const tokens = colorTokens[color];
  const dimension = sizeValues[size];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: dimension,
    height: dimension,
    borderRadius: borderRadius.sm,
    color: tokens.fg,
    flexShrink: 0,
    ...(filled && { backgroundColor: tokens.bg }),
    ...style,
  };

  return <div style={containerStyle}>{children}</div>;
};

CardIconContainer.displayName = 'CardIconContainer';
