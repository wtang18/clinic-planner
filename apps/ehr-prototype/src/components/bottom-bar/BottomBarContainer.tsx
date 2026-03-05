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

import React, { useCallback, useMemo } from 'react';
import { TranscriptionModule } from './transcription';
import { AISurfaceModule } from './ai';
import { useBottomBar, useTranscription, useTierControls } from '../../hooks/useBottomBar';
import { useCoordination } from '../../hooks/useCoordination';
import { useTranscription as useTranscriptionContext } from '../../context/TranscriptionContext';
import { spaceAround, zIndex } from '../../styles/foundations';
import type { AIMinibarContent } from '../ai-ui/AIMinibar';
import type { Suggestion, Alert } from '../../types/suggestions';
import type { ContextTarget, ContextTargetType } from './ai/AISurfaceModule';
import type { QuickAction } from '../../hooks/useAIAssistant';
import type { ConversationMessage } from '../LeftPane/AIDrawer/ConversationHistory';
import type { TranscriptionSession, RecordingStatus } from '../../state/bottomBar/types';

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
  /** Called when a suggestion is accepted with field changes */
  onSuggestionAcceptWithChanges?: (id: string, data: Record<string, unknown>) => void;
  /** Called when an alert is acknowledged */
  onAlertAcknowledge?: (id: string) => void;
  /** Patient name for AI palette context header */
  patientName?: string;
  /** Context target for AI palette */
  contextTarget?: ContextTarget;
  /** Available context levels for switching */
  availableContextLevels?: ContextTargetType[];
  /** Called when user selects a different context level */
  onContextLevelChange?: (level: ContextTargetType) => void;
  /** Quick actions for AI palette */
  quickActions?: QuickAction[];
  /** Called when a quick action is clicked */
  onQuickActionClick?: (actionId: string) => void;
  /** Called when user sends a message from the palette input */
  onSend?: (value: string) => void;
  /** Ephemeral AI response for palette display */
  paletteResponse?: ConversationMessage | null;
  /** Non-chart follow-up actions (e.g., Copy to clipboard) */
  nonChartFollowUps?: Array<{ id: string; label: string }>;
  /** Handle non-chart follow-up action */
  onNonChartAction?: (actionId: string) => void;
  /** Called when user clears/dismisses the palette response */
  onClearResponse?: () => void;
  /** Canned query texts for ArrowUp/Down cycling */
  cannedQueries?: string[];
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
  onSuggestionAcceptWithChanges,
  onAlertAcknowledge,
  patientName,
  contextTarget,
  availableContextLevels,
  onContextLevelChange,
  quickActions,
  onQuickActionClick,
  onSend,
  paletteResponse,
  nonChartFollowUps,
  onNonChartAction,
  onClearResponse,
  cannedQueries,
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
  const txCtx = useTranscriptionContext();

  // Coordination state — visibility, grid template, hidden flag
  const { bottomBarVisibility, gridTemplate: coordGridTemplate, isBottomBarHidden } = useCoordination();

  // ---------------------------------------------------------------------------
  // Bridge: overlay TranscriptionContext live data onto BottomBarProvider session
  // so that recording started from the pane is visible in the bar, and vice versa.
  // ---------------------------------------------------------------------------

  const syncedSession = useMemo((): TranscriptionSession | null => {
    if (!activeSession && txCtx.status === 'idle') return null;

    // TranscriptionContext is active — overlay its live data
    if (txCtx.status !== 'idle') {
      return {
        id: activeSession?.id ?? 'tx-ctx-bridge',
        encounterId: activeSession?.encounterId ?? 'current',
        patient: activeSession?.patient ?? { id: 'current', name: '', initials: '' },
        startedAt: activeSession?.startedAt ?? null,
        pausedAt: activeSession?.pausedAt ?? null,
        pausedDuration: activeSession?.pausedDuration ?? 0,
        error: activeSession?.error ?? null,
        isDemo: activeSession?.isDemo ?? true,
        // Overlay live TranscriptionContext state
        status: txCtx.status as RecordingStatus,
        duration: txCtx.duration,
        segments: txCtx.segments,
        currentSegment: null,
      };
    }

    return activeSession;
  }, [activeSession, txCtx.status, txCtx.duration, txCtx.segments]);

  // Bridged controls: call both BottomBarProvider + TranscriptionContext
  const bridgedStart = useCallback(async () => {
    transcription.start();
    await txCtx.start();
  }, [transcription, txCtx]);

  const bridgedPause = useCallback(() => {
    transcription.pause();
    txCtx.pause();
  }, [transcription, txCtx]);

  const bridgedResume = useCallback(() => {
    transcription.resume();
    txCtx.resume();
  }, [transcription, txCtx]);

  const bridgedStop = useCallback(async () => {
    transcription.stop();
    await txCtx.stop();
  }, [transcription, txCtx]);

  const bridgedDiscard = useCallback(() => {
    transcription.discard();
    // TranscriptionContext doesn't have discard — stop resets it
    txCtx.stop();
  }, [transcription, txCtx]);

  // Early return when both modules are in drawer
  if (isBottomBarHidden) return null;

  // Effective tiers: modules at drawer are hidden (not rendered), so only bar/anchor/palette matter
  const aiVisible = bottomBarVisibility.ai.visible;
  const tmVisible = transcriptionEnabled !== false && bottomBarVisibility.transcription.visible;
  const effectiveAITier = aiVisible ? bottomBarVisibility.ai.tier! : 'bar';
  const effectiveTranscriptionTier = tmVisible ? bottomBarVisibility.transcription.tier! : 'bar';

  // TM is full-width when it's visible but AI is not (AI in pane)
  const tmIsFullWidth = tmVisible && !aiVisible;

  // Handle tier changes
  const handleAITierChange = useCallback((tier: 'anchor' | 'bar' | 'palette' | 'drawer') => {
    setAITier(tier);
  }, [setAITier]);

  const handleTranscriptionTierChange = useCallback((tier: 'anchor' | 'bar' | 'palette' | 'drawer') => {
    setTranscriptionTier(tier);
  }, [setTranscriptionTier]);

  // Container styles - fixed at bottom
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 'var(--legend-panel-height, 0px)',
    left: 0,
    right: 0,
    zIndex: zIndex.modal,
    padding: spaceAround.tight,
    pointerEvents: 'none',
    transition: 'bottom 200ms ease',
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
  // When TM is suppressed (transcriptionEnabled=false), override to single-column
  // palette width so the AI module gets full width instead of being squished
  // into the TM column slot.
  const effectiveGridTemplate = !tmVisible && aiVisible
    ? 'var(--bottom-bar-palette-width)'
    : coordGridTemplate;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: effectiveGridTemplate,
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
                  session={syncedSession}
                  onTierChange={handleTranscriptionTierChange}
                  onStart={bridgedStart}
                  onPause={bridgedPause}
                  onResume={bridgedResume}
                  onStop={bridgedStop}
                  onDiscard={bridgedDiscard}
                  isEnabled={transcriptionEnabled}
                  isFullWidth={tmIsFullWidth}
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
                  patientName={patientName}
                  contextTarget={contextTarget}
                  availableContextLevels={availableContextLevels}
                  onContextLevelChange={onContextLevelChange}
                  suggestions={suggestions}
                  alerts={alerts}
                  onSuggestionAccept={onSuggestionAccept}
                  onSuggestionDismiss={onSuggestionDismiss}
                  onSuggestionAcceptWithChanges={onSuggestionAcceptWithChanges}
                  onAlertAcknowledge={onAlertAcknowledge}
                  quickActions={quickActions}
                  onQuickActionClick={onQuickActionClick}
                  onSend={onSend}
                  paletteResponse={paletteResponse}
                  nonChartFollowUps={nonChartFollowUps}
                  onNonChartAction={onNonChartAction}
                  onClearResponse={onClearResponse}
                  cannedQueries={cannedQueries}
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
