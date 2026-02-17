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
