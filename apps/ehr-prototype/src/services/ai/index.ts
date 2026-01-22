/**
 * AI Service Layer
 *
 * Exports all AI service infrastructure for the EHR system.
 */

// Types
export type {
  AIService,
  AIServiceTriggers,
  AIServiceConfig,
  AIServiceResult,
  TriggerContext,
  Notification,
  ServiceExecution,
  ServiceExecutionStatus,
  ServiceStats,
} from './types';

// Registry
export type { AIServiceRegistry } from './registry';
export { createServiceRegistry } from './registry';

// Executor
export type { ServiceExecutor, ExecutionOptions } from './executor';
export { createServiceExecutor, ExecutionTimeoutError, ExecutionCancelledError } from './executor';

// Subscription Manager
export type { AISubscriptionManager, SubscriptionManagerConfig, RunningTask } from './subscription-manager';
export { createSubscriptionManager } from './subscription-manager';
