/**
 * LeftPaneContainer Component
 *
 * Main container for the multi-view left pane system.
 * Manages the pane header with view switching and renders the appropriate content.
 *
 * When collapsed, renders a small expand tab. When expanded, renders the full
 * pane with header and content area.
 *
 * @see LEFT_PANE_SYSTEM.md for full specification
 */

import React from 'react';
import { PanelLeft } from 'lucide-react';
import { PaneHeader } from './PaneHeader';
import { PaneContent } from './PaneContent';
import { IconButton } from '../primitives/IconButton';
import { useLeftPane } from '../../hooks/useLeftPane';
import { colors, transitions, spaceAround } from '../../styles/foundations';
import type { MenuPaneProps } from '../layout/MenuPane';

// ============================================================================
// Types
// ============================================================================

export interface LeftPaneContainerProps {
  /** Props to pass through to MenuPane when in menu view */
  menuPaneProps?: Omit<MenuPaneProps, 'style'>;
  /** Whether a transcription session exists for current patient */
  hasTranscriptionSession?: boolean;
  /** Pane width when expanded */
  width?: string | number;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// CollapsedPaneTab Component
// ============================================================================

interface CollapsedPaneTabProps {
  onExpand: () => void;
}

const CollapsedPaneTab: React.FC<CollapsedPaneTabProps> = ({ onExpand }) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: spaceAround.compact,
    width: 48,
    height: '100%',
    backgroundColor: colors.bg.neutral.base,
    borderRight: `1px solid ${colors.border.neutral.low}`,
  };

  return (
    <div style={containerStyle}>
      <IconButton
        icon={<PanelLeft size={18} />}
        label="Expand sidebar"
        variant="ghost"
        size="sm"
        onClick={onExpand}
      />
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const LeftPaneContainer: React.FC<LeftPaneContainerProps> = ({
  menuPaneProps,
  hasTranscriptionSession = false,
  width = 280,
  style,
}) => {
  const { state, actions } = useLeftPane();
  const { isExpanded, activeView } = state;

  // Collapsed state - show expand tab
  if (!isExpanded) {
    return <CollapsedPaneTab onExpand={actions.expand} />;
  }

  // Expanded state - full pane
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: typeof width === 'number' ? `${width}px` : width,
    height: '100%',
    backgroundColor: colors.bg.neutral.base,
    borderRight: `1px solid ${colors.border.neutral.low}`,
    overflow: 'hidden',
    transition: `width ${transitions.base}`,
    ...style,
  };

  // Gradient fade for header zone (subtle, not harsh separator)
  const headerZoneStyle: React.CSSProperties = {
    position: 'relative',
    flexShrink: 0,
  };

  const gradientOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    background: `linear-gradient(to bottom, ${colors.bg.neutral.base}, transparent)`,
    pointerEvents: 'none',
    zIndex: 1,
  };

  return (
    <div style={containerStyle}>
      {/* Header zone with gradient fade */}
      <div style={headerZoneStyle}>
        <PaneHeader
          activeView={activeView}
          onViewChange={actions.switchView}
          onCollapse={actions.collapse}
          showTranscript={hasTranscriptionSession}
        />
        <div style={gradientOverlayStyle} />
      </div>

      {/* Content area */}
      <PaneContent activeView={activeView} menuPaneProps={menuPaneProps} />
    </div>
  );
};

LeftPaneContainer.displayName = 'LeftPaneContainer';
