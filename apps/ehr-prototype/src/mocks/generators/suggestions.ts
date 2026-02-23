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
import type { ChartItem, ItemCategory, ItemIntent } from '../../types/chart-items';
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
  itemData: Record<string, unknown>,
  displayText: string,
  options: {
    source?: SuggestionSource;
    confidence?: number;
    sourceSegmentId?: string;
    reasoning?: string;
    intent?: ItemIntent;
  } = {}
): Suggestion {
  return generateSuggestion({
    type: 'chart-item',
    content: {
      type: 'new-item',
      itemTemplate: {
        category: category as ItemCategory,
        displayText,
        data: itemData,
        ...(options.intent ? { intent: options.intent } : {}),
        _meta: {
          syncStatus: 'local' as const,
          aiGenerated: true,
          aiConfidence: options.confidence || 0.8,
          requiresReview: true,
          reviewed: false,
        },
      } as Partial<ChartItem>,
      category: category as ItemCategory,
    },
    source: options.source || 'transcription',
    confidence: options.confidence || 0.8,
    sourceSegmentId: options.sourceSegmentId,
    reasoning: options.reasoning,
    displayText,
    actionLabel: displayText,
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
  category: string,
  actionData: Record<string, unknown>,
  displayText: string
): Suggestion {
  return generateSuggestion({
    type: 'care-gap-action',
    content: {
      type: 'care-gap-action',
      careGapId,
      actionTemplate: {
        category: category as ItemCategory,
        displayText,
        data: actionData,
      } as Partial<ChartItem>,
    },
    source: 'care-gap',
    displayText,
    actionLabel: displayText,
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
        intent: 'prescribe',
      }
    ),
    generateNewItemSuggestion(
      'medication',
      {
        drugName: 'Mucinex',
        genericName: 'Guaifenesin',
        dosage: '600 mg',
        route: 'PO',
        frequency: 'BID',
        reportedBy: 'patient',
        verificationStatus: 'unverified',
        prescriptionType: 'new',
        isControlled: false,
      },
      'Mucinex 600mg (reported)',
      {
        source: 'transcription',
        confidence: 0.88,
        reasoning: 'Extracted from: "I\'ve been taking some Mucinex for the cough"',
        intent: 'report',
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
      'lab',
      {
        testName: 'Hemoglobin A1C',
        testCode: '4548-4',
        priority: 'routine',
      },
      'Order A1C to close care gap',
    ),
    generateCareGapActionSuggestion(
      'gap-eye-001',
      'referral',
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
        intent: 'prescribe',
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

  // UC Cough - narrative draft suggestions
  ucCoughNarrativeDrafts: [
    generateNewItemSuggestion(
      'hpi',
      {
        text: 'Patient is a 45-year-old male presenting with productive cough x5 days. Cough is worse at night with mild congestion. No fever, chest pain, or shortness of breath. No sick contacts. Non-smoker.',
        format: 'plain',
      },
      'HPI Draft',
      {
        source: 'ai-analysis',
        confidence: 0.85,
        reasoning: 'Generated from transcript',
      }
    ),
    generateNewItemSuggestion(
      'plan',
      {
        text: '1. Benzonatate 100mg TID x7 days for cough\n2. Increase fluids and rest\n3. Return if symptoms worsen or fever develops',
        format: 'plain',
      },
      'Assessment & Plan Draft',
      {
        source: 'ai-analysis',
        confidence: 0.80,
        reasoning: 'Generated from encounter context',
      }
    ),
    generateNewItemSuggestion(
      'instruction',
      {
        text: 'Take benzonatate as directed — swallow whole, do not crush or chew. Increase fluids. Return if fever develops or cough worsens after 5 days.',
        format: 'plain',
      },
      'Patient Instructions Draft',
      {
        source: 'ai-analysis',
        confidence: 0.82,
        reasoning: 'Generated from treatment plan',
      }
    ),
  ],

  // Annual Wellness Visit - screening suggestions
  awvWellnessScreening: [
    generateNewItemSuggestion('lab', {
      testName: 'Lipid Panel',
      testCode: '57698-3',
      priority: 'routine',
      collectionType: 'send-out',
      orderStatus: 'draft',
    }, 'Lipid Panel', {
      source: 'care-gap',
      confidence: 0.90,
      reasoning: 'Recommended for males 20+ per USPSTF',
    }),
    generateNewItemSuggestion('lab', {
      testName: 'Comprehensive Metabolic Panel',
      testCode: '24323-8',
      priority: 'routine',
      collectionType: 'send-out',
      orderStatus: 'draft',
    }, 'CMP', {
      source: 'care-gap',
      confidence: 0.85,
      reasoning: 'Baseline metabolic screening for annual wellness',
    }),
    generateNewItemSuggestion('diagnosis', {
      description: 'Encounter for general adult medical examination',
      icdCode: 'Z00.00',
      type: 'encounter',
      clinicalStatus: 'active',
    }, 'Annual Wellness Visit (Z00.00)', {
      source: 'ai-analysis',
      confidence: 0.95,
      reasoning: 'Standard AWV diagnosis code',
    }),
  ],

  // Annual Wellness Visit - narrative drafts
  awvNarrativeDrafts: [
    generateNewItemSuggestion('hpi', {
      text: '31-year-old male presenting for annual wellness exam. No acute complaints. History of low back pain, managed conservatively. Anxiety disorder, stable on sertraline. No new symptoms.',
      format: 'plain',
    }, 'HPI Draft', {
      source: 'ai-analysis',
      confidence: 0.85,
      reasoning: 'Generated from patient history',
    }),
    generateNewItemSuggestion('plan', {
      text: '1. Continue sertraline 50mg daily for anxiety\n2. Routine labs: Lipid panel, CMP\n3. Discuss exercise program for back pain\n4. Age-appropriate screenings up to date\n5. Follow up in 1 year or PRN',
      format: 'plain',
    }, 'Assessment & Plan Draft', {
      source: 'ai-analysis',
      confidence: 0.80,
      reasoning: 'Generated from encounter context',
    }),
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
