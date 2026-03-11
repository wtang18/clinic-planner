/**
 * Care Protocol types — data model for guideline-based clinical checklists.
 *
 * Protocols activate during encounters, track provider progress through
 * evidence-based care steps, and integrate with existing charting via
 * the standard ITEM_ADDED path.
 *
 * Architecture:
 * - ProtocolTemplate: static, versioned definition (lives in protocol registry)
 * - ActiveProtocolState: runtime state per encounter (lives in EncounterState.entities.protocols)
 * - ProtocolItemDef: discriminated union of 4 item types (orderable, documentable, guidance, advisory)
 * - SeverityScoringModel: optional scoring system that maps to treatment paths
 */

import type { ItemCategory, ChartItemDataMap } from './chart-items';

// ============================================================================
// Protocol Template (Static Definition)
// ============================================================================

/** A versioned clinical protocol definition. Loaded from registry, frozen at activation. */
export interface ProtocolTemplate {
  id: string;                          // e.g., 'low-back-pain-v1'
  name: string;                        // e.g., 'Low Back Pain Evaluation'
  version: string;                     // Semantic version
  description: string;                 // Brief clinical summary
  triggerConditions: ProtocolTrigger[];
  severityScoringModel?: SeverityScoringModel;
  autoExpandFirstCard: boolean;        // Whether first card auto-expands on activation
  cards: ProtocolCardDef[];
}

/** How a protocol is matched to an encounter. */
export interface ProtocolTrigger {
  type: 'cc-match' | 'dx-match' | 'visit-type-match';
  /** Value to match against. For cc-match: CC text/code. For dx-match: ICD-10 prefix. */
  value: string;
  /** Minimum confidence for AI-driven matching. CC match is deterministic (1.0). */
  confidenceThreshold: number;
}

// ============================================================================
// Protocol Card Definition
// ============================================================================

/** A logical grouping of protocol items (e.g., "History & Assessment", "Examination"). */
export interface ProtocolCardDef {
  id: string;                          // e.g., 'history-assessment'
  label: string;                       // e.g., 'History & Assessment'
  description?: string;
  stage: ProtocolStage;
  cardType: 'sequential' | 'unordered';
  sortOrder: number;                   // Card ordering within protocol
  items: ProtocolItemDef[];
}

/** Clinical workflow stage for card grouping. */
export type ProtocolStage =
  | 'history-assessment'
  | 'examination'
  | 'diagnostics'
  | 'treatment'
  | 'education'
  | 'follow-up';

// ============================================================================
// Protocol Item Definition (Discriminated Union)
// ============================================================================

/** A single step within a protocol card. */
export interface ProtocolItemDef {
  id: string;
  label: string;
  description?: string;
  itemType: ProtocolItemType;
  sortOrder: number;
  condition?: ProtocolCondition;
  /** What to do when condition is unmet: hide entirely or show as inactive. */
  conditionBehavior: 'hide' | 'show-inactive';
}

/** Discriminated union of protocol item types. */
export type ProtocolItemType =
  | OrderableItemDef
  | DocumentableItemDef
  | GuidanceItemDef
  | AdvisoryItemDef;

/** Orderable: maps to a specific chart item that can be added via [+]. */
export interface OrderableItemDef {
  type: 'orderable';
  chartCategory: ItemCategory;
  defaultData: Partial<ChartItemDataMap[ItemCategory]>;
  orderSetGroup?: string;              // For batch grouping in [Add All]
  /** Key fields used for matching against existing chart items (dedup). */
  matchFields: string[];               // e.g., ['drugName'] for medication, ['assessmentType'] for assessment
}

/** Documentable: clinical observation that maps to narrative content. */
export interface DocumentableItemDef {
  type: 'documentable';
  narrativeSection: 'hpi' | 'physical-exam' | 'plan';
  /** Phrases/concepts AI should listen for in ambient transcription. */
  detectionHints: string[];
}

/** Guidance: prompt for provider — informational, no chart action. */
export interface GuidanceItemDef {
  type: 'guidance';
  prompt: string;
  detectionHints: string[];
}

/** Advisory: persistent warning/constraint — no completion state. */
export interface AdvisoryItemDef {
  type: 'advisory';
  severity: 'info' | 'warning' | 'critical';
  persistent: true;
}

// ============================================================================
// Protocol Condition
// ============================================================================

/** Expression evaluated against patient context or chart state. */
export interface ProtocolCondition {
  source: 'patient-context' | 'chart-state';
  /** JSONPath-like field reference. */
  field: string;
  operator: 'exists' | 'not-exists' | 'equals' | 'includes' | 'gt' | 'lt';
  /** Value to compare against (not needed for exists/not-exists). */
  value?: string | number | boolean;
}

// ============================================================================
// Severity Scoring Model
// ============================================================================

/** Optional scoring system for severity-stratified treatment paths. */
export interface SeverityScoringModel {
  name: string;                        // e.g., 'STarT Back Screening Tool'
  inputs: ScoringInput[];
  scoringLogic: ScoringFormula;
  paths: SeverityPath[];
}

/** A data point that feeds into the severity score. */
export interface ScoringInput {
  id: string;
  label: string;                       // e.g., 'Pain Scale (0-10)'
  /** Where to read the value from. */
  source: 'assessment' | 'vitals' | 'manual-entry';
  /** Assessment type for source='assessment'. */
  assessmentType?: string;
  /** Vital type for source='vitals'. */
  vitalType?: string;
  /** Weight in the scoring formula. */
  weight: number;
  /** Current value (populated at runtime, not in template). */
  currentValue?: number | null;
}

/** How to compute the score from inputs. */
export interface ScoringFormula {
  type: 'weighted-sum' | 'lookup-table';
  /** For lookup-table: explicit mapping of input combinations to scores. */
  lookupTable?: Record<string, number>;
}

/** A treatment path selected by severity score. */
export interface SeverityPath {
  id: string;
  label: string;                       // e.g., 'Mild', 'Moderate', 'Severe'
  scoreRange: { min: number; max: number };
  /** Item rendering overrides for this path. */
  cardOverrides: {
    cardId: string;
    itemOverrides: {
      itemId: string;
      /** 'active' = normal rendering, 'de-emphasized' = dimmed */
      pathState: 'active' | 'de-emphasized';
    }[];
  }[];
}

// ============================================================================
// Active Protocol State (Encounter-Level Runtime)
// ============================================================================

/** Lifecycle status of a protocol instance. */
export type ProtocolLifecycleStatus = 'available' | 'active' | 'completed' | 'dismissed';

/** How a protocol item was addressed. */
export interface ProtocolItemAddressedBy {
  type: 'chart-item' | 'ai-draft' | 'suggestion' | 'manual';
  referenceId?: string;
}

/** Runtime state of a single protocol item within an encounter. */
export interface ProtocolItemState {
  status: 'pending' | 'addressed' | 'skipped' | 'not-applicable';
  addressedBy?: ProtocolItemAddressedBy;
  addressedAt?: Date;
  skipReason?: string;
}

/** Runtime state of a protocol card (expand/collapse). */
export interface ProtocolCardState {
  expanded: boolean;
  manuallyToggled: boolean;
}

/** Runtime state of an active/available protocol within an encounter. */
export interface ActiveProtocolState {
  id: string;                          // Instance ID (unique per encounter)
  templateId: string;                  // Reference to ProtocolTemplate.id
  templateSnapshot: ProtocolTemplate;  // Frozen copy of template at activation time
  status: ProtocolLifecycleStatus;
  activationSource: 'cc-match' | 'ai-ambient' | 'ai-suggestion' | 'manual';
  activatedAt: Date | null;
  isPrimary: boolean;
  severity: {
    score: number;
    selectedPathId: string;
    isManualOverride: boolean;
  } | null;
  cardStates: Record<string, ProtocolCardState>;
  itemStates: Record<string, ProtocolItemState>;
}

// ============================================================================
// Protocol Annotation (Patient Adaptation)
// ============================================================================

/** Annotation applied to protocol items based on patient context. */
export interface ProtocolAnnotation {
  itemId: string;
  type: 'comorbidity' | 'medication-interaction' | 'allergy-contraindication' | 'recency';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  /** Source data that triggered the annotation. */
  sourceRef?: string;
}

// ============================================================================
// Protocol Tab State (Reference Pane Integration)
// ============================================================================

/** Visibility state of the Protocol tab in the Reference Pane. */
export type ProtocolTabState = 'hidden' | 'available' | 'active' | 'completed' | 'dismissed';
