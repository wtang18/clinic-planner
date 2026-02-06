/**
 * SectionTitle Component
 *
 * Presentational component for section headers with optional icon,
 * count badge, and trailing content.
 */

import React from 'react';
import { colors, spaceBetween, spaceAround, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface SectionTitleProps {
  /** Title text */
  title: string;
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Color for the icon */
  iconColor?: string;
  /** Optional count to display in parentheses */
  count?: number | string;
  /** Optional trailing content (e.g. a button) */
  trailing?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  icon,
  iconColor,
  count,
  trailing,
  size = 'md',
  style,
}) => {
  const fontSize = size === 'sm' ? 12 : 14;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    marginBottom: spaceAround.compact,
    ...style,
  };

  const titleStyle: React.CSSProperties = {
    fontSize,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.secondary,
    margin: 0,
  };

  const countStyle: React.CSSProperties = {
    fontSize: fontSize - 2,
    color: colors.fg.neutral.spotReadable,
    fontWeight: typography.fontWeight.regular,
  };

  return (
    <div style={containerStyle}>
      {icon && (
        <span style={{ display: 'flex', color: iconColor || colors.fg.neutral.spotReadable }}>
          {icon}
        </span>
      )}
      <span style={titleStyle}>{title}</span>
      {count !== undefined && <span style={countStyle}>({count})</span>}
      {trailing && <div style={{ marginLeft: 'auto' }}>{trailing}</div>}
    </div>
  );
};

SectionTitle.displayName = 'SectionTitle';
