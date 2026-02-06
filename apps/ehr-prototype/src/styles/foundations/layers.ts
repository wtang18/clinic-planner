/**
 * Layer (z-index) Foundations
 *
 * Z-index constants for stacking context management.
 */

export const zIndex = {
  base: 0,
  docked: 10,
  dropdown: 50,
  sticky: 100,
  overlay: 150,
  modal: 200,
  popover: 250,
  toast: 300,
} as const;

export type ZIndexLevel = keyof typeof zIndex;
