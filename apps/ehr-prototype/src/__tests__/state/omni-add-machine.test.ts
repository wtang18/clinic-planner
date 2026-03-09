/**
 * OmniAdd Category Metadata Tests
 *
 * Tests the category utility functions from the original omni-add-machine
 * that are still used by the V2 omni-input system: getCategoryVariant,
 * getCategoryMeta, findCategoryByShortcut, findCategoryByPrefix,
 * PRIMARY_CATEGORIES, SECONDARY_CATEGORIES.
 *
 * Old reducer tests have been removed — the V2 state machine
 * (omni-input-machine) has its own test suite.
 */

import { describe, it, expect } from 'vitest';
import {
  getCategoryVariant,
  getCategoryMeta,
  findCategoryByShortcut,
  findCategoryByPrefix,
  PRIMARY_CATEGORIES,
  SECONDARY_CATEGORIES,
  CATEGORIES,
} from '../../components/omni-add/omni-add-machine';
import { makeCategoryPill } from '../../components/omni-add/omni-input-machine';

// ============================================================================
// Category Metadata
// ============================================================================

describe('Category metadata', () => {
  it('maps structured categories correctly', () => {
    expect(getCategoryVariant('medication')).toBe('structured');
    expect(getCategoryVariant('lab')).toBe('structured');
    expect(getCategoryVariant('diagnosis')).toBe('structured');
    expect(getCategoryVariant('imaging')).toBe('structured');
    expect(getCategoryVariant('procedure')).toBe('structured');
    expect(getCategoryVariant('allergy')).toBe('structured');
    expect(getCategoryVariant('referral')).toBe('structured');
  });

  it('maps narrative categories correctly', () => {
    expect(getCategoryVariant('chief-complaint')).toBe('narrative');
    expect(getCategoryVariant('hpi')).toBe('narrative');
    expect(getCategoryVariant('ros')).toBe('narrative');
    expect(getCategoryVariant('physical-exam')).toBe('narrative');
    expect(getCategoryVariant('plan')).toBe('narrative');
    expect(getCategoryVariant('instruction')).toBe('narrative');
    expect(getCategoryVariant('note')).toBe('narrative');
  });

  it('maps data-entry categories correctly', () => {
    expect(getCategoryVariant('vitals')).toBe('data-entry');
  });

  it('maps assessment to structured', () => {
    expect(getCategoryVariant('assessment')).toBe('structured');
  });

  it('has 5 primary categories', () => {
    expect(PRIMARY_CATEGORIES).toHaveLength(5);
    const names = PRIMARY_CATEGORIES.map(c => c.category);
    expect(names).toEqual(['medication', 'lab', 'diagnosis', 'imaging', 'procedure']);
  });

  it('has 13 secondary categories', () => {
    expect(SECONDARY_CATEGORIES).toHaveLength(13);
  });

  it('finds categories by keyboard shortcut', () => {
    expect(findCategoryByShortcut('M')).toBe('medication');
    expect(findCategoryByShortcut('m')).toBe('medication');
    expect(findCategoryByShortcut('L')).toBe('lab');
    expect(findCategoryByShortcut('D')).toBe('diagnosis');
    expect(findCategoryByShortcut('I')).toBe('imaging');
    expect(findCategoryByShortcut('P')).toBe('procedure');
    expect(findCategoryByShortcut('X')).toBeNull();
  });

  it('finds categories by prefix', () => {
    expect(findCategoryByPrefix('rx:amox')).toEqual({ category: 'medication', query: 'amox' });
    expect(findCategoryByPrefix('lab:cbc')).toEqual({ category: 'lab', query: 'cbc' });
    expect(findCategoryByPrefix('dx:bronch')).toEqual({ category: 'diagnosis', query: 'bronch' });
    expect(findCategoryByPrefix('vitals:')).toEqual({ category: 'vitals', query: '' });
    expect(findCategoryByPrefix('amoxicillin')).toBeNull();
  });

  it('returns correct meta for each category', () => {
    const meta = getCategoryMeta('medication');
    expect(meta.label).toBe('Rx');
    expect(meta.shortcut).toBe('M');
    expect(meta.prefix).toBe('rx:');
    expect(meta.primary).toBe(true);
  });

  it('finds "med:" prefix with report intent', () => {
    const result = findCategoryByPrefix('med:mucinex');
    expect(result).toEqual({ category: 'medication', query: 'mucinex', intent: 'report' });
  });

  it('finds "ro:" prefix with rule-out intent', () => {
    const result = findCategoryByPrefix('ro:cough');
    expect(result).toEqual({ category: 'diagnosis', query: 'cough', intent: 'rule-out' });
  });

  it('"rx:" prefix has no intent override', () => {
    const result = findCategoryByPrefix('rx:amox');
    expect(result).toEqual({ category: 'medication', query: 'amox' });
  });
});

// ============================================================================
// handleSpace priority — category label/prefix match vs auto-category
// ============================================================================

describe('Category label matching for handleSpace', () => {
  // Helper matching the same logic as handleSpace in OmniAddBarV2
  function findCatMatch(typed: string) {
    const lower = typed.toLowerCase();
    return CATEGORIES.find(
      c => c.label.toLowerCase() === lower
        || (c.category as string) === lower
        || c.prefix?.replace(':', '') === lower,
    );
  }

  it('"med" matches the "Med" category label (medication with report intent)', () => {
    const match = findCatMatch('med');
    expect(match).toBeDefined();
    expect(match!.category).toBe('medication');
    expect(match!.intent).toBe('report');
    expect(match!.label).toBe('Med');
  });

  it('"rx" matches the "Rx" category label (medication without intent)', () => {
    const match = findCatMatch('rx');
    expect(match).toBeDefined();
    expect(match!.category).toBe('medication');
    expect(match!.intent).toBeUndefined();
  });

  it('"r/o" matches the "R/O" category label (diagnosis with rule-out)', () => {
    const match = findCatMatch('r/o');
    expect(match).toBeDefined();
    expect(match!.category).toBe('diagnosis');
    expect(match!.intent).toBe('rule-out');
  });

  it('"ro" matches via prefix (ro:)', () => {
    const match = findCatMatch('ro');
    expect(match).toBeDefined();
    expect(match!.category).toBe('diagnosis');
    expect(match!.intent).toBe('rule-out');
  });
});

// ============================================================================
// makeCategoryPill intent propagation
// ============================================================================

describe('makeCategoryPill intent propagation', () => {
  it('creates pill with report intent and "Med" label', () => {
    const pill = makeCategoryPill('medication', 'report');
    expect(pill.label).toBe('Med');
    expect(pill.intent).toBe('report');
    expect(pill.category).toBe('medication');
  });

  it('creates pill with rule-out intent and "R/O" label', () => {
    const pill = makeCategoryPill('diagnosis', 'rule-out');
    expect(pill.label).toBe('R/O');
    expect(pill.intent).toBe('rule-out');
    expect(pill.category).toBe('diagnosis');
  });

  it('creates pill without intent — standard label "Rx"', () => {
    const pill = makeCategoryPill('medication');
    expect(pill.label).toBe('Rx');
    expect(pill.intent).toBeUndefined();
  });

  it('creates pill without intent — standard label "Dx"', () => {
    const pill = makeCategoryPill('diagnosis');
    expect(pill.label).toBe('Dx');
    expect(pill.intent).toBeUndefined();
  });
});
