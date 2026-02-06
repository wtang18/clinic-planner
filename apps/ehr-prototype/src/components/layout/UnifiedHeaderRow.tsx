/**
 * UnifiedHeaderRow Component
 *
 * Top control bar spanning all panes following Apple OS 26 style.
 * Each pane's controls occupy its column with vertical alignment maintained
 * when panes collapse/expand.
 */

import React from 'react';
import { Menu, ChevronLeft, ChevronRight, Sparkles, Settings, User } from 'lucide-react';
import { colors, borderRadius, spaceAround, spaceBetween, transitions, typography, zIndex as zIndexTokens } from '../../styles/foundations';
import { FloatingToggleButton } from './FloatingToggleButton';

// ============================================================================
// Types
// ============================================================================

export interface UnifiedHeaderRowProps {
  /** Menu pane collapsed state */
  menuCollapsed: boolean;
  /** Overview pane collapsed state */
  overviewCollapsed: boolean;
  /** AI drawer open state */
  aiDrawerOpen: boolean;
  /** Toggle menu pane */
  onToggleMenu: () => void;
  /** Toggle overview pane */
  onToggleOverview: () => void;
  /** Toggle AI drawer */
  onToggleAIDrawer: () => void;
  /** Menu pane width */
  menuWidth: number;
  /** Overview pane width */
  overviewWidth: number;
  /** Content for the menu header section */
  menuHeaderContent?: React.ReactNode;
  /** Content for the overview header section */
  overviewHeaderContent?: React.ReactNode;
  /** Content for the canvas header section */
  canvasHeaderContent?: React.ReactNode;
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

const DEFAULT_HEIGHT = 52;

// ============================================================================
// Component
// ============================================================================

export const UnifiedHeaderRow: React.FC<UnifiedHeaderRowProps> = ({
  menuCollapsed,
  overviewCollapsed,
  aiDrawerOpen,
  onToggleMenu,
  onToggleOverview,
  onToggleAIDrawer,
  menuWidth,
  overviewWidth,
  menuHeaderContent,
  overviewHeaderContent,
  canvasHeaderContent,
  height = DEFAULT_HEIGHT,
  style,
  testID,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    height,
    minHeight: height,
    backgroundColor: colors.bg.neutral.base,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    zIndex: zIndexTokens.sticky,
    flexShrink: 0,
    ...style,
  };

  const menuSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    width: menuCollapsed ? 'auto' : menuWidth,
    minWidth: menuCollapsed ? 'auto' : menuWidth,
    maxWidth: menuCollapsed ? 'auto' : menuWidth,
    padding: `0 ${spaceAround.compact}px`,
    transition: `all 250ms cubic-bezier(0.4, 0, 0.2, 1)`,
    overflow: 'hidden',
    flexShrink: 0,
  };

  const overviewSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    width: overviewCollapsed ? 0 : overviewWidth,
    minWidth: overviewCollapsed ? 0 : overviewWidth,
    maxWidth: overviewCollapsed ? 0 : overviewWidth,
    padding: overviewCollapsed ? 0 : `0 ${spaceAround.compact}px`,
    borderLeft: overviewCollapsed ? 'none' : `1px solid ${colors.border.neutral.low}`,
    transition: `all 250ms cubic-bezier(0.4, 0, 0.2, 1)`,
    overflow: 'hidden',
    flexShrink: 0,
  };

  const canvasSectionStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceBetween.related,
    padding: `0 ${spaceAround.default}px`,
    borderLeft: `1px solid ${colors.border.neutral.low}`,
    overflow: 'hidden',
  };

  const aiDrawerSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${spaceAround.compact}px`,
    borderLeft: `1px solid ${colors.border.neutral.low}`,
    flexShrink: 0,
  };

  const iconButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    color: colors.fg.neutral.secondary,
    transition: `all ${transitions.fast}`,
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHover: boolean) => {
    e.currentTarget.style.backgroundColor = isHover ? colors.bg.neutral.subtle : 'transparent';
    e.currentTarget.style.color = isHover ? colors.fg.neutral.primary : colors.fg.neutral.secondary;
  };

  return (
    <header style={containerStyle} data-testid={testID}>
      {/* Menu section */}
      <div style={menuSectionStyle}>
        <button
          type="button"
          style={iconButtonStyle}
          onClick={onToggleMenu}
          onMouseEnter={(e) => handleButtonHover(e, true)}
          onMouseLeave={(e) => handleButtonHover(e, false)}
          aria-label={menuCollapsed ? 'Show menu' : 'Hide menu'}
          title={menuCollapsed ? 'Show menu' : 'Hide menu'}
        >
          <Menu size={18} />
        </button>

        {!menuCollapsed && (
          <button
            type="button"
            style={iconButtonStyle}
            onClick={onToggleOverview}
            onMouseEnter={(e) => handleButtonHover(e, true)}
            onMouseLeave={(e) => handleButtonHover(e, false)}
            aria-label={overviewCollapsed ? 'Show patient overview' : 'Hide patient overview'}
            title={overviewCollapsed ? 'Show patient overview' : 'Hide patient overview'}
          >
            {overviewCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}

        {!menuCollapsed && menuHeaderContent}
      </div>

      {/* Overview section */}
      {!overviewCollapsed && (
        <div style={overviewSectionStyle}>
          {overviewHeaderContent}
        </div>
      )}

      {/* Canvas section (flex: 1) */}
      <div style={canvasSectionStyle}>
        {/* Left side - collapsed pane toggles when menu is collapsed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.relatedCompact }}>
          {menuCollapsed && (
            <button
              type="button"
              style={iconButtonStyle}
              onClick={onToggleMenu}
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => handleButtonHover(e, false)}
              aria-label="Show menu"
              title="Show menu"
            >
              <Menu size={18} />
            </button>
          )}

          {overviewCollapsed && (
            <button
              type="button"
              style={{
                ...iconButtonStyle,
                display: 'flex',
                alignItems: 'center',
                gap: spaceBetween.coupled,
                width: 'auto',
                padding: `0 ${spaceAround.tight}px`,
              }}
              onClick={onToggleOverview}
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => handleButtonHover(e, false)}
              aria-label="Show patient overview"
              title="Show patient overview"
            >
              <User size={16} />
              <span
                style={{
                  fontSize: 13,
                  fontFamily: typography.fontFamily.sans,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                Patient
              </span>
            </button>
          )}
        </div>

        {/* Center - canvas header content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {canvasHeaderContent}
        </div>

        {/* Right side - mode selector and settings are passed in canvasHeaderContent */}
      </div>

      {/* AI Drawer section */}
      <div style={aiDrawerSectionStyle}>
        <button
          type="button"
          style={{
            ...iconButtonStyle,
            backgroundColor: aiDrawerOpen ? colors.bg.accent.subtle : 'transparent',
            color: aiDrawerOpen ? colors.fg.accent.primary : colors.fg.neutral.secondary,
          }}
          onClick={onToggleAIDrawer}
          onMouseEnter={(e) => {
            if (!aiDrawerOpen) handleButtonHover(e, true);
          }}
          onMouseLeave={(e) => {
            if (!aiDrawerOpen) handleButtonHover(e, false);
          }}
          aria-label={aiDrawerOpen ? 'Close AI assistant' : 'Open AI assistant'}
          aria-expanded={aiDrawerOpen}
          title={aiDrawerOpen ? 'Close AI assistant' : 'Open AI assistant'}
        >
          <Sparkles size={18} />
        </button>
      </div>
    </header>
  );
};

UnifiedHeaderRow.displayName = 'UnifiedHeaderRow';
