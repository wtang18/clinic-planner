/**
 * LBP Protocol Scenario
 *
 * Primary Care scenario: 45yo female with acute low back pain for 2 weeks.
 * Demonstrates Care Protocol lifecycle: load → activate → address items →
 * severity scoring → completion.
 *
 * Protocol events are dispatched as EncounterActions. The EncounterOverview
 * useEffect bridge auto-syncs coordination state (tab visibility).
 */

import type { Scenario, ScenarioEvent } from '../ScenarioRunner';
import type { EncounterAction } from '../../state/actions/types';
import type { ActiveProtocolState, ProtocolCardState, ProtocolItemState, ProtocolTemplate } from '../../types/protocol';
import { LOW_BACK_PAIN_TEMPLATE } from '../../mocks/protocols/low-back-pain';
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

/** Build an ActiveProtocolState from a template (mirrors ProtocolSearch logic). */
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
    id: 'lbp-scenario-proto',
    templateId: template.id,
    templateSnapshot: template,
    status: 'available',
    activationSource: 'ai-ambient',
    activatedAt: null,
    isPrimary: true,
    severity: template.severityScoringModel
      ? { score: 0, selectedPathId: '', isManualOverride: false }
      : null,
    cardStates,
    itemStates,
  };
}

// Pre-build the protocol state (stable ID for referencing in later events)
const PROTOCOL_STATE = buildProtocolState(LOW_BACK_PAIN_TEMPLATE);
const PROTO_ID = PROTOCOL_STATE.id;

// ============================================================================
// Scenario Definition
// ============================================================================

export const LBP_PROTOCOL_SCENARIO: Scenario = {
  id: 'lbp-protocol',
  name: 'Primary Care - Low Back Pain Protocol',
  description: '45-year-old female with acute lower back pain for 2 weeks. Demonstrates care protocol system.',

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
            displayText: 'Vitals: BP 128/80, HR 76, Temp 98.6°F, SpO2 98%',
            createdAt: new Date(),
            createdBy: { id: 'ma-001', name: 'MA Garcia', role: 'ma' },
            data: {
              capturedAt: new Date(),
              measurements: [
                { type: 'bp-systolic', value: 128, unit: 'mmHg' },
                { type: 'bp-diastolic', value: 80, unit: 'mmHg' },
                { type: 'pulse', value: 76, unit: 'bpm' },
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

    // === Protocol Loaded (system detects CC match) ===
    {
      delayMs: 500,
      action: {
        type: 'PROTOCOL_LOADED',
        payload: { protocol: PROTOCOL_STATE },
      },
      description: 'LBP protocol loaded (CC match detected)',
    },

    // === Protocol Activated (AI confirms relevance) ===
    {
      delayMs: 1000,
      action: {
        type: 'PROTOCOL_ACTIVATED',
        payload: { protocolId: PROTO_ID, source: 'ai-ambient' },
      },
      description: 'LBP protocol activated — tab appears',
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
            text: 'The pain started about two weeks ago after I was lifting boxes. It\'s in my lower back, kind of on the right side.',
            startTime: 0,
            endTime: 6,
            confidence: 0.91,
            speaker: 'patient',
          },
        },
      },
      description: 'Patient describes pain onset',
    },

    // === Provider questions ===
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Does it radiate down into your legs? Any numbness or tingling?',
            startTime: 7,
            endTime: 11,
            confidence: 0.93,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider asks about radiculopathy',
    },

    // === Patient response ===
    {
      delayMs: 2000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Yes, sometimes it goes down my right leg to about my knee. No numbness though. Pain is like a 7 out of 10 on a bad day.',
            startTime: 12,
            endTime: 18,
            confidence: 0.89,
            speaker: 'patient',
          },
        },
      },
      description: 'Patient reports radiation and pain score',
    },

    // === Ambient detection: Onset & Duration documented ===
    {
      delayMs: 2000,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'hpi-onset-doc',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'Onset & Duration auto-detected from transcript',
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
                displayText: 'LBP × 2 weeks after lifting, radiates to R leg, pain 7/10',
                data: {
                  description: '45F presents with low back pain × 2 weeks following lifting injury. Pain radiates to right leg to knee. Reports 7/10 severity on bad days. Denies numbness/tingling.',
                },
              },
            },
            source: 'transcription',
            confidence: 0.88,
            createdAt: new Date(),
            displayText: 'HPI: LBP × 2 weeks, R leg radiation, 7/10',
            reasoning: 'Compiled from patient description of back pain onset and characteristics.',
          },
          source: 'transcription',
        },
      } as unknown as EncounterAction,
      description: 'AI suggests HPI',
    },

    // === Assessment: Pain Scale (added to chart → addresses protocol item) ===
    {
      delayMs: 3000,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'assess-pain-001',
            category: 'assessment',
            status: 'confirmed',
            displayText: 'Pain Scale: 7/10',
            createdAt: new Date(),
            createdBy: { id: 'provider-001', name: 'Dr. Chen', role: 'provider' },
            data: {
              assessmentType: 'pain-scale',
              label: 'Pain Scale',
              scale: { min: 0, max: 10 },
              value: 7,
              method: 'patient-reported',
            },
            protocolRef: 'low-back-pain-v1:pain-scale-assess',
          },
          source: { type: 'protocol' },
        },
      } as unknown as EncounterAction,
      description: 'Pain Scale 7/10 added — severity score updates',
    },

    // === Protocol item addressed: pain-scale-assess (cross-surface) ===
    {
      delayMs: 200,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'pain-scale-assess',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'Pain scale protocol item auto-addressed',
    },

    // === Severity score updated from assessment ===
    {
      delayMs: 200,
      action: {
        type: 'PROTOCOL_SEVERITY_UPDATED',
        payload: {
          protocolId: PROTO_ID,
          score: 7,
          pathId: 'mild',
        },
      },
      description: 'Severity score: 7 → Low Risk path',
    },

    // === Provider performs physical exam ===
    {
      delayMs: 3000,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Range of motion is limited in forward flexion. Straight leg raise is positive on the right at about 45 degrees. No focal weakness.',
            startTime: 25,
            endTime: 32,
            confidence: 0.92,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider documents physical exam',
    },

    // === SLR documented (auto-detected) ===
    {
      delayMs: 1500,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'slr-doc',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'SLR test auto-detected from transcript',
    },

    // === Assessment: Functional Limitation ===
    {
      delayMs: 2000,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'assess-func-001',
            category: 'assessment',
            status: 'confirmed',
            displayText: 'Functional Limitation Score: 14/24',
            createdAt: new Date(),
            createdBy: { id: 'provider-001', name: 'Dr. Chen', role: 'provider' },
            data: {
              assessmentType: 'functional-limitation',
              label: 'Functional Limitation Score',
              scale: { min: 0, max: 24 },
              value: 14,
              method: 'patient-reported',
            },
            protocolRef: 'low-back-pain-v1:functional-limitation-assess',
          },
          source: { type: 'protocol' },
        },
      } as unknown as EncounterAction,
      description: 'Functional limitation score 14/24 added',
    },

    // === Protocol item addressed: functional-limitation-assess ===
    {
      delayMs: 200,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'functional-limitation-assess',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'Functional limitation protocol item auto-addressed',
    },

    // === Severity score re-computed: now moderate ===
    {
      delayMs: 200,
      action: {
        type: 'PROTOCOL_SEVERITY_UPDATED',
        payload: {
          protocolId: PROTO_ID,
          score: 28,
          pathId: 'severe',
        },
      },
      description: 'Severity score: 28 → High Risk path (pain 7×1.0 + func 14×1.5 = 28)',
    },

    // === Red flag screening acknowledged ===
    {
      delayMs: 2000,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'red-flags-guidance',
          addressedBy: { type: 'manual' },
        },
      },
      description: 'Red flags screening acknowledged — no red flags',
    },

    // === Treatment discussion ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'I\'m going to start you on ibuprofen 600 three times a day for the inflammation, and we\'ll add a muscle relaxant for the spasms.',
            startTime: 40,
            endTime: 47,
            confidence: 0.90,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider discusses treatment',
    },

    // === NSAID order added via protocol [+] ===
    {
      delayMs: 2000,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'rx-nsaid-001',
            category: 'medication',
            status: 'draft',
            displayText: 'Ibuprofen 600mg TID × 14 days',
            createdAt: new Date(),
            createdBy: { id: 'provider-001', name: 'Dr. Chen', role: 'provider' },
            data: {
              drugName: 'Ibuprofen',
              dosage: '600mg',
              frequency: 'TID',
              duration: '14 days',
              route: 'oral',
            },
            protocolRef: 'low-back-pain-v1:nsaid-order',
          },
          source: { type: 'protocol' },
        },
      } as unknown as EncounterAction,
      description: 'Ibuprofen ordered via protocol [+]',
    },

    // === Protocol item addressed: nsaid-order ===
    {
      delayMs: 200,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'nsaid-order',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'NSAID protocol item addressed',
    },

    // === Muscle relaxant order ===
    {
      delayMs: 1000,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'rx-relaxant-001',
            category: 'medication',
            status: 'draft',
            displayText: 'Cyclobenzaprine 10mg TID PRN × 7 days',
            createdAt: new Date(),
            createdBy: { id: 'provider-001', name: 'Dr. Chen', role: 'provider' },
            data: {
              drugName: 'Cyclobenzaprine',
              dosage: '10mg',
              frequency: 'TID PRN',
              duration: '7 days',
              route: 'oral',
            },
            protocolRef: 'low-back-pain-v1:muscle-relaxant',
          },
          source: { type: 'protocol' },
        },
      } as unknown as EncounterAction,
      description: 'Cyclobenzaprine ordered via protocol [+]',
    },

    // === Protocol item addressed: muscle-relaxant ===
    {
      delayMs: 200,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'muscle-relaxant',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'Muscle relaxant protocol item addressed',
    },

    // === PT referral (high risk path) ===
    {
      delayMs: 2000,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'ref-pt-001',
            category: 'referral',
            status: 'draft',
            displayText: 'Physical Therapy — core stabilization program',
            createdAt: new Date(),
            createdBy: { id: 'provider-001', name: 'Dr. Chen', role: 'provider' },
            data: {
              specialty: 'Physical Therapy',
              reason: 'Low back pain — core stabilization program',
              urgency: 'routine',
            },
            protocolRef: 'low-back-pain-v1:referral-pt',
          },
          source: { type: 'protocol' },
        },
      } as unknown as EncounterAction,
      description: 'PT referral added (high risk path item)',
    },

    // === Protocol item addressed: referral-pt ===
    {
      delayMs: 200,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'referral-pt',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'PT referral protocol item addressed',
    },

    // === ROM assessment ===
    {
      delayMs: 1500,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'assess-rom-001',
            category: 'assessment',
            status: 'confirmed',
            displayText: 'Lumbar ROM: 40/100 (limited flexion)',
            createdAt: new Date(),
            createdBy: { id: 'provider-001', name: 'Dr. Chen', role: 'provider' },
            data: {
              assessmentType: 'range-of-motion',
              label: 'Lumbar ROM',
              scale: { min: 0, max: 100 },
              value: 40,
              method: 'provider-assessed',
              bodyRegion: 'lumbar-spine',
            },
            protocolRef: 'low-back-pain-v1:rom-assess',
          },
          source: { type: 'protocol' },
        },
      } as unknown as EncounterAction,
      description: 'Lumbar ROM assessment added',
    },

    // === Protocol item addressed: rom-assess ===
    {
      delayMs: 200,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'rom-assess',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'ROM assessment protocol item addressed',
    },

    // === Skip imaging (not indicated per guidelines) ===
    {
      delayMs: 2000,
      action: {
        type: 'PROTOCOL_ITEM_SKIPPED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'imaging-xray',
          reason: 'Not indicated — acute LBP <6 weeks without red flags',
        },
      },
      description: 'X-ray skipped per guidelines',
    },

    {
      delayMs: 200,
      action: {
        type: 'PROTOCOL_ITEM_SKIPPED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'imaging-mri',
          reason: 'Not indicated — no progressive neurological deficit',
        },
      },
      description: 'MRI skipped per guidelines',
    },

    // === Skip pain management referral (PT first) ===
    {
      delayMs: 500,
      action: {
        type: 'PROTOCOL_ITEM_SKIPPED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'referral-pain-mgmt',
          reason: 'Trial conservative management first',
        },
      },
      description: 'Pain management referral skipped — trying PT first',
    },

    // === Education discussion ===
    {
      delayMs: 2500,
      action: {
        type: 'TRANSCRIPTION_SEGMENT_RECEIVED',
        payload: {
          segment: {
            id: segId(),
            text: 'Stay as active as you can — avoid prolonged bed rest. Apply ice or heat as needed. If pain gets worse or you develop numbness, weakness, or bladder issues, go to the ER.',
            startTime: 55,
            endTime: 63,
            confidence: 0.91,
            speaker: 'provider',
          },
        },
      },
      description: 'Provider gives education and return precautions',
    },

    // === Activity guidance acknowledged ===
    {
      delayMs: 1500,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'activity-guidance',
          addressedBy: { type: 'manual' },
        },
      },
      description: 'Activity modification guidance acknowledged',
    },

    // === Return precautions documented ===
    {
      delayMs: 500,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'return-precautions',
          addressedBy: { type: 'chart-item' },
        },
      },
      description: 'Return precautions auto-detected',
    },

    // === Follow-up order ===
    {
      delayMs: 1500,
      action: {
        type: 'ITEM_ADDED',
        payload: {
          item: {
            id: 'inst-followup-001',
            category: 'instruction',
            status: 'draft',
            displayText: 'Follow up in 2-4 weeks if symptoms persist or worsen',
            createdAt: new Date(),
            createdBy: { id: 'provider-001', name: 'Dr. Chen', role: 'provider' },
            data: {
              text: 'Follow up in 2-4 weeks if symptoms persist or worsen.',
              instructionType: 'follow-up',
              followUpInterval: '2-4 weeks',
            },
            protocolRef: 'low-back-pain-v1:followup-order',
          },
          source: { type: 'protocol' },
        },
      } as unknown as EncounterAction,
      description: 'Follow-up instruction added via protocol',
    },

    // === Protocol item addressed: followup-order ===
    {
      delayMs: 200,
      action: {
        type: 'PROTOCOL_ITEM_ADDRESSED',
        payload: {
          protocolId: PROTO_ID,
          itemId: 'followup-order',
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

    // === Protocol completed (all actionable items addressed/skipped) ===
    {
      delayMs: 1000,
      action: {
        type: 'PROTOCOL_COMPLETED',
        payload: { protocolId: PROTO_ID },
      },
      description: 'Protocol marked complete — all items addressed',
    },
  ],
};
