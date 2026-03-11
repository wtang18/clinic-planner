/**
 * UC Cough Scenario
 *
 * Urgent Care scenario: 42yo female with productive cough x 5 days.
 */

import type { Scenario, ScenarioEvent } from '../ScenarioRunner';
import type { EncounterAction } from '../../state/actions/types';
import { generateId } from '../../utils/id';

// ============================================================================
// Helper: Generate Segment ID
// ============================================================================

function segId(): string {
  return generateId('seg');
}

function itemId(): string {
  return generateId('item');
}

// ============================================================================
// Scenario Definition
// ============================================================================

export const UC_COUGH_SCENARIO: Scenario = {
  id: 'uc-cough',
  name: 'Urgent Care - Cough',
  description: '42-year-old female presenting with productive cough for 5 days, worse at night.',

  events: [
    // === MA Records Vitals ===
    {
      delayMs: 1000,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId(),
            category: 'vitals',
            status: 'confirmed',
            displayText: 'Vitals: BP 128/82, HR 78, Temp 98.6°F, SpO2 98%',
            createdAt: new Date(),
            createdBy: { id: 'ma-001', name: 'MA Smith', role: 'ma' },
            data: {
              capturedAt: new Date(),
              measurements: [
                { type: 'bp-systolic', value: 128, unit: 'mmHg' },
                { type: 'bp-diastolic', value: 82, unit: 'mmHg' },
                { type: 'pulse', value: 78, unit: 'bpm' },
                { type: 'temp', value: 98.6, unit: '°F' },
                { type: 'spo2', value: 98, unit: '%' },
              ],
            },
          },
          source: { type: 'manual' },
        },
      } as unknown as EncounterAction,
      description: 'MA records vitals',
    },

    // === Start Transcription ===
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_STARTED',
        payload: {},
      },
      description: 'MA starts transcription',
    },

    // === Chief Complaint ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: "I've had this cough for about 5 days now. It's worse at night and I'm bringing up some yellow mucus.",
            startTime: 0,
            endTime: 5,
            confidence: 0.92,
            speaker: 'patient',
          },
        },
      },
      description: 'Patient describes chief complaint',
    },

    // === HPI Elaboration ===
    {
      delayMs: 3000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Started as a dry cough, then got worse. Having some mild chest tightness when I cough hard.',
            startTime: 5,
            endTime: 10,
            confidence: 0.89,
            speaker: 'patient',
          },
        },
      },
      description: 'Patient provides HPI details',
    },

    // === AI Suggestion: Chief Complaint ===
    {
      delayMs: 2000,
      action: {
        type: 'SUGGESTION_RECEIVED',
        payload: {
          suggestion: {
            id: generateId('sug'),
            type: 'chart-item',
            status: 'active',
            content: {
              type: 'new-item',
              category: 'chief-complaint',
              itemTemplate: {
                displayText: 'Productive cough x 5 days, worse at night',
                data: {
                  description: 'Productive cough x 5 days, worse at night',
                },
              },
            },
            source: 'transcription',
            confidence: 0.88,
            createdAt: new Date(),
            displayText: 'Productive cough x 5 days, worse at night',
            reasoning: 'Extracted from patient statement about cough duration and timing.',
          },
          source: 'transcription',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests chief complaint',
    },

    // === Associated Symptoms ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: "No fever that I've noticed. A little runny nose the first couple days. No body aches or headaches.",
            startTime: 12,
            endTime: 17,
            confidence: 0.91,
            speaker: 'patient',
          },
        },
      },
      description: 'Patient describes associated symptoms',
    },

    // === Doctor Question ===
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Any shortness of breath? Wheezing?',
            startTime: 18,
            endTime: 20,
            confidence: 0.95,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider asks about respiratory symptoms',
    },

    // === Patient Response ===
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: "No, not really short of breath. Maybe a tiny bit when I'm coughing a lot but it goes away.",
            startTime: 20,
            endTime: 24,
            confidence: 0.88,
            speaker: 'patient',
          },
        },
      },
      description: 'Patient responds about breathing',
    },

    // === Physical Exam ===
    {
      delayMs: 3000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Lungs clear to auscultation bilaterally, no wheezes or rhonchi. Oropharynx with mild erythema, no exudates.',
            startTime: 30,
            endTime: 36,
            confidence: 0.93,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider documents exam findings',
    },

    // === AI Suggestion: Physical Exam ===
    {
      delayMs: 2000,
      action: {
        type: 'SUGGESTION_RECEIVED',
        payload: {
          suggestion: {
            id: generateId('sug'),
            type: 'chart-item',
            status: 'active',
            content: {
              type: 'new-item',
              category: 'physical-exam',
              itemTemplate: {
                displayText: 'PE: Lungs CTAB, no wheezes/rhonchi. Oropharynx mild erythema, no exudates.',
                data: {
                  sections: [
                    {
                      system: 'respiratory',
                      findings: 'Lungs CTAB, no wheezes or rhonchi',
                    },
                    {
                      system: 'ent',
                      findings: 'Oropharynx with mild erythema, no exudates',
                    },
                  ],
                },
              },
            },
            source: 'transcription',
            confidence: 0.91,
            createdAt: new Date(),
            displayText: 'PE: Lungs CTAB, no wheezes/rhonchi. Oropharynx mild erythema.',
            reasoning: 'Extracted from provider dictated exam findings.',
          },
          source: 'transcription',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests physical exam',
    },

    // === Diagnosis Discussion ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: "So it sounds like you have acute bronchitis. It's a viral infection that usually gets better on its own in 1-2 weeks.",
            startTime: 40,
            endTime: 47,
            confidence: 0.90,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider explains diagnosis',
    },

    // === AI Suggestion: Diagnosis ===
    {
      delayMs: 2000,
      action: {
        type: 'SUGGESTION_RECEIVED',
        payload: {
          suggestion: {
            id: generateId('sug'),
            type: 'chart-item',
            status: 'active',
            content: {
              type: 'new-item',
              category: 'diagnosis',
              itemTemplate: {
                displayText: 'Acute bronchitis (J20.9)',
                data: {
                  description: 'Acute bronchitis',
                  icdCode: 'J20.9',
                  type: 'acute',
                  clinicalStatus: 'active',
                },
              },
            },
            source: 'ai-analysis',
            confidence: 0.89,
            createdAt: new Date(),
            displayText: 'Acute bronchitis (J20.9)',
            reasoning: 'Based on symptoms (productive cough, mild pharyngitis) and exam findings (clear lungs).',
          },
          source: 'ai-analysis',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests diagnosis',
    },

    // === Treatment Plan ===
    {
      delayMs: 3000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: "I'm going to give you Benzonatate for the cough, and recommend plenty of fluids and rest. Honey in tea can also help.",
            startTime: 50,
            endTime: 56,
            confidence: 0.91,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider discusses treatment',
    },

    // === AI Suggestion: Medication ===
    {
      delayMs: 2000,
      action: {
        type: 'SUGGESTION_RECEIVED',
        payload: {
          suggestion: {
            id: generateId('sug'),
            type: 'chart-item',
            status: 'active',
            content: {
              type: 'new-item',
              category: 'medication',
              itemTemplate: {
                displayText: 'Benzonatate 100mg capsule - 1 cap TID PRN cough',
                data: {
                  drugName: 'Benzonatate',
                  dose: '100mg',
                  route: 'oral',
                  frequency: 'TID PRN',
                  indication: 'cough',
                  duration: '10 days',
                },
              },
            },
            source: 'transcription',
            confidence: 0.87,
            createdAt: new Date(),
            displayText: 'Benzonatate 100mg capsule TID PRN',
            reasoning: 'Extracted from provider treatment discussion.',
          },
          source: 'transcription',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests medication',
    },

    // === Patient Instructions ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Come back if you develop fever over 101, worsening shortness of breath, or symptoms that last more than 2 weeks.',
            startTime: 58,
            endTime: 64,
            confidence: 0.92,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider gives return precautions',
    },

    // === AI Suggestion: Instructions ===
    {
      delayMs: 2000,
      action: {
        type: 'SUGGESTION_RECEIVED',
        payload: {
          suggestion: {
            id: generateId('sug'),
            type: 'chart-item',
            status: 'active',
            content: {
              type: 'new-item',
              category: 'instruction',
              itemTemplate: {
                displayText: 'Return precautions: fever >101°F, worsening SOB, symptoms >2 weeks',
                data: {
                  type: 'return-precautions',
                  instructions: [
                    'Return if fever over 101°F',
                    'Return if worsening shortness of breath',
                    'Return if symptoms last more than 2 weeks',
                    'Increase fluid intake',
                    'Rest as needed',
                    'Honey in tea for cough relief',
                  ],
                },
              },
            },
            source: 'transcription',
            confidence: 0.86,
            createdAt: new Date(),
            displayText: 'Return precautions and supportive care instructions',
            reasoning: 'Extracted from provider discharge instructions.',
          },
          source: 'transcription',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests patient instructions',
    },

    // === Stop Transcription ===
    {
      delayMs: 3000,
      action: {
        type: 'TRANSCRIPTION_STOPPED',
        payload: {},
      },
      description: 'Transcription stopped',
    },
  ],
};
