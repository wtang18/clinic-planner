/**
 * CanvasPane Component
 *
 * Main content area with floating header and scrollable content.
 * The canvas is where chart items are displayed and OmniAdd appears inline.
 */

import React, { useRef } from 'react';
import { colors, LAYOUT } from '../../styles/foundations';
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
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

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
  style,
  testID,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    overflowX: 'hidden',
    position: 'relative',
    // Padding at top so content starts below nav row, but scroll area extends under it
    paddingTop: LAYOUT.headerHeight,
  };

  const contentStyle: React.CSSProperties = {
    padding: LAYOUT.canvasContentPadding,
    paddingTop: enableFloatingHeader ? 0 : LAYOUT.canvasContentPadding,
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
