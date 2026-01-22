/**
 * Decorative Colors - React Native
 * Color ramps and brand colors for visual categorization and styling
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as tokens from '../../../src/design-system/tokens/build/react-native/tokens';

const meta: Meta = {
  title: 'Design System/Decorative/Colors',
  parameters: {
    docs: {
      description: {
        component: `
# Decorative Colors

Decorative colors provide color ramps and brand colors for visual categorization,
accents, and styling beyond the semantic color system.

## When to Use Decorative Colors

- **Event/category coloring**: Assign distinct colors to calendar events, tags, categories
- **Data visualization**: Charts, graphs, progress indicators
- **Accents and highlights**: Draw attention to specific elements
- **Brand elements**: Logo colors, brand-specific styling

## Color Ramps

Each color ramp has 6 levels for flexibility:

| Level | Use Case |
|-------|----------|
| \`lowest\` | Very light backgrounds, subtle highlights |
| \`lower\` | Light backgrounds, hover states |
| \`low\` | Medium-light, borders, dividers |
| \`mid\` | Primary accent color for the ramp |
| \`high\` | Darker accent, text on light backgrounds |
| \`higher\` | Darkest, high contrast text |

## Available Ramps

- **Gray**: Neutral, timestamps, secondary info
- **Cream**: Warm neutral, organic feel
- **Blue**: Information, links, primary actions
- **Green**: Success, positive, available
- **Yellow**: Warning, attention, caution
- **Red**: Errors, alerts, unavailable (muted)
- **Purple**: Accent, special, premium
- **Saturated Red**: Strong alerts, critical errors

## Alpha Colors

- **Black Alpha**: Overlays, shadows on light backgrounds
- **White Alpha**: Overlays, highlights on dark backgrounds
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const ColorSwatch = ({
  name,
  color,
  textColor = '#000',
}: {
  name: string;
  color: string;
  textColor?: string;
}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    }}
  >
    <View
      style={{
        width: 48,
        height: 48,
        backgroundColor: color,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        marginRight: 12,
      }}
    />
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#000' }}>{name}</Text>
      <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#666' }}>{color}</Text>
    </View>
  </View>
);

const ColorRampSection = ({
  title,
  description,
  colors,
}: {
  title: string;
  description: string;
  colors: { name: string; color: string; textColor?: string }[];
}) => (
  <View style={{ marginBottom: 32 }}>
    <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 4 }}>{title}</Text>
    <Text style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>{description}</Text>
    <View
      style={{
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 8,
      }}
    >
      {colors.map((c) => (
        <ColorSwatch key={c.name} {...c} />
      ))}
    </View>
  </View>
);

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        Decorative Colors
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Color ramps and brand colors for visual categorization, accents, and data visualization.
      </Text>

      <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Quick Reference</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Color Ramps:</Text> 8 (gray, cream, blue, green, yellow, red, purple, saturated red)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Levels per Ramp:</Text> 6 (lowest → higher)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Alpha Colors:</Text> Black (6 levels), White (6 levels)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Brand Colors:</Text> 9 logo/brand colors
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Use Cases</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Calendar Events:</Text> Assign ramp colors to event categories
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Tags/Labels:</Text> Use mid level for background, higher for text
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Charts:</Text> Use mid levels from different ramps for data series
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Overlays:</Text> Use alpha colors for dimming/highlighting
          </Text>
        </View>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: '#fff3cd',
          borderLeftWidth: 4,
          borderLeftColor: '#ffc107',
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#856404', marginBottom: 8 }}>
          Decorative vs Semantic
        </Text>
        <Text style={{ fontSize: 13, color: '#856404', lineHeight: 18 }}>
          Use <Text style={{ fontWeight: '600' }}>semantic colors</Text> (colorBg*, colorFg*) for UI
          components like buttons, inputs, and cards.{'\n\n'}
          Use <Text style={{ fontWeight: '600' }}>decorative colors</Text> for categorization,
          data visualization, and accent styling where you need a specific hue.
        </Text>
      </View>
    </ScrollView>
  ),
};

export const GrayRamp: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ColorRampSection
        title="Gray"
        description="Neutral colors for timestamps, secondary text, disabled states, and borders"
        colors={[
          { name: 'grayMin', color: tokens.grayMin },
          { name: 'grayLowest', color: tokens.grayLowest },
          { name: 'grayLower', color: tokens.grayLower },
          { name: 'grayLow', color: tokens.grayLow },
          { name: 'grayMid', color: tokens.grayMid },
          { name: 'grayHigh', color: tokens.grayHigh, textColor: '#fff' },
          { name: 'grayHigher', color: tokens.grayHigher, textColor: '#fff' },
          { name: 'grayHighest', color: tokens.grayHighest, textColor: '#fff' },
          { name: 'grayMax', color: tokens.grayMax, textColor: '#fff' },
        ]}
      />
    </ScrollView>
  ),
};

export const CreamRamp: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ColorRampSection
        title="Cream"
        description="Warm neutral colors for an organic, earthy feel"
        colors={[
          { name: 'creamLowest', color: tokens.creamLowest },
          { name: 'creamLower', color: tokens.creamLower },
          { name: 'creamLow', color: tokens.creamLow },
          { name: 'creamMid', color: tokens.creamMid },
          { name: 'creamHigh', color: tokens.creamHigh, textColor: '#fff' },
          { name: 'creamHigher', color: tokens.creamHigher, textColor: '#fff' },
        ]}
      />
    </ScrollView>
  ),
};

export const BlueRamp: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ColorRampSection
        title="Blue"
        description="Information, links, primary actions, calm and trustworthy"
        colors={[
          { name: 'blueLowest', color: tokens.blueLowest },
          { name: 'blueLower', color: tokens.blueLower },
          { name: 'blueLow', color: tokens.blueLow },
          { name: 'blueMid', color: tokens.blueMid },
          { name: 'blueHigh', color: tokens.blueHigh, textColor: '#fff' },
          { name: 'blueHigher', color: tokens.blueHigher, textColor: '#fff' },
        ]}
      />
    </ScrollView>
  ),
};

export const GreenRamp: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ColorRampSection
        title="Green"
        description="Success, positive states, availability, growth"
        colors={[
          { name: 'greenLowest', color: tokens.greenLowest },
          { name: 'greenLower', color: tokens.greenLower },
          { name: 'greenLow', color: tokens.greenLow },
          { name: 'greenMid', color: tokens.greenMid },
          { name: 'greenHigh', color: tokens.greenHigh, textColor: '#fff' },
          { name: 'greenHigher', color: tokens.greenHigher, textColor: '#fff' },
        ]}
      />
    </ScrollView>
  ),
};

export const YellowRamp: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ColorRampSection
        title="Yellow"
        description="Warning, attention, caution states"
        colors={[
          { name: 'yellowLowest', color: tokens.yellowLowest },
          { name: 'yellowLower', color: tokens.yellowLower },
          { name: 'yellowLow', color: tokens.yellowLow },
          { name: 'yellowMid', color: tokens.yellowMid },
          { name: 'yellowHigh', color: tokens.yellowHigh, textColor: '#fff' },
          { name: 'yellowHigher', color: tokens.yellowHigher, textColor: '#fff' },
        ]}
      />
    </ScrollView>
  ),
};

export const RedRamp: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ColorRampSection
        title="Red (Muted)"
        description="Softer red for errors, unavailable states (less alarming)"
        colors={[
          { name: 'redLowest', color: tokens.redLowest },
          { name: 'redLower', color: tokens.redLower },
          { name: 'redLow', color: tokens.redLow },
          { name: 'redMid', color: tokens.redMid },
          { name: 'redHigh', color: tokens.redHigh, textColor: '#fff' },
          { name: 'redHigher', color: tokens.redHigher, textColor: '#fff' },
        ]}
      />
    </ScrollView>
  ),
};

export const PurpleRamp: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ColorRampSection
        title="Purple"
        description="Accent, special, premium, creative elements"
        colors={[
          { name: 'purpleLowest', color: tokens.purpleLowest },
          { name: 'purpleLower', color: tokens.purpleLower },
          { name: 'purpleLow', color: tokens.purpleLow },
          { name: 'purpleMid', color: tokens.purpleMid },
          { name: 'purpleHigh', color: tokens.purpleHigh, textColor: '#fff' },
          { name: 'purpleHigher', color: tokens.purpleHigher, textColor: '#fff' },
        ]}
      />
    </ScrollView>
  ),
};

export const SaturatedRedRamp: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <ColorRampSection
        title="Saturated Red"
        description="Strong alerts, critical errors, urgent attention needed"
        colors={[
          { name: 'saturatedRedLowest', color: tokens.saturatedRedLowest },
          { name: 'saturatedRedLower', color: tokens.saturatedRedLower },
          { name: 'saturatedRedLow', color: tokens.saturatedRedLow },
          { name: 'saturatedRedMid', color: tokens.saturatedRedMid },
          { name: 'saturatedRedHigh', color: tokens.saturatedRedHigh, textColor: '#fff' },
          { name: 'saturatedRedHigher', color: tokens.saturatedRedHigher, textColor: '#fff' },
        ]}
      />
    </ScrollView>
  ),
};

export const AlphaColors: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16 }}>Alpha Colors</Text>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Black Alpha</Text>
        <Text style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
          Overlays and shadows on light backgrounds
        </Text>
        <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' }}>
          {[
            { name: 'blackAlphaMin', color: tokens.blackAlphaMin },
            { name: 'blackAlphaLowest', color: tokens.blackAlphaLowest },
            { name: 'blackAlphaLower', color: tokens.blackAlphaLower },
            { name: 'blackAlphaLow', color: tokens.blackAlphaLow },
            { name: 'blackAlphaMid', color: tokens.blackAlphaMid },
            { name: 'blackAlphaHigh', color: tokens.blackAlphaHigh, textColor: '#fff' },
          ].map((c) => (
            <ColorSwatch key={c.name} {...c} />
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>White Alpha</Text>
        <Text style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
          Overlays and highlights on dark backgrounds
        </Text>
        <View style={{ backgroundColor: '#333', padding: 12, borderRadius: 8 }}>
          {[
            { name: 'whiteAlphaMin', color: tokens.whiteAlphaMin, textColor: '#fff' },
            { name: 'whiteAlphaLowest', color: tokens.whiteAlphaLowest, textColor: '#fff' },
            { name: 'whiteAlphaLower', color: tokens.whiteAlphaLower, textColor: '#fff' },
            { name: 'whiteAlphaLow', color: tokens.whiteAlphaLow, textColor: '#fff' },
            { name: 'whiteAlphaMid', color: tokens.whiteAlphaMid, textColor: '#000' },
            { name: 'whiteAlphaHigh', color: tokens.whiteAlphaHigh, textColor: '#000' },
          ].map((c) => (
            <View
              key={c.name}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: c.color,
                  borderRadius: 8,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>{c.name}</Text>
                <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#aaa' }}>{c.color}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  ),
};

export const BrandColors: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Brand Colors</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
        Official brand and logo colors for consistent brand representation
      </Text>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Logo Colors</Text>
        <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 }}>
          {[
            { name: 'brandLogoPrimary', color: tokens.brandLogoPrimary, textColor: '#fff' },
            { name: 'brandLogoSecondary', color: tokens.brandLogoSecondary, textColor: '#fff' },
            { name: 'brandLogoPurple', color: tokens.brandLogoPurple },
            { name: 'brandLogoMint', color: tokens.brandLogoMint },
            { name: 'brandLogoGreen', color: tokens.brandLogoGreen, textColor: '#fff' },
            { name: 'brandLogoOrange', color: tokens.brandLogoOrange, textColor: '#fff' },
            { name: 'brandLogoYellow', color: tokens.brandLogoYellow },
            { name: 'brandLogoBlue', color: tokens.brandLogoBlue },
          ].map((c) => (
            <ColorSwatch key={c.name} {...c} />
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Special Brand</Text>
        <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8 }}>
          <ColorSwatch name="brandCarbyGreen" color={tokens.brandCarbyGreen} />
        </View>
      </View>
    </ScrollView>
  ),
};

export const AllRampsComparison: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>All Ramps Comparison</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
        Compare mid-level colors across all ramps for category assignment
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {[
          { name: 'Gray', color: tokens.grayMid },
          { name: 'Cream', color: tokens.creamMid },
          { name: 'Blue', color: tokens.blueMid },
          { name: 'Green', color: tokens.greenMid },
          { name: 'Yellow', color: tokens.yellowMid },
          { name: 'Red', color: tokens.redMid },
          { name: 'Purple', color: tokens.purpleMid },
          { name: 'Sat. Red', color: tokens.saturatedRedMid },
        ].map((c) => (
          <View
            key={c.name}
            style={{
              width: 80,
              height: 80,
              backgroundColor: c.color,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
              {c.name}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: '#e5f3f8',
          borderLeftWidth: 4,
          borderLeftColor: '#376c89',
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1b3644', marginBottom: 8 }}>
          Category Assignment Tips
        </Text>
        <Text style={{ fontSize: 13, color: '#234658', lineHeight: 18 }}>
          • Use mid-level for backgrounds, higher for text{'\n'}
          • Assign colors consistently across the app{'\n'}
          • Blue/Green for positive categories{'\n'}
          • Yellow/Red for attention-needing categories{'\n'}
          • Purple for special/premium categories{'\n'}
          • Gray for neutral/uncategorized items
        </Text>
      </View>
    </ScrollView>
  ),
};

export const UsageExamples: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Usage Examples</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
        Real-world examples of decorative colors in use
      </Text>

      {/* Calendar Event Categories */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Calendar Event Categories
        </Text>
        <View style={{ gap: 8 }}>
          {[
            { label: 'Appointment', bg: tokens.blueLowest, border: tokens.blueMid, text: tokens.blueHigher },
            { label: 'Meeting', bg: tokens.greenLowest, border: tokens.greenMid, text: tokens.greenHigher },
            { label: 'Reminder', bg: tokens.yellowLowest, border: tokens.yellowMid, text: tokens.yellowHigher },
            { label: 'Urgent', bg: tokens.saturatedRedLowest, border: tokens.saturatedRedMid, text: tokens.saturatedRedHigher },
            { label: 'Personal', bg: tokens.purpleLowest, border: tokens.purpleMid, text: tokens.purpleHigher },
          ].map((event) => (
            <View
              key={event.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                backgroundColor: event.bg,
                borderLeftWidth: 4,
                borderLeftColor: event.border,
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: event.border,
                  marginRight: 12,
                }}
              />
              <Text style={{ fontSize: 14, fontWeight: '600', color: event.text }}>
                {event.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tags */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Tags/Labels</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'New Patient', bg: tokens.blueLow, text: tokens.blueHigher },
            { label: 'Follow-up', bg: tokens.greenLow, text: tokens.greenHigher },
            { label: 'Pending', bg: tokens.yellowLow, text: tokens.yellowHigher },
            { label: 'Urgent', bg: tokens.saturatedRedLow, text: tokens.saturatedRedHigher },
            { label: 'VIP', bg: tokens.purpleLow, text: tokens.purpleHigher },
          ].map((tag) => (
            <View
              key={tag.label}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                backgroundColor: tag.bg,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: tag.text }}>{tag.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Status Indicators */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Status Indicators</Text>
        <View style={{ gap: 8 }}>
          {[
            { label: 'Available', color: tokens.greenMid },
            { label: 'Busy', color: tokens.redMid },
            { label: 'Away', color: tokens.yellowMid },
            { label: 'Offline', color: tokens.grayMid },
          ].map((status) => (
            <View key={status.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: status.color,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 14 }}>{status.label}</Text>
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
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e40af', marginBottom: 8 }}>
          Import Pattern
        </Text>
        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#1e40af' }}>
          {`import {\n  blueMid,\n  blueLowest,\n  blueHigher,\n} from '@/tokens/build/react-native/tokens';`}
        </Text>
      </View>
    </ScrollView>
  ),
};
