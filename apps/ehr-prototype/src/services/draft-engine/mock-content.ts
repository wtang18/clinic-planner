/**
 * Mock Draft Content
 *
 * Realistic narrative content for each note section,
 * used by the draft engine to simulate AI-generated drafts.
 */

import type { ItemCategory } from '../../types/chart-items';

/** Mock content keyed by note section category */
export const MOCK_DRAFT_CONTENT: Partial<Record<ItemCategory, string>> = {
  'chief-complaint':
    'Cough x 5 days, worse at night and when lying down. No improvement with OTC cough suppressants.',

  hpi:
    '42-year-old female presents with cough x 5 days. Cough is non-productive, worse at night and when lying down. ' +
    'Denies fever, shortness of breath, or chest pain. Reports mild sore throat and nasal congestion that preceded the cough. ' +
    'Tried OTC dextromethorphan without significant relief. No sick contacts. No recent travel. ' +
    'PMH significant for seasonal allergies and childhood asthma (no inhalers for 10+ years).',

  ros:
    'Constitutional: No fever, chills, fatigue, or weight changes.\n' +
    'HEENT: Mild sore throat, nasal congestion. No ear pain, vision changes.\n' +
    'Respiratory: Cough as noted in HPI. No shortness of breath, wheezing, or hemoptysis.\n' +
    'Cardiovascular: No chest pain, palpitations, or edema.\n' +
    'GI: No nausea, vomiting, diarrhea, or abdominal pain.\n' +
    'All other systems reviewed and negative.',

  'physical-exam':
    'General: Alert, well-appearing, no acute distress.\n' +
    'HEENT: Normocephalic, atraumatic. TMs clear bilaterally. Oropharynx mildly erythematous, no exudates. ' +
    'Nasal turbinates mildly edematous.\n' +
    'Neck: Supple, no lymphadenopathy.\n' +
    'Lungs: Clear to auscultation bilaterally. No wheezes, rhonchi, or rales. Good air movement.\n' +
    'Heart: Regular rate and rhythm. No murmurs, gallops, or rubs.\n' +
    'Abdomen: Soft, non-tender, non-distended.',

  plan:
    '1. Acute bronchitis (J20.9) — likely viral etiology\n' +
    '2. Benzonatate 100mg PO TID x 10 days for cough suppression\n' +
    '3. Supportive care: increased fluids, humidifier, honey for sore throat\n' +
    '4. Return precautions: worsening cough, fever >101°F, shortness of breath, symptoms >2 weeks\n' +
    '5. Follow up PRN or in 2 weeks if not improving',

  instruction:
    'Continue fluids and rest. Use humidifier at bedtime. Take benzonatate as prescribed — swallow whole, do not chew or crush. ' +
    'Return to clinic if you develop fever above 101°F, difficulty breathing, coughing up blood, ' +
    'or if symptoms worsen or do not improve within 2 weeks.',
};

/**
 * Get mock content for a given category.
 * Returns empty string for unsupported categories.
 */
export function getMockDraftContent(category: ItemCategory): string {
  return MOCK_DRAFT_CONTENT[category] || '';
}

/**
 * Get a confidence score for a given category (simulates AI confidence).
 */
export function getMockConfidence(category: ItemCategory): number {
  const scores: Partial<Record<ItemCategory, number>> = {
    'chief-complaint': 0.95,
    hpi: 0.88,
    ros: 0.82,
    'physical-exam': 0.85,
    plan: 0.78,
    instruction: 0.90,
  };
  return scores[category] || 0.75;
}
