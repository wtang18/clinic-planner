/**
 * AdaptiveLayout Component
 *
 * Root layout implementing Apple OS 26 two-layer elevation model:
 * - Floating Layer: Top nav controls + Menu Pane (glassmorphic)
 * - Content Surface: Patient Overview Pane + Canvas Pane (solid)
 *
 * The Menu Pane floats above the content surface and is conceptually
 * the same element as the menu toggle button (just in expanded form).
 */

import React, { useCallback } from 'react';
import { colors, zIndex as zIndexTokens, transitions, glass, GLASS_BUTTON_RADIUS, GLASS_BUTTON_HEIGHT, LAYOUT } from '../../styles/foundations';
import { useCoordination } from '../../hooks/useCoordination';
import { CollapsiblePane } from './CollapsiblePane';
import { FloatingNavRow } from './FloatingNavRow';

// ============================================================================
// Types
// ============================================================================

export interface AdaptiveLayoutProps {
  /** Menu pane content */
  menuPane?: React.ReactNode;
  /** Patient overview pane content */
  overviewPane?: React.ReactNode;
  /** Main canvas content */
  canvasPane: React.ReactNode;
  /** Unified AI control surface (bottom bar container) */
  aiControlSurface?: React.ReactNode;
  /** Custom header content for overview section */
  overviewHeaderContent?: React.ReactNode;
  /** Custom header content for canvas section (contextual controls like ModeSelector) */
  canvasHeaderContent?: React.ReactNode;
  /** Encounter context shown in nav row when canvas scrolls past the in-canvas context bar */
  scrolledCanvasContent?: React.ReactNode;
  /** Custom content rendered in the menu pane header (left of close button) */
  menuPaneHeaderContent?: React.ReactNode;
  /** Patient identity info (shown in nav row when overview collapsed) */
  patientIdentity?: {
    name: string;
    mrn: string;
    dob: string;
    age: number;
    gender: string;
    pronouns?: string;
  };
  /** Whether we're in To-Do view mode (hides overview pane controls) */
  isToDoView?: boolean;
  /** Title for To-Do view (e.g., "Tasks", "Inbox", "Messages", "Care") */
  todoTitle?: string;
  /** Count for To-Do view (shown as subtext) */
  todoCount?: number;
  /** Search query for To-Do view */
  searchQuery?: string;
  /** Called when search query changes */
  onSearchChange?: (query: string) => void;
  /** Called when back button is clicked */
  onBack?: () => void;
  /** Menu pane width */
  menuWidth?: number;
  /** Overview pane width */
  overviewWidth?: number;
  /** Header row height */
  headerHeight?: number;
  /** Custom styles for the root container */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Constants (using LAYOUT for consistency)
// ============================================================================

const MENU_WIDTH = LAYOUT.menuWidth;
const OVERVIEW_WIDTH = LAYOUT.overviewWidth;
const HEADER_HEIGHT = LAYOUT.headerHeight;

// ============================================================================
// Component
// ============================================================================

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  menuPane,
  overviewPane,
  canvasPane,
  aiControlSurface,
  overviewHeaderContent,
  canvasHeaderContent,
  scrolledCanvasContent,
  menuPaneHeaderContent,
  patientIdentity,
  isToDoView = false,
  todoTitle,
  todoCount,
  searchQuery = '',
  onSearchChange,
  onBack,
  menuWidth = MENU_WIDTH,
  overviewWidth = OVERVIEW_WIDTH,
  headerHeight = HEADER_HEIGHT,
  style,
  testID,
}) => {
  // Menu collapse/expand: sourced from coordination state machine
  const { state: coordState, dispatch } = useCoordination();
  const menuCollapsed = !coordState.paneExpanded;

  // Overview collapse/expand: sourced from coordination state (persists across view switches)
  const overviewCollapsed = !coordState.overviewExpanded;

  const toggleMenu = useCallback(() => {
    dispatch({ type: menuCollapsed ? 'PANE_EXPANDED' : 'PANE_COLLAPSED' });
  }, [menuCollapsed, dispatch]);

  const toggleOverview = useCallback(() => {
    dispatch({ type: overviewCollapsed ? 'OVERVIEW_EXPANDED' : 'OVERVIEW_COLLAPSED' });
  }, [overviewCollapsed, dispatch]);

  // Note: ⌘\ and ⌘⇧\ shortcuts are now handled by usePaneShortcuts hook
  // (registered via ShortcutManager, called from CaptureView)

  // ============================================================================
  // Styles
  // ============================================================================

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - var(--legend-panel-height, 0px))',
    transition: 'height 200ms ease',
    width: '100%',
    backgroundColor: colors.bg.neutral.min,
    overflow: 'hidden',
    position: 'relative',
    ...style,
  };

  // Floating layer contains nav row + floating menu pane
  // Fixed position so content can scroll underneath
  const floatingLayerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: headerHeight,
    zIndex: zIndexTokens.sticky,
    pointerEvents: 'none', // Allow clicks to pass through to content
  };

  // Blur gradient mask - creates a fade/blur effect for content scrolling under nav row
  // Uses mask-image to create graduated blur intensity (stronger at top)
  // Positioned BELOW the nav row (lower z-index) so nav controls are crisp
  const blurMaskStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    zIndex: zIndexTokens.sticky - 1, // Below nav row
    pointerEvents: 'none',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    // Steep gradient: transparent at bottom → near-opaque quickly → full at top
    maskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.92) 70%, rgba(0,0,0,1) 100%)',
    WebkitMaskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.92) 70%, rgba(0,0,0,1) 100%)',
  };

  // Floating menu pane inset (must match menuPaneContainerStyle)
  const MENU_INSET = LAYOUT.floatingInset;

  // Content surface fills entire viewport (no paddingTop)
  // Individual scroll containers handle padding so content can scroll UNDER nav row
  const contentSurfaceStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
    // NO paddingTop - scroll containers extend to top so content can scroll under nav
    // Margin when menu is open to keep content visible (not under menu)
    // Must account for menu inset: menuWidth + left inset
    marginLeft: menuCollapsed ? 0 : menuWidth + MENU_INSET,
    transition: `margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  const canvasContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 400, // Minimum canvas width
  };

  // Floating menu pane - part of floating layer, with 8px inset from all edges
  // Corner radius matches 44px button circles (22px) - rounded on all corners
  const menuPaneContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: MENU_INSET,
    left: MENU_INSET,
    bottom: `calc(${MENU_INSET}px + var(--legend-panel-height, 0px))`,
    width: menuWidth,
    zIndex: zIndexTokens.sticky + 1, // Above nav row since it's part of floating layer
    // Glassmorphic styling
    ...glass.floatingPanel,
    borderRadius: GLASS_BUTTON_RADIUS, // All corners rounded (not just right side)
    border: '1px solid rgba(0, 0, 0, 0.08)', // Border on all sides
    // Animation - slide completely off-screen including inset
    transform: menuCollapsed ? `translateX(calc(-100% - ${MENU_INSET}px))` : 'translateX(0)',
    opacity: menuCollapsed ? 0 : 1,
    transition: `transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), bottom 200ms ease`,
    pointerEvents: menuCollapsed ? 'none' : 'auto',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Clip child backgrounds at rounded corners
  };

  // Menu pane internal header - button aligned with nav row buttons
  // Nav row buttons are centered at y = headerHeight/2 = 30px from viewport
  // Menu pane starts at y = floatingInset = 8px from viewport
  // So button center relative to pane = 30 - 8 = 22px, button top = 22 - 22 = 0px
  const menuPaneHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `0 ${LAYOUT.floatingInset}px 0 0`,
    flexShrink: 0,
  };

  const menuPaneContentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Blur mask - separate from nav row so nav controls stay crisp */}
      <div style={blurMaskStyle} aria-hidden="true" />

      {/* ================================================================== */}
      {/* FLOATING LAYER                                                     */}
      {/* ================================================================== */}
      <div style={floatingLayerStyle}>
        {/* Floating Nav Row */}
        <FloatingNavRow
          menuCollapsed={menuCollapsed}
          overviewCollapsed={overviewCollapsed}
          onToggleMenu={toggleMenu}
          onToggleOverview={toggleOverview}
          menuWidth={menuWidth}
          overviewWidth={overviewWidth}
          overviewHeaderContent={overviewHeaderContent}
          canvasHeaderContent={canvasHeaderContent}
          scrolledCanvasContent={scrolledCanvasContent}
          patientIdentity={patientIdentity}
          isToDoView={isToDoView}
          todoTitle={todoTitle}
          todoCount={todoCount}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onBack={onBack}
          height={headerHeight}
        />
      </div>

      {/* Floating Menu Pane */}
      {menuPane && (
        <aside
          style={menuPaneContainerStyle}
          data-testid="menu-pane"
          role="navigation"
          aria-label="Main navigation"
          aria-hidden={menuCollapsed}
        >
          {/* Menu pane internal header with close toggle */}
          <div style={menuPaneHeaderStyle}>
            {menuPaneHeaderContent}
            <MenuToggleButton
              isOpen={true}
              onClick={toggleMenu}
              aria-label="Close menu"
            />
          </div>
          {/* Menu pane content */}
          <div style={menuPaneContentStyle}>
            {menuPane}
          </div>
        </aside>
      )}

      {/* ================================================================== */}
      {/* CONTENT SURFACE                                                    */}
      {/* ================================================================== */}
      <div style={contentSurfaceStyle}>
        {/* Overview Pane (on content surface, collapsible) */}
        {overviewPane && (
          <CollapsiblePane
            id="overview"
            width={overviewWidth}
            edge="left"
            collapsed={overviewCollapsed}
            onToggle={toggleOverview}
            toggleLabel="Toggle patient overview"
            backgroundColor={colors.bg.neutral.min}
            testID="overview-pane"
            showToggleButton={false} // Toggle is in nav row
          >
            {overviewPane}
          </CollapsiblePane>
        )}

        {/* Canvas Pane (main content) */}
        <div style={canvasContainerStyle} data-testid="canvas-pane">
          {canvasPane}
        </div>
      </div>

      {/* AI Control Surface (bottom bar container) */}
      {aiControlSurface}
    </div>
  );
};

// ============================================================================
// Menu Toggle Button (used inside menu pane when open)
// ============================================================================

interface MenuToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  'aria-label': string;
}

const MenuToggleButton: React.FC<MenuToggleButtonProps> = ({
  isOpen,
  onClick,
  'aria-label': ariaLabel,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // Match nav row glass button size (44x44) - no background fill, icon dims on hover
  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: GLASS_BUTTON_HEIGHT, // 44px - match nav row buttons
    height: GLASS_BUTTON_HEIGHT, // 44px - match nav row buttons
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: GLASS_BUTTON_RADIUS, // Match nav row button radius
    cursor: 'pointer',
    color: colors.fg.neutral.primary,
    opacity: isHovered ? 0.5 : 1,
    transition: `opacity ${transitions.fast}`,
  };

  return (
    <button
      type="button"
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {/* Sidebar icon with dots (representing menu content) - 20x20 to match nav row icons */}
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="5.5" y1="1" x2="5.5" y2="15" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="3.25" cy="5" r="0.75" fill="currentColor" />
        <circle cx="3.25" cy="8" r="0.75" fill="currentColor" />
        <circle cx="3.25" cy="11" r="0.75" fill="currentColor" />
      </svg>
    </button>
  );
};

AdaptiveLayout.displayName = 'AdaptiveLayout';
