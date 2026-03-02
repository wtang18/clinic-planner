/**
 * Design System Foundations
 *
 * Canonical tokens from @carbon-health/design-tokens, structured for component use.
 * All prototypes (clinic-planner, react-native-demo, ehr-prototype) share these foundations.
 */

export { colors } from './colors';
export type { Colors } from './colors';

export { textStyles, display, heading, title, body, label, eyebrow } from './textStyles';
export type { TextStyles, TextStyleDefinition } from './textStyles';

export { spacing, spaceBetween, spaceAround, borderRadius } from './spacing';
export type { Spacing, BorderRadius } from './spacing';

export { elevation, elevationStyles } from './elevation';
export type { ElevationLevel } from './elevation';

export { shadows } from './shadows';
export type { ShadowLevel } from './shadows';

export { transitions } from './motion';
export type { TransitionSpeed } from './motion';

export { zIndex } from './layers';
export type { ZIndexLevel } from './layers';

export { typography } from './typography';
export type { Typography } from './typography';

export { glass, GLASS_BUTTON_HEIGHT, GLASS_BUTTON_RADIUS } from './glass';
export type { GlassVariant } from './glass';

export { LAYOUT, RAIL_BREAKPOINTS, getRailTier, getRailWidth } from './layout';
export type { Layout, RailTier } from './layout';
