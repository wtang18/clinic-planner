/**
 * AI Service Types
 *
 * Core interfaces for the AI service layer that powers intelligent
 * background processing during clinical encounters.
 */

import type { EncounterState } from '../../state/types';
import type { EncounterAction } from '../../state/actions/types';

// ============================================================================
// AI Service Interface
// ============================================================================

/**
 * AI Service - A pluggable unit that reacts to state changes and produces actions.
 * Services are the building blocks of the AI layer.
 */
export interface AIService {
  /** Unique identifier for this service */
  id: string;

  /** Human-readable name */
  name: string;

  /** What triggers this service to potentially run */
  triggers: AIServiceTriggers;

  /**
   * Determines if this service should actually run given the current context.
   * Called after a trigger matches but before execution.
   */
  shouldRun: (state: EncounterState, trigger: TriggerContext) => boolean;

  /**
   * Executes the service logic and returns actions to dispatch.
   * Should be idempotent and side-effect free (effects happen via returned actions).
   */
  run: (state: EncounterState, trigger: TriggerContext) => Promise<AIServiceResult>;

  /** Service configuration */
  config: AIServiceConfig;
}

// ============================================================================
// Trigger Configuration
// ============================================================================

/**
 * Defines what can trigger a service to run
 */
export interface AIServiceTriggers {
  /** Action types to react to (e.g., 'ITEM_ADDED', 'TRANSCRIPTION_SEGMENT_RECEIVED') */
  actions?: string[];

  /** State paths to watch for changes (e.g., 'entities.items', 'session.mode') */
  stateChanges?: string[];

  /** Polling interval in milliseconds (for periodic checks) */
  interval?: number;
}

/**
 * Context provided when a service is triggered
 */
export interface TriggerContext {
  /** What type of trigger activated this service */
  type: 'action' | 'state-change' | 'interval';

  /** The action that triggered (if type is 'action') */
  action?: EncounterAction;

  /** State paths that changed (if type is 'state-change') */
  changedPaths?: string[];

  /** When this trigger occurred */
  timestamp: Date;
}

// ============================================================================
// Service Configuration
// ============================================================================

/**
 * Configuration for how a service should be executed
 */
export interface AIServiceConfig {
  /**
   * Run on local LLM vs cloud.
   * Local = PHI-safe, no network required
   * Cloud = More powerful, requires network
   */
  local: boolean;

  /** Maximum execution time in milliseconds before timeout */
  timeout: number;

  /** Whether the service can be retried on failure */
  retryable: boolean;

  /** Whether the service requires network access */
  requiresNetwork: boolean;

  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;

  /** Delay between retries in milliseconds (default: 1000) */
  retryDelayMs?: number;
}

// ============================================================================
// Service Results
// ============================================================================

/**
 * Result returned by a service after execution
 */
export interface AIServiceResult {
  /** Actions to dispatch to the store */
  actions: EncounterAction[];

  /** Optional notifications to show the user */
  notifications?: Notification[];
}

/**
 * Notification to display to the user
 */
export interface Notification {
  /** Notification severity/type */
  type: 'info' | 'warning' | 'error';

  /** Message to display */
  message: string;

  /** If true, notification stays until explicitly dismissed */
  persistent?: boolean;

  /** Label for optional action button */
  actionLabel?: string;

  /** Target identifier for the action (e.g., item ID to navigate to) */
  actionTarget?: string;
}

// ============================================================================
// Execution Types
// ============================================================================

/**
 * Status of a service execution
 */
export type ServiceExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'timeout'
  | 'cancelled';

/**
 * Record of a service execution
 */
export interface ServiceExecution {
  /** Unique ID for this execution */
  id: string;

  /** Service that was executed */
  serviceId: string;

  /** Current status */
  status: ServiceExecutionStatus;

  /** What triggered this execution */
  trigger: TriggerContext;

  /** When execution started */
  startedAt: Date;

  /** When execution completed (if finished) */
  completedAt?: Date;

  /** Result if successful */
  result?: AIServiceResult;

  /** Error if failed */
  error?: Error;

  /** Execution duration in milliseconds */
  durationMs?: number;
}

// ============================================================================
// Service Statistics
// ============================================================================

/**
 * Statistics for a service's execution history
 */
export interface ServiceStats {
  /** Total number of executions */
  runCount: number;

  /** Number of successful executions */
  successCount: number;

  /** Number of failed executions */
  errorCount: number;

  /** Average execution time in milliseconds */
  avgDurationMs: number;

  /** Last successful execution time */
  lastSuccessAt?: Date;

  /** Last error time */
  lastErrorAt?: Date;

  /** Last error message */
  lastError?: string;
}
