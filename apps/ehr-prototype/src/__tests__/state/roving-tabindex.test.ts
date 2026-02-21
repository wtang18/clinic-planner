/**
 * Roving Tabindex Tests
 *
 * Tests for the pure helper functions exported from useRovingTabindex.
 * These are safe to import in tests (no React component tree needed).
 */

import { describe, it, expect } from 'vitest';
import { computeNextIndex, clampIndex } from '../../components/omni-add/useRovingTabindex';

// ============================================================================
// computeNextIndex
// ============================================================================

describe('computeNextIndex', () => {
  it('ArrowRight mid-list advances by one', () => {
    expect(computeNextIndex('ArrowRight', 2, 5)).toBe(3);
  });

  it('ArrowRight at end wraps to 0', () => {
    expect(computeNextIndex('ArrowRight', 4, 5)).toBe(0);
  });

  it('ArrowLeft mid-list goes back by one', () => {
    expect(computeNextIndex('ArrowLeft', 2, 5)).toBe(1);
  });

  it('ArrowLeft at start wraps to end', () => {
    expect(computeNextIndex('ArrowLeft', 0, 5)).toBe(4);
  });

  it('Home returns 0', () => {
    expect(computeNextIndex('Home', 3, 5)).toBe(0);
  });

  it('End returns count - 1', () => {
    expect(computeNextIndex('End', 1, 5)).toBe(4);
  });

  it('returns null for count 0', () => {
    expect(computeNextIndex('ArrowRight', 0, 0)).toBeNull();
    expect(computeNextIndex('ArrowLeft', 0, 0)).toBeNull();
    expect(computeNextIndex('Home', 0, 0)).toBeNull();
    expect(computeNextIndex('End', 0, 0)).toBeNull();
  });

  it('count 1 — arrows stay at 0', () => {
    expect(computeNextIndex('ArrowRight', 0, 1)).toBe(0);
    expect(computeNextIndex('ArrowLeft', 0, 1)).toBe(0);
  });

  it('returns null for unhandled keys', () => {
    expect(computeNextIndex('Tab', 0, 5)).toBeNull();
    expect(computeNextIndex('Escape', 2, 5)).toBeNull();
    expect(computeNextIndex('a', 0, 3)).toBeNull();
  });
});

// ============================================================================
// clampIndex
// ============================================================================

describe('clampIndex', () => {
  it('within range stays unchanged', () => {
    expect(clampIndex(2, 5)).toBe(2);
  });

  it('over range clamps to count - 1', () => {
    expect(clampIndex(7, 3)).toBe(2);
  });

  it('zero count returns 0', () => {
    expect(clampIndex(0, 0)).toBe(0);
    expect(clampIndex(5, 0)).toBe(0);
  });

  it('negative index clamps to 0', () => {
    expect(clampIndex(-1, 5)).toBe(0);
  });
});
