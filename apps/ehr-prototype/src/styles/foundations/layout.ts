/**
 * Layout Constants
 *
 * Single source of truth for all layout measurements in the EHR prototype.
 * These values ensure consistent alignment between the floating nav row zones
 * and the content panes below.
 */

export const LAYOUT = {
  // Pane widths
  menuWidth: 360,
  overviewWidth: 360,
  aiDrawerWidth: 320,
  railWidth: 200,

  // Floating inset (menu pane distance from viewport edges)
  floatingInset: 8,

  // Content padding within each pane type
  menuContentPadding: 20,
  overviewContentPadding: 20,
  canvasContentPadding: 20,

  // Header
  headerHeight: 60,

  // Buttons
  buttonSize: 44,
  buttonGap: 12,      // Between adjacent buttons in same group
  buttonGroupGap: 16, // Between button groups when all panes closed
} as const;

export type Layout = typeof LAYOUT;

// ============================================================================
// Rail Responsive Tiers
// ============================================================================

/**
 * Rail display variant based on available canvas width.
 * - 'full':  200px sidebar with batch summaries + compact status rows
 * - 'float': no sidebar column; a compact floating status pill keeps
 *            processing awareness visible at narrow / mobile widths
 */
export type RailTier = 'full' | 'float';

/**
 * Container-width breakpoint for rail tier transition.
 * Measures the grid container (canvas + rail + gap), not the viewport.
 *
 * FULL is set at 640 so the full rail appears at typical desktop widths
 * when menu (360px) + overview (360px) panes are both open, leaving
 * ~700px for the canvas container. Below 640 the rail collapses to a
 * floating status pill inline with content.
 */
export const RAIL_BREAKPOINTS = {
  /** Container width above which the full 200px rail is shown */
  full: 640,
} as const;

/**
 * Derive the rail tier from the measured container width.
 */
export function getRailTier(containerWidth: number): RailTier {
  if (containerWidth === 0) return 'full'; // Not yet measured — show full by default
  if (containerWidth >= RAIL_BREAKPOINTS.full) return 'full';
  return 'float';
}

/**
 * Get the rail column width for a given tier.
 */
export function getRailWidth(tier: RailTier): number {
  switch (tier) {
    case 'full': return LAYOUT.railWidth;
    case 'float': return 0;
  }
}
