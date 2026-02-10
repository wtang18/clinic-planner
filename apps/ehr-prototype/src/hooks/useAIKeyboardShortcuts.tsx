/**
 * useAIKeyboardShortcuts Hook
 *
 * Handles Cmd+K (AI quick access) and Escape keyboard shortcuts with
 * awareness of the coordination state machine.
 *
 * Cmd+K behavior (per spec S9):
 * - AI drawer visible -> focus drawer input
 * - AI palette open -> focus palette input
 * - Otherwise -> dispatch CMD_K_PRESSED (opens AI palette), focus its input
 *
 * Escape behavior:
 * - AI palette open -> dispatch ESCAPE_PRESSED (collapse palette)
 * - TM palette open -> dispatch ESCAPE_PRESSED (collapse palette)
 * - AI drawer input focused -> blur input
 * - Otherwise -> no action (never closes left pane views)
 *
 * @see COORDINATION_STATE_MACHINE.md S9 for full specification
 */

import React, { useEffect, useRef, useCallback, useContext, createContext } from 'react';
import { Platform } from 'react-native';
import { useCoordination } from './useCoordination';

// ============================================================================
// Input Registration Context
// ============================================================================

interface AIInputRegistryContextValue {
  registerDrawerInput: (ref: HTMLTextAreaElement | HTMLInputElement | null) => void;
  registerPaletteInput: (ref: HTMLTextAreaElement | HTMLInputElement | null) => void;
}

const AIInputRegistryContext = createContext<AIInputRegistryContextValue | null>(null);

/**
 * Hook for AI input components to register themselves for Cmd+K focus management.
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
  /** Manually trigger Cmd+K behavior */
  triggerAIQuickAccess: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useAIKeyboardShortcuts(
  config: AIKeyboardShortcutsConfig = {}
): UseAIKeyboardShortcutsReturn {
  const { enabled = true } = config;
  const { state: coordState, dispatch: coordDispatch } = useCoordination();

  // Refs for input elements
  const drawerInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const paletteInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  /**
   * Cmd+K handler: Focus the highest-density visible AI surface
   */
  const handleAIQuickAccess = useCallback(() => {
    // Priority 1: AI drawer is open in left pane
    if (coordState.paneExpanded && coordState.paneView === 'ai') {
      if (drawerInputRef.current) {
        drawerInputRef.current.focus();
        return;
      }
    }

    // Priority 2: AI palette is already open
    if (coordState.aiTier === 'palette') {
      if (paletteInputRef.current) {
        paletteInputRef.current.focus();
        return;
      }
    }

    // Priority 3: Open AI palette via coordination and focus its input
    coordDispatch({ type: 'CMD_K_PRESSED' });
    // Focus happens after state update - use microtask
    queueMicrotask(() => {
      if (paletteInputRef.current) {
        paletteInputRef.current.focus();
      }
    });
  }, [coordState.paneExpanded, coordState.paneView, coordState.aiTier, coordDispatch]);

  /**
   * Escape handler: De-escalate one step
   */
  const handleEscape = useCallback(() => {
    // If any palette is open, collapse it
    if (coordState.aiTier === 'palette' || (coordState.txEligible && coordState.txTier === 'palette')) {
      coordDispatch({ type: 'ESCAPE_PRESSED' });
      return true; // Handled
    }

    // If in AI drawer and input is focused, blur it
    if (coordState.paneExpanded && coordState.paneView === 'ai') {
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
    coordState.aiTier,
    coordState.txTier,
    coordState.txEligible,
    coordState.paneExpanded,
    coordState.paneView,
    coordDispatch,
  ]);

  // Set up keyboard listener
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K / Ctrl+K - AI Quick Access
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
 * Provider that enables Cmd+K and Escape keyboard shortcuts with coordination awareness.
 * Wrap your app (inside CoordinationProvider and BottomBarProvider) with this.
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
