/**
 * Root reducer - combines all sub-reducers
 */

import type { EncounterState } from '../types';
import type { EncounterAction } from '../actions/types';
import type { ChartItem } from '../../types';
import {
  itemsReducer,
  suggestionsReducer,
  tasksReducer,
  careGapsReducer,
} from './entities';
import { relationshipsReducer } from './relationships';
import { contextReducer } from './context';
import { sessionReducer } from './session';
import { syncReducer } from './sync';
import { collaborationReducer } from './collaboration';

/**
 * Root reducer that combines all sub-reducers
 */
export function rootReducer(
  state: EncounterState,
  action: EncounterAction
): EncounterState {
  // Handle entities
  const entities = {
    items: itemsReducer(state.entities.items, action),
    suggestions: suggestionsReducer(state.entities.suggestions, action),
    tasks: tasksReducer(state.entities.tasks, action),
    careGaps: careGapsReducer(state.entities.careGaps, action),
  };
  
  // Handle other slices
  const relationships = relationshipsReducer(state.relationships, action);
  const context = contextReducer(state.context, action);
  const session = sessionReducer(state.session, action);
  const sync = syncReducer(state.sync, action);
  const collaboration = collaborationReducer(state.collaboration, action);
  
  // Cross-slice: SUGGESTION_ACCEPTED creates an item from the suggestion template
  if (action.type === 'SUGGESTION_ACCEPTED') {
    const suggestion = state.entities.suggestions[action.payload.id];
    if (suggestion && suggestion.content.type === 'new-item') {
      const { itemTemplate, category } = suggestion.content;
      const now = new Date();
      const newItem: ChartItem = {
        id: `from-suggestion-${suggestion.id}`,
        category,
        status: 'confirmed',
        displayText: itemTemplate.displayText || suggestion.displayText,
        createdAt: now,
        createdBy: { id: 'system', name: 'AI System' },
        modifiedAt: now,
        modifiedBy: { id: 'system', name: 'AI System' },
        source: { type: 'ai-generated' },
        tags: [],
        linkedDiagnoses: [],
        linkedEncounters: [],
        _meta: { syncStatus: 'local', aiGenerated: true, requiresReview: false },
        data: itemTemplate.data,
        ...itemTemplate,
        // Ensure these aren't overwritten by template
        id: `from-suggestion-${suggestion.id}`,
        status: 'confirmed',
      } as ChartItem;
      entities.items = { ...entities.items, [newItem.id]: newItem };
    }
  }

  // Special handling for ENCOUNTER_OPENED - set initial owner
  let finalCollaboration = collaboration;
  if (action.type === 'ENCOUNTER_OPENED' && session.currentUser && !collaboration.currentOwner) {
    finalCollaboration = {
      ...collaboration,
      currentOwner: {
        id: session.currentUser.id,
        name: session.currentUser.name,
        role: session.currentUser.role,
      },
    };
  }
  
  return {
    entities,
    relationships,
    context,
    session,
    sync,
    collaboration: finalCollaboration,
  };
}
