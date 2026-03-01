/**
 * Draft Engine Types
 *
 * Configuration and stage definitions for the mock AI draft generation engine.
 */

import type { ItemCategory } from '../../types/chart-items';

/** A single draft generation stage */
export interface DraftStage {
  /** Note section to generate */
  category: ItemCategory;
  /** Display label for the draft */
  label: string;
  /** Delay in ms before this draft appears */
  delayMs: number;
  /** Duration in ms for AI to "generate" content (generating → pending). Default: 3000 */
  generationDurationMs?: number;
}

/** Draft engine configuration */
export interface DraftEngineConfig {
  /** Ordered stages of draft generation */
  stages: DraftStage[];
  /** Whether to check for existing MA content to produce "Updated X" labels */
  detectEnrichment: boolean;
  /** Delay in ms after content ready before auto-refreshing a draft. Default: 20000 */
  refreshDelayMs?: number;
  /** Duration in ms for the refresh "updating" phase. Default: 2500 */
  refreshDurationMs?: number;
}

/** Default encounter draft stages (simulates progressive ambient recording) */
export const DEFAULT_DRAFT_STAGES: DraftStage[] = [
  { category: 'chief-complaint', label: 'CC Draft', delayMs: 3000, generationDurationMs: 2000 },
  { category: 'hpi', label: 'HPI Draft', delayMs: 15000, generationDurationMs: 4000 },
  { category: 'ros', label: 'ROS Draft', delayMs: 30000, generationDurationMs: 3000 },
  { category: 'physical-exam', label: 'PE Draft', delayMs: 45000, generationDurationMs: 3500 },
  { category: 'plan', label: 'Plan Draft', delayMs: 60000, generationDurationMs: 4000 },
  { category: 'instruction', label: 'Instructions Draft', delayMs: 75000, generationDurationMs: 2500 },
];

/** Fast stages for demo/testing (10x faster) */
export const FAST_DRAFT_STAGES: DraftStage[] = DEFAULT_DRAFT_STAGES.map(stage => ({
  ...stage,
  delayMs: Math.round(stage.delayMs / 10),
  generationDurationMs: stage.generationDurationMs
    ? Math.round(stage.generationDurationMs / 10)
    : undefined,
}));

export const DEFAULT_DRAFT_ENGINE_CONFIG: DraftEngineConfig = {
  stages: DEFAULT_DRAFT_STAGES,
  detectEnrichment: true,
};
