import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as tokens from '@carbon-health/design-tokens/react-native';
import { colors } from '../../styles/foundations';

// ============================================================================
// Typography Sample Component
// ============================================================================

interface TypeSampleProps {
  name: string;
  size: number;
  label: string;
  weight?: string;
  sample?: string;
}

const TypeSample: React.FC<TypeSampleProps> = ({
  name,
  size,
  label,
  weight = '400',
  sample = 'The quick brown fox jumps over the lazy dog',
}) => (
  <View style={sampleStyles.container}>
    <View style={sampleStyles.meta}>
      <Text style={sampleStyles.name}>{name}</Text>
      <Text style={sampleStyles.specs}>{label} / weight {weight}</Text>
    </View>
    <Text style={[sampleStyles.sample, { fontSize: size, fontWeight: weight as any }]}>
      {sample}
    </Text>
  </View>
);

const sampleStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.neutral.subtle,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.fg.neutral.primary,
  },
  specs: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    fontFamily: 'monospace',
  },
  sample: {
    color: colors.fg.neutral.primary,
  },
});

// ============================================================================
// Font Size Scale (from @carbon-health/design-tokens)
// ============================================================================

const fontSizeScale = [
  { name: 'fontSize100', size: tokens.fontSize100.number, label: tokens.fontSize100.original },
  { name: 'fontSize150', size: tokens.fontSize150.number, label: tokens.fontSize150.original },
  { name: 'fontSize200', size: tokens.fontSize200.number, label: tokens.fontSize200.original },
  { name: 'fontSize250', size: tokens.fontSize250.number, label: tokens.fontSize250.original },
  { name: 'fontSize300', size: tokens.fontSize300.number, label: tokens.fontSize300.original },
  { name: 'fontSize325', size: tokens.fontSize325.number, label: tokens.fontSize325.original },
  { name: 'fontSize350', size: tokens.fontSize350.number, label: tokens.fontSize350.original },
  { name: 'fontSize400', size: tokens.fontSize400.number, label: tokens.fontSize400.original },
  { name: 'fontSize450', size: tokens.fontSize450.number, label: tokens.fontSize450.original },
  { name: 'fontSize500', size: tokens.fontSize500.number, label: tokens.fontSize500.original },
  { name: 'fontSize550', size: tokens.fontSize550.number, label: tokens.fontSize550.original },
  { name: 'fontSize600', size: tokens.fontSize600.number, label: tokens.fontSize600.original },
  { name: 'fontSize650', size: tokens.fontSize650.number, label: tokens.fontSize650.original },
  { name: 'fontSize700', size: tokens.fontSize700.number, label: tokens.fontSize700.original },
];

// ============================================================================
// Story Components
// ============================================================================

const FontSizes: React.FC = () => (
  <View style={containerStyles.root}>
    <Text style={containerStyles.title}>Font Size Scale</Text>
    <Text style={containerStyles.description}>
      Typography scale from @carbon-health/design-tokens. Values in pixels.
    </Text>
    {fontSizeScale.map(({ name, size, label }) => (
      <TypeSample key={name} name={name} size={size} label={label} />
    ))}
  </View>
);

const FontFamilies: React.FC = () => (
  <View style={containerStyles.root}>
    <Text style={containerStyles.title}>Font Families</Text>
    <Text style={containerStyles.description}>
      Typeface tokens from @carbon-health/design-tokens.
    </Text>
    {[
      { name: 'fontGlobalSans', value: tokens.fontGlobalSans },
      { name: 'fontGlobalSansAlt', value: tokens.fontGlobalSansAlt },
      { name: 'fontGlobalMono', value: tokens.fontGlobalMono },
      { name: 'fontGlobalSansExpressive', value: tokens.fontGlobalSansExpressive },
    ].map(({ name, value }) => (
      <View key={name} style={familyStyles.row}>
        <Text style={familyStyles.name}>{name}</Text>
        <Text style={familyStyles.value}>{value}</Text>
        <Text style={[familyStyles.sample, { fontFamily: value }]}>
          AaBbCc 0123456789
        </Text>
      </View>
    ))}
  </View>
);

const FontWeights: React.FC = () => (
  <View style={containerStyles.root}>
    <Text style={containerStyles.title}>Font Weights</Text>
    {['300', '400', '500', '600', '700'].map((weight) => (
      <View key={weight} style={weightStyles.row}>
        <Text style={weightStyles.label}>{weight}</Text>
        <Text style={[weightStyles.sample, { fontWeight: weight as any }]}>
          The quick brown fox jumps over the lazy dog
        </Text>
      </View>
    ))}
  </View>
);

const InterFontTest: React.FC = () => (
  <View style={containerStyles.root}>
    <Text style={containerStyles.title}>Inter Font (Google Fonts CDN)</Text>
    <Text style={containerStyles.description}>
      Loaded via Storybook preview. Verify correct rendering at each weight below.
    </Text>
    {[
      { weight: '400', label: 'Regular' },
      { weight: '500', label: 'Medium' },
      { weight: '600', label: 'Semibold' },
      { weight: '700', label: 'Bold' },
    ].map(({ weight, label }) => (
      <View key={weight} style={interStyles.row}>
        <View style={interStyles.meta}>
          <Text style={interStyles.weightLabel}>{label}</Text>
          <Text style={interStyles.weightValue}>{weight}</Text>
        </View>
        <Text style={[interStyles.sample, { fontFamily: 'Inter, sans-serif', fontWeight: weight as any }]}>
          ABCDEFGHIJKLM abcdefghijklm 0123456789
        </Text>
        <Text style={[interStyles.sampleSmall, { fontFamily: 'Inter, sans-serif', fontWeight: weight as any }]}>
          Patient: John Smith | DOB: 03/15/1985 | MRN: 12345678
        </Text>
      </View>
    ))}
  </View>
);

const interStyles = StyleSheet.create({
  row: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.neutral.subtle,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  weightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.fg.neutral.primary,
  },
  weightValue: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    fontFamily: 'monospace',
  },
  sample: {
    fontSize: 20,
    color: colors.fg.neutral.primary,
    marginBottom: 4,
  },
  sampleSmall: {
    fontSize: 14,
    color: colors.fg.neutral.secondary,
  },
});

const ClinicalTypography: React.FC = () => (
  <View style={containerStyles.root}>
    <Text style={containerStyles.title}>Clinical Typography Patterns</Text>
    <Text style={containerStyles.description}>
      Common typography patterns used in clinical documentation.
    </Text>

    <View style={clinicalStyles.section}>
      <Text style={clinicalStyles.sectionTitle}>Patient Header</Text>
      <View style={clinicalStyles.example}>
        <Text style={{ fontSize: tokens.fontSize400.number, fontWeight: '600', color: tokens.colorFgNeutralPrimary }}>
          John Smith
        </Text>
        <Text style={{ fontSize: tokens.fontSize250.number, color: tokens.colorFgNeutralSecondary, marginTop: 4 }}>
          DOB: 03/15/1985 (38y) | MRN: 12345678
        </Text>
      </View>
    </View>

    <View style={clinicalStyles.section}>
      <Text style={clinicalStyles.sectionTitle}>Medication Order</Text>
      <View style={clinicalStyles.example}>
        <Text style={{ fontSize: tokens.fontSize300.number, fontWeight: '600', color: tokens.colorFgNeutralPrimary }}>
          Amoxicillin 500mg
        </Text>
        <Text style={{ fontSize: tokens.fontSize250.number, color: tokens.colorFgNeutralSecondary, marginTop: 4 }}>
          Take 1 capsule by mouth 3 times daily for 10 days
        </Text>
        <Text style={{ fontSize: tokens.fontSize200.number, color: tokens.colorFgNeutralSpotReadable, marginTop: 8 }}>
          Qty: 30 | Refills: 0
        </Text>
      </View>
    </View>

    <View style={clinicalStyles.section}>
      <Text style={clinicalStyles.sectionTitle}>Lab Result</Text>
      <View style={clinicalStyles.example}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
          <Text style={{ fontSize: tokens.fontSize250.number, fontWeight: '500', color: tokens.colorFgNeutralPrimary }}>
            Hemoglobin A1c
          </Text>
          <Text style={{ fontSize: tokens.fontSize325.number, fontWeight: '600', color: tokens.colorFgNeutralPrimary }}>
            7.2%
          </Text>
          <Text style={{ fontSize: tokens.fontSize100.number, fontWeight: '700', color: tokens.colorFgAttentionPrimary, letterSpacing: 0.5 }}>
            HIGH
          </Text>
        </View>
        <Text style={{ fontSize: tokens.fontSize200.number, color: tokens.colorFgNeutralSpotReadable, marginTop: 4 }}>
          Reference: 4.0-5.6% | Collected: 01/15/2024
        </Text>
      </View>
    </View>
  </View>
);

const containerStyles = StyleSheet.create({
  root: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.fg.neutral.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.fg.neutral.spotReadable,
    marginBottom: 24,
  },
});

const familyStyles = StyleSheet.create({
  row: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.neutral.subtle,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.fg.neutral.primary,
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  sample: {
    fontSize: 18,
    color: colors.fg.neutral.primary,
  },
});

const weightStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.neutral.subtle,
  },
  label: {
    width: 40,
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    fontFamily: 'monospace',
  },
  sample: {
    flex: 1,
    fontSize: 18,
    color: colors.fg.neutral.primary,
  },
});

const clinicalStyles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  example: {
    padding: 16,
    backgroundColor: colors.bg.neutral.base,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.neutral.subtle,
  },
});

// ============================================================================
// Storybook Meta & Stories
// ============================================================================

const meta: Meta = {
  title: 'Design Tokens/Typography',
  component: FontSizes,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Typography tokens from @carbon-health/design-tokens. Font sizes, families, and clinical patterns.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FontScale: Story = {
  name: 'Font Sizes',
};

export const Families: Story = {
  name: 'Font Families',
  render: () => <FontFamilies />,
};

export const Weights: Story = {
  name: 'Font Weights',
  render: () => <FontWeights />,
};

export const InterFont: Story = {
  name: 'Inter Font',
  render: () => <InterFontTest />,
  parameters: {
    docs: {
      description: {
        story: 'Verifies Inter font loads correctly from Google Fonts CDN in Storybook.',
      },
    },
  },
};

export const ClinicalPatterns: Story = {
  name: 'Clinical Patterns',
  render: () => <ClinicalTypography />,
};
