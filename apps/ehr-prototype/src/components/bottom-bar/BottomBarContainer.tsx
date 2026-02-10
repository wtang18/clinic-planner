/**
 * BottomBarContainer Component
 *
 * CSS Grid-based orchestrator that coordinates the Transcription and AI modules.
 * Reads visibility and grid template from the coordination state machine.
 *
 * - Modules at drawer tier are hidden (not rendered in the bottom bar).
 * - When both modules are in drawer, the entire bar returns null.
 * - Grid template uses CSS custom properties from coordination selectors.
 *
 * See: /docs/features/anchor-bar-palette-pane-system/COORDINATION_STATE_MACHINE.md
 */

import React, { useCallback } from 'react';
import { TranscriptionModule } from './transcription';
import { AISurfaceModule } from './ai';
import { useBottomBar, useTranscription, useTierControls } from '../../hooks/useBottomBar';
import { useCoordination } from '../../hooks/useCoordination';
import { spaceAround, zIndex } from '../../styles/foundations';
import type { AIMinibarContent } from '../ai-ui/AIMinibar';
import type { Suggestion, Alert } from '../../types/suggestions';

// ============================================================================
// Constants — CSS custom property values for coordination grid tokens
// ============================================================================

const GRID_TOKEN_VALUES: React.CSSProperties = {
  '--bottom-bar-palette-width': '432px',
  '--bottom-bar-anchor-width': '48px',
  '--bottom-bar-gap': '8px',
  '--bottom-bar-bar-width-tm': '160px',
  '--bottom-bar-bar-width-ai': '320px',
} as React.CSSProperties;

// ============================================================================
// Types
// ============================================================================

export interface BottomBarContainerProps {
  /** AI content for minibar */
  aiContent?: AIMinibarContent;
  /** AI suggestions */
  suggestions?: Suggestion[];
  /** AI alerts */
  alerts?: Alert[];
  /** Called when a suggestion is accepted */
  onSuggestionAccept?: (id: string) => void;
  /** Called when a suggestion is dismissed */
  onSuggestionDismiss?: (id: string) => void;
  /** Called when an alert is acknowledged */
  onAlertAcknowledge?: (id: string) => void;
  /** Called when generate note is clicked */
  onGenerateNote?: () => void;
  /** Called when check interactions is clicked */
  onCheckInteractions?: () => void;
  /** Whether transcription is enabled */
  transcriptionEnabled?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const BottomBarContainer: React.FC<BottomBarContainerProps> = ({
  aiContent = { type: 'idle' },
  suggestions = [],
  alerts = [],
  onSuggestionAccept,
  onSuggestionDismiss,
  onAlertAcknowledge,
  onGenerateNote,
  onCheckInteractions,
  transcriptionEnabled = true,
  style,
  testID = 'bottom-bar-container',
}) => {
  const { state, actions, activeSession } = useBottomBar();
  const {
    transcriptionTier,
    aiTier,
    setTranscriptionTier,
    setAITier,
  } = useTierControls();
  const transcription = useTranscription();

  // Coordination state — visibility, grid template, hidden flag
  const { bottomBarVisibility, gridTemplate: coordGridTemplate, isBottomBarHidden } = useCoordination();

  // Early return when both modules are in drawer
  if (isBottomBarHidden) return null;

  // Effective tiers: modules at drawer are hidden (not rendered), so only bar/anchor/palette matter
  const aiVisible = bottomBarVisibility.ai.visible;
  const tmVisible = bottomBarVisibility.transcription.visible;
  const effectiveAITier = aiVisible ? (bottomBarVisibility.ai.tier === 'anchor' ? 'mini' : bottomBarVisibility.ai.tier!) : 'bar';
  const effectiveTranscriptionTier = tmVisible ? (bottomBarVisibility.transcription.tier === 'anchor' ? 'mini' : bottomBarVisibility.transcription.tier!) : 'bar';

  // Handle tier changes
  const handleAITierChange = useCallback((tier: 'bar' | 'mini' | 'palette' | 'drawer') => {
    setAITier(tier);
  }, [setAITier]);

  const handleTranscriptionTierChange = useCallback((tier: 'bar' | 'mini' | 'palette' | 'drawer') => {
    setTranscriptionTier(tier);
  }, [setTranscriptionTier]);

  // Container styles - fixed at bottom
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: zIndex.modal,
    padding: spaceAround.tight,
    pointerEvents: 'none',
    ...style,
  };

  // Inner wrapper for centering
  const innerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  };

  // Wrapper — uses CSS custom properties for coordination grid tokens
  const gridWrapperStyle: React.CSSProperties = {
    width: 'max-content',
    ...GRID_TOKEN_VALUES,
  };

  // CSS Grid with coordination-driven template.
  // Gap is encoded as a column in the grid template (not CSS `gap`).
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: coordGridTemplate,
    alignItems: 'flex-end',
    pointerEvents: 'auto',
    transition: 'grid-template-columns 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // Badge count
  const activeSuggestionCount = suggestions.filter((s) => s.status === 'active').length;
  const unackedAlertCount = alerts.filter((a) => !a.acknowledgedAt).length;
  const badgeCount = activeSuggestionCount + unackedAlertCount;

  return (
    <div style={containerStyle} data-testid={testID}>
      <div style={innerStyle}>
        <div style={gridWrapperStyle}>
            <div style={gridStyle}>
              {/* Transcription Module (Left) — hidden when in drawer */}
              {tmVisible && (
                <TranscriptionModule
                  tier={effectiveTranscriptionTier}
                  session={activeSession}
                  onTierChange={handleTranscriptionTierChange}
                  onStart={transcription.start}
                  onPause={transcription.pause}
                  onResume={transcription.resume}
                  onStop={transcription.stop}
                  onDiscard={transcription.discard}
                  isEnabled={transcriptionEnabled}
                  testID="transcription-module"
                />
              )}

              {/* Gap column — rendered as empty div when two-column */}
              {tmVisible && aiVisible && <div />}

              {/* AI Module (Right) — hidden when in drawer */}
              {aiVisible && (
                <AISurfaceModule
                  tier={effectiveAITier}
                  content={aiContent}
                  onTierChange={handleAITierChange}
                  suggestions={suggestions}
                  alerts={alerts}
                  onSuggestionAccept={onSuggestionAccept}
                  onSuggestionDismiss={onSuggestionDismiss}
                  onAlertAcknowledge={onAlertAcknowledge}
                  onGenerateNote={onGenerateNote}
                  onCheckInteractions={onCheckInteractions}
                  badgeCount={badgeCount > 0 ? badgeCount : undefined}
                  testID="ai-module"
                />
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

BottomBarContainer.displayName = 'BottomBarContainer';

export default BottomBarContainer;
