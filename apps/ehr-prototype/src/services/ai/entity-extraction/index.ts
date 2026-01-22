/**
 * Entity Extraction Service
 *
 * Exports all entity extraction components.
 */

// Types
export type {
  EntityExtractionConfig,
  ExtractionResult,
  ExtractionContext,
  EntityToSuggestionMapping,
  NormalizedMedication,
  NormalizedDiagnosis,
  NormalizedSymptom,
  NormalizedVital,
  NormalizedLabTest,
} from './types';

export { DEFAULT_ENTITY_EXTRACTION_CONFIG } from './types';

// Extractors
export {
  extractEntities,
  extractMedications,
  extractDiagnoses,
  extractSymptoms,
  extractVitals,
  extractLabTests,
  normalizeMedication,
  normalizeDiagnosis,
} from './extractors';

// AI Service
export { entityExtractionService } from './entity-extraction-service';
