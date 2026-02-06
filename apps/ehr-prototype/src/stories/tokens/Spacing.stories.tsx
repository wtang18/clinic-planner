import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as tokens from '@carbon-health/design-tokens/react-native';
import { colors } from '../../styles/foundations';

// ============================================================================
// Spacing Scale (from @carbon-health/design-tokens)
// ============================================================================

const spacingScale = [
  { name: 'space-0', value: tokens.dimensionSpace0 },
  { name: 'space-25', value: tokens.dimensionSpace25 },
  { name: 'space-50', value: tokens.dimensionSpace50 },
  { name: 'space-75', value: tokens.dimensionSpace75 },
  { name: 'space-100', value: tokens.dimensionSpace100 },
  { name: 'space-125', value: tokens.dimensionSpace125 },
  { name: 'space-150', value: tokens.dimensionSpace150 },
  { name: 'space-200', value: tokens.dimensionSpace200 },
  { name: 'space-250', value: tokens.dimensionSpace250 },
  { name: 'space-300', value: tokens.dimensionSpace300 },
  { name: 'space-400', value: tokens.dimensionSpace400 },
  { name: 'space-500', value: tokens.dimensionSpace500 },
  { name: 'space-550', value: tokens.dimensionSpace550 },
  { name: 'space-600', value: tokens.dimensionSpace600 },
  { name: 'space-700', value: tokens.dimensionSpace700 },
  { name: 'space-800', value: tokens.dimensionSpace800 },
  { name: 'space-900', value: tokens.dimensionSpace900 },
  { name: 'space-1000', value: tokens.dimensionSpace1000 },
  { name: 'space-1200', value: tokens.dimensionSpace1200 },
];

const radiusScale = [
  { name: 'radius-none', value: tokens.dimensionRadiusNone },
  { name: 'radius-xs', value: tokens.dimensionRadiusXs },
  { name: 'radius-sm', value: tokens.dimensionRadiusSm },
  { name: 'radius-md', value: tokens.dimensionRadiusMd },
  { name: 'radius-lg', value: tokens.dimensionRadiusLg },
  { name: 'radius-full', value: tokens.dimensionRadiusFull },
];

const semanticSpacing = [
  { name: 'between-none', value: tokens.dimensionSpaceBetweenNone },
  { name: 'between-coupled', value: tokens.dimensionSpaceBetweenCoupled },
  { name: 'between-repeating-sm', value: tokens.dimensionSpaceBetweenRepeatingSm },
  { name: 'between-repeating-md', value: tokens.dimensionSpaceBetweenRepeatingMd },
  { name: 'between-related-sm', value: tokens.dimensionSpaceBetweenRelatedSm },
  { name: 'between-related-md', value: tokens.dimensionSpaceBetweenRelatedMd },
];

// ============================================================================
// Story Components
// ============================================================================

const SpacingScale: React.FC = () => (
  <View style={styles.root}>
    <Text style={styles.title}>Spacing Scale</Text>
    <Text style={styles.description}>
      Space tokens from @carbon-health/design-tokens. Used for padding, margin, and gap.
    </Text>
    {spacingScale.map(({ name, value }) => (
      <View key={name} style={styles.row}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.value}>{value.original}</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: Math.min(value.number, 200) }]} />
        </View>
      </View>
    ))}
  </View>
);

const SemanticSpacing: React.FC = () => (
  <View style={styles.root}>
    <Text style={styles.title}>Semantic Spacing</Text>
    <Text style={styles.description}>
      Named spacing tokens for common layout patterns.
    </Text>
    {semanticSpacing.map(({ name, value }) => (
      <View key={name} style={styles.row}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.value}>{value.original}</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: Math.min(value.number, 200) }]} />
        </View>
      </View>
    ))}
  </View>
);

const BorderRadius: React.FC = () => (
  <View style={styles.root}>
    <Text style={styles.title}>Border Radius</Text>
    <Text style={styles.description}>
      Radius tokens from @carbon-health/design-tokens.
    </Text>
    <View style={radiusStyles.grid}>
      {radiusScale.map(({ name, value }) => (
        <View key={name} style={radiusStyles.item}>
          <View
            style={[
              radiusStyles.box,
              { borderRadius: Math.min(value.number, 9999) },
            ]}
          />
          <Text style={radiusStyles.name}>{name}</Text>
          <Text style={radiusStyles.value}>{value.original}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  name: {
    width: 160,
    fontSize: 13,
    fontWeight: '500',
    color: colors.fg.neutral.primary,
  },
  value: {
    width: 50,
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  barContainer: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
  },
  bar: {
    height: 16,
    backgroundColor: tokens.colorBlue300,
    borderRadius: 4,
    minWidth: 2,
  },
});

const radiusStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  item: {
    alignItems: 'center',
    width: 100,
  },
  box: {
    width: 64,
    height: 64,
    backgroundColor: tokens.colorBlue200,
    borderWidth: 2,
    borderColor: tokens.colorBlue500,
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.fg.neutral.primary,
    textAlign: 'center',
  },
  value: {
    fontSize: 11,
    color: colors.fg.neutral.spotReadable,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 2,
  },
});

// ============================================================================
// Storybook Meta & Stories
// ============================================================================

const meta: Meta = {
  title: 'Design Tokens/Spacing',
  component: SpacingScale,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Spacing and radius tokens from @carbon-health/design-tokens.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  name: 'Spacing Scale',
};

export const Semantic: Story = {
  name: 'Semantic Spacing',
  render: () => <SemanticSpacing />,
};

export const Radius: Story = {
  name: 'Border Radius',
  render: () => <BorderRadius />,
};
