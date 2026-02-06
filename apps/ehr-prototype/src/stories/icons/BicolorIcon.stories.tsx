import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BicolorIcon } from '../../icons/BicolorIcon';
import type { BicolorIconName, BicolorIconSize } from '../../icons';
import { colors } from '../../styles/foundations';

const allBicolorNames: BicolorIconName[] = [
  'positive', 'positive-bold',
  'alert', 'alert-bold',
  'attention',
  'info', 'info-bold',
  'question',
  'plus', 'minus',
  'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
  'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
];

const meta: Meta<typeof BicolorIcon> = {
  title: 'Icons/BicolorIcon',
  component: BicolorIcon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: allBicolorNames,
      description: 'Semantic bicolor icon name',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'small = 20px, medium = 24px',
    },
    signifierColor: {
      control: 'color',
      description: 'Override inner element color',
    },
    containerColor: {
      control: 'color',
      description: 'Override outer element color',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Bicolor icon component with semantic color schemes. Each icon has a container (outer shape) and signifier (inner element) that can be independently colored.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    name: 'positive',
    size: 'medium',
  },
};

// ============================================================================
// Semantic Variants
// ============================================================================

export const SemanticVariants: Story = {
  name: 'Semantic Variants',
  render: () => {
    const semanticIcons: { name: BicolorIconName; label: string; description: string }[] = [
      { name: 'positive', label: 'Positive', description: 'Success, completed, approved' },
      { name: 'positive-bold', label: 'Positive Bold', description: 'Strong success emphasis' },
      { name: 'alert', label: 'Alert', description: 'Error, critical issue' },
      { name: 'alert-bold', label: 'Alert Bold', description: 'Strong error emphasis' },
      { name: 'attention', label: 'Attention', description: 'Warning, needs review' },
      { name: 'info', label: 'Info', description: 'Informational' },
      { name: 'info-bold', label: 'Info Bold', description: 'Strong info emphasis' },
      { name: 'question', label: 'Question', description: 'Help, unknown state' },
    ];

    return (
      <View style={styles.variantGrid}>
        {semanticIcons.map(({ name, label, description }) => (
          <View key={name} style={styles.variantRow}>
            <View style={styles.variantIcons}>
              <BicolorIcon name={name} size="small" />
              <BicolorIcon name={name} size="medium" />
            </View>
            <View style={styles.variantMeta}>
              <Text style={styles.variantLabel}>{label}</Text>
              <Text style={styles.variantDescription}>{description}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  },
};

// ============================================================================
// Directional Icons
// ============================================================================

export const DirectionalIcons: Story = {
  name: 'Directional Icons',
  render: () => {
    const groups: { title: string; icons: BicolorIconName[] }[] = [
      { title: 'Arrows', icons: ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right'] },
      { title: 'Chevrons', icons: ['chevron-up', 'chevron-down', 'chevron-left', 'chevron-right'] },
      { title: 'Actions', icons: ['plus', 'minus'] },
    ];

    return (
      <View style={styles.groupContainer}>
        {groups.map(({ title, icons }) => (
          <View key={title} style={styles.group}>
            <Text style={styles.groupTitle}>{title}</Text>
            <View style={styles.groupIcons}>
              {icons.map((name) => (
                <View key={name} style={styles.dirIconTile}>
                  <BicolorIcon name={name} size="medium" />
                  <Text style={styles.dirIconLabel}>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  },
};

// ============================================================================
// Size Comparison
// ============================================================================

export const SizeComparison: Story = {
  name: 'Size Comparison',
  render: () => {
    const icons: BicolorIconName[] = ['positive', 'alert', 'attention', 'info', 'question', 'plus'];
    return (
      <View style={styles.sizeGrid}>
        <View style={styles.sizeRow}>
          <Text style={styles.sizeHeader}>Name</Text>
          <Text style={styles.sizeHeader}>Small (20px)</Text>
          <Text style={styles.sizeHeader}>Medium (24px)</Text>
        </View>
        {icons.map((name) => (
          <View key={name} style={styles.sizeRow}>
            <Text style={styles.iconLabel}>{name}</Text>
            <View style={styles.iconCell}>
              <BicolorIcon name={name} size="small" />
            </View>
            <View style={styles.iconCell}>
              <BicolorIcon name={name} size="medium" />
            </View>
          </View>
        ))}
      </View>
    );
  },
};

// ============================================================================
// Custom Colors
// ============================================================================

export const CustomColors: Story = {
  name: 'Custom Colors',
  render: () => {
    const colorOverrides = [
      { label: 'Default (semantic)', props: {} },
      { label: 'Accent theme', props: { containerColor: colors.bg.accent.subtle, signifierColor: colors.fg.accent.primary } },
      { label: 'Positive theme', props: { containerColor: colors.bg.positive.subtle, signifierColor: colors.fg.positive.secondary } },
      { label: 'Alert theme', props: { containerColor: colors.bg.alert.subtle, signifierColor: colors.fg.alert.secondary } },
      { label: 'Inverse theme', props: { containerColor: colors.bg.neutral.inverse, signifierColor: colors.fg.neutral.inversePrimary } },
    ];

    return (
      <View style={styles.customGrid}>
        {colorOverrides.map(({ label, props }) => (
          <View key={label} style={styles.customRow}>
            <Text style={styles.customLabel}>{label}</Text>
            <View style={styles.customIcons}>
              <BicolorIcon name="positive" size="medium" {...props} />
              <BicolorIcon name="alert" size="medium" {...props} />
              <BicolorIcon name="info" size="medium" {...props} />
              <BicolorIcon name="arrow-right" size="medium" {...props} />
            </View>
          </View>
        ))}
      </View>
    );
  },
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Semantic variants
  variantGrid: {
    gap: 12,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.neutral.subtle,
  },
  variantIcons: {
    flexDirection: 'row',
    gap: 8,
    width: 64,
  },
  variantMeta: {
    flex: 1,
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.fg.neutral.primary,
  },
  variantDescription: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    marginTop: 2,
  },

  // Directional
  groupContainer: {
    gap: 24,
  },
  group: {
    gap: 12,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.fg.neutral.secondary,
  },
  groupIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  dirIconTile: {
    alignItems: 'center',
    gap: 6,
  },
  dirIconLabel: {
    fontSize: 10,
    color: colors.fg.neutral.spotReadable,
    fontFamily: 'monospace',
  },

  // Size comparison
  sizeGrid: {
    gap: 4,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.neutral.subtle,
  },
  sizeHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.fg.neutral.secondary,
    fontFamily: 'monospace',
  },
  iconCell: {
    flex: 1,
    alignItems: 'flex-start',
  },

  // Custom colors
  customGrid: {
    gap: 16,
  },
  customRow: {
    gap: 8,
  },
  customLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.fg.neutral.secondary,
  },
  customIcons: {
    flexDirection: 'row',
    gap: 12,
  },
});
