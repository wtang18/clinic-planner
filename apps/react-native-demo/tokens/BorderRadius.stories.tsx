/**
 * Border Radius - React Native
 * Semantic border radius tokens for rounded corners
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import {
  dimensionRadiusNone,
  dimensionRadiusXs,
  dimensionRadiusSm,
  dimensionRadiusMd,
  dimensionRadiusLg,
  dimensionRadiusFull,
} from '../../../src/design-system/tokens/build/react-native/tokens';

const meta: Meta = {
  title: 'Design System/Semantics/Border Radius',
  parameters: {
    docs: {
      description: {
        component: `
# Border Radius Tokens

Semantic border radius tokens for creating rounded corners on components.

## Available Radius Levels

| Token | Value | Use Case |
|-------|-------|----------|
| \`dimensionRadiusNone\` | 0px | Sharp corners, formal elements |
| \`dimensionRadiusXs\` | 4px | Subtle rounding, small elements |
| \`dimensionRadiusSm\` | 8px | Buttons, inputs, small cards |
| \`dimensionRadiusMd\` | 16px | Cards, containers (recommended default) |
| \`dimensionRadiusLg\` | 24px | Large cards, modals |
| \`dimensionRadiusFull\` | 999px | Pills, circular elements |

## Design Philosophy

Border radius creates visual hierarchy and affects perceived friendliness:
- **Sharp (none)**: Professional, formal, traditional
- **Small (xs, sm)**: Modern, clean, approachable
- **Medium (md)**: Friendly, inviting (most common)
- **Large (lg)**: Playful, prominent, distinctive
- **Full**: Pills, circular, avatars

## Usage

\`\`\`tsx
import { dimensionRadiusMd } from '@/design-system/tokens/build/react-native/tokens';

<View style={{
  borderRadius: dimensionRadiusMd.scale, // Uses scale for RN
  backgroundColor: '#fff'
}}>
  <Text>Rounded Card</Text>
</View>
\`\`\`

## Token Structure

Each radius token contains:
- \`original\`: CSS value (e.g., "16px")
- \`number\`: Numeric value (e.g., 16)
- \`decimal\`: Decimal representation (e.g., 0.16)
- \`scale\`: React Native scale value (number × 16)

**For React Native**: Use the \`.scale\` property with \`borderRadius\`.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Complete documentation for border radius tokens
 */
export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>Border Radius System</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Semantic border radius tokens for creating rounded corners with consistent visual language.
      </Text>

      <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Quick Reference</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Levels:</Text> 6 (none, xs, sm, md, lg, full)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Range:</Text> 0px to 999px (full)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Default:</Text> md (16px) for most components</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Features</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ 6 radius levels for different component types</Text>
          <Text style={{ fontSize: 14 }}>✅ Semantic naming indicates visual friendliness</Text>
          <Text style={{ fontSize: 14 }}>✅ .number property for easy React Native usage</Text>
          <Text style={{ fontSize: 14 }}>✅ Consistent rounding creates cohesive design</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Radius Scale</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>none (0px):</Text> Sharp corners for formal elements</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>xs (4px):</Text> Subtle rounding for badges, tags</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>sm (8px):</Text> Buttons, inputs, form fields</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>md (16px):</Text> Cards, containers (recommended default)</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>lg (24px):</Text> Large cards, modals, dialogs</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>full (999px):</Text> Pills, circular elements, avatars</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Best Practices</Text>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#059669' }}>✅ Do</Text>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 14 }}>• Use md (16px) as your default radius for consistency</Text>
            <Text style={{ fontSize: 14 }}>• Match radius to component size (smaller = tighter radius)</Text>
            <Text style={{ fontSize: 14 }}>• Use .number property in React Native styles</Text>
          </View>
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#DC2626' }}>❌ Don't</Text>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 14 }}>• Don't use too many different radius values</Text>
            <Text style={{ fontSize: 14 }}>• Don't use full radius except for pills/avatars</Text>
            <Text style={{ fontSize: 14 }}>• Don't create custom radius values outside the system</Text>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Usage Examples</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 12 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 6 }}>
              {`<View style={{\n  borderRadius: dimensionRadiusMd.number,\n  backgroundColor: '#fff'\n}}>`}
            </Text>
            <View style={{ borderRadius: dimensionRadiusMd.number, backgroundColor: '#fff', padding: 12, borderWidth: 1, borderColor: '#e1e1e1' }}>
              <Text style={{ fontSize: 14 }}>Card with md radius (16px)</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};

const RadiusDemo = ({
  label,
  value,
  description,
  useCase,
}: {
  label: string;
  value: number;
  description: string;
  useCase: string;
}) => (
  <View style={{ marginBottom: 24 }}>
    <View
      style={{
        width: '100%',
        height: 120,
        backgroundColor: '#2563eb',
        borderRadius: value,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{label}</Text>
      <Text style={{ fontSize: 14, color: '#e0e7ff', marginTop: 4 }}>{value}px</Text>
    </View>
    <Text style={{ fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 4 }}>
      {label} ({value}px)
    </Text>
    <Text style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>{description}</Text>
    <Text style={{ fontSize: 10, color: '#888', fontStyle: 'italic' }}>Use case: {useCase}</Text>
  </View>
);

export const AllRadiusLevels: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Border Radius Scale
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Complete border radius scale from none (0px) to full (999px)
      </Text>

      <RadiusDemo
        label="none"
        value={dimensionRadiusNone.number}
        description="No rounding - sharp, formal corners"
        useCase="Formal documents, professional layouts, grid systems"
      />

      <RadiusDemo
        label="xs"
        value={dimensionRadiusXs.number}
        description="Extra small - subtle rounding"
        useCase="Small badges, tags, chips, tight UI elements"
      />

      <RadiusDemo
        label="sm"
        value={dimensionRadiusSm.number}
        description="Small - gentle rounding"
        useCase="Buttons, text inputs, form fields, small cards"
      />

      <RadiusDemo
        label="md"
        value={dimensionRadiusMd.number}
        description="Medium - friendly rounding (recommended default)"
        useCase="Cards, containers, panels, standard UI components"
      />

      <RadiusDemo
        label="lg"
        value={dimensionRadiusLg.number}
        description="Large - prominent rounding"
        useCase="Large cards, modals, dialogs, feature sections"
      />

      <RadiusDemo
        label="full"
        value={dimensionRadiusFull.number}
        description="Full rounding - creates pill/circular shapes"
        useCase="Pills, toggle pills, avatars, circular buttons"
      />

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: '#e5f3f8',
          borderLeftWidth: 4,
          borderLeftColor: '#376c89',
          borderRadius: dimensionRadiusSm.number,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1b3644', marginBottom: 8 }}>
          Border Radius Philosophy
        </Text>
        <Text style={{ fontSize: 14, color: '#234658', lineHeight: 20 }}>
          Larger radius = more friendly and playful. Most apps should standardize on md (16px) for
          consistency. Use full (999px) for pill shapes, avatars, and circular elements.
        </Text>
      </View>
    </ScrollView>
  ),
};

export const UsageExamples: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Usage Examples</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Real-world examples showing different radius levels in action
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Button (radius sm - 8px)
        </Text>
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: '#2563eb',
            borderRadius: dimensionRadiusSm.number,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
            Schedule Appointment
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Patient Card (radius md - 16px)
        </Text>
        <View
          style={{
            padding: 16,
            backgroundColor: '#fff',
            borderRadius: dimensionRadiusMd.number,
            borderWidth: 1,
            borderColor: '#e5e7eb',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 8 }}>
            John Doe
          </Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>DOB: 01/15/1980</Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>MRN: 123456</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Modal Container (radius lg - 24px)
        </Text>
        <View
          style={{
            padding: 24,
            backgroundColor: '#fff',
            borderRadius: dimensionRadiusLg.number,
            borderWidth: 1,
            borderColor: '#e5e7eb',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 12 }}>
            Confirm Booking
          </Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 }}>
            You are about to book an appointment with Dr. Smith on March 15, 2024 at 2:00 PM.
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                paddingVertical: 10,
                backgroundColor: '#e5e7eb',
                borderRadius: dimensionRadiusSm.number,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>Cancel</Text>
            </View>
            <View
              style={{
                flex: 1,
                paddingVertical: 10,
                backgroundColor: '#2563eb',
                borderRadius: dimensionRadiusSm.number,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Confirm</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Badge/Tag (radius xs - 4px)
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: '#dbeafe',
              borderRadius: dimensionRadiusXs.number,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#1e40af' }}>Urgent</Text>
          </View>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: '#dcfce7',
              borderRadius: dimensionRadiusXs.number,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#166534' }}>Confirmed</Text>
          </View>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: '#fef3c7',
              borderRadius: dimensionRadiusXs.number,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#92400e' }}>Pending</Text>
          </View>
        </View>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: '#dbeafe',
          borderLeftWidth: 4,
          borderLeftColor: '#2563eb',
          borderRadius: dimensionRadiusSm.number,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e40af', marginBottom: 8 }}>
          Radius Guidelines
        </Text>
        <Text style={{ fontSize: 14, color: '#1e40af', lineHeight: 20 }}>
          • Small UI elements (badges, tags): xs (4px){'\n'}
          • Interactive elements (buttons, inputs): sm (8px){'\n'}
          • Cards and containers: md (16px) - recommended default{'\n'}
          • Modals and large panels: lg (24px){'\n'}
          • Pills, avatars, circular elements: full (999px){'\n'}
          • Maintain consistency - pick one or two primary radius values
        </Text>
      </View>
    </ScrollView>
  ),
};

export const TokenStructure: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Token Structure</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Understanding the border radius token object structure
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Example: dimensionRadiusMd
        </Text>
        <View
          style={{
            backgroundColor: '#f8f9fa',
            padding: 12,
            borderRadius: dimensionRadiusSm.number,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            original: "16px"
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            number: 16
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            decimal: 0.16
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333' }}>scale: 256</Text>
        </View>

        <View
          style={{
            padding: 16,
            backgroundColor: '#fff3cd',
            borderLeftWidth: 4,
            borderLeftColor: '#ffc107',
            borderRadius: dimensionRadiusSm.number,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#856404', marginBottom: 8 }}>
            For React Native
          </Text>
          <Text style={{ fontSize: 13, color: '#856404', lineHeight: 18 }}>
            Use the <Text style={{ fontFamily: 'monospace' }}>.number</Text> property with{' '}
            <Text style={{ fontFamily: 'monospace' }}>borderRadius</Text>.{'\n\n'}
            The <Text style={{ fontFamily: 'monospace' }}>.scale</Text> property (number × 16) is
            available but typically <Text style={{ fontFamily: 'monospace' }}>.number</Text> is
            more intuitive for border radius.
          </Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Usage Example</Text>
        <View
          style={{
            backgroundColor: '#f8f9fa',
            padding: 12,
            borderRadius: dimensionRadiusSm.number,
          }}
        >
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            import {'{dimensionRadiusMd}'} from
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 8 }}>
            {'  '}
            '@/design-system/tokens/build/react-native/tokens';
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            {'<View style={{'}
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#2563eb', marginBottom: 4 }}>
            {'  borderRadius: dimensionRadiusMd.number,'}
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', marginBottom: 4 }}>
            {'  backgroundColor: "#fff"'}
          </Text>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#333' }}>
            {'}}> ... </View>'}
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          All Radius Tokens
        </Text>
        {[
          { name: 'dimensionRadiusNone', value: dimensionRadiusNone },
          { name: 'dimensionRadiusXs', value: dimensionRadiusXs },
          { name: 'dimensionRadiusSm', value: dimensionRadiusSm },
          { name: 'dimensionRadiusMd', value: dimensionRadiusMd },
          { name: 'dimensionRadiusLg', value: dimensionRadiusLg },
          { name: 'dimensionRadiusFull', value: dimensionRadiusFull },
        ].map(({ name, value }) => (
          <View
            key={name}
            style={{
              backgroundColor: '#f8f9fa',
              padding: 12,
              borderRadius: dimensionRadiusXs.number,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 4 }}>
              {name}
            </Text>
            <Text style={{ fontFamily: 'monospace', fontSize: 10, color: '#666' }}>
              original: {value.original} | number: {value.number} | decimal: {value.decimal} |
              scale: {value.scale}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  ),
};
