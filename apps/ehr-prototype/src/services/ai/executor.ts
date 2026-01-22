/**
 * AI Service Executor
 *
 * Handles the execution of AI services with timeout, retry logic,
 * and cancellation support.
 */

import type { EncounterState } from '../../state/types';
import type {
  AIService,
  AIServiceResult,
  TriggerContext,
  ServiceExecution,
  ServiceExecutionStatus,
} from './types';

// ============================================================================
// Executor Interface
// ============================================================================

/**
 * Options for service execution
 */
export interface ExecutionOptions {
  /** Override the service's configured timeout */
  timeout?: number;

  /** Override the service's configured retry count */
  retries?: number;

  /** Callback for progress updates */
  onProgress?: (progress: number, message?: string) => void;
}

/**
 * Service executor that handles running AI services
 */
export interface ServiceExecutor {
  /**
   * Execute a service with the given state and trigger context
   */
  execute(
    service: AIService,
    state: EncounterState,
    trigger: TriggerContext,
    options?: ExecutionOptions
  ): Promise<AIServiceResult>;

  /**
   * Cancel a running service execution
   */
  cancel(serviceId: string): void;

  /**
   * Cancel all running executions
   */
  cancelAll(): void;

  /**
   * Check if a service is currently executing
   */
  isExecuting(serviceId: string): boolean;

  /**
   * Get the execution record for a service
   */
  getExecution(serviceId: string): ServiceExecution | undefined;

  /**
   * Get all current executions
   */
  getAllExecutions(): ServiceExecution[];
}

// ============================================================================
// Executor Implementation
// ============================================================================

class ServiceExecutorImpl implements ServiceExecutor {
  private executions = new Map<string, ServiceExecution>();
  private abortControllers = new Map<string, AbortController>();
  private executionIdCounter = 0;

  async execute(
    service: AIService,
    state: EncounterState,
    trigger: TriggerContext,
    options?: ExecutionOptions
  ): Promise<AIServiceResult> {
    const executionId = `exec-${++this.executionIdCounter}`;
    const timeout = options?.timeout ?? service.config.timeout;
    const maxRetries = options?.retries ?? service.config.maxRetries ?? 3;
    const retryDelay = service.config.retryDelayMs ?? 1000;

    // Create abort controller for cancellation
    const abortController = new AbortController();
    this.abortControllers.set(service.id, abortController);

    // Create execution record
    const execution: ServiceExecution = {
      id: executionId,
      serviceId: service.id,
      status: 'running',
      trigger,
      startedAt: new Date(),
    };
    this.executions.set(service.id, execution);

    let lastError: Error | undefined;
    let attempts = 0;

    try {
      while (attempts <= maxRetries) {
        // Check if cancelled
        if (abortController.signal.aborted) {
          throw new ExecutionCancelledError(service.id);
        }

        try {
          // Execute with timeout
          const result = await this.executeWithTimeout(
            service,
            state,
            trigger,
            timeout,
            abortController.signal
          );

          // Success - update execution record
          execution.status = 'completed';
          execution.completedAt = new Date();
          execution.result = result;
          execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();

          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Don't retry if cancelled or not retryable
          if (error instanceof ExecutionCancelledError) {
            throw error;
          }

          if (!service.config.retryable || attempts >= maxRetries) {
            throw lastError;
          }

          // Wait before retry with exponential backoff
          attempts++;
          const delay = retryDelay * Math.pow(2, attempts - 1);
          await this.sleep(delay, abortController.signal);
        }
      }

      // Should not reach here, but just in case
      throw lastError ?? new Error('Unknown execution error');
    } catch (error) {
      // Update execution record with failure
      if (error instanceof ExecutionCancelledError) {
        execution.status = 'cancelled';
      } else if (error instanceof ExecutionTimeoutError) {
        execution.status = 'timeout';
      } else {
        execution.status = 'failed';
      }

      execution.completedAt = new Date();
      execution.error = error instanceof Error ? error : new Error(String(error));
      execution.durationMs = execution.completedAt.getTime() - execution.startedAt.getTime();

      throw error;
    } finally {
      // Cleanup abort controller
      this.abortControllers.delete(service.id);
    }
  }

  cancel(serviceId: string): void {
    const controller = this.abortControllers.get(serviceId);
    if (controller) {
      controller.abort();
    }
  }

  cancelAll(): void {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
  }

  isExecuting(serviceId: string): boolean {
    const execution = this.executions.get(serviceId);
    return execution?.status === 'running';
  }

  getExecution(serviceId: string): ServiceExecution | undefined {
    return this.executions.get(serviceId);
  }

  getAllExecutions(): ServiceExecution[] {
    return Array.from(this.executions.values());
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private async executeWithTimeout(
    service: AIService,
    state: EncounterState,
    trigger: TriggerContext,
    timeout: number,
    signal: AbortSignal
  ): Promise<AIServiceResult> {
    return new Promise<AIServiceResult>((resolve, reject) => {
      // Timeout handler
      const timeoutId = setTimeout(() => {
        reject(new ExecutionTimeoutError(service.id, timeout));
      }, timeout);

      // Abort handler
      const abortHandler = () => {
        clearTimeout(timeoutId);
        reject(new ExecutionCancelledError(service.id));
      };
      signal.addEventListener('abort', abortHandler);

      // Execute service
      service
        .run(state, trigger)
        .then((result) => {
          clearTimeout(timeoutId);
          signal.removeEventListener('abort', abortHandler);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          signal.removeEventListener('abort', abortHandler);
          reject(error);
        });
    });
  }

  private sleep(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, ms);

      const abortHandler = () => {
        clearTimeout(timeoutId);
        reject(new ExecutionCancelledError('sleep'));
      };

      signal.addEventListener('abort', abortHandler);

      // Cleanup listener after timeout
      setTimeout(() => {
        signal.removeEventListener('abort', abortHandler);
      }, ms + 1);
    });
  }
}

// ============================================================================
// Custom Errors
// ============================================================================

/**
 * Error thrown when a service execution times out
 */
export class ExecutionTimeoutError extends Error {
  constructor(
    public readonly serviceId: string,
    public readonly timeoutMs: number
  ) {
    super(`Service "${serviceId}" timed out after ${timeoutMs}ms`);
    this.name = 'ExecutionTimeoutError';
  }
}

/**
 * Error thrown when a service execution is cancelled
 */
export class ExecutionCancelledError extends Error {
  constructor(public readonly serviceId: string) {
    super(`Service "${serviceId}" execution was cancelled`);
    this.name = 'ExecutionCancelledError';
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new service executor
 */
export function createServiceExecutor(): ServiceExecutor {
  return new ServiceExecutorImpl();
}
