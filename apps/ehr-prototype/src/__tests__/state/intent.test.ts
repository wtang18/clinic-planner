/**
 * Tests for ItemIntent type, DEFAULT_INTENT map, and resolveIntent() helper.
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_INTENT,
  resolveIntent,
  type ItemCategory,
  type ItemIntent,
} from '../../types/chart-items';

// ============================================================================
// All 16 ItemCategory values (exhaustive)
// ============================================================================

const ALL_CATEGORIES: ItemCategory[] = [
  'chief-complaint', 'hpi', 'physical-exam', 'vitals',
  'medication', 'allergy', 'lab', 'imaging', 'procedure',
  'diagnosis', 'plan', 'instruction', 'note', 'referral',
  'assessment',
];

// ============================================================================
// DEFAULT_INTENT
// ============================================================================

describe('DEFAULT_INTENT', () => {
  it('covers all 15 ItemCategory values', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(DEFAULT_INTENT[cat]).toBeDefined();
    }
    expect(Object.keys(DEFAULT_INTENT)).toHaveLength(ALL_CATEGORIES.length);
  });

  it('medication defaults to prescribe', () => {
    expect(DEFAULT_INTENT['medication']).toBe('prescribe');
  });

  it('allergy defaults to report', () => {
    expect(DEFAULT_INTENT['allergy']).toBe('report');
  });

  it('lab defaults to order', () => {
    expect(DEFAULT_INTENT['lab']).toBe('order');
  });

  it('diagnosis defaults to assess', () => {
    expect(DEFAULT_INTENT['diagnosis']).toBe('assess');
  });

  it('referral defaults to refer', () => {
    expect(DEFAULT_INTENT['referral']).toBe('refer');
  });

  it('narrative categories default to draft', () => {
    const narrativeCategories: ItemCategory[] = [
      'chief-complaint', 'hpi', 'physical-exam', 'plan', 'instruction', 'note',
    ];
    for (const cat of narrativeCategories) {
      expect(DEFAULT_INTENT[cat]).toBe('draft');
    }
  });

  it('vitals defaults to report', () => {
    expect(DEFAULT_INTENT['vitals']).toBe('report');
  });

  it('assessment defaults to assess', () => {
    expect(DEFAULT_INTENT['assessment']).toBe('assess');
  });
});

// ============================================================================
// resolveIntent
// ============================================================================

describe('resolveIntent', () => {
  it('returns explicit intent when set', () => {
    expect(resolveIntent({ category: 'medication', intent: 'report' })).toBe('report');
  });

  it('returns explicit intent for diagnosis rule-out', () => {
    expect(resolveIntent({ category: 'diagnosis', intent: 'rule-out' })).toBe('rule-out');
  });

  it('falls back to DEFAULT_INTENT when intent is undefined', () => {
    expect(resolveIntent({ category: 'medication' })).toBe('prescribe');
    expect(resolveIntent({ category: 'lab' })).toBe('order');
    expect(resolveIntent({ category: 'allergy' })).toBe('report');
    expect(resolveIntent({ category: 'diagnosis' })).toBe('assess');
    expect(resolveIntent({ category: 'hpi' })).toBe('draft');
  });

  it('falls back correctly for all categories', () => {
    for (const cat of ALL_CATEGORIES) {
      const result = resolveIntent({ category: cat });
      expect(result).toBe(DEFAULT_INTENT[cat]);
    }
  });
});
