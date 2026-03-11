/**
 * Mock Triage Data
 *
 * Per-scenario triage narrative and PE items as first-class ChartItems.
 * CC, HPI, and Physical Exam items are seeded based on how far
 * each scenario has progressed through the triage workflow phase.
 *
 * Scenarios:
 * - enc-uc-cough-001: check-in done → CC seeded (triage in progress)
 * - enc-pc-dm-001: check-in + triage done → CC, HPI, PE seeded
 * - enc-awv-001: nothing done → no triage items
 */

import type { NarrativeItem, PhysicalExamItem, ChartItem } from '../types/chart-items';
import { materializeChartItem } from '../utils/chart-item-factory';

// ============================================================================
// Helpers
// ============================================================================

const MA_SOURCE = { type: 'maHandoff' as const };

function buildNarrative(
  category: 'chief-complaint' | 'hpi',
  displayText: string,
  text: string,
): NarrativeItem {
  return materializeChartItem(
    {
      category,
      displayText,
      data: {
        text,
        format: 'plain',
      },
    },
    { source: MA_SOURCE, status: 'confirmed', reviewed: true },
  ) as NarrativeItem;
}

function buildPE(
  system: PhysicalExamItem['data']['system'],
  finding: string,
  isNormal: boolean,
): PhysicalExamItem {
  return materializeChartItem(
    {
      category: 'physical-exam',
      displayText: `${system.charAt(0).toUpperCase() + system.slice(1)}: ${finding}`,
      data: {
        system,
        finding,
        isNormal,
      },
    },
    { source: MA_SOURCE, status: 'confirmed', reviewed: true },
  ) as PhysicalExamItem;
}

// ============================================================================
// Scenarios
// ============================================================================

/** UC Cough: minimal start — only CC seeded. HPI arrives via ambient charting. */
function buildUcCoughTriageItems(): ChartItem[] {
  return [
    buildNarrative(
      'chief-complaint',
      'Cough x 5 days',
      'Cough x 5 days, productive with yellow sputum. Tried OTC Robitussin without relief.',
    ),
  ];
}

/** PC Diabetes: triage complete — CC, HPI, PE all captured */
function buildPcDiabetesTriageItems(): ChartItem[] {
  return [
    buildNarrative(
      'chief-complaint',
      'DM/HTN follow-up',
      'Quarterly diabetes and hypertension follow-up visit.',
    ),
    buildNarrative(
      'hpi',
      'Morning fasting glucose 140-160, occasional headaches',
      'Here for quarterly DM/HTN follow-up. Reports morning fasting glucose running 140-160. Occasional headaches, attributes to stress. Adherent to medications, sometimes forgets evening metformin.',
    ),
    buildPE('general', 'Well-appearing, NAD, obese habitus', false),
    buildPE('cardiovascular', 'RRR, no murmurs, peripheral pulses intact, no edema', true),
    buildPE('respiratory', 'Clear to auscultation bilaterally, no wheezing', true),
  ];
}

// ============================================================================
// Lookup
// ============================================================================

const SCENARIO_TRIAGE: Record<string, () => ChartItem[]> = {
  'enc-uc-cough-001': buildUcCoughTriageItems,
  'enc-pc-dm-001': buildPcDiabetesTriageItems,
  'enc-awv-001': () => [],
};

/** Get triage ChartItems for a scenario. Returns empty array for unknown scenarios. */
export function getTriageItemsForScenario(scenarioId: string | undefined): ChartItem[] {
  if (!scenarioId) return [];
  const builder = SCENARIO_TRIAGE[scenarioId];
  return builder ? builder() : [];
}
