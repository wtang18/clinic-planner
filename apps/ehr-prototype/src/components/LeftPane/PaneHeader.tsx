/**
 * PaneHeader Component
 *
 * Header bar for the left pane with view switching icons and collapse button.
 * View icons are left-aligned, collapse button is pinned to the right.
 *
 * @see LEFT_PANE_SYSTEM.md §3 for layout specification
 */

import React from 'react';
import { Menu, Sparkles, Mic } from 'lucide-react';
import { colors, spaceBetween, spaceAround, transitions, GLASS_BUTTON_HEIGHT, GLASS_BUTTON_RADIUS } from '../../styles/foundations';
import type { PaneView } from '../../state/leftPane';

// ============================================================================
// Types
// ============================================================================

export interface PaneHeaderProps {
  /** Currently active view */
  activeView: PaneView;
  /** Called when a view icon is clicked */
  onViewChange: (view: PaneView) => void;
  /** @deprecated Collapse is now handled by MenuToggleButton in AdaptiveLayout */
  onCollapse?: () => void;
  /** Whether the transcript view icon should be visible */
  showTranscript?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// ViewIcon Component
// ============================================================================

interface ViewIconProps {
  view: PaneView;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isVisible?: boolean;
  onClick: () => void;
}

const ViewIcon: React.FC<ViewIconProps> = ({
  icon,
  label,
  isActive,
  isVisible = true,
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'scale(1)' : 'scale(0.8)',
    transition: `opacity ${transitions.base}, transform ${transitions.base}`,
    pointerEvents: isVisible ? 'auto' : 'none',
  };

  // Outer button matches MenuToggleButton exactly: 44x44, no background, opacity change on hover
  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: GLASS_BUTTON_HEIGHT,      // 44px - exact match
    height: GLASS_BUTTON_HEIGHT,     // 44px - exact match
    padding: 0,
    border: 'none',
    borderRadius: GLASS_BUTTON_RADIUS, // 22px - exact match
    backgroundColor: 'transparent',   // No fill - exact match
    cursor: 'pointer',
    outline: 'none',
    // Color: accent for active, primary otherwise
    color: isActive ? colors.fg.accent.primary : colors.fg.neutral.primary,
    // Opacity dims on hover (same as MenuToggleButton)
    opacity: isHovered ? 0.5 : 1,
    transition: `opacity ${transitions.fast}, color ${transitions.fast}`,
  };

  // Inner 32x32 circle for active state indicator only
  const innerCircleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isActive ? colors.bg.accent.subtle : 'transparent',
    transition: `background-color ${transitions.fast}`,
  };

  return (
    <div style={containerStyle}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={isActive}
        style={buttonStyle}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={innerCircleStyle}>
          {icon}
        </div>
      </button>
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const PaneHeader: React.FC<PaneHeaderProps> = ({
  activeView,
  onViewChange,
  showTranscript = false,
  style,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 44, // Match MenuToggleButton height
    padding: `0 ${spaceAround.compact}px`,
    flexShrink: 0,
    ...style,
  };

  const viewIconsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled, // 4px - tighter spacing for view icons
  };

  return (
    <div style={containerStyle}>
      {/* View icons - left aligned, sized to match MenuToggleButton (20px icons) */}
      <div style={viewIconsStyle}>
        <ViewIcon
          view="menu"
          icon={<Menu size={20} />}
          label="Menu"
          isActive={activeView === 'menu'}
          onClick={() => onViewChange('menu')}
        />
        <ViewIcon
          view="ai"
          icon={<Sparkles size={20} />}
          label="AI Assistant"
          isActive={activeView === 'ai'}
          onClick={() => onViewChange('ai')}
        />
        <ViewIcon
          view="transcript"
          icon={<Mic size={20} />}
          label="Transcription"
          isActive={activeView === 'transcript'}
          isVisible={showTranscript}
          onClick={() => onViewChange('transcript')}
        />
      </div>
      {/* Collapse handled by MenuToggleButton in AdaptiveLayout */}
    </div>
  );
};

PaneHeader.displayName = 'PaneHeader';

// ============================================================================
// ViewIconsRow - Standalone view icons for AdaptiveLayout header row
// ============================================================================

export interface ViewIconsRowProps {
  /** Currently active view */
  activeView: PaneView;
  /** Called when a view icon is clicked */
  onViewChange: (view: PaneView) => void;
  /** Whether the transcript view icon should be visible */
  showTranscript?: boolean;
}

export const ViewIconsRow: React.FC<ViewIconsRowProps> = ({
  activeView,
  onViewChange,
  showTranscript = false,
}) => {
  const viewIconsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled, // 4px - tighter spacing for view icons
  };

  return (
    <div style={viewIconsStyle}>
      <ViewIcon
        view="menu"
        icon={<Menu size={20} />}
        label="Menu"
        isActive={activeView === 'menu'}
        onClick={() => onViewChange('menu')}
      />
      <ViewIcon
        view="ai"
        icon={<Sparkles size={20} />}
        label="AI Assistant"
        isActive={activeView === 'ai'}
        onClick={() => onViewChange('ai')}
      />
      <ViewIcon
        view="transcript"
        icon={<Mic size={20} />}
        label="Transcription"
        isActive={activeView === 'transcript'}
        isVisible={showTranscript}
        onClick={() => onViewChange('transcript')}
      />
    </div>
  );
};

ViewIconsRow.displayName = 'ViewIconsRow';
