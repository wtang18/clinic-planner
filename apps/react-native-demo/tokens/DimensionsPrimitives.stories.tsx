/**
 * Dimensions Primitives - React Native
 * Primitive dimension tokens for spacing and sizing
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as tokens from '../../../src/design-system/tokens/build/react-native/tokens';

const meta: Meta = {
  title: 'Design System/Primitives/Dimensions',
  parameters: {
    docs: {
      description: {
        component: `
# Dimensions Primitive Tokens

Raw dimension values that serve as the foundation for all spacing and sizing in the design system.

## What are Primitives?

Primitive tokens are the lowest-level design tokens in our system. They represent raw, reusable values that are referenced by semantic tokens. Think of them as the "atoms" of our design system.

**Important**: In most cases, you should use semantic tokens (like \`dimensionSpaceAroundMd\` or \`dimensionSpaceBetweenRelatedMd\`) instead of primitives. Only use primitive tokens when:
- Creating new semantic tokens
- Handling edge cases not covered by semantic tokens
- Building foundation-level components

## Available Primitive Dimensions

Our dimension primitives follow a T-shirt sizing scale from 0 to 1200, plus negative values for special cases like negative margins.

| Token | Value | Usage |
|-------|-------|-------|
| \`dimensionSpace0\` | 0 | Zero spacing |
| \`dimensionSpace25\` | 2 | Micro spacing |
| \`dimensionSpace50\` | 4 | Tiny spacing |
| \`dimensionSpace75\` | 6 | Extra small spacing |
| \`dimensionSpace100\` | 8 | Small spacing |
| \`dimensionSpace125\` | 10 | Small-medium spacing |
| \`dimensionSpace150\` | 12 | Medium-small spacing |
| \`dimensionSpace200\` | 16 | Medium spacing |
| \`dimensionSpace250\` | 20 | Medium-large spacing |
| \`dimensionSpace300\` | 24 | Large spacing |
| \`dimensionSpace400\` | 32 | Extra large spacing |
| \`dimensionSpace500\` | 40 | XXL spacing |
| \`dimensionSpace550\` | 44 | XXL+ spacing |
| \`dimensionSpace600\` | 48 | XXXL spacing |
| \`dimensionSpace700\` | 56 | Huge spacing |
| \`dimensionSpace800\` | 64 | Massive spacing |
| \`dimensionSpace900\` | 72 | Giant spacing |
| \`dimensionSpace1000\` | 80 | Enormous spacing |
| \`dimensionSpace1200\` | 96 | Maximum spacing |

## Negative Dimensions

Negative dimensions are used for overlapping elements and negative margins.

| Token | Value |
|-------|-------|
| \`dimensionSpaceNegative25\` | -2 |
| \`dimensionSpaceNegative50\` | -4 |
| \`dimensionSpaceNegative100\` | -8 |
| \`dimensionSpaceNegative200\` | -16 |
| \`dimensionSpaceNegative300\` | -24 |

## Scale Philosophy

The scale follows a hybrid approach:
- **0-200**: Fine-grained control with smaller increments for precise UI spacing
- **200-600**: Regular increments for common spacing needs
- **600-1200**: Larger jumps for macro layouts and page structure
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const DimensionDemo = ({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) => (
  <View style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <View style={{ width: 120 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', fontFamily: 'monospace', color: '#000' }}>
          {label}
        </Text>
        <Text style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>
          {value}px
        </Text>
      </View>
      <View style={{ height: 32, width: value, backgroundColor: '#2563eb', borderRadius: 4 }} />
    </View>
    <Text style={{ fontSize: 11, color: '#666' }}>{description}</Text>
  </View>
);

export const AllDimensions: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Complete Dimension Scale
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Complete scale from 0px to 96px
      </Text>

      <DimensionDemo label="space-0" value={tokens.dimensionSpace0.number} description="Zero spacing (baseline)" />
      <DimensionDemo label="space-25" value={tokens.dimensionSpace25.number} description="Micro spacing for fine adjustments" />
      <DimensionDemo label="space-50" value={tokens.dimensionSpace50.number} description="Tiny spacing for tight layouts" />
      <DimensionDemo label="space-75" value={tokens.dimensionSpace75.number} description="Extra small spacing" />
      <DimensionDemo label="space-100" value={tokens.dimensionSpace100.number} description="Small spacing for compact UIs" />
      <DimensionDemo label="space-125" value={tokens.dimensionSpace125.number} description="Small-medium spacing" />
      <DimensionDemo label="space-150" value={tokens.dimensionSpace150.number} description="Medium-small spacing" />
      <DimensionDemo label="space-200" value={tokens.dimensionSpace200.number} description="Medium spacing - most common" />
      <DimensionDemo label="space-250" value={tokens.dimensionSpace250.number} description="Medium-large spacing" />
      <DimensionDemo label="space-300" value={tokens.dimensionSpace300.number} description="Large spacing for section breaks" />
      <DimensionDemo label="space-400" value={tokens.dimensionSpace400.number} description="Extra large spacing" />
      <DimensionDemo label="space-500" value={tokens.dimensionSpace500.number} description="XXL spacing for major sections" />
      <DimensionDemo label="space-550" value={tokens.dimensionSpace550.number} description="XXL+ spacing" />
      <DimensionDemo label="space-600" value={tokens.dimensionSpace600.number} description="XXXL spacing" />
      <DimensionDemo label="space-700" value={tokens.dimensionSpace700.number} description="Huge spacing for page structure" />
      <DimensionDemo label="space-800" value={tokens.dimensionSpace800.number} description="Massive spacing" />
      <DimensionDemo label="space-900" value={tokens.dimensionSpace900.number} description="Giant spacing for hero sections" />
      <DimensionDemo label="space-1000" value={tokens.dimensionSpace1000.number} description="Enormous spacing" />
      <DimensionDemo label="space-1200" value={tokens.dimensionSpace1200.number} description="Maximum spacing for major layout gaps" />
    </ScrollView>
  ),
};

export const NegativeDimensions: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Negative Dimensions
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Used for overlapping elements, negative margins, and positioning adjustments
      </Text>

      <DimensionDemo
        label="negative-25"
        value={Math.abs(tokens.dimensionSpaceNegative25.number)}
        description="Micro negative adjustment (-2px)"
      />
      <DimensionDemo
        label="negative-50"
        value={Math.abs(tokens.dimensionSpaceNegative50.number)}
        description="Small negative adjustment (-4px)"
      />
      <DimensionDemo
        label="negative-100"
        value={Math.abs(tokens.dimensionSpaceNegative100.number)}
        description="Medium negative adjustment (-8px)"
      />
      <DimensionDemo
        label="negative-200"
        value={Math.abs(tokens.dimensionSpaceNegative200.number)}
        description="Large negative adjustment (-16px)"
      />
      <DimensionDemo
        label="negative-300"
        value={Math.abs(tokens.dimensionSpaceNegative300.number)}
        description="Extra large negative adjustment (-24px)"
      />

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: '#fff3cd',
          borderLeftWidth: 4,
          borderLeftColor: '#ffc107',
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#856404', marginBottom: 8 }}>
          Negative Dimension Use Cases
        </Text>
        <Text style={{ fontSize: 14, color: '#856404', lineHeight: 20 }}>
          • Overlapping avatars in a stack{'\n'}
          • Pulling elements closer together than their natural spacing{'\n'}
          • Fine-tuning alignment of icons with text{'\n'}
          • Creating negative space effects{'\n'}
          • Compensating for optical alignment issues
        </Text>
      </View>
    </ScrollView>
  ),
};

export const ScaleComparison: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Scale Comparison
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Visual comparison of key dimensions in the scale. Notice how the increments grow larger at higher values.
      </Text>

      <View style={{ gap: 12 }}>
        {[
          { label: '4px', value: tokens.dimensionSpace50.number, color: '#10b981' },
          { label: '8px', value: tokens.dimensionSpace100.number, color: '#3b82f6' },
          { label: '12px', value: tokens.dimensionSpace150.number, color: '#8b5cf6' },
          { label: '16px', value: tokens.dimensionSpace200.number, color: '#f59e0b' },
          { label: '24px', value: tokens.dimensionSpace300.number, color: '#ef4444' },
          { label: '32px', value: tokens.dimensionSpace400.number, color: '#10b981' },
          { label: '48px', value: tokens.dimensionSpace600.number, color: '#3b82f6' },
          { label: '64px', value: tokens.dimensionSpace800.number, color: '#8b5cf6' },
          { label: '96px', value: tokens.dimensionSpace1200.number, color: '#6b7280' },
        ].map(({ label, value, color }) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ width: 48, fontSize: 11, fontFamily: 'monospace', color: '#666' }}>
              {label}
            </Text>
            <View style={{ height: 32, width: value, backgroundColor: color, borderRadius: 4 }} />
          </View>
        ))}
      </View>
    </ScrollView>
  ),
};

export const UsageExamples: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        How Primitives Map to Semantic Tokens
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Examples showing how primitive dimensions are referenced by semantic tokens
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Space Between (Gap) Tokens
        </Text>
        <View style={{ gap: 8 }}>
          <View style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#000' }}>
                space-between-coupled
              </Text>
              <Text style={{ fontSize: 10, color: '#666' }}>uses</Text>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#2563eb' }}>
                space-50 (4px)
              </Text>
            </View>
          </View>
          <View style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#000' }}>
                space-between-related-md
              </Text>
              <Text style={{ fontSize: 10, color: '#666' }}>uses</Text>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#2563eb' }}>
                space-200 (16px)
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Space Around (Padding) Tokens
        </Text>
        <View style={{ gap: 8 }}>
          <View style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#000' }}>
                space-around-xs
              </Text>
              <Text style={{ fontSize: 10, color: '#666' }}>uses</Text>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#2563eb' }}>
                space-100 (8px)
              </Text>
            </View>
          </View>
          <View style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#000' }}>
                space-around-md
              </Text>
              <Text style={{ fontSize: 10, color: '#666' }}>uses</Text>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#2563eb' }}>
                space-200 (16px)
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Border Radius Tokens
        </Text>
        <View style={{ gap: 8 }}>
          <View style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#000' }}>
                radius-xs
              </Text>
              <Text style={{ fontSize: 10, color: '#666' }}>uses</Text>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#2563eb' }}>
                space-50 (4px)
              </Text>
            </View>
          </View>
          <View style={{ padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#000' }}>
                radius-md
              </Text>
              <Text style={{ fontSize: 10, color: '#666' }}>uses</Text>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#2563eb' }}>
                space-200 (16px)
              </Text>
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
          Token Architecture
        </Text>
        <Text style={{ fontSize: 14, color: '#1e40af', lineHeight: 20 }}>
          Our token system follows a three-tier architecture:{'\n'}
          1. Primitives - Raw values (this page){'\n'}
          2. Semantic Tokens - Purpose-driven tokens that reference primitives{'\n'}
          3. Component Tokens - Component-specific tokens that reference semantic tokens{'\n\n'}
          This separation allows us to update the entire design system by changing primitive values in one place.
        </Text>
      </View>
    </ScrollView>
  ),
};
