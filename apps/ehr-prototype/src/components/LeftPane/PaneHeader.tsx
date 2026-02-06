/**
 * PaneHeader Component
 *
 * Header bar for the left pane with view switching icons and collapse button.
 * View icons are left-aligned, collapse button is pinned to the right.
 *
 * @see LEFT_PANE_SYSTEM.md §3 for layout specification
 */

import React from 'react';
import { Menu, Sparkles, Mic, PanelLeftClose } from 'lucide-react';
import { IconButton } from '../primitives/IconButton';
import { colors, spaceBetween, spaceAround, transitions } from '../../styles/foundations';
import type { PaneView } from '../../state/leftPane';

// ============================================================================
// Types
// ============================================================================

export interface PaneHeaderProps {
  /** Currently active view */
  activeView: PaneView;
  /** Called when a view icon is clicked */
  onViewChange: (view: PaneView) => void;
  /** Called when collapse button is clicked */
  onCollapse: () => void;
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

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    padding: 0,
    border: 'none',
    borderRadius: 6,
    backgroundColor: isActive
      ? colors.bg.accent.subtle
      : isHovered
        ? 'rgba(128, 128, 128, 0.08)'
        : 'transparent',
    color: isActive ? colors.fg.accent.primary : colors.fg.neutral.secondary,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}, color ${transitions.fast}`,
    outline: 'none',
  };

  // Active indicator bar
  const indicatorStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.fg.accent.primary,
    opacity: isActive ? 1 : 0,
    transition: `opacity ${transitions.fast}`,
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
        {icon}
      </button>
      <div style={indicatorStyle} />
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const PaneHeader: React.FC<PaneHeaderProps> = ({
  activeView,
  onViewChange,
  onCollapse,
  showTranscript = false,
  style,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    padding: `0 ${spaceAround.compact}px`,
    flexShrink: 0,
    ...style,
  };

  const viewIconsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  };

  return (
    <div style={containerStyle}>
      {/* View icons - left aligned */}
      <div style={viewIconsStyle}>
        <ViewIcon
          view="menu"
          icon={<Menu size={18} />}
          label="Menu"
          isActive={activeView === 'menu'}
          onClick={() => onViewChange('menu')}
        />
        <ViewIcon
          view="ai"
          icon={<Sparkles size={18} />}
          label="AI Assistant"
          isActive={activeView === 'ai'}
          onClick={() => onViewChange('ai')}
        />
        <ViewIcon
          view="transcript"
          icon={<Mic size={18} />}
          label="Transcription"
          isActive={activeView === 'transcript'}
          isVisible={showTranscript}
          onClick={() => onViewChange('transcript')}
        />
      </div>

      {/* Collapse button - right aligned */}
      <IconButton
        icon={<PanelLeftClose size={18} />}
        label="Collapse sidebar"
        variant="ghost"
        size="sm"
        onClick={onCollapse}
      />
    </div>
  );
};

PaneHeader.displayName = 'PaneHeader';
