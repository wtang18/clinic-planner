/**
 * AI Service Registry
 *
 * Central registry for managing AI services. Handles registration,
 * enabling/disabling, and querying services based on triggers.
 */

import type { EncounterAction } from '../../state/actions/types';
import type { AIService, AIServiceTriggers } from './types';

// ============================================================================
// Registry Interface
// ============================================================================

/**
 * Central registry for AI services
 */
export interface AIServiceRegistry {
  /** All registered services */
  readonly services: Map<string, AIService>;

  /** Set of enabled service IDs */
  readonly enabledServices: Set<string>;

  /**
   * Register a new service
   * @throws if service with same ID already exists
   */
  register(service: AIService): void;

  /**
   * Unregister a service by ID
   */
  unregister(serviceId: string): void;

  /**
   * Enable a registered service
   */
  enable(serviceId: string): void;

  /**
   * Disable a service (still registered, won't run)
   */
  disable(serviceId: string): void;

  /**
   * Check if a service is enabled
   */
  isEnabled(serviceId: string): boolean;

  /**
   * Get a service by ID
   */
  getService(serviceId: string): AIService | undefined;

  /**
   * Get all registered services
   */
  getAllServices(): AIService[];

  /**
   * Get only enabled services
   */
  getEnabledServices(): AIService[];

  /**
   * Get services that should be triggered by a given action
   */
  getTriggeredServices(action: EncounterAction): AIService[];

  /**
   * Get services that watch for interval-based triggers
   */
  getIntervalServices(): AIService[];

  /**
   * Get services that watch specific state paths
   */
  getStateWatchingServices(changedPaths: string[]): AIService[];
}

// ============================================================================
// Registry Implementation
// ============================================================================

class AIServiceRegistryImpl implements AIServiceRegistry {
  readonly services = new Map<string, AIService>();
  readonly enabledServices = new Set<string>();

  register(service: AIService): void {
    if (this.services.has(service.id)) {
      throw new Error(`Service with ID "${service.id}" is already registered`);
    }
    this.services.set(service.id, service);
    // Services are enabled by default when registered
    this.enabledServices.add(service.id);
  }

  unregister(serviceId: string): void {
    this.services.delete(serviceId);
    this.enabledServices.delete(serviceId);
  }

  enable(serviceId: string): void {
    if (!this.services.has(serviceId)) {
      throw new Error(`Cannot enable unknown service: ${serviceId}`);
    }
    this.enabledServices.add(serviceId);
  }

  disable(serviceId: string): void {
    this.enabledServices.delete(serviceId);
  }

  isEnabled(serviceId: string): boolean {
    return this.enabledServices.has(serviceId);
  }

  getService(serviceId: string): AIService | undefined {
    return this.services.get(serviceId);
  }

  getAllServices(): AIService[] {
    return Array.from(this.services.values());
  }

  getEnabledServices(): AIService[] {
    return this.getAllServices().filter((s) => this.isEnabled(s.id));
  }

  getTriggeredServices(action: EncounterAction): AIService[] {
    return this.getEnabledServices().filter((service) =>
      matchesActionTrigger(service.triggers, action.type)
    );
  }

  getIntervalServices(): AIService[] {
    return this.getEnabledServices().filter(
      (service) => service.triggers.interval !== undefined && service.triggers.interval > 0
    );
  }

  getStateWatchingServices(changedPaths: string[]): AIService[] {
    return this.getEnabledServices().filter((service) =>
      matchesStateChangeTrigger(service.triggers, changedPaths)
    );
  }
}

// ============================================================================
// Trigger Matching Helpers
// ============================================================================

/**
 * Check if an action type matches a service's action triggers
 */
function matchesActionTrigger(triggers: AIServiceTriggers, actionType: string): boolean {
  if (!triggers.actions || triggers.actions.length === 0) {
    return false;
  }
  return triggers.actions.includes(actionType);
}

/**
 * Check if any changed paths match a service's state change triggers
 */
function matchesStateChangeTrigger(triggers: AIServiceTriggers, changedPaths: string[]): boolean {
  if (!triggers.stateChanges || triggers.stateChanges.length === 0) {
    return false;
  }

  return triggers.stateChanges.some((watchPath) =>
    changedPaths.some((changedPath) => pathMatches(watchPath, changedPath))
  );
}

/**
 * Check if a changed path matches a watch path.
 * Supports wildcards: 'entities.*' matches 'entities.items', 'entities.tasks', etc.
 */
function pathMatches(watchPath: string, changedPath: string): boolean {
  const watchParts = watchPath.split('.');
  const changedParts = changedPath.split('.');

  for (let i = 0; i < watchParts.length; i++) {
    const watchPart = watchParts[i];

    // Wildcard matches any single segment
    if (watchPart === '*') {
      // If this is the last part of watch path, it matches any remaining
      if (i === watchParts.length - 1) {
        return true;
      }
      continue;
    }

    // Double wildcard matches any depth
    if (watchPart === '**') {
      return true;
    }

    // Must have corresponding part in changed path
    if (i >= changedParts.length) {
      return false;
    }

    // Parts must match exactly
    if (watchPart !== changedParts[i]) {
      return false;
    }
  }

  // Watch path is prefix of changed path, or exact match
  return true;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new AI service registry
 */
export function createServiceRegistry(): AIServiceRegistry {
  return new AIServiceRegistryImpl();
}
