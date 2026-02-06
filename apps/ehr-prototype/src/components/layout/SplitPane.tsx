/**
 * SplitPane Component
 *
 * Resizable split pane for flexible layouts.
 */

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { colors, borderRadius, transitions } from '../../styles/foundations';

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

  const handleCollapseLeft = () => {
    setIsLeftCollapsed(!isLeftCollapsed);
    setIsRightCollapsed(false);
  };

  const handleCollapseRight = () => {
    setIsRightCollapsed(!isRightCollapsed);
    setIsLeftCollapsed(false);
  };

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
    backgroundColor: isDragging || isHovered ? colors.bg.accent.subtle : colors.border.neutral.low,
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
    backgroundColor: colors.fg.neutral.disabled,
  };

  const collapseButtonStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${colors.border.neutral.medium}`,
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
      <div style={leftPaneStyle}>
        {!isLeftCollapsed && left}
      </div>

      <div
        style={dividerStyle}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={dividerGripStyle}>
          <div style={gripDotStyle} />
          <div style={gripDotStyle} />
          <div style={gripDotStyle} />
        </div>

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
            {isHorizontal ? (
              isLeftCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />
            ) : (
              isLeftCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />
            )}
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
            {isHorizontal ? (
              isRightCollapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />
            ) : (
              isRightCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />
            )}
          </button>
        )}
      </div>

      <div style={rightPaneStyle}>
        {!isRightCollapsed && right}
      </div>

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
