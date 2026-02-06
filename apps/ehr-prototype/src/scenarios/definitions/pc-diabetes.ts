/**
 * PC Diabetes Follow-up Scenario
 *
 * Primary Care scenario: 58yo male with DM, HTN for quarterly follow-up.
 */

import type { Scenario, ScenarioEvent } from '../ScenarioRunner';
import type { EncounterAction } from '../../state/actions/types';
import { generateId } from '../../utils/id';

// ============================================================================
// Helper Functions
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

export const PC_DIABETES_SCENARIO: Scenario = {
  id: 'pc-diabetes',
  name: 'Primary Care - Diabetes Follow-up',
  description: '58-year-old male with Type 2 DM and HTN for quarterly follow-up. A1C monitoring due.',

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
            displayText: 'Vitals: BP 142/88, HR 72, Temp 98.2°F, SpO2 97%, Wt 195 lbs',
            createdAt: new Date(),
            createdBy: { id: 'ma-001', name: 'MA Garcia', role: 'ma' },
            data: {
              capturedAt: new Date(),
              measurements: [
                { type: 'bp-systolic', value: 142, unit: 'mmHg' },
                { type: 'bp-diastolic', value: 88, unit: 'mmHg' },
                { type: 'pulse', value: 72, unit: 'bpm' },
                { type: 'temp', value: 98.2, unit: '°F' },
                { type: 'spo2', value: 97, unit: '%' },
                { type: 'weight', value: 195, unit: 'lbs' },
              ],
            },
          },
          source: { type: 'manual' },
        },
      } as unknown as EncounterAction,
      description: 'MA records vitals',
    },

    // === Care Gap Alert ===
    {
      delayMs: 1500,
      action: {
        type: 'CARE_GAP_IDENTIFIED',
        payload: {
          gap: {
            id: generateId('gap'),
            definitionId: 'dm-a1c-q3',
            patientId: 'pt-002',
            status: 'open',
            openedAt: new Date(),
            dueBy: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days overdue
            closureAttempts: [],
            excluded: false,
            addressedThisEncounter: false,
            encounterActions: [],
            _display: {
              name: 'Diabetes A1C Monitoring',
              category: 'diabetes',
              priority: 'critical',
              actionLabel: 'Order A1C test',
              dueLabel: 'Overdue',
            },
          },
          source: 'system-scan',
        },
      },
      description: 'A1C care gap detected - overdue',
    },

    // === Start Transcription ===
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_STARTED',
        payload: {},
      },
      description: 'Start transcription',
    },

    // === Patient Status ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: "Overall I'm feeling pretty good. Blood sugars have been running a little high in the mornings though.",
            startTime: 0,
            endTime: 5,
            confidence: 0.90,
            speaker: 'patient',
          },
        },
      },
      description: 'Patient describes current status',
    },

    // === Medication Adherence ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: "I've been taking my metformin twice a day. Blood pressure medicine too. Sometimes I forget the evening metformin.",
            startTime: 6,
            endTime: 12,
            confidence: 0.88,
            speaker: 'patient',
          },
        },
      },
      description: 'Patient reports medication adherence',
    },

    // === Provider Question ===
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: "How are your feet doing? Any numbness or tingling?",
            startTime: 13,
            endTime: 16,
            confidence: 0.94,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider asks about diabetic symptoms',
    },

    // === Patient Response ===
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: "My feet are okay. No numbness or tingling. I check them every day like you told me.",
            startTime: 17,
            endTime: 21,
            confidence: 0.91,
            speaker: 'patient',
          },
        },
      },
      description: 'Patient responds about feet',
    },

    // === AI Suggestion: HPI ===
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
              category: 'hpi',
              itemTemplate: {
                displayText: 'Diabetes follow-up: fasting glucose elevated, adherent to metformin (occasional missed evening dose), no neuropathy symptoms',
                data: {
                  description: 'Patient here for quarterly DM follow-up. Reports elevated fasting blood sugars. Taking metformin BID with occasional missed evening doses. Denies numbness, tingling in feet. Self-monitoring feet daily.',
                },
              },
            },
            source: 'transcription',
            confidence: 0.86,
            createdAt: new Date(),
            displayText: 'HPI: Quarterly DM follow-up, elevated fasting glucose',
            reasoning: 'Compiled from patient description of diabetes management.',
          },
          source: 'transcription',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests HPI',
    },

    // === Physical Exam ===
    {
      delayMs: 3000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Heart regular rate and rhythm, no murmurs. Lungs clear. Feet exam shows good pulses, intact monofilament sensation, no lesions.',
            startTime: 25,
            endTime: 32,
            confidence: 0.92,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider documents physical exam',
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
                displayText: 'PE: CV RRR no murmurs, Lungs clear, Feet with good pulses, intact sensation, no lesions',
                data: {
                  sections: [
                    { system: 'cardiovascular', findings: 'Regular rate and rhythm, no murmurs' },
                    { system: 'respiratory', findings: 'Clear bilaterally' },
                    { system: 'extremities', findings: 'Feet: good pedal pulses, intact monofilament sensation, no lesions' },
                  ],
                },
              },
            },
            source: 'transcription',
            confidence: 0.90,
            createdAt: new Date(),
            displayText: 'PE: CV, Lungs, Diabetic foot exam',
            reasoning: 'Extracted from provider exam documentation.',
          },
          source: 'transcription',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests physical exam',
    },

    // === Lab Order Discussion ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: "Let's get your A1C checked today since it's due. We'll also do a basic metabolic panel to check your kidney function.",
            startTime: 35,
            endTime: 41,
            confidence: 0.91,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider discusses labs',
    },

    // === AI Suggestion: A1C Lab Order ===
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
              category: 'lab',
              itemTemplate: {
                displayText: 'Hemoglobin A1C (83036)',
                data: {
                  testName: 'Hemoglobin A1C',
                  cptCode: '83036',
                  indication: 'Diabetes monitoring',
                  priority: 'routine',
                },
              },
            },
            source: 'care-gap',
            confidence: 0.95,
            createdAt: new Date(),
            displayText: 'Order: Hemoglobin A1C',
            reasoning: 'Addresses open care gap for A1C monitoring.',
            relatedCareGapId: 'gap-dm-a1c',
          },
          source: 'care-gap',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests A1C order (care gap)',
    },

    // === Care Gap Update ===
    {
      delayMs: 1000,
      action: {
        type: 'CARE_GAP_ADDRESSED',
        payload: {
          gapId: 'gap-dm-a1c',
          itemId: 'lab-a1c-001',
          result: 'pending',
        },
      },
      description: 'A1C care gap marked as pending',
    },

    // === Medication Adjustment ===
    {
      delayMs: 3000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Your blood pressure is a bit high today. Let\'s increase your lisinopril from 10 to 20mg daily.',
            startTime: 45,
            endTime: 50,
            confidence: 0.89,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider adjusts BP medication',
    },

    // === AI Suggestion: Med Change ===
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
              type: 'modify-item',
              category: 'medication',
              itemTemplate: {
                displayText: 'Lisinopril 20mg daily (increased from 10mg)',
                data: {
                  drugName: 'Lisinopril',
                  dose: '20mg',
                  route: 'oral',
                  frequency: 'daily',
                  indication: 'hypertension',
                  change: 'increased from 10mg',
                },
              },
            },
            source: 'transcription',
            confidence: 0.88,
            createdAt: new Date(),
            displayText: 'Increase Lisinopril to 20mg daily',
            reasoning: 'Provider indicated dose increase due to elevated BP.',
          },
          source: 'transcription',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests medication increase',
    },

    // === Follow-up Discussion ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: "Come back in 3 months for another check. Keep monitoring your blood sugars and try not to miss that evening metformin.",
            startTime: 55,
            endTime: 61,
            confidence: 0.90,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider discusses follow-up',
    },

    // === AI Suggestion: Follow-up ===
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
                displayText: 'Follow-up in 3 months, continue home glucose monitoring, medication adherence counseling',
                data: {
                  type: 'follow-up',
                  instructions: [
                    'Return in 3 months for diabetes follow-up',
                    'Continue home blood glucose monitoring',
                    'Take metformin consistently - do not skip evening dose',
                    'Continue daily foot inspections',
                    'Call if blood sugars consistently above 200',
                  ],
                  followUpInterval: '3 months',
                },
              },
            },
            source: 'transcription',
            confidence: 0.87,
            createdAt: new Date(),
            displayText: 'Follow-up and self-care instructions',
            reasoning: 'Extracted from provider follow-up discussion.',
          },
          source: 'transcription',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests follow-up instructions',
    },

    // === Stop Transcription ===
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_STOPPED',
        payload: {},
      },
      description: 'Transcription stopped',
    },
  ],
};
