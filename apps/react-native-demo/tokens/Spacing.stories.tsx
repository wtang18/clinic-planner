/**
 * Spacing (Semantic) - React Native
 * Semantic spacing tokens for consistent layout patterns
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as tokens from '../../../src/design-system/tokens/build/react-native/tokens';

const meta: Meta = {
  title: 'Design System/Semantics/Spacing',
  parameters: {
    docs: {
      description: {
        component: `
# Semantic Spacing Tokens

Purpose-driven spacing tokens that define how elements relate to each other spatially.

## Primitives vs. Semantics

- **Primitive**: \`dimensionSpace100\`, \`dimensionSpace200\` (raw values: 8px, 16px, etc.)
- **Semantic**: \`dimensionSpaceAroundMd\`, \`dimensionSpaceBetweenRelatedMd\` (contextual usage)

Think of primitives as the "raw numbers" and semantics as "what those numbers mean in context."

## Semantic Spacing Categories

### Space Around (Padding/Insets)
Space **around** content—padding inside containers.

| Token | Value | Use Case |
|-------|-------|----------|
| \`spaceAroundNone\` | 0px | No padding |
| \`spaceAroundNudge2\` | 2px | Minimal padding (tight badges) |
| \`spaceAroundNudge4\` | 4px | Extra small padding |
| \`spaceAroundNudge6\` | 6px | Very small padding |
| \`spaceAroundTight\` | 8px | Tight padding (compact buttons) |
| \`spaceAroundTightPlus\` | 10px | Tight+ padding |
| \`spaceAroundCompact\` | 12px | Compact padding (buttons/inputs) |
| \`spaceAroundDefault\` | 16px | Default padding (cards) |
| \`spaceAroundDefaultPlus\` | 20px | Default+ padding |
| \`spaceAroundSpacious\` | 24px | Spacious padding (modals/sections) |

### Space Between (Gaps/Margins)
Space **between** elements—gaps and margins.

#### Relationship-Based Spacing

| Token | Value | Relationship | Use Case |
|-------|-------|-------------|----------|
| \`spaceBetweenCoupled\` | 4px | Tightly coupled | Icon + text, label + value |
| \`spaceBetweenRepeatingSm\` | 6px | Repeating (small) | Pills, tags, badges in a row |
| \`spaceBetweenRepeatingMd\` | 8px | Repeating (medium) | Cards in a grid, list items |
| \`spaceBetweenRelatedSm\` | 8px | Related (small) | Form fields in same section |
| \`spaceBetweenRelatedMd\` | 16px | Related (medium) | Components in same feature |
| \`spaceBetweenSeparatedSm\` | 24px | Separated (small) | Different sections |
| \`spaceBetweenSeparatedMd\` | 32px | Separated (medium) | Major page sections |

## Usage Philosophy

**Ask yourself**: "What is the relationship between these elements?"
- **Tightly coupled**: Use \`spaceBetweenCoupled\` (4px)
- **Repeating items**: Use \`spaceBetweenRepeating\` (6-8px)
- **Related content**: Use \`spaceBetweenRelated\` (8-16px)
- **Separated sections**: Use \`spaceBetweenSeparated\` (24-32px)

## Usage

\`\`\`tsx
import {
  dimensionSpaceAroundDefault,
  dimensionSpaceBetweenRelatedMd,
} from '@/tokens/build/react-native/tokens';

// Card with padding (space around)
<View style={{
  padding: dimensionSpaceAroundDefault.number,    // 16px inside
  gap: dimensionSpaceBetweenRelatedMd.number  // 16px between children
}}>
  {children}
</View>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Complete documentation for semantic spacing tokens
 */
export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        Semantic Spacing System
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Purpose-driven spacing tokens that define how elements relate to each other spatially for consistent layouts.
      </Text>

      {/* Quick Reference */}
      <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Space Around:</Text> 10 tokens (none to spacious) for padding/insets</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Space Between:</Text> 8 tokens based on element relationships</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Range:</Text> 0px to 32px</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Philosophy:</Text> Think in relationships, not pixels</Text>
        </View>
      </View>

      {/* Features */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Features
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Relationship-based naming (coupled, repeating, related, separated)</Text>
          <Text style={{ fontSize: 14 }}>✅ Separate tokens for padding (around) vs gaps/margins (between)</Text>
          <Text style={{ fontSize: 14 }}>✅ Semantic names that explain intent, not just size</Text>
          <Text style={{ fontSize: 14 }}>✅ Built on 8px grid system via primitive tokens</Text>
          <Text style={{ fontSize: 14 }}>✅ Consistent spacing creates better visual rhythm</Text>
        </View>
      </View>

      {/* Space Around */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Space Around (Padding)
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          Use for padding inside containers and insets:
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>spaceAroundNudge2 (2px):</Text> Minimal padding for tight badges</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>spaceAroundTight (8px):</Text> Tight padding for compact buttons</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>spaceAroundCompact (12px):</Text> Compact padding for buttons/inputs</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>spaceAroundDefault (16px):</Text> Default card padding</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>spaceAroundDefaultPlus (20px):</Text> Larger container padding</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>spaceAroundSpacious (24px):</Text> Spacious padding for modals</Text>
        </View>
      </View>

      {/* Space Between */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Space Between (Gaps/Margins)
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          Use for gaps and margins based on element relationships:
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>Coupled (4px):</Text> Tightly coupled items (icon + text, label + value)</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>RepeatingSm (6px):</Text> Small repeating items (pills, tags, badges)</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>RepeatingMd (8px):</Text> Medium repeating items (cards, list items)</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>RelatedSm (8px):</Text> Related content in same section (form fields)</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>RelatedMd (16px):</Text> Related components in same feature area</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>SeparatedSm (24px):</Text> Different sections (small separation)</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>SeparatedMd (32px):</Text> Major page sections (large separation)</Text>
        </View>
      </View>

      {/* Relationship Philosophy */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Relationship Philosophy
        </Text>
        <View style={{ backgroundColor: '#E0F2FE', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#0369A1', marginBottom: 8 }}>
            Ask: "What is the relationship between these elements?"
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, color: '#0369A1' }}>
              <Text style={{ fontWeight: '600' }}>Tightly coupled:</Text> spaceBetweenCoupled (4px)
            </Text>
            <Text style={{ fontSize: 13, color: '#0369A1' }}>
              <Text style={{ fontWeight: '600' }}>Repeating items:</Text> spaceBetweenRepeating (6-8px)
            </Text>
            <Text style={{ fontSize: 13, color: '#0369A1' }}>
              <Text style={{ fontWeight: '600' }}>Related content:</Text> spaceBetweenRelated (8-16px)
            </Text>
            <Text style={{ fontSize: 13, color: '#0369A1' }}>
              <Text style={{ fontWeight: '600' }}>Separated sections:</Text> spaceBetweenSeparated (24-32px)
            </Text>
          </View>
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
            <Text style={{ fontSize: 14 }}>• Use semantic tokens instead of hardcoded pixel values</Text>
            <Text style={{ fontSize: 14 }}>• Choose tokens based on relationship, not visual appearance</Text>
            <Text style={{ fontSize: 14 }}>• Use spaceAround for padding, spaceBetween for gaps/margins</Text>
            <Text style={{ fontSize: 14 }}>• Apply consistent spacing throughout your design</Text>
            <Text style={{ fontSize: 14 }}>• Use .number property to access numeric value in React Native</Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#DC2626' }}>
            ❌ Don't
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14 }}>• Don't use arbitrary pixel values (e.g., padding: 13)</Text>
            <Text style={{ fontSize: 14 }}>• Don't choose tokens based on size alone without considering relationship</Text>
            <Text style={{ fontSize: 14 }}>• Don't mix padding and margin for the same spacing concept</Text>
            <Text style={{ fontSize: 14 }}>• Don't use primitive tokens directly in components</Text>
            <Text style={{ fontSize: 14 }}>• Don't create inconsistent spacing patterns</Text>
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
              {`// Card with padding\n<View style={{\n  padding: dimensionSpaceAroundMd.number,\n  gap: dimensionSpaceBetweenRelatedMd.number\n}}>\n  {children}\n</View>`}
            </Text>
            <View style={{
              padding: tokens.dimensionSpaceAroundDefault.number,
              gap: tokens.dimensionSpaceBetweenRelatedMd.number,
              backgroundColor: '#fff',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#e1e1e1'
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>Card Title</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Card content with 16px padding</Text>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Icon + Text (coupled)\n<View style={{\n  flexDirection: 'row',\n  gap: dimensionSpaceBetweenCoupled.number\n}}>\n  <Icon />\n  <Text>Label</Text>\n</View>`}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.dimensionSpaceBetweenCoupled.number }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#2563eb' }} />
              <Text style={{ fontSize: 14 }}>Tightly coupled (4px gap)</Text>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Form fields (related)\n<View style={{\n  gap: dimensionSpaceBetweenRelatedSm.number\n}}>\n  <Input />\n  <Input />\n</View>`}
            </Text>
            <View style={{ gap: tokens.dimensionSpaceBetweenRelatedSm.number }}>
              <View style={{ padding: 12, backgroundColor: '#f1f1f1', borderRadius: 6 }}>
                <Text style={{ fontSize: 12 }}>Email field</Text>
              </View>
              <View style={{ padding: 12, backgroundColor: '#f1f1f1', borderRadius: 6 }}>
                <Text style={{ fontSize: 12 }}>Password field</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Primitives vs Semantics */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Primitives vs Semantics
        </Text>
        <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#F59E0B' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 8 }}>
            Why Semantic Over Primitive?
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • <Text style={{ fontWeight: '600' }}>Meaningful:</Text> spaceBetweenRelatedMd vs space200
            </Text>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • <Text style={{ fontWeight: '600' }}>Intent:</Text> Expresses relationship, not just size
            </Text>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • <Text style={{ fontWeight: '600' }}>Maintainable:</Text> Change once, update everywhere
            </Text>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • <Text style={{ fontWeight: '600' }}>Consistent:</Text> Same relationships = same spacing
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  ),
};

const SpaceAroundDemo = ({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
      {label} ({value}px)
    </Text>
    <View
      style={{
        backgroundColor: '#e5f3f8',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#376c89',
        borderStyle: 'dashed',
      }}
    >
      <View
        style={{
          padding: value,
          backgroundColor: '#fff',
          borderRadius: 6,
        }}
      >
        <View
          style={{
            backgroundColor: '#2563eb',
            height: 40,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>Content</Text>
        </View>
      </View>
    </View>
    <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{description}</Text>
  </View>
);

const SpaceBetweenDemo = ({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
      {label} ({value}px)
    </Text>
    <View style={{ flexDirection: 'row', gap: value }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 60,
            backgroundColor: '#2563eb',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>{i}</Text>
        </View>
      ))}
    </View>
    <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{description}</Text>
  </View>
);

export const SpaceAround: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Space Around</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Padding inside containers (blue border shows the padding area)
      </Text>

      <SpaceAroundDemo
        label="spaceAroundNudge2"
        value={tokens.dimensionSpaceAroundNudge2.number}
        description="Minimal padding (2px) for tight badges"
      />
      <SpaceAroundDemo
        label="spaceAroundNudge4"
        value={tokens.dimensionSpaceAroundNudge4.number}
        description="Extra small padding (4px)"
      />
      <SpaceAroundDemo
        label="spaceAroundNudge6"
        value={tokens.dimensionSpaceAroundNudge6.number}
        description="Very small padding (6px)"
      />
      <SpaceAroundDemo
        label="spaceAroundTight"
        value={tokens.dimensionSpaceAroundTight.number}
        description="Tight padding (8px) for compact buttons"
      />
      <SpaceAroundDemo
        label="spaceAroundCompact"
        value={tokens.dimensionSpaceAroundCompact.number}
        description="Compact padding (12px) for standard buttons/inputs"
      />
      <SpaceAroundDemo
        label="spaceAroundDefault"
        value={tokens.dimensionSpaceAroundDefault.number}
        description="Default padding (16px) for cards"
      />
      <SpaceAroundDemo
        label="spaceAroundDefaultPlus"
        value={tokens.dimensionSpaceAroundDefaultPlus.number}
        description="Default+ padding (20px) for larger containers"
      />
      <SpaceAroundDemo
        label="spaceAroundSpacious"
        value={tokens.dimensionSpaceAroundSpacious.number}
        description="Spacious padding (24px) for modals and sections"
      />
    </ScrollView>
  ),
};

export const SpaceBetween: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Space Between</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Gaps between elements (relationship-based)
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Tightly Coupled
        </Text>
        <SpaceBetweenDemo
          label="spaceBetweenCoupled"
          value={tokens.dimensionSpaceBetweenCoupled.number}
          description="Icon + text, label + value pairs"
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Repeating Elements
        </Text>
        <SpaceBetweenDemo
          label="spaceBetweenRepeatingSm"
          value={tokens.dimensionSpaceBetweenRepeatingSm.number}
          description="Pills, tags, badges in a row"
        />
        <SpaceBetweenDemo
          label="spaceBetweenRepeatingMd"
          value={tokens.dimensionSpaceBetweenRepeatingMd.number}
          description="Cards in a grid, standard list items"
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Related Content
        </Text>
        <SpaceBetweenDemo
          label="spaceBetweenRelatedSm"
          value={tokens.dimensionSpaceBetweenRelatedSm.number}
          description="Form fields in same section"
        />
        <SpaceBetweenDemo
          label="spaceBetweenRelatedMd"
          value={tokens.dimensionSpaceBetweenRelatedMd.number}
          description="Components in same feature area"
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Separated Sections
        </Text>
        <SpaceBetweenDemo
          label="spaceBetweenSeparatedSm"
          value={tokens.dimensionSpaceBetweenSeparatedSm.number}
          description="Different sections (small separation)"
        />
        <SpaceBetweenDemo
          label="spaceBetweenSeparatedMd"
          value={tokens.dimensionSpaceBetweenSeparatedMd.number}
          description="Major page sections (larger separation)"
        />
      </View>
    </ScrollView>
  ),
};

export const UsageExamples: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Usage Examples</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Real-world examples showing semantic spacing in context
      </Text>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Card (spaceAroundMd padding)
        </Text>
        <View
          style={{
            padding: tokens.dimensionSpaceAroundDefault.number,
            backgroundColor: '#fff',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e1e1e1',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Patient Details</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>
            Uses spaceAroundDefault (16px) for comfortable card padding
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Icon + Text (spaceBetweenCoupled)
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.dimensionSpaceBetweenCoupled.number }}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#2563eb',
            }}
          />
          <Text style={{ fontSize: 14 }}>Tightly coupled items use 4px gap</Text>
        </View>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Form Fields (spaceBetweenRelatedSm)
        </Text>
        <View style={{ gap: tokens.dimensionSpaceBetweenRelatedSm.number }}>
          <View
            style={{
              padding: tokens.dimensionSpaceAroundCompact.number,
              backgroundColor: '#f1f1f1',
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 14 }}>Email field</Text>
          </View>
          <View
            style={{
              padding: tokens.dimensionSpaceAroundCompact.number,
              backgroundColor: '#f1f1f1',
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 14 }}>Password field</Text>
          </View>
          <View
            style={{
              padding: tokens.dimensionSpaceAroundCompact.number,
              backgroundColor: '#f1f1f1',
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 14 }}>Confirm password field</Text>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Tags/Pills (spaceBetweenRepeatingSm)
        </Text>
        <View style={{ flexDirection: 'row', gap: tokens.dimensionSpaceBetweenRepeatingSm.number, flexWrap: 'wrap' }}>
          {['Urgent', 'Follow-up', 'Lab Results'].map((tag, i) => (
            <View
              key={i}
              style={{
                paddingHorizontal: tokens.dimensionSpaceAroundNudge6.number,
                paddingVertical: tokens.dimensionSpaceAroundNudge2.number,
                backgroundColor: '#dbeafe',
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1e40af' }}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Page Sections (spaceBetweenSeparatedMd)
        </Text>
        <View style={{ gap: tokens.dimensionSpaceBetweenSeparatedMd.number }}>
          <View
            style={{
              padding: tokens.dimensionSpaceAroundDefault.number,
              backgroundColor: '#e5f3f8',
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Section 1: Appointments</Text>
          </View>
          <View
            style={{
              padding: tokens.dimensionSpaceAroundDefault.number,
              backgroundColor: '#e3f5eb',
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600' }}>Section 2: Medical Records</Text>
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
          Semantic Spacing Guidelines
        </Text>
        <Text style={{ fontSize: 14, color: '#1e40af', lineHeight: 20 }}>
          • Think in relationships, not pixels{'\n'}
          • Tightly coupled: 4px (icon + text){'\n'}
          • Repeating items: 6-8px (tags, cards){'\n'}
          • Related content: 8-16px (form fields, components){'\n'}
          • Separated sections: 24-32px (page sections){'\n'}
          • Space around: Use for padding (inside containers){'\n'}
          • Space between: Use for gaps/margins (between elements){'\n'}
          • Consistent spacing creates better visual rhythm
        </Text>
      </View>
    </ScrollView>
  ),
};

export const ComparisonWithPrimitives: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Primitives vs. Semantics
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Understanding the difference between raw values and contextual usage
      </Text>

      <View
        style={{
          padding: 16,
          backgroundColor: '#f8f9fa',
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Primitive Tokens (Raw Numbers)
        </Text>
        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#333', marginBottom: 4 }}>
          dimensionSpace100 = 8px
        </Text>
        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#333', marginBottom: 4 }}>
          dimensionSpace200 = 16px
        </Text>
        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#333', marginBottom: 8 }}>
          dimensionSpace300 = 24px
        </Text>
        <Text style={{ fontSize: 11, color: '#666', fontStyle: 'italic' }}>
          These are the raw spacing values in the 8px grid system
        </Text>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: '#e5f3f8',
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Semantic Tokens (Contextual Usage)
        </Text>
        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#1b3644', marginBottom: 4 }}>
          dimensionSpaceAroundMd = 16px (card padding)
        </Text>
        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#1b3644', marginBottom: 4 }}>
          dimensionSpaceBetweenCoupled = 4px (icon + text)
        </Text>
        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#1b3644', marginBottom: 8 }}>
          dimensionSpaceBetweenSeparatedSm = 24px (sections)
        </Text>
        <Text style={{ fontSize: 11, color: '#234658', fontStyle: 'italic' }}>
          These reference primitives but add contextual meaning
        </Text>
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
          Which Should You Use?
        </Text>
        <Text style={{ fontSize: 14, color: '#856404', lineHeight: 20 }}>
          ✅ **Prefer semantic tokens** when they exist{'\n'}
          • They express intent and relationship{'\n'}
          • They make code more maintainable{'\n'}
          • Example: \`spaceBetweenRelatedMd\` over \`space200\`{'\n\n'}
          ⚠️ **Use primitives** only when:{'\n'}
          • No semantic token fits your use case{'\n'}
          • You need a one-off spacing value{'\n'}
          • You're creating new semantic tokens
        </Text>
      </View>
    </ScrollView>
  ),
};
