/**
 * Entity Extraction Types
 *
 * Types for the entity extraction AI service that identifies
 * structured medical entities from transcription segments.
 */

import type {
  EntityType,
  ExtractedEntity,
  TranscriptSegment,
} from '../../../types';
import type { ChartItem, ItemCategory } from '../../../types/chart-items';
import type { PatientContext } from '../../../types/patient';
import type { SuggestionType } from '../../../types/suggestions';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configuration for entity extraction
 */
export interface EntityExtractionConfig {
  /** Minimum confidence score (0-1) to include an entity (default: 0.6) */
  minConfidence: number;

  /** Entity types to extract */
  enabledEntityTypes: EntityType[];

  /** Number of previous segments to include for context */
  contextWindowSize: number;
}

/**
 * Default entity extraction configuration
 */
export const DEFAULT_ENTITY_EXTRACTION_CONFIG: EntityExtractionConfig = {
  minConfidence: 0.6,
  enabledEntityTypes: [
    'medication',
    'diagnosis',
    'symptom',
    'duration',
    'body-part',
    'vital-sign',
    'lab-test',
    'procedure',
    'allergy',
  ],
  contextWindowSize: 3,
};

// ============================================================================
// Extraction Results
// ============================================================================

/**
 * Result of entity extraction
 */
export interface ExtractionResult {
  /** Extracted entities */
  entities: ExtractedEntity[];

  /** Processing time in milliseconds */
  processingTimeMs: number;

  /** Model or method used for extraction */
  modelUsed: string;
}

// ============================================================================
// Mapping Configuration
// ============================================================================

/**
 * Mapping from entity type to suggestion/chart item type
 */
export interface EntityToSuggestionMapping {
  /** Entity type that triggers this mapping */
  entityType: EntityType;

  /** Type of suggestion to create */
  suggestionType: SuggestionType;

  /** Chart item category for the suggested item */
  itemCategory: ItemCategory;

  /** Function to build a partial chart item from the entity */
  templateBuilder: (
    entity: ExtractedEntity,
    context: ExtractionContext
  ) => Partial<ChartItem>;
}

/**
 * Context available during extraction
 */
export interface ExtractionContext {
  /** The current segment being processed */
  segment: TranscriptSegment;

  /** Previous segments for context */
  previousSegments: TranscriptSegment[];

  /** Patient context if available */
  patientContext: PatientContext | null;

  /** Existing chart items for deduplication */
  existingItems: ChartItem[];
}

// ============================================================================
// Normalization Results
// ============================================================================

/**
 * Normalized medication information
 */
export interface NormalizedMedication {
  /** Standardized drug name */
  name: string;

  /** RxNorm concept ID if mapped */
  rxNorm?: string;

  /** Generic name if available */
  genericName?: string;

  /** Detected dosage */
  dosage?: string;

  /** Detected route */
  route?: string;

  /** Detected frequency */
  frequency?: string;
}

/**
 * Normalized diagnosis information
 */
export interface NormalizedDiagnosis {
  /** Standardized description */
  description: string;

  /** ICD-10 code if mapped */
  icdCode?: string;

  /** SNOMED CT code if mapped */
  snomedCode?: string;
}

/**
 * Normalized symptom information
 */
export interface NormalizedSymptom {
  /** Symptom name */
  name: string;

  /** Body system affected */
  bodySystem?: string;

  /** Duration if mentioned */
  duration?: string;

  /** Severity if mentioned */
  severity?: 'mild' | 'moderate' | 'severe';

  /** Qualifier (e.g., "intermittent", "constant") */
  qualifier?: string;
}

/**
 * Normalized vital sign
 */
export interface NormalizedVital {
  /** Vital type */
  type: 'bp' | 'pulse' | 'temp' | 'resp' | 'spo2' | 'weight' | 'height';

  /** Numeric value */
  value: number;

  /** Secondary value (e.g., diastolic for BP) */
  secondaryValue?: number;

  /** Unit of measurement */
  unit: string;
}

/**
 * Normalized lab test
 */
export interface NormalizedLabTest {
  /** Test name */
  name: string;

  /** LOINC code if mapped */
  loincCode?: string;

  /** Panel name if part of panel */
  panelName?: string;
}
