/**
 * AIServicesContext
 *
 * React context for AI service management.
 * Provides access to the AI manager and service controls.
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { AIManager } from '../services/ai/services/ai-manager';
import { createAIManager } from '../services/ai/services/ai-manager';
import type { AIServicesConfig } from '../services/ai/services/service-config';
import { DEFAULT_CONFIG } from '../services/ai/services/service-config';
import { useStore } from '../hooks/useEncounterState';

// ============================================================================
// Types
// ============================================================================

interface AIServicesContextValue {
  aiManager: AIManager | null;
  isInitialized: boolean;
  enableService: (serviceId: string) => void;
  disableService: (serviceId: string) => void;
  enabledServices: string[];
}

export interface AIServicesProviderProps {
  children: React.ReactNode;
  config?: Partial<AIServicesConfig>;
  autoInitialize?: boolean;
}

// ============================================================================
// Context
// ============================================================================

const AIServicesContext = createContext<AIServicesContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export const AIServicesProvider: React.FC<AIServicesProviderProps> = ({
  children,
  config,
  autoInitialize = true,
}) => {
  const store = useStore();
  const aiManagerRef = useRef<AIManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [enabledServices, setEnabledServices] = useState<string[]>([]);

  // Initialize AI manager
  useEffect(() => {
    if (!autoInitialize) return;

    // Create AI manager if not exists
    if (!aiManagerRef.current) {
      aiManagerRef.current = createAIManager();
    }

    const manager = aiManagerRef.current;

    // Initialize with store and config
    const mergedConfig: AIServicesConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    manager.initialize(store, mergedConfig);
    setIsInitialized(true);

    // Get initial enabled services
    setEnabledServices(mergedConfig.enabledServices);

    // Cleanup on unmount
    return () => {
      if (aiManagerRef.current) {
        aiManagerRef.current.shutdown();
      }
    };
  }, [store, config, autoInitialize]);

  // Enable a service
  const enableService = useCallback((serviceId: string) => {
    if (aiManagerRef.current) {
      aiManagerRef.current.enableService(serviceId);
      setEnabledServices(prev =>
        prev.includes(serviceId) ? prev : [...prev, serviceId]
      );
    }
  }, []);

  // Disable a service
  const disableService = useCallback((serviceId: string) => {
    if (aiManagerRef.current) {
      aiManagerRef.current.disableService(serviceId);
      setEnabledServices(prev => prev.filter(id => id !== serviceId));
    }
  }, []);

  const value: AIServicesContextValue = {
    aiManager: aiManagerRef.current,
    isInitialized,
    enableService,
    disableService,
    enabledServices,
  };

  return (
    <AIServicesContext.Provider value={value}>
      {children}
    </AIServicesContext.Provider>
  );
};

AIServicesProvider.displayName = 'AIServicesProvider';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access AI services context
 */
export const useAIServices = (): AIServicesContextValue => {
  const context = useContext(AIServicesContext);
  if (!context) {
    throw new Error('useAIServices must be used within AIServicesProvider');
  }
  return context;
};

/**
 * Check if AI services are initialized
 */
export const useAIServicesReady = (): boolean => {
  return useAIServices().isInitialized;
};

/**
 * Check if a specific service is enabled
 */
export const useIsServiceEnabled = (serviceId: string): boolean => {
  const { enabledServices } = useAIServices();
  return enabledServices.includes(serviceId);
};
