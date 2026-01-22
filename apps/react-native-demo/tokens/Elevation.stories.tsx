/**
 * Elevation - React Native
 * Cross-platform shadow and depth implementation
 *
 * IMPORTANT: React Native elevation differs fundamentally from web shadows.
 * See documentation below for the architecture explanation.
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { elevation } from '../../../src/design-system/tokens/build/react-native/elevation';

const meta: Meta = {
  title: 'Design System/Semantics/Elevation',
  parameters: {
    docs: {
      description: {
        component: `
# React Native Elevation Architecture

## Why React Native Elevation is Different from Web

**Web shadows** have primitive building blocks:
- Individual properties: \`shadow-offset-x\`, \`shadow-offset-y\`, \`shadow-blur\`, \`shadow-spread\`, \`shadow-color\`
- These compose into semantic elevations: \`--elevation-xs\`, \`--elevation-sm\`, etc.

**React Native shadows** work fundamentally differently per platform:
- **iOS**: Uses 4 properties (\`shadowColor\`, \`shadowOffset\`, \`shadowOpacity\`, \`shadowRadius\`)
- **Android**: Uses 1 property (\`elevation\` - a numeric depth value)

**Therefore**: React Native has NO separate "primitive" shadow tokens. The semantic elevation levels (xs, sm, md, lg, xl, 2xl) **ARE** the lowest abstraction level, containing all platform-specific shadow properties bundled together.

## Available Elevation Levels (Semantic = Primitive in React Native)

| Level | iOS Properties | Android Property | Use Case |
|-------|---------------|------------------|----------|
| \`xs\` | offset: 1px, opacity: 0.08, radius: 2px | elevation: 1 | Barely visible, subtle depth |
| \`sm\` | offset: 2px, opacity: 0.12, radius: 4px | elevation: 3 | Subtle card shadow, hover states |
| \`md\` | offset: 4px, opacity: 0.14, radius: 8px | elevation: 6 | Default card shadow (recommended) |
| \`lg\` | offset: 8px, opacity: 0.16, radius: 12px | elevation: 10 | Elevated cards, sticky headers |
| \`xl\` | offset: 12px, opacity: 0.18, radius: 16px | elevation: 16 | Popovers, floating menus |
| \`2xl\` | offset: 16px, opacity: 0.20, radius: 24px | elevation: 24 | Modals, dialogs, max elevation |

## iOS Shadow Properties Explained

- **shadowColor**: Color of the shadow (always black: \`#000\`)
- **shadowOffset**: \`{ width: 0, height: Y }\` - How far shadow is cast. Height determines perceived elevation.
- **shadowOpacity**: 0-1 value controlling shadow darkness (0.08 to 0.20 in our scale)
- **shadowRadius**: Blur radius in pixels - larger = softer, more diffused shadow

## Android Elevation Explained

- **elevation**: Single numeric value (in dp) that determines shadow depth
- Higher values = larger, softer shadows cast further from element
- Follows Material Design elevation system
- Requires \`backgroundColor\` to be set on the View for shadow to appear

## Usage

\`\`\`tsx
import * as elevation from '@/design-system/tokens/build/react-native/elevation';

// ✅ Use semantic elevation levels (these ARE the primitives in RN)
<View style={[{ backgroundColor: '#fff', borderRadius: 12 }, elevation.md]}>
  <Text>Elevated Card</Text>
</View>

// ⚠️ Android requires backgroundColor for shadows to appear
<View style={[elevation.lg, { backgroundColor: '#fff' }]}>
  <Text>This shadow will appear on Android</Text>
</View>

// ❌ This won't show shadow on Android (missing backgroundColor)
<View style={elevation.lg}>
  <Text>No shadow on Android!</Text>
</View>
\`\`\`

## Platform Differences

The elevation utility automatically selects the correct implementation:
- On iOS: Applies shadowColor, shadowOffset, shadowOpacity, shadowRadius
- On Android: Applies elevation property

**Current Platform**: ${Platform.OS}
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Complete documentation for elevation tokens
 */
export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        Elevation System
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Cross-platform shadow and depth implementation for creating visual hierarchy in React Native apps.
      </Text>

      {/* Quick Reference */}
      <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Levels:</Text> 6 (xs, sm, md, lg, xl, 2xl)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Range:</Text> Subtle (xs) to Maximum depth (2xl)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>iOS:</Text> 4 shadow properties (color, offset, opacity, radius)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Android:</Text> 1 elevation property (numeric depth)</Text>
        </View>
      </View>

      {/* Features */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Features
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Cross-platform compatibility (iOS and Android)</Text>
          <Text style={{ fontSize: 14 }}>✅ 6 elevation levels from subtle to maximum depth</Text>
          <Text style={{ fontSize: 14 }}>✅ Platform-specific implementation (iOS: 4 props, Android: 1 prop)</Text>
          <Text style={{ fontSize: 14 }}>✅ Semantic levels ARE the primitives in React Native</Text>
          <Text style={{ fontSize: 14 }}>✅ Consistent visual hierarchy across all platforms</Text>
        </View>
      </View>

      {/* Elevation Levels */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Elevation Levels
        </Text>

        <View style={{ gap: 12 }}>
          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>xs - Extra Small</Text>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Barely visible, subtle depth</Text>
            <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#888' }}>iOS: h:1 op:0.08 r:2 | Android: elevation:1</Text>
          </View>

          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>sm - Small</Text>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Subtle card shadow, hover states</Text>
            <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#888' }}>iOS: h:2 op:0.12 r:4 | Android: elevation:3</Text>
          </View>

          <View style={{ padding: 12, backgroundColor: '#E0F2FE', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>md - Medium (Recommended Default)</Text>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Default card shadow for most use cases</Text>
            <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#888' }}>iOS: h:4 op:0.14 r:8 | Android: elevation:6</Text>
          </View>

          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>lg - Large</Text>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Elevated cards, sticky headers, floating elements</Text>
            <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#888' }}>iOS: h:8 op:0.16 r:12 | Android: elevation:10</Text>
          </View>

          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>xl - Extra Large</Text>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Dropdowns, popovers, tooltips</Text>
            <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#888' }}>iOS: h:12 op:0.18 r:16 | Android: elevation:16</Text>
          </View>

          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>2xl - Double Extra Large</Text>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Modals, dialogs, maximum elevation</Text>
            <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#888' }}>iOS: h:16 op:0.20 r:24 | Android: elevation:24</Text>
          </View>
        </View>
      </View>

      {/* Platform Architecture */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Platform Architecture
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          React Native elevation works fundamentally differently from web:
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>iOS (4 Properties)</Text>
          <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#333', marginBottom: 4 }}>shadowColor: "#000"</Text>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#333', marginBottom: 4 }}>{`shadowOffset: { width: 0, height: 4 }`}</Text>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#333', marginBottom: 4 }}>shadowOpacity: 0.14</Text>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#333' }}>shadowRadius: 8</Text>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Android (1 Property)</Text>
          <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#333', marginBottom: 4 }}>elevation: 6</Text>
            <Text style={{ fontSize: 11, color: '#DC2626' }}>⚠️ Requires backgroundColor to be set!</Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#DBEAFE', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#2563EB' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E40AF', marginBottom: 6 }}>
            Why No Primitive Shadow Tokens?
          </Text>
          <Text style={{ fontSize: 13, color: '#1E40AF' }}>
            React Native can't have separate "primitive" shadow tokens because shadows work completely differently on iOS (4 properties) vs Android (1 property). The semantic elevation levels (xs, sm, md, etc.) ARE the lowest abstraction we can have while maintaining cross-platform compatibility.
          </Text>
        </View>
      </View>

      {/* Best Practices */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Best Practices
        </Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#059669' }}>
            ✅ Do
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14 }}>• Use md for most cards and static content</Text>
            <Text style={{ fontSize: 14 }}>• Use lg-xl for floating action buttons and dropdowns</Text>
            <Text style={{ fontSize: 14 }}>• Use 2xl for modals and dialogs</Text>
            <Text style={{ fontSize: 14 }}>• Always set backgroundColor on Android for shadows to appear</Text>
            <Text style={{ fontSize: 14 }}>• Use elevation sparingly to maintain visual hierarchy</Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#DC2626' }}>
            ❌ Don't
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14 }}>• Don't use high elevation (lg-2xl) for every element</Text>
            <Text style={{ fontSize: 14 }}>• Don't forget backgroundColor on Android (shadows won't appear)</Text>
            <Text style={{ fontSize: 14 }}>• Don't create custom shadow values outside the elevation system</Text>
            <Text style={{ fontSize: 14 }}>• Don't stack too many elevated elements (creates visual confusion)</Text>
            <Text style={{ fontSize: 14 }}>• Don't mix web shadow tokens with React Native elevation</Text>
          </View>
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
              {`// Card with medium elevation\n<View style={[\n  { backgroundColor: '#fff', borderRadius: 12 },\n  elevation.md\n]}>\n  <Text>Card Content</Text>\n</View>`}
            </Text>
            <View style={[{ backgroundColor: '#fff', borderRadius: 8, padding: 16 }, elevation.md]}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>Patient Card</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Uses elevation.md</Text>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Floating action button\n<View style={[\n  { backgroundColor: '#2563eb', borderRadius: 28 },\n  elevation.lg\n]}>\n  <Text>+</Text>\n</View>`}
            </Text>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={[{ width: 56, height: 56, backgroundColor: '#2563eb', borderRadius: 28, alignItems: 'center', justifyContent: 'center' }, elevation.lg]}>
                <Text style={{ fontSize: 24, color: '#fff' }}>+</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Platform Info */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Current Platform
        </Text>
        <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#F59E0B' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 6 }}>
            Running on: {Platform.OS}
          </Text>
          <Text style={{ fontSize: 13, color: '#92400E' }}>
            {Platform.OS === 'ios'
              ? 'Using iOS shadow properties (shadowColor, shadowOffset, shadowOpacity, shadowRadius)'
              : Platform.OS === 'android'
              ? 'Using Android elevation property (numeric depth value)'
              : 'Using platform-specific shadow implementation'}
          </Text>
        </View>
      </View>
    </ScrollView>
  ),
};

const ElevationDemo = ({
  label,
  elevationLevel,
  description,
  iosProps,
  androidProp,
}: {
  label: string;
  elevationLevel: any;
  description: string;
  iosProps: string;
  androidProp: string;
}) => (
  <View style={{ marginBottom: 24 }}>
    <View
      style={[
        {
          width: '100%',
          height: 120,
          backgroundColor: '#fff',
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        },
        elevationLevel,
      ]}
    >
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{label}</Text>
    </View>
    <Text style={{ fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 4 }}>
      {label}
    </Text>
    <Text style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>{description}</Text>
    <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#888', marginTop: 4 }}>
      iOS: {iosProps}
    </Text>
    <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#888' }}>
      Android: {androidProp}
    </Text>
  </View>
);

export const AllElevations: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Elevation Scale
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Complete elevation scale from xs to 2xl with platform-specific implementations
      </Text>

      <ElevationDemo
        label="xs"
        elevationLevel={elevation.xs}
        description="Extra small shadow for subtle lift (barely visible)"
        iosProps="h:1 op:0.08 r:2"
        androidProp="elevation: 1"
      />

      <ElevationDemo
        label="sm"
        elevationLevel={elevation.sm}
        description="Small shadow for cards and hover states"
        iosProps="h:2 op:0.12 r:4"
        androidProp="elevation: 3"
      />

      <ElevationDemo
        label="md"
        elevationLevel={elevation.md}
        description="Medium shadow for elevated cards (recommended default)"
        iosProps="h:4 op:0.14 r:8"
        androidProp="elevation: 6"
      />

      <ElevationDemo
        label="lg"
        elevationLevel={elevation.lg}
        description="Large shadow for floating elements and sticky headers"
        iosProps="h:8 op:0.16 r:12"
        androidProp="elevation: 10"
      />

      <ElevationDemo
        label="xl"
        elevationLevel={elevation.xl}
        description="Extra large shadow for dropdowns and popovers"
        iosProps="h:12 op:0.18 r:16"
        androidProp="elevation: 16"
      />

      <ElevationDemo
        label="2xl"
        elevationLevel={elevation['2xl']}
        description="Double extra large shadow for modals and dialogs"
        iosProps="h:16 op:0.20 r:24"
        androidProp="elevation: 24"
      />

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: '#e5f3f8',
          borderLeftWidth: 4,
          borderLeftColor: '#376c89',
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1b3644', marginBottom: 8 }}>
          Elevation Scale Philosophy
        </Text>
        <Text style={{ fontSize: 14, color: '#234658', lineHeight: 20 }}>
          Higher elevation = element appears closer to user. Use sparingly - too many elevated elements creates visual confusion. Most cards should use md, modals use 2xl.
        </Text>
      </View>
    </ScrollView>
  ),
};

export const PlatformDetails: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Platform-Specific Implementation
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Current platform: {Platform.OS}
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          iOS Shadow Properties (md elevation)
        </Text>
        <View style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            shadowColor: "#000" (black)
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            shadowOffset: {`{ width: 0, height: 4 }`}
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            shadowOpacity: 0.14 (14% opacity)
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333' }}>
            shadowRadius: 8 (blur radius in px)
          </Text>
        </View>
        <View
          style={[
            {
              height: 100,
              backgroundColor: '#fff',
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            },
            elevation.md,
          ]}
        >
          <Text style={{ fontSize: 14, color: '#666' }}>Medium Elevation (md)</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Android Elevation Property (md elevation)
        </Text>
        <View style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333' }}>
            elevation: 6 (depth in dp)
          </Text>
          <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
            ⚠️ Requires backgroundColor to be set!
          </Text>
        </View>
        <View
          style={[
            {
              height: 100,
              backgroundColor: '#fff',
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            },
            elevation.md,
          ]}
        >
          <Text style={{ fontSize: 14, color: '#666' }}>Medium Elevation (md)</Text>
        </View>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: '#fff3cd',
          borderLeftWidth: 4,
          borderLeftColor: '#ffc107',
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#856404', marginBottom: 8 }}>
          Key Differences
        </Text>
        <Text style={{ fontSize: 14, color: '#856404', lineHeight: 20 }}>
          • iOS: 4 separate shadow properties, full control{'\n'}
          • Android: 1 numeric elevation value, follows Material Design{'\n'}
          • Our elevation utility handles both automatically{'\n'}
          • Always set backgroundColor on Android for shadows to appear{'\n'}
          • The exported elevation objects ARE the semantic tokens
        </Text>
      </View>
    </ScrollView>
  ),
};

export const ArchitectureExplanation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Why No "Primitive" Shadow Tokens?
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Understanding React Native's shadow architecture
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Web Shadow System (Has Primitives)
        </Text>
        <View style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 8 }}>
            Primitives (Building Blocks):
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            --elevation-shadow-x-0: 0px
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            --elevation-shadow-y-4: 8px
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            --elevation-shadow-blur-8: 8px
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            --elevation-shadow-spread-0: 0px
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 12 }}>
            --elevation-shadow-color-default: rgba(0,0,0,0.12)
          </Text>

          <Text style={{ fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 8 }}>
            Semantic Composites:
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#2563eb' }}>
            --elevation-md: Uses above primitives
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          React Native Shadow System (No Primitives)
        </Text>
        <View style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 8 }}>
            iOS Implementation (4 properties):
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            shadowColor: "#000"
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            {`shadowOffset: { width: 0, height: 4 }`}
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            shadowOpacity: 0.14
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 12 }}>
            shadowRadius: 8
          </Text>

          <Text style={{ fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 8 }}>
            Android Implementation (1 property):
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 12 }}>
            elevation: 6
          </Text>

          <Text style={{ fontSize: 12, fontWeight: '600', color: '#2563eb', marginBottom: 4 }}>
            Both bundled into: elevation.md
          </Text>
          <Text style={{ fontSize: 10, color: '#666' }}>
            (Semantic level IS the primitive level)
          </Text>
        </View>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: '#dbeafe',
          borderLeftWidth: 4,
          borderLeftColor: '#2563eb',
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e40af', marginBottom: 8 }}>
          The Key Insight
        </Text>
        <Text style={{ fontSize: 14, color: '#1e40af', lineHeight: 20 }}>
          React Native can't have "primitive" shadow tokens because shadows work completely differently on iOS (4 properties) vs Android (1 property). The semantic elevation levels (xs, sm, md, etc.) ARE the lowest abstraction we can have while maintaining cross-platform compatibility.{'\n\n'}
          Think of elevation.md as BOTH the primitive AND the semantic token in React Native.
        </Text>
      </View>
    </ScrollView>
  ),
};

export const UsageExamples: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Usage Examples
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Real-world examples showing when to use different elevation levels
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Card (elevation.sm)
        </Text>
        <View
          style={[
            {
              padding: 16,
              backgroundColor: '#fff',
              borderRadius: 12,
            },
            elevation.sm,
          ]}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 8 }}>
            Patient Information
          </Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
            Name: John Doe
          </Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
            DOB: 01/15/1980
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Floating Action Button (elevation.lg)
        </Text>
        <View style={{ alignItems: 'flex-end' }}>
          <View
            style={[
              {
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#2563eb',
                alignItems: 'center',
                justifyContent: 'center',
              },
              elevation.lg,
            ]}
          >
            <Text style={{ fontSize: 24, color: '#fff' }}>+</Text>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Modal/Dialog (elevation.2xl)
        </Text>
        <View
          style={[
            {
              padding: 24,
              backgroundColor: '#fff',
              borderRadius: 16,
            },
            elevation['2xl'],
          ]}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 12 }}>
            Confirm Action
          </Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 }}>
            Are you sure you want to proceed? This cannot be undone.
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: '#e5e7eb',
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>Cancel</Text>
            </View>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: '#2563eb',
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Confirm</Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: '#dbeafe',
          borderLeftWidth: 4,
          borderLeftColor: '#2563eb',
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e40af', marginBottom: 8 }}>
          Elevation Guidelines
        </Text>
        <Text style={{ fontSize: 14, color: '#1e40af', lineHeight: 20 }}>
          • Cards and static content: xs to sm{'\n'}
          • Interactive elements and hover states: sm to md{'\n'}
          • Floating elements (FABs, tooltips): lg to xl{'\n'}
          • Overlays and modals: xl to 2xl{'\n'}
          • Always include backgroundColor on Android{'\n'}
          • Use elevation sparingly - visual hierarchy
        </Text>
      </View>
    </ScrollView>
  ),
};
