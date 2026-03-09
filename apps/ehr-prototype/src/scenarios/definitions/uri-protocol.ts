/**
 * URI Protocol Scenario
 *
 * Urgent Care scenario: 32yo male with cold symptoms × 5 days.
 * Demonstrates non-scoring protocol with conditional antibiotic item.
 * Antibiotic remains inactive (symptoms <10 days) — validates conditionBehavior.
 */

import type { Scenario } from '../ScenarioRunner';
import type { EncounterAction } from '../../state/actions/types';
import type { ActiveProtocolState, ProtocolCardState, ProtocolItemState, ProtocolTemplate } from '../../types/protocol';
import { URI_TEMPLATE } from '../../mocks/protocols/uri';
import { generateId } from '../../utils/id';

// ============================================================================
// Helpers
// ============================================================================

function segId(): string {
  return generateId('seg');
}

function itemId(): string {
  return generateId('item');
}

function buildProtocolState(template: ProtocolTemplate): ActiveProtocolState {
  const cardStates: Record<string, ProtocolCardState> = {};
  const itemStates: Record<string, ProtocolItemState> = {};

  template.cards.forEach((card, index) => {
    cardStates[card.id] = {
      expanded: template.autoExpandFirstCard && index === 0,
      manuallyToggled: false,
    };
    card.items.forEach(item => {
      itemStates[item.id] = { status: 'pending' };
    });
  });

  return {
    id: 'uri-scenario-proto',
    templateId: template.id,
    templateSnapshot: template,
    status: 'available',
    activationSource: 'cc-match',
    activatedAt: null,
    isPrimary: true,
    severity: null,
    cardStates,
    itemStates,
  };
}

const PROTOCOL_STATE = buildProtocolState(URI_TEMPLATE);
const PROTO_ID = PROTOCOL_STATE.id;

// ============================================================================
// Scenario Definition
// ============================================================================

export const URI_PROTOCOL_SCENARIO: Scenario = {
  id: 'uri-protocol',
  name: 'Urgent Care - URI Protocol',
  description: '32-year-old male with cold symptoms × 5 days. Non-scoring protocol with conditional antibiotic.',

  events: [
    // === Vitals ===
    {
      delayMs: 1000,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: itemId(),
            category: 'vitals',
            status: 'confirmed',
            displayText: 'Vitals: BP 118/74, HR 82, Temp 99.8°F, SpO2 98%',
            createdAt: new Date(),
            createdBy: { id: 'ma-001', name: 'MA Garcia', role: 'ma' },
            data: {
              capturedAt: new Date(),
              measurements: [
                { type: 'bp-systolic', value: 118, unit: 'mmHg' },
                { type: 'bp-diastolic', value: 74, unit: 'mmHg' },
                { type: 'pulse', value: 82, unit: 'bpm' },
                { type: 'temp', value: 99.8, unit: '°F' },
                { type: 'spo2', value: 98, unit: '%' },
              ],
            },
          },
          source: { type: 'manual' },
        },
      } as unknown as EncounterAction,
      description: 'MA records vitals — low-grade temp',
    },

    // === Protocol Loaded ===
    {
      delayMs: 500,
      action: {
        type: 'PROTOCOL_LOADED',
        payload: { protocol: PROTOCOL_STATE },
      },
      description: 'URI protocol loaded (CC: cold symptoms)',
    },

    // === Protocol Activated ===
    {
      delayMs: 1000,
      action: {
        type: 'PROTOCOL_ACTIVATED',
        payload: { protocolId: PROTO_ID, source: 'cc-match' },
      },
      description: 'URI protocol activated — tab appears',
    },

    // === Start Transcription ===
    {
      delayMs: 1500,
      action: {
        type: 'TRANSCRIPTION_STARTED',
        payload: {},
      },
      description: 'Start transcription',
    },

    // === Patient describes symptoms ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'I\'ve had this cold for about 5 days now. Runny nose, sore throat, coughing. Feeling pretty lousy.',
            startTime: 0,
            endTime: 6,
            confidence: 0.90,
            speaker: 'patient',
          },
        },
      },
      description: 'Patient describes URI symptoms',
    },

    // === Provider questions ===
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Any fever? How about the color of the nasal discharge? Any facial pain or pressure?',
            startTime: 7,
            endTime: 12,
            confidence: 0.92,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider asks about sinusitis indicators',
    },

    // === Patient response ===
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Maybe a low fever yesterday. Discharge is clear mostly. No real facial pain, just congestion.',
            startTime: 13,
            endTime: 18,
            confidence: 0.88,
            speaker: 'patient',
          },
        },
      },
      description: 'Patient reports clear discharge, no sinusitis signs',
    },

    // === Symptom duration documented (auto-detected) ===
    {
      delayMs: 2000,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'symptom-duration-doc',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'Symptom duration auto-detected from transcript',
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
                displayText: 'URI × 5 days: rhinorrhea, sore throat, cough, low-grade fever',
                data: {
                  description: '32M presents with cold symptoms × 5 days. Rhinorrhea (clear), sore throat, cough, low-grade fever. No facial pain/pressure. No purulent discharge.',
                },
              },
            },
            source: 'transcription',
            confidence: 0.87,
            createdAt: new Date(),
            displayText: 'HPI: URI × 5 days, uncomplicated',
            reasoning: 'Compiled from patient description of URI symptoms.',
          },
          source: 'transcription',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests HPI',
    },

    // === Strep screening acknowledged ===
    {
      delayMs: 2500,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'strep-screening-guidance',
          addressedBy: { type: 'manual' },
        },
      },
      description: 'Strep screening guidance reviewed — Centor <3, no rapid test needed',
    },

    // === OTC guidance acknowledged ===
    {
      delayMs: 2000,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'otc-guidance',
          addressedBy: { type: 'manual' },
        },
      },
      description: 'OTC symptomatic relief guidance reviewed',
    },

    // === Antibiotic skipped (symptoms <10 days, no bacterial indicators) ===
    {
      delayMs: 1500,
      action: {
        type: 'PROTOCOL_ITEM_SKIPPED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'antibiotic-order',
          reason: 'Viral URI — symptoms <10 days, no bacterial sinusitis indicators',
        },
      },
      description: 'Antibiotic skipped — viral URI, no indication',
    },

    // === Education discussion ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'This is a viral cold, so antibiotics won\'t help here. Keep resting, drink plenty of fluids, and you can use honey for the cough. If it\'s not better in a week or so, or if you develop high fever or difficulty breathing, come back in.',
            startTime: 25,
            endTime: 35,
            confidence: 0.91,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider gives education and return precautions',
    },

    // === Return precautions documented ===
    {
      delayMs: 1500,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'return-precautions-doc',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'Return precautions auto-detected from transcript',
    },

    // === Follow-up instruction added ===
    {
      delayMs: 1500,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'inst-followup-uri-001',
            category: 'instruction',
            status: 'draft',
            displayText: 'Follow up in 7-10 days if symptoms not improving',
            createdAt: new Date(),
            createdBy: { id: 'provider-001', name: 'Dr. Park', role: 'provider' },
            data: {
              text: 'Follow up in 7-10 days if symptoms are not improving or worsening.',
              instructionType: 'follow-up',
              followUpInterval: '7-10 days',
            },
            protocolRef: 'uri-v1:followup-instruction',
          },
          source: { type: 'protocol' },
        },
      } as unknown as EncounterAction,
      description: 'Follow-up instruction added via protocol',
    },

    // === Follow-up item addressed ===
    {
      delayMs: 200,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'followup-instruction',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'Follow-up protocol item addressed',
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

    // === Protocol completed ===
    {
      delayMs: 1000,
      action: {
        type: 'PROTOCOL_COMPLETED',
        payload: { protocolId: PROTO_ID },
      },
      description: 'URI protocol complete — all items addressed/skipped',
    },
  ],
};
