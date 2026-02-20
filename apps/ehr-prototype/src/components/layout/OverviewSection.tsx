/**
 * OverviewSection Component
 *
 * Collapsible data section for the patient overview pane.
 * Shows expanded content or collapsed summary with key alerts.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { colors, borderRadius, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface OverviewSectionProps {
  /** Section title */
  title: string;
  /** Item count to show in header */
  count?: number;
  /** Alert/key info to show when collapsed */
  collapsedSummary?: string;
  /** Whether summary indicates an alert state */
  hasAlert?: boolean;
  /** Icon for the section */
  icon?: React.ReactNode;
  /** Section content */
  children: React.ReactNode;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Called when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  title,
  count,
  collapsedSummary,
  hasAlert = false,
  icon,
  children,
  defaultCollapsed = false,
  onCollapseChange,
  style,
  testID,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bg.neutral.base,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.neutral.low}`,
    overflow: 'hidden',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    cursor: 'pointer',
    backgroundColor: isHovered ? colors.bg.neutral.subtle : 'transparent',
    transition: `background-color ${transitions.fast}`,
    userSelect: 'none',
  };

  const chevronStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.fg.neutral.spotReadable,
    flexShrink: 0,
    marginLeft: 'auto',
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: hasAlert ? colors.fg.alert.secondary : colors.fg.neutral.secondary,
    flexShrink: 0,
  };

  const titleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: '20px',
    letterSpacing: -0.5,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  };

  const countStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
  };

  const summaryStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: hasAlert ? colors.fg.alert.secondary : colors.fg.neutral.secondary,
    fontWeight: hasAlert ? typography.fontWeight.medium : typography.fontWeight.regular,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const contentStyle: React.CSSProperties = {
    display: isCollapsed ? 'none' : 'block',
    padding: `0 ${spaceAround.default}px ${spaceAround.default}px`,
    borderTop: `1px solid ${colors.border.neutral.low}`,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      <div
        style={headerStyle}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        {icon && <span style={iconContainerStyle}>{icon}</span>}

        <div style={titleContainerStyle}>
          <span style={titleStyle}>{title}</span>
          {count !== undefined && count > 0 && (
            <span style={countStyle}>{count}</span>
          )}
        </div>

        {isCollapsed && collapsedSummary && (
          <span style={summaryStyle}>{collapsedSummary}</span>
        )}

        <span style={chevronStyle}>
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      <div style={contentStyle} aria-hidden={isCollapsed}>
        {children}
      </div>
    </div>
  );
};

OverviewSection.displayName = 'OverviewSection';
