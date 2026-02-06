/**
 * WorkspaceTabBar Component
 *
 * Horizontal tab bar for navigating child tabs within a workspace.
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { colors, spaceBetween, spaceAround, borderRadius, typography, transitions } from '../../styles/foundations';
import type { WorkspaceTab } from '../../context/WorkspaceContext';

// ============================================================================
// Types
// ============================================================================

export interface WorkspaceTabBarProps {
  /** Tabs to display */
  tabs: WorkspaceTab[];
  /** Currently active tab ID */
  activeTabId: string;
  /** Called when a tab is clicked */
  onTabClick?: (tabId: string) => void;
  /** Called when a tab close button is clicked */
  onTabClose?: (tabId: string) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const WorkspaceTabBar: React.FC<WorkspaceTabBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  style,
  testID,
}) => {
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

  // Don't render if only one tab
  if (tabs.length <= 1) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    overflowX: 'auto',
    ...style,
  };

  const tabStyle = (tabId: string): React.CSSProperties => {
    const isActive = tabId === activeTabId;
    const isHovered = tabId === hoveredTabId;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: spaceBetween.relatedCompact,
      padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
      backgroundColor: isActive
        ? colors.bg.neutral.base
        : isHovered
        ? colors.bg.neutral.low
        : 'transparent',
      border: isActive ? `1px solid ${colors.border.neutral.low}` : '1px solid transparent',
      borderRadius: borderRadius.sm,
      cursor: 'pointer',
      transition: `all ${transitions.fast}`,
      whiteSpace: 'nowrap',
    };
  };

  const tabLabelStyle = (tabId: string): React.CSSProperties => {
    const isActive = tabId === activeTabId;
    return {
      fontSize: 12,
      fontWeight: isActive ? 500 : 400,
      fontFamily: typography.fontFamily.sans,
      color: isActive ? colors.fg.neutral.primary : colors.fg.neutral.secondary,
      maxWidth: 150,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };
  };

  const closeButtonStyle = (tabId: string): React.CSSProperties => {
    const isHovered = tabId === hoveredTabId;
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 16,
      height: 16,
      borderRadius: borderRadius.xs,
      opacity: isHovered ? 1 : 0,
      transition: `opacity ${transitions.fast}`,
      cursor: 'pointer',
    };
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          style={tabStyle(tab.id)}
          onClick={() => onTabClick?.(tab.id)}
          onMouseEnter={() => setHoveredTabId(tab.id)}
          onMouseLeave={() => setHoveredTabId(null)}
        >
          <span style={tabLabelStyle(tab.id)}>{tab.label}</span>
          {tab.type !== 'overview' && (
            <div
              style={closeButtonStyle(tab.id)}
              onClick={(e) => {
                e.stopPropagation();
                onTabClose?.(tab.id);
              }}
            >
              <X size={12} color={colors.fg.neutral.secondary} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

WorkspaceTabBar.displayName = 'WorkspaceTabBar';
