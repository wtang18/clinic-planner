/**
 * Side Effect Handlers
 *
 * Defines handlers that trigger additional actions in response to state changes.
 * These run after the primary action is processed.
 */

import type { EncounterState } from '../state/types';
import type { EncounterAction } from '../state/actions/types';
import type { Dispatch } from '../state/store/types';
import { selectItem, selectAllSuggestions } from '../state/selectors/entities';
import { suggestionExpired, taskCreated } from '../state/actions/creators';
import { TASK_TEMPLATES } from '../mocks/generators/tasks';

// ============================================================================
// Types
// ============================================================================

export type SideEffectHandler = (
  action: EncounterAction,
  state: EncounterState,
  dispatch: Dispatch
) => void | Promise<void>;

// ============================================================================
// Handlers
// ============================================================================

/**
 * Handler: When an item is added, trigger related processing
 */
export const itemAddedHandler: SideEffectHandler = async (action, state, dispatch) => {
  if (action.type !== 'ITEM_ADDED') return;

  const item = action.payload.item;

  // Medications: Create processing tasks (dx-association, drug-interaction, formulary-check)
  if (item.category === 'medication') {
    const tasks = TASK_TEMPLATES.medicationAdded(item.id, item.displayText);
    for (const task of tasks) {
      dispatch(taskCreated(task, item.id));
    }
  }

  // Labs: Create processing tasks (dx-association, care-gap-evaluation)
  if (item.category === 'lab') {
    const tasks = TASK_TEMPLATES.labAdded(item.id, item.displayText);
    for (const task of tasks) {
      dispatch(taskCreated(task, item.id));
    }
  }

  // Imaging: Create processing tasks (dx-association, prior-auth)
  if (item.category === 'imaging') {
    const tasks = TASK_TEMPLATES.imagingAdded(item.id, item.displayText);
    for (const task of tasks) {
      dispatch(taskCreated(task, item.id));
    }
  }

  // Diagnosis: Check for care gap implications
  if (item.category === 'diagnosis') {
    // New diagnosis might open or close care gaps
  }
};

/**
 * Handler: When suggestion is accepted, clean up related suggestions
 */
export const suggestionAcceptedHandler: SideEffectHandler = (action, state, dispatch) => {
  if (action.type !== 'SUGGESTION_ACCEPTED' && action.type !== 'SUGGESTION_ACCEPTED_WITH_CHANGES') {
    return;
  }

  const acceptedSuggestion = state.entities.suggestions[action.payload.id];
  if (!acceptedSuggestion) return;

  // Find and expire similar suggestions
  const allSuggestions = selectAllSuggestions(state);

  for (const suggestion of allSuggestions) {
    if (suggestion.id === acceptedSuggestion.id) continue;
    if (suggestion.status !== 'active') continue;

    // Expire suggestions for the same item
    if (
      acceptedSuggestion.relatedItemId &&
      suggestion.relatedItemId === acceptedSuggestion.relatedItemId
    ) {
      dispatch(suggestionExpired(suggestion.id));
    }

    // Expire duplicate new-item suggestions
    if (
      acceptedSuggestion.content.type === 'new-item' &&
      suggestion.content.type === 'new-item'
    ) {
      // Check if they suggest the same thing
      const acceptedTemplate = acceptedSuggestion.content.itemTemplate;
      const suggestionTemplate = suggestion.content.itemTemplate;

      if (
        acceptedTemplate?.displayText === suggestionTemplate?.displayText &&
        acceptedSuggestion.content.category === suggestion.content.category
      ) {
        dispatch(suggestionExpired(suggestion.id));
      }
    }
  }
};

/**
 * Handler: When mode changes, trigger appropriate actions
 */
export const modeChangedHandler: SideEffectHandler = (action, state, dispatch) => {
  if (action.type !== 'MODE_CHANGED') return;

  const { to: newMode, trigger } = action.payload;

  // When entering review mode
  if (newMode === 'review') {
    // Note generation is triggered by AI service automatically
    // Additional cleanup or preparation can go here
  }

  // When entering process mode
  if (newMode === 'process') {
    // Refresh task list ordering, etc.
  }

  // When returning to capture mode
  if (newMode === 'capture') {
    // Resume transcription if it was active?
  }
};

/**
 * Handler: When task completes, update related items
 */
export const taskCompletedHandler: SideEffectHandler = (action, state, dispatch) => {
  if (action.type !== 'TASK_COMPLETED') return;

  const task = state.entities.tasks[action.payload.id];
  if (!task) return;

  // Handle task-specific completion logic
  switch (task.type) {
    case 'dx-association':
      // Suggestions are created by the service
      break;

    case 'drug-interaction':
      // Alerts are created by the service
      break;

    case 'care-gap-evaluation':
      // Gap status updates are handled by the service
      break;

    case 'note-generation':
      // Note item is created by the service
      break;
  }
};

/**
 * Handler: When item is confirmed, mark related suggestions/tasks as resolved
 */
export const itemConfirmedHandler: SideEffectHandler = (action, state, dispatch) => {
  if (action.type !== 'ITEM_CONFIRMED') return;

  const itemId = action.payload.id;
  const item = selectItem(state, itemId);
  if (!item) return;

  // Expire any suggestions related to this item
  const suggestions = selectAllSuggestions(state);
  for (const suggestion of suggestions) {
    if (suggestion.status !== 'active') continue;
    if (suggestion.relatedItemId === itemId) {
      dispatch(suggestionExpired(suggestion.id));
    }
  }
};

/**
 * Handler: Clean up expired suggestions periodically
 */
export const cleanupExpiredSuggestionsHandler: SideEffectHandler = (action, state, dispatch) => {
  // Only run occasionally, not on every action
  if (Math.random() > 0.1) return;

  const now = new Date();
  const suggestions = selectAllSuggestions(state);

  for (const suggestion of suggestions) {
    if (suggestion.status !== 'active') continue;
    if (suggestion.expiresAt && suggestion.expiresAt < now) {
      dispatch(suggestionExpired(suggestion.id));
    }
  }
};

// ============================================================================
// Exports
// ============================================================================

/**
 * Default set of side effect handlers
 */
export const DEFAULT_SIDE_EFFECT_HANDLERS: SideEffectHandler[] = [
  itemAddedHandler,
  suggestionAcceptedHandler,
  modeChangedHandler,
  taskCompletedHandler,
  itemConfirmedHandler,
  cleanupExpiredSuggestionsHandler,
];

/**
 * Create a middleware that runs side effect handlers
 */
export function createSideEffectRunner(
  handlers: SideEffectHandler[] = DEFAULT_SIDE_EFFECT_HANDLERS
) {
  return (state: EncounterState, action: EncounterAction, dispatch: Dispatch) => {
    // Run handlers asynchronously to not block dispatch
    Promise.resolve().then(async () => {
      for (const handler of handlers) {
        try {
          await handler(action, state, dispatch);
        } catch (error) {
          console.error('[SideEffect] Handler error:', error);
        }
      }
    });
  };
}
