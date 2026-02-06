/**
 * Demo Presets
 *
 * Preset configurations for different demo scenarios and presentations.
 */

// ============================================================================
// Types
// ============================================================================

export interface DemoFeatures {
  transcription: boolean;
  aiSuggestions: boolean;
  careGaps: boolean;
  taskPane: boolean;
  noteGeneration: boolean;
}

export interface DemoPreset {
  id: string;
  name: string;
  description: string;
  category: 'clinical' | 'feature' | 'workflow';
  duration: string;
  highlights: string[];
  scenario: string;
  features: DemoFeatures;
  tours?: string[];
  autoStart?: boolean;
}

// ============================================================================
// Presets
// ============================================================================

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'uc-quick',
    name: 'Urgent Care Quick Demo',
    description: 'See a complete urgent care visit in action',
    category: 'clinical',
    duration: '5 min',
    highlights: [
      'Ambient listening captures visit',
      'AI suggests diagnoses and medications',
      'Quick order entry with smart defaults',
      'Automatic note generation',
    ],
    scenario: 'demo-uc',
    features: {
      transcription: true,
      aiSuggestions: true,
      careGaps: false,
      taskPane: true,
      noteGeneration: true,
    },
    autoStart: true,
  },
  {
    id: 'pc-comprehensive',
    name: 'Primary Care with Care Gaps',
    description: 'Chronic disease management with quality measure tracking',
    category: 'clinical',
    duration: '10 min',
    highlights: [
      'Care gaps displayed on patient entry',
      'Order directly from gap cards',
      'Automatic gap closure tracking',
      'Quality measure reporting',
    ],
    scenario: 'demo-pc',
    features: {
      transcription: true,
      aiSuggestions: true,
      careGaps: true,
      taskPane: true,
      noteGeneration: true,
    },
    tours: ['capture-basics'],
  },
  {
    id: 'ai-features',
    name: 'AI Features Showcase',
    description: 'Deep dive into AI-powered capabilities',
    category: 'feature',
    duration: '8 min',
    highlights: [
      'Real-time entity extraction',
      'Diagnosis association suggestions',
      'Drug interaction checking',
      'Contextual note generation',
    ],
    scenario: 'demo-uc',
    features: {
      transcription: true,
      aiSuggestions: true,
      careGaps: false,
      taskPane: true,
      noteGeneration: true,
    },
    tours: ['ai-features'],
  },
  {
    id: 'workflow-modes',
    name: 'Three-Mode Workflow',
    description: 'Experience the Capture, Process, Review flow',
    category: 'workflow',
    duration: '7 min',
    highlights: [
      'Capture mode for fast input',
      'Process mode for batch review',
      'Review mode for final check',
    ],
    scenario: 'demo-uc',
    features: {
      transcription: true,
      aiSuggestions: true,
      careGaps: false,
      taskPane: true,
      noteGeneration: true,
    },
    tours: ['capture-basics', 'task-workflow'],
  },
  {
    id: 'minimal',
    name: 'Basic Charting',
    description: 'Simple charting without AI features',
    category: 'workflow',
    duration: '3 min',
    highlights: [
      'Clean OmniAdd interface',
      'Quick item entry',
      'Manual workflow control',
    ],
    scenario: 'demo-uc',
    features: {
      transcription: false,
      aiSuggestions: false,
      careGaps: false,
      taskPane: false,
      noteGeneration: false,
    },
  },
];

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get a preset by its ID
 */
export function getPresetById(id: string): DemoPreset | undefined {
  return DEMO_PRESETS.find((p) => p.id === id);
}

/**
 * Get presets filtered by category
 */
export function getPresetsByCategory(
  category: DemoPreset['category']
): DemoPreset[] {
  return DEMO_PRESETS.filter((p) => p.category === category);
}

/**
 * Get all preset categories
 */
export function getPresetCategories(): DemoPreset['category'][] {
  return ['clinical', 'feature', 'workflow'];
}

/**
 * Default features when not in demo mode
 */
export const DEFAULT_FEATURES: DemoFeatures = {
  transcription: true,
  aiSuggestions: true,
  careGaps: true,
  taskPane: true,
  noteGeneration: true,
};
