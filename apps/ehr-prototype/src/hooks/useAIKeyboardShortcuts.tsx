/**
 * useAIKeyboardShortcuts Hook
 *
 * Handles ⌘K (AI quick access) and Escape keyboard shortcuts with
 * awareness of the left pane drawer state.
 *
 * ⌘K behavior (per LEFT_PANE_SYSTEM.md §8):
 * - AI drawer visible → focus drawer input
 * - AI palette open → focus palette input
 * - Otherwise → open AI palette, focus its input
 *
 * Escape behavior:
 * - AI palette open → collapse to bar
 * - TM palette open → collapse to bar
 * - AI drawer input focused → blur input
 * - Otherwise → no action (never closes left pane views)
 *
 * @see LEFT_PANE_SYSTEM.md §8 for full specification
 */

import React, { useEffect, useRef, useCallback, useContext, createContext } from 'react';
import { Platform } from 'react-native';
import { useDrawerCoordination } from './useDrawerCoordination';

// ============================================================================
// Input Registration Context
// ============================================================================

interface AIInputRegistryContextValue {
  registerDrawerInput: (ref: HTMLTextAreaElement | HTMLInputElement | null) => void;
  registerPaletteInput: (ref: HTMLTextAreaElement | HTMLInputElement | null) => void;
}

const AIInputRegistryContext = createContext<AIInputRegistryContextValue | null>(null);

/**
 * Hook for AI input components to register themselves for ⌘K focus management.
 * Must be used within AIKeyboardShortcutsProvider.
 */
export function useAIInputRegistry(): AIInputRegistryContextValue | null {
  return useContext(AIInputRegistryContext);
}

// ============================================================================
// Types
// ============================================================================

export interface AIKeyboardShortcutsConfig {
  /** Whether shortcuts are enabled (default: true) */
  enabled?: boolean;
}

export interface UseAIKeyboardShortcutsReturn {
  /** Register the AI drawer input for focus management */
  registerDrawerInput: (ref: HTMLTextAreaElement | HTMLInputElement | null) => void;
  /** Register the AI palette input for focus management */
  registerPaletteInput: (ref: HTMLTextAreaElement | HTMLInputElement | null) => void;
  /** Manually trigger ⌘K behavior */
  triggerAIQuickAccess: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useAIKeyboardShortcuts(
  config: AIKeyboardShortcutsConfig = {}
): UseAIKeyboardShortcutsReturn {
  const { enabled = true } = config;
  const { paneState, barState, barActions } = useDrawerCoordination();

  // Refs for input elements
  const drawerInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const paletteInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  /**
   * ⌘K handler: Focus the highest-density visible AI surface
   */
  const handleAIQuickAccess = useCallback(() => {
    // Priority 1: AI drawer is open in left pane
    if (paneState.isExpanded && paneState.activeView === 'ai') {
      if (drawerInputRef.current) {
        drawerInputRef.current.focus();
        return;
      }
    }

    // Priority 2: AI palette is already open
    if (barState.aiTier === 'palette') {
      if (paletteInputRef.current) {
        paletteInputRef.current.focus();
        return;
      }
    }

    // Priority 3: Open AI palette and focus its input
    barActions.setAITier('palette');
    // Focus happens after state update - use microtask
    queueMicrotask(() => {
      if (paletteInputRef.current) {
        paletteInputRef.current.focus();
      }
    });
  }, [paneState.isExpanded, paneState.activeView, barState.aiTier, barActions]);

  /**
   * Escape handler: De-escalate one step
   */
  const handleEscape = useCallback(() => {
    // If AI palette is open, collapse it
    if (barState.aiTier === 'palette') {
      barActions.setAITier('bar');
      return true; // Handled
    }

    // If TM palette is open, collapse it
    if (barState.transcriptionTier === 'palette') {
      barActions.setTranscriptionTier('bar');
      return true; // Handled
    }

    // If in AI drawer and input is focused, blur it
    if (paneState.isExpanded && paneState.activeView === 'ai') {
      if (
        drawerInputRef.current &&
        document.activeElement === drawerInputRef.current
      ) {
        drawerInputRef.current.blur();
        return true; // Handled
      }
    }

    // Don't handle - let other handlers deal with it
    return false;
  }, [
    barState.aiTier,
    barState.transcriptionTier,
    paneState.isExpanded,
    paneState.activeView,
    barActions,
  ]);

  // Set up keyboard listener
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // ⌘K / Ctrl+K - AI Quick Access
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        handleAIQuickAccess();
        return;
      }

      // Escape - De-escalate
      if (event.key === 'Escape') {
        const handled = handleEscape();
        if (handled) {
          event.preventDefault();
        }
        return;
      }
    };

    // Use capture phase to handle before other listeners
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [enabled, handleAIQuickAccess, handleEscape]);

  // Registration functions for inputs
  const registerDrawerInput = useCallback(
    (ref: HTMLTextAreaElement | HTMLInputElement | null) => {
      drawerInputRef.current = ref;
    },
    []
  );

  const registerPaletteInput = useCallback(
    (ref: HTMLTextAreaElement | HTMLInputElement | null) => {
      paletteInputRef.current = ref;
    },
    []
  );

  return {
    registerDrawerInput,
    registerPaletteInput,
    triggerAIQuickAccess: handleAIQuickAccess,
  };
}

// ============================================================================
// Provider Component
// ============================================================================

export interface AIKeyboardShortcutsProviderProps {
  children: React.ReactNode;
  /** Whether shortcuts are enabled */
  enabled?: boolean;
}

/**
 * Provider that enables ⌘K and Escape keyboard shortcuts with left pane awareness.
 * Wrap your app (inside BottomBarProvider and LeftPaneProvider) with this.
 *
 * AI input components should use useAIInputRegistry() to register themselves.
 */
export const AIKeyboardShortcutsProvider: React.FC<AIKeyboardShortcutsProviderProps> = ({
  children,
  enabled = true,
}) => {
  const { registerDrawerInput, registerPaletteInput } = useAIKeyboardShortcuts({
    enabled,
  });

  const contextValue: AIInputRegistryContextValue = {
    registerDrawerInput,
    registerPaletteInput,
  };

  return (
    <AIInputRegistryContext.Provider value={contextValue}>
      {children}
    </AIInputRegistryContext.Provider>
  );
};
