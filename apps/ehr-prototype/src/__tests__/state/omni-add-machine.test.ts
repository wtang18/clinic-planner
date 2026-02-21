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
} from '../../components/omni-add/omni-add-machine';

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

  it('maps data-entry category correctly', () => {
    expect(getCategoryVariant('vitals')).toBe('data-entry');
  });

  it('has 5 primary categories', () => {
    expect(PRIMARY_CATEGORIES).toHaveLength(5);
    const names = PRIMARY_CATEGORIES.map(c => c.category);
    expect(names).toEqual(['medication', 'lab', 'diagnosis', 'imaging', 'procedure']);
  });

  it('has 10 secondary categories', () => {
    expect(SECONDARY_CATEGORIES).toHaveLength(10);
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
});
