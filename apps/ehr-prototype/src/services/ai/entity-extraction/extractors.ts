/**
 * Entity Extractors
 *
 * Functions for extracting medical entities from text.
 * Uses regex patterns for initial extraction - production would use NLP/LLM.
 */

import type { ExtractedEntity, EntityType } from '../../../types';
import type {
  EntityExtractionConfig,
  ExtractionContext,
  ExtractionResult,
  NormalizedMedication,
  NormalizedDiagnosis,
  NormalizedSymptom,
  NormalizedVital,
  NormalizedLabTest,
} from './types';
import { DEFAULT_ENTITY_EXTRACTION_CONFIG } from './types';

// ============================================================================
// Main Extraction Function
// ============================================================================

/**
 * Extract entities from text using configured extractors
 */
export async function extractEntities(
  text: string,
  context: ExtractionContext,
  config: EntityExtractionConfig = DEFAULT_ENTITY_EXTRACTION_CONFIG
): Promise<ExtractionResult> {
  const startTime = Date.now();
  const entities: ExtractedEntity[] = [];

  // Run enabled extractors
  if (config.enabledEntityTypes.includes('medication')) {
    entities.push(...extractMedications(text));
  }
  if (config.enabledEntityTypes.includes('diagnosis')) {
    entities.push(...extractDiagnoses(text));
  }
  if (config.enabledEntityTypes.includes('symptom')) {
    entities.push(...extractSymptoms(text));
  }
  if (config.enabledEntityTypes.includes('vital-sign')) {
    entities.push(...extractVitals(text));
  }
  if (config.enabledEntityTypes.includes('lab-test')) {
    entities.push(...extractLabTests(text));
  }
  if (config.enabledEntityTypes.includes('duration')) {
    entities.push(...extractDurations(text));
  }
  if (config.enabledEntityTypes.includes('body-part')) {
    entities.push(...extractBodyParts(text));
  }
  if (config.enabledEntityTypes.includes('allergy')) {
    entities.push(...extractAllergies(text));
  }

  // Filter by minimum confidence
  const filteredEntities = entities.filter(
    (e) => e.confidence >= config.minConfidence
  );

  // Deduplicate against existing items
  const dedupedEntities = deduplicateEntities(
    filteredEntities,
    context.existingItems
  );

  return {
    entities: dedupedEntities,
    processingTimeMs: Date.now() - startTime,
    modelUsed: 'regex-v1',
  };
}

// ============================================================================
// Entity-Specific Extractors
// ============================================================================

/**
 * Extract medication mentions from text
 */
export function extractMedications(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const lowerText = text.toLowerCase();

  // Common medication patterns
  const medicationPatterns = [
    // Drug name with dosage
    /\b(metformin|lisinopril|atorvastatin|omeprazole|amlodipine|metoprolol|losartan|gabapentin|hydrochlorothiazide|sertraline|fluoxetine|alprazolam|ibuprofen|acetaminophen|aspirin|warfarin|prednisone|amoxicillin|azithromycin|ciprofloxacin|levothyroxine|albuterol|montelukast|pantoprazole|escitalopram|duloxetine|trazodone|furosemide|carvedilol|clopidogrel)\s*(?:(\d+)\s*(mg|mcg|ml))?\b/gi,
    // Generic "taking X" pattern
    /(?:taking|on|prescribed|started)\s+(\w+(?:\s+\d+\s*(?:mg|mcg|ml))?)/gi,
    // Mucinex, Tylenol, etc.
    /\b(mucinex|tylenol|advil|motrin|benadryl|zyrtec|claritin|nexium|prilosec|pepcid|tums|robitussin)\b/gi,
  ];

  for (const pattern of medicationPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const drugName = match[1];
      if (drugName && drugName.length > 2) {
        entities.push({
          type: 'medication',
          text: match[0],
          span: [match.index, match.index + match[0].length],
          confidence: calculateConfidence(drugName, KNOWN_MEDICATIONS),
          normalizedValue: normalizeMedication(match[0]),
        });
      }
    }
  }

  return deduplicateBySpan(entities);
}

/**
 * Extract diagnosis mentions from text
 */
export function extractDiagnoses(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];

  // Common diagnosis patterns
  const diagnosisPatterns = [
    /\b(diabetes|hypertension|high blood pressure|asthma|copd|pneumonia|bronchitis|heart failure|atrial fibrillation|a-?fib|hyperlipidemia|high cholesterol|depression|anxiety|gerd|acid reflux|arthritis|osteoporosis|hypothyroidism|uti|urinary tract infection|sinusitis|strep throat|covid|coronavirus)\b/gi,
    /\b(type\s*[12]\s*diabetes|dm\s*[12]?)\b/gi,
  ];

  for (const pattern of diagnosisPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: 'diagnosis',
        text: match[0],
        span: [match.index, match.index + match[0].length],
        confidence: calculateConfidence(match[0].toLowerCase(), KNOWN_DIAGNOSES),
        normalizedValue: normalizeDiagnosis(match[0]),
      });
    }
  }

  return deduplicateBySpan(entities);
}

/**
 * Extract symptom mentions from text
 */
export function extractSymptoms(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];

  const symptomPatterns = [
    /\b(cough(?:ing)?|fever|headache|nausea|vomiting|diarrhea|fatigue|tired|weakness|dizziness|shortness of breath|chest pain|back pain|abdominal pain|sore throat|runny nose|congestion|wheezing|rash|itching|swelling|numbness|tingling|blurry vision|palpitations|insomnia|weight loss|weight gain|loss of appetite|night sweats|chills)\b/gi,
    /\b(can'?t\s+sleep|trouble\s+sleeping|difficulty\s+breathing|hard\s+to\s+breathe)\b/gi,
  ];

  for (const pattern of symptomPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: 'symptom',
        text: match[0],
        span: [match.index, match.index + match[0].length],
        confidence: 0.85,
        normalizedValue: normalizeSymptom(match[0]),
      });
    }
  }

  return deduplicateBySpan(entities);
}

/**
 * Extract vital sign values from text
 */
export function extractVitals(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];

  // Blood pressure
  const bpMatch = text.match(/\b(\d{2,3})\s*[\/over]\s*(\d{2,3})\b/i);
  if (bpMatch) {
    const systolic = parseInt(bpMatch[1]);
    const diastolic = parseInt(bpMatch[2]);
    if (systolic >= 70 && systolic <= 250 && diastolic >= 40 && diastolic <= 150) {
      entities.push({
        type: 'vital-sign',
        text: bpMatch[0],
        span: [bpMatch.index!, bpMatch.index! + bpMatch[0].length],
        confidence: 0.9,
        normalizedValue: {
          type: 'bp',
          value: systolic,
          secondaryValue: diastolic,
          unit: 'mmHg',
        } as NormalizedVital,
      });
    }
  }

  // Temperature
  const tempPatterns = [
    /\b(\d{2,3}(?:\.\d)?)\s*(?:degrees?\s*)?(?:fahrenheit|f)\b/gi,
    /\btemp(?:erature)?\s*(?:of|is|was)?\s*(\d{2,3}(?:\.\d)?)\b/gi,
  ];
  for (const pattern of tempPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const temp = parseFloat(match[1]);
      if (temp >= 95 && temp <= 108) {
        entities.push({
          type: 'vital-sign',
          text: match[0],
          span: [match.index, match.index + match[0].length],
          confidence: 0.85,
          normalizedValue: {
            type: 'temp',
            value: temp,
            unit: 'F',
          } as NormalizedVital,
        });
      }
    }
  }

  // Heart rate / Pulse
  const pulseMatch = text.match(/\b(?:pulse|heart\s*rate|hr)\s*(?:of|is|was)?\s*(\d{2,3})\b/i);
  if (pulseMatch) {
    const pulse = parseInt(pulseMatch[1]);
    if (pulse >= 30 && pulse <= 250) {
      entities.push({
        type: 'vital-sign',
        text: pulseMatch[0],
        span: [pulseMatch.index!, pulseMatch.index! + pulseMatch[0].length],
        confidence: 0.85,
        normalizedValue: {
          type: 'pulse',
          value: pulse,
          unit: 'bpm',
        } as NormalizedVital,
      });
    }
  }

  return entities;
}

/**
 * Extract lab test mentions from text
 */
export function extractLabTests(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];

  const labPatterns = [
    /\b(cbc|complete blood count|bmp|basic metabolic panel|cmp|comprehensive metabolic panel|lipid panel|a1c|hemoglobin a1c|hba1c|tsh|urinalysis|ua|urine culture|blood culture|chest x-?ray|cxr|ct scan|mri|ekg|ecg|electrocardiogram)\b/gi,
    /\b(glucose|sodium|potassium|creatinine|bun|wbc|white blood count|rbc|red blood count|hemoglobin|hematocrit|platelets|cholesterol|ldl|hdl|triglycerides)\b/gi,
    /\b(microalbumin|albumin creatinine ratio|gfr|liver function|lfts|renal function)\b/gi,
  ];

  for (const pattern of labPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: 'lab-test',
        text: match[0],
        span: [match.index, match.index + match[0].length],
        confidence: 0.9,
        normalizedValue: normalizeLabTest(match[0]),
      });
    }
  }

  return deduplicateBySpan(entities);
}

/**
 * Extract duration mentions from text
 */
export function extractDurations(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];

  const durationPatterns = [
    /\b(\d+)\s*(days?|weeks?|months?|years?|hours?)\b/gi,
    /\b(a\s+(?:few|couple(?:\s+of)?)\s+(?:days?|weeks?|months?))\b/gi,
    /\b(since\s+(?:yesterday|last\s+week|last\s+month))\b/gi,
  ];

  for (const pattern of durationPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: 'duration',
        text: match[0],
        span: [match.index, match.index + match[0].length],
        confidence: 0.9,
        normalizedValue: match[0],
      });
    }
  }

  return entities;
}

/**
 * Extract body part mentions from text
 */
export function extractBodyParts(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];

  const bodyPartPatterns = [
    /\b(head|neck|throat|chest|back|abdomen|stomach|arm|leg|knee|ankle|foot|feet|hand|shoulder|hip|wrist|elbow|ear|eye|nose|mouth|lungs?|heart|liver|kidney|skin|lower back|upper back)\b/gi,
    /\b(left|right)\s+(arm|leg|knee|ankle|foot|hand|shoulder|hip|wrist|elbow|ear|eye|side)\b/gi,
  ];

  for (const pattern of bodyPartPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: 'body-part',
        text: match[0],
        span: [match.index, match.index + match[0].length],
        confidence: 0.85,
        normalizedValue: match[0].toLowerCase(),
      });
    }
  }

  return deduplicateBySpan(entities);
}

/**
 * Extract allergy mentions from text
 */
export function extractAllergies(text: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];

  const allergyPatterns = [
    /\b(?:allergic\s+to|allergy\s+to)\s+(\w+(?:\s+\w+)?)/gi,
    /\b(penicillin|sulfa|codeine|morphine|latex|peanut|shellfish|bee\s+sting)\s+allergy\b/gi,
  ];

  for (const pattern of allergyPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        type: 'allergy',
        text: match[0],
        span: [match.index, match.index + match[0].length],
        confidence: 0.9,
        normalizedValue: match[1]?.toLowerCase() || match[0].toLowerCase(),
      });
    }
  }

  return entities;
}

// ============================================================================
// Normalization Functions
// ============================================================================

/**
 * Normalize a medication mention
 */
export function normalizeMedication(text: string): NormalizedMedication | null {
  const lower = text.toLowerCase();

  // Extract drug name
  let name = lower;
  let dosage: string | undefined;
  let route: string | undefined;
  let frequency: string | undefined;

  // Extract dosage
  const dosageMatch = text.match(/(\d+)\s*(mg|mcg|ml)/i);
  if (dosageMatch) {
    dosage = `${dosageMatch[1]} ${dosageMatch[2].toLowerCase()}`;
    name = name.replace(dosageMatch[0].toLowerCase(), '').trim();
  }

  // Look up RxNorm
  const rxNorm = MEDICATION_RXNORM_MAP[name.split(/\s+/)[0]];

  return {
    name: name.split(/\s+/)[0],
    rxNorm,
    dosage,
    route,
    frequency,
  };
}

/**
 * Normalize a diagnosis mention
 */
export function normalizeDiagnosis(text: string): NormalizedDiagnosis | null {
  const lower = text.toLowerCase().trim();

  // Look up ICD-10 code
  const mapping = DIAGNOSIS_ICD_MAP[lower];
  if (mapping) {
    return {
      description: mapping.description,
      icdCode: mapping.icdCode,
    };
  }

  return {
    description: text,
  };
}

/**
 * Normalize a symptom mention
 */
export function normalizeSymptom(text: string): NormalizedSymptom {
  const lower = text.toLowerCase();

  return {
    name: lower,
    bodySystem: inferBodySystem(lower),
  };
}

/**
 * Normalize a lab test mention
 */
export function normalizeLabTest(text: string): NormalizedLabTest {
  const lower = text.toLowerCase();
  const mapping = LAB_TEST_LOINC_MAP[lower];

  return {
    name: mapping?.name || text,
    loincCode: mapping?.loincCode,
    panelName: mapping?.panelName,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateConfidence(text: string, knownSet: Set<string>): number {
  const normalized = text.toLowerCase().trim();
  if (knownSet.has(normalized)) {
    return 0.95;
  }
  // Partial match
  for (const known of knownSet) {
    if (normalized.includes(known) || known.includes(normalized)) {
      return 0.8;
    }
  }
  return 0.6;
}

function deduplicateBySpan(entities: ExtractedEntity[]): ExtractedEntity[] {
  const result: ExtractedEntity[] = [];

  for (const entity of entities) {
    const overlaps = result.some(
      (e) =>
        e.type === entity.type &&
        ((entity.span[0] >= e.span[0] && entity.span[0] < e.span[1]) ||
          (entity.span[1] > e.span[0] && entity.span[1] <= e.span[1]))
    );
    if (!overlaps) {
      result.push(entity);
    }
  }

  return result;
}

function deduplicateEntities(
  entities: ExtractedEntity[],
  existingItems: import('../../../types/chart-items').ChartItem[]
): ExtractedEntity[] {
  // Simple deduplication - check if similar item already exists
  return entities.filter((entity) => {
    if (entity.type === 'medication') {
      const normalized = entity.normalizedValue as NormalizedMedication | null;
      if (!normalized) return true;

      return !existingItems.some(
        (item) =>
          item.category === 'medication' &&
          'data' in item &&
          (item as import('../../../types/chart-items').MedicationItem).data.drugName
            .toLowerCase()
            .includes(normalized.name)
      );
    }
    return true;
  });
}

function inferBodySystem(symptom: string): string | undefined {
  const systemMap: Record<string, string[]> = {
    respiratory: ['cough', 'shortness of breath', 'wheezing', 'congestion'],
    cardiovascular: ['chest pain', 'palpitations'],
    neurological: ['headache', 'dizziness', 'numbness', 'tingling'],
    gastrointestinal: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain'],
    general: ['fever', 'fatigue', 'weakness', 'chills', 'night sweats'],
  };

  for (const [system, symptoms] of Object.entries(systemMap)) {
    if (symptoms.some((s) => symptom.includes(s))) {
      return system;
    }
  }
  return undefined;
}

// ============================================================================
// Known Value Sets
// ============================================================================

const KNOWN_MEDICATIONS = new Set([
  'metformin', 'lisinopril', 'atorvastatin', 'omeprazole', 'amlodipine',
  'metoprolol', 'losartan', 'gabapentin', 'hydrochlorothiazide', 'sertraline',
  'fluoxetine', 'alprazolam', 'ibuprofen', 'acetaminophen', 'aspirin',
  'warfarin', 'prednisone', 'amoxicillin', 'azithromycin', 'ciprofloxacin',
  'levothyroxine', 'albuterol', 'montelukast', 'pantoprazole', 'escitalopram',
  'duloxetine', 'trazodone', 'furosemide', 'carvedilol', 'clopidogrel',
  'mucinex', 'tylenol', 'advil', 'motrin', 'benadryl',
]);

const KNOWN_DIAGNOSES = new Set([
  'diabetes', 'hypertension', 'asthma', 'copd', 'pneumonia',
  'bronchitis', 'heart failure', 'atrial fibrillation', 'hyperlipidemia',
  'depression', 'anxiety', 'gerd', 'arthritis', 'osteoporosis',
  'hypothyroidism', 'uti', 'sinusitis', 'strep throat', 'covid',
]);

const MEDICATION_RXNORM_MAP: Record<string, string> = {
  metformin: '6809',
  lisinopril: '29046',
  atorvastatin: '83367',
  omeprazole: '7646',
  amlodipine: '17767',
  metoprolol: '6918',
  losartan: '52175',
  gabapentin: '25480',
  sertraline: '36437',
  fluoxetine: '4493',
  levothyroxine: '10582',
  albuterol: '435',
  prednisone: '8640',
  amoxicillin: '723',
  azithromycin: '18631',
};

const DIAGNOSIS_ICD_MAP: Record<string, { description: string; icdCode: string }> = {
  diabetes: { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9' },
  'type 2 diabetes': { description: 'Type 2 diabetes mellitus', icdCode: 'E11.9' },
  'type 1 diabetes': { description: 'Type 1 diabetes mellitus', icdCode: 'E10.9' },
  hypertension: { description: 'Essential hypertension', icdCode: 'I10' },
  'high blood pressure': { description: 'Essential hypertension', icdCode: 'I10' },
  asthma: { description: 'Asthma, unspecified', icdCode: 'J45.909' },
  copd: { description: 'COPD, unspecified', icdCode: 'J44.9' },
  pneumonia: { description: 'Pneumonia, unspecified', icdCode: 'J18.9' },
  bronchitis: { description: 'Acute bronchitis, unspecified', icdCode: 'J20.9' },
  hyperlipidemia: { description: 'Hyperlipidemia, unspecified', icdCode: 'E78.5' },
  'high cholesterol': { description: 'Hyperlipidemia, unspecified', icdCode: 'E78.5' },
  depression: { description: 'Major depressive disorder', icdCode: 'F32.9' },
  anxiety: { description: 'Anxiety disorder, unspecified', icdCode: 'F41.9' },
  gerd: { description: 'Gastroesophageal reflux disease', icdCode: 'K21.0' },
  'acid reflux': { description: 'Gastroesophageal reflux disease', icdCode: 'K21.0' },
  uti: { description: 'Urinary tract infection', icdCode: 'N39.0' },
  'urinary tract infection': { description: 'Urinary tract infection', icdCode: 'N39.0' },
};

const LAB_TEST_LOINC_MAP: Record<string, { name: string; loincCode: string; panelName?: string }> = {
  cbc: { name: 'Complete Blood Count', loincCode: '58410-2', panelName: 'CBC' },
  'complete blood count': { name: 'Complete Blood Count', loincCode: '58410-2', panelName: 'CBC' },
  bmp: { name: 'Basic Metabolic Panel', loincCode: '51990-0', panelName: 'BMP' },
  'basic metabolic panel': { name: 'Basic Metabolic Panel', loincCode: '51990-0', panelName: 'BMP' },
  cmp: { name: 'Comprehensive Metabolic Panel', loincCode: '24323-8', panelName: 'CMP' },
  'lipid panel': { name: 'Lipid Panel', loincCode: '24331-1', panelName: 'Lipid' },
  a1c: { name: 'Hemoglobin A1c', loincCode: '4548-4' },
  'hemoglobin a1c': { name: 'Hemoglobin A1c', loincCode: '4548-4' },
  hba1c: { name: 'Hemoglobin A1c', loincCode: '4548-4' },
  tsh: { name: 'TSH', loincCode: '3016-3' },
  urinalysis: { name: 'Urinalysis', loincCode: '24356-8' },
  glucose: { name: 'Glucose', loincCode: '2345-7' },
  creatinine: { name: 'Creatinine', loincCode: '2160-0' },
  microalbumin: { name: 'Microalbumin', loincCode: '14957-5' },
};
