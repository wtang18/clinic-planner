/**
 * AppRouter Component
 *
 * Main router component that renders the appropriate screen
 * based on the current navigation state.
 */

import React from 'react';
import { useNavigation, useCurrentScreen, useEncounterId, Screen } from './NavigationContext';
import { EncounterLoader } from './EncounterLoader';

// Screens
import { EncounterProvider } from '../screens/EncounterWorkspace';
import { AppShell } from '../screens/AppShell';
import { PatientOverview } from '../screens/PatientOverview';
import { DemoLauncher } from './DemoLauncher';

import { Home } from 'lucide-react';
import { colors, spaceAround, borderRadius, typography } from '../styles/foundations';

// ============================================================================
// NotFound Screen
// ============================================================================

const NotFoundScreen: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div style={styles.notFoundContainer}>
      <Home size={64} color={colors.border.neutral.medium} style={{ marginBottom: spaceAround.default }} />
      <h1 style={styles.notFoundTitle}>Page Not Found</h1>
      <p style={styles.notFoundText}>
        The page you're looking for doesn't exist.
      </p>
      <button
        type="button"
        style={styles.notFoundButton}
        onClick={() => navigate('demo')}
      >
        Go to Demo
      </button>
    </div>
  );
};

// ============================================================================
// Encounter Screen Router
// ============================================================================

/**
 * EncounterScreen renders AppShell wrapped in EncounterProvider.
 * EncounterProvider encapsulates all encounter-level hooks (transcription,
 * AI, coordination, etc.) and exposes them via context.
 * AppShell owns the AdaptiveLayout and delegates canvas rendering to
 * scope-specific routers (EncounterWorkspace, CohortWorkspace).
 */
const EncounterScreen: React.FC = () => (
  <EncounterProvider>
    <AppShell />
  </EncounterProvider>
);

// ============================================================================
// Screen Router
// ============================================================================

const ScreenRouter: React.FC<{ screen: Screen }> = ({ screen }) => {
  const encounterId = useEncounterId();
  const { state } = useNavigation();

  switch (screen) {
    case 'home':
    case 'demo':
      return <DemoLauncher />;

    case 'encounter':
      if (!encounterId) {
        return <NotFoundScreen />;
      }
      return (
        <EncounterLoader encounterId={encounterId}>
          <EncounterScreen />
        </EncounterLoader>
      );

    case 'patient':
      return <PatientOverview />;

    case 'population-health':
      // Population health is now rendered inline in CaptureView; fallback to DemoLauncher
      return <DemoLauncher />;

    case 'settings':
      return (
        <div style={styles.placeholderScreen}>
          <h2>Settings</h2>
          <p>Settings screen coming soon...</p>
        </div>
      );

    default:
      return <NotFoundScreen />;
  }
};

// ============================================================================
// AppRouter Component
// ============================================================================

export const AppRouter: React.FC = () => {
  const screen = useCurrentScreen();

  return (
    <div style={styles.routerContainer}>
      <ScreenRouter screen={screen} />
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  routerContainer: {
    height: 'calc(100vh - var(--demo-banner-height, 0px))',
    width: '100%',
    overflow: 'hidden',
  },
  notFoundContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: colors.bg.neutral.min,
    padding: spaceAround.defaultPlus,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.fg.neutral.primary,
    marginBottom: spaceAround.tight,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.fg.neutral.secondary,
    marginBottom: spaceAround.defaultPlus,
  },
  notFoundButton: {
    padding: `${spaceAround.compact}px ${spaceAround.defaultPlus}px`,
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    backgroundColor: colors.fg.accent.primary,
    color: colors.bg.neutral.base,
    border: 'none',
    borderRadius: borderRadius.full,
    cursor: 'pointer',
  },
  placeholderScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: colors.bg.neutral.min,
    color: colors.fg.neutral.secondary,
  },
};

AppRouter.displayName = 'AppRouter';
