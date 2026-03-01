/**
 * Draft Engine
 *
 * Timer-based mock AI draft generation. Simulates progressive narrative
 * generation during an encounter by creating drafts at staged intervals.
 *
 * Usage:
 *   const engine = createDraftEngine(dispatch, getState, config);
 *   engine.start();
 *   // ... drafts appear over time ...
 *   engine.stop();
 */

import { nanoid } from 'nanoid';
import type { EncounterState } from '../../state/types';
import type { EncounterAction } from '../../state/actions/types';
import type { AIDraft } from '../../types/drafts';
import type { ItemCategory } from '../../types/chart-items';
import type { DraftEngineConfig, DraftStage } from './types';
import { DEFAULT_DRAFT_ENGINE_CONFIG } from './types';
import { getMockDraftContent, getMockConfidence } from './mock-content';

export interface DraftEngine {
  /** Start generating drafts */
  start: () => void;
  /** Stop all pending timers */
  stop: () => void;
  /** Check if the engine is running */
  isRunning: () => boolean;
}

/**
 * Create a draft engine instance.
 *
 * @param dispatch - Function to dispatch actions to the encounter store
 * @param getState - Function to read current encounter state
 * @param config - Draft engine configuration (stages, enrichment detection)
 */
export function createDraftEngine(
  dispatch: (action: EncounterAction) => void,
  getState: () => EncounterState,
  config: DraftEngineConfig = DEFAULT_DRAFT_ENGINE_CONFIG
): DraftEngine {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let running = false;

  function start() {
    if (running) return;
    running = true;

    for (const stage of config.stages) {
      const timer = setTimeout(() => {
        if (!running) return;
        generateDraftForStage(stage);
      }, stage.delayMs);
      timers.push(timer);
    }
  }

  function stop() {
    running = false;
    for (const timer of timers) {
      clearTimeout(timer);
    }
    timers.length = 0;
  }

  function isRunning() {
    return running;
  }

  function generateDraftForStage(stage: DraftStage) {
    const state = getState();

    // Guard: don't generate if an active draft already exists for this category
    const existingDraft = Object.values(state.entities.drafts).find(
      d => d.category === stage.category && (d.status === 'pending' || d.status === 'generating')
    );
    if (existingDraft) return;

    // Check for existing MA content to detect enrichment
    const enrichTarget = config.detectEnrichment
      ? findEnrichmentTarget(state, stage.category)
      : undefined;

    const content = getMockDraftContent(stage.category);
    if (!content) return;

    const draftId = `draft-${nanoid(8)}`;
    const label = enrichTarget ? `Updated ${stage.label.replace(' Draft', '')}` : stage.label;

    // Phase 1: Dispatch "generating" shell (no content yet)
    const draft: AIDraft = {
      id: draftId,
      category: stage.category,
      content: '',
      status: 'generating',
      generatedAt: new Date(),
      source: 'ambient-recording',
      enrichesItemId: enrichTarget?.id,
      label,
    };

    dispatch({
      type: 'DRAFT_GENERATED',
      payload: { draft },
    });

    // Phase 2: After generation duration, deliver actual content
    const genDuration = stage.generationDurationMs ?? 3000;
    const contentTimer = setTimeout(() => {
      if (!running) return;
      dispatch({
        type: 'DRAFT_CONTENT_READY',
        payload: {
          id: draftId,
          content,
          confidence: getMockConfidence(stage.category),
        },
      });

      // Schedule auto-refresh after content is ready
      scheduleAutoRefresh(draftId, stage.category);
    }, genDuration);
    timers.push(contentTimer);
  }

  function scheduleAutoRefresh(draftId: string, category: ItemCategory) {
    const refreshDelay = config.refreshDelayMs ?? 20000;
    const refreshDuration = config.refreshDurationMs ?? 2500;

    const refreshTimer = setTimeout(() => {
      if (!running) return;

      // Guard: only refresh if still pending
      const currentState = getState();
      const draft = currentState.entities.drafts[draftId];
      if (!draft || draft.status !== 'pending') return;

      // Transition to updating
      dispatch({ type: 'DRAFT_REFRESH', payload: { id: draftId } });

      // After refresh duration, deliver updated content
      const completeTimer = setTimeout(() => {
        if (!running) return;
        const content = getMockDraftContent(category);
        dispatch({
          type: 'DRAFT_REFRESH_COMPLETE',
          payload: {
            id: draftId,
            content,
            confidence: getMockConfidence(category),
          },
        });
      }, refreshDuration);
      timers.push(completeTimer);
    }, refreshDelay);
    timers.push(refreshTimer);
  }

  return { start, stop, isRunning };
}

/**
 * Find an existing MA-documented item that this draft would enrich.
 * Returns the item if found, undefined otherwise.
 */
function findEnrichmentTarget(
  state: EncounterState,
  category: ItemCategory
): { id: string } | undefined {
  const items = Object.values(state.entities.items);
  const match = items.find(
    item =>
      item.category === category &&
      item.source.type === 'maHandoff' &&
      !item._meta.aiGenerated
  );
  return match ? { id: match.id } : undefined;
}
