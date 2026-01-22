/**
 * Drug Interaction Service
 *
 * Exports all drug interaction components.
 */

// Types
export type {
  DrugInteractionConfig,
  InteractionSeverity,
  DrugReference,
  DrugInteraction,
  InteractionCheckResult,
} from './types';

export { DEFAULT_DRUG_INTERACTION_CONFIG } from './types';

// Interaction Checker
export {
  checkDrugInteractions,
  findInteractions,
  normalizeDrugName,
  KNOWN_INTERACTIONS,
} from './interaction-checker';

// AI Service
export { drugInteractionService } from './drug-interaction-service';
