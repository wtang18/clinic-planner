/**
 * CollapsiblePane Component
 *
 * Generic collapsible pane that animates between expanded and collapsed states.
 * Used for Menu and Overview panes in the adaptive layout.
 */

import React, { useRef, useEffect, useState } from 'react';
import { colors, transitions, zIndex as zIndexTokens } from '../../styles/foundations';
import { FloatingToggleButton, TogglePosition } from './FloatingToggleButton';

// ============================================================================
// Types
// ============================================================================

export interface CollapsiblePaneProps {
  /** Unique identifier for the pane */
  id: string;
  /** Pane content */
  children: React.ReactNode;
  /** Width when expanded (in pixels) */
  width: number;
  /** Which edge the pane is attached to */
  edge: 'left' | 'right';
  /** Whether the pane is collapsed */
  collapsed: boolean;
  /** Callback when collapse state changes */
  onToggle: () => void;
  /** Whether this is an overlay pane (slides over content) */
  overlay?: boolean;
  /** Background color */
  backgroundColor?: string;
  /** Show border on the opposite edge */
  showBorder?: boolean;
  /** Z-index for the pane */
  zIndex?: number;
  /** Label for the toggle button */
  toggleLabel: string;
  /** Whether to show the toggle button in the header area */
  showHeaderToggle?: boolean;
  /** Whether to show the floating toggle button when collapsed (default: true) */
  showToggleButton?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const CollapsiblePane: React.FC<CollapsiblePaneProps> = ({
  id,
  children,
  width,
  edge,
  collapsed,
  onToggle,
  overlay = false,
  backgroundColor = colors.bg.neutral.base,
  showBorder = true,
  zIndex = zIndexTokens.base,
  toggleLabel,
  showHeaderToggle = false,
  showToggleButton = true,
  style,
  testID,
}) => {
  const paneRef = useRef<HTMLDivElement>(null);
  const [isHoveredNearEdge, setIsHoveredNearEdge] = useState(false);

  // Handle hover detection for showing toggle when collapsed
  useEffect(() => {
    if (!collapsed) {
      setIsHoveredNearEdge(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const edgeThreshold = 20;
      const isNearEdge =
        edge === 'left'
          ? e.clientX < edgeThreshold
          : e.clientX > window.innerWidth - edgeThreshold;

      setIsHoveredNearEdge(isNearEdge);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [collapsed, edge]);

  const containerStyle: React.CSSProperties = {
    position: overlay ? 'absolute' : 'relative',
    ...(overlay && edge === 'left' && { left: 0 }),
    ...(overlay && edge === 'right' && { right: 0 }),
    top: 0,
    bottom: 0,
    width: collapsed ? 0 : width,
    minWidth: collapsed ? 0 : width,
    maxWidth: collapsed ? 0 : width,
    overflow: 'hidden',
    backgroundColor,
    borderRight: showBorder && edge === 'left' ? `1px solid ${colors.border.neutral.low}` : 'none',
    borderLeft: showBorder && edge === 'right' ? `1px solid ${colors.border.neutral.low}` : 'none',
    transition: `all 250ms cubic-bezier(0.4, 0, 0.2, 1)`,
    zIndex: overlay ? zIndex : 'auto',
    flexShrink: 0,
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    width,
    minWidth: width,
    height: '100%',
    overflow: 'hidden',
    opacity: collapsed ? 0 : 1,
    transition: `opacity ${transitions.fast}`,
  };

  const floatingToggleContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 16,
    ...(edge === 'left' ? { left: collapsed ? 8 : width + 8 } : { right: collapsed ? 8 : width + 8 }),
    zIndex: zIndexTokens.sticky,
    transition: `all 250ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  const showFloatingToggle = collapsed && isHoveredNearEdge;

  return (
    <>
      <div
        ref={paneRef}
        style={containerStyle}
        data-pane-id={id}
        data-collapsed={collapsed}
        data-testid={testID}
        role="region"
        aria-label={toggleLabel.replace('Toggle ', '')}
        aria-expanded={!collapsed}
      >
        <div style={contentStyle}>{children}</div>
      </div>

      {/* Floating toggle button (appears when collapsed and hovering near edge) */}
      {showToggleButton && collapsed && (
        <div style={floatingToggleContainerStyle}>
          <FloatingToggleButton
            position={edge}
            isCollapsed={collapsed}
            onClick={onToggle}
            visible={showFloatingToggle}
            label={toggleLabel}
          />
        </div>
      )}
    </>
  );
};

CollapsiblePane.displayName = 'CollapsiblePane';
