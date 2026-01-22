/**
 * Theme Token Mappings
 *
 * This file maps semantic color token names to primitive color values for light and dark modes.
 * Following the web design system pattern: same token names, different primitive mappings per theme.
 *
 * Key principle: Components always use the same token names (e.g., theme.colorBgNeutralBase)
 * The value changes automatically based on the current theme mode.
 */

import * as primitives from '@carbon-health/design-tokens/react-native';

export type ThemeTokens = typeof lightTokens;

/**
 * Light Mode Token Mappings
 * Optimized for light backgrounds with dark text
 */
export const lightTokens = {
  // Background - Neutral
  colorBgNeutralBase: primitives.colorBgNeutralBase,
  colorBgNeutralMin: primitives.colorBgNeutralMin,
  colorBgNeutralSubtle: primitives.colorBgNeutralSubtle,
  colorBgNeutralLow: primitives.colorBgNeutralLow,
  colorBgNeutralLowAccented: primitives.colorBgNeutralLowAccented,
  colorBgNeutralMedium: primitives.colorBgNeutralMedium,
  colorBgNeutralInverseBase: primitives.colorBgNeutralInverseBase,
  colorBgNeutralInverseLow: primitives.colorBgNeutralInverseLow,

  // Background - Transparent
  colorBgTransparentMin: primitives.colorBgTransparentMin,
  colorBgTransparentSubtle: primitives.colorBgTransparentSubtle,
  colorBgTransparentSubtleAccented: primitives.colorBgTransparentSubtleAccented,
  colorBgTransparentLow: primitives.colorBgTransparentLow,
  colorBgTransparentLowAccented: primitives.colorBgTransparentLowAccented,
  colorBgTransparentMedium: primitives.colorBgTransparentMedium,
  colorBgTransparentHigh: primitives.colorBgTransparentHigh,
  colorBgTransparentInverseMin: primitives.colorBgTransparentInverseMin,
  colorBgTransparentInverseSubtle: primitives.colorBgTransparentInverseSubtle,
  colorBgTransparentInverseSubtleAccented: primitives.colorBgTransparentInverseSubtleAccented,
  colorBgTransparentInverseLow: primitives.colorBgTransparentInverseLow,
  colorBgTransparentInverseLowAccented: primitives.colorBgTransparentInverseLowAccented,
  colorBgTransparentInverseMedium: primitives.colorBgTransparentInverseMedium,
  colorBgTransparentInverseHigh: primitives.colorBgTransparentInverseHigh,

  // Foreground - Neutral
  colorFgNeutralPrimary: primitives.colorFgNeutralPrimary,
  colorFgNeutralSecondary: primitives.colorFgNeutralSecondary,
  colorFgNeutralSoftest: primitives.colorFgNeutralSoftest,
  colorFgNeutralSofter: primitives.colorFgNeutralSofter,
  colorFgNeutralSoft: primitives.colorFgNeutralSoft,
  colorFgNeutralSpotReadable: primitives.colorFgNeutralSpotReadable,
  colorFgNeutralDisabled: primitives.colorFgNeutralDisabled,
  colorFgNeutralInversePrimary: primitives.colorFgNeutralInversePrimary,
  colorFgNeutralInverseSecondary: primitives.colorFgNeutralInverseSecondary,

  // Foreground - Transparent
  colorFgTransparentSofter: primitives.colorFgTransparentSofter,
  colorFgTransparentSoft: primitives.colorFgTransparentSoft,
  colorFgTransparentMedium: primitives.colorFgTransparentMedium,
  colorFgTransparentStrong: primitives.colorFgTransparentStrong,
  colorFgTransparentInverseSofter: primitives.colorFgTransparentInverseSofter,
  colorFgTransparentInverseSoft: primitives.colorFgTransparentInverseSoft,
  colorFgTransparentInverseMedium: primitives.colorFgTransparentInverseMedium,
  colorFgTransparentInverseStrong: primitives.colorFgTransparentInverseStrong,

  // Semantic - Input
  colorBgInputSubtle: primitives.colorBgInputSubtle,
  colorBgInputSubtleAccented: primitives.colorBgInputSubtleAccented,
  colorBgInputLow: primitives.colorBgInputLow,
  colorBgInputLowAccented: primitives.colorBgInputLowAccented,
  colorBgInputMedium: primitives.colorBgInputMedium,
  colorBgInputHigh: primitives.colorBgInputHigh,
  colorBgInputHighAccented: primitives.colorBgInputHighAccented,
  colorFgInputPrimary: primitives.colorFgInputPrimary,
  colorFgInputSecondary: primitives.colorFgInputSecondary,
  colorFgInputSpotReadable: primitives.colorFgInputSpotReadable,
  colorFgInputSoft: primitives.colorFgInputSoft,

  // Semantic - Positive
  colorBgPositiveSubtle: primitives.colorBgPositiveSubtle,
  colorBgPositiveLow: primitives.colorBgPositiveLow,
  colorBgPositiveLowAccented: primitives.colorBgPositiveLowAccented,
  colorBgPositiveMedium: primitives.colorBgPositiveMedium,
  colorBgPositiveStrong: primitives.colorBgPositiveStrong,
  colorBgPositiveHigh: primitives.colorBgPositiveHigh,
  colorBgPositiveHighAccented: primitives.colorBgPositiveHighAccented,
  colorFgPositivePrimary: primitives.colorFgPositivePrimary,
  colorFgPositiveSecondary: primitives.colorFgPositiveSecondary,
  colorFgPositiveSpotReadable: primitives.colorFgPositiveSpotReadable,
  colorFgPositiveInversePrimary: primitives.colorFgPositiveInversePrimary,
  colorFgPositiveInverseSecondary: primitives.colorFgPositiveInverseSecondary,

  // Semantic - Attention
  colorBgAttentionSubtle: primitives.colorBgAttentionSubtle,
  colorBgAttentionLow: primitives.colorBgAttentionLow,
  colorBgAttentionLowAccented: primitives.colorBgAttentionLowAccented,
  colorBgAttentionMedium: primitives.colorBgAttentionMedium,
  colorBgAttentionHigh: primitives.colorBgAttentionHigh,
  colorBgAttentionHighAccented: primitives.colorBgAttentionHighAccented,
  colorFgAttentionPrimary: primitives.colorFgAttentionPrimary,
  colorFgAttentionSecondary: primitives.colorFgAttentionSecondary,

  // Semantic - Alert
  colorBgAlertSubtle: primitives.colorBgAlertSubtle,
  colorBgAlertLow: primitives.colorBgAlertLow,
  colorBgAlertLowAccented: primitives.colorBgAlertLowAccented,
  colorBgAlertMedium: primitives.colorBgAlertMedium,
  colorBgAlertHigh: primitives.colorBgAlertHigh,
  colorBgAlertHighAccented: primitives.colorBgAlertHighAccented,
  colorFgAlertPrimary: primitives.colorFgAlertPrimary,
  colorFgAlertSecondary: primitives.colorFgAlertSecondary,
  colorFgAlertInversePrimary: primitives.colorFgAlertInversePrimary,
  colorFgAlertInverseSecondary: primitives.colorFgAlertInverseSecondary,

  // Semantic - Information
  colorBgInformationSubtle: primitives.colorBgInformationSubtle,
  colorBgInformationLow: primitives.colorBgInformationLow,
  colorBgInformationLowAccented: primitives.colorBgInformationLowAccented,
  colorBgInformationMedium: primitives.colorBgInformationMedium,
  colorBgInformationHigh: primitives.colorBgInformationHigh,
  colorBgInformationHighAccented: primitives.colorBgInformationHighAccented,
  colorFgInformationPrimary: primitives.colorFgInformationPrimary,
  colorFgInformationSecondary: primitives.colorFgInformationSecondary,
  colorFgInformationSpotReadable: primitives.colorFgInformationSpotReadable,
  colorFgInformationInversePrimary: primitives.colorFgInformationInversePrimary,
  colorFgInformationInverseSecondary: primitives.colorFgInformationInverseSecondary,

  // Semantic - Accent
  colorBgAccentSubtle: primitives.colorBgAccentSubtle,
  colorBgAccentLow: primitives.colorBgAccentLow,
  colorBgAccentLowAccented: primitives.colorBgAccentLowAccented,
  colorBgAccentMedium: primitives.colorBgAccentMedium,
  colorBgAccentHigh: primitives.colorBgAccentHigh,
  colorBgAccentHighAccented: primitives.colorBgAccentHighAccented,
  colorFgAccentPrimary: primitives.colorFgAccentPrimary,
  colorFgAccentSecondary: primitives.colorFgAccentSecondary,
  colorFgAccentSpotReadable: primitives.colorFgAccentSpotReadable,

  // Semantic - Generative/Carby
  colorBgGenerativeStrong: primitives.colorBgGenerativeStrong,
  colorBgGenerativeHigh: primitives.colorBgGenerativeHigh,
  colorBgGenerativeHighAccented: primitives.colorBgGenerativeHighAccented,
  colorFgGenerativeSpotReadable: primitives.colorFgGenerativeSpotReadable,
  colorFgGenerativeInversePrimary: primitives.colorFgGenerativeInversePrimary,
  colorFgGenerativeInverseSecondary: primitives.colorFgGenerativeInverseSecondary,
  colorBgCarbyDefault: primitives.colorBgCarbyDefault,
  colorBgCarbyDefaultAccent: primitives.colorBgCarbyDefaultAccent,
  colorBgCarbyHighContrast: primitives.colorBgCarbyHighContrast,
  colorFgCarbyPrimary: primitives.colorFgCarbyPrimary,
  colorFgCarbySecondary: primitives.colorFgCarbySecondary,
  colorFgCarbyAccent: primitives.colorFgCarbyAccent,

  // Special
  colorFgDatePrimary: primitives.colorFgDatePrimary,
  colorA11yPrimary: primitives.colorA11yPrimary,
};

/**
 * Dark Mode Token Mappings
 * Optimized for dark backgrounds with light text
 *
 * Key transformations:
 * - Base backgrounds use inverse tokens (black instead of white)
 * - Foreground colors use inverse tokens (white instead of black)
 * - Transparent overlays use white alpha instead of black alpha
 * - Semantic colors maintain their hue but adjust for dark backgrounds
 */
export const darkTokens: ThemeTokens = {
  // Background - Neutral (inverted)
  colorBgNeutralBase: primitives.colorBgNeutralInverseBase,
  colorBgNeutralMin: primitives.colorGray900,
  colorBgNeutralSubtle: primitives.colorGray800,
  colorBgNeutralLow: primitives.colorGray700,
  colorBgNeutralLowAccented: primitives.colorGray600,
  colorBgNeutralMedium: primitives.colorGray600,
  colorBgNeutralInverseBase: primitives.colorBgNeutralBase,
  colorBgNeutralInverseLow: primitives.colorGray200,

  // Background - Transparent (inverted)
  colorBgTransparentMin: primitives.colorBgTransparentInverseMin,
  colorBgTransparentSubtle: primitives.colorBgTransparentInverseSubtle,
  colorBgTransparentSubtleAccented: primitives.colorBgTransparentInverseSubtleAccented,
  colorBgTransparentLow: primitives.colorBgTransparentInverseLow,
  colorBgTransparentLowAccented: primitives.colorBgTransparentInverseLowAccented,
  colorBgTransparentMedium: primitives.colorBgTransparentInverseMedium,
  colorBgTransparentHigh: primitives.colorBgTransparentInverseHigh,
  colorBgTransparentInverseMin: primitives.colorBgTransparentMin,
  colorBgTransparentInverseSubtle: primitives.colorBgTransparentSubtle,
  colorBgTransparentInverseSubtleAccented: primitives.colorBgTransparentSubtleAccented,
  colorBgTransparentInverseLow: primitives.colorBgTransparentLow,
  colorBgTransparentInverseLowAccented: primitives.colorBgTransparentLowAccented,
  colorBgTransparentInverseMedium: primitives.colorBgTransparentMedium,
  colorBgTransparentInverseHigh: primitives.colorBgTransparentHigh,

  // Foreground - Neutral (inverted)
  colorFgNeutralPrimary: primitives.colorFgNeutralInversePrimary,
  colorFgNeutralSecondary: primitives.colorGray200,
  colorFgNeutralSoftest: primitives.colorGray800,
  colorFgNeutralSofter: primitives.colorGray700,
  colorFgNeutralSoft: primitives.colorGray600,
  colorFgNeutralSpotReadable: primitives.colorGray400,
  colorFgNeutralDisabled: primitives.colorGray400,
  colorFgNeutralInversePrimary: primitives.colorFgNeutralPrimary,
  colorFgNeutralInverseSecondary: primitives.colorGray800,

  // Foreground - Transparent (inverted)
  colorFgTransparentSofter: primitives.colorFgTransparentInverseSofter,
  colorFgTransparentSoft: primitives.colorFgTransparentInverseSoft,
  colorFgTransparentMedium: primitives.colorFgTransparentInverseMedium,
  colorFgTransparentStrong: primitives.colorFgTransparentInverseStrong,
  colorFgTransparentInverseSofter: primitives.colorFgTransparentSofter,
  colorFgTransparentInverseSoft: primitives.colorFgTransparentSoft,
  colorFgTransparentInverseMedium: primitives.colorFgTransparentMedium,
  colorFgTransparentInverseStrong: primitives.colorFgTransparentStrong,

  // Semantic - Input (darker variants)
  colorBgInputSubtle: primitives.colorBlue800,
  colorBgInputSubtleAccented: primitives.colorBlue700,
  colorBgInputLow: primitives.colorBlue700,
  colorBgInputLowAccented: primitives.colorBlue600,
  colorBgInputMedium: primitives.colorBlue600,
  colorBgInputHigh: primitives.colorBlue300,
  colorBgInputHighAccented: primitives.colorBlue200,
  colorFgInputPrimary: primitives.colorBlue100,
  colorFgInputSecondary: primitives.colorBlue200,
  colorFgInputSpotReadable: primitives.colorBlue400,
  colorFgInputSoft: primitives.colorBlue600,

  // Semantic - Positive (darker variants)
  colorBgPositiveSubtle: primitives.colorGreen800,
  colorBgPositiveLow: primitives.colorGreen700,
  colorBgPositiveLowAccented: primitives.colorGreen600,
  colorBgPositiveMedium: primitives.colorGreen600,
  colorBgPositiveStrong: primitives.colorGreen400,
  colorBgPositiveHigh: primitives.colorGreen300,
  colorBgPositiveHighAccented: primitives.colorGreen200,
  colorFgPositivePrimary: primitives.colorGreen100,
  colorFgPositiveSecondary: primitives.colorGreen200,
  colorFgPositiveSpotReadable: primitives.colorGreen400,
  colorFgPositiveInversePrimary: primitives.colorGreen800,
  colorFgPositiveInverseSecondary: primitives.colorGreen700,

  // Semantic - Attention (darker variants)
  colorBgAttentionSubtle: primitives.colorYellow800,
  colorBgAttentionLow: primitives.colorYellow700,
  colorBgAttentionLowAccented: primitives.colorYellow600,
  colorBgAttentionMedium: primitives.colorYellow600,
  colorBgAttentionHigh: primitives.colorYellow300,
  colorBgAttentionHighAccented: primitives.colorYellow200,
  colorFgAttentionPrimary: primitives.colorYellow100,
  colorFgAttentionSecondary: primitives.colorYellow200,

  // Semantic - Alert (darker variants)
  colorBgAlertSubtle: primitives.colorSaturatedRed800,
  colorBgAlertLow: primitives.colorSaturatedRed700,
  colorBgAlertLowAccented: primitives.colorSaturatedRed600,
  colorBgAlertMedium: primitives.colorSaturatedRed600,
  colorBgAlertHigh: primitives.colorSaturatedRed300,
  colorBgAlertHighAccented: primitives.colorSaturatedRed200,
  colorFgAlertPrimary: primitives.colorSaturatedRed100,
  colorFgAlertSecondary: primitives.colorSaturatedRed200,
  colorFgAlertInversePrimary: primitives.colorSaturatedRed800,
  colorFgAlertInverseSecondary: primitives.colorSaturatedRed700,

  // Semantic - Information (darker variants)
  colorBgInformationSubtle: primitives.colorBlue800,
  colorBgInformationLow: primitives.colorBlue700,
  colorBgInformationLowAccented: primitives.colorBlue600,
  colorBgInformationMedium: primitives.colorBlue600,
  colorBgInformationHigh: primitives.colorBlue300,
  colorBgInformationHighAccented: primitives.colorBlue200,
  colorFgInformationPrimary: primitives.colorBlue100,
  colorFgInformationSecondary: primitives.colorBlue200,
  colorFgInformationSpotReadable: primitives.colorBlue400,
  colorFgInformationInversePrimary: primitives.colorBlue800,
  colorFgInformationInverseSecondary: primitives.colorBlue700,

  // Semantic - Accent (darker variants)
  colorBgAccentSubtle: primitives.colorPurple800,
  colorBgAccentLow: primitives.colorPurple700,
  colorBgAccentLowAccented: primitives.colorPurple600,
  colorBgAccentMedium: primitives.colorPurple600,
  colorBgAccentHigh: primitives.colorPurple300,
  colorBgAccentHighAccented: primitives.colorPurple200,
  colorFgAccentPrimary: primitives.colorPurple100,
  colorFgAccentSecondary: primitives.colorPurple200,
  colorFgAccentSpotReadable: primitives.colorPurple400,

  // Semantic - Generative/Carby (maintain brand colors)
  colorBgGenerativeStrong: primitives.colorGreen400,
  colorBgGenerativeHigh: primitives.colorGreen300,
  colorBgGenerativeHighAccented: primitives.colorGreen200,
  colorFgGenerativeSpotReadable: primitives.colorGreen400,
  colorFgGenerativeInversePrimary: primitives.colorGreen800,
  colorFgGenerativeInverseSecondary: primitives.colorGreen700,
  colorBgCarbyDefault: primitives.colorBgCarbyDefault,
  colorBgCarbyDefaultAccent: primitives.colorBgCarbyDefaultAccent,
  colorBgCarbyHighContrast: primitives.colorGreen100,
  colorFgCarbyPrimary: primitives.colorWhiteSolid,
  colorFgCarbySecondary: primitives.colorGreen100,
  colorFgCarbyAccent: primitives.colorBgCarbyDefault,

  // Special
  colorFgDatePrimary: primitives.colorSaturatedRed400,
  colorA11yPrimary: primitives.colorUtilityA11yBlue,
};
