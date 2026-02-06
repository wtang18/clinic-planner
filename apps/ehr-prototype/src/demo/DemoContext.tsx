/**
 * DemoContext
 *
 * Provides demo state (active preset, features) to the entire app tree.
 * Components can use useDemoMode() to check if features should be enabled.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  DemoPreset,
  DemoFeatures,
  getPresetById,
  DEFAULT_FEATURES,
} from './presets';

// ============================================================================
// Types
// ============================================================================

interface DemoContextValue {
  /** The currently active preset, or null if not in demo mode */
  activePreset: DemoPreset | null;
  /** Feature flags (from preset or defaults) */
  features: DemoFeatures;
  /** Whether demo mode is active */
  isDemoMode: boolean;
  /** Launch a demo preset by ID */
  launchPreset: (presetId: string) => void;
  /** Exit demo mode */
  exitDemo: () => void;
  /** Reset the current demo (reloads same preset) */
  resetDemo: () => void;
  /** Check if a specific feature is enabled */
  isFeatureEnabled: (feature: keyof DemoFeatures) => boolean;
}

// ============================================================================
// Context
// ============================================================================

const DemoContext = createContext<DemoContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface DemoProviderProps {
  children: React.ReactNode;
  /** Initial preset to launch (optional) */
  initialPresetId?: string;
}

export const DemoProvider: React.FC<DemoProviderProps> = ({
  children,
  initialPresetId,
}) => {
  const [activePreset, setActivePreset] = useState<DemoPreset | null>(() => {
    if (initialPresetId) {
      return getPresetById(initialPresetId) || null;
    }
    return null;
  });

  const launchPreset = useCallback((presetId: string) => {
    const preset = getPresetById(presetId);
    if (preset) {
      setActivePreset(preset);
    } else {
      console.warn(`Demo preset not found: ${presetId}`);
    }
  }, []);

  const exitDemo = useCallback(() => {
    setActivePreset(null);
  }, []);

  const resetDemo = useCallback(() => {
    // Re-launch same preset to trigger a reset
    if (activePreset) {
      // Create a new object reference to trigger re-renders
      setActivePreset({ ...activePreset });
    }
  }, [activePreset]);

  const features = activePreset?.features || DEFAULT_FEATURES;

  const isFeatureEnabled = useCallback(
    (feature: keyof DemoFeatures): boolean => {
      return features[feature];
    },
    [features]
  );

  const value = useMemo<DemoContextValue>(
    () => ({
      activePreset,
      features,
      isDemoMode: !!activePreset,
      launchPreset,
      exitDemo,
      resetDemo,
      isFeatureEnabled,
    }),
    [activePreset, features, launchPreset, exitDemo, resetDemo, isFeatureEnabled]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

DemoProvider.displayName = 'DemoProvider';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access the demo context
 */
export function useDemoMode(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within DemoProvider');
  }
  return context;
}

/**
 * Check if a specific feature is enabled.
 * Returns true if not in DemoProvider (features default to enabled).
 */
export function useFeatureEnabled(feature: keyof DemoFeatures): boolean {
  const context = useContext(DemoContext);
  if (!context) {
    // If not in provider, assume all features are enabled
    return true;
  }
  return context.isFeatureEnabled(feature);
}

/**
 * Hook that returns whether demo mode is active.
 * Safe to use outside of DemoProvider (returns false).
 */
export function useIsDemoMode(): boolean {
  const context = useContext(DemoContext);
  return context?.isDemoMode ?? false;
}
