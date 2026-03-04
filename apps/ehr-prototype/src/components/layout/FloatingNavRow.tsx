/**
 * FloatingNavRow Component
 *
 * Glassmorphic top navigation row that floats above the content surface.
 * Part of the floating layer along with the Menu Pane.
 *
 * Zone structure (column-aligned with panes below):
 * - Left zone: Menu toggle (when menu collapsed)
 * - Overview zone: Patient identity (when overview OPEN), width matches overview pane
 * - Canvas zone: [<] [◧] buttons (fixed position) + patient identity (when collapsed) + ModeSelector (right-aligned)
 * - Right zone: AI drawer toggle
 */

import React, { useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { colors, spaceBetween, transitions, zIndex as zIndexTokens, glass, GLASS_BUTTON_HEIGHT, GLASS_BUTTON_RADIUS, LAYOUT, typography } from '../../styles/foundations';
import { PatientIdentityHeader } from './PatientIdentityHeader';

// ============================================================================
// Types
// ============================================================================

export interface FloatingNavRowProps {
  /** Menu pane collapsed state */
  menuCollapsed: boolean;
  /** Overview pane collapsed state */
  overviewCollapsed: boolean;
  /** Toggle menu pane */
  onToggleMenu: () => void;
  /** Toggle overview pane */
  onToggleOverview: () => void;
  /** Menu pane width (for alignment) */
  menuWidth: number;
  /** Overview pane width (for alignment) */
  overviewWidth: number;
  /** Content for the overview header section (patient identity when overview open) */
  overviewHeaderContent?: React.ReactNode;
  /** Content for the canvas header section (contextual controls like ModeSelector) */
  canvasHeaderContent?: React.ReactNode;
  /** Patient identity (shown in nav row when overview collapsed) */
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
  /** Whether back button should be shown */
  showBackButton?: boolean;
  /** Encounter context shown in canvas zone when user scrolls past context bar */
  scrolledCanvasContent?: React.ReactNode;
  /** Full left+center zone override for non-encounter workspaces (replaces patient-specific content) */
  workspaceContent?: React.ReactNode;
  /** Height of the header row */
  height?: number;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_HEIGHT = 60; // Increased to accommodate 44px buttons with padding

// ============================================================================
// Component
// ============================================================================

export const FloatingNavRow: React.FC<FloatingNavRowProps> = ({
  menuCollapsed,
  overviewCollapsed,
  onToggleMenu,
  onToggleOverview,
  menuWidth,
  overviewWidth,
  overviewHeaderContent,
  canvasHeaderContent,
  patientIdentity,
  isToDoView = false,
  todoTitle,
  todoCount,
  searchQuery = '',
  onSearchChange,
  onBack,
  showBackButton = false,
  scrolledCanvasContent,
  workspaceContent,
  height = DEFAULT_HEIGHT,
  style,
  testID,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  // ============================================================================
  // Glassmorphic Button Style (44px circles)
  // Hover: background fill + icon dims (becomes lighter/more transparent)
  // ============================================================================

  const glassButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: GLASS_BUTTON_HEIGHT,
    height: GLASS_BUTTON_HEIGHT,
    ...glass.button,
    borderRadius: GLASS_BUTTON_RADIUS,
    cursor: 'pointer',
    color: colors.fg.neutral.primary,
    transition: `all ${transitions.fast}`,
  };

  const handleGlassButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHover: boolean) => {
    if (isHover) {
      e.currentTarget.style.backgroundColor = glass.buttonHover.backgroundColor;
      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
      // Icon dims on hover - becomes lighter/more transparent
      e.currentTarget.style.opacity = '0.5';
    } else {
      e.currentTarget.style.backgroundColor = glass.button.backgroundColor;
      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
      e.currentTarget.style.opacity = '1';
    }
  };

  // ============================================================================
  // Zone Styles - Aligned with content panes below
  // ============================================================================

  // Determine where the menu button should render
  // For To-Do view, always put menu button in left zone (no overview zone)
  const menuBtnInLeftZone = isToDoView ? menuCollapsed : (menuCollapsed && overviewCollapsed);
  const menuBtnInOverviewZone = isToDoView ? false : (menuCollapsed && !overviewCollapsed);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    height,
    minHeight: height,
    ...glass.floating,
    // Override glass.floating to allow content to scroll under the nav row
    backgroundColor: 'transparent',
    backdropFilter: 'none',
    borderBottom: 'none',
    zIndex: zIndexTokens.sticky,
    flexShrink: 0,
    padding: `0 ${LAYOUT.floatingInset}px`, // Match menu pane inset for alignment
    gap: 0, // Zones handle their own spacing
    pointerEvents: 'auto', // Re-enable clicks for nav controls (parent has pointerEvents: none)
    ...style,
  };

  // Left zone: Shows menu toggle when collapsed, spacer when open
  // For To-Do view: always show if menu collapsed (no overview zone to share with)
  const leftZoneStyle: React.CSSProperties = {
    display: menuBtnInLeftZone || !menuCollapsed ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spaceBetween.relatedCompact,
    flexShrink: 0,
    // When menu open: reserve menuWidth to align with content surface marginLeft
    // When both closed: auto-size to fit the toggle button
    width: menuCollapsed ? 'auto' : menuWidth,
    // 16px gap between button groups when both panes closed
    marginRight: menuBtnInLeftZone ? LAYOUT.buttonGroupGap : 0,
    overflow: 'hidden',
    transition: `all 250ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  // Overview zone: Patient identity (when overview OPEN), width matches overview pane
  // Hidden completely for To-Do view
  const overviewZoneStyle: React.CSSProperties = {
    display: isToDoView ? 'none' : 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    width: (isToDoView || overviewCollapsed) ? 0 : overviewWidth,
    minWidth: (isToDoView || overviewCollapsed) ? 0 : overviewWidth,
    maxWidth: (isToDoView || overviewCollapsed) ? 0 : overviewWidth,
    // Left padding: floatingInset for menu button alignment when it's in this zone, otherwise content padding
    paddingLeft: (isToDoView || overviewCollapsed) ? 0 : (menuBtnInOverviewZone ? LAYOUT.floatingInset : LAYOUT.overviewContentPadding),
    paddingRight: (isToDoView || overviewCollapsed) ? 0 : LAYOUT.overviewContentPadding,
    transition: `all 250ms cubic-bezier(0.4, 0, 0.2, 1)`,
    overflow: 'hidden',
    flexShrink: 0,
  };

  // Canvas zone: [<] [◧] + patient identity (when collapsed) + ModeSelector (right-aligned)
  // For To-Do view: no overview toggle, back button at left edge of canvas content
  // 20px padding when menu pane is open, 0 when menu is closed
  const canvasZoneStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceBetween.related,
    // For To-Do view: padding only when menu is open (no overview pane to consider)
    // For patient view: padding when any pane is open
    paddingLeft: isToDoView
      ? (menuCollapsed ? 0 : LAYOUT.canvasContentPadding)
      : ((menuCollapsed && overviewCollapsed) ? 0 : LAYOUT.canvasContentPadding),
    paddingRight: 16, // 16px gap before AI button
    overflow: 'hidden',
  };

  return (
    <header style={containerStyle} data-testid={testID}>
      {/* ================================================================ */}
      {/* LEFT ZONE: Menu toggle (only when menu collapsed)                */}
      {/* ================================================================ */}
      <div style={leftZoneStyle}>
        {menuCollapsed && (
          <button
            type="button"
            style={glassButtonStyle}
            onClick={onToggleMenu}
            onMouseEnter={(e) => handleGlassButtonHover(e, true)}
            onMouseLeave={(e) => handleGlassButtonHover(e, false)}
            aria-label="Show menu"
            title="Show menu"
          >
            {/* Sidebar icon with dots (representing menu content) */}
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <line x1="5.5" y1="1" x2="5.5" y2="15" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="3.25" cy="5" r="0.75" fill="currentColor" />
              <circle cx="3.25" cy="8" r="0.75" fill="currentColor" />
              <circle cx="3.25" cy="11" r="0.75" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>

      {/* ================================================================ */}
      {/* OVERVIEW ZONE: Patient identity (when overview OPEN)             */}
      {/* Column-aligned with overview pane below                          */}
      {/* When menu closed + overview open, menu button is here too        */}
      {/* ================================================================ */}
      <div style={overviewZoneStyle}>
        {!overviewCollapsed && (
          <>
            {/* Menu button - rendered here when menu closed + overview open */}
            {menuBtnInOverviewZone && (
              <button
                type="button"
                style={glassButtonStyle}
                onClick={onToggleMenu}
                onMouseEnter={(e) => handleGlassButtonHover(e, true)}
                onMouseLeave={(e) => handleGlassButtonHover(e, false)}
                aria-label="Show menu"
                title="Show menu"
              >
                {/* Sidebar icon with dots (representing menu content) */}
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <line x1="5.5" y1="1" x2="5.5" y2="15" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="3.25" cy="5" r="0.75" fill="currentColor" />
                  <circle cx="3.25" cy="8" r="0.75" fill="currentColor" />
                  <circle cx="3.25" cy="11" r="0.75" fill="currentColor" />
                </svg>
              </button>
            )}
            {/* Patient identity header - no kebab menu (handled elsewhere) */}
            {overviewHeaderContent}
          </>
        )}
      </div>

      {/* ================================================================ */}
      {/* CANVAS ZONE: Controls depend on view mode                         */}
      {/* Workspace override: workspaceContent replaces all patient-specific */}
      {/* Patient view: [<] [◧] + patient identity (collapsed) + ModeSelector */}
      {/* To-Do view: [<] + Search bar (right-aligned)                      */}
      {/* ================================================================ */}
      <div style={canvasZoneStyle}>
        {workspaceContent ? (
          /* Workspace-driven content: full left+center zone override */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: LAYOUT.buttonGap, flex: 1 }}>
              {/* Back chevron */}
              <button
                type="button"
                style={glassButtonStyle}
                onClick={onBack || (() => {})}
                onMouseEnter={(e) => handleGlassButtonHover(e, true)}
                onMouseLeave={(e) => handleGlassButtonHover(e, false)}
                aria-label="Go back"
                title="Go back"
              >
                <ChevronLeft size={20} />
              </button>
              {workspaceContent}
            </div>
            {/* Right side: canvas header content */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: spaceBetween.related }}>
              {canvasHeaderContent}
            </div>
          </>
        ) : (
          /* Default encounter/todo content */
          <>
            {/* Left side: Back button + Overview toggle (patient only) + Patient identity (when collapsed) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: LAYOUT.buttonGap, // 12px between buttons
            }}>
              {/* Back chevron - ALWAYS in canvas zone */}
              <button
                type="button"
                style={glassButtonStyle}
                onClick={onBack || (() => {/* TODO: Canvas back navigation */})}
                onMouseEnter={(e) => handleGlassButtonHover(e, true)}
                onMouseLeave={(e) => handleGlassButtonHover(e, false)}
                aria-label="Go back"
                title="Go back"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Overview toggle - Only in patient view (right of back button) */}
              {!isToDoView && (
                <button
                  type="button"
                  style={glassButtonStyle}
                  onClick={onToggleOverview}
                  onMouseEnter={(e) => handleGlassButtonHover(e, true)}
                  onMouseLeave={(e) => handleGlassButtonHover(e, false)}
                  aria-label={overviewCollapsed ? 'Show patient overview' : 'Hide patient overview'}
                  title={overviewCollapsed ? 'Show patient overview' : 'Hide patient overview'}
                >
                  {/* Sidebar icon with triangle - direction changes based on state */}
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <line x1="5.5" y1="1" x2="5.5" y2="15" stroke="currentColor" strokeWidth="1.5" />
                    {/* Triangle: right (expand) when collapsed, left (collapse) when open */}
                    {overviewCollapsed ? (
                      <path d="M11 8L8 5.5V10.5L11 8Z" fill="currentColor" />
                    ) : (
                      <path d="M8 8L11 5.5V10.5L8 8Z" fill="currentColor" />
                    )}
                  </svg>
                </button>
              )}

              {/* Patient identity - shown inline when overview is collapsed (patient view only) */}
              {!isToDoView && overviewCollapsed && patientIdentity && (
                <PatientIdentityHeader
                  name={patientIdentity.name}
                  mrn={patientIdentity.mrn}
                  dob={patientIdentity.dob}
                  age={patientIdentity.age}
                  gender={patientIdentity.gender}
                  pronouns={patientIdentity.pronouns}
                  variant="stacked"
                  showMenuButton={false}
                  style={{ marginLeft: LAYOUT.buttonGap }} // 12px gap from buttons
                />
              )}

              {/* Encounter context — appears when canvas content scrolls past the in-canvas context bar */}
              {!isToDoView && scrolledCanvasContent && (
                <>
                  {/* Vertical divider when patient identity is also showing */}
                  {overviewCollapsed && patientIdentity && (
                    <div style={{
                      width: 1,
                      height: 28,
                      backgroundColor: colors.border.neutral.low,
                      flexShrink: 0,
                      marginLeft: spaceBetween.relatedCompact,
                    }} />
                  )}
                  <div style={{ marginLeft: overviewCollapsed && patientIdentity ? spaceBetween.relatedCompact : LAYOUT.buttonGap }}>
                    {scrolledCanvasContent}
                  </div>
                </>
              )}

              {/* To-Do view title and count */}
              {isToDoView && todoTitle && (
                <div style={{ marginLeft: LAYOUT.buttonGap, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 600,
                    fontFamily: typography.fontFamily.sans,
                    color: colors.fg.neutral.primary,
                    lineHeight: 1.2,
                  }}>
                    {todoTitle}
                  </span>
                  {todoCount !== undefined && (
                    <span style={{
                      fontSize: 12,
                      fontFamily: typography.fontFamily.sans,
                      color: colors.fg.neutral.secondary,
                      lineHeight: 1.3,
                    }}>
                      {todoCount} {todoCount === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right side: Contextual controls - RIGHT ALIGNED */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: spaceBetween.related }}>
              {/* To-Do view: Glassmorphic search bar */}
              {isToDoView && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: GLASS_BUTTON_HEIGHT,
                    width: 280,
                    ...glass.button,
                    borderRadius: GLASS_BUTTON_RADIUS,
                    paddingLeft: 12,
                    paddingRight: 12,
                    gap: 8,
                    transition: `all ${transitions.fast}`,
                    border: isSearchFocused ? `1px solid ${colors.border.accent.medium}` : glass.button.border,
                  }}
                >
                  <Search size={16} color={colors.fg.neutral.secondary} style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: 13,
                      fontFamily: typography.fontFamily.sans,
                      color: colors.fg.neutral.primary,
                    }}
                  />
                </div>
              )}

              {/* Patient view: ModeSelector or other canvas header content */}
              {!isToDoView && canvasHeaderContent}
            </div>
          </>
        )}
      </div>

    </header>
  );
};

FloatingNavRow.displayName = 'FloatingNavRow';
