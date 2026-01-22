/**
 * Validation middleware
 *
 * Validates action payloads before they reach the reducer.
 */

import type { EncounterAction } from '../actions/types';
import type { EncounterState } from '../types';
import type { Middleware } from '../store/types';

/**
 * Validation error
 */
export interface ValidationError {
  action: string;
  field: string;
  message: string;
}

/**
 * Validation result
 */
export interface ActionValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate an action payload
 */
function validateAction(
  action: EncounterAction,
  state: EncounterState
): ActionValidationResult {
  const errors: ValidationError[] = [];

  switch (action.type) {
    case 'ITEM_ADDED': {
      const { item } = action.payload;
      if (!item.id) {
        errors.push({ action: action.type, field: 'item.id', message: 'Item ID is required' });
      }
      if (!item.category) {
        errors.push({ action: action.type, field: 'item.category', message: 'Item category is required' });
      }
      break;
    }

    case 'ITEM_UPDATED': {
      const { id } = action.payload;
      if (!state.entities.items[id]) {
        errors.push({ action: action.type, field: 'id', message: `Item ${id} not found` });
      }
      break;
    }

    case 'ITEM_CONFIRMED':
    case 'ITEM_CANCELLED': {
      const { id } = action.payload;
      if (!state.entities.items[id]) {
        errors.push({ action: action.type, field: 'id', message: `Item ${id} not found` });
      }
      break;
    }

    case 'ITEM_DX_LINKED':
    case 'ITEM_DX_UNLINKED': {
      const { itemId, dxId } = action.payload;
      if (!state.entities.items[itemId]) {
        errors.push({ action: action.type, field: 'itemId', message: `Item ${itemId} not found` });
      }
      if (!state.entities.items[dxId]) {
        errors.push({ action: action.type, field: 'dxId', message: `Diagnosis ${dxId} not found` });
      }
      break;
    }

    case 'SUGGESTION_RECEIVED': {
      const { suggestion } = action.payload;
      if (!suggestion.id) {
        errors.push({ action: action.type, field: 'suggestion.id', message: 'Suggestion ID is required' });
      }
      break;
    }

    case 'SUGGESTION_ACCEPTED':
    case 'SUGGESTION_DISMISSED':
    case 'SUGGESTION_EXPIRED': {
      const { id } = action.payload;
      if (!state.entities.suggestions[id]) {
        errors.push({ action: action.type, field: 'id', message: `Suggestion ${id} not found` });
      }
      break;
    }

    case 'TASK_CREATED': {
      const { task } = action.payload;
      if (!task.id) {
        errors.push({ action: action.type, field: 'task.id', message: 'Task ID is required' });
      }
      break;
    }

    case 'TASK_PROGRESS':
    case 'TASK_COMPLETED':
    case 'TASK_FAILED':
    case 'TASK_APPROVED':
    case 'TASK_REJECTED': {
      const { id } = action.payload;
      if (!state.entities.tasks[id]) {
        errors.push({ action: action.type, field: 'id', message: `Task ${id} not found` });
      }
      break;
    }

    case 'CARE_GAP_IDENTIFIED': {
      const { gap } = action.payload;
      if (!gap.id) {
        errors.push({ action: action.type, field: 'gap.id', message: 'Care gap ID is required' });
      }
      break;
    }

    case 'CARE_GAP_ADDRESSED':
    case 'CARE_GAP_CLOSED':
    case 'CARE_GAP_EXCLUDED':
    case 'CARE_GAP_REOPENED': {
      const { gapId } = action.payload;
      if (!state.entities.careGaps[gapId]) {
        errors.push({ action: action.type, field: 'gapId', message: `Care gap ${gapId} not found` });
      }
      break;
    }

    case 'ENCOUNTER_OPENED': {
      const { patient, encounter } = action.payload;
      if (!patient.id) {
        errors.push({ action: action.type, field: 'patient.id', message: 'Patient ID is required' });
      }
      if (!encounter.id) {
        errors.push({ action: action.type, field: 'encounter.id', message: 'Encounter ID is required' });
      }
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validation middleware options
 */
export interface ValidationMiddlewareOptions {
  /** Whether to throw on validation errors (default: false) */
  throwOnError?: boolean;
  /** Callback for validation errors */
  onError?: (errors: ValidationError[]) => void;
}

/**
 * Create validation middleware
 */
export const createValidationMiddleware = (
  options: ValidationMiddlewareOptions = {}
): Middleware => {
  const { throwOnError = false, onError } = options;

  return (store) => (next) => (action) => {
    const result = validateAction(action, store.getState());

    if (!result.valid) {
      if (onError) {
        onError(result.errors);
      }

      if (throwOnError) {
        const errorMessages = result.errors.map(e => e.message).join(', ');
        throw new Error(`Validation failed for ${action.type}: ${errorMessages}`);
      }

      console.warn('[VALIDATION]', action.type, result.errors);
    }

    // Always pass to next middleware (unless throwOnError)
    return next(action);
  };
};

/**
 * Default validation middleware (logs warnings)
 */
export const validationMiddleware = createValidationMiddleware();
