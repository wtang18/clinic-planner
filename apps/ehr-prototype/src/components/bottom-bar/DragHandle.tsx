/**
 * DragHandle Component
 *
 * Visual handle for collapsing palette/drawer views.
 * - 32px visual height (still accessible tap target)
 * - SVG polyline that morphs from flat line to chevron on hover/tap
 * - Stroke-only style (no fill) for clean appearance on dark surfaces
 * - Tap to collapse (no actual dragging in v1)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface DragHandleProps {
  /** Called when the handle is tapped */
  onCollapse: () => void;
  /** Orientation of the bar */
  orientation?: 'horizontal' | 'vertical';
  /** Visual variant - matches parent surface */
  variant?: 'light' | 'dark';
  /** Whether the handle is disabled */
  disabled?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const TAP_TARGET_SIZE = 20; // Reduced from 32 - full width still provides adequate touch area

// SVG dimensions
const SVG_WIDTH = 36;
const SVG_HEIGHT = 12;
const STROKE_WIDTH = 2.5;

// Point positions (centered in viewBox)
const CENTER_X = SVG_WIDTH / 2;  // 18
const CENTER_Y = SVG_HEIGHT / 2; // 6

// Default: flat horizontal line
const FLAT_POINTS = `0,${CENTER_Y} ${CENTER_X},${CENTER_Y} ${SVG_WIDTH},${CENTER_Y}`;

// Active: chevron (sides up 2px, center down 3px)
const CHEVRON_POINTS = `0,${CENTER_Y - 2} ${CENTER_X},${CENTER_Y + 3} ${SVG_WIDTH},${CENTER_Y - 2}`;

// ============================================================================
// Component
// ============================================================================

export const DragHandle: React.FC<DragHandleProps> = ({
  onCollapse,
  orientation = 'horizontal',
  variant = 'dark',
  disabled = false,
  style,
  testID,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const isDark = variant === 'dark';
  const isVertical = orientation === 'vertical';
  const isActive = isHovered || isPressed;

  // Stroke color based on variant and state
  const strokeColor = isDark
    ? isActive
      ? 'rgba(255, 255, 255, 0.5)'
      : 'rgba(255, 255, 255, 0.3)'
    : isActive
      ? 'rgba(0, 0, 0, 0.4)'
      : 'rgba(0, 0, 0, 0.2)';

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isVertical ? TAP_TARGET_SIZE : '100%',
    height: isVertical ? '100%' : TAP_TARGET_SIZE,
    minWidth: isVertical ? TAP_TARGET_SIZE : undefined,
    minHeight: isVertical ? undefined : TAP_TARGET_SIZE,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    background: 'transparent',
    border: 'none',
    padding: 0,
    ...style,
  };

  const handleClick = () => {
    if (!disabled) {
      onCollapse();
    }
  };

  // Select points based on state and orientation
  const points = isActive ? CHEVRON_POINTS : FLAT_POINTS;

  return (
    <motion.button
      type="button"
      style={containerStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      aria-label="Collapse panel"
      data-testid={testID}
    >
      <svg
        width={isVertical ? SVG_HEIGHT : SVG_WIDTH}
        height={isVertical ? SVG_WIDTH : SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        style={{
          transform: isVertical ? 'rotate(90deg)' : undefined,
        }}
      >
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'all 150ms ease' }}
        />
      </svg>
    </motion.button>
  );
};

DragHandle.displayName = 'DragHandle';

export default DragHandle;
