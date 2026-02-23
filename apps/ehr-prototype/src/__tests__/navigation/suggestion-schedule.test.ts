/**
 * Tests for suggestion-schedule timing tables.
 *
 * Validates that getScheduleForEncounter returns correct trigger types,
 * valid item indices, and chronological delay ordering per scenario.
 */

import { describe, it, expect } from 'vitest';
import {
  getScheduleForEncounter,
  type ScheduledSuggestion,
  type SuggestionScenario,
} from '../../navigation/suggestion-schedule';
import { SUGGESTION_TEMPLATES } from '../../mocks/generators/suggestions';

// ============================================================================
// Helpers
// ============================================================================

function immediates(schedule: ScheduledSuggestion[]) {
  return schedule.filter(s => s.timing.type === 'immediate');
}

function onRecordItems(schedule: ScheduledSuggestion[]) {
  return schedule.filter(s => s.timing.type === 'onRecord');
}

function getDelays(schedule: ScheduledSuggestion[]): number[] {
  return onRecordItems(schedule).map(s =>
    s.timing.type === 'onRecord' ? s.timing.delayMs : 0,
  );
}

// ============================================================================
// UC Cough
// ============================================================================

describe('UC Cough schedule', () => {
  const schedule = getScheduleForEncounter('demo-uc');

  it('returns 6 total entries', () => {
    expect(schedule).toHaveLength(6);
  });

  it('has 0 immediate suggestions', () => {
    expect(immediates(schedule)).toHaveLength(0);
  });

  it('has 6 onRecord suggestions (3 transcription + 3 narrative)', () => {
    expect(onRecordItems(schedule)).toHaveLength(6);
  });

  it('onRecord delays are positive and in chronological order', () => {
    const delays = getDelays(schedule);
    for (const d of delays) {
      expect(d).toBeGreaterThan(0);
    }
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
    }
  });

  it('all itemIndex values are valid for their scenario template', () => {
    for (const entry of schedule) {
      const template = SUGGESTION_TEMPLATES[entry.scenario];
      expect(entry.itemIndex).toBeGreaterThanOrEqual(0);
      expect(entry.itemIndex).toBeLessThan(template.length);
    }
  });

  it('resolves identically for uc-cough alias', () => {
    expect(getScheduleForEncounter('uc-cough')).toEqual(schedule);
  });
});

// ============================================================================
// PC Diabetes
// ============================================================================

describe('PC Diabetes schedule', () => {
  const schedule = getScheduleForEncounter('demo-pc');

  it('returns 4 total entries', () => {
    expect(schedule).toHaveLength(4);
  });

  it('has 2 immediate suggestions (care gaps)', () => {
    expect(immediates(schedule)).toHaveLength(2);
  });

  it('has 2 onRecord suggestions (transcript-synced)', () => {
    expect(onRecordItems(schedule)).toHaveLength(2);
  });

  it('onRecord delays are positive and in chronological order', () => {
    const delays = getDelays(schedule);
    for (const d of delays) {
      expect(d).toBeGreaterThan(0);
    }
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
    }
  });

  it('all itemIndex values are valid for their scenario template', () => {
    for (const entry of schedule) {
      const template = SUGGESTION_TEMPLATES[entry.scenario];
      expect(entry.itemIndex).toBeGreaterThanOrEqual(0);
      expect(entry.itemIndex).toBeLessThan(template.length);
    }
  });

  it('resolves identically for pc-diabetes alias', () => {
    expect(getScheduleForEncounter('pc-diabetes')).toEqual(schedule);
  });
});

// ============================================================================
// Annual Wellness Visit
// ============================================================================

describe('AWV schedule', () => {
  const schedule = getScheduleForEncounter('demo-healthy');

  it('returns 5 total entries', () => {
    expect(schedule).toHaveLength(5);
  });

  it('all suggestions are immediate', () => {
    expect(immediates(schedule)).toHaveLength(5);
    expect(onRecordItems(schedule)).toHaveLength(0);
  });

  it('all itemIndex values are valid for their scenario template', () => {
    for (const entry of schedule) {
      const template = SUGGESTION_TEMPLATES[entry.scenario];
      expect(entry.itemIndex).toBeGreaterThanOrEqual(0);
      expect(entry.itemIndex).toBeLessThan(template.length);
    }
  });

  it('resolves identically for healthy alias', () => {
    expect(getScheduleForEncounter('healthy')).toEqual(schedule);
  });
});

// ============================================================================
// Unknown encounter
// ============================================================================

describe('unknown encounter', () => {
  it('returns empty schedule for unrecognized encounter ID', () => {
    expect(getScheduleForEncounter('unknown-encounter')).toEqual([]);
  });
});

// ============================================================================
// Cross-scenario invariants
// ============================================================================

describe('cross-scenario invariants', () => {
  const allSchedules = [
    getScheduleForEncounter('demo-uc'),
    getScheduleForEncounter('demo-pc'),
    getScheduleForEncounter('demo-healthy'),
  ];

  it('all keys are unique within each schedule', () => {
    for (const schedule of allSchedules) {
      const keys = schedule.map(s => s.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('every scenario name references a valid SUGGESTION_TEMPLATES key', () => {
    const validScenarios = new Set(Object.keys(SUGGESTION_TEMPLATES));
    for (const schedule of allSchedules) {
      for (const entry of schedule) {
        expect(validScenarios.has(entry.scenario)).toBe(true);
      }
    }
  });
});
