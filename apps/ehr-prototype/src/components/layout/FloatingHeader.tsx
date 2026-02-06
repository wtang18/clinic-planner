/**
 * FloatingHeader Component
 *
 * Sticky header with scroll-aware blur effect and adaptive collapse.
 * Follows Apple OS 26 floating header patterns.
 */

import React, { useState, useEffect, useRef } from 'react';
import { colors, borderRadius, spaceAround, transitions, zIndex as zIndexTokens, shadows, LAYOUT } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface FloatingHeaderProps {
  /** Header content when expanded */
  children: React.ReactNode;
  /** Compact content shown when collapsed (optional) */
  compactContent?: React.ReactNode;
  /** Height when expanded */
  expandedHeight?: number;
  /** Height when collapsed */
  collapsedHeight?: number;
  /** Scroll threshold to trigger collapse (in pixels) */
  collapseThreshold?: number;
  /** Whether to show blur effect */
  showBlur?: boolean;
  /** Manual collapsed state override */
  forceCollapsed?: boolean;
  /** Called when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Reference to the scroll container */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  children,
  compactContent,
  expandedHeight = 64,
  collapsedHeight = 48,
  collapseThreshold = 50,
  showBlur = true,
  forceCollapsed,
  onCollapseChange,
  scrollContainerRef,
  style,
  testID,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const lastScrollTop = useRef(0);

  // Determine actual collapsed state
  const actuallyCollapsed = forceCollapsed !== undefined ? forceCollapsed : isCollapsed;

  // Handle scroll events
  useEffect(() => {
    const scrollContainer = scrollContainerRef?.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;

      // Track if we've scrolled at all (for blur effect)
      setHasScrolled(scrollTop > 0);

      // Only auto-collapse if not forced
      if (forceCollapsed === undefined) {
        // Collapse when scrolling down past threshold
        if (scrollTop > collapseThreshold && scrollTop > lastScrollTop.current) {
          setIsCollapsed(true);
        }
        // Expand when scrolling up or at top
        else if (scrollTop < lastScrollTop.current - 10 || scrollTop === 0) {
          setIsCollapsed(false);
        }
      }

      lastScrollTop.current = scrollTop;
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef, collapseThreshold, forceCollapsed]);

  // Notify parent of collapse changes
  useEffect(() => {
    onCollapseChange?.(actuallyCollapsed);
  }, [actuallyCollapsed, onCollapseChange]);

  const containerStyle: React.CSSProperties = {
    position: 'sticky',
    top: LAYOUT.headerHeight, // Stick below the top nav row
    zIndex: zIndexTokens.sticky - 1, // Below main nav row
    backgroundColor: 'transparent', // Continuous surface - no visible header bar
    // No backdrop blur here - handled by top-level blur mask in AdaptiveLayout
    borderBottom: 'none', // No border - seamless with content
    transition: `all ${transitions.fast}`,
    cursor: actuallyCollapsed ? 'pointer' : 'default',
    ...style,
  };

  const contentContainerStyle: React.CSSProperties = {
    height: actuallyCollapsed ? collapsedHeight : expandedHeight,
    overflow: 'hidden',
    transition: `height ${transitions.base}`,
  };

  const handleClick = () => {
    if (actuallyCollapsed && forceCollapsed === undefined) {
      setIsCollapsed(false);
    }
  };

  return (
    <div
      style={containerStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={testID}
      data-collapsed={actuallyCollapsed}
      role={actuallyCollapsed ? 'button' : undefined}
      tabIndex={actuallyCollapsed ? 0 : undefined}
      onKeyDown={(e) => {
        if (actuallyCollapsed && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div style={contentContainerStyle}>
        {actuallyCollapsed && compactContent ? compactContent : children}
      </div>

      {/* Expand hint when collapsed and hovered */}
      {actuallyCollapsed && isHovered && (
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
            backgroundColor: colors.fg.neutral.primary,
            color: colors.fg.neutral.inversePrimary,
            borderRadius: borderRadius.xs,
            fontSize: 11,
            whiteSpace: 'nowrap',
            boxShadow: shadows.sm,
            pointerEvents: 'none',
          }}
        >
          Click to expand
        </div>
      )}
    </div>
  );
};

FloatingHeader.displayName = 'FloatingHeader';
