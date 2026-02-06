import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as tokens from '@carbon-health/design-tokens/react-native';
import { colors } from '../../styles/foundations';

// ============================================================================
// Color Swatch Component
// ============================================================================

interface ColorSwatchProps {
  name: string;
  value: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, value }) => (
  <View style={swatchStyles.container}>
    <View style={[swatchStyles.swatch, { backgroundColor: value }]} />
    <View style={swatchStyles.info}>
      <Text style={swatchStyles.name}>{name}</Text>
      <Text style={swatchStyles.value}>{value}</Text>
    </View>
  </View>
);

const swatchStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.neutral.subtle,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.fg.neutral.primary,
  },
  value: {
    fontSize: 11,
    color: colors.fg.neutral.spotReadable,
    fontFamily: 'monospace',
  },
});

// ============================================================================
// Color Palette Component
// ============================================================================

interface ColorPaletteProps {
  title: string;
  colors: Array<{ name: string; value: string }>;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ title, colors }) => (
  <View style={paletteStyles.container}>
    <Text style={paletteStyles.title}>{title}</Text>
    {colors.map(({ name, value }) => (
      <ColorSwatch key={name} name={name} value={value} />
    ))}
  </View>
);

const paletteStyles = StyleSheet.create({
  container: {
    marginBottom: 32,
    minWidth: 240,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg.neutral.primary,
    marginBottom: 12,
  },
});

// ============================================================================
// Primitive Color Ramps (from @carbon-health/design-tokens)
// ============================================================================

const grayRamp = [
  { name: 'Gray 25', value: tokens.colorGray25 },
  { name: 'Gray 50', value: tokens.colorGray50 },
  { name: 'Gray 100', value: tokens.colorGray100 },
  { name: 'Gray 200', value: tokens.colorGray200 },
  { name: 'Gray 300', value: tokens.colorGray300 },
  { name: 'Gray 400', value: tokens.colorGray400 },
  { name: 'Gray 500', value: tokens.colorGray500 },
  { name: 'Gray 600', value: tokens.colorGray600 },
  { name: 'Gray 700', value: tokens.colorGray700 },
  { name: 'Gray 800', value: tokens.colorGray800 },
  { name: 'Gray 900', value: tokens.colorGray900 },
  { name: 'Gray 1000', value: tokens.colorGray1000 },
];

const creamRamp = [
  { name: 'Cream 50', value: tokens.colorCream50 },
  { name: 'Cream 100', value: tokens.colorCream100 },
  { name: 'Cream 200', value: tokens.colorCream200 },
  { name: 'Cream 300', value: tokens.colorCream300 },
  { name: 'Cream 400', value: tokens.colorCream400 },
  { name: 'Cream 500', value: tokens.colorCream500 },
  { name: 'Cream 600', value: tokens.colorCream600 },
  { name: 'Cream 700', value: tokens.colorCream700 },
  { name: 'Cream 800', value: tokens.colorCream800 },
  { name: 'Cream 900', value: tokens.colorCream900 },
];

const blueRamp = [
  { name: 'Blue 50', value: tokens.colorBlue50 },
  { name: 'Blue 100', value: tokens.colorBlue100 },
  { name: 'Blue 200', value: tokens.colorBlue200 },
  { name: 'Blue 300', value: tokens.colorBlue300 },
  { name: 'Blue 400', value: tokens.colorBlue400 },
  { name: 'Blue 500', value: tokens.colorBlue500 },
  { name: 'Blue 600', value: tokens.colorBlue600 },
  { name: 'Blue 700', value: tokens.colorBlue700 },
  { name: 'Blue 800', value: tokens.colorBlue800 },
  { name: 'Blue 900', value: tokens.colorBlue900 },
];

const greenRamp = [
  { name: 'Green 50', value: tokens.colorGreen50 },
  { name: 'Green 100', value: tokens.colorGreen100 },
  { name: 'Green 200', value: tokens.colorGreen200 },
  { name: 'Green 300', value: tokens.colorGreen300 },
  { name: 'Green 400', value: tokens.colorGreen400 },
  { name: 'Green 500', value: tokens.colorGreen500 },
  { name: 'Green 600', value: tokens.colorGreen600 },
  { name: 'Green 700', value: tokens.colorGreen700 },
  { name: 'Green 800', value: tokens.colorGreen800 },
  { name: 'Green 900', value: tokens.colorGreen900 },
];

const yellowRamp = [
  { name: 'Yellow 50', value: tokens.colorYellow50 },
  { name: 'Yellow 100', value: tokens.colorYellow100 },
  { name: 'Yellow 200', value: tokens.colorYellow200 },
  { name: 'Yellow 300', value: tokens.colorYellow300 },
  { name: 'Yellow 400', value: tokens.colorYellow400 },
  { name: 'Yellow 500', value: tokens.colorYellow500 },
  { name: 'Yellow 600', value: tokens.colorYellow600 },
  { name: 'Yellow 700', value: tokens.colorYellow700 },
  { name: 'Yellow 800', value: tokens.colorYellow800 },
  { name: 'Yellow 900', value: tokens.colorYellow900 },
];

const redRamp = [
  { name: 'Red 50', value: tokens.colorRed50 },
  { name: 'Red 100', value: tokens.colorRed100 },
  { name: 'Red 200', value: tokens.colorRed200 },
  { name: 'Red 300', value: tokens.colorRed300 },
  { name: 'Red 400', value: tokens.colorRed400 },
  { name: 'Red 500', value: tokens.colorRed500 },
  { name: 'Red 600', value: tokens.colorRed600 },
  { name: 'Red 700', value: tokens.colorRed700 },
  { name: 'Red 800', value: tokens.colorRed800 },
  { name: 'Red 900', value: tokens.colorRed900 },
];

const purpleRamp = [
  { name: 'Purple 50', value: tokens.colorPurple50 },
  { name: 'Purple 100', value: tokens.colorPurple100 },
  { name: 'Purple 200', value: tokens.colorPurple200 },
  { name: 'Purple 300', value: tokens.colorPurple300 },
  { name: 'Purple 400', value: tokens.colorPurple400 },
  { name: 'Purple 500', value: tokens.colorPurple500 },
  { name: 'Purple 600', value: tokens.colorPurple600 },
  { name: 'Purple 700', value: tokens.colorPurple700 },
  { name: 'Purple 800', value: tokens.colorPurple800 },
  { name: 'Purple 900', value: tokens.colorPurple900 },
];

const saturatedRedRamp = [
  { name: 'SaturatedRed 50', value: tokens.colorSaturatedRed50 },
  { name: 'SaturatedRed 100', value: tokens.colorSaturatedRed100 },
  { name: 'SaturatedRed 200', value: tokens.colorSaturatedRed200 },
  { name: 'SaturatedRed 300', value: tokens.colorSaturatedRed300 },
  { name: 'SaturatedRed 400', value: tokens.colorSaturatedRed400 },
  { name: 'SaturatedRed 500', value: tokens.colorSaturatedRed500 },
  { name: 'SaturatedRed 600', value: tokens.colorSaturatedRed600 },
  { name: 'SaturatedRed 700', value: tokens.colorSaturatedRed700 },
  { name: 'SaturatedRed 800', value: tokens.colorSaturatedRed800 },
  { name: 'SaturatedRed 900', value: tokens.colorSaturatedRed900 },
];

// ============================================================================
// Semantic Colors
// ============================================================================

const bgNeutralColors = [
  { name: 'bg-neutral-base', value: tokens.colorBgNeutralBase },
  { name: 'bg-neutral-min', value: tokens.colorBgNeutralMin },
  { name: 'bg-neutral-subtle', value: tokens.colorBgNeutralSubtle },
  { name: 'bg-neutral-low', value: tokens.colorBgNeutralLow },
  { name: 'bg-neutral-low-accented', value: tokens.colorBgNeutralLowAccented },
  { name: 'bg-neutral-medium', value: tokens.colorBgNeutralMedium },
  { name: 'bg-neutral-inverse-base', value: tokens.colorBgNeutralInverseBase },
  { name: 'bg-neutral-inverse-low', value: tokens.colorBgNeutralInverseLow },
];

const bgPositiveColors = [
  { name: 'bg-positive-subtle', value: tokens.colorBgPositiveSubtle },
  { name: 'bg-positive-low', value: tokens.colorBgPositiveLow },
  { name: 'bg-positive-low-accented', value: tokens.colorBgPositiveLowAccented },
  { name: 'bg-positive-medium', value: tokens.colorBgPositiveMedium },
  { name: 'bg-positive-strong', value: tokens.colorBgPositiveStrong },
  { name: 'bg-positive-high', value: tokens.colorBgPositiveHigh },
  { name: 'bg-positive-high-accented', value: tokens.colorBgPositiveHighAccented },
];

const bgAttentionColors = [
  { name: 'bg-attention-subtle', value: tokens.colorBgAttentionSubtle },
  { name: 'bg-attention-low', value: tokens.colorBgAttentionLow },
  { name: 'bg-attention-low-accented', value: tokens.colorBgAttentionLowAccented },
  { name: 'bg-attention-medium', value: tokens.colorBgAttentionMedium },
  { name: 'bg-attention-high', value: tokens.colorBgAttentionHigh },
  { name: 'bg-attention-high-accented', value: tokens.colorBgAttentionHighAccented },
];

const bgAlertColors = [
  { name: 'bg-alert-subtle', value: tokens.colorBgAlertSubtle },
  { name: 'bg-alert-low', value: tokens.colorBgAlertLow },
  { name: 'bg-alert-low-accented', value: tokens.colorBgAlertLowAccented },
  { name: 'bg-alert-medium', value: tokens.colorBgAlertMedium },
  { name: 'bg-alert-high', value: tokens.colorBgAlertHigh },
  { name: 'bg-alert-high-accented', value: tokens.colorBgAlertHighAccented },
];

const bgInformationColors = [
  { name: 'bg-information-subtle', value: tokens.colorBgInformationSubtle },
  { name: 'bg-information-low', value: tokens.colorBgInformationLow },
  { name: 'bg-information-low-accented', value: tokens.colorBgInformationLowAccented },
  { name: 'bg-information-medium', value: tokens.colorBgInformationMedium },
  { name: 'bg-information-high', value: tokens.colorBgInformationHigh },
  { name: 'bg-information-high-accented', value: tokens.colorBgInformationHighAccented },
];

const bgAccentColors = [
  { name: 'bg-accent-subtle', value: tokens.colorBgAccentSubtle },
  { name: 'bg-accent-low', value: tokens.colorBgAccentLow },
  { name: 'bg-accent-low-accented', value: tokens.colorBgAccentLowAccented },
  { name: 'bg-accent-medium', value: tokens.colorBgAccentMedium },
  { name: 'bg-accent-high', value: tokens.colorBgAccentHigh },
  { name: 'bg-accent-high-accented', value: tokens.colorBgAccentHighAccented },
];

const fgNeutralColors = [
  { name: 'fg-neutral-primary', value: tokens.colorFgNeutralPrimary },
  { name: 'fg-neutral-secondary', value: tokens.colorFgNeutralSecondary },
  { name: 'fg-neutral-spot-readable', value: tokens.colorFgNeutralSpotReadable },
  { name: 'fg-neutral-disabled', value: tokens.colorFgNeutralDisabled },
  { name: 'fg-neutral-inverse-primary', value: tokens.colorFgNeutralInversePrimary },
  { name: 'fg-neutral-inverse-secondary', value: tokens.colorFgNeutralInverseSecondary },
];

const fgSemanticColors = [
  { name: 'fg-positive-primary', value: tokens.colorFgPositivePrimary },
  { name: 'fg-positive-secondary', value: tokens.colorFgPositiveSecondary },
  { name: 'fg-positive-spot-readable', value: tokens.colorFgPositiveSpotReadable },
  { name: 'fg-attention-primary', value: tokens.colorFgAttentionPrimary },
  { name: 'fg-attention-secondary', value: tokens.colorFgAttentionSecondary },
  { name: 'fg-alert-primary', value: tokens.colorFgAlertPrimary },
  { name: 'fg-alert-secondary', value: tokens.colorFgAlertSecondary },
  { name: 'fg-information-primary', value: tokens.colorFgInformationPrimary },
  { name: 'fg-information-secondary', value: tokens.colorFgInformationSecondary },
  { name: 'fg-accent-primary', value: tokens.colorFgAccentPrimary },
  { name: 'fg-accent-secondary', value: tokens.colorFgAccentSecondary },
];

const utilityColors = [
  { name: 'utility-a11y-blue', value: tokens.colorUtilityA11yBlue },
  { name: 'utility-carby-green', value: tokens.colorUtilityCarbyGreen },
  { name: 'bg-carby-default', value: tokens.colorBgCarbyDefault },
  { name: 'bg-generative-strong', value: tokens.colorBgGenerativeStrong },
  { name: 'a11y-primary', value: tokens.colorA11yPrimary },
];

// ============================================================================
// Story Components
// ============================================================================

const PrimitiveColors: React.FC = () => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32 }}>
    <ColorPalette title="Gray" colors={grayRamp} />
    <ColorPalette title="Cream" colors={creamRamp} />
    <ColorPalette title="Blue" colors={blueRamp} />
    <ColorPalette title="Green" colors={greenRamp} />
    <ColorPalette title="Yellow" colors={yellowRamp} />
    <ColorPalette title="Red" colors={redRamp} />
    <ColorPalette title="Purple" colors={purpleRamp} />
    <ColorPalette title="Saturated Red" colors={saturatedRedRamp} />
  </View>
);

const SemanticBackgrounds: React.FC = () => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32 }}>
    <ColorPalette title="Neutral Backgrounds" colors={bgNeutralColors} />
    <ColorPalette title="Positive" colors={bgPositiveColors} />
    <ColorPalette title="Attention" colors={bgAttentionColors} />
    <ColorPalette title="Alert" colors={bgAlertColors} />
    <ColorPalette title="Information" colors={bgInformationColors} />
    <ColorPalette title="Accent" colors={bgAccentColors} />
  </View>
);

const SemanticForegrounds: React.FC = () => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32 }}>
    <ColorPalette title="Neutral Foreground" colors={fgNeutralColors} />
    <ColorPalette title="Semantic Foreground" colors={fgSemanticColors} />
    <ColorPalette title="Utility & Brand" colors={utilityColors} />
  </View>
);

// ============================================================================
// Storybook Meta & Stories
// ============================================================================

const meta: Meta = {
  title: 'Design Tokens/Colors',
  component: PrimitiveColors,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Color tokens from @carbon-health/design-tokens. Organized into primitive ramps and semantic layers.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primitives: Story = {
  name: 'Primitive Ramps',
};

export const Backgrounds: Story = {
  name: 'Semantic Backgrounds',
  render: () => <SemanticBackgrounds />,
};

export const Foregrounds: Story = {
  name: 'Semantic Foregrounds',
  render: () => <SemanticForegrounds />,
};

export const GrayPalette: Story = {
  name: 'Gray',
  render: () => <ColorPalette title="Gray" colors={grayRamp} />,
};

export const BluePalette: Story = {
  name: 'Blue',
  render: () => <ColorPalette title="Blue" colors={blueRamp} />,
};

export const GreenPalette: Story = {
  name: 'Green',
  render: () => <ColorPalette title="Green" colors={greenRamp} />,
};
