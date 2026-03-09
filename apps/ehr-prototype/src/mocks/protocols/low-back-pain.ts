/**
 * Low Back Pain Evaluation Protocol Template
 *
 * 5 cards, ~15 items. Includes STarT Back severity scoring (4 inputs, 3 paths).
 * Conditional neuro exam items triggered by severity path.
 *
 * Clinical basis: ACP/APS Low Back Pain guidelines, STarT Back Screening Tool.
 */

import type { ProtocolTemplate } from '../../types/protocol';

export const LOW_BACK_PAIN_TEMPLATE: ProtocolTemplate = {
  id: 'low-back-pain-v1',
  name: 'Low Back Pain Evaluation',
  version: '1.0.0',
  description: 'Structured evaluation for acute/subacute low back pain per ACP/APS guidelines.',
  triggerConditions: [
    { type: 'cc-match', value: 'low back pain', confidenceThreshold: 1.0 },
    { type: 'cc-match', value: 'back pain', confidenceThreshold: 0.8 },
    { type: 'dx-match', value: 'M54.5', confidenceThreshold: 1.0 },
  ],
  autoExpandFirstCard: true,

  severityScoringModel: {
    name: 'STarT Back Screening Tool',
    inputs: [
      {
        id: 'pain-scale',
        label: 'Pain Scale (0–10)',
        source: 'assessment',
        assessmentType: 'pain-scale',
        weight: 1.0,
      },
      {
        id: 'functional-limitation',
        label: 'Functional Limitation Score',
        source: 'assessment',
        assessmentType: 'functional-limitation',
        weight: 1.5,
      },
      {
        id: 'fear-avoidance',
        label: 'Fear-Avoidance Score',
        source: 'assessment',
        assessmentType: 'fear-avoidance',
        weight: 1.0,
      },
      {
        id: 'catastrophizing',
        label: 'Catastrophizing Score',
        source: 'assessment',
        assessmentType: 'catastrophizing',
        weight: 0.5,
      },
    ],
    scoringLogic: { type: 'weighted-sum' },
    paths: [
      {
        id: 'mild',
        label: 'Low Risk',
        scoreRange: { min: 0, max: 10 },
        cardOverrides: [
          {
            cardId: 'diagnostics',
            itemOverrides: [
              { itemId: 'imaging-xray', pathState: 'de-emphasized' },
              { itemId: 'imaging-mri', pathState: 'de-emphasized' },
            ],
          },
        ],
      },
      {
        id: 'moderate',
        label: 'Medium Risk',
        scoreRange: { min: 11, max: 20 },
        cardOverrides: [],
      },
      {
        id: 'severe',
        label: 'High Risk',
        scoreRange: { min: 21, max: 40 },
        cardOverrides: [
          {
            cardId: 'treatment',
            itemOverrides: [
              { itemId: 'referral-pt', pathState: 'active' },
              { itemId: 'referral-pain-mgmt', pathState: 'active' },
            ],
          },
        ],
      },
    ],
  },

  cards: [
    // ── Card 1: History & Assessment ──
    {
      id: 'history-assessment',
      label: 'History & Assessment',
      description: 'Collect symptom history and administer screening tools.',
      stage: 'history-assessment',
      cardType: 'unordered',
      sortOrder: 0,
      items: [
        {
          id: 'pain-scale-assess',
          label: 'Pain Scale Assessment',
          description: 'Visual analog or numeric pain scale (0–10)',
          sortOrder: 0,
          conditionBehavior: 'hide',
          itemType: {
            type: 'orderable',
            chartCategory: 'assessment',
            defaultData: {
              assessmentType: 'pain-scale',
              label: 'Pain Scale',
              scale: { min: 0, max: 10 },
              value: null,
              method: 'patient-reported',
            },
            matchFields: ['assessmentType'],
          },
        },
        {
          id: 'functional-limitation-assess',
          label: 'Functional Limitation Assessment',
          description: 'Oswestry Disability Index or Roland-Morris Questionnaire',
          sortOrder: 1,
          conditionBehavior: 'hide',
          itemType: {
            type: 'orderable',
            chartCategory: 'assessment',
            defaultData: {
              assessmentType: 'functional-limitation',
              label: 'Functional Limitation Score',
              scale: { min: 0, max: 24 },
              value: null,
              method: 'patient-reported',
            },
            matchFields: ['assessmentType'],
          },
        },
        {
          id: 'hpi-onset-doc',
          label: 'Onset & Duration',
          description: 'Document onset timing, mechanism, and duration of symptoms.',
          sortOrder: 2,
          conditionBehavior: 'hide',
          itemType: {
            type: 'documentable',
            narrativeSection: 'hpi',
            detectionHints: ['started', 'began', 'onset', 'weeks ago', 'days ago'],
          },
        },
        {
          id: 'red-flags-guidance',
          label: 'Red Flag Screening',
          sortOrder: 3,
          conditionBehavior: 'hide',
          itemType: {
            type: 'guidance',
            prompt: 'Screen for: cauda equina symptoms, progressive neuro deficit, fracture risk (trauma, osteoporosis, steroid use), cancer history, infection signs (fever, IV drug use).',
            detectionHints: ['red flags', 'cauda equina', 'saddle anesthesia', 'bladder dysfunction'],
          },
        },
      ],
    },

    // ── Card 2: Examination ──
    {
      id: 'examination',
      label: 'Physical Examination',
      description: 'Focused musculoskeletal and neurological exam.',
      stage: 'examination',
      cardType: 'unordered',
      sortOrder: 1,
      items: [
        {
          id: 'rom-assess',
          label: 'Range of Motion Assessment',
          description: 'Lumbar flexion/extension ROM',
          sortOrder: 0,
          conditionBehavior: 'hide',
          itemType: {
            type: 'orderable',
            chartCategory: 'assessment',
            defaultData: {
              assessmentType: 'range-of-motion',
              label: 'Lumbar ROM',
              scale: { min: 0, max: 100 },
              value: null,
              method: 'provider-assessed',
              bodyRegion: 'lumbar-spine',
            },
            matchFields: ['assessmentType', 'bodyRegion'],
          },
        },
        {
          id: 'slr-doc',
          label: 'Straight Leg Raise Test',
          description: 'Bilateral SLR for radiculopathy assessment.',
          sortOrder: 1,
          conditionBehavior: 'hide',
          itemType: {
            type: 'documentable',
            narrativeSection: 'physical-exam',
            detectionHints: ['straight leg raise', 'SLR', 'positive', 'negative', 'radiculopathy'],
          },
        },
        {
          id: 'neuro-screening',
          label: 'Neurological Screening',
          description: 'Strength, sensation, reflexes in lower extremities.',
          sortOrder: 2,
          conditionBehavior: 'show-inactive',
          condition: {
            source: 'chart-state',
            field: 'severity.selectedPathId',
            operator: 'equals',
            value: 'severe',
          },
          itemType: {
            type: 'orderable',
            chartCategory: 'assessment',
            defaultData: {
              assessmentType: 'neuro-screening',
              label: 'Neuro Screening — Lower Extremities',
              scale: { min: 0, max: 5 },
              value: null,
              method: 'provider-assessed',
            },
            matchFields: ['assessmentType'],
          },
        },
      ],
    },

    // ── Card 3: Diagnostics ──
    {
      id: 'diagnostics',
      label: 'Diagnostics',
      description: 'Imaging and lab orders based on clinical presentation.',
      stage: 'diagnostics',
      cardType: 'unordered',
      sortOrder: 2,
      items: [
        {
          id: 'imaging-xray',
          label: 'Lumbar X-ray',
          description: 'AP and lateral views. Consider if >50yo, trauma, or prolonged symptoms.',
          sortOrder: 0,
          conditionBehavior: 'show-inactive',
          condition: {
            source: 'chart-state',
            field: 'severity.selectedPathId',
            operator: 'not-exists',
          },
          itemType: {
            type: 'orderable',
            chartCategory: 'imaging',
            defaultData: {
              studyType: 'X-ray',
              bodyPart: 'Lumbar spine',
              indication: 'Low back pain evaluation — AP and lateral views',
            },
            matchFields: ['studyType', 'bodyPart'],
          },
        },
        {
          id: 'imaging-mri',
          label: 'Lumbar MRI',
          description: 'Without contrast. Consider for radiculopathy, progressive deficit, or failed conservative treatment.',
          sortOrder: 1,
          conditionBehavior: 'show-inactive',
          condition: {
            source: 'chart-state',
            field: 'severity.selectedPathId',
            operator: 'equals',
            value: 'severe',
          },
          itemType: {
            type: 'orderable',
            chartCategory: 'imaging',
            defaultData: {
              studyType: 'MRI',
              bodyPart: 'Lumbar spine',
              indication: 'Low back pain with radicular symptoms — without contrast',
            },
            matchFields: ['studyType', 'bodyPart'],
          },
        },
        {
          id: 'no-imaging-advisory',
          label: 'Imaging typically not indicated in first 6 weeks without red flags',
          sortOrder: 2,
          conditionBehavior: 'hide',
          itemType: {
            type: 'advisory',
            severity: 'info',
            persistent: true,
          },
        },
      ],
    },

    // ── Card 4: Treatment ──
    {
      id: 'treatment',
      label: 'Treatment Plan',
      description: 'Pharmacologic and non-pharmacologic interventions.',
      stage: 'treatment',
      cardType: 'unordered',
      sortOrder: 3,
      items: [
        {
          id: 'nsaid-order',
          label: 'NSAID (Ibuprofen 600mg TID)',
          description: 'First-line pharmacotherapy for acute LBP.',
          sortOrder: 0,
          conditionBehavior: 'hide',
          itemType: {
            type: 'orderable',
            chartCategory: 'medication',
            defaultData: {
              drugName: 'Ibuprofen',
              dosage: '600mg',
              frequency: 'TID',
              duration: '14 days',
              route: 'oral',
            },
            matchFields: ['drugName'],
          },
        },
        {
          id: 'muscle-relaxant',
          label: 'Muscle Relaxant (Cyclobenzaprine 10mg)',
          description: 'Short-term adjunct for muscle spasm.',
          sortOrder: 1,
          conditionBehavior: 'hide',
          itemType: {
            type: 'orderable',
            chartCategory: 'medication',
            defaultData: {
              drugName: 'Cyclobenzaprine',
              dosage: '10mg',
              frequency: 'TID PRN',
              duration: '7 days',
              route: 'oral',
            },
            matchFields: ['drugName'],
          },
        },
        {
          id: 'referral-pt',
          label: 'Physical Therapy Referral',
          description: 'Structured PT program — core stabilization focus.',
          sortOrder: 2,
          conditionBehavior: 'hide',
          itemType: {
            type: 'orderable',
            chartCategory: 'referral',
            defaultData: {
              specialty: 'Physical Therapy',
              reason: 'Low back pain — core stabilization program',
              urgency: 'routine',
            },
            matchFields: ['specialty'],
          },
        },
        {
          id: 'referral-pain-mgmt',
          label: 'Pain Management Referral',
          description: 'Consider for high-risk or refractory cases.',
          sortOrder: 3,
          conditionBehavior: 'show-inactive',
          condition: {
            source: 'chart-state',
            field: 'severity.selectedPathId',
            operator: 'equals',
            value: 'severe',
          },
          itemType: {
            type: 'orderable',
            chartCategory: 'referral',
            defaultData: {
              specialty: 'Pain Management',
              reason: 'Refractory low back pain — evaluation for interventional options',
              urgency: 'routine',
            },
            matchFields: ['specialty'],
          },
        },
        {
          id: 'nsaid-gi-advisory',
          label: 'Monitor for GI side effects with NSAID use',
          sortOrder: 4,
          conditionBehavior: 'hide',
          itemType: {
            type: 'advisory',
            severity: 'warning',
            persistent: true,
          },
        },
      ],
    },

    // ── Card 5: Education & Follow-up ──
    {
      id: 'education-followup',
      label: 'Education & Follow-up',
      description: 'Patient education and return precautions.',
      stage: 'education',
      cardType: 'unordered',
      sortOrder: 4,
      items: [
        {
          id: 'activity-guidance',
          label: 'Activity Modification Counseling',
          sortOrder: 0,
          conditionBehavior: 'hide',
          itemType: {
            type: 'guidance',
            prompt: 'Counsel patient: remain active, avoid prolonged bed rest. Gradual return to normal activities. Apply heat/ice PRN.',
            detectionHints: ['stay active', 'avoid bed rest', 'activity modification'],
          },
        },
        {
          id: 'return-precautions',
          label: 'Return Precautions',
          sortOrder: 1,
          conditionBehavior: 'hide',
          itemType: {
            type: 'documentable',
            narrativeSection: 'plan',
            detectionHints: ['return if', 'worsening', 'emergency', 'numbness', 'weakness', 'bowel', 'bladder'],
          },
        },
        {
          id: 'followup-order',
          label: 'Follow-up Visit (2–4 weeks)',
          description: 'Reassess if not improving.',
          sortOrder: 2,
          conditionBehavior: 'hide',
          itemType: {
            type: 'orderable',
            chartCategory: 'instruction',
            defaultData: {
              text: 'Follow up in 2-4 weeks if symptoms persist or worsen.',
              instructionType: 'follow-up',
              followUpInterval: '2-4 weeks',
            },
            matchFields: [],
          },
        },
      ],
    },
  ],
};
