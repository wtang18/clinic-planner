/**
 * SplitPane Component
 *
 * Resizable split pane for flexible layouts.
 */

import React from 'react';
import { colors, spacing, transitions } from '../../styles/tokens';

// ============================================================================
// Types
// ============================================================================

export interface SplitPaneProps {
  /** Left pane content */
  left: React.ReactNode;
  /** Right pane content */
  right: React.ReactNode;
  /** Default split position (0-100 percentage) */
  defaultSplit?: number;
  /** Minimum left pane width (percentage) */
  minLeft?: number;
  /** Minimum right pane width (percentage) */
  minRight?: number;
  /** Which pane(s) can be collapsed */
  collapsible?: 'left' | 'right' | 'both' | 'none';
  /** Orientation of the split */
  orientation?: 'horizontal' | 'vertical';
  /** Called when split position changes */
  onSplitChange?: (split: number) => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const ChevronLeftIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18,15 12,9 6,15" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  defaultSplit = 50,
  minLeft = 20,
  minRight = 20,
  collapsible = 'none',
  orientation = 'horizontal',
  onSplitChange,
  style,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [split, setSplit] = React.useState(defaultSplit);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = React.useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const isHorizontal = orientation === 'horizontal';

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let newSplit: number;

      if (isHorizontal) {
        newSplit = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        newSplit = ((e.clientY - rect.top) / rect.height) * 100;
      }

      // Clamp to min/max values
      newSplit = Math.max(minLeft, Math.min(100 - minRight, newSplit));

      setSplit(newSplit);
      onSplitChange?.(newSplit);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isHorizontal, minLeft, minRight, onSplitChange]);

  // Collapse handlers
  const handleCollapseLeft = () => {
    setIsLeftCollapsed(!isLeftCollapsed);
    setIsRightCollapsed(false);
  };

  const handleCollapseRight = () => {
    setIsRightCollapsed(!isRightCollapsed);
    setIsLeftCollapsed(false);
  };

  // Calculate actual sizes
  const getLeftSize = () => {
    if (isLeftCollapsed) return '0%';
    if (isRightCollapsed) return '100%';
    return `${split}%`;
  };

  const getRightSize = () => {
    if (isRightCollapsed) return '0%';
    if (isLeftCollapsed) return '100%';
    return `${100 - split}%`;
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    ...style,
  };

  const leftPaneStyle: React.CSSProperties = {
    [isHorizontal ? 'width' : 'height']: getLeftSize(),
    overflow: 'hidden',
    transition: isLeftCollapsed || isRightCollapsed ? `all ${transitions.base}` : undefined,
    flexShrink: 0,
  };

  const rightPaneStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    transition: isLeftCollapsed || isRightCollapsed ? `all ${transitions.base}` : undefined,
  };

  const dividerStyle: React.CSSProperties = {
    position: 'relative',
    [isHorizontal ? 'width' : 'height']: '8px',
    [isHorizontal ? 'height' : 'width']: '100%',
    backgroundColor: isDragging || isHovered ? colors.primary[100] : colors.neutral[200],
    cursor: isHorizontal ? 'col-resize' : 'row-resize',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `background-color ${transitions.fast}`,
    userSelect: 'none',
  };

  const dividerGripStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'column' : 'row',
    gap: '2px',
    opacity: isDragging || isHovered ? 1 : 0.5,
    transition: `opacity ${transitions.fast}`,
  };

  const gripDotStyle: React.CSSProperties = {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: colors.neutral[400],
  };

  const collapseButtonStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    backgroundColor: colors.neutral[0],
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)',
    zIndex: 1,
    transition: `all ${transitions.fast}`,
  };

  const canCollapseLeft = collapsible === 'left' || collapsible === 'both';
  const canCollapseRight = collapsible === 'right' || collapsible === 'both';

  return (
    <div ref={containerRef} style={containerStyle}>
      {/* Left/Top pane */}
      <div style={leftPaneStyle}>
        {!isLeftCollapsed && left}
      </div>

      {/* Divider */}
      <div
        style={dividerStyle}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Grip indicator */}
        <div style={dividerGripStyle}>
          <div style={gripDotStyle} />
          <div style={gripDotStyle} />
          <div style={gripDotStyle} />
        </div>

        {/* Collapse buttons */}
        {canCollapseLeft && !isRightCollapsed && (
          <button
            type="button"
            style={{
              ...collapseButtonStyle,
              [isHorizontal ? 'left' : 'top']: '-10px',
            }}
            onClick={handleCollapseLeft}
            title={isLeftCollapsed ? 'Expand left pane' : 'Collapse left pane'}
          >
            <span style={{ width: '12px', height: '12px', display: 'flex' }}>
              {isHorizontal ? (
                isLeftCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />
              ) : (
                isLeftCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />
              )}
            </span>
          </button>
        )}

        {canCollapseRight && !isLeftCollapsed && (
          <button
            type="button"
            style={{
              ...collapseButtonStyle,
              [isHorizontal ? 'right' : 'bottom']: '-10px',
            }}
            onClick={handleCollapseRight}
            title={isRightCollapsed ? 'Expand right pane' : 'Collapse right pane'}
          >
            <span style={{ width: '12px', height: '12px', display: 'flex' }}>
              {isHorizontal ? (
                isRightCollapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />
              ) : (
                isRightCollapsed ? <ChevronUpIcon /> : <ChevronDownIcon />
              )}
            </span>
          </button>
        )}
      </div>

      {/* Right/Bottom pane */}
      <div style={rightPaneStyle}>
        {!isRightCollapsed && right}
      </div>

      {/* Overlay during drag to prevent iframe issues */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            cursor: isHorizontal ? 'col-resize' : 'row-resize',
            zIndex: 1000,
          }}
        />
      )}
    </div>
  );
};

SplitPane.displayName = 'SplitPane';
