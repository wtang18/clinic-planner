/**
 * AI Subscription Manager
 *
 * Coordinates AI services by subscribing to store actions,
 * determining which services should run, and dispatching results.
 */

import type { EncounterState } from '../../state/types';
import type { EncounterAction } from '../../state/actions/types';
import type { Store } from '../../state/store/types';
import type {
  AIServiceRegistry,
  AIServiceResult,
  Notification,
  TriggerContext,
  AIService,
} from './types';
import type { ServiceExecutor } from './executor';

// ============================================================================
// Subscription Manager Interface
// ============================================================================

/**
 * Configuration for the subscription manager
 */
export interface SubscriptionManagerConfig {
  /** The service registry to use */
  registry: AIServiceRegistry;

  /** The state store to subscribe to */
  store: Store;

  /** The executor for running services */
  executor: ServiceExecutor;

  /** Optional handler for notifications */
  notificationHandler?: (notifications: Notification[]) => void;

  /** Maximum concurrent service executions (default: 5) */
  maxConcurrent?: number;

  /** Whether to enable interval-based services (default: true) */
  enableIntervals?: boolean;
}

/**
 * Running task info for status reporting
 */
export interface RunningTask {
  serviceId: string;
  startedAt: Date;
}

/**
 * Manages subscriptions and coordinates AI service execution
 */
export interface AISubscriptionManager {
  /**
   * Start listening to store actions and running services
   */
  start(): void;

  /**
   * Stop all subscriptions and cancel pending tasks
   */
  stop(): void;

  /**
   * Manually trigger a specific service (useful for testing)
   */
  triggerService(serviceId: string, context?: Partial<TriggerContext>): Promise<void>;

  /**
   * Check if the manager is currently running
   */
  isRunning(): boolean;

  /**
   * Get list of currently running tasks
   */
  getRunningTasks(): RunningTask[];
}

// ============================================================================
// Subscription Manager Implementation
// ============================================================================

class AISubscriptionManagerImpl implements AISubscriptionManager {
  private readonly registry: AIServiceRegistry;
  private readonly store: Store;
  private readonly executor: ServiceExecutor;
  private readonly notificationHandler?: (notifications: Notification[]) => void;
  private readonly maxConcurrent: number;
  private readonly enableIntervals: boolean;

  private running = false;
  private unsubscribe?: () => void;
  private intervalTimers = new Map<string, ReturnType<typeof setInterval>>();
  private runningTasks = new Map<string, RunningTask>();
  private pendingQueue: Array<{ service: AIService; trigger: TriggerContext }> = [];

  constructor(config: SubscriptionManagerConfig) {
    this.registry = config.registry;
    this.store = config.store;
    this.executor = config.executor;
    this.notificationHandler = config.notificationHandler;
    this.maxConcurrent = config.maxConcurrent ?? 5;
    this.enableIntervals = config.enableIntervals ?? true;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;

    // Subscribe to store actions
    this.unsubscribe = this.store.subscribe(this.handleStoreUpdate.bind(this));

    // Start interval-based services
    if (this.enableIntervals) {
      this.startIntervalServices();
    }
  }

  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;

    // Unsubscribe from store
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }

    // Clear all interval timers
    for (const timer of this.intervalTimers.values()) {
      clearInterval(timer);
    }
    this.intervalTimers.clear();

    // Cancel all running executions
    this.executor.cancelAll();
    this.runningTasks.clear();
    this.pendingQueue = [];
  }

  async triggerService(serviceId: string, context?: Partial<TriggerContext>): Promise<void> {
    const service = this.registry.getService(serviceId);
    if (!service) {
      throw new Error(`Unknown service: ${serviceId}`);
    }

    if (!this.registry.isEnabled(serviceId)) {
      throw new Error(`Service is disabled: ${serviceId}`);
    }

    const trigger: TriggerContext = {
      type: context?.type ?? 'action',
      timestamp: context?.timestamp ?? new Date(),
      action: context?.action,
      changedPaths: context?.changedPaths,
    };

    await this.runService(service, trigger);
  }

  isRunning(): boolean {
    return this.running;
  }

  getRunningTasks(): RunningTask[] {
    return Array.from(this.runningTasks.values());
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private handleStoreUpdate(_state: EncounterState, action: EncounterAction): void {
    if (!this.running) {
      return;
    }

    // Find services triggered by this action
    const triggeredServices = this.registry.getTriggeredServices(action);

    // Create trigger context
    const trigger: TriggerContext = {
      type: 'action',
      action,
      timestamp: new Date(),
    };

    // Queue services for execution
    for (const service of triggeredServices) {
      this.queueService(service, trigger);
    }

    // Process queue
    this.processQueue();
  }

  private startIntervalServices(): void {
    const intervalServices = this.registry.getIntervalServices();

    for (const service of intervalServices) {
      const interval = service.triggers.interval;
      if (!interval || interval <= 0) {
        continue;
      }

      const timer = setInterval(() => {
        if (!this.running || !this.registry.isEnabled(service.id)) {
          return;
        }

        const trigger: TriggerContext = {
          type: 'interval',
          timestamp: new Date(),
        };

        this.queueService(service, trigger);
        this.processQueue();
      }, interval);

      this.intervalTimers.set(service.id, timer);
    }
  }

  private queueService(service: AIService, trigger: TriggerContext): void {
    // Check if service should run
    const state = this.store.getState();
    if (!service.shouldRun(state, trigger)) {
      return;
    }

    // Don't queue if already running
    if (this.runningTasks.has(service.id)) {
      return;
    }

    // Don't queue duplicates
    const alreadyQueued = this.pendingQueue.some((item) => item.service.id === service.id);
    if (alreadyQueued) {
      return;
    }

    this.pendingQueue.push({ service, trigger });
  }

  private processQueue(): void {
    // Process items while we have capacity
    while (
      this.pendingQueue.length > 0 &&
      this.runningTasks.size < this.maxConcurrent
    ) {
      const item = this.pendingQueue.shift();
      if (!item) {
        break;
      }

      // Start execution (don't await, let it run in background)
      this.runService(item.service, item.trigger).catch((error) => {
        console.error(`Service ${item.service.id} failed:`, error);
      });
    }
  }

  private async runService(service: AIService, trigger: TriggerContext): Promise<void> {
    // Track running task
    this.runningTasks.set(service.id, {
      serviceId: service.id,
      startedAt: new Date(),
    });

    try {
      // Get current state
      const state = this.store.getState();

      // Execute the service
      const result = await this.executor.execute(service, state, trigger);

      // Dispatch resulting actions
      this.handleServiceResult(result);
    } catch (error) {
      // Log error but don't throw - other services should continue
      console.error(`Service ${service.id} execution failed:`, error);
    } finally {
      // Remove from running tasks
      this.runningTasks.delete(service.id);

      // Process more items from queue
      this.processQueue();
    }
  }

  private handleServiceResult(result: AIServiceResult): void {
    // Dispatch all actions from the result
    for (const action of result.actions) {
      this.store.dispatch(action);
    }

    // Handle notifications if handler provided
    if (this.notificationHandler && result.notifications && result.notifications.length > 0) {
      this.notificationHandler(result.notifications);
    }
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new subscription manager
 */
export function createSubscriptionManager(
  config: SubscriptionManagerConfig
): AISubscriptionManager {
  return new AISubscriptionManagerImpl(config);
}
