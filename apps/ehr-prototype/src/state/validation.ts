/**
 * State validation utilities
 */

import type { EncounterState } from './types';

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Type guard to check if an unknown value is a valid EncounterState
 */
export function isValidState(state: unknown): state is EncounterState {
  if (!state || typeof state !== 'object') {
    return false;
  }
  
  const s = state as Record<string, unknown>;
  
  // Check required top-level keys exist
  const requiredKeys = ['entities', 'relationships', 'context', 'session', 'sync', 'collaboration'];
  for (const key of requiredKeys) {
    if (!(key in s)) {
      return false;
    }
  }
  
  // Check entities structure
  if (!s.entities || typeof s.entities !== 'object') {
    return false;
  }
  
  const entities = s.entities as Record<string, unknown>;
  const entityKeys = ['items', 'suggestions', 'tasks', 'careGaps'];
  for (const key of entityKeys) {
    if (!(key in entities) || typeof entities[key] !== 'object') {
      return false;
    }
  }
  
  return true;
}

/**
 * Validates the encounter state and returns detailed errors
 */
export function validateEncounterState(state: EncounterState): ValidationResult {
  const errors: string[] = [];
  
  // Validate entities
  validateEntities(state, errors);
  
  // Validate relationships
  validateRelationships(state, errors);
  
  // Validate context
  validateContext(state, errors);
  
  // Validate session
  validateSession(state, errors);
  
  // Validate sync
  validateSync(state, errors);
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateEntities(state: EncounterState, errors: string[]): void {
  // Check items have required fields
  for (const [id, item] of Object.entries(state.entities.items)) {
    if (!item.id) {
      errors.push(`Item ${id} is missing 'id' field`);
    }
    if (item.id !== id) {
      errors.push(`Item ${id} has mismatched id: ${item.id}`);
    }
    if (!item.category) {
      errors.push(`Item ${id} is missing 'category' field`);
    }
  }
  
  // Check suggestions have required fields
  for (const [id, suggestion] of Object.entries(state.entities.suggestions)) {
    if (!suggestion.id) {
      errors.push(`Suggestion ${id} is missing 'id' field`);
    }
    if (suggestion.id !== id) {
      errors.push(`Suggestion ${id} has mismatched id: ${suggestion.id}`);
    }
  }
  
  // Check tasks have required fields
  for (const [id, task] of Object.entries(state.entities.tasks)) {
    if (!task.id) {
      errors.push(`Task ${id} is missing 'id' field`);
    }
    if (task.id !== id) {
      errors.push(`Task ${id} has mismatched id: ${task.id}`);
    }
  }
  
  // Check care gaps have required fields
  for (const [id, gap] of Object.entries(state.entities.careGaps)) {
    if (!gap.id) {
      errors.push(`CareGap ${id} is missing 'id' field`);
    }
    if (gap.id !== id) {
      errors.push(`CareGap ${id} has mismatched id: ${gap.id}`);
    }
  }
}

function validateRelationships(state: EncounterState, errors: string[]): void {
  // Check itemOrder references valid items
  for (const itemId of state.relationships.itemOrder) {
    if (!(itemId in state.entities.items)) {
      errors.push(`itemOrder references non-existent item: ${itemId}`);
    }
  }
  
  // Check taskToItem references valid tasks and items
  for (const [taskId, itemId] of Object.entries(state.relationships.taskToItem)) {
    if (!(taskId in state.entities.tasks)) {
      errors.push(`taskToItem references non-existent task: ${taskId}`);
    }
    if (!(itemId in state.entities.items)) {
      errors.push(`taskToItem references non-existent item: ${itemId}`);
    }
  }
  
  // Check suggestionToItem references valid suggestions
  for (const [suggestionId, itemId] of Object.entries(state.relationships.suggestionToItem)) {
    if (!(suggestionId in state.entities.suggestions)) {
      errors.push(`suggestionToItem references non-existent suggestion: ${suggestionId}`);
    }
    if (itemId !== null && !(itemId in state.entities.items)) {
      errors.push(`suggestionToItem references non-existent item: ${itemId}`);
    }
  }
  
  // Check careGapToItems references valid care gaps and items
  for (const [gapId, itemIds] of Object.entries(state.relationships.careGapToItems)) {
    if (!(gapId in state.entities.careGaps)) {
      errors.push(`careGapToItems references non-existent care gap: ${gapId}`);
    }
    for (const itemId of itemIds) {
      if (!(itemId in state.entities.items)) {
        errors.push(`careGapToItems references non-existent item: ${itemId}`);
      }
    }
  }
}

function validateContext(state: EncounterState, errors: string[]): void {
  // If encounter is set, validate required fields
  if (state.context.encounter) {
    if (!state.context.encounter.id) {
      errors.push('Encounter is missing id');
    }
    if (!state.context.encounter.status) {
      errors.push('Encounter is missing status');
    }
  }
  
  // If patient is set, validate required fields
  if (state.context.patient) {
    if (!state.context.patient.id) {
      errors.push('Patient is missing id');
    }
    if (!state.context.patient.mrn) {
      errors.push('Patient is missing mrn');
    }
  }
}

function validateSession(state: EncounterState, errors: string[]): void {
  // Validate mode is valid
  const validModes = ['capture', 'process', 'review'];
  if (!validModes.includes(state.session.mode)) {
    errors.push(`Invalid session mode: ${state.session.mode}`);
  }
  
  // Validate transcription status
  const validTranscriptionStatuses = ['idle', 'recording', 'paused', 'processing', 'error'];
  if (!validTranscriptionStatuses.includes(state.session.transcription.status)) {
    errors.push(`Invalid transcription status: ${state.session.transcription.status}`);
  }
}

function validateSync(state: EncounterState, errors: string[]): void {
  // Validate sync status
  const validSyncStatuses = ['local', 'syncing', 'synced', 'error'];
  if (!validSyncStatuses.includes(state.sync.status)) {
    errors.push(`Invalid sync status: ${state.sync.status}`);
  }
  
  // Validate queue items have required fields
  for (const action of state.sync.queue) {
    if (!action.id) {
      errors.push('Queued action is missing id');
    }
    if (!action.queuedAt) {
      errors.push(`Queued action ${action.id} is missing queuedAt`);
    }
  }
}
