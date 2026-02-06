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
// Side Effects & Notifications
// ============================================================================

export type {
  SideEffectHandler,
} from './side-effect-handlers';

export {
  itemAddedHandler,
  suggestionAcceptedHandler,
  modeChangedHandler,
  taskCompletedHandler,
  itemConfirmedHandler,
  cleanupExpiredSuggestionsHandler,
  DEFAULT_SIDE_EFFECT_HANDLERS,
  createSideEffectRunner,
} from './side-effect-handlers';

export type {
  NotificationManager,
  NotificationHandler,
  DismissHandler,
  NotificationManagerConfig,
} from './notification-manager';

export {
  createNotificationManager,
  getNotificationManager,
  createNotification,
  successNotification,
  errorNotification,
  warningNotification,
  infoNotification,
} from './notification-manager';

// ============================================================================
// Service Initialization
// ============================================================================

export type {
  InitializationResult,
  InitializationConfig,
  AuditLogEntry,
} from './initialization';

export {
  initializeServices,
  initializeDevServices,
} from './initialization';

/**
 * Shutdown all services
 */
export function shutdownServices(): void {
  const manager = getAIManager();
  manager.shutdown();
}
