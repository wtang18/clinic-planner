/**
 * All AI Services
 *
 * Registry of all AI services in the system.
 */

import type { AIService } from '../types';
import { entityExtractionService } from '../entity-extraction';
import { dxAssociationService } from '../dx-association';
import { drugInteractionService } from '../drug-interaction';
import { careGapMonitorService } from '../care-gap-monitor';
import { noteGenerationService } from '../note-generation';

/**
 * All registered AI services
 */
export const ALL_AI_SERVICES: AIService[] = [
  entityExtractionService,
  dxAssociationService,
  drugInteractionService,
  careGapMonitorService,
  noteGenerationService,
];

/**
 * Service IDs for easy reference
 */
export const SERVICE_IDS = {
  ENTITY_EXTRACTION: 'entity-extraction',
  DX_ASSOCIATION: 'dx-association',
  DRUG_INTERACTION: 'drug-interaction',
  CARE_GAP_MONITOR: 'care-gap-monitor',
  NOTE_GENERATION: 'note-generation',
} as const;

/**
 * Service ID type
 */
export type ServiceId = (typeof SERVICE_IDS)[keyof typeof SERVICE_IDS];
