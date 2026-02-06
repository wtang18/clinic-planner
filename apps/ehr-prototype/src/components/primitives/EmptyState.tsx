/**
 * EmptyState Component
 *
 * Presentational component for displaying empty state placeholders
 * with icon, title, optional description, and optional action.
 */

import React from 'react';
import { colors, spaceAround, spaceBetween, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface EmptyStateProps {
  /** Icon element to display */
  icon: React.ReactNode;
  /** Title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action element (e.g. a button) */
  action?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  size = 'md',
  style,
}) => {
  const iconSize = size === 'sm' ? 32 : size === 'md' ? 40 : 48;
  const titleFontSize = size === 'sm' ? 13 : 14;
  const padding = size === 'sm' ? spaceAround.compact : size === 'md' ? spaceAround.default : spaceAround.spacious;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding,
    gap: spaceBetween.relatedCompact,
    ...style,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    color: colors.fg.neutral.disabled,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: titleFontSize,
    color: colors.fg.neutral.disabled,
    textAlign: 'center',
    margin: 0,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    textAlign: 'center',
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle}>{icon}</div>
      <p style={titleStyle}>{title}</p>
      {description && <p style={descriptionStyle}>{description}</p>}
      {action && action}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
