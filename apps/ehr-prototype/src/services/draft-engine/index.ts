/**
 * Draft Engine — barrel export
 */

export { createDraftEngine } from './draft-engine';
export type { DraftEngine } from './draft-engine';
export { getMockDraftContent, getMockConfidence, MOCK_DRAFT_CONTENT } from './mock-content';
export {
  DEFAULT_DRAFT_STAGES,
  FAST_DRAFT_STAGES,
  DEFAULT_DRAFT_ENGINE_CONFIG,
} from './types';
export type { DraftStage, DraftEngineConfig } from './types';
