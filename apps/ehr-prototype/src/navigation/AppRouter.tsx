/**
 * AppRouter Component
 *
 * Main router component that renders the appropriate screen
 * based on the current navigation state.
 */

import React from 'react';
import { useNavigation, useCurrentScreen, useEncounterId, useCurrentMode, Screen } from './NavigationContext';
import { EncounterLoader } from './EncounterLoader';

// Screens
import { CaptureView } from '../screens/CaptureView';
import { ProcessView } from '../screens/ProcessView';
import { ReviewView } from '../screens/ReviewView';
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

const EncounterScreen: React.FC = () => {
  const mode = useCurrentMode();

  switch (mode) {
    case 'capture':
      return <div data-testid="capture-view"><CaptureView /></div>;
    case 'process':
      return <div data-testid="process-view"><ProcessView /></div>;
    case 'review':
      return <div data-testid="review-view"><ReviewView /></div>;
    default:
      return <div data-testid="capture-view"><CaptureView /></div>;
  }
};

// ============================================================================
// Screen Router
// ============================================================================

const ScreenRouter: React.FC<{ screen: Screen }> = ({ screen }) => {
  const encounterId = useEncounterId();

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
    height: '100vh',
    width: '100vw',
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
