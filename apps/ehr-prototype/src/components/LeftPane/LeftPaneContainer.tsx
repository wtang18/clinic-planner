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
import { PaneContent } from './PaneContent';
import { IconButton } from '../primitives/IconButton';
import { useLeftPane } from '../../hooks/useLeftPane';
import { colors, spaceAround } from '../../styles/foundations';
import type { MenuPaneProps } from '../layout/MenuPane';
import type { AIDrawerViewProps } from './AIDrawer';
import type { TranscriptionDrawerViewProps } from './TranscriptionDrawer';

// ============================================================================
// Types
// ============================================================================

export interface LeftPaneContainerProps {
  /** Props to pass through to MenuPane when in menu view */
  menuPaneProps?: Omit<MenuPaneProps, 'style'>;
  /** Props to pass through to AIDrawerView when in AI view */
  aiDrawerProps?: Omit<AIDrawerViewProps, 'style' | 'children'>;
  /** Footer component for AI drawer (quick actions + input) */
  aiDrawerFooter?: React.ReactNode;
  /** Props to pass through to TranscriptionDrawerView when in transcript view */
  transcriptionDrawerProps?: Omit<TranscriptionDrawerViewProps, 'style'>;
  /** Whether a transcription session exists for current patient */
  hasTranscriptionSession?: boolean;
  /** Pane width when expanded */
  width?: string | number;
  /** Custom styles */
  style?: React.CSSProperties;
  /**
   * Override view change handler for coordination with bottom bar.
   * If not provided, uses internal useLeftPane actions.
   * @see useDrawerCoordination for coordinated actions
   */
  onViewChange?: (view: 'menu' | 'ai' | 'transcript') => void;
  /**
   * Override collapse handler for coordination with bottom bar.
   * If not provided, uses internal useLeftPane actions.
   * @see useDrawerCoordination for coordinated actions
   */
  onCollapse?: () => void;
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
  aiDrawerProps,
  aiDrawerFooter,
  transcriptionDrawerProps,
  // Note: hasTranscriptionSession, onViewChange, onCollapse are now handled
  // by AdaptiveLayout's menuPaneHeaderContent (ViewIconsRow)
}) => {
  const { state, actions } = useLeftPane();
  const { isExpanded, activeView } = state;

  // Collapsed state - show expand tab
  if (!isExpanded) {
    return <CollapsedPaneTab onExpand={actions.expand} />;
  }

  // Return only PaneContent - ViewIcons are now rendered in AdaptiveLayout's header row
  return (
    <PaneContent
      activeView={activeView}
      menuPaneProps={menuPaneProps}
      aiDrawerProps={aiDrawerProps}
      aiDrawerFooter={aiDrawerFooter}
      transcriptionDrawerProps={transcriptionDrawerProps}
    />
  );
};

LeftPaneContainer.displayName = 'LeftPaneContainer';
