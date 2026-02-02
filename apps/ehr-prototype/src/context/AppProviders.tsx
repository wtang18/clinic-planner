/**
 * AppProviders Component
 *
 * Combined provider that wraps all app contexts in the correct order.
 */

import React from 'react';
import { ThemeProvider } from '../styles/theme';
import { EncounterStoreProvider } from '../hooks/useEncounterState';
import { AIServicesProvider } from './AIServicesContext';
import { TranscriptionProvider } from './TranscriptionContext';
import { WorkspaceProvider } from './WorkspaceContext';
import { DemoProvider } from '../demo/DemoContext';
import { TourTargetProvider } from '../tour/TourTargetRegistry';
import { NetworkStatusBanner } from '../errors/NetworkStatusBanner';
import type { EncounterState } from '../state/types';
import type { AIServicesConfig } from '../services/ai/services/service-config';

// ============================================================================
// Types
// ============================================================================

export interface AppProvidersProps {
  children: React.ReactNode;
  /** Initial state overrides */
  initialState?: Partial<EncounterState>;
  /** AI services configuration */
  aiConfig?: Partial<AIServicesConfig>;
  /** Use mock transcription service */
  useMockTranscription?: boolean;
  /** Mock scenario for transcription */
  mockScenario?: 'uc-cough' | 'pc-diabetes';
  /** Enable development mode */
  devMode?: boolean;
  /** Initial demo preset ID */
  initialDemoPreset?: string;
  /** Show network status banner */
  showNetworkStatus?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Combined provider that wraps all app contexts in the correct order.
 * Use this at the root of your app for convenience.
 *
 * Provider order (outer to inner):
 * 1. ThemeProvider - global theming
 * 2. DemoProvider - demo mode state (outside encounter so presets can configure)
 * 3. WorkspaceProvider - workspace and tab management
 * 4. EncounterStoreProvider - encounter state (provides store context for hooks)
 * 5. AIServicesProvider - AI service orchestration
 * 6. TranscriptionProvider - transcription service
 * 7. TourTargetProvider - tour target registration
 * 8. NetworkStatusBanner - offline/online status
 */
export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  initialState,
  aiConfig,
  useMockTranscription = true,
  mockScenario = 'uc-cough',
  devMode = __DEV__,
  initialDemoPreset,
  showNetworkStatus = true,
}) => {
  return (
    <ThemeProvider>
      <DemoProvider initialPresetId={initialDemoPreset}>
        <WorkspaceProvider>
          <EncounterStoreProvider initialState={initialState} devMode={devMode}>
            <AIServicesProvider config={aiConfig}>
              <TranscriptionProvider
                useMock={useMockTranscription}
                mockScenario={mockScenario}
              >
                <TourTargetProvider>
                  {showNetworkStatus ? (
                    <NetworkStatusBanner>{children}</NetworkStatusBanner>
                  ) : (
                    children
                  )}
                </TourTargetProvider>
              </TranscriptionProvider>
            </AIServicesProvider>
          </EncounterStoreProvider>
        </WorkspaceProvider>
      </DemoProvider>
    </ThemeProvider>
  );
};

AppProviders.displayName = 'AppProviders';
