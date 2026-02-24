/**
 * EHR Prototype Application
 *
 * Main application component with all providers, navigation, and overlays.
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform, View } from 'react-native';

import { NavigationProvider, useNavigation, useCurrentScreen } from './navigation/NavigationContext';
import { AppRouter } from './navigation/AppRouter';
import { AppProviders } from './context/AppProviders';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TourOverlay } from './tour/TourOverlay';
import { DemoModeBanner } from './demo/DemoModeBanner';
import { DemoOverlay } from './demo/DemoOverlay';
import { registerDefaultShortcuts } from './shortcuts/defaultShortcuts';
import { ChordBadge } from './shortcuts/ChordBadge';
import { ShortcutLegendPanel } from './shortcuts/ShortcutLegendPanel';
import { HelpHubButton } from './components/help/HelpHubButton';
import { clearTriedShortcuts } from './shortcuts/shortcutProgress';
import { useDemoMode } from './demo/DemoContext';
import { useDemoController } from './demo/hooks/useDemoController';
import { tourSystem } from './tour/TourSystem';
import { ALL_TOURS } from './tour/tours/onboarding';
import { globalStyles } from './styles/global';

// Register tours at module load
tourSystem.registerTours(ALL_TOURS);

// ============================================================================
// Types
// ============================================================================

export interface AppProps {
  /**
   * Use mock services (default: true for development)
   */
  useMockServices?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const App: React.FC<AppProps> = ({
  useMockServices = true,
}) => {
  // Load Inter font from Google Fonts and inject global styles for web platform
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Load Inter font from Google Fonts - prepend to head for priority
      const linkId = 'inter-font-link';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
        // Prepend to ensure it loads first
        if (document.head.firstChild) {
          document.head.insertBefore(link, document.head.firstChild);
        } else {
          document.head.appendChild(link);
        }
      }

      // Inject global CSS styles to ensure Inter is applied everywhere
      const styleId = 'global-font-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = globalStyles;
        document.head.appendChild(style);
      }

      // Also directly apply to body and root elements
      document.body.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
      const rootEl = document.getElementById('root');
      if (rootEl) {
        rootEl.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
      }
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <ErrorBoundary>
          <AppProviders
            devMode={__DEV__}
          >
            <NavigationProvider>
              <AppContent />
            </NavigationProvider>
          </AppProviders>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

// ============================================================================
// AppContent - Rendered inside all providers
// ============================================================================

const AppContent: React.FC = () => {
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const { activePreset, exitDemo, resetDemo } = useDemoMode();
  const { navigate } = useNavigation();
  const screen = useCurrentScreen();

  const showHelpUI = screen !== 'home' && screen !== 'demo';

  // Clear tried-shortcut progress on page load (web only) so each session starts fresh
  useEffect(() => {
    if (Platform.OS === 'web') {
      clearTriedShortcuts();
    }
  }, []);

  // Close legend panel when navigating away from encounter screens
  useEffect(() => {
    if (!showHelpUI && showShortcutHelp) {
      setShowShortcutHelp(false);
    }
  }, [showHelpUI, showShortcutHelp]);

  // Register keyboard shortcuts (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    return registerDefaultShortcuts({
      openOmniAdd: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ehr:open-omni-add'));
        }
      },
      toggleTranscription: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ehr:toggle-transcription'));
        }
      },
      contextSegment: (index) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ehr:context-segment', { detail: { index } }));
        }
      },
      openPalette: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ehr:open-palette'));
        }
      },
      save: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ehr:save'));
        }
      },
      help: () => setShowShortcutHelp((prev) => !prev),
      navigate: (screen) => navigate(screen as any),
      navigateWorkspace: (slot) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ehr:navigate-workspace', { detail: { slot } }));
        }
      },
      toggleWorkflow: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ehr:toggle-workflow'));
        }
      },
    });
  }, [navigate]);

  return (
    <View style={styles.content}>
      {/* Demo mode banner */}
      {activePreset && (
        <DemoModeBanner
          preset={activePreset}
          onExit={exitDemo}
          onReset={resetDemo}
        />
      )}

      {/* Main app router */}
      <AppRouter />

      {/* Tour overlay */}
      <TourOverlay />

      {/* Demo overlay (only when demo controller is active) */}
      {activePreset && <DemoOverlayContainer />}

      {/* Help hub + legend panel + chord badge (web only, encounter screens) */}
      {Platform.OS === 'web' && showHelpUI && (
        <>
          <ShortcutLegendPanel
            isOpen={showShortcutHelp}
            onClose={() => setShowShortcutHelp(false)}
          />
          <HelpHubButton
            isLegendOpen={showShortcutHelp}
            onToggleLegend={() => setShowShortcutHelp((prev) => !prev)}
          />
          <ChordBadge />
        </>
      )}
    </View>
  );
};

// ============================================================================
// DemoOverlayContainer
// ============================================================================

const DemoOverlayContainer: React.FC = () => {
  const { controller, state } = useDemoController({ autoInitialize: true });

  if (!controller || !state?.currentScenarioId) return null;

  return <DemoOverlay controller={controller} />;
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
});

export default App;
