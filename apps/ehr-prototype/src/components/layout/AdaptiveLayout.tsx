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

import React, { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { colors, zIndex as zIndexTokens, transitions, glass, GLASS_BUTTON_RADIUS, GLASS_BUTTON_HEIGHT, LAYOUT } from '../../styles/foundations';
import { LayoutStateProvider, useLayoutState, PaneId } from '../../context/LayoutStateContext';
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
  /** AI drawer content */
  aiDrawer?: React.ReactNode;
  /** @deprecated Use transcriptionPill and aiMinibar instead */
  minibar?: React.ReactNode;
  /** Transcription pill (left side of bottom bar) */
  transcriptionPill?: React.ReactNode;
  /** AI minibar (right side of bottom bar) */
  aiMinibar?: React.ReactNode;
  /** Custom header content for overview section */
  overviewHeaderContent?: React.ReactNode;
  /** Custom header content for canvas section (contextual controls like ModeSelector) */
  canvasHeaderContent?: React.ReactNode;
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
  /** AI drawer width */
  aiDrawerWidth?: number;
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
const AI_DRAWER_WIDTH = LAYOUT.aiDrawerWidth;
const HEADER_HEIGHT = LAYOUT.headerHeight;

// ============================================================================
// Inner Component (needs context)
// ============================================================================

interface AdaptiveLayoutInnerProps extends AdaptiveLayoutProps {}

const AdaptiveLayoutInner: React.FC<AdaptiveLayoutInnerProps> = ({
  menuPane,
  overviewPane,
  canvasPane,
  aiDrawer,
  minibar,
  transcriptionPill,
  aiMinibar,
  overviewHeaderContent,
  canvasHeaderContent,
  patientIdentity,
  isToDoView = false,
  todoTitle,
  todoCount,
  searchQuery = '',
  onSearchChange,
  onBack,
  menuWidth = MENU_WIDTH,
  overviewWidth = OVERVIEW_WIDTH,
  aiDrawerWidth = AI_DRAWER_WIDTH,
  headerHeight = HEADER_HEIGHT,
  style,
  testID,
}) => {
  const {
    collapsed,
    aiDrawerOpen,
    togglePane,
    toggleAIDrawer,
    closeAIDrawer,
  } = useLayoutState();

  // Keyboard shortcuts
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+\ to toggle menu
      if (e.metaKey && e.key === '\\') {
        e.preventDefault();
        togglePane('menu');
      }
      // Cmd+Shift+\ to toggle overview
      if (e.metaKey && e.shiftKey && e.key === '\\') {
        e.preventDefault();
        togglePane('overview');
      }
      // Cmd+. to toggle AI drawer
      if (e.metaKey && e.key === '.') {
        e.preventDefault();
        toggleAIDrawer();
      }
      // Escape to close AI drawer
      if (e.key === 'Escape' && aiDrawerOpen) {
        e.preventDefault();
        closeAIDrawer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePane, toggleAIDrawer, closeAIDrawer, aiDrawerOpen]);

  // ============================================================================
  // Styles
  // ============================================================================

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
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
    height: headerHeight,
    zIndex: zIndexTokens.sticky - 1, // Below nav row
    pointerEvents: 'none',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    // Smooth gradient: transparent at bottom → full blur at top
    maskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,1) 100%)',
    WebkitMaskImage: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,1) 100%)',
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
    marginLeft: collapsed.menu ? 0 : menuWidth + MENU_INSET,
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
    bottom: MENU_INSET,
    width: menuWidth,
    zIndex: zIndexTokens.sticky + 1, // Above nav row since it's part of floating layer
    // Glassmorphic styling
    ...glass.floatingPanel,
    borderRadius: GLASS_BUTTON_RADIUS, // All corners rounded (not just right side)
    border: '1px solid rgba(0, 0, 0, 0.08)', // Border on all sides
    // Animation - slide completely off-screen including inset
    transform: collapsed.menu ? `translateX(calc(-100% - ${MENU_INSET}px))` : 'translateX(0)',
    opacity: collapsed.menu ? 0 : 1,
    transition: `transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)`,
    pointerEvents: collapsed.menu ? 'none' : 'auto',
    display: 'flex',
    flexDirection: 'column',
  };

  // Menu pane internal header - button aligned with nav row buttons
  // Nav row buttons are centered at y = headerHeight/2 = 30px from viewport
  // Menu pane starts at y = floatingInset = 8px from viewport
  // So button center relative to pane = 30 - 8 = 22px, button top = 22 - 22 = 0px
  const menuPaneHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: `0 ${LAYOUT.floatingInset}px 0 0`,
    flexShrink: 0,
  };

  const menuPaneContentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
  };

  const aiDrawerOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    opacity: aiDrawerOpen ? 1 : 0,
    pointerEvents: aiDrawerOpen ? 'auto' : 'none',
    transition: `opacity ${transitions.base}`,
    zIndex: zIndexTokens.overlay - 1,
  };

  const aiDrawerContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: aiDrawerWidth,
    backgroundColor: colors.bg.neutral.base,
    borderLeft: `1px solid ${colors.border.neutral.low}`,
    transform: aiDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: `transform 300ms cubic-bezier(0.4, 0, 0.2, 1)`,
    zIndex: zIndexTokens.overlay,
    display: 'flex',
    flexDirection: 'column',
  };

  // Legacy minibar container (for backwards compatibility)
  const minibarContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: zIndexTokens.docked,
    maxWidth: 600,
    width: 'calc(100% - 32px)',
  };

  // New dual control surface container
  const dualControlSurfaceStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: zIndexTokens.docked,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 800,
    width: 'calc(100% - 32px)',
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
          menuCollapsed={collapsed.menu}
          overviewCollapsed={collapsed.overview}
          aiDrawerOpen={aiDrawerOpen}
          onToggleMenu={() => togglePane('menu')}
          onToggleOverview={() => togglePane('overview')}
          onToggleAIDrawer={toggleAIDrawer}
          menuWidth={menuWidth}
          overviewWidth={overviewWidth}
          overviewHeaderContent={overviewHeaderContent}
          canvasHeaderContent={canvasHeaderContent}
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
          aria-hidden={collapsed.menu}
        >
          {/* Menu pane internal header with close toggle */}
          <div style={menuPaneHeaderStyle}>
            <MenuToggleButton
              isOpen={true}
              onClick={() => togglePane('menu')}
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
            collapsed={collapsed.overview}
            onToggle={() => togglePane('overview')}
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

      {/* ================================================================== */}
      {/* OVERLAYS                                                           */}
      {/* ================================================================== */}

      {/* AI Drawer Overlay */}
      <div style={aiDrawerOverlayStyle} onClick={closeAIDrawer} aria-hidden="true" />

      {/* AI Drawer */}
      {aiDrawer && (
        <aside
          style={aiDrawerContainerStyle}
          data-testid="ai-drawer"
          role="complementary"
          aria-label="AI Assistant"
          aria-hidden={!aiDrawerOpen}
        >
          {aiDrawer}
        </aside>
      )}

      {/* Dual Control Surface (new) - TranscriptionPill + AIMinibar */}
      {(transcriptionPill || aiMinibar) && (
        <div style={dualControlSurfaceStyle} data-testid="control-surface-container">
          {transcriptionPill}
          {aiMinibar}
        </div>
      )}

      {/* Legacy Minibar (fallback for backwards compatibility) */}
      {minibar && !transcriptionPill && !aiMinibar && (
        <div style={minibarContainerStyle} data-testid="minibar-container">
          {minibar}
        </div>
      )}
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

// ============================================================================
// Main Component (with Provider)
// ============================================================================

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = (props) => {
  return (
    <LayoutStateProvider>
      <AdaptiveLayoutInner {...props} />
    </LayoutStateProvider>
  );
};

AdaptiveLayout.displayName = 'AdaptiveLayout';

// Export layout state hook for external use
export { useLayoutState } from '../../context/LayoutStateContext';
