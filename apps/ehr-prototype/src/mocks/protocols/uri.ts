/**
 * Upper Respiratory Infection Protocol Template
 *
 * 3 cards, ~8 items. No severity scoring.
 * Antibiotic conditional on duration >10 days (conditionBehavior: 'show-inactive').
 *
 * Clinical basis: IDSA acute rhinosinusitis guidelines, CDC antibiotic stewardship.
 */

import type { ProtocolTemplate } from '../../types/protocol';

export const URI_TEMPLATE: ProtocolTemplate = {
  id: 'uri-v1',
  name: 'Upper Respiratory Infection',
  version: '1.0.0',
  description: 'Evaluation and management of acute URI per IDSA/CDC guidelines.',
  triggerConditions: [
    { type: 'cc-match', value: 'cold symptoms', confidenceThreshold: 0.8 },
    { type: 'cc-match', value: 'cough', confidenceThreshold: 0.7 },
    { type: 'cc-match', value: 'sore throat', confidenceThreshold: 0.7 },
    { type: 'cc-match', value: 'nasal congestion', confidenceThreshold: 0.8 },
    { type: 'dx-match', value: 'J06.9', confidenceThreshold: 1.0 },
  ],
  autoExpandFirstCard: true,

  cards: [
    // ── Card 1: Assessment ──
    {
      id: 'assessment',
      label: 'Assessment',
      description: 'Symptom characterization and duration.',
      stage: 'history-assessment',
      cardType: 'unordered',
      sortOrder: 0,
      items: [
        {
          id: 'symptom-duration-doc',
          label: 'Symptom Duration',
          description: 'Document onset, duration, and trajectory of URI symptoms.',
          sortOrder: 0,
          conditionBehavior: 'hide',
          itemType: {
            type: 'documentable',
            narrativeSection: 'hpi',
            detectionHints: ['started', 'days', 'weeks', 'getting worse', 'getting better', 'duration'],
          },
        },
        {
          id: 'strep-screening-guidance',
          label: 'Strep Screening Consideration',
          sortOrder: 1,
          conditionBehavior: 'hide',
          itemType: {
            type: 'guidance',
            prompt: 'If sore throat is primary complaint, apply Centor criteria: fever, tonsillar exudate, tender anterior cervical lymphadenopathy, absence of cough. Score ≥3 → rapid strep test.',
            detectionHints: ['centor', 'strep', 'sore throat', 'tonsillar'],
          },
        },
        {
          id: 'viral-advisory',
          label: 'Most URIs are viral — antibiotics not indicated for uncomplicated cases',
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

    // ── Card 2: Treatment ──
    {
      id: 'treatment',
      label: 'Symptomatic Treatment',
      description: 'Supportive and symptomatic management.',
      stage: 'treatment',
      cardType: 'unordered',
      sortOrder: 1,
      items: [
        {
          id: 'otc-guidance',
          label: 'OTC Symptomatic Relief',
          sortOrder: 0,
          conditionBehavior: 'hide',
          itemType: {
            type: 'guidance',
            prompt: 'Recommend: rest, fluids, honey for cough (>1yo), saline nasal irrigation, acetaminophen/ibuprofen for pain/fever. Avoid decongestants >3 days.',
            detectionHints: ['fluids', 'rest', 'honey', 'saline', 'tylenol', 'ibuprofen'],
          },
        },
        {
          id: 'antibiotic-order',
          label: 'Amoxicillin 500mg TID',
          description: 'Only if bacterial sinusitis suspected: symptoms >10 days, or severe onset, or worsening after initial improvement.',
          sortOrder: 1,
          conditionBehavior: 'show-inactive',
          condition: {
            source: 'chart-state',
            field: 'symptomDuration',
            operator: 'gt',
            value: 10,
          },
          itemType: {
            type: 'orderable',
            chartCategory: 'medication',
            defaultData: {
              drugName: 'Amoxicillin',
              dosage: '500mg',
              frequency: 'TID',
              duration: '10 days',
              route: 'oral',
            },
            matchFields: ['drugName'],
          },
        },
        {
          id: 'antibiotic-stewardship-advisory',
          label: 'Antibiotics increase resistance risk and have side effects — use only when clearly indicated',
          sortOrder: 2,
          conditionBehavior: 'hide',
          itemType: {
            type: 'advisory',
            severity: 'warning',
            persistent: true,
          },
        },
      ],
    },

    // ── Card 3: Follow-up ──
    {
      id: 'followup',
      label: 'Education & Follow-up',
      description: 'Patient education and return precautions.',
      stage: 'education',
      cardType: 'unordered',
      sortOrder: 2,
      items: [
        {
          id: 'return-precautions-doc',
          label: 'Return Precautions',
          description: 'Document return instructions.',
          sortOrder: 0,
          conditionBehavior: 'hide',
          itemType: {
            type: 'documentable',
            narrativeSection: 'plan',
            detectionHints: ['return if', 'worsening', 'high fever', 'difficulty breathing', 'not improving'],
          },
        },
        {
          id: 'followup-instruction',
          label: 'Follow-up if Not Improving (7–10 days)',
          description: 'Reassess if symptoms persist beyond expected viral course.',
          sortOrder: 1,
          conditionBehavior: 'hide',
          itemType: {
            type: 'orderable',
            chartCategory: 'instruction',
            defaultData: {
              text: 'Follow up in 7-10 days if symptoms are not improving or worsening.',
              instructionType: 'follow-up',
              followUpInterval: '7-10 days',
            },
            matchFields: [],
          },
        },
      ],
    },
  ],
};
