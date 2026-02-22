/**
 * Button Shape Resolution
 *
 * Pure mapping functions from shape names to borderRadius values.
 * Extracted into a separate .ts file so they can be unit-tested without
 * triggering react-native resolution errors from .tsx imports.
 */

import { borderRadius } from '../../styles/foundations/spacing';

// ============================================================================
// Button Shapes
// ============================================================================

export type ButtonShape = 'pill' | 'rounded' | 'rect';

/** Maps a ButtonShape to a borderRadius value. */
export function resolveButtonShape(shape: ButtonShape = 'pill'): number {
  switch (shape) {
    case 'pill': return borderRadius.full;
    case 'rounded': return borderRadius.md;
    case 'rect': return borderRadius.sm;
  }
}

// ============================================================================
// IconButton Shapes
// ============================================================================

export type IconButtonShape = 'circle' | 'rounded' | 'rect';

/** Maps an IconButtonShape to a borderRadius value. */
export function resolveIconButtonShape(shape: IconButtonShape = 'circle'): number {
  switch (shape) {
    case 'circle': return borderRadius.full;
    case 'rounded': return borderRadius.md;
    case 'rect': return borderRadius.sm;
  }
}
