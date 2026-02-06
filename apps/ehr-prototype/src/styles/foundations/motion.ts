/**
 * Motion Foundations
 *
 * Transition and animation constants for web components.
 */

export const transitions = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
} as const;

export type TransitionSpeed = keyof typeof transitions;
