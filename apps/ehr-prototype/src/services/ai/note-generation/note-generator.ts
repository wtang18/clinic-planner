/**
 * Note Generator
 *
 * Logic for generating visit notes from chart items.
 */

import type {
  ChartItem,
  ItemCategory,
  MedicationItem,
  DiagnosisItem,
  LabItem,
  VitalsItem,
  PhysicalExamItem,
  NarrativeItem,
} from '../../../types/chart-items';
import type { EncounterMeta } from '../../../types/encounter';
import type { PatientContext } from '../../../types/patient';
import type { VisitMeta } from '../../../types/encounter';
import type {
  NoteGenerationConfig,
  GeneratedNote,
  NoteSectionContent,
  NoteSection,
} from './types';
import { DEFAULT_NOTE_GENERATION_CONFIG, SOAP_TEMPLATE } from './types';

// ============================================================================
// Main Generation Function
// ============================================================================

/**
 * Generate a visit note from chart items
 */
export async function generateVisitNote(
  items: ChartItem[],
  context: {
    encounter: EncounterMeta;
    patient: PatientContext;
    visit?: VisitMeta;
  },
  config: NoteGenerationConfig = DEFAULT_NOTE_GENERATION_CONFIG
): Promise<GeneratedNote> {
  const sections: NoteSectionContent[] = [];
  const basedOnItems: string[] = [];

  // Group items by category
  const itemsByCategory = groupItemsByCategory(items);

  // Generate each section
  for (const section of config.includeSections) {
    const sectionContent = generateSection(section, itemsByCategory, context);
    if (sectionContent.content) {
      sections.push(sectionContent);
      basedOnItems.push(...sectionContent.sourceItems);
    }
  }

  // Combine into full note
  const text = formatNote(sections, config);

  return {
    text,
    format: config.format,
    sections,
    confidence: calculateConfidence(sections),
    generatedAt: new Date(),
    basedOnItems: [...new Set(basedOnItems)],
  };
}

// ============================================================================
// Section Generators
// ============================================================================

/**
 * Generate a specific section
 */
function generateSection(
  section: NoteSection,
  itemsByCategory: Record<ItemCategory, ChartItem[]>,
  context: {
    encounter: EncounterMeta;
    patient: PatientContext;
    visit?: VisitMeta;
  }
): NoteSectionContent {
  switch (section) {
    case 'chief-complaint':
      return generateChiefComplaint(itemsByCategory, context);
    case 'hpi':
      return generateHPI(itemsByCategory);
    case 'physical-exam':
      return generatePhysicalExam(itemsByCategory);
    case 'assessment':
      return generateAssessment(itemsByCategory);
    case 'plan':
      return generatePlan(itemsByCategory);
    case 'medications':
      return generateMedicationSection(itemsByCategory);
    case 'follow-up':
      return generateFollowUp(itemsByCategory);
    default:
      return { section, content: '', sourceItems: [] };
  }
}

/**
 * Generate chief complaint section
 */
function generateChiefComplaint(
  itemsByCategory: Record<ItemCategory, ChartItem[]>,
  context: {
    encounter: EncounterMeta;
    patient: PatientContext;
    visit?: VisitMeta;
  }
): NoteSectionContent {
  const ccItems = itemsByCategory['chief-complaint'] || [];

  if (ccItems.length > 0) {
    const narrativeItems = ccItems as NarrativeItem[];
    return {
      section: 'chief-complaint',
      content: narrativeItems.map((i) => i.data.text).join('; '),
      sourceItems: ccItems.map((i) => i.id),
    };
  }

  // Try to infer from encounter reason
  if (context.visit?.visitReason) {
    return {
      section: 'chief-complaint',
      content: context.visit.visitReason,
      sourceItems: [],
    };
  }

  return { section: 'chief-complaint', content: '', sourceItems: [] };
}

/**
 * Generate HPI section
 */
export function generateHPI(
  itemsByCategory: Record<ItemCategory, ChartItem[]>
): NoteSectionContent {
  const hpiItems = itemsByCategory['hpi'] || [];
  const sourceItems: string[] = [];

  if (hpiItems.length === 0) {
    return { section: 'hpi', content: '', sourceItems: [] };
  }

  const narrativeItems = hpiItems as NarrativeItem[];
  const content = narrativeItems.map((item) => {
    sourceItems.push(item.id);
    return item.data.text;
  }).join('\n\n');

  return { section: 'hpi', content, sourceItems };
}

/**
 * Generate physical exam section
 */
export function generatePhysicalExam(
  itemsByCategory: Record<ItemCategory, ChartItem[]>
): NoteSectionContent {
  const peItems = itemsByCategory['physical-exam'] || [];
  const vitalsItems = itemsByCategory['vitals'] || [];
  const sourceItems: string[] = [];
  const parts: string[] = [];

  // Add vitals
  if (vitalsItems.length > 0) {
    const latestVitals = vitalsItems[vitalsItems.length - 1] as VitalsItem;
    sourceItems.push(latestVitals.id);
    parts.push(formatVitals(latestVitals));
  }

  // Add exam findings grouped by system
  if (peItems.length > 0) {
    const peBySystem = new Map<string, string[]>();

    for (const item of peItems as PhysicalExamItem[]) {
      sourceItems.push(item.id);
      const system = item.data.system;
      if (!peBySystem.has(system)) {
        peBySystem.set(system, []);
      }
      peBySystem.get(system)!.push(item.data.finding);
    }

    for (const [system, findings] of peBySystem) {
      const systemLabel = formatSystemName(system);
      parts.push(`${systemLabel}: ${findings.join('. ')}`);
    }
  }

  return {
    section: 'physical-exam',
    content: parts.join('\n'),
    sourceItems,
  };
}

/**
 * Generate assessment section
 */
export function generateAssessment(
  itemsByCategory: Record<ItemCategory, ChartItem[]>
): NoteSectionContent {
  const dxItems = itemsByCategory['diagnosis'] || [];

  if (dxItems.length === 0) {
    return { section: 'assessment', content: '', sourceItems: [] };
  }

  const diagnoses = dxItems as DiagnosisItem[];
  const content = formatDiagnosisList(diagnoses);

  return {
    section: 'assessment',
    content,
    sourceItems: dxItems.map((i) => i.id),
  };
}

/**
 * Generate plan section
 */
export function generatePlan(
  itemsByCategory: Record<ItemCategory, ChartItem[]>
): NoteSectionContent {
  const planItems = itemsByCategory['plan'] || [];
  const medItems = itemsByCategory['medication'] || [];
  const labItems = itemsByCategory['lab'] || [];
  const imagingItems = itemsByCategory['imaging'] || [];
  const referralItems = itemsByCategory['referral'] || [];
  const instructionItems = itemsByCategory['instruction'] || [];

  const sourceItems: string[] = [];
  const parts: string[] = [];

  // Plan narrative
  if (planItems.length > 0) {
    const narrativeItems = planItems as NarrativeItem[];
    for (const item of narrativeItems) {
      sourceItems.push(item.id);
      parts.push(item.data.text);
    }
  }

  // Medications
  if (medItems.length > 0) {
    const meds = medItems as MedicationItem[];
    const newMeds = meds.filter((m) => m.data.prescriptionType === 'new');
    if (newMeds.length > 0) {
      sourceItems.push(...newMeds.map((i) => i.id));
      parts.push('Medications prescribed: ' + newMeds.map((m) =>
        `${m.data.drugName} ${m.data.dosage} ${m.data.route} ${m.data.frequency}`
      ).join(', '));
    }
  }

  // Labs
  if (labItems.length > 0) {
    const labs = labItems as LabItem[];
    const orderedLabs = labs.filter((l) => l.data.orderStatus === 'draft' || l.data.orderStatus === 'ordered');
    if (orderedLabs.length > 0) {
      sourceItems.push(...orderedLabs.map((i) => i.id));
      parts.push('Labs ordered: ' + orderedLabs.map((l) => l.data.testName).join(', '));
    }
  }

  // Imaging
  if (imagingItems.length > 0) {
    sourceItems.push(...imagingItems.map((i) => i.id));
    parts.push('Imaging ordered: ' + imagingItems.map((i) => i.displayText).join(', '));
  }

  // Referrals
  if (referralItems.length > 0) {
    sourceItems.push(...referralItems.map((i) => i.id));
    parts.push('Referrals: ' + referralItems.map((i) => i.displayText).join(', '));
  }

  // Instructions
  if (instructionItems.length > 0) {
    sourceItems.push(...instructionItems.map((i) => i.id));
  }

  return {
    section: 'plan',
    content: parts.join('\n'),
    sourceItems,
  };
}

/**
 * Generate medication section
 */
function generateMedicationSection(
  itemsByCategory: Record<ItemCategory, ChartItem[]>
): NoteSectionContent {
  const medItems = itemsByCategory['medication'] || [];

  if (medItems.length === 0) {
    return { section: 'medications', content: '', sourceItems: [] };
  }

  const meds = medItems as MedicationItem[];
  const content = formatMedicationList(meds);

  return {
    section: 'medications',
    content,
    sourceItems: medItems.map((i) => i.id),
  };
}

/**
 * Generate follow-up section
 */
function generateFollowUp(
  itemsByCategory: Record<ItemCategory, ChartItem[]>
): NoteSectionContent {
  const instructionItems = itemsByCategory['instruction'] || [];

  const followUpInstructions = instructionItems.filter(
    (i) => (i as any).data?.instructionType === 'follow-up'
  );

  if (followUpInstructions.length === 0) {
    return { section: 'follow-up', content: '', sourceItems: [] };
  }

  return {
    section: 'follow-up',
    content: followUpInstructions.map((i) => i.displayText).join('\n'),
    sourceItems: followUpInstructions.map((i) => i.id),
  };
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Group items by category
 */
export function groupItemsByCategory(
  items: ChartItem[]
): Record<ItemCategory, ChartItem[]> {
  const grouped: Partial<Record<ItemCategory, ChartItem[]>> = {};

  for (const item of items) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category]!.push(item);
  }

  return grouped as Record<ItemCategory, ChartItem[]>;
}

/**
 * Format medication list
 */
export function formatMedicationList(medications: MedicationItem[]): string {
  return medications.map((med) => {
    const parts = [med.data.drugName];
    if (med.data.dosage) parts.push(med.data.dosage);
    if (med.data.route) parts.push(med.data.route);
    if (med.data.frequency) parts.push(med.data.frequency);
    return `- ${parts.join(' ')}`;
  }).join('\n');
}

/**
 * Format diagnosis list
 */
export function formatDiagnosisList(diagnoses: DiagnosisItem[]): string {
  // Sort by ranking
  const sorted = [...diagnoses].sort((a, b) => {
    if (a.data.ranking === 'primary') return -1;
    if (b.data.ranking === 'primary') return 1;
    return 0;
  });

  return sorted.map((dx, index) => {
    const prefix = index === 0 ? 'Primary' : (index + 1).toString();
    return `${prefix}. ${dx.data.description} (${dx.data.icdCode})`;
  }).join('\n');
}

/**
 * Format vitals
 */
function formatVitals(vitals: VitalsItem): string {
  const measurements = vitals.data.measurements;
  const parts: string[] = [];

  const bp = measurements.filter((m) => m.type === 'bp-systolic' || m.type === 'bp-diastolic');
  if (bp.length >= 2) {
    const systolic = bp.find((m) => m.type === 'bp-systolic')?.value;
    const diastolic = bp.find((m) => m.type === 'bp-diastolic')?.value;
    if (systolic && diastolic) {
      parts.push(`BP ${systolic}/${diastolic}`);
    }
  }

  const pulse = measurements.find((m) => m.type === 'pulse');
  if (pulse) parts.push(`HR ${pulse.value}`);

  const temp = measurements.find((m) => m.type === 'temp');
  if (temp) parts.push(`Temp ${temp.value}°F`);

  const resp = measurements.find((m) => m.type === 'resp');
  if (resp) parts.push(`RR ${resp.value}`);

  const spo2 = measurements.find((m) => m.type === 'spo2');
  if (spo2) parts.push(`SpO2 ${spo2.value}%`);

  return `Vitals: ${parts.join(', ')}`;
}

/**
 * Format system name
 */
function formatSystemName(system: string): string {
  const names: Record<string, string> = {
    general: 'General',
    heent: 'HEENT',
    neck: 'Neck',
    cardiovascular: 'Cardiovascular',
    respiratory: 'Respiratory',
    gi: 'GI/Abdomen',
    gu: 'GU',
    musculoskeletal: 'Musculoskeletal',
    skin: 'Skin',
    neurological: 'Neurological',
    psychiatric: 'Psychiatric',
  };
  return names[system] || system;
}

/**
 * Format note from sections
 */
function formatNote(
  sections: NoteSectionContent[],
  config: NoteGenerationConfig
): string {
  const template = SOAP_TEMPLATE;
  const parts: string[] = [];

  for (const section of sections) {
    if (!section.content) continue;

    const templateStr = template.sectionTemplates[section.section];
    if (templateStr) {
      parts.push(templateStr.replace('{content}', section.content));
    }
  }

  let text = parts.join('\n\n');

  // Add disclaimer
  if (config.includeDisclaimer) {
    text += '\n\n---\nNote: This note was generated with AI assistance and should be reviewed for accuracy.';
  }

  // Apply max length
  if (config.maxLength && text.length > config.maxLength) {
    text = text.substring(0, config.maxLength - 3) + '...';
  }

  return text;
}

/**
 * Calculate confidence score based on sections
 */
function calculateConfidence(sections: NoteSectionContent[]): number {
  const sectionCount = sections.filter((s) => s.content).length;
  const totalSourceItems = sections.reduce((sum, s) => sum + s.sourceItems.length, 0);

  // Higher confidence with more sections and source items
  const sectionScore = Math.min(sectionCount / 6, 1) * 0.5;
  const itemScore = Math.min(totalSourceItems / 10, 1) * 0.5;

  return sectionScore + itemScore;
}
