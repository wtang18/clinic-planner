/**
 * Suggestion Generators
 * Creates mock AI suggestions for testing
 */

import {
  Suggestion,
  SuggestionType,
  SuggestionStatus,
  SuggestionSource,
  SuggestionContent,
} from '../../types';
import { generateId } from './ids';

// ============================================================================
// Suggestion Generators
// ============================================================================

export function generateSuggestion(
  overrides: Partial<Suggestion> = {}
): Suggestion {
  const now = new Date();

  return {
    id: generateId('sug'),
    type: 'chart-item',
    status: 'active',
    content: {
      type: 'new-item',
      itemTemplate: {},
      category: 'medication',
    },
    source: 'ai-analysis',
    confidence: 0.85,
    createdAt: now,
    displayText: 'Test suggestion',
    ...overrides,
  };
}

export function generateDxSuggestion(
  targetItemId: string,
  suggestions: Array<{
    description: string;
    icdCode: string;
    confidence: number;
    reasoning?: string;
  }>
): Suggestion {
  return generateSuggestion({
    type: 'dx-association',
    content: {
      type: 'dx-link',
      targetItemId,
      suggestedDx: suggestions,
    },
    displayText: `Link ${suggestions[0]?.description || 'diagnosis'}`,
    displaySubtext: suggestions[0]?.icdCode,
  });
}

export function generateNewItemSuggestion(
  category: string,
  itemTemplate: Record<string, unknown>,
  displayText: string,
  options: {
    source?: SuggestionSource;
    confidence?: number;
    sourceSegmentId?: string;
    reasoning?: string;
  } = {}
): Suggestion {
  return generateSuggestion({
    type: 'chart-item',
    content: {
      type: 'new-item',
      itemTemplate,
      category: category as any,
    },
    source: options.source || 'transcription',
    confidence: options.confidence || 0.8,
    sourceSegmentId: options.sourceSegmentId,
    reasoning: options.reasoning,
    displayText,
  });
}

export function generateCorrectionSuggestion(
  targetItemId: string,
  field: string,
  currentValue: unknown,
  suggestedValue: unknown,
  displayText: string
): Suggestion {
  return generateSuggestion({
    type: 'correction',
    content: {
      type: 'correction',
      targetItemId,
      field,
      currentValue,
      suggestedValue,
    },
    displayText,
    displaySubtext: `Change ${field}`,
  });
}

export function generateCareGapActionSuggestion(
  careGapId: string,
  actionTemplate: Record<string, unknown>,
  displayText: string
): Suggestion {
  return generateSuggestion({
    type: 'care-gap-action',
    content: {
      type: 'care-gap-action',
      careGapId,
      actionTemplate,
    },
    source: 'care-gap',
    displayText,
  });
}

// ============================================================================
// Suggestion Templates for Scenarios
// ============================================================================

export const SUGGESTION_TEMPLATES = {
  // UC Cough - transcription-based suggestions
  ucCoughTranscription: [
    generateNewItemSuggestion(
      'medication',
      {
        drugName: 'Benzonatate',
        dosage: '100 mg',
        route: 'PO',
        frequency: 'TID',
        duration: '7 days',
        quantity: 21,
      },
      'Benzonatate 100mg TID',
      {
        source: 'transcription',
        confidence: 0.92,
        reasoning: 'Extracted from: "Let\'s start with benzonatate 100mg three times a day"',
      }
    ),
    generateNewItemSuggestion(
      'diagnosis',
      {
        description: 'Acute bronchitis',
        icdCode: 'J20.9',
        type: 'encounter',
        clinicalStatus: 'active',
      },
      'Acute bronchitis (J20.9)',
      {
        source: 'ai-analysis',
        confidence: 0.88,
        reasoning: 'Based on symptoms: productive cough 5 days, no fever, clear lungs',
      }
    ),
  ],

  // UC Cough - AI analysis suggestions
  ucCoughAiAnalysis: [
    generateDxSuggestion('item-benzonatate', [
      {
        description: 'Acute bronchitis',
        icdCode: 'J20.9',
        confidence: 0.9,
        reasoning: 'Cough suppressant commonly prescribed for acute bronchitis',
      },
      {
        description: 'Cough',
        icdCode: 'R05.9',
        confidence: 0.75,
        reasoning: 'Symptomatic treatment for cough',
      },
    ]),
  ],

  // PC Diabetes - care gap suggestions
  pcDiabetesCareGaps: [
    generateCareGapActionSuggestion(
      'gap-a1c-001',
      {
        testName: 'Hemoglobin A1C',
        testCode: '4548-4',
        priority: 'routine',
      },
      'Order A1C to close care gap',
    ),
    generateCareGapActionSuggestion(
      'gap-eye-001',
      {
        specialty: 'Ophthalmology',
        reason: 'Annual diabetic eye exam',
        urgency: 'routine',
      },
      'Refer for diabetic eye exam',
    ),
  ],

  // PC Diabetes - transcription suggestions
  pcDiabetesTranscription: [
    generateNewItemSuggestion(
      'medication',
      {
        drugName: 'Metformin',
        genericName: 'Metformin HCl',
        dosage: '1000 mg',
        route: 'PO',
        frequency: 'BID',
        prescriptionType: 'refill',
      },
      'Metformin 1000mg BID (refill)',
      {
        source: 'transcription',
        confidence: 0.95,
        reasoning: 'Patient requested refill of current diabetes medication',
      }
    ),
    generateNewItemSuggestion(
      'lab',
      {
        testName: 'Lipid Panel',
        testCode: '57698-3',
        priority: 'routine',
      },
      'Lipid Panel',
      {
        source: 'ai-analysis',
        confidence: 0.82,
        reasoning: 'Recommended for diabetic patients on statin therapy',
      }
    ),
  ],

  // Drug interaction alert
  drugInteraction: [
    generateSuggestion({
      type: 'correction',
      content: {
        type: 'correction',
        targetItemId: 'item-warfarin',
        field: 'warning',
        currentValue: null,
        suggestedValue: 'Interaction with aspirin - increased bleeding risk',
      },
      source: 'cds',
      confidence: 1.0,
      displayText: '⚠️ Drug interaction detected',
      displaySubtext: 'Warfarin + Aspirin',
    }),
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

export function generateSuggestionsForScenario(
  scenario: keyof typeof SUGGESTION_TEMPLATES
): Suggestion[] {
  return SUGGESTION_TEMPLATES[scenario].map((suggestion) => ({
    ...suggestion,
    id: generateId('sug'),
    createdAt: new Date(),
  }));
}

export function expireSuggestion(suggestion: Suggestion): Suggestion {
  return {
    ...suggestion,
    status: 'expired',
    expiresAt: new Date(),
  };
}

export function acceptSuggestion(suggestion: Suggestion): Suggestion {
  return {
    ...suggestion,
    status: 'accepted',
    actedAt: new Date(),
  };
}

export function dismissSuggestion(suggestion: Suggestion): Suggestion {
  return {
    ...suggestion,
    status: 'dismissed',
    actedAt: new Date(),
  };
}
