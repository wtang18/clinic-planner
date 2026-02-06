/**
 * FloatingToggleButton Component
 *
 * Toggle button that appears at the edge of collapsed panes.
 * Follows iOS/iPadOS split view conventions.
 */

import React from 'react';
import { ChevronLeft, ChevronRight, Menu, PanelLeft, PanelRight } from 'lucide-react';
import { colors, borderRadius, shadows, transitions, spaceAround } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export type TogglePosition = 'left' | 'right';

export interface FloatingToggleButtonProps {
  /** Position of the toggle button */
  position: TogglePosition;
  /** Whether the pane is currently collapsed */
  isCollapsed: boolean;
  /** Called when the button is clicked */
  onClick: () => void;
  /** Icon variant */
  variant?: 'chevron' | 'panel' | 'menu';
  /** Whether to show the button (for hover reveal behavior) */
  visible?: boolean;
  /** Accessible label */
  label: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const FloatingToggleButton: React.FC<FloatingToggleButtonProps> = ({
  position,
  isCollapsed,
  onClick,
  variant = 'chevron',
  visible = true,
  label,
  style,
}) => {
  const getIcon = () => {
    const iconSize = 18;

    if (variant === 'menu') {
      return <Menu size={iconSize} />;
    }

    if (variant === 'panel') {
      return position === 'left' ? (
        <PanelLeft size={iconSize} />
      ) : (
        <PanelRight size={iconSize} />
      );
    }

    // Default: chevron that points in the direction of expansion
    if (position === 'left') {
      return isCollapsed ? <ChevronRight size={iconSize} /> : <ChevronLeft size={iconSize} />;
    } else {
      return isCollapsed ? <ChevronLeft size={iconSize} /> : <ChevronRight size={iconSize} />;
    }
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    boxShadow: shadows.md,
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    transition: `all ${transitions.fast}`,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none',
    transform: visible ? 'scale(1)' : 'scale(0.8)',
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = colors.bg.neutral.subtle;
    e.currentTarget.style.color = colors.fg.neutral.primary;
    e.currentTarget.style.borderColor = colors.border.neutral.medium;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = colors.bg.neutral.base;
    e.currentTarget.style.color = colors.fg.neutral.secondary;
    e.currentTarget.style.borderColor = colors.border.neutral.low;
  };

  return (
    <button
      type="button"
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={label}
      aria-expanded={!isCollapsed}
      title={label}
    >
      {getIcon()}
    </button>
  );
};

FloatingToggleButton.displayName = 'FloatingToggleButton';
