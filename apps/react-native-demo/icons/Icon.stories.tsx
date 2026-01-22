/**
 * Icon Component Stories - React Native
 * Full documentation following design system guidelines
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Icon } from './Icon';
import { SMALL_ICON_NAMES, MEDIUM_ICON_NAMES, ALL_ICON_NAMES } from '@design-system/icons/icon-names';

const meta: Meta<typeof Icon> = {
  title: 'Design System/Icons/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Icon name from the icon library (386 icons available)',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Icon size',
    },
    color: {
      control: 'color',
      description: 'Icon color (hex code)',
    },
    accessibilityLabel: {
      control: 'text',
      description: 'Accessible label for non-decorative icons',
    },
    accessibilityHidden: {
      control: 'boolean',
      description: 'Whether icon is hidden from accessibility tree',
    },
  },
  args: {
    name: 'star',
    size: 'small',
    color: '#181818',
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

/**
 * Complete documentation for the Icon component
 */
export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        Icon Component
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Production-ready icon component with 386 icons across 2 sizes, matching the web design system API.
      </Text>

      {/* Quick Reference */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Icons:</Text> 386 total (212 small, 321 medium)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Sizes:</Text> 2 sizes (20px, 24px)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Platform:</Text> React Native with react-native-svg</Text>
        </View>
      </View>

      {/* Features */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Features
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>386 Icons:</Text> Comprehensive icon library matching web</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>2 Sizes:</Text> Small (20px) and medium (24px)</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>Customizable Colors:</Text> Any hex color via color prop</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>SVG Rendering:</Text> Sharp vector graphics via react-native-svg</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>Accessibility:</Text> Optional labels and screen reader support</Text>
        </View>
      </View>

      {/* Sizes */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Icon Sizes
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 12 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Small (20×20px)</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>Used in xSmall, small, and medium buttons</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>212 icons available</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Medium (24×24px)</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>Used in large and largeFloating buttons</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>321 icons available</Text>
          </View>
        </View>
      </View>

      {/* Usage Examples */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Usage Examples
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 12 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<Icon name="star" size="small" color="#181818" />`}
            </Text>
            <Icon name="star" size="small" color="#181818" />
          </View>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<Icon name="heart" size="medium" color="#B33F3B" />`}
            </Text>
            <Icon name="heart" size="medium" color="#B33F3B" />
          </View>
        </View>
      </View>

      {/* Accessibility */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Accessibility
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 12 }}>
          All Icon components support React Native accessibility features.
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>accessibilityLabel:</Text> Provide descriptive label for non-decorative icons
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>accessibilityHidden:</Text> Set to true for decorative icons (default behavior)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>accessibilityRole:</Text> Automatically set to "image"
          </Text>
        </View>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginTop: 12 }}>
          <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937' }}>
            {`// ✅ Decorative icon (default)\n<Icon name="star" />\n\n// ✅ Informative icon\n<Icon\n  name="checkmark"\n  accessibilityLabel="Task completed"\n  accessibilityHidden={false}\n/>`}
          </Text>
        </View>
      </View>

      {/* Best Practices */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Best Practices
        </Text>

        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
          ✅ Do
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Use semantic color tokens for consistency</Text>
          <Text style={{ fontSize: 14 }}>• Match icon size to button size (small icons for small buttons)</Text>
          <Text style={{ fontSize: 14 }}>• Add accessibilityLabel for informative icons</Text>
          <Text style={{ fontSize: 14 }}>• Browse AllSmallIcons and AllMediumIcons stories to find icons</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
          ❌ Don't
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Don't use medium icons in small buttons (visual mismatch)</Text>
          <Text style={{ fontSize: 14 }}>• Don't add accessibilityLabel to purely decorative icons</Text>
          <Text style={{ fontSize: 14 }}>• Don't hard-code colors - use design tokens when possible</Text>
        </View>
      </View>

      {/* Platform Differences */}
      <View style={{ marginBottom: 24, backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          React Native vs Web
        </Text>
        <Text style={{ fontSize: 14, color: '#1F2937' }}>
          The Icon API is identical between React Native and web. Both platforms share the same SVG source files and icon names. Implementation differs only in rendering (react-native-svg vs dangerouslySetInnerHTML).
        </Text>
      </View>
    </ScrollView>
  ),
};

/**
 * Interactive playground for testing Icon props
 */
export const Playground: Story = {
  args: {
    name: 'star',
    size: 'medium',
    color: '#3B82F6',
  },
};

/**
 * All small icons (212 total)
 */
export const AllSmallIcons: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>
        All Small Icons ({SMALL_ICON_NAMES.length})
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        20×20px icons
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {SMALL_ICON_NAMES.map((iconName) => (
          <View
            key={iconName}
            style={{
              width: 80,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 4,
                backgroundColor: '#FAFAFA',
              }}
            >
              <Icon name={iconName} size="small" color="#181818" />
            </View>
            <Text
              style={{
                fontSize: 10,
                color: '#666',
                textAlign: 'center',
              }}
              numberOfLines={2}
            >
              {iconName}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  ),
};

/**
 * All medium icons (321 total)
 */
export const AllMediumIcons: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>
        All Medium Icons ({MEDIUM_ICON_NAMES.length})
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        24×24px icons
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {MEDIUM_ICON_NAMES.map((iconName) => (
          <View
            key={iconName}
            style={{
              width: 80,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 4,
                backgroundColor: '#FAFAFA',
              }}
            >
              <Icon name={iconName} size="medium" color="#181818" />
            </View>
            <Text
              style={{
                fontSize: 10,
                color: '#666',
                textAlign: 'center',
              }}
              numberOfLines={2}
            >
              {iconName}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  ),
};

/**
 * Common icons used across the app
 */
export const CommonIcons: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
        Common Icons
      </Text>

      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="star" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>star</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="checkmark" size="medium" color="#247450" />
          <Text style={{ fontSize: 14 }}>checkmark</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="heart" size="medium" color="#B33F3B" />
          <Text style={{ fontSize: 14 }}>heart</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="bell" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>bell</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="calendar" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>calendar</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="envelope" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>envelope</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="phone" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>phone</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="trash" size="medium" color="#B33F3B" />
          <Text style={{ fontSize: 14 }}>trash</Text>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Icon sizes comparison
 */
export const Sizes: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
        Icon Sizes
      </Text>

      <View style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Small (20px)</Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Used in xSmall, small, and medium buttons
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Icon name="star" size="small" color="#181818" />
            <Icon name="checkmark" size="small" color="#247450" />
            <Icon name="heart" size="small" color="#B33F3B" />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Medium (24px)</Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Used in large and largeFloating buttons
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Icon name="star" size="medium" color="#181818" />
            <Icon name="checkmark" size="medium" color="#247450" />
            <Icon name="heart" size="medium" color="#B33F3B" />
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Navigation icons
 */
export const NavigationIcons: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
        Navigation Icons
      </Text>

      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="arrow-left" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>arrow-left</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="arrow-right" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>arrow-right</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="arrow-up" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>arrow-up</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="arrow-down" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>arrow-down</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="chevron-left" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>chevron-left</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="chevron-right" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>chevron-right</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="chevron-up" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>chevron-up</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="chevron-down" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>chevron-down</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="home" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>home</Text>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Medical icons
 */
export const MedicalIcons: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
        Medical Icons
      </Text>

      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="stethoscope" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>stethoscope</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="pill" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>pill</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="syringe" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>syringe</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="heart-wave" size="medium" color="#181818" />
          <Text style={{ fontSize: 14 }}>heart-wave</Text>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Usage with semantic colors
 */
export const WithColors: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
        Icon Colors
      </Text>

      <View style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Success (Green)</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Icon name="checkmark" size="medium" color="#247450" />
            <Icon name="checkmark-circle" size="medium" color="#247450" />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Error (Red)</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Icon name="x-mark" size="medium" color="#B33F3B" />
            <Icon name="exclamation-triangle" size="medium" color="#B33F3B" />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Warning (Yellow)</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Icon name="exclamation-circle" size="medium" color="#B08C0A" />
            <Icon name="exclamation-triangle" size="medium" color="#B08C0A" />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Info (Blue)</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Icon name="info-circle" size="medium" color="#376C89" />
            <Icon name="question-circle" size="medium" color="#376C89" />
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};
