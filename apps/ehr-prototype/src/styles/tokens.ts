/**
 * Design Tokens
 *
 * Re-exports from @carbon-health/design-tokens (canonical source of truth)
 * and local foundations (structured convenience layer).
 */

// All primitive + semantic token constants from the shared package
export * from '@carbon-health/design-tokens/react-native';

// Structured foundations for component use
export { colors } from './foundations/colors';
export { textStyles, display, heading, title, body, label, eyebrow } from './foundations/textStyles';
export { spacing, spaceBetween, spaceAround, borderRadius } from './foundations/spacing';
export { elevation, elevationStyles } from './foundations/elevation';
export { typography } from './foundations/typography';
export { shadows } from './foundations/shadows';
export { transitions } from './foundations/motion';
export { zIndex } from './foundations/layers';

// Types
export type { Colors } from './foundations/colors';
export type { TextStyles, TextStyleDefinition } from './foundations/textStyles';
export type { Spacing, BorderRadius } from './foundations/spacing';
export type { ElevationLevel } from './foundations/elevation';
export type { Typography } from './foundations/typography';
export type { ShadowLevel } from './foundations/shadows';
export type { TransitionSpeed } from './foundations/motion';
export type { ZIndexLevel } from './foundations/layers';
