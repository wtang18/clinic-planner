/**
 * BottomBarContainer Component (Simplified)
 *
 * CSS Grid-based orchestrator that coordinates the Transcription and AI modules.
 * CSS Grid transition handles width animation. No state machine.
 *
 * Grid Column Allocation (total always 488px):
 * - Default (both bar): '160px 320px' (gap 8px = 488px total)
 * - AI Expanded: '48px 432px' (transcription mini)
 * - Transcription Expanded: '432px 48px' (AI mini)
 *
 * See: /docs/features/bottom-bar-system/LAYOUT_SPEC.md
 */

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { LayoutGroup } from 'framer-motion';
import { TranscriptionModule } from './transcription';
import { AISurfaceModule } from './ai';
import { useBottomBar, useTranscription, useTierControls } from '../../hooks/useBottomBar';
import { spaceAround, zIndex } from '../../styles/foundations';
import type { AIMinibarContent } from '../ai-ui/AIMinibar';
import type { Suggestion, Alert } from '../../types/suggestions';

// ============================================================================
// Constants
// ============================================================================

const WIDTHS = {
  transcription: {
    bar: 160,
    mini: 48,
  },
  ai: {
    bar: 320,
    mini: 48,
    expanded: 432,
  },
  gap: 8,
  total: 488, // Fixed total width: 160 + 8 + 320 = 488
} as const;

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

  // Determine if modules are expanded (palette or drawer)
  const aiExpanded = aiTier === 'palette' || aiTier === 'drawer';
  const tmExpanded = transcriptionTier === 'palette' || transcriptionTier === 'drawer';

  // Enforce tier coordination constraints:
  // 1. If either is at palette/drawer, the other MUST be mini
  // 2. If neither is at palette/drawer, both MUST be bar (not mini)
  // This prevents invalid states like minibar + micro
  const effectiveTranscriptionTier = aiExpanded ? 'mini' : (tmExpanded ? transcriptionTier : 'bar');
  const effectiveAITier = tmExpanded ? 'mini' : (aiExpanded ? aiTier : 'bar');

  // Grid columns based on effective tiers
  const getGridColumns = (): string => {
    // AI expanded
    if (aiExpanded) {
      return `${WIDTHS.transcription.mini}px ${WIDTHS.ai.expanded}px`;
    }
    // Transcription expanded
    if (tmExpanded) {
      return `${WIDTHS.ai.expanded}px ${WIDTHS.ai.mini}px`;
    }
    // Both at bar state (default)
    return `${WIDTHS.transcription.bar}px ${WIDTHS.ai.bar}px`;
  };

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

  // Fixed-width wrapper - overflow hidden clips any animation timing mismatches
  const gridWrapperStyle: React.CSSProperties = {
    width: WIDTHS.total,
    overflow: 'hidden',  // Clip overflow during micro ↔ palette transitions
  };

  // CSS Grid with transition matching module animation timing (200ms).
  // Grid columns animate in sync with module width animations.
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: getGridColumns(),
    gap: WIDTHS.gap,
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
          <LayoutGroup>
            <div style={gridStyle}>
              {/* Transcription Module (Left) */}
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

              {/* AI Module (Right) */}
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
            </div>
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
};

BottomBarContainer.displayName = 'BottomBarContainer';

export default BottomBarContainer;
