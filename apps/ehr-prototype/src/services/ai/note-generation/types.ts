/**
 * Note Generation Types
 *
 * Types for the visit note generation AI service.
 */

// ============================================================================
// Configuration
// ============================================================================

/**
 * Note sections
 */
export type NoteSection =
  | 'chief-complaint'
  | 'hpi'
  | 'ros'
  | 'physical-exam'
  | 'assessment'
  | 'plan'
  | 'medications'
  | 'follow-up';

/**
 * Configuration for note generation
 */
export interface NoteGenerationConfig {
  /** Note format */
  format: 'soap' | 'problem-oriented' | 'narrative';

  /** Sections to include in the note */
  includeSections: NoteSection[];

  /** Maximum length in characters */
  maxLength?: number;

  /** Include AI generation disclaimer */
  includeDisclaimer: boolean;
}

/**
 * Default note generation configuration
 */
export const DEFAULT_NOTE_GENERATION_CONFIG: NoteGenerationConfig = {
  format: 'soap',
  includeSections: [
    'chief-complaint',
    'hpi',
    'ros',
    'physical-exam',
    'assessment',
    'plan',
    'medications',
    'follow-up',
  ],
  maxLength: undefined,
  includeDisclaimer: true,
};

// ============================================================================
// Generated Note
// ============================================================================

/**
 * Content for a single note section
 */
export interface NoteSectionContent {
  /** Section type */
  section: NoteSection;

  /** Generated content */
  content: string;

  /** Item IDs that contributed to this section */
  sourceItems: string[];
}

/**
 * A generated visit note
 */
export interface GeneratedNote {
  /** Full note text */
  text: string;

  /** Format used */
  format: string;

  /** Individual sections */
  sections: NoteSectionContent[];

  /** Confidence score */
  confidence: number;

  /** When generated */
  generatedAt: Date;

  /** Item IDs the note was based on */
  basedOnItems: string[];
}

// ============================================================================
// Templates
// ============================================================================

/**
 * Template for note generation
 */
export interface NoteTemplate {
  /** Format name */
  format: string;

  /** Order of sections */
  sectionOrder: NoteSection[];

  /** Templates for each section */
  sectionTemplates: Record<NoteSection, string>;
}

/**
 * SOAP note template
 */
export const SOAP_TEMPLATE: NoteTemplate = {
  format: 'soap',
  sectionOrder: ['chief-complaint', 'hpi', 'ros', 'physical-exam', 'assessment', 'plan'],
  sectionTemplates: {
    'chief-complaint': 'CC: {content}',
    hpi: 'HPI:\n{content}',
    ros: 'ROS:\n{content}',
    'physical-exam': 'PE:\n{content}',
    assessment: 'Assessment:\n{content}',
    plan: 'Plan:\n{content}',
    medications: 'Medications:\n{content}',
    'follow-up': 'Follow-up:\n{content}',
  },
};
