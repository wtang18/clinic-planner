/**
 * AppProviders Component
 *
 * Combined provider that wraps all app contexts in the correct order.
 */

import React from 'react';
import { ThemeProvider } from '../styles/theme';
import { EncounterStoreProvider } from '../hooks/useEncounterState';
import { AIServicesProvider } from './AIServicesContext';
import { WorkspaceProvider } from './WorkspaceContext';
import { DemoProvider } from '../demo/DemoContext';
import { TourTargetProvider } from '../tour/TourTargetRegistry';
import { NetworkStatusBanner } from '../errors/NetworkStatusBanner';
import { CoordinationProvider } from '../hooks/useCoordination';
import { BottomBarProvider } from '../hooks/useBottomBar';
import { AIKeyboardShortcutsProvider } from '../hooks/useAIKeyboardShortcuts';
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
 * 6. CoordinationProvider - tier + pane coordination (single source of truth)
 * 7. BottomBarProvider - bottom bar session state
 * 8. AIKeyboardShortcutsProvider - ⌘K and Escape shortcuts
 * 9. TourTargetProvider - tour target registration
 * 10. NetworkStatusBanner - offline/online status
 *
 * Note: TranscriptionProvider is per-encounter, provided by EncounterLoader.
 */
export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  initialState,
  aiConfig,
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
              <CoordinationProvider initialState={{ txEligible: true }}>
                <BottomBarProvider demoMode={true}>
                  <AIKeyboardShortcutsProvider>
                    <TourTargetProvider>
                      {showNetworkStatus ? (
                        <NetworkStatusBanner>{children}</NetworkStatusBanner>
                      ) : (
                        children
                      )}
                    </TourTargetProvider>
                  </AIKeyboardShortcutsProvider>
                </BottomBarProvider>
              </CoordinationProvider>
            </AIServicesProvider>
          </EncounterStoreProvider>
        </WorkspaceProvider>
      </DemoProvider>
    </ThemeProvider>
  );
};

AppProviders.displayName = 'AppProviders';
