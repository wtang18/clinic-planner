/**
 * Service Initialization
 *
 * Orchestrates initialization of AI services and wires them to the store.
 */

import type { Store } from '../state/store/types';
import type { AIManager } from './ai/services/ai-manager';
import { createAIManager } from './ai/services/ai-manager';
import type { AIServicesConfig } from './ai/services/service-config';
import { DEFAULT_CONFIG } from './ai/services/service-config';
import type { Notification } from '../state/types';

// ============================================================================
// Types
// ============================================================================

export interface InitializationResult {
  aiManager: AIManager;
  cleanup: () => void;
}

export interface InitializationConfig {
  /** Store instance to connect services to */
  store: Store;
  /** AI services configuration overrides */
  aiConfig?: Partial<AIServicesConfig>;
  /** Enable audit logging */
  enableAuditLog?: boolean;
  /** Custom audit log handler */
  auditLogHandler?: (entry: AuditLogEntry) => void;
  /** Notification handler for UI updates */
  notificationHandler?: (notifications: Notification[]) => void;
  /** Called when a service completes processing */
  onServiceComplete?: (serviceId: string, result: unknown) => void;
  /** Called when a service encounters an error */
  onServiceError?: (serviceId: string, error: Error) => void;
}

export interface AuditLogEntry {
  timestamp: Date;
  action: string;
  userId?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize all services and wire them to the store
 */
export function initializeServices(config: InitializationConfig): InitializationResult {
  const {
    store,
    aiConfig,
    enableAuditLog = true,
    auditLogHandler,
    notificationHandler,
    onServiceComplete,
    onServiceError,
  } = config;

  // 1. Create AI manager
  const aiManager = createAIManager();

  // 2. Merge configuration
  const mergedConfig: AIServicesConfig = {
    ...DEFAULT_CONFIG,
    ...aiConfig,
  };

  // 3. Initialize with store and config
  aiManager.initialize(store, mergedConfig);

  // 4. Set up notification forwarding if handler provided
  if (notificationHandler) {
    // Subscribe to store changes for notifications
    store.subscribe((state, action) => {
      // Check for notification-generating actions
      if (action.type === 'TASK_COMPLETED' || action.type === 'TASK_FAILED') {
        const task = state.entities.tasks[action.payload.id];
        if (task) {
          const notification: Notification = {
            id: `notif-${Date.now()}`,
            type: action.type === 'TASK_FAILED' ? 'error' : 'success',
            message: task.displayStatus,
            createdAt: new Date(),
          };
          notificationHandler([notification]);
        }
      }
    });
  }

  // 5. Set up audit logging if enabled
  if (enableAuditLog) {
    const handler = auditLogHandler || defaultAuditHandler;
    store.subscribe((state, action) => {
      handler({
        timestamp: new Date(),
        action: action.type,
        userId: state.session.currentUser?.id,
        details: action.payload as Record<string, unknown>,
      });
    });
  }

  // 6. Create cleanup function
  const cleanup = () => {
    aiManager.shutdown();
  };

  return { aiManager, cleanup };
}

/**
 * Default audit log handler (logs to console in development)
 */
function defaultAuditHandler(entry: AuditLogEntry): void {
  if (__DEV__) {
    console.log('[AUDIT]', entry.timestamp.toISOString(), entry.action, entry.details);
  }
}

// ============================================================================
// Quick initialization helper
// ============================================================================

/**
 * Quick initialization for development/testing
 */
export function initializeDevServices(store: Store): InitializationResult {
  return initializeServices({
    store,
    enableAuditLog: true,
    aiConfig: {
      enabledServices: [
        'entity-extraction',
        'dx-association',
        'drug-interaction',
        'care-gap-monitor',
        'note-generation',
      ],
    },
  });
}
