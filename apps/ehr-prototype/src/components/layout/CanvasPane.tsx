/**
 * CanvasPane Component
 *
 * Main content area with floating header and scrollable content.
 * The canvas is where chart items are displayed and OmniAdd appears inline.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { colors, spaceAround, LAYOUT } from '../../styles/foundations';
import { FloatingHeader } from './FloatingHeader';

// ============================================================================
// Types
// ============================================================================

export interface CanvasPaneProps {
  /** Header content */
  headerContent: React.ReactNode;
  /** Compact header content (shown when collapsed) */
  compactHeaderContent?: React.ReactNode;
  /** Main scrollable content */
  children: React.ReactNode;
  /** Header expanded height */
  headerExpandedHeight?: number;
  /** Header collapsed height */
  headerCollapsedHeight?: number;
  /** Whether to enable floating header behavior */
  enableFloatingHeader?: boolean;
  /** Called when scroll crosses the context bar threshold */
  onScrolledChange?: (scrolled: boolean) => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Scroll threshold (px past headerHeight) before context bar is considered scrolled away */
const SCROLL_THRESHOLD = 40;

// ============================================================================
// Component
// ============================================================================

export const CanvasPane: React.FC<CanvasPaneProps> = ({
  headerContent,
  compactHeaderContent,
  children,
  headerExpandedHeight = 72,
  headerCollapsedHeight = 48,
  enableFloatingHeader = false, // Disabled - top-level blur mask in AdaptiveLayout handles this now
  onScrolledChange,
  style,
  testID,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef(false);

  // Track scroll position and notify parent when context bar scrolls out of view
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !onScrolledChange) return;

    const handleScroll = () => {
      const scrolled = el.scrollTop > SCROLL_THRESHOLD;
      if (scrolled !== scrolledRef.current) {
        scrolledRef.current = scrolled;
        onScrolledChange(scrolled);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [onScrolledChange]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.bg.neutral.min,
    overflow: 'hidden',
    ...style,
  };

  const scrollContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    position: 'relative',
    // Padding at top so content starts below nav row, but scroll area extends under it
    paddingTop: LAYOUT.headerHeight,
  };

  const contentStyle: React.CSSProperties = {
    padding: LAYOUT.canvasContentPadding,
    paddingTop: enableFloatingHeader ? 0 : spaceAround.nudge4,
    minHeight: '100%',
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      <div style={scrollContainerStyle} ref={scrollContainerRef}>
        {enableFloatingHeader ? (
          <>
            <FloatingHeader
              expandedHeight={headerExpandedHeight}
              collapsedHeight={headerCollapsedHeight}
              scrollContainerRef={scrollContainerRef}
              compactContent={compactHeaderContent}
              testID="canvas-floating-header"
            >
              {headerContent}
            </FloatingHeader>
            <div style={contentStyle}>{children}</div>
          </>
        ) : (
          <>
            {/* No wrapper styling - continuous surface with content */}
            {headerContent}
            <div style={contentStyle}>{children}</div>
          </>
        )}
      </div>
    </div>
  );
};

CanvasPane.displayName = 'CanvasPane';
