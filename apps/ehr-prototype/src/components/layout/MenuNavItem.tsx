/**
 * MenuNavItem Component
 *
 * Single navigation item in the menu pane.
 */

import React from 'react';
import { colors, borderRadius, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface MenuNavItemProps {
  /** Icon to display */
  icon: React.ReactNode;
  /** Label text */
  label: string;
  /** Whether this item is currently selected */
  isSelected?: boolean;
  /** Badge count to show */
  badge?: number;
  /** Whether this item is indented (sub-item) */
  indented?: boolean;
  /** Indentation level (0-based) */
  indentLevel?: number;
  /** Called when item is clicked */
  onClick?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const MenuNavItem: React.FC<MenuNavItemProps> = ({
  icon,
  label,
  isSelected = false,
  badge,
  indented = false,
  indentLevel = 0,
  onClick,
  style,
  testID,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    paddingLeft: indented
      ? spaceAround.compact + (indentLevel + 1) * 16
      : spaceAround.compact,
    backgroundColor: isSelected
      ? colors.bg.accent.low
      : isHovered
      ? colors.bg.neutral.subtle
      : 'transparent',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
    userSelect: 'none',
    ...style,
  };

  const leftContentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  };

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    color: isSelected ? colors.fg.accent.primary : colors.fg.neutral.secondary,
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.regular,
    color: isSelected ? colors.fg.accent.primary : colors.fg.neutral.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const badgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    padding: `0 ${spaceAround.nudge6}px`,
    backgroundColor: colors.bg.attention.subtle,
    color: colors.fg.attention.primary,
    borderRadius: borderRadius.full,
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    flexShrink: 0,
  };

  return (
    <div
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      data-testid={testID}
      data-selected={isSelected}
    >
      <div style={leftContentStyle}>
        <span style={iconStyle}>{icon}</span>
        <span style={labelStyle}>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span style={badgeStyle}>{badge > 99 ? '99+' : badge}</span>
      )}
    </div>
  );
};

MenuNavItem.displayName = 'MenuNavItem';
