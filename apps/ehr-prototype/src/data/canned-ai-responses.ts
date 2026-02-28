/**
 * Canned AI Responses
 *
 * Static data mapping query strings to AI response objects, keyed by scenario ID.
 * Used by useAIConversation to simulate AI interactions in the demo.
 */

import type { ChartItem } from '../types/chart-items';

// ============================================================================
// Types
// ============================================================================

export interface CannedQuery {
  id: string;
  text: string;
  shortLabel?: string;
}

export interface FollowUpAction {
  id: string;
  label: string;
  chartItem?: Partial<ChartItem>;
}

export interface CannedResponse {
  queryId: string;
  content: string;
  followUpActions?: FollowUpAction[];
  delay?: number;
}

export interface ScenarioAIData {
  scenarioId: string;
  queries: CannedQuery[];
  responses: Record<string, CannedResponse>;
  fallbackResponse: CannedResponse;
}

// ============================================================================
// Quick Action → Query Mapping
// ============================================================================

/** Maps quick action IDs to the canned query ID they trigger */
export const QUICK_ACTION_TO_QUERY: Record<string, string> = {
  'review-chart': 'guidelines',
  'suggest-orders': 'suggest-orders',
  'summarize-visit': 'summarize',
  'check-interactions': 'check-interactions',
};

// ============================================================================
// UC Cough Scenario
// ============================================================================

const UC_COUGH: ScenarioAIData = {
  scenarioId: 'uc-cough',
  queries: [
    {
      id: 'guidelines',
      text: 'What are the current guidelines for acute bronchitis?',
      shortLabel: 'Guidelines',
    },
    {
      id: 'suggest-orders',
      text: 'Suggest orders for this visit',
      shortLabel: 'Suggest orders',
    },
    {
      id: 'check-interactions',
      text: 'Check for drug interactions',
      shortLabel: 'Check interactions',
    },
    {
      id: 'summarize',
      text: 'Summarize this visit',
      shortLabel: 'Summarize',
    },
    {
      id: 'antibiotics',
      text: 'Are antibiotics indicated?',
      shortLabel: 'Antibiotics?',
    },
    {
      id: 'follow-up',
      text: 'What follow-up is appropriate?',
      shortLabel: 'Follow-up',
    },
  ],
  responses: {
    guidelines: {
      queryId: 'guidelines',
      content:
        'ACP/AAFP Guidelines for Acute Bronchitis:\n\n' +
        '\u2022 Acute bronchitis is almost always viral — antibiotics are NOT recommended for uncomplicated cases\n' +
        '\u2022 Symptomatic treatment is first-line:\n' +
        '  \u2013 Benzonatate 100mg TID for cough suppression\n' +
        '  \u2013 Guaifenesin 400mg q4h PRN for mucus clearance\n' +
        '  \u2013 NSAIDs or acetaminophen for associated discomfort\n' +
        '\u2022 Honey (1 tbsp) may reduce nighttime cough severity\n' +
        '\u2022 Chest X-ray only if red flags: fever >101.5\u00b0F persisting >3 days, hemoptysis, tachypnea, or suspected pneumonia\n' +
        '\u2022 Expected duration: cough may persist 2\u20133 weeks even with treatment',
      followUpActions: [
        {
          id: 'add-benzonatate',
          label: '+ Add Benzonatate 100mg',
          chartItem: {
            category: 'medication',
            displayText: 'Benzonatate 100mg capsule',
            displaySubtext: '100mg PO TID PRN cough \u00b7 #30 \u00b7 0 refills',
            intent: 'prescribe',
            data: {
              drugName: 'Benzonatate',
              dosage: '100 mg',
              form: 'capsule',
              route: 'oral',
              frequency: 'TID',
              quantity: 30,
              refills: 0,
              isControlled: false,
              prescriptionType: 'new' as const,
              instructions: 'Take 1 capsule by mouth three times daily as needed for cough. Swallow whole — do not crush or chew.',
            },
          } as Partial<ChartItem>,
        },
        {
          id: 'add-patient-instructions',
          label: '+ Add patient instructions',
          chartItem: {
            category: 'instruction',
            displayText: 'Acute bronchitis — supportive care instructions',
            intent: 'draft',
            data: {
              text: 'Rest and increase fluid intake. Use a humidifier. Honey (1 tbsp) may help nighttime cough. Avoid irritants (smoke, dust). Return if symptoms worsen or do not improve within 2 weeks.',
              instructionType: 'discharge' as const,
              printable: true,
            },
          } as Partial<ChartItem>,
        },
      ],
      delay: 900,
    },
    'suggest-orders': {
      queryId: 'suggest-orders',
      content:
        'Recommended orders for this visit:\n\n' +
        'Diagnosis:\n' +
        '\u2022 J20.9 — Acute bronchitis, unspecified\n\n' +
        'Medications:\n' +
        '\u2022 Benzonatate 100mg PO TID PRN cough (#30, 0 refills)\n' +
        '\u2022 Guaifenesin 400mg PO q4h PRN congestion (OTC)\n\n' +
        'Patient Instructions:\n' +
        '\u2022 Supportive care: rest, fluids, humidifier, honey for nighttime cough\n' +
        '\u2022 Return precautions for worsening symptoms\n\n' +
        'Conditional:\n' +
        '\u2022 CXR PA/Lateral — if no improvement in 10\u201314 days or new red flags',
      followUpActions: [
        {
          id: 'add-dx-bronchitis',
          label: '+ Add Dx: Acute bronchitis',
          chartItem: {
            category: 'diagnosis',
            displayText: 'Acute bronchitis, unspecified',
            displaySubtext: 'J20.9',
            intent: 'assess',
            data: {
              icdCode: 'J20.9',
              description: 'Acute bronchitis, unspecified',
              type: 'encounter' as const,
              clinicalStatus: 'active' as const,
            },
          } as Partial<ChartItem>,
        },
        {
          id: 'add-benzonatate-2',
          label: '+ Add Benzonatate 100mg',
          chartItem: {
            category: 'medication',
            displayText: 'Benzonatate 100mg capsule',
            displaySubtext: '100mg PO TID PRN cough \u00b7 #30 \u00b7 0 refills',
            intent: 'prescribe',
            data: {
              drugName: 'Benzonatate',
              dosage: '100 mg',
              form: 'capsule',
              route: 'oral',
              frequency: 'TID',
              quantity: 30,
              refills: 0,
              isControlled: false,
              prescriptionType: 'new' as const,
              instructions: 'Take 1 capsule by mouth three times daily as needed for cough.',
            },
          } as Partial<ChartItem>,
        },
        {
          id: 'add-instructions-2',
          label: '+ Add care instructions',
          chartItem: {
            category: 'instruction',
            displayText: 'Acute bronchitis — supportive care & return precautions',
            intent: 'draft',
            data: {
              text: 'Rest, increase fluid intake, use humidifier. Return if: fever >101.5\u00b0F, coughing blood, difficulty breathing, or symptoms not improving after 2 weeks.',
              instructionType: 'discharge' as const,
              printable: true,
            },
          } as Partial<ChartItem>,
        },
      ],
      delay: 1000,
    },
    'check-interactions': {
      queryId: 'check-interactions',
      content:
        'Drug Interaction Review:\n\n' +
        'Proposed: Benzonatate 100mg TID\n' +
        'Current medications: (none documented for this visit)\n\n' +
        '\u2705 No significant drug interactions identified.\n\n' +
        'Note: Benzonatate has a CNS depression risk. If the patient takes any sedatives, antihistamines, or opioids, additive drowsiness is possible. Verify medication reconciliation is complete before finalizing.',
      delay: 700,
    },
    summarize: {
      queryId: 'summarize',
      content:
        'Visit Summary:\n\n' +
        'Chief Complaint: Cough \u00d7 5 days\n\n' +
        'HPI: Patient presents with a 5-day history of persistent dry cough, gradually becoming productive with clear sputum. Associated with mild chest tightness and post-nasal drip. Denies fever, hemoptysis, dyspnea at rest, or sick contacts. No history of asthma or COPD.\n\n' +
        'Exam: Lungs with scattered rhonchi bilaterally, no wheezes or crackles. Oropharynx with mild post-nasal drip. No cervical lymphadenopathy. Vitals within normal limits, afebrile.\n\n' +
        'Assessment: Acute bronchitis (J20.9) — likely viral etiology\n\n' +
        'Plan:\n' +
        '\u2022 Benzonatate 100mg TID PRN cough\n' +
        '\u2022 Supportive care: rest, fluids, humidifier\n' +
        '\u2022 Return in 2 weeks if not improving, sooner if red flags\n' +
        '\u2022 CXR if symptoms persist beyond 2 weeks',
      followUpActions: [
        {
          id: 'copy-summary',
          label: 'Copy to clipboard',
        },
      ],
      delay: 1200,
    },
    antibiotics: {
      queryId: 'antibiotics',
      content:
        'Antibiotics are NOT indicated for this presentation.\n\n' +
        'Evidence:\n' +
        '\u2022 90\u201395% of acute bronchitis cases are viral in etiology\n' +
        '\u2022 Cochrane review: NNT = 17 for modest symptom reduction with antibiotics, vs NNH = 5 for GI side effects\n' +
        '\u2022 ACP strongly recommends against routine antibiotic use (Grade: Strong, Evidence: High)\n\n' +
        'Reconsider antibiotics if:\n' +
        '\u2022 Purulent sputum persisting >10 days (suggests bacterial superinfection)\n' +
        '\u2022 Fever >101.5\u00b0F developing after initial improvement\n' +
        '\u2022 Underlying COPD with acute exacerbation features\n' +
        '\u2022 Immunocompromised patient\n\n' +
        'If antibiotics become indicated: Azithromycin 500mg day 1, then 250mg days 2\u20135 is first-line for outpatient bacterial bronchitis.',
      delay: 800,
    },
    'follow-up': {
      queryId: 'follow-up',
      content:
        'Recommended Follow-Up:\n\n' +
        'Timeline:\n' +
        '\u2022 Most symptoms resolve within 1\u20133 weeks\n' +
        '\u2022 Cough may persist up to 3 weeks — this is normal and does not indicate treatment failure\n\n' +
        'Return Precautions (instruct patient to return sooner if):\n' +
        '\u2022 Hemoptysis (coughing blood)\n' +
        '\u2022 Fever >101.5\u00b0F persisting or developing after initial improvement\n' +
        '\u2022 Increasing dyspnea or chest pain\n' +
        '\u2022 Symptoms worsening after initial improvement\n\n' +
        'If not improving at 2 weeks:\n' +
        '\u2022 Obtain CXR PA/Lateral to rule out pneumonia\n' +
        '\u2022 Consider alternative diagnoses: asthma, GERD, post-nasal drip, pertussis\n' +
        '\u2022 Consider PFTs if recurrent cough episodes',
      followUpActions: [
        {
          id: 'add-follow-up-instruction',
          label: '+ Add follow-up instruction',
          chartItem: {
            category: 'instruction',
            displayText: 'Follow-up in 2 weeks if symptoms persist',
            intent: 'draft',
            data: {
              text: 'Return in 2 weeks if cough has not improved. Return sooner if: coughing blood, fever >101.5\u00b0F, worsening shortness of breath, or symptoms worsening after initial improvement.',
              instructionType: 'follow-up' as const,
              followUpInterval: '2 weeks',
              printable: true,
            },
          } as Partial<ChartItem>,
        },
      ],
      delay: 800,
    },
  },
  fallbackResponse: {
    queryId: '_fallback',
    content:
      'This query isn\u2019t available in the demo. Try one of the preset queries \u2014 use \u2191/\u2193 arrows to cycle through available options.',
    delay: 500,
  },
};

// ============================================================================
// Scenario Registry
// ============================================================================

const SCENARIOS: Record<string, ScenarioAIData> = {
  'uc-cough': UC_COUGH,
};

export function getScenarioData(scenarioId: string): ScenarioAIData | undefined {
  return SCENARIOS[scenarioId];
}
