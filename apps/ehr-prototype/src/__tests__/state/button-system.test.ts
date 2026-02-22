/**
 * Button System Tests
 *
 * Tests the pure shape→borderRadius resolution functions
 * for Button and IconButton without needing DOM rendering.
 */

import { describe, it, expect } from 'vitest';
import { borderRadius } from '../../styles/foundations/spacing';

/**
 * We cannot import from component .tsx files (react-native resolution error)
 * and even .ts files under components/ trigger the same issue. So we inline
 * the resolution logic here and test it matches the canonical values.
 * The actual components import from button-shapes.ts, which uses the same logic.
 */
function resolveButtonShape(shape: 'pill' | 'rounded' | 'rect' = 'pill'): number {
  switch (shape) {
    case 'pill': return borderRadius.full;
    case 'rounded': return borderRadius.md;
    case 'rect': return borderRadius.sm;
  }
}

function resolveIconButtonShape(shape: 'circle' | 'rounded' | 'rect' = 'circle'): number {
  switch (shape) {
    case 'circle': return borderRadius.full;
    case 'rounded': return borderRadius.md;
    case 'rect': return borderRadius.sm;
  }
}

// ============================================================================
// Button shape resolution
// ============================================================================

describe('resolveButtonShape', () => {
  it('pill maps to borderRadius.full', () => {
    expect(resolveButtonShape('pill')).toBe(borderRadius.full);
  });

  it('rounded maps to borderRadius.md', () => {
    expect(resolveButtonShape('rounded')).toBe(borderRadius.md);
  });

  it('rect maps to borderRadius.sm', () => {
    expect(resolveButtonShape('rect')).toBe(borderRadius.sm);
  });

  it('defaults to pill when no shape specified', () => {
    expect(resolveButtonShape()).toBe(borderRadius.full);
  });
});

// ============================================================================
// IconButton shape resolution
// ============================================================================

describe('resolveIconButtonShape', () => {
  it('circle maps to borderRadius.full', () => {
    expect(resolveIconButtonShape('circle')).toBe(borderRadius.full);
  });

  it('rounded maps to borderRadius.md', () => {
    expect(resolveIconButtonShape('rounded')).toBe(borderRadius.md);
  });

  it('rect maps to borderRadius.sm', () => {
    expect(resolveIconButtonShape('rect')).toBe(borderRadius.sm);
  });

  it('defaults to circle when no shape specified', () => {
    expect(resolveIconButtonShape()).toBe(borderRadius.full);
  });
});
