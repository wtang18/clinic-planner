/**
 * Color Foundations
 *
 * Structured color tokens from @carbon-health/design-tokens.
 * Provides grouped access to all semantic colors by usage context.
 */

import * as tokens from '@carbon-health/design-tokens/react-native';

export const colors = {
  // ============================================================================
  // Background Colors
  // ============================================================================
  bg: {
    neutral: {
      base: tokens.colorBgNeutralBase,
      min: tokens.colorBgNeutralMin,
      subtle: tokens.colorBgNeutralSubtle,
      low: tokens.colorBgNeutralLow,
      lowAccented: tokens.colorBgNeutralLowAccented,
      medium: tokens.colorBgNeutralMedium,
      inverse: tokens.colorBgNeutralInverseBase,
      inverseLow: tokens.colorBgNeutralInverseLow,
    },
    transparent: {
      min: tokens.colorBgTransparentMin,
      subtle: tokens.colorBgTransparentSubtle,
      subtleAccented: tokens.colorBgTransparentSubtleAccented,
      low: tokens.colorBgTransparentLow,
      lowAccented: tokens.colorBgTransparentLowAccented,
      medium: tokens.colorBgTransparentMedium,
      high: tokens.colorBgTransparentHigh,
      inverseMin: tokens.colorBgTransparentInverseMin,
      inverseSubtle: tokens.colorBgTransparentInverseSubtle,
      inverseLow: tokens.colorBgTransparentInverseLow,
      inverseLowAccented: tokens.colorBgTransparentInverseLowAccented,
      inverseMedium: tokens.colorBgTransparentInverseMedium,
      inverseHigh: tokens.colorBgTransparentInverseHigh,
    },
    input: {
      subtle: tokens.colorBgInputSubtle,
      subtleAccented: tokens.colorBgInputSubtleAccented,
      low: tokens.colorBgInputLow,
      lowAccented: tokens.colorBgInputLowAccented,
      medium: tokens.colorBgInputMedium,
      high: tokens.colorBgInputHigh,
      highAccented: tokens.colorBgInputHighAccented,
    },
    positive: {
      subtle: tokens.colorBgPositiveSubtle,
      low: tokens.colorBgPositiveLow,
      lowAccented: tokens.colorBgPositiveLowAccented,
      medium: tokens.colorBgPositiveMedium,
      strong: tokens.colorBgPositiveStrong,
      high: tokens.colorBgPositiveHigh,
      highAccented: tokens.colorBgPositiveHighAccented,
    },
    attention: {
      subtle: tokens.colorBgAttentionSubtle,
      low: tokens.colorBgAttentionLow,
      lowAccented: tokens.colorBgAttentionLowAccented,
      medium: tokens.colorBgAttentionMedium,
      high: tokens.colorBgAttentionHigh,
      highAccented: tokens.colorBgAttentionHighAccented,
    },
    alert: {
      subtle: tokens.colorBgAlertSubtle,
      low: tokens.colorBgAlertLow,
      lowAccented: tokens.colorBgAlertLowAccented,
      medium: tokens.colorBgAlertMedium,
      high: tokens.colorBgAlertHigh,
      highAccented: tokens.colorBgAlertHighAccented,
    },
    information: {
      subtle: tokens.colorBgInformationSubtle,
      low: tokens.colorBgInformationLow,
      lowAccented: tokens.colorBgInformationLowAccented,
      medium: tokens.colorBgInformationMedium,
      high: tokens.colorBgInformationHigh,
      highAccented: tokens.colorBgInformationHighAccented,
    },
    accent: {
      subtle: tokens.colorBgAccentSubtle,
      low: tokens.colorBgAccentLow,
      lowAccented: tokens.colorBgAccentLowAccented,
      medium: tokens.colorBgAccentMedium,
      high: tokens.colorBgAccentHigh,
      highAccented: tokens.colorBgAccentHighAccented,
    },
    generative: {
      strong: tokens.colorBgGenerativeStrong,
      high: tokens.colorBgGenerativeHigh,
      highAccented: tokens.colorBgGenerativeHighAccented,
    },
    carby: {
      default: tokens.colorBgCarbyDefault,
      defaultAccent: tokens.colorBgCarbyDefaultAccent,
      highContrast: tokens.colorBgCarbyHighContrast,
    },
  },

  // ============================================================================
  // Foreground (Text/Icon) Colors
  // ============================================================================
  fg: {
    neutral: {
      primary: tokens.colorFgNeutralPrimary,
      secondary: tokens.colorFgNeutralSecondary,
      softest: tokens.colorFgNeutralSoftest,
      softer: tokens.colorFgNeutralSofter,
      soft: tokens.colorFgNeutralSoft,
      spotReadable: tokens.colorFgNeutralSpotReadable,
      disabled: tokens.colorFgNeutralDisabled,
      inversePrimary: tokens.colorFgNeutralInversePrimary,
      inverseSecondary: tokens.colorFgNeutralInverseSecondary,
    },
    transparent: {
      softer: tokens.colorFgTransparentSofter,
      soft: tokens.colorFgTransparentSoft,
      medium: tokens.colorFgTransparentMedium,
      strong: tokens.colorFgTransparentStrong,
      inverseSofter: tokens.colorFgTransparentInverseSofter,
      inverseSoft: tokens.colorFgTransparentInverseSoft,
      inverseMedium: tokens.colorFgTransparentInverseMedium,
      inverseStrong: tokens.colorFgTransparentInverseStrong,
    },
    input: {
      primary: tokens.colorFgInputPrimary,
      secondary: tokens.colorFgInputSecondary,
      spotReadable: tokens.colorFgInputSpotReadable,
      soft: tokens.colorFgInputSoft,
    },
    positive: {
      primary: tokens.colorFgPositivePrimary,
      secondary: tokens.colorFgPositiveSecondary,
      spotReadable: tokens.colorFgPositiveSpotReadable,
      inversePrimary: tokens.colorFgPositiveInversePrimary,
      inverseSecondary: tokens.colorFgPositiveInverseSecondary,
    },
    attention: {
      primary: tokens.colorFgAttentionPrimary,
      secondary: tokens.colorFgAttentionSecondary,
    },
    alert: {
      primary: tokens.colorFgAlertPrimary,
      secondary: tokens.colorFgAlertSecondary,
      inversePrimary: tokens.colorFgAlertInversePrimary,
      inverseSecondary: tokens.colorFgAlertInverseSecondary,
    },
    information: {
      primary: tokens.colorFgInformationPrimary,
      secondary: tokens.colorFgInformationSecondary,
      spotReadable: tokens.colorFgInformationSpotReadable,
      inversePrimary: tokens.colorFgInformationInversePrimary,
      inverseSecondary: tokens.colorFgInformationInverseSecondary,
    },
    accent: {
      primary: tokens.colorFgAccentPrimary,
      secondary: tokens.colorFgAccentSecondary,
      spotReadable: tokens.colorFgAccentSpotReadable,
    },
    generative: {
      spotReadable: tokens.colorFgGenerativeSpotReadable,
      inversePrimary: tokens.colorFgGenerativeInversePrimary,
      inverseSecondary: tokens.colorFgGenerativeInverseSecondary,
    },
    carby: {
      primary: tokens.colorFgCarbyPrimary,
      secondary: tokens.colorFgCarbySecondary,
      accent: tokens.colorFgCarbyAccent,
    },
    date: {
      primary: tokens.colorFgDatePrimary,
    },
    a11y: {
      primary: tokens.colorA11yPrimary,
    },
  },

  // ============================================================================
  // Border Colors
  // (Resolved from same primitives as bg/fg — no separate border exports in RN tokens)
  // ============================================================================
  border: {
    neutral: {
      subtle: tokens.colorBgNeutralSubtle,       // #f2f2f2
      low: tokens.colorBgNeutralLow,             // #e0e0e0
      medium: tokens.colorBgNeutralLowAccented,  // #d4d4d4
    },
    input: {
      high: tokens.colorBgInputHigh,             // #386b8a
    },
    alert: {
      high: tokens.colorBgAlertHigh,             // #b3403b
    },
    positive: {
      high: tokens.colorBgPositiveHigh,          // #24734f
    },
    accent: {
      low: tokens.colorBgAccentLow,              // #e8e3ed
      medium: tokens.colorBgAccentMedium,
    },
    a11y: {
      primary: tokens.colorA11yPrimary,          // #4578ff
    },
  },
} as const;

export type Colors = typeof colors;
