/**
 * EncounterLoader Component
 *
 * Loads encounter data before rendering child components.
 * Wraps children with per-encounter TranscriptionProvider and
 * dispatches suggestions synced to transcript playback timing.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { useDispatch } from '../hooks';
import { ENCOUNTER_TEMPLATES, generateSuggestionsForScenario } from '../mocks';
import { buildMAItemsForPatient, MA_SOURCE } from '../data/mock-encounter';
import { getVitalsForScenario } from '../data/mock-vitals';
import { getTriageItemsForScenario } from '../data/mock-triage';
import type { EncounterContext } from '../mocks/generators/encounters';
import { TranscriptionProvider, useTranscription } from '../context/TranscriptionContext';
import { useAIServices } from '../context/AIServicesContext';
import { useDraftEngine } from '../hooks/useDraftEngine';
import { useTaskLifecycleSimulator } from '../hooks/useTaskLifecycleSimulator';
import { getScheduleForEncounter } from './suggestion-schedule';
import type { ScheduledSuggestion } from './suggestion-schedule';
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
// Helper: Encounter → Transcript Scenario
// ============================================================================

function getTranscriptScenario(encounterId: string): 'uc-cough' | 'pc-diabetes' {
  if (encounterId === 'pc-diabetes' || encounterId === 'demo-pc') {
    return 'pc-diabetes';
  }
  // AWV and UC Cough both use uc-cough transcript (AWV has no transcript-triggered
  // suggestions, so the transcript is harmless)
  return 'uc-cough';
}

// ============================================================================
// SuggestionScheduleRunner
//
// Inner component that dispatches suggestions synced to transcript timing.
// Must be rendered inside TranscriptionProvider to access isRecording.
// ============================================================================

const SuggestionScheduleRunner: React.FC<{
  encounterId: string;
  children: React.ReactNode;
}> = ({ encounterId, children }) => {
  const dispatch = useDispatch();
  const { isRecording } = useTranscription();
  const { disableService, enableService } = useAIServices();
  const dispatchedRef = useRef(new Set<string>());
  const timeoutIdsRef = useRef<number[]>([]);
  const scheduleRef = useRef(getScheduleForEncounter(encounterId));

  // Disable entity-extraction to prevent regex-based duplicates of curated suggestions
  useEffect(() => {
    disableService('entity-extraction');
    return () => enableService('entity-extraction');
  }, [disableService, enableService]);

  // Helper: dispatch a single scheduled suggestion
  const dispatchEntry = (entry: ScheduledSuggestion) => {
    if (dispatchedRef.current.has(entry.key)) return;
    dispatchedRef.current.add(entry.key);

    const suggestions = generateSuggestionsForScenario(entry.scenario);
    const suggestion = suggestions[entry.itemIndex];
    if (!suggestion) return;

    dispatch({
      type: 'SUGGESTION_RECEIVED',
      payload: { suggestion, source: suggestion.source || 'ai-analysis' },
    });
  };

  // Dispatch immediate suggestions on mount (staggered 500ms apart)
  useEffect(() => {
    const immediates = scheduleRef.current.filter(s => s.timing.type === 'immediate');
    const ids: number[] = [];

    immediates.forEach((entry, i) => {
      const id = window.setTimeout(() => {
        dispatchEntry(entry);
      }, i * 500);
      ids.push(id);
    });
    timeoutIdsRef.current.push(...ids);

    return () => {
      for (const id of ids) window.clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounterId]);

  // On Record start: schedule transcript-synced suggestions
  useEffect(() => {
    if (!isRecording) return;

    const onRecordItems = scheduleRef.current.filter(s => s.timing.type === 'onRecord');
    const ids: number[] = [];

    for (const entry of onRecordItems) {
      if (dispatchedRef.current.has(entry.key)) continue;

      const delayMs = entry.timing.type === 'onRecord' ? entry.timing.delayMs : 0;
      const id = window.setTimeout(() => {
        dispatchEntry(entry);
      }, delayMs);
      ids.push(id);
    }
    timeoutIdsRef.current.push(...ids);

    // Cleanup on pause/stop: clear pending onRecord timeouts
    return () => {
      for (const id of ids) window.clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      for (const id of timeoutIdsRef.current) window.clearTimeout(id);
      timeoutIdsRef.current = [];
    };
  }, []);

  return <>{children}</>;
};

SuggestionScheduleRunner.displayName = 'SuggestionScheduleRunner';

// ============================================================================
// DraftEngineRunner
//
// Starts the draft engine after the first transcript segment arrives.
// Must be rendered inside TranscriptionProvider.
// ============================================================================

const DraftEngineRunner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { segments } = useTranscription();
  const hasSegments = segments.length > 0;

  useDraftEngine({ enabled: hasSegments });

  return <>{children}</>;
};

DraftEngineRunner.displayName = 'DraftEngineRunner';

// ============================================================================
// TaskLifecycleRunner
//
// Auto-progresses background tasks through their lifecycle on timers.
// Must be rendered inside the encounter store provider.
// ============================================================================

const TaskLifecycleRunner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useTaskLifecycleSimulator();
  return <>{children}</>;
};

TaskLifecycleRunner.displayName = 'TaskLifecycleRunner';

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

        // Seed vitals ChartItems (keyed by encounter template ID)
        const vitalsItems = getVitalsForScenario(mockData.encounter.id);
        for (const item of vitalsItems) {
          dispatch({
            type: 'ITEM_ADDED',
            payload: { item, source: MA_SOURCE },
          });
        }

        // Seed triage narrative/PE ChartItems (CC, HPI, ROS, PE)
        const triageItems = getTriageItemsForScenario(mockData.encounter.id);
        for (const item of triageItems) {
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

    // Cleanup: close encounter on unmount
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

  // Loaded: wrap children with per-encounter providers and runners
  return (
    <TranscriptionProvider mockScenario={getTranscriptScenario(encounterId)}>
      <SuggestionScheduleRunner encounterId={encounterId}>
        <DraftEngineRunner>
          <TaskLifecycleRunner>
            {children}
          </TaskLifecycleRunner>
        </DraftEngineRunner>
      </SuggestionScheduleRunner>
    </TranscriptionProvider>
  );
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
