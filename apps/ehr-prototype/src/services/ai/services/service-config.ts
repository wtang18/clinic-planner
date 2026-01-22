/**
 * Service Configuration
 *
 * Configurable settings for AI services.
 */

import type { AIServiceConfig } from '../types';
import { SERVICE_IDS } from './all-services';

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration for all AI services
 */
export interface AIServicesConfig {
  /** IDs of services to enable */
  enabledServices: string[];

  /** Service-specific configuration overrides */
  serviceOverrides: Record<string, Partial<AIServiceConfig>>;

  /** Global settings */
  globalSettings: {
    /** Maximum concurrent task executions */
    maxConcurrentTasks: number;

    /** Default timeout in milliseconds */
    defaultTimeout: number;

    /** Enable local LLM processing */
    enableLocalLLM: boolean;

    /** Cloud endpoint for remote services */
    cloudEndpoint?: string;
  };
}

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Default AI services configuration
 */
export const DEFAULT_CONFIG: AIServicesConfig = {
  enabledServices: [
    SERVICE_IDS.ENTITY_EXTRACTION,
    SERVICE_IDS.DX_ASSOCIATION,
    SERVICE_IDS.DRUG_INTERACTION,
    SERVICE_IDS.CARE_GAP_MONITOR,
    SERVICE_IDS.NOTE_GENERATION,
  ],
  serviceOverrides: {},
  globalSettings: {
    maxConcurrentTasks: 5,
    defaultTimeout: 10000,
    enableLocalLLM: true,
  },
};

// ============================================================================
// Configuration Utilities
// ============================================================================

/**
 * Merge configuration with overrides
 */
export function mergeConfig(
  base: AIServicesConfig,
  overrides: Partial<AIServicesConfig>
): AIServicesConfig {
  return {
    enabledServices: overrides.enabledServices ?? base.enabledServices,
    serviceOverrides: {
      ...base.serviceOverrides,
      ...overrides.serviceOverrides,
    },
    globalSettings: {
      ...base.globalSettings,
      ...overrides.globalSettings,
    },
  };
}

/**
 * Get effective configuration for a service
 */
export function getServiceConfig(
  serviceId: string,
  baseConfig: AIServiceConfig,
  globalConfig: AIServicesConfig
): AIServiceConfig {
  const overrides = globalConfig.serviceOverrides[serviceId] || {};

  return {
    ...baseConfig,
    ...overrides,
    timeout: overrides.timeout ?? baseConfig.timeout ?? globalConfig.globalSettings.defaultTimeout,
  };
}

// ============================================================================
// Presets
// ============================================================================

/**
 * Configuration preset for development
 */
export const DEV_CONFIG: Partial<AIServicesConfig> = {
  globalSettings: {
    maxConcurrentTasks: 10,
    defaultTimeout: 30000,
    enableLocalLLM: true,
  },
};

/**
 * Configuration preset for production
 */
export const PROD_CONFIG: Partial<AIServicesConfig> = {
  globalSettings: {
    maxConcurrentTasks: 5,
    defaultTimeout: 10000,
    enableLocalLLM: true,
    cloudEndpoint: undefined, // Set from environment
  },
};

/**
 * Configuration preset for testing (minimal services)
 */
export const TEST_CONFIG: Partial<AIServicesConfig> = {
  enabledServices: [
    SERVICE_IDS.ENTITY_EXTRACTION,
    SERVICE_IDS.DX_ASSOCIATION,
  ],
  globalSettings: {
    maxConcurrentTasks: 2,
    defaultTimeout: 5000,
    enableLocalLLM: true,
  },
};
