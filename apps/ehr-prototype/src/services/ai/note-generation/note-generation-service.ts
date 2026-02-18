/**
 * Note Generation AI Service
 *
 * AI service that generates visit notes when transitioning to review mode.
 */

import { nanoid } from 'nanoid';
import type { EncounterState, Mode } from '../../../state/types';
import type { EncounterAction } from '../../../state/actions/types';
import type { AIService, AIServiceResult, TriggerContext } from '../types';
import type { NarrativeItem } from '../../../types/chart-items';
import { generateVisitNote } from './note-generator';
import { DEFAULT_NOTE_GENERATION_CONFIG } from './types';

// ============================================================================
// Service Definition
// ============================================================================

/**
 * Note generation AI service
 */
export const noteGenerationService: AIService = {
  id: 'note-generation',
  name: 'Visit Note Generation',

  triggers: {
    actions: ['MODE_CHANGED'],
  },

  shouldRun: (state: EncounterState, trigger: TriggerContext): boolean => {
    if (trigger.type !== 'action' || !trigger.action) {
      return false;
    }

    if (trigger.action.type !== 'MODE_CHANGED') {
      return false;
    }

    const { to } = trigger.action.payload as { to: Mode };

    // Only run when transitioning to 'review' mode
    if (to !== 'review') {
      return false;
    }

    // Check if note doesn't already exist
    const existingNote = Object.values(state.entities.items).find(
      (item) =>
        item.category === 'note' &&
        item._meta.aiGenerated &&
        isRecent(item.createdAt)
    );

    if (existingNote) {
      return false;
    }

    // Check we have items to generate from
    const itemCount = Object.keys(state.entities.items).length;
    if (itemCount === 0) {
      return false;
    }

    return true;
  },

  run: async (
    state: EncounterState,
    trigger: TriggerContext
  ): Promise<AIServiceResult> => {
    const actions: EncounterAction[] = [];

    // Get all chart items
    const items = Object.values(state.entities.items);

    // Get context
    const encounter = state.context.encounter;
    const patient = state.context.patient;
    const visit = state.context.visit;

    if (!encounter || !patient) {
      return { actions };
    }

    // Generate note
    const generatedNote = await generateVisitNote(
      items,
      { encounter, patient, visit: visit || undefined },
      DEFAULT_NOTE_GENERATION_CONFIG
    );

    // Create note item
    const now = new Date();
    const noteItem: NarrativeItem = {
      id: `item-${nanoid(8)}`,
      category: 'note',
      createdAt: now,
      createdBy: { id: 'system', name: 'AI Assistant' },
      modifiedAt: now,
      modifiedBy: { id: 'system', name: 'AI Assistant' },
      source: { type: 'aiDraft' },
      status: 'pending-review',
      displayText: 'Visit Note',
      displaySubtext: `${generatedNote.sections.length} sections generated`,
      tags: [
        { label: 'AI Generated', type: 'ai' },
        { label: 'Needs Review', type: 'status' },
      ],
      linkedDiagnoses: [],
      linkedEncounters: [encounter.id],
      activityLog: [{
        timestamp: now,
        action: 'created',
        actor: 'AI Assistant',
        details: 'AI-generated visit note from ambient recording',
      }],
      _meta: {
        syncStatus: 'local',
        aiGenerated: true,
        aiConfidence: generatedNote.confidence,
        requiresReview: true,
        reviewed: false,
      },
      data: {
        text: generatedNote.text,
        format: 'structured',
        structuredElements: generatedNote.sections.map((section) => ({
          type: section.section,
          value: section.content,
        })),
      },
    };

    // Add the note
    actions.push({
      type: 'ITEM_ADDED',
      payload: {
        item: noteItem,
        source: { type: 'aiDraft' },
      },
    });

    return {
      actions,
      notifications: [
        {
          type: 'info',
          message: 'Visit note has been generated. Please review before signing.',
          persistent: false,
          actionLabel: 'Review',
          actionTarget: noteItem.id,
        },
      ],
    };
  },

  config: {
    local: true, // Full narrative contains PHI
    timeout: 15000,
    retryable: true,
    requiresNetwork: false,
  },
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if a date is recent (within last hour)
 */
function isRecent(date: Date): boolean {
  const hourAgo = Date.now() - 60 * 60 * 1000;
  return date.getTime() > hourAgo;
}
