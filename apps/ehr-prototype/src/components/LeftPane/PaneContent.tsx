/**
 * PaneContent Component
 *
 * Content switcher that renders the appropriate view based on activeView.
 * Menu view renders the existing MenuPane, AI drawer renders the full AI view,
 * Transcript drawer renders the full transcription view.
 */

import React from 'react';
import { MenuPane } from '../layout/MenuPane';
import type { MenuPaneProps } from '../layout/MenuPane';
import { AIDrawerView } from './AIDrawer';
import type { AIDrawerViewProps } from './AIDrawer';
import { TranscriptionDrawerView } from './TranscriptionDrawer';
import type { TranscriptionDrawerViewProps } from './TranscriptionDrawer';
import type { PaneView } from '../../state/leftPane';

// ============================================================================
// Types
// ============================================================================

export interface PaneContentProps {
  /** Active view to render */
  activeView: PaneView;
  /** Props to pass through to MenuPane */
  menuPaneProps?: Omit<MenuPaneProps, 'style'>;
  /** Props to pass through to AIDrawerView */
  aiDrawerProps?: Omit<AIDrawerViewProps, 'style' | 'children'>;
  /** Footer component for AI drawer (quick actions + input) */
  aiDrawerFooter?: React.ReactNode;
  /** Props to pass through to TranscriptionDrawerView */
  transcriptionDrawerProps?: Omit<TranscriptionDrawerViewProps, 'style'>;
}

// ============================================================================
// Component
// ============================================================================

export const PaneContent: React.FC<PaneContentProps> = ({
  activeView,
  menuPaneProps,
  aiDrawerProps,
  aiDrawerFooter,
  transcriptionDrawerProps,
}) => {
  const containerStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const renderContent = () => {
    switch (activeView) {
      case 'menu':
        return <MenuPane {...menuPaneProps} style={{ flex: 1 }} />;
      case 'ai':
        return (
          <AIDrawerView {...aiDrawerProps} style={{ flex: 1 }}>
            {aiDrawerFooter}
          </AIDrawerView>
        );
      case 'transcript':
        // Provide defaults for required props if not provided
        const defaultTranscriptProps: TranscriptionDrawerViewProps = {
          patientName: 'Patient',
          patientInitials: 'PT',
          status: 'idle',
          ...transcriptionDrawerProps,
        };
        return <TranscriptionDrawerView {...defaultTranscriptProps} style={{ flex: 1 }} />;
      default:
        return null;
    }
  };

  return <div style={containerStyle}>{renderContent()}</div>;
};

PaneContent.displayName = 'PaneContent';
