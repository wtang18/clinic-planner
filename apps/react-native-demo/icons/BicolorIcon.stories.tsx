/**
 * BicolorIcon Component Stories - React Native
 * Full documentation following design system guidelines
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BicolorIcon, type BicolorIconName } from './BicolorIcon';

// All available bicolor icon names
const BICOLOR_ICON_NAMES: BicolorIconName[] = [
  'positive',
  'positive-bold',
  'alert',
  'alert-bold',
  'attention',
  'info',
  'info-bold',
  'question',
  'plus',
  'minus',
  'arrow-up',
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'chevron-up',
  'chevron-down',
  'chevron-left',
  'chevron-right',
];

const meta: Meta<typeof BicolorIcon> = {
  title: 'Design System/Icons/BicolorIcon',
  component: BicolorIcon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: BICOLOR_ICON_NAMES,
      description: 'Semantic bicolor icon name (18 icons available)',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Icon size',
    },
    signifierColor: {
      control: 'color',
      description: 'Inner element color override',
    },
    containerColor: {
      control: 'color',
      description: 'Outer shape color override',
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
    name: 'positive',
    size: 'small',
  },
};

export default meta;
type Story = StoryObj<typeof BicolorIcon>;

/**
 * Complete documentation for the BicolorIcon component
 */
export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        BicolorIcon Component
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Production-ready semantic bicolor icon component with 18 status and directional icons featuring two-tone color schemes.
      </Text>

      {/* Quick Reference */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Icons:</Text> 18 semantic icons</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Sizes:</Text> 2 sizes (20px, 24px)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Colors:</Text> Dual-color with semantic defaults</Text>
        </View>
      </View>

      {/* Features */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Features
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>18 Semantic Icons:</Text> Status, directional, and action icons</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>Two-Tone Design:</Text> Container and signifier colors</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>Semantic Defaults:</Text> Auto color schemes (success=green, error=red)</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>Custom Colors:</Text> Override both container and signifier colors</Text>
          <Text style={{ fontSize: 14 }}>✅ <Text style={{ fontWeight: '600' }}>Accessibility:</Text> Optional labels and screen reader support</Text>
        </View>
      </View>

      {/* Icon Categories */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Icon Categories
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 12 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Status Icons</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>positive, positive-bold, alert, alert-bold, attention, info, info-bold, question</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Action Icons</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>plus, minus</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Directional Icons</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>arrow-up, arrow-down, arrow-left, arrow-right, chevron-up, chevron-down, chevron-left, chevron-right</Text>
          </View>
        </View>
      </View>

      {/* Color System */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Dual-Color System
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 12 }}>
          Each BicolorIcon has two customizable colors:
        </Text>
        <View style={{ gap: 8, marginBottom: 12 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>containerColor:</Text> Outer shape (circle, triangle)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>signifierColor:</Text> Inner element (checkmark, exclamation, arrow)
          </Text>
        </View>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 }}>
          <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937' }}>
            {`// Default semantic colors\n<BicolorIcon name="positive" />\n\n// Custom colors\n<BicolorIcon\n  name="positive"\n  containerColor="#FFD700"\n  signifierColor="#000000"\n/>`}
          </Text>
        </View>
      </View>

      {/* Semantic Defaults */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Semantic Color Defaults
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>positive, positive-bold:</Text> Green (success)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>alert, alert-bold:</Text> Red (error)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>attention:</Text> Yellow (warning)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>info, info-bold:</Text> Blue (informational)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>question, plus, minus, arrows, chevrons:</Text> Gray (neutral)</Text>
        </View>
      </View>

      {/* Accessibility */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Accessibility
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 12 }}>
          All BicolorIcon components support React Native accessibility features.
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>accessibilityLabel:</Text> Provide descriptive label for non-decorative icons
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>accessibilityHidden:</Text> Set to true for decorative icons (default: true)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>accessibilityRole:</Text> Automatically set to "image"
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
          <Text style={{ fontSize: 14 }}>• Use semantic icon names for their intended purpose (positive=success, alert=error)</Text>
          <Text style={{ fontSize: 14 }}>• Rely on default color schemes for consistency</Text>
          <Text style={{ fontSize: 14 }}>• Add accessibilityLabel when icon conveys important information</Text>
          <Text style={{ fontSize: 14 }}>• Use bold variants for higher emphasis or on darker backgrounds</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
          ❌ Don't
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Don't use "positive" icon for errors or "alert" for success</Text>
          <Text style={{ fontSize: 14 }}>• Don't override colors unless necessary for branding</Text>
          <Text style={{ fontSize: 14 }}>• Don't use BicolorIcon when simple Icon would suffice</Text>
        </View>
      </View>

      {/* Usage Examples */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Usage Examples
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<BicolorIcon name="positive" size="medium" />`}
            </Text>
            <BicolorIcon name="positive" size="medium" />
          </View>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<BicolorIcon name="alert-bold" size="small" />`}
            </Text>
            <BicolorIcon name="alert-bold" size="small" />
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Interactive playground for testing BicolorIcon props
 */
export const Playground: Story = {
  args: {
    name: 'positive',
    size: 'medium',
  },
};

/**
 * All small bicolor icons (18 total)
 */
export const AllSmallBicolorIcons: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>
        All Small Bicolor Icons ({BICOLOR_ICON_NAMES.length})
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        20×20px semantic status and directional icons
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {BICOLOR_ICON_NAMES.map((iconName) => (
          <View
            key={iconName}
            style={{
              width: 100,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 4,
                backgroundColor: '#FAFAFA',
              }}
            >
              <BicolorIcon name={iconName} size="small" />
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
 * All medium bicolor icons (18 total)
 */
export const AllMediumBicolorIcons: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>
        All Medium Bicolor Icons ({BICOLOR_ICON_NAMES.length})
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        24×24px semantic status and directional icons
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {BICOLOR_ICON_NAMES.map((iconName) => (
          <View
            key={iconName}
            style={{
              width: 100,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 4,
                backgroundColor: '#FAFAFA',
              }}
            >
              <BicolorIcon name={iconName} size="medium" />
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
 * Status icons with semantic colors
 */
export const StatusIcons: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
        Status Icons
      </Text>

      <View style={{ gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Positive (Success)</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <BicolorIcon name="positive" size="small" />
            <BicolorIcon name="positive" size="medium" />
            <BicolorIcon name="positive-bold" size="medium" />
          </View>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Light • Light (medium) • Bold
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Alert (Error)</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <BicolorIcon name="alert" size="small" />
            <BicolorIcon name="alert" size="medium" />
            <BicolorIcon name="alert-bold" size="medium" />
          </View>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Light • Light (medium) • Bold
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Attention (Warning)</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <BicolorIcon name="attention" size="small" />
            <BicolorIcon name="attention" size="medium" />
          </View>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Small • Medium
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Info</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <BicolorIcon name="info" size="small" />
            <BicolorIcon name="info" size="medium" />
            <BicolorIcon name="info-bold" size="medium" />
          </View>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Light • Light (medium) • Bold
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Question</Text>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <BicolorIcon name="question" size="small" />
            <BicolorIcon name="question" size="medium" />
          </View>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Small • Medium
          </Text>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Directional icons
 */
export const DirectionalIcons: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
        Directional Icons
      </Text>

      <View style={{ gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Plus / Minus</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <BicolorIcon name="plus" size="medium" />
            <BicolorIcon name="minus" size="medium" />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Arrows</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <BicolorIcon name="arrow-up" size="medium" />
            <BicolorIcon name="arrow-down" size="medium" />
            <BicolorIcon name="arrow-left" size="medium" />
            <BicolorIcon name="arrow-right" size="medium" />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Chevrons</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <BicolorIcon name="chevron-up" size="medium" />
            <BicolorIcon name="chevron-down" size="medium" />
            <BicolorIcon name="chevron-left" size="medium" />
            <BicolorIcon name="chevron-right" size="medium" />
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Custom colors
 */
export const CustomColors: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
        Custom Colors
      </Text>

      <View style={{ gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Custom Positive</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <BicolorIcon
              name="positive"
              size="medium"
              containerColor="#FFD700"
              signifierColor="#000000"
            />
            <BicolorIcon
              name="positive"
              size="medium"
              containerColor="#FF6B6B"
              signifierColor="#FFFFFF"
            />
            <BicolorIcon
              name="positive"
              size="medium"
              containerColor="#4ECDC4"
              signifierColor="#1A535C"
            />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>Custom Arrow</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <BicolorIcon
              name="arrow-right"
              size="medium"
              containerColor="#3B82F6"
              signifierColor="#FFFFFF"
            />
            <BicolorIcon
              name="arrow-right"
              size="medium"
              containerColor="#10B981"
              signifierColor="#FFFFFF"
            />
            <BicolorIcon
              name="arrow-right"
              size="medium"
              containerColor="#8B5CF6"
              signifierColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};
