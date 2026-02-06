/**
 * MenuSection Component
 *
 * Collapsible section within the menu pane.
 */

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { colors, borderRadius, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface MenuSectionProps {
  /** Section title */
  title: string;
  /** Section content (children) */
  children: React.ReactNode;
  /** Whether the section is collapsible */
  collapsible?: boolean;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Badge count to show when collapsed */
  collapsedBadge?: number;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const MenuSection: React.FC<MenuSectionProps> = ({
  title,
  children,
  collapsible = true,
  defaultCollapsed = false,
  collapsedBadge,
  style,
  testID,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isHovered, setIsHovered] = useState(false);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.nudge4}px ${spaceAround.compact}px`,
    cursor: collapsible ? 'pointer' : 'default',
    borderRadius: borderRadius.xs,
    backgroundColor: isHovered && collapsible ? colors.bg.neutral.subtle : 'transparent',
    transition: `background-color ${transitions.fast}`,
    userSelect: 'none',
  };

  const chevronStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.fg.neutral.spotReadable,
    transition: `transform ${transitions.fast}`,
    transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
    marginLeft: 'auto', // Push chevron to right
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  };

  const badgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    height: 18,
    padding: '0 6px',
    backgroundColor: colors.bg.neutral.medium,
    color: colors.fg.neutral.primary,
    borderRadius: 9,
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
  };

  const contentStyle: React.CSSProperties = {
    display: isCollapsed ? 'none' : 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  };

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      <div
        style={headerStyle}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? !isCollapsed : undefined}
        onKeyDown={(e) => {
          if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <span style={titleStyle}>{title}</span>
        {isCollapsed && collapsedBadge !== undefined && collapsedBadge > 0 && (
          <span style={badgeStyle}>{collapsedBadge}</span>
        )}
        {collapsible && (
          <span style={chevronStyle}>
            <ChevronRight size={14} />
          </span>
        )}
      </div>

      <div style={contentStyle} aria-hidden={isCollapsed}>
        {children}
      </div>
    </div>
  );
};

MenuSection.displayName = 'MenuSection';
