/**
 * Services Layer
 *
 * Exports all services for the EHR system.
 */

import type { Store } from '../state/store/types';
import type { AIServicesConfig } from './ai/services/service-config';
import { getAIManager, type AIManager } from './ai/services/ai-manager';

// ============================================================================
// AI Services
// ============================================================================

// Core infrastructure
export * from './ai';

// Service registry
export { ALL_AI_SERVICES, SERVICE_IDS, type ServiceId } from './ai/services/all-services';

// Service configuration
export type { AIServicesConfig } from './ai/services/service-config';
export {
  DEFAULT_CONFIG,
  DEV_CONFIG,
  PROD_CONFIG,
  TEST_CONFIG,
  mergeConfig,
  getServiceConfig,
} from './ai/services/service-config';

// AI Manager
export type { AIManager, AIManagerStatus, ServiceStatus } from './ai/services/ai-manager';
export { createAIManager, getAIManager } from './ai/services/ai-manager';

// Individual services
export { entityExtractionService } from './ai/entity-extraction';
export { dxAssociationService } from './ai/dx-association';
export { drugInteractionService } from './ai/drug-interaction';
export { careGapMonitorService } from './ai/care-gap-monitor';
export { noteGenerationService } from './ai/note-generation';

// ============================================================================
// Transcription Service
// ============================================================================

export * from './transcription';

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Initialize all services with a store
 *
 * @param store - The state store
 * @param config - Optional configuration overrides
 * @returns The AI manager instance
 */
export function initializeServices(
  store: Store,
  config?: Partial<AIServicesConfig>
): AIManager {
  const manager = getAIManager();
  manager.initialize(store, config);
  return manager;
}

/**
 * Shutdown all services
 */
export function shutdownServices(): void {
  const manager = getAIManager();
  manager.shutdown();
}
