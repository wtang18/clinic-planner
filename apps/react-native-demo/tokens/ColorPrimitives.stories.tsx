/**
 * Color Primitives - React Native
 * Primitive color tokens for the design system
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as tokens from '../../../src/design-system/tokens/build/react-native/tokens';

const meta: Meta = {
  title: 'Design System/Primitives/Colors',
  parameters: {
    docs: {
      description: {
        component: `
# Color Primitive Tokens

Raw color values that serve as the foundation for all semantic color tokens in the design system.

## What are Color Primitives?

Color primitives are the lowest-level color tokens in our system. They represent the actual color values (hex codes) used throughout the design. These primitives are referenced by semantic color tokens to create a consistent, themeable color system.

**Important**: In most cases, you should use semantic color tokens (like \`colorBgAlertSubtle\`) instead of primitives. Only use primitive tokens when:
- Creating new semantic color tokens
- Handling edge cases not covered by semantic tokens
- Building foundation-level components or themes

## Color Primitive Categories

### Base Color Scales
- **Gray**: Neutral scale from light (25) to dark (1000)
- **Cream**: Warm neutral alternative to gray
- **Blue**: Information, links, and interactive elements
- **Green**: Success, confirmation, positive actions
- **Yellow**: Warnings, cautions, attention
- **Red**: Errors, alerts, destructive actions
- **Saturated Red**: High-contrast alerts and critical errors
- **Purple**: Accents, special highlights, premium features

### Alpha (Transparency) Scales
- **Black Alpha**: Transparent black overlays for use on light backgrounds
- **White Alpha**: Transparent white overlays for use on dark backgrounds

## Naming Convention

Primitive colors follow a numeric scale:
- **25-100**: Very light tints
- **200-400**: Light to medium tones
- **500-700**: Medium to dark tones
- **800-1000**: Very dark shades

Higher numbers = darker colors (except for alpha scales where the scale represents opacity)
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Color swatch component
const ColorSwatch = ({
  name,
  value,
  textColor = '#000',
}: {
  name: string;
  value: string;
  textColor?: string;
}) => (
  <View style={{ marginBottom: 12 }}>
    <View
      style={{
        width: '100%',
        height: 64,
        backgroundColor: value,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e1e1e1',
        marginBottom: 8,
      }}
    />
    <Text style={{ fontSize: 12, fontWeight: '600', fontFamily: 'monospace', color: '#000' }}>
      {name}
    </Text>
    <Text style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>{value}</Text>
  </View>
);

export const GrayScale: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Gray Scale
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Primary neutral scale for UI elements, text, backgrounds, and borders
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-25" value={tokens.colorGray25} />
        </View>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-50" value={tokens.colorGray50} />
        </View>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-100" value={tokens.colorGray100} />
        </View>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-200" value={tokens.colorGray200} />
        </View>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-300" value={tokens.colorGray300} />
        </View>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-400" value={tokens.colorGray400} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-500" value={tokens.colorGray500} textColor="#fff" />
        </View>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-600" value={tokens.colorGray600} textColor="#fff" />
        </View>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-700" value={tokens.colorGray700} textColor="#fff" />
        </View>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-800" value={tokens.colorGray800} textColor="#fff" />
        </View>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-900" value={tokens.colorGray900} textColor="#fff" />
        </View>
        <View style={{ width: '31%' }}>
          <ColorSwatch name="gray-1000" value={tokens.colorGray1000} textColor="#fff" />
        </View>
      </View>

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
          Gray Scale Usage
        </Text>
        <Text style={{ fontSize: 14, color: '#234658', lineHeight: 20 }}>
          Gray is the workhorse of the design system. It's used for neutral UI elements, text,
          backgrounds, and borders. The scale provides enough variety to create clear visual
          hierarchy while maintaining a cohesive look.
        </Text>
      </View>
    </ScrollView>
  ),
};

export const BrandColors: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Cream Scale */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Cream Scale</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Warm neutral alternative to gray for softer UI elements
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ width: '31%' }}><ColorSwatch name="cream-50" value={tokens.colorCream50} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="cream-100" value={tokens.colorCream100} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="cream-200" value={tokens.colorCream200} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="cream-300" value={tokens.colorCream300} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="cream-400" value={tokens.colorCream400} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="cream-500" value={tokens.colorCream500} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="cream-600" value={tokens.colorCream600} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="cream-700" value={tokens.colorCream700} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="cream-800" value={tokens.colorCream800} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="cream-900" value={tokens.colorCream900} textColor="#fff" /></View>
        </View>
      </View>

      {/* Blue Scale */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Blue Scale</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Information, links, and interactive elements
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ width: '31%' }}><ColorSwatch name="blue-50" value={tokens.colorBlue50} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="blue-100" value={tokens.colorBlue100} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="blue-200" value={tokens.colorBlue200} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="blue-300" value={tokens.colorBlue300} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="blue-400" value={tokens.colorBlue400} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="blue-500" value={tokens.colorBlue500} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="blue-600" value={tokens.colorBlue600} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="blue-700" value={tokens.colorBlue700} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="blue-800" value={tokens.colorBlue800} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="blue-900" value={tokens.colorBlue900} textColor="#fff" /></View>
        </View>
      </View>

      {/* Green Scale */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Green Scale</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Success, confirmation, and positive actions
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ width: '31%' }}><ColorSwatch name="green-50" value={tokens.colorGreen50} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="green-100" value={tokens.colorGreen100} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="green-200" value={tokens.colorGreen200} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="green-300" value={tokens.colorGreen300} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="green-400" value={tokens.colorGreen400} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="green-500" value={tokens.colorGreen500} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="green-600" value={tokens.colorGreen600} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="green-700" value={tokens.colorGreen700} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="green-800" value={tokens.colorGreen800} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="green-900" value={tokens.colorGreen900} textColor="#fff" /></View>
        </View>
      </View>

      {/* Yellow Scale */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Yellow Scale</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Warnings, cautions, and attention
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ width: '31%' }}><ColorSwatch name="yellow-50" value={tokens.colorYellow50} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="yellow-100" value={tokens.colorYellow100} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="yellow-200" value={tokens.colorYellow200} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="yellow-300" value={tokens.colorYellow300} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="yellow-400" value={tokens.colorYellow400} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="yellow-500" value={tokens.colorYellow500} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="yellow-600" value={tokens.colorYellow600} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="yellow-700" value={tokens.colorYellow700} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="yellow-800" value={tokens.colorYellow800} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="yellow-900" value={tokens.colorYellow900} textColor="#fff" /></View>
        </View>
      </View>

      {/* Red Scale */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Red Scale</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Softer errors and negative states
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ width: '31%' }}><ColorSwatch name="red-50" value={tokens.colorRed50} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="red-100" value={tokens.colorRed100} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="red-200" value={tokens.colorRed200} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="red-300" value={tokens.colorRed300} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="red-400" value={tokens.colorRed400} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="red-500" value={tokens.colorRed500} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="red-600" value={tokens.colorRed600} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="red-700" value={tokens.colorRed700} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="red-800" value={tokens.colorRed800} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="red-900" value={tokens.colorRed900} textColor="#fff" /></View>
        </View>
      </View>

      {/* Saturated Red Scale */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Saturated Red Scale</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Errors, alerts, and destructive actions
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ width: '31%' }}><ColorSwatch name="saturated-red-50" value={tokens.colorSaturatedRed50} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="saturated-red-100" value={tokens.colorSaturatedRed100} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="saturated-red-200" value={tokens.colorSaturatedRed200} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="saturated-red-300" value={tokens.colorSaturatedRed300} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="saturated-red-400" value={tokens.colorSaturatedRed400} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="saturated-red-500" value={tokens.colorSaturatedRed500} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="saturated-red-600" value={tokens.colorSaturatedRed600} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="saturated-red-700" value={tokens.colorSaturatedRed700} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="saturated-red-800" value={tokens.colorSaturatedRed800} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="saturated-red-900" value={tokens.colorSaturatedRed900} textColor="#fff" /></View>
        </View>
      </View>

      {/* Purple Scale */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Purple Scale</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Accents, special highlights, and premium features
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ width: '31%' }}><ColorSwatch name="purple-50" value={tokens.colorPurple50} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="purple-100" value={tokens.colorPurple100} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="purple-200" value={tokens.colorPurple200} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="purple-300" value={tokens.colorPurple300} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="purple-400" value={tokens.colorPurple400} /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="purple-500" value={tokens.colorPurple500} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="purple-600" value={tokens.colorPurple600} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="purple-700" value={tokens.colorPurple700} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="purple-800" value={tokens.colorPurple800} textColor="#fff" /></View>
          <View style={{ width: '31%' }}><ColorSwatch name="purple-900" value={tokens.colorPurple900} textColor="#fff" /></View>
        </View>
      </View>

      {/* Utility Colors */}
      <View>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Utility Colors</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Special-purpose colors for specific features and accessibility
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, maxWidth: 400 }}>
          <View style={{ flex: 1 }}>
            <ColorSwatch name="a11y-blue" value={tokens.colorUtilityA11yBlue} textColor="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <ColorSwatch name="carby-green" value={tokens.colorUtilityCarbyGreen} />
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};

export const AlphaColors: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Black Alpha */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Black Alpha Scale</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Transparent black for overlays, shadows, and darkening effects on light backgrounds
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[
            { name: 'black-alpha-25', value: tokens.colorBlackA25, opacity: '2%' },
            { name: 'black-alpha-50', value: tokens.colorBlackA50, opacity: '6%' },
            { name: 'black-alpha-100', value: tokens.colorBlackA100, opacity: '12%' },
            { name: 'black-alpha-200', value: tokens.colorBlackA200, opacity: '24%' },
            { name: 'black-alpha-300', value: tokens.colorBlackA300, opacity: '30%' },
            { name: 'black-alpha-400', value: tokens.colorBlackA400, opacity: '36%' },
          ].map(({ name, value, opacity }) => (
            <View key={name} style={{ width: '31%', marginBottom: 12 }}>
              <View
                style={{
                  width: '100%',
                  height: 64,
                  backgroundColor: '#e5f3f8',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e1e1e1',
                  marginBottom: 8,
                  position: 'relative',
                }}
              >
                <View style={{ position: 'absolute', inset: 0, backgroundColor: value, borderRadius: 8 }} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', fontFamily: 'monospace', color: '#000' }}>
                {name}
              </Text>
              <Text style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>{opacity} opacity</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          {[
            { name: 'black-alpha-500', value: tokens.colorBlackA500, opacity: '48%' },
            { name: 'black-alpha-600', value: tokens.colorBlackA600, opacity: '60%' },
            { name: 'black-alpha-700', value: tokens.colorBlackA700, opacity: '72%' },
            { name: 'black-alpha-800', value: tokens.colorBlackA800, opacity: '80%' },
            { name: 'black-alpha-900', value: tokens.colorBlackA900, opacity: '88%' },
            { name: 'black-alpha-1000', value: tokens.colorBlackA1000, opacity: '96%' },
          ].map(({ name, value, opacity }) => (
            <View key={name} style={{ width: '31%', marginBottom: 12 }}>
              <View
                style={{
                  width: '100%',
                  height: 64,
                  backgroundColor: '#e5f3f8',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e1e1e1',
                  marginBottom: 8,
                  position: 'relative',
                }}
              >
                <View style={{ position: 'absolute', inset: 0, backgroundColor: value, borderRadius: 8 }} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', fontFamily: 'monospace', color: '#000' }}>
                {name}
              </Text>
              <Text style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>{opacity} opacity</Text>
            </View>
          ))}
        </View>
      </View>

      {/* White Alpha */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>White Alpha Scale</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          Transparent white for overlays, highlights, and lightening effects on dark backgrounds
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[
            { name: 'white-alpha-25', value: tokens.colorWhiteA25, opacity: '8%' },
            { name: 'white-alpha-50', value: tokens.colorWhiteA50, opacity: '16%' },
            { name: 'white-alpha-100', value: tokens.colorWhiteA100, opacity: '24%' },
            { name: 'white-alpha-200', value: tokens.colorWhiteA200, opacity: '32%' },
            { name: 'white-alpha-300', value: tokens.colorWhiteA300, opacity: '40%' },
            { name: 'white-alpha-400', value: tokens.colorWhiteA400, opacity: '48%' },
          ].map(({ name, value, opacity }) => (
            <View key={name} style={{ width: '31%', marginBottom: 12 }}>
              <View
                style={{
                  width: '100%',
                  height: 64,
                  backgroundColor: '#323232',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#666',
                  marginBottom: 8,
                  position: 'relative',
                }}
              >
                <View style={{ position: 'absolute', inset: 0, backgroundColor: value, borderRadius: 8 }} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', fontFamily: 'monospace', color: '#000' }}>
                {name}
              </Text>
              <Text style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>{opacity} opacity</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          {[
            { name: 'white-alpha-500', value: tokens.colorWhiteA500, opacity: '56%' },
            { name: 'white-alpha-600', value: tokens.colorWhiteA600, opacity: '68%' },
            { name: 'white-alpha-700', value: tokens.colorWhiteA700, opacity: '74%' },
            { name: 'white-alpha-800', value: tokens.colorWhiteA800, opacity: '80%' },
            { name: 'white-alpha-900', value: tokens.colorWhiteA900, opacity: '88%' },
            { name: 'white-alpha-1000', value: tokens.colorWhiteA1000, opacity: '96%' },
          ].map(({ name, value, opacity }) => (
            <View key={name} style={{ width: '31%', marginBottom: 12 }}>
              <View
                style={{
                  width: '100%',
                  height: 64,
                  backgroundColor: '#323232',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#666',
                  marginBottom: 8,
                  position: 'relative',
                }}
              >
                <View style={{ position: 'absolute', inset: 0, backgroundColor: value, borderRadius: 8 }} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', fontFamily: 'monospace', color: '#000' }}>
                {name}
              </Text>
              <Text style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>{opacity} opacity</Text>
            </View>
          ))}
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
          Alpha Color Usage
        </Text>
        <Text style={{ fontSize: 14, color: '#1e40af', lineHeight: 20 }}>
          • Black Alpha: Use for overlays, shadows, and darkening effects on light backgrounds{'\n'}
          • White Alpha: Use for highlights, glass effects, and lightening on dark backgrounds{'\n'}
          • Alpha colors preserve the background while adding tint{'\n'}
          • Useful for creating depth without fully obscuring content{'\n'}
          • Works across different background colors (unlike solid colors)
        </Text>
      </View>
    </ScrollView>
  ),
};
