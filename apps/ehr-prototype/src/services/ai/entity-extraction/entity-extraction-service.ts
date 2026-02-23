/**
 * Entity Extraction AI Service
 *
 * AI service that extracts structured medical entities from
 * transcription segments and creates suggestions for chart items.
 */

import { nanoid } from 'nanoid';
import type { EncounterState } from '../../../state/types';
import type { EncounterAction } from '../../../state/actions/types';
import type { AIService, AIServiceResult, TriggerContext } from '../types';
import type { ChartItem, ItemCategory } from '../../../types/chart-items';
import type { Suggestion, SuggestionType, SuggestionContent } from '../../../types/suggestions';
import type { ExtractedEntity, TranscriptSegment, EntityType } from '../../../types';
import { extractEntities } from './extractors';
import type { ExtractionContext, NormalizedMedication, NormalizedDiagnosis } from './types';
import { DEFAULT_ENTITY_EXTRACTION_CONFIG } from './types';
import { validateSuggestionData, getPrimaryIdentifier } from './suggestion-validators';

// ============================================================================
// Service Definition
// ============================================================================

/**
 * Entity extraction AI service
 */
export const entityExtractionService: AIService = {
  id: 'entity-extraction',
  name: 'Transcription Entity Extraction',

  triggers: {
    actions: ['TRANSCRIPTION_SEGMENT_RECEIVED'],
  },

  shouldRun: (state: EncounterState, trigger: TriggerContext): boolean => {
    // Only run if we have a segment
    if (trigger.type !== 'action' || !trigger.action) {
      return false;
    }

    if (trigger.action.type !== 'TRANSCRIPTION_SEGMENT_RECEIVED') {
      return false;
    }

    const segment = trigger.action.payload.segment;

    // Check minimum confidence
    if (segment.confidence < 0.5) {
      return false;
    }

    // Check minimum text length
    if (segment.text.trim().length < 10) {
      return false;
    }

    // Only run in capture mode
    if (state.session.mode !== 'capture') {
      return false;
    }

    return true;
  },

  run: async (
    state: EncounterState,
    trigger: TriggerContext
  ): Promise<AIServiceResult> => {
    const actions: EncounterAction[] = [];

    if (trigger.action?.type !== 'TRANSCRIPTION_SEGMENT_RECEIVED') {
      return { actions };
    }

    const segment = trigger.action.payload.segment;

    // Build extraction context
    const context: ExtractionContext = {
      segment,
      previousSegments: getPreviousSegments(state, 3),
      patientContext: state.context.patient,
      existingItems: Object.values(state.entities.items),
    };

    // Extract entities
    const result = await extractEntities(
      segment.text,
      context,
      DEFAULT_ENTITY_EXTRACTION_CONFIG
    );

    // Map entities to suggestions
    for (const entity of result.entities) {
      const suggestion = entityToSuggestion(entity, segment, state);
      if (suggestion) {
        actions.push({
          type: 'SUGGESTION_RECEIVED',
          payload: {
            suggestion,
            source: 'transcription',
          },
        });
      }
    }

    return { actions };
  },

  config: {
    local: true, // PHI in transcription - must run locally
    timeout: 2000,
    retryable: false, // Real-time, don't retry old segments
    requiresNetwork: false,
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get previous segments for context
 */
function getPreviousSegments(
  state: EncounterState,
  count: number
): TranscriptSegment[] {
  // In a real implementation, we'd track segments in state
  // For now, return empty array
  return [];
}

/**
 * Convert an extracted entity to a suggestion
 */
function entityToSuggestion(
  entity: ExtractedEntity,
  segment: TranscriptSegment,
  state: EncounterState
): Suggestion | null {
  const mapping = getEntityMapping(entity.type);
  if (!mapping) {
    return null;
  }

  const { suggestionType, itemCategory } = mapping;
  const itemTemplate = buildItemTemplate(entity, itemCategory, state, segment);

  if (!itemTemplate) {
    return null;
  }

  // Validate data quality — reject noise words and empty identifiers
  const templateData = (itemTemplate.data ?? {}) as Record<string, unknown>;
  if (!validateSuggestionData(itemCategory, templateData)) {
    return null;
  }

  const content: SuggestionContent = {
    type: 'new-item',
    itemTemplate,
    category: itemCategory,
  };

  // Set actionLabel from primary identifier for clean display in action rows
  const actionLabel = getPrimaryIdentifier(itemCategory, templateData) ?? undefined;

  return {
    id: `sug-${nanoid(8)}`,
    type: suggestionType,
    status: 'active',
    content,
    source: 'transcription',
    sourceSegmentId: segment.id,
    confidence: entity.confidence,
    reasoning: `Extracted from: "${entity.text}"`,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minute TTL
    displayText: getDisplayText(entity, itemCategory),
    displaySubtext: segment.text.length > 50
      ? segment.text.substring(0, 50) + '...'
      : segment.text,
    actionLabel,
  };
}

/**
 * Get mapping from entity type to suggestion/item types
 */
function getEntityMapping(
  entityType: EntityType
): { suggestionType: SuggestionType; itemCategory: ItemCategory } | null {
  // Only map to structured categories that have CategoryFieldDef definitions.
  // Unstructured categories (hpi, vitals, physical-exam) are excluded because
  // they produce noise suggestions and have no editable field rows.
  const mappings: Partial<Record<
    EntityType,
    { suggestionType: SuggestionType; itemCategory: ItemCategory }
  >> = {
    medication: { suggestionType: 'chart-item', itemCategory: 'medication' },
    diagnosis: { suggestionType: 'chart-item', itemCategory: 'diagnosis' },
    'lab-test': { suggestionType: 'chart-item', itemCategory: 'lab' },
    procedure: { suggestionType: 'chart-item', itemCategory: 'procedure' },
    allergy: { suggestionType: 'chart-item', itemCategory: 'allergy' },
  };

  return mappings[entityType] ?? null;
}

/**
 * Build a partial chart item template from an entity
 */
/**
 * Reporting-verb pattern — matches context suggesting the patient reports
 * taking a medication rather than the provider prescribing it.
 * Checks the ~40 chars before the entity span in the segment text.
 */
const REPORTING_VERB_PATTERN = /\b(?:taking|been\s+on|currently\s+on|been\s+taking|takes|using|on|tried|started)\b/i;

function hasReportingContext(entity: ExtractedEntity, segment: TranscriptSegment): boolean {
  const [start] = entity.span;
  // Check text before the entity in the segment (up to 40 chars of leading context)
  const leadingContext = segment.text.substring(Math.max(0, start - 40), start);
  return REPORTING_VERB_PATTERN.test(leadingContext);
}

function buildItemTemplate(
  entity: ExtractedEntity,
  category: ItemCategory,
  state: EncounterState,
  segment?: TranscriptSegment,
): Partial<ChartItem> | null {
  const baseTemplate = {
    category,
    status: 'pending-review' as const,
    displayText: entity.text,
    tags: [{ label: 'AI Suggested', type: 'ai' as const }],
    linkedDiagnoses: [] as string[],
    linkedEncounters: [] as string[],
    _meta: {
      syncStatus: 'local' as const,
      aiGenerated: true,
      aiConfidence: entity.confidence,
      requiresReview: true,
      reviewed: false,
    },
  };

  switch (category) {
    case 'medication': {
      const normalized = entity.normalizedValue as NormalizedMedication | null;
      const isReported = segment ? hasReportingContext(entity, segment) : false;
      return {
        ...baseTemplate,
        category: 'medication' as const,
        displayText: normalized?.name || entity.text,
        data: {
          drugName: normalized?.name || entity.text,
          genericName: normalized?.genericName,
          rxNorm: normalized?.rxNorm,
          dosage: normalized?.dosage || '',
          route: normalized?.route || 'PO',
          frequency: normalized?.frequency || 'daily',
          isControlled: false,
          prescriptionType: 'new' as const,
          ...(isReported
            ? { reportedBy: 'patient' as const, verificationStatus: 'unverified' as const }
            : {}),
        },
        actions: ['e-prescribe', 'print', 'cancel', 'modify'],
      } as Partial<ChartItem>;
    }

    case 'diagnosis': {
      const normalized = entity.normalizedValue as NormalizedDiagnosis | null;
      return {
        ...baseTemplate,
        category: 'diagnosis' as const,
        displayText: normalized?.description || entity.text,
        displaySubtext: normalized?.icdCode,
        data: {
          description: normalized?.description || entity.text,
          icdCode: normalized?.icdCode || '',
          type: 'encounter' as const,
          clinicalStatus: 'active' as const,
        },
      } as Partial<ChartItem>;
    }

    case 'lab': {
      const normalized = entity.normalizedValue as { name: string; loincCode?: string } | null;
      return {
        ...baseTemplate,
        category: 'lab' as const,
        displayText: normalized?.name || entity.text,
        data: {
          testName: normalized?.name || entity.text,
          testCode: normalized?.loincCode,
          priority: 'routine' as const,
          collectionType: 'send-out' as const,
          orderStatus: 'draft' as const,
        },
      } as Partial<ChartItem>;
    }

    case 'allergy': {
      const allergen = (entity.normalizedValue as string) || entity.text;
      return {
        ...baseTemplate,
        category: 'allergy' as const,
        displayText: `Allergy: ${allergen}`,
        data: {
          allergen,
          allergenType: 'drug' as const,
          severity: 'unknown' as const,
          reportedBy: 'patient' as const,
          verificationStatus: 'unverified' as const,
        },
      } as Partial<ChartItem>;
    }

    default:
      return null;
  }
}

/**
 * Get display text for a suggestion based on entity type
 */
function getDisplayText(entity: ExtractedEntity, category: ItemCategory): string {
  switch (category) {
    case 'medication': {
      const n = entity.normalizedValue as NormalizedMedication | null;
      const parts = [n?.name, n?.dosage, n?.route, n?.frequency].filter(Boolean);
      return parts.length > 0 ? parts.join(' ') : entity.text;
    }
    case 'diagnosis': {
      const normalized = entity.normalizedValue as NormalizedDiagnosis | null;
      return normalized?.description || entity.text;
    }
    case 'lab':
    default:
      return entity.text;
  }
}
