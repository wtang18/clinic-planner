/**
 * AI Manager
 *
 * Unified manager for all AI services. Provides a single entry point
 * for initializing, controlling, and monitoring AI services.
 */

import type { Store } from '../../../state/store/types';
import type { AIServiceResult, Notification } from '../types';
import { createServiceRegistry, type AIServiceRegistry } from '../registry';
import { createServiceExecutor, type ServiceExecutor } from '../executor';
import { createSubscriptionManager, type AISubscriptionManager } from '../subscription-manager';
import { ALL_AI_SERVICES } from './all-services';
import type { AIServicesConfig } from './service-config';
import { DEFAULT_CONFIG, mergeConfig } from './service-config';

// ============================================================================
// Types
// ============================================================================

/**
 * Status of the AI manager
 */
export interface AIManagerStatus {
  /** Whether the manager has been initialized */
  initialized: boolean;

  /** Whether the manager is currently running */
  running: boolean;

  /** IDs of enabled services */
  enabledServices: string[];

  /** Number of currently running tasks */
  runningTasks: number;
}

/**
 * Status of a specific service
 */
export interface ServiceStatus {
  /** Whether the service is enabled */
  enabled: boolean;

  /** When the service last ran successfully */
  lastRun?: Date;

  /** Last error message */
  lastError?: string;

  /** Total run count */
  runCount: number;

  /** Total error count */
  errorCount: number;
}

/**
 * AI Manager interface
 */
export interface AIManager {
  // Lifecycle
  /**
   * Initialize the AI manager with a store
   */
  initialize(store: Store, config?: Partial<AIServicesConfig>): void;

  /**
   * Shutdown the AI manager
   */
  shutdown(): void;

  // Service control
  /**
   * Enable a service
   */
  enableService(serviceId: string): void;

  /**
   * Disable a service
   */
  disableService(serviceId: string): void;

  /**
   * Check if a service is enabled
   */
  isServiceEnabled(serviceId: string): boolean;

  // Status
  /**
   * Get overall manager status
   */
  getStatus(): AIManagerStatus;

  /**
   * Get status of a specific service
   */
  getServiceStatus(serviceId: string): ServiceStatus;

  // Events
  /**
   * Subscribe to service completion events
   */
  onServiceComplete(
    handler: (serviceId: string, result: AIServiceResult) => void
  ): () => void;

  /**
   * Subscribe to service error events
   */
  onServiceError(
    handler: (serviceId: string, error: Error) => void
  ): () => void;
}

// ============================================================================
// Implementation
// ============================================================================

class AIManagerImpl implements AIManager {
  private config: AIServicesConfig = DEFAULT_CONFIG;
  private registry: AIServiceRegistry | null = null;
  private executor: ServiceExecutor | null = null;
  private subscriptionManager: AISubscriptionManager | null = null;
  private initialized = false;
  private running = false;

  private serviceStats = new Map<string, {
    runCount: number;
    errorCount: number;
    lastRun?: Date;
    lastError?: string;
  }>();

  private completeHandlers = new Set<(serviceId: string, result: AIServiceResult) => void>();
  private errorHandlers = new Set<(serviceId: string, error: Error) => void>();

  initialize(store: Store, config?: Partial<AIServicesConfig>): void {
    if (this.initialized) {
      console.warn('AI Manager is already initialized');
      return;
    }

    // Merge configuration
    if (config) {
      this.config = mergeConfig(DEFAULT_CONFIG, config);
    }

    // Create components
    this.registry = createServiceRegistry();
    this.executor = createServiceExecutor();

    // Register all services
    for (const service of ALL_AI_SERVICES) {
      this.registry.register(service);

      // Initialize stats
      this.serviceStats.set(service.id, {
        runCount: 0,
        errorCount: 0,
      });

      // Disable services not in enabled list
      if (!this.config.enabledServices.includes(service.id)) {
        this.registry.disable(service.id);
      }
    }

    // Create subscription manager
    this.subscriptionManager = createSubscriptionManager({
      registry: this.registry,
      store,
      executor: this.executor,
      maxConcurrent: this.config.globalSettings.maxConcurrentTasks,
      notificationHandler: this.handleNotifications.bind(this),
    });

    // Start the subscription manager
    this.subscriptionManager.start();

    this.initialized = true;
    this.running = true;
  }

  shutdown(): void {
    if (!this.initialized) {
      return;
    }

    // Stop subscription manager
    if (this.subscriptionManager) {
      this.subscriptionManager.stop();
    }

    // Cancel any running executions
    if (this.executor) {
      this.executor.cancelAll();
    }

    this.registry = null;
    this.executor = null;
    this.subscriptionManager = null;
    this.initialized = false;
    this.running = false;
  }

  enableService(serviceId: string): void {
    if (!this.registry) {
      throw new Error('AI Manager not initialized');
    }
    this.registry.enable(serviceId);
  }

  disableService(serviceId: string): void {
    if (!this.registry) {
      throw new Error('AI Manager not initialized');
    }
    this.registry.disable(serviceId);
  }

  isServiceEnabled(serviceId: string): boolean {
    if (!this.registry) {
      return false;
    }
    return this.registry.isEnabled(serviceId);
  }

  getStatus(): AIManagerStatus {
    return {
      initialized: this.initialized,
      running: this.running,
      enabledServices: this.registry
        ? this.registry.getEnabledServices().map((s) => s.id)
        : [],
      runningTasks: this.subscriptionManager
        ? this.subscriptionManager.getRunningTasks().length
        : 0,
    };
  }

  getServiceStatus(serviceId: string): ServiceStatus {
    const stats = this.serviceStats.get(serviceId);
    const enabled = this.registry?.isEnabled(serviceId) ?? false;

    return {
      enabled,
      lastRun: stats?.lastRun,
      lastError: stats?.lastError,
      runCount: stats?.runCount ?? 0,
      errorCount: stats?.errorCount ?? 0,
    };
  }

  onServiceComplete(
    handler: (serviceId: string, result: AIServiceResult) => void
  ): () => void {
    this.completeHandlers.add(handler);
    return () => {
      this.completeHandlers.delete(handler);
    };
  }

  onServiceError(
    handler: (serviceId: string, error: Error) => void
  ): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  // Internal handlers
  private handleNotifications(notifications: Notification[]): void {
    // In production, would dispatch to notification system
    for (const notification of notifications) {
      console.log(`[AI Notification] ${notification.type}: ${notification.message}`);
    }
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new AI manager
 */
export function createAIManager(): AIManager {
  return new AIManagerImpl();
}

// ============================================================================
// Singleton Instance
// ============================================================================

let aiManagerInstance: AIManager | null = null;

/**
 * Get the singleton AI manager instance
 */
export function getAIManager(): AIManager {
  if (!aiManagerInstance) {
    aiManagerInstance = createAIManager();
  }
  return aiManagerInstance;
}
