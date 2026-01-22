/**
 * Generates Tailwind theme config from Style Dictionary tokens for React Native
 *
 * Run: npm run tokens:build:tailwind
 *
 * This reads from: dist/react-native/tokens.js
 * And outputs to: dist/react-native/tailwind-theme.js
 */

const fs = require('fs');
const path = require('path');

// Import tokens
const tokensPath = path.join(__dirname, '../dist/react-native/tokens.js');
let tokens;

try {
  // Clear require cache to get fresh tokens
  delete require.cache[require.resolve(tokensPath)];
  tokens = require(tokensPath);
} catch (error) {
  console.error('❌ Failed to load tokens:', error.message);
  console.error('   Run "npm run tokens:build:react-native" first');
  process.exit(1);
}

// Helper to extract value from token
const getValue = (token) => {
  if (token === undefined) return undefined;
  if (typeof token === 'string') return token;
  if (token?.original) return token.original;
  return token;
};

const getNumber = (token) => {
  if (token === undefined) return undefined;
  if (typeof token === 'number') return token;
  if (token?.number !== undefined) return token.number;
  return parseInt(token) || 0;
};

// Build theme sections
const theme = {
  colors: {},
  spacing: {},
  borderRadius: {},
  fontSize: {},
  lineHeight: {},
  fontFamily: {},
};

// ============================================
// COLORS - Semantic tokens only
// ============================================

const colorMappings = [
  // Background - Neutral
  ['bg-neutral-base', 'colorBgNeutralBase'],
  ['bg-neutral-min', 'colorBgNeutralMin'],
  ['bg-neutral-subtle', 'colorBgNeutralSubtle'],
  ['bg-neutral-low', 'colorBgNeutralLow'],
  ['bg-neutral-low-accented', 'colorBgNeutralLowAccented'],
  ['bg-neutral-medium', 'colorBgNeutralMedium'],
  ['bg-neutral-inverse', 'colorBgNeutralInverseBase'],
  ['bg-neutral-inverse-low', 'colorBgNeutralInverseLow'],

  // Background - Transparent
  ['bg-transparent-min', 'colorBgTransparentMin'],
  ['bg-transparent-subtle', 'colorBgTransparentSubtle'],
  ['bg-transparent-subtle-accented', 'colorBgTransparentSubtleAccented'],
  ['bg-transparent-low', 'colorBgTransparentLow'],
  ['bg-transparent-low-accented', 'colorBgTransparentLowAccented'],
  ['bg-transparent-medium', 'colorBgTransparentMedium'],
  ['bg-transparent-high', 'colorBgTransparentHigh'],
  ['bg-transparent-inverse-min', 'colorBgTransparentInverseMin'],
  ['bg-transparent-inverse-subtle', 'colorBgTransparentInverseSubtle'],
  ['bg-transparent-inverse-low', 'colorBgTransparentInverseLow'],
  ['bg-transparent-inverse-medium', 'colorBgTransparentInverseMedium'],
  ['bg-transparent-inverse-high', 'colorBgTransparentInverseHigh'],

  // Background - Input
  ['bg-input-subtle', 'colorBgInputSubtle'],
  ['bg-input-subtle-accented', 'colorBgInputSubtleAccented'],
  ['bg-input-low', 'colorBgInputLow'],
  ['bg-input-low-accented', 'colorBgInputLowAccented'],
  ['bg-input-medium', 'colorBgInputMedium'],
  ['bg-input-high', 'colorBgInputHigh'],
  ['bg-input-high-accented', 'colorBgInputHighAccented'],

  // Background - Positive
  ['bg-positive-subtle', 'colorBgPositiveSubtle'],
  ['bg-positive-low', 'colorBgPositiveLow'],
  ['bg-positive-low-accented', 'colorBgPositiveLowAccented'],
  ['bg-positive-medium', 'colorBgPositiveMedium'],
  ['bg-positive-strong', 'colorBgPositiveStrong'],
  ['bg-positive-high', 'colorBgPositiveHigh'],
  ['bg-positive-high-accented', 'colorBgPositiveHighAccented'],

  // Background - Attention
  ['bg-attention-subtle', 'colorBgAttentionSubtle'],
  ['bg-attention-low', 'colorBgAttentionLow'],
  ['bg-attention-low-accented', 'colorBgAttentionLowAccented'],
  ['bg-attention-medium', 'colorBgAttentionMedium'],
  ['bg-attention-high', 'colorBgAttentionHigh'],
  ['bg-attention-high-accented', 'colorBgAttentionHighAccented'],

  // Background - Alert
  ['bg-alert-subtle', 'colorBgAlertSubtle'],
  ['bg-alert-low', 'colorBgAlertLow'],
  ['bg-alert-low-accented', 'colorBgAlertLowAccented'],
  ['bg-alert-medium', 'colorBgAlertMedium'],
  ['bg-alert-high', 'colorBgAlertHigh'],
  ['bg-alert-high-accented', 'colorBgAlertHighAccented'],

  // Background - Information
  ['bg-information-subtle', 'colorBgInformationSubtle'],
  ['bg-information-low', 'colorBgInformationLow'],
  ['bg-information-low-accented', 'colorBgInformationLowAccented'],
  ['bg-information-medium', 'colorBgInformationMedium'],
  ['bg-information-high', 'colorBgInformationHigh'],
  ['bg-information-high-accented', 'colorBgInformationHighAccented'],

  // Background - Accent
  ['bg-accent-subtle', 'colorBgAccentSubtle'],
  ['bg-accent-low', 'colorBgAccentLow'],
  ['bg-accent-low-accented', 'colorBgAccentLowAccented'],
  ['bg-accent-medium', 'colorBgAccentMedium'],
  ['bg-accent-high', 'colorBgAccentHigh'],
  ['bg-accent-high-accented', 'colorBgAccentHighAccented'],

  // Background - Generative/Carby
  ['bg-generative-strong', 'colorBgGenerativeStrong'],
  ['bg-generative-high', 'colorBgGenerativeHigh'],
  ['bg-generative-high-accented', 'colorBgGenerativeHighAccented'],
  ['bg-carby-default', 'colorBgCarbyDefault'],
  ['bg-carby-default-accent', 'colorBgCarbyDefaultAccent'],
  ['bg-carby-high-contrast', 'colorBgCarbyHighContrast'],

  // Foreground - Neutral
  ['fg-neutral-primary', 'colorFgNeutralPrimary'],
  ['fg-neutral-secondary', 'colorFgNeutralSecondary'],
  ['fg-neutral-softest', 'colorFgNeutralSoftest'],
  ['fg-neutral-softer', 'colorFgNeutralSofter'],
  ['fg-neutral-soft', 'colorFgNeutralSoft'],
  ['fg-neutral-spot-readable', 'colorFgNeutralSpotReadable'],
  ['fg-neutral-disabled', 'colorFgNeutralDisabled'],
  ['fg-neutral-inverse-primary', 'colorFgNeutralInversePrimary'],
  ['fg-neutral-inverse-secondary', 'colorFgNeutralInverseSecondary'],

  // Foreground - Transparent
  ['fg-transparent-softer', 'colorFgTransparentSofter'],
  ['fg-transparent-soft', 'colorFgTransparentSoft'],
  ['fg-transparent-medium', 'colorFgTransparentMedium'],
  ['fg-transparent-strong', 'colorFgTransparentStrong'],
  ['fg-transparent-inverse-softer', 'colorFgTransparentInverseSofter'],
  ['fg-transparent-inverse-soft', 'colorFgTransparentInverseSoft'],
  ['fg-transparent-inverse-medium', 'colorFgTransparentInverseMedium'],
  ['fg-transparent-inverse-strong', 'colorFgTransparentInverseStrong'],

  // Foreground - Input
  ['fg-input-primary', 'colorFgInputPrimary'],
  ['fg-input-secondary', 'colorFgInputSecondary'],
  ['fg-input-spot-readable', 'colorFgInputSpotReadable'],
  ['fg-input-soft', 'colorFgInputSoft'],

  // Foreground - Positive
  ['fg-positive-primary', 'colorFgPositivePrimary'],
  ['fg-positive-secondary', 'colorFgPositiveSecondary'],
  ['fg-positive-spot-readable', 'colorFgPositiveSpotReadable'],
  ['fg-positive-inverse-primary', 'colorFgPositiveInversePrimary'],
  ['fg-positive-inverse-secondary', 'colorFgPositiveInverseSecondary'],

  // Foreground - Attention
  ['fg-attention-primary', 'colorFgAttentionPrimary'],
  ['fg-attention-secondary', 'colorFgAttentionSecondary'],

  // Foreground - Alert
  ['fg-alert-primary', 'colorFgAlertPrimary'],
  ['fg-alert-secondary', 'colorFgAlertSecondary'],
  ['fg-alert-inverse-primary', 'colorFgAlertInversePrimary'],
  ['fg-alert-inverse-secondary', 'colorFgAlertInverseSecondary'],

  // Foreground - Information
  ['fg-information-primary', 'colorFgInformationPrimary'],
  ['fg-information-secondary', 'colorFgInformationSecondary'],
  ['fg-information-spot-readable', 'colorFgInformationSpotReadable'],
  ['fg-information-inverse-primary', 'colorFgInformationInversePrimary'],
  ['fg-information-inverse-secondary', 'colorFgInformationInverseSecondary'],

  // Foreground - Accent
  ['fg-accent-primary', 'colorFgAccentPrimary'],
  ['fg-accent-secondary', 'colorFgAccentSecondary'],
  ['fg-accent-spot-readable', 'colorFgAccentSpotReadable'],

  // Foreground - Date/Generative/Carby
  ['fg-date-primary', 'colorFgDatePrimary'],
  ['fg-generative-spot-readable', 'colorFgGenerativeSpotReadable'],
  ['fg-generative-inverse-primary', 'colorFgGenerativeInversePrimary'],
  ['fg-generative-inverse-secondary', 'colorFgGenerativeInverseSecondary'],
  ['fg-carby-primary', 'colorFgCarbyPrimary'],
  ['fg-carby-secondary', 'colorFgCarbySecondary'],
  ['fg-carby-accent', 'colorFgCarbyAccent'],

  // A11y
  ['a11y-primary', 'colorA11yPrimary'],

  // Border colors (using semantic bg/fg tokens)
  ['border-neutral-low', 'colorBgNeutralLow'],
  ['border-neutral-medium', 'colorBgNeutralMedium'],
  ['border-neutral-subtle', 'colorBgNeutralSubtle'],
  ['border-input-base', 'colorBorderInputBase'],
  ['border-input-high', 'colorBgInputHigh'],
  ['border-alert-high', 'colorBgAlertHigh'],
  ['border-positive-high', 'colorBgPositiveHigh'],
  ['border-a11y-primary', 'colorA11yPrimary'],
];

// Process color mappings
for (const [twName, tokenName] of colorMappings) {
  const value = getValue(tokens[tokenName]);
  if (value !== undefined) {
    theme.colors[twName] = value;
  }
}

// ============================================
// SPACING - Semantic tokens
// ============================================

const spacingMappings = [
  // Space between (gap equivalents)
  ['between-none', 'dimensionSpaceBetweenNone'],         // 0px
  ['coupled', 'dimensionSpaceBetweenCoupled'],           // 4px
  ['repeating-sm', 'dimensionSpaceBetweenRepeatingSm'],  // 6px
  ['repeating', 'dimensionSpaceBetweenRepeatingMd'],     // 8px
  ['related-sm', 'dimensionSpaceBetweenRelatedSm'],      // 8px
  ['related', 'dimensionSpaceBetweenRelatedMd'],         // 16px
  ['separated-sm', 'dimensionSpaceBetweenSeparatedSm'],  // 24px
  ['separated', 'dimensionSpaceBetweenSeparatedMd'],     // 32px

  // Space around - NEW semantic names
  ['around-none', 'dimensionSpaceAroundNone'],            // 0px
  ['around-nudge2', 'dimensionSpaceAroundNudge2'],        // 2px
  ['around-nudge4', 'dimensionSpaceAroundNudge4'],        // 4px
  ['around-nudge6', 'dimensionSpaceAroundNudge6'],        // 6px
  ['around-tight', 'dimensionSpaceAroundTight'],          // 8px
  ['around-tight-plus', 'dimensionSpaceAroundTightPlus'], // 10px
  ['around-compact', 'dimensionSpaceAroundCompact'],      // 12px
  ['around-default', 'dimensionSpaceAroundDefault'],      // 16px
  ['around-default-plus', 'dimensionSpaceAroundDefaultPlus'], // 20px
  ['around-spacious', 'dimensionSpaceAroundSpacious'],    // 24px

  // Space around - LEGACY aliases (for backwards compat with existing code)
  ['around-4xs', 'dimensionSpaceAroundNudge2'],           // 2px (was dimensionSpaceAround4xs)
  ['around-3xs', 'dimensionSpaceAroundNudge4'],           // 4px (was dimensionSpaceAround3xs)
  ['around-2xs', 'dimensionSpaceAroundNudge6'],           // 6px (was dimensionSpaceAround2xs)
  ['around-xs', 'dimensionSpaceAroundTight'],             // 8px (was dimensionSpaceAroundXs)
  ['around-sm', 'dimensionSpaceAroundCompact'],           // 12px (was dimensionSpaceAroundSm)
  ['around-md', 'dimensionSpaceAroundDefault'],           // 16px (was dimensionSpaceAroundMd)
  ['around-lg', 'dimensionSpaceAroundDefaultPlus'],       // 20px (was dimensionSpaceAroundLg)
  ['around-xl', 'dimensionSpaceAroundSpacious'],          // 24px (was dimensionSpaceAroundXl)
];

// Process spacing mappings
for (const [twName, tokenName] of spacingMappings) {
  const value = getNumber(tokens[tokenName]);
  if (value !== undefined) {
    theme.spacing[twName] = value;
  }
}

// ============================================
// BORDER RADIUS
// ============================================

const radiusMappings = [
  ['none', 'dimensionRadiusNone'],
  ['xs', 'dimensionRadiusXs'],
  ['sm', 'dimensionRadiusSm'],
  ['md', 'dimensionRadiusMd'],
  ['lg', 'dimensionRadiusLg'],
  ['xl', 'dimensionRadiusXl'],
  ['full', 'dimensionRadiusFull'],
];

for (const [twName, tokenName] of radiusMappings) {
  const value = getNumber(tokens[tokenName]);
  if (value !== undefined) {
    theme.borderRadius[twName] = value;
  }
}

// ============================================
// FONT SIZE
// ============================================

const fontSizeMappings = [
  // Body
  ['body-xs', 'textFontSizeBodyXs'],
  ['body-sm', 'textFontSizeBodySm'],
  ['body-md', 'textFontSizeBodyMd'],
  ['body-lg', 'textFontSizeBodyLg'],

  // Heading
  ['heading-xs', 'textFontSizeHeadingXs'],
  ['heading-sm', 'textFontSizeHeadingSm'],
  ['heading-md', 'textFontSizeHeadingMd'],
  ['heading-lg', 'textFontSizeHeadingLg'],
  ['heading-xl', 'textFontSizeHeadingXl'],
  ['heading-2xl', 'textFontSizeHeading2xl'],
  ['heading-3xl', 'textFontSizeHeading3xl'],
  ['heading-4xl', 'textFontSizeHeading4xl'],
  ['heading-5xl', 'textFontSizeHeading5xl'],

  // Title
  ['title-sm', 'textFontSizeTitleSm'],
  ['title-lg', 'textFontSizeTitleLg'],
  ['title-xl', 'textFontSizeTitleXl'],

  // Label
  ['label-2xs', 'textFontSizeLabel2xs'],
  ['label-xs', 'textFontSizeLabelXs'],
  ['label-sm', 'textFontSizeLabelSm'],
  ['label-md', 'textFontSizeLabelMd'],
  ['label-lg', 'textFontSizeLabelLg'],

  // Display
  ['display-sm', 'textFontSizeDisplaySm'],
  ['display-md', 'textFontSizeDisplayMd'],
  ['display-lg', 'textFontSizeDisplayLg'],
  ['display-xl', 'textFontSizeDisplayXl'],

  // Eyebrow
  ['eyebrow-sm', 'textFontSizeEyebrowSm'],
  ['eyebrow-md', 'textFontSizeEyebrowMd'],
];

for (const [twName, tokenName] of fontSizeMappings) {
  const value = getNumber(tokens[tokenName]);
  if (value !== undefined) {
    theme.fontSize[twName] = value;
  }
}

// ============================================
// LINE HEIGHT
// ============================================

const lineHeightMappings = [
  // Body
  ['body-xs', 'textLineHeightBodyXs'],
  ['body-sm', 'textLineHeightBodySm'],
  ['body-md', 'textLineHeightBodyMd'],
  ['body-lg', 'textLineHeightBodyLg'],

  // Heading
  ['heading-xs', 'textLineHeightHeadingXs'],
  ['heading-sm', 'textLineHeightHeadingSm'],
  ['heading-md', 'textLineHeightHeadingMd'],
  ['heading-lg', 'textLineHeightHeadingLg'],
  ['heading-xl', 'textLineHeightHeadingXl'],
  ['heading-2xl', 'textLineHeightHeading2xl'],
  ['heading-3xl', 'textLineHeightHeading3xl'],
  ['heading-4xl', 'textLineHeightHeading4xl'],
  ['heading-5xl', 'textLineHeightHeading5xl'],

  // Title
  ['title-sm', 'textLineHeightTitleSm'],
  ['title-md', 'textLineHeightTitleMd'],
  ['title-lg', 'textLineHeightTitleLg'],
  ['title-xl', 'textLineHeightTitleXl'],

  // Label
  ['label-2xs', 'textLineHeightLabel2xs'],
  ['label-xs', 'textLineHeightLabelXs'],
  ['label-sm', 'textLineHeightLabelSm'],
  ['label-md', 'textLineHeightLabelMd'],
  ['label-lg', 'textLineHeightLabelLg'],

  // Display
  ['display-sm', 'textLineHeightDisplaySm'],
  ['display-md', 'textLineHeightDisplayMd'],
  ['display-lg', 'textLineHeightDisplayLg'],
  ['display-xl', 'textLineHeightDisplayXl'],
];

for (const [twName, tokenName] of lineHeightMappings) {
  const value = getNumber(tokens[tokenName]);
  if (value !== undefined) {
    // Output as string with px suffix so NativeWind interprets as absolute value
    // (numeric values are treated as multipliers, e.g., 20 = 20x font size)
    theme.lineHeight[twName] = `${value}px`;
  }
}

// ============================================
// FONT FAMILY
// ============================================

const fontFamilyMappings = [
  ['sans', 'fontGlobalSans'],
  ['sans-alt', 'fontGlobalSansAlt'],
  ['mono', 'fontGlobalMono'],
  ['expressive', 'fontGlobalSansExpressive'],
];

for (const [twName, tokenName] of fontFamilyMappings) {
  const value = getValue(tokens[tokenName]);
  if (value !== undefined) {
    theme.fontFamily[twName] = [value];
  }
}

// ============================================
// OUTPUT
// ============================================

const output = `/**
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 *
 * Generated from: dist/react-native/tokens.js
 * Generated at: ${new Date().toISOString()}
 *
 * Run: npm run tokens:build:tailwind
 */

module.exports = ${JSON.stringify(theme, null, 2)};
`;

// Output to both locations:
// 1. Design system tokens build folder (for reference/versioning)
// 2. RN demo folder (for direct consumption by Metro/NativeWind)
const outputPaths = [
  path.join(__dirname, '../dist/react-native/tailwind-theme.js'),
  path.join(__dirname, '../sample-apps/react-native-demo/tailwind-theme.generated.js'),
];

outputPaths.forEach(outputPath => {
  fs.writeFileSync(outputPath, output, 'utf-8');
});

// Print summary
console.log('✅ Generated Tailwind theme for React Native');
console.log('');
console.log('   Token counts:');
console.log(`   • Colors:       ${Object.keys(theme.colors).length}`);
console.log(`   • Spacing:      ${Object.keys(theme.spacing).length}`);
console.log(`   • Border Radius: ${Object.keys(theme.borderRadius).length}`);
console.log(`   • Font Sizes:   ${Object.keys(theme.fontSize).length}`);
console.log(`   • Line Heights: ${Object.keys(theme.lineHeight).length}`);
console.log(`   • Font Families: ${Object.keys(theme.fontFamily).length}`);
console.log('');
console.log('   Output files:');
outputPaths.forEach(p => console.log(`   • ${p}`));
