/**
 * EncounterLoader Component
 *
 * Loads encounter data before rendering child components.
 */

import React, { useEffect, useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { useDispatch } from '../hooks';
import { ENCOUNTER_TEMPLATES } from '../mocks';
import { buildMAItemsForPatient, MA_SOURCE } from '../data/mock-encounter';
import type { EncounterContext } from '../mocks/generators/encounters';
import { colors, spaceAround, typography } from '../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface EncounterLoaderProps {
  /** The encounter ID to load */
  encounterId: string;
  /** Content to render when loaded */
  children: React.ReactNode;
}

// ============================================================================
// Helper: Get Mock Data
// ============================================================================

function getMockDataForEncounter(encounterId: string): EncounterContext {
  // Map encounter IDs to mock scenarios
  if (encounterId === 'uc-cough' || encounterId === 'demo-uc') {
    return ENCOUNTER_TEMPLATES.ucCough();
  }

  if (encounterId === 'pc-diabetes' || encounterId === 'demo-pc') {
    return ENCOUNTER_TEMPLATES.pcDiabetes();
  }

  if (encounterId === 'demo-healthy' || encounterId === 'healthy') {
    return ENCOUNTER_TEMPLATES.annualWellness();
  }

  // Default to UC Cough scenario
  return ENCOUNTER_TEMPLATES.ucCough();
}

/**
 * Get MA handoff items for a given scenario.
 * Each scenario has scenario-specific vitals and HPI text;
 * allergy confirmations and med reconciliation are derived from patient data.
 */
function getMAItemsForScenario(encounterId: string, mockData: EncounterContext) {
  if (encounterId === 'uc-cough' || encounterId === 'demo-uc') {
    return buildMAItemsForPatient(
      mockData.patient,
      mockData.visit,
      { bpSystolic: 128, bpDiastolic: 82, pulse: 78, temp: 99.1, tempFlag: 'high', spo2: 98 },
      'Onset 5 days ago, productive yellow sputum, tried OTC Robitussin without relief. Worse at night, no hemoptysis. Low-grade fever at home. No SOB at rest.',
    );
  }

  if (encounterId === 'pc-diabetes' || encounterId === 'demo-pc') {
    return buildMAItemsForPatient(
      mockData.patient,
      mockData.visit,
      { bpSystolic: 142, bpDiastolic: 88, pulse: 72, temp: 98.2, spo2: 97 },
      'Here for quarterly DM/HTN follow-up. Reports morning fasting glucose running 140-160. Occasional headaches, attributes to stress. Adherent to medications, sometimes forgets evening metformin.',
    );
  }

  if (encounterId === 'demo-healthy' || encounterId === 'healthy') {
    return buildMAItemsForPatient(
      mockData.patient,
      mockData.visit,
      { bpSystolic: 118, bpDiastolic: 72, pulse: 68, temp: 98.4, spo2: 99 },
    );
  }

  // Default: UC Cough
  return buildMAItemsForPatient(
    mockData.patient,
    mockData.visit,
    { bpSystolic: 128, bpDiastolic: 82, pulse: 78, temp: 99.1, tempFlag: 'high', spo2: 98 },
  );
}

// ============================================================================
// Component
// ============================================================================

export const EncounterLoader: React.FC<EncounterLoaderProps> = ({
  encounterId,
  children,
}) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEncounter() {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get mock data
        const mockData = getMockDataForEncounter(encounterId);

        // Dispatch encounter opened action
        dispatch({
          type: 'ENCOUNTER_OPENED',
          payload: {
            encounterId: mockData.encounter.id,
            patient: mockData.patient,
            encounter: mockData.encounter,
            visit: mockData.visit,
          },
        });

        // Dispatch MA handoff items
        const maItems = getMAItemsForScenario(encounterId, mockData);
        for (const item of maItems) {
          dispatch({
            type: 'ITEM_ADDED',
            payload: { item, source: MA_SOURCE },
          });
        }

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load encounter');
        setIsLoading(false);
      }
    }

    loadEncounter();

    // Cleanup: Close encounter on unmount
    return () => {
      dispatch({
        type: 'ENCOUNTER_CLOSED',
        payload: { save: false },
      });
    };
  }, [encounterId, dispatch]);

  // Loading state
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>
          <Loader size={48} />
        </div>
        <div style={styles.loadingText}>Loading encounter...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>
          <AlertCircle size={48} />
        </div>
        <div style={styles.errorTitle}>Failed to Load Encounter</div>
        <div style={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  // Loaded - render children
  return <>{children}</>;
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: colors.bg.neutral.min,
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    marginBottom: spaceAround.default,
    color: colors.fg.accent.primary,
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: 16,
    color: colors.fg.neutral.secondary,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: colors.bg.neutral.min,
    padding: spaceAround.defaultPlus,
  },
  errorIcon: {
    width: '48px',
    height: '48px',
    marginBottom: spaceAround.default,
    color: colors.fg.alert.secondary,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    marginBottom: spaceAround.tight,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.fg.neutral.secondary,
    textAlign: 'center',
    maxWidth: '400px',
  },
};

EncounterLoader.displayName = 'EncounterLoader';
