/**
 * Diagnosis Association Types
 *
 * Types for the diagnosis association AI service that suggests
 * ICD-10 diagnosis linkages for orders and medications.
 */

import type { ItemCategory, ChartItem, DiagnosisItem } from '../../../types/chart-items';
import type { PatientContext } from '../../../types/patient';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configuration for diagnosis association
 */
export interface DxAssociationConfig {
  /** Confidence threshold above which to auto-link (default: 0.95) */
  autoLinkThreshold: number;

  /** Confidence threshold above which to create suggestion (default: 0.6) */
  suggestionThreshold: number;

  /** Maximum number of Dx suggestions per item (default: 3) */
  maxSuggestions: number;
}

/**
 * Default diagnosis association configuration
 */
export const DEFAULT_DX_ASSOCIATION_CONFIG: DxAssociationConfig = {
  autoLinkThreshold: 0.95,
  suggestionThreshold: 0.6,
  maxSuggestions: 3,
};

// ============================================================================
// Results
// ============================================================================

/**
 * Result of diagnosis association for an item
 */
export interface DxAssociationResult {
  /** ID of the item being associated */
  itemId: string;

  /** Suggested diagnoses */
  suggestions: DxSuggestion[];

  /** If confidence was high enough, which Dx was auto-linked */
  autoLinked?: DxSuggestion;
}

/**
 * A diagnosis suggestion
 */
export interface DxSuggestion {
  /** ID of existing diagnosis in chart (if applicable) */
  diagnosisId?: string;

  /** Diagnosis description */
  description: string;

  /** ICD-10 code */
  icdCode: string;

  /** Confidence score (0-1) */
  confidence: number;

  /** Reasoning for the suggestion */
  reasoning: string;

  /** Whether this suggests adding a new Dx to the chart */
  isNew: boolean;
}

// ============================================================================
// Mapping Rules
// ============================================================================

/**
 * Pattern-based rule for mapping items to diagnoses
 */
export interface DxMappingRule {
  /** Pattern to match against items */
  itemPattern: {
    /** Item category to match */
    category: ItemCategory;
    /** Regex pattern for item name */
    namePattern?: RegExp;
    /** Regex pattern for item code (e.g., NDC, LOINC) */
    codePattern?: RegExp;
  };

  /** Suggested diagnoses for matching items */
  suggestedDx: Array<{
    description: string;
    icdCode: string;
    /** Base confidence before patient context adjustment */
    confidence: number;
  }>;
}

// ============================================================================
// Context Types
// ============================================================================

/**
 * Context for diagnosis association
 */
export interface DxAssociationContext {
  /** The item being evaluated */
  item: ChartItem;

  /** Existing diagnoses in the chart */
  existingDiagnoses: DiagnosisItem[];

  /** Patient context for relevance scoring */
  patientContext: PatientContext | null;

  /** Configuration */
  config: DxAssociationConfig;
}
