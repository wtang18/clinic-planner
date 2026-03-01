/**
 * Draft Engine Tests — Phase 4b
 *
 * Tests for:
 * 1. Engine creates drafts at correct intervals (using fake timers)
 * 2. Engine guards against duplicate drafts for same category
 * 3. Engine detects enrichment targets (MA content)
 * 4. Engine cleanup on stop
 * 5. Mock content is available for all draft categories
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AIDraft } from '../../types/drafts';
import type { ChartItem } from '../../types/chart-items';
import type { EncounterAction } from '../../state/actions/types';
import type { EncounterState } from '../../state/types';
import { createDraftEngine } from '../../services/draft-engine';
import { getMockDraftContent, getMockConfidence, MOCK_DRAFT_CONTENT } from '../../services/draft-engine';
import { FAST_DRAFT_STAGES } from '../../services/draft-engine';
import { createInitialState } from '../../state/initialState';

// ============================================================================
// Test Helpers
// ============================================================================

function makeState(overrides?: {
  drafts?: Record<string, AIDraft>;
  items?: Record<string, ChartItem>;
}): EncounterState {
  const base = createInitialState();
  return {
    ...base,
    entities: {
      ...base.entities,
      drafts: overrides?.drafts || {},
      items: overrides?.items || {},
    },
  };
}

function makeMAItem(category: string, id: string): ChartItem {
  return {
    id,
    category: category as ChartItem['category'],
    displayText: 'MA-documented content',
    createdAt: new Date('2024-01-15T09:50:00'),
    createdBy: { id: 'ma-1', name: 'Sarah K.' },
    modifiedAt: new Date('2024-01-15T09:50:00'),
    modifiedBy: { id: 'ma-1', name: 'Sarah K.' },
    source: { type: 'maHandoff' },
    status: 'confirmed',
    tags: [],
    linkedDiagnoses: [],
    linkedEncounters: [],
    activityLog: [{ timestamp: new Date('2024-01-15T09:50:00'), action: 'created', actor: 'Sarah K.' }],
    _meta: { syncStatus: 'synced', aiGenerated: false, requiresReview: false, reviewed: false },
    data: { text: 'MA-documented content', format: 'plain' },
  } as unknown as ChartItem;
}

// ============================================================================
// 1. Timer-Based Draft Generation
// ============================================================================

describe('Draft Engine — Timer-Based Generation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dispatches DRAFT_GENERATED for each stage at the correct delay', () => {
    const dispatched: EncounterAction[] = [];
    const state = makeState();

    const engine = createDraftEngine(
      (action) => dispatched.push(action),
      () => state,
      { stages: FAST_DRAFT_STAGES, detectEnrichment: false }
    );

    engine.start();

    // At t=0, no drafts yet (first delay is 300ms for fast stages)
    expect(dispatched).toHaveLength(0);

    // Advance to first stage (CC at 300ms)
    vi.advanceTimersByTime(300);
    expect(dispatched).toHaveLength(1);
    expect(dispatched[0].type).toBe('DRAFT_GENERATED');
    if (dispatched[0].type === 'DRAFT_GENERATED') {
      expect(dispatched[0].payload.draft.category).toBe('chief-complaint');
      expect(dispatched[0].payload.draft.status).toBe('generating');
    }

    // Advance to second stage (HPI at 1500ms)
    // At t=1500ms: CC shell (t=300) + CC content ready (t=500) + HPI shell (t=1500) = 3 dispatches
    vi.advanceTimersByTime(1200);
    const hpiShell = dispatched.filter(
      (a): a is Extract<EncounterAction, { type: 'DRAFT_GENERATED' }> => a.type === 'DRAFT_GENERATED'
    );
    expect(hpiShell).toHaveLength(2);
    expect(hpiShell[1].payload.draft.category).toBe('hpi');

    engine.stop();
  });

  it('generates all 6 stages when fully elapsed', () => {
    const dispatched: EncounterAction[] = [];
    const state = makeState();

    const engine = createDraftEngine(
      (action) => dispatched.push(action),
      () => state,
      { stages: FAST_DRAFT_STAGES, detectEnrichment: false }
    );

    engine.start();
    vi.advanceTimersByTime(10000); // More than enough for all fast stages

    // 6 DRAFT_GENERATED (shells) + 6 DRAFT_CONTENT_READY = 12 dispatches
    const shells = dispatched.filter(
      (a): a is Extract<EncounterAction, { type: 'DRAFT_GENERATED' }> => a.type === 'DRAFT_GENERATED'
    );
    expect(shells).toHaveLength(6);
    const categories = shells.map(a => a.payload.draft.category);
    expect(categories).toEqual([
      'chief-complaint', 'hpi', 'ros', 'physical-exam', 'plan', 'instruction',
    ]);

    const contentReady = dispatched.filter(a => a.type === 'DRAFT_CONTENT_READY');
    expect(contentReady).toHaveLength(6);

    engine.stop();
  });
});

// ============================================================================
// 2. Duplicate Guard
// ============================================================================

describe('Draft Engine — Duplicate Guard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not generate a draft if an active draft already exists for that category', () => {
    const dispatched: EncounterAction[] = [];
    const existingDraft: AIDraft = {
      id: 'existing-cc',
      category: 'chief-complaint',
      content: 'Existing CC',
      status: 'pending',
      generatedAt: new Date('2024-01-15T10:00:00'),
      source: 'ambient-recording',
      label: 'CC Draft',
      confidence: 0.9,
    };

    const state = makeState({ drafts: { 'existing-cc': existingDraft } });

    const engine = createDraftEngine(
      (action) => dispatched.push(action),
      () => state,
      { stages: FAST_DRAFT_STAGES, detectEnrichment: false }
    );

    engine.start();
    vi.advanceTimersByTime(300); // CC stage fires

    // Should NOT dispatch for CC since an active one exists
    expect(dispatched).toHaveLength(0);

    engine.stop();
  });

  it('allows generation if the existing draft for that category was dismissed', () => {
    const dispatched: EncounterAction[] = [];
    const dismissedDraft: AIDraft = {
      id: 'dismissed-cc',
      category: 'chief-complaint',
      content: 'Old CC',
      status: 'dismissed',
      generatedAt: new Date('2024-01-15T10:00:00'),
      source: 'ambient-recording',
      label: 'CC Draft',
    };

    const state = makeState({ drafts: { 'dismissed-cc': dismissedDraft } });

    const engine = createDraftEngine(
      (action) => dispatched.push(action),
      () => state,
      { stages: FAST_DRAFT_STAGES, detectEnrichment: false }
    );

    engine.start();
    vi.advanceTimersByTime(300);

    // Should dispatch since the existing draft was dismissed (not active)
    expect(dispatched).toHaveLength(1);

    engine.stop();
  });
});

// ============================================================================
// 3. Enrichment Detection
// ============================================================================

describe('Draft Engine — Enrichment Detection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('labels draft as "Updated X" when MA content exists for that category', () => {
    const dispatched: EncounterAction[] = [];
    const maCC = makeMAItem('chief-complaint', 'ma-cc-1');
    const state = makeState({ items: { 'ma-cc-1': maCC } });

    const engine = createDraftEngine(
      (action) => dispatched.push(action),
      () => state,
      { stages: FAST_DRAFT_STAGES, detectEnrichment: true }
    );

    engine.start();
    vi.advanceTimersByTime(300); // CC stage

    expect(dispatched).toHaveLength(1);
    if (dispatched[0].type === 'DRAFT_GENERATED') {
      const draft = dispatched[0].payload.draft;
      expect(draft.label).toBe('Updated CC');
      expect(draft.enrichesItemId).toBe('ma-cc-1');
    }

    engine.stop();
  });

  it('uses standard label when no MA content exists', () => {
    const dispatched: EncounterAction[] = [];
    const state = makeState();

    const engine = createDraftEngine(
      (action) => dispatched.push(action),
      () => state,
      { stages: FAST_DRAFT_STAGES, detectEnrichment: true }
    );

    engine.start();
    vi.advanceTimersByTime(300);

    expect(dispatched).toHaveLength(1);
    if (dispatched[0].type === 'DRAFT_GENERATED') {
      expect(dispatched[0].payload.draft.label).toBe('CC Draft');
      expect(dispatched[0].payload.draft.enrichesItemId).toBeUndefined();
    }

    engine.stop();
  });
});

// ============================================================================
// 4. Engine Stop/Cleanup
// ============================================================================

describe('Draft Engine — Lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stop cancels pending timers', () => {
    const dispatched: EncounterAction[] = [];
    const state = makeState();

    const engine = createDraftEngine(
      (action) => dispatched.push(action),
      () => state,
      { stages: FAST_DRAFT_STAGES, detectEnrichment: false }
    );

    engine.start();
    expect(engine.isRunning()).toBe(true);

    // Stop before any timer fires
    engine.stop();
    expect(engine.isRunning()).toBe(false);

    // Advance past all stages
    vi.advanceTimersByTime(10000);
    expect(dispatched).toHaveLength(0);
  });

  it('start is idempotent — calling twice does not create duplicate timers', () => {
    const dispatched: EncounterAction[] = [];
    const state = makeState();

    const engine = createDraftEngine(
      (action) => dispatched.push(action),
      () => state,
      { stages: FAST_DRAFT_STAGES, detectEnrichment: false }
    );

    engine.start();
    engine.start(); // Should be no-op

    vi.advanceTimersByTime(300);
    // Only one CC draft, not two
    expect(dispatched).toHaveLength(1);

    engine.stop();
  });
});

// ============================================================================
// 5. Mock Content Coverage
// ============================================================================

describe('Mock Draft Content', () => {
  it('has content for all standard draft categories', () => {
    const categories: Array<keyof typeof MOCK_DRAFT_CONTENT> = [
      'chief-complaint', 'hpi', 'ros', 'physical-exam', 'plan', 'instruction',
    ];

    for (const category of categories) {
      const content = getMockDraftContent(category);
      expect(content.length).toBeGreaterThan(10);
    }
  });

  it('returns empty string for unsupported categories', () => {
    expect(getMockDraftContent('vitals')).toBe('');
    expect(getMockDraftContent('medication')).toBe('');
  });

  it('getMockConfidence returns valid score for supported categories', () => {
    expect(getMockConfidence('hpi')).toBeGreaterThan(0);
    expect(getMockConfidence('hpi')).toBeLessThanOrEqual(1);
    expect(getMockConfidence('plan')).toBeGreaterThan(0);
    expect(getMockConfidence('plan')).toBeLessThanOrEqual(1);
  });
});

// ============================================================================
// 6. Two-Phase Generation
// ============================================================================

describe('Draft Engine — Two-Phase Generation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dispatches DRAFT_GENERATED with generating status (shell) at stage delay', () => {
    const dispatched: EncounterAction[] = [];
    const state = makeState();

    const engine = createDraftEngine(
      (action) => dispatched.push(action),
      () => state,
      { stages: FAST_DRAFT_STAGES, detectEnrichment: false }
    );

    engine.start();
    vi.advanceTimersByTime(300); // CC stage fires (300ms for fast)

    expect(dispatched).toHaveLength(1);
    expect(dispatched[0].type).toBe('DRAFT_GENERATED');
    if (dispatched[0].type === 'DRAFT_GENERATED') {
      expect(dispatched[0].payload.draft.status).toBe('generating');
      expect(dispatched[0].payload.draft.content).toBe('');
      expect(dispatched[0].payload.draft.confidence).toBeUndefined();
    }

    engine.stop();
  });

  it('dispatches DRAFT_CONTENT_READY after generation duration', () => {
    const dispatched: EncounterAction[] = [];
    const state = makeState();

    // Use custom stage with known generationDurationMs
    const testStages = [
      { category: 'chief-complaint' as const, label: 'CC Draft', delayMs: 100, generationDurationMs: 500 },
    ];

    const engine = createDraftEngine(
      (action) => dispatched.push(action),
      () => state,
      { stages: testStages, detectEnrichment: false }
    );

    engine.start();

    // At 100ms: shell dispatched
    vi.advanceTimersByTime(100);
    expect(dispatched).toHaveLength(1);
    expect(dispatched[0].type).toBe('DRAFT_GENERATED');

    // At 600ms (100 + 500): content ready dispatched
    vi.advanceTimersByTime(500);
    expect(dispatched).toHaveLength(2);
    expect(dispatched[1].type).toBe('DRAFT_CONTENT_READY');
    if (dispatched[1].type === 'DRAFT_CONTENT_READY') {
      expect(dispatched[1].payload.content.length).toBeGreaterThan(0);
      expect(dispatched[1].payload.confidence).toBeGreaterThan(0);
    }

    engine.stop();
  });

  it('does not dispatch DRAFT_CONTENT_READY if engine is stopped', () => {
    const dispatched: EncounterAction[] = [];
    const state = makeState();

    const testStages = [
      { category: 'chief-complaint' as const, label: 'CC Draft', delayMs: 100, generationDurationMs: 500 },
    ];

    const engine = createDraftEngine(
      (action) => dispatched.push(action),
      () => state,
      { stages: testStages, detectEnrichment: false }
    );

    engine.start();
    vi.advanceTimersByTime(100); // Shell dispatched
    expect(dispatched).toHaveLength(1);

    engine.stop(); // Stop before content ready

    vi.advanceTimersByTime(1000);
    // Should still only have the 1 shell dispatch
    expect(dispatched).toHaveLength(1);
  });
});

// ============================================================================
// 7. Auto-Refresh Scheduling
// ============================================================================

describe('Draft Engine — Auto-Refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('schedules DRAFT_REFRESH after content ready + refreshDelayMs', () => {
    const dispatched: EncounterAction[] = [];
    let currentState = makeState();

    const testStages = [
      { category: 'chief-complaint' as const, label: 'CC Draft', delayMs: 100, generationDurationMs: 200 },
    ];

    const engine = createDraftEngine(
      (action) => {
        dispatched.push(action);
        // Simulate state updates for the guard checks
        if (action.type === 'DRAFT_GENERATED') {
          currentState = makeState({
            drafts: { [action.payload.draft.id]: action.payload.draft },
          });
        } else if (action.type === 'DRAFT_CONTENT_READY') {
          const existing = Object.values(currentState.entities.drafts)[0];
          if (existing) {
            currentState = makeState({
              drafts: { [existing.id]: { ...existing, status: 'pending', content: action.payload.content } },
            });
          }
        }
      },
      () => currentState,
      { stages: testStages, detectEnrichment: false, refreshDelayMs: 1000, refreshDurationMs: 300 }
    );

    engine.start();

    // t=100: shell
    vi.advanceTimersByTime(100);
    expect(dispatched).toHaveLength(1);

    // t=300: content ready
    vi.advanceTimersByTime(200);
    expect(dispatched).toHaveLength(2);
    expect(dispatched[1].type).toBe('DRAFT_CONTENT_READY');

    // t=1300: DRAFT_REFRESH (1000ms after content ready)
    vi.advanceTimersByTime(1000);
    expect(dispatched).toHaveLength(3);
    expect(dispatched[2].type).toBe('DRAFT_REFRESH');

    // t=1600: DRAFT_REFRESH_COMPLETE (300ms after refresh)
    vi.advanceTimersByTime(300);
    expect(dispatched).toHaveLength(4);
    expect(dispatched[3].type).toBe('DRAFT_REFRESH_COMPLETE');

    engine.stop();
  });

  it('does not auto-refresh if draft is no longer pending', () => {
    const dispatched: EncounterAction[] = [];
    let currentState = makeState();

    const testStages = [
      { category: 'chief-complaint' as const, label: 'CC Draft', delayMs: 100, generationDurationMs: 200 },
    ];

    const engine = createDraftEngine(
      (action) => {
        dispatched.push(action);
        if (action.type === 'DRAFT_GENERATED') {
          currentState = makeState({
            drafts: { [action.payload.draft.id]: action.payload.draft },
          });
        } else if (action.type === 'DRAFT_CONTENT_READY') {
          const existing = Object.values(currentState.entities.drafts)[0];
          if (existing) {
            // Simulate: draft was accepted before refresh kicks in
            currentState = makeState({
              drafts: { [existing.id]: { ...existing, status: 'accepted', content: action.payload.content } },
            });
          }
        }
      },
      () => currentState,
      { stages: testStages, detectEnrichment: false, refreshDelayMs: 1000, refreshDurationMs: 300 }
    );

    engine.start();

    // t=100: shell, t=300: content ready
    vi.advanceTimersByTime(300);
    expect(dispatched).toHaveLength(2);

    // t=1300: should NOT dispatch DRAFT_REFRESH (draft is accepted)
    vi.advanceTimersByTime(1000);
    expect(dispatched).toHaveLength(2); // No new dispatches

    engine.stop();
  });
});
