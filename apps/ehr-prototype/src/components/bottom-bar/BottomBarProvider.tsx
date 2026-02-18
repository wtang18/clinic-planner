/**
 * BottomBarProvider Component
 *
 * High-level provider that wraps an application section with the bottom bar system.
 * Combines the state provider with the container component.
 *
 * Usage:
 * ```tsx
 * <BottomBarProvider
 *   encounterId={currentEncounter.id}
 *   patient={currentPatient}
 * >
 *   <YourAppContent />
 * </BottomBarProvider>
 * ```
 */

import React, { useEffect, ReactNode } from 'react';
import { BottomBarProvider as StateProvider, useBottomBar } from '../../hooks/useBottomBar';
import { CoordinationProvider } from '../../hooks/useCoordination';
import { BottomBarContainer } from './BottomBarContainer';
import type { BottomBarState } from '../../state/bottomBar/types';
import type { AIMinibarContent } from '../ai-ui/AIMinibar';
import type { Suggestion, Alert } from '../../types/suggestions';

// ============================================================================
// Types
// ============================================================================

export interface BottomBarSystemProps {
  /** Children to render */
  children: ReactNode;
  /** Current encounter ID */
  encounterId?: string;
  /** Current patient info */
  patient?: {
    id: string;
    name: string;
    initials?: string;
  };
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
  /** Called when workspace is navigated away */
  onWorkspaceNavigateAway?: () => void;
  /** Whether transcription is enabled */
  transcriptionEnabled?: boolean;
  /** Initial state override (for testing) */
  initialState?: Partial<BottomBarState>;
  /** Whether to show the bottom bar */
  showBottomBar?: boolean;
}

// ============================================================================
// Inner Component (with access to context)
// ============================================================================

interface BottomBarInnerProps {
  children: ReactNode;
  encounterId?: string;
  patient?: { id: string; name: string; initials?: string };
  aiContent?: AIMinibarContent;
  suggestions?: Suggestion[];
  alerts?: Alert[];
  onSuggestionAccept?: (id: string) => void;
  onSuggestionDismiss?: (id: string) => void;
  onAlertAcknowledge?: (id: string) => void;
  transcriptionEnabled?: boolean;
  showBottomBar?: boolean;
}

const BottomBarInner: React.FC<BottomBarInnerProps> = ({
  children,
  encounterId,
  patient,
  aiContent,
  suggestions,
  alerts,
  onSuggestionAccept,
  onSuggestionDismiss,
  onAlertAcknowledge,
  transcriptionEnabled,
  showBottomBar = true,
}) => {
  const { actions, state } = useBottomBar();

  // Create or activate session when encounter changes
  useEffect(() => {
    if (encounterId && patient) {
      // Check if session exists for this encounter
      const existingSessionId = state.sessionsByEncounter[encounterId];

      if (existingSessionId) {
        // Activate existing session
        actions.activateSession(existingSessionId);
      } else {
        // Create new session
        actions.createSession(encounterId, patient);
      }
    }
  }, [encounterId, patient?.id]); // Only re-run when encounter or patient changes

  return (
    <>
      {children}
      {showBottomBar && (
        <BottomBarContainer
          aiContent={aiContent}
          suggestions={suggestions}
          alerts={alerts}
          onSuggestionAccept={onSuggestionAccept}
          onSuggestionDismiss={onSuggestionDismiss}
          onAlertAcknowledge={onAlertAcknowledge}
          transcriptionEnabled={transcriptionEnabled}
        />
      )}
    </>
  );
};

// ============================================================================
// Main Provider Component
// ============================================================================

export const BottomBarSystem: React.FC<BottomBarSystemProps> = ({
  children,
  encounterId,
  patient,
  aiContent = { type: 'idle' },
  suggestions = [],
  alerts = [],
  onSuggestionAccept,
  onSuggestionDismiss,
  onAlertAcknowledge,
  onWorkspaceNavigateAway,
  transcriptionEnabled = true,
  initialState,
  showBottomBar = true,
}) => {
  return (
    <CoordinationProvider initialState={{ txEligible: true }}>
    <StateProvider initialState={initialState}>
      <BottomBarInner
        encounterId={encounterId}
        patient={patient}
        aiContent={aiContent}
        suggestions={suggestions}
        alerts={alerts}
        onSuggestionAccept={onSuggestionAccept}
        onSuggestionDismiss={onSuggestionDismiss}
        onAlertAcknowledge={onAlertAcknowledge}
        transcriptionEnabled={transcriptionEnabled}
        showBottomBar={showBottomBar}
      >
        {children}
      </BottomBarInner>
    </StateProvider>
    </CoordinationProvider>
  );
};

BottomBarSystem.displayName = 'BottomBarSystem';

export default BottomBarSystem;
