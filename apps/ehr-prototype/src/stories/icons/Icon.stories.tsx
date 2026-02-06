import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Icon } from '../../icons/Icon';
import type { IconName, IconSize } from '../../icons';
import { ALL_ICON_NAMES } from '@design-system/icons/icon-names';
import { colors } from '../../styles/foundations';

const meta: Meta<typeof Icon> = {
  title: 'Icons/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ['star', 'checkmark', 'chevron-down', 'heart', 'plus', 'trash', 'pencil', 'magnifying-glass', 'bell', 'gear'],
      description: 'Icon name from the design system icon set',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'small = 20px, medium = 24px',
    },
    color: {
      control: 'color',
      description: 'Icon color (defaults to fg.neutral.primary)',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Icon component rendering SVG icons from the shared @design-system/icons package. Supports 386 icons in two sizes.',
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
    name: 'star',
    size: 'medium',
    color: colors.fg.neutral.primary,
  },
};

// ============================================================================
// Size Comparison
// ============================================================================

export const SizeComparison: Story = {
  name: 'Size Comparison',
  render: () => {
    const icons: IconName[] = ['star', 'checkmark', 'heart', 'bell', 'gear', 'plus', 'trash'];
    return (
      <View style={styles.sizeGrid}>
        <View style={styles.sizeRow}>
          <Text style={styles.sizeHeader}>Icon</Text>
          <Text style={styles.sizeHeader}>Small (20px)</Text>
          <Text style={styles.sizeHeader}>Medium (24px)</Text>
        </View>
        {icons.map((name) => (
          <View key={name} style={styles.sizeRow}>
            <Text style={styles.iconLabel}>{name}</Text>
            <View style={styles.iconCell}>
              <Icon name={name} size="small" />
            </View>
            <View style={styles.iconCell}>
              <Icon name={name} size="medium" />
            </View>
          </View>
        ))}
      </View>
    );
  },
};

// ============================================================================
// Color Variants
// ============================================================================

export const ColorVariants: Story = {
  name: 'Color Variants',
  render: () => {
    const colorSamples = [
      { label: 'fg.neutral.primary', color: colors.fg.neutral.primary },
      { label: 'fg.accent.primary', color: colors.fg.accent.primary },
      { label: 'fg.positive.secondary', color: colors.fg.positive.secondary },
      { label: 'fg.attention.secondary', color: colors.fg.attention.secondary },
      { label: 'fg.alert.secondary', color: colors.fg.alert.secondary },
      { label: 'fg.information.secondary', color: colors.fg.information.secondary },
      { label: 'fg.neutral.spotReadable', color: colors.fg.neutral.spotReadable },
    ];

    return (
      <View style={styles.colorGrid}>
        {colorSamples.map(({ label, color }) => (
          <View key={color} style={styles.colorRow}>
            <View style={styles.colorSwatch}>
              <Icon name="heart" size="medium" color={color} />
              <Icon name="star" size="medium" color={color} />
              <Icon name="bell" size="medium" color={color} />
              <Icon name="checkmark" size="medium" color={color} />
            </View>
            <Text style={[styles.colorLabel, { color }]}>{label}</Text>
          </View>
        ))}
      </View>
    );
  },
};

// ============================================================================
// All Icons Grid (searchable)
// ============================================================================

const AllIconsGrid: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedSize, setSelectedSize] = useState<IconSize>('small');

  const filtered = ALL_ICON_NAMES.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.allIconsContainer}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${ALL_ICON_NAMES.length} icons...`}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.fg.neutral.disabled}
        />
        <View style={styles.sizeToggle}>
          {(['small', 'medium'] as IconSize[]).map((s) => (
            <Text
              key={s}
              style={[styles.sizeToggleBtn, selectedSize === s && styles.sizeToggleBtnActive]}
              onPress={() => setSelectedSize(s)}
            >
              {s === 'small' ? '20px' : '24px'}
            </Text>
          ))}
        </View>
      </View>
      <Text style={styles.resultCount}>
        {filtered.length} icon{filtered.length !== 1 ? 's' : ''}
        {search && ` matching "${search}"`}
      </Text>
      <ScrollView style={styles.iconGridScroll}>
        <View style={styles.iconGrid}>
          {filtered.map((name) => (
            <View key={name} style={styles.iconTile}>
              <Icon name={name} size={selectedSize} />
              <Text style={styles.iconTileName} numberOfLines={2}>{name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export const AllIcons: Story = {
  name: 'All Icons',
  render: () => <AllIconsGrid />,
  parameters: {
    docs: {
      description: {
        story: 'Searchable grid of all 386 icons. Toggle between small (20px) and medium (24px) sizes.',
      },
    },
  },
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
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

  // Color variants
  colorGrid: {
    gap: 16,
  },
  colorRow: {
    gap: 8,
  },
  colorSwatch: {
    flexDirection: 'row',
    gap: 12,
  },
  colorLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
  },

  // All icons
  allIconsContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: colors.border.neutral.low,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.fg.neutral.primary,
    backgroundColor: colors.bg.neutral.base,
  },
  sizeToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border.neutral.low,
    borderRadius: 6,
    overflow: 'hidden',
  },
  sizeToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    backgroundColor: colors.bg.neutral.base,
  },
  sizeToggleBtnActive: {
    backgroundColor: colors.fg.accent.primary,
    color: colors.bg.neutral.base,
    fontWeight: '600',
  },
  resultCount: {
    fontSize: 12,
    color: colors.fg.neutral.disabled,
    marginBottom: 12,
  },
  iconGridScroll: {
    maxHeight: 600,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  iconTile: {
    width: 88,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.bg.neutral.base,
    borderWidth: 1,
    borderColor: colors.border.neutral.subtle,
  },
  iconTileName: {
    fontSize: 9,
    color: colors.fg.neutral.spotReadable,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});
