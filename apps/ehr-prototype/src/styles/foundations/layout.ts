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
  railGutterWidth: 40,

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
 * - 'full':   200px rail with batch summaries + compact status rows
 * - 'gutter': 40px icon strip with tappable popovers
 * - 'hidden': rail not rendered (mobile / very narrow)
 */
export type RailTier = 'full' | 'gutter' | 'hidden';

/**
 * Container-width breakpoints for rail tier transitions.
 * These measure the grid container (canvas + rail + gap), not the viewport.
 *
 * - Above FULL: 200px rail, canvas gets remainder (~440px+)
 * - Above GUTTER: 40px gutter, canvas gets remainder (~400px+)
 * - Below GUTTER: rail hidden, canvas gets full width
 *
 * FULL is set at 640 so the full rail appears at typical desktop widths
 * when menu (360px) + overview (360px) panes are both open, leaving
 * ~700px for the canvas container.
 */
export const RAIL_BREAKPOINTS = {
  /** Container width above which the full 200px rail is shown */
  full: 640,
  /** Container width above which the 40px gutter is shown */
  gutter: 440,
} as const;

/**
 * Derive the rail tier from the measured container width.
 */
export function getRailTier(containerWidth: number): RailTier {
  if (containerWidth === 0) return 'full'; // Not yet measured — show full by default
  if (containerWidth >= RAIL_BREAKPOINTS.full) return 'full';
  if (containerWidth >= RAIL_BREAKPOINTS.gutter) return 'gutter';
  return 'hidden';
}

/**
 * Get the rail column width for a given tier.
 */
export function getRailWidth(tier: RailTier): number {
  switch (tier) {
    case 'full': return LAYOUT.railWidth;
    case 'gutter': return LAYOUT.railGutterWidth;
    case 'hidden': return 0;
  }
}
