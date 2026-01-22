/**
 * Typography Primitives - React Native
 * Primitive typography tokens for text styles
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as tokens from '../../../src/design-system/tokens/build/react-native/tokens';

const meta: Meta = {
  title: 'Design System/Primitives/Typography',
  parameters: {
    docs: {
      description: {
        component: `
# Typography Primitive Tokens

Raw typography values that serve as the building blocks for text styles in the design system.

## What are Typography Primitives?

Typography primitives are the lowest-level tokens for text styling. They represent individual font properties:
- **Font Families** - The typefaces used in the design system
- **Font Sizes** - Granular text size values from 8px to 160px
- **Line Heights** - Vertical rhythm and spacing between lines
- **Font Weights** - Regular, medium, semi-bold, and bold
- **Letter Spacing** - Horizontal spacing between characters

## Why Primitives?

By breaking typography into primitive tokens, we can:
- Mix and match properties to create semantic text styles
- Reference specific values consistently across the system
- Build semantic typography tokens (like text styles) from primitives

**Important**: In most cases, use semantic text style tokens instead of primitives. Only use primitives when creating new semantic text styles.

## Font Family Primitives

The typefaces used throughout the design system.

| Token | Value | Use Case |
|-------|-------|----------|
| \`fontGlobalSans\` | Inter | Primary sans-serif for UI and body text |
| \`fontGlobalSansAlt\` | TT Norms Pro | Alternative sans-serif |
| \`fontGlobalMono\` | Atlas Typewriter | Monospace for code |
| \`fontGlobalSansExpressive\` | Campton | Expressive sans-serif |

## Font Size Primitives

Granular font sizes from 8 to 160.

| Token | Value | Common Usage |
|-------|-------|--------------|
| \`fontSize100\` | 8 | Micro text |
| \`fontSize150\` | 10 | Tiny text |
| \`fontSize200\` | 12 | Small text |
| \`fontSize250\` | 14 | Default body |
| \`fontSize300\` | 16 | Medium body |
| \`fontSize325\` | 18 | Large body |
| \`fontSize350\` | 20 | Small headings |
| \`fontSize400\` | 24 | H4 headings |
| \`fontSize450\` | 28 | H3 headings |
| \`fontSize500\` | 32 | H2 headings |
| \`fontSize550\` | 40 | H1 headings |
| \`fontSize600\` | 48 | Large H1 |
| \`fontSize650\` | 56 | Display |
| \`fontSize700\` | 64 | Hero text |

## Font Weight Primitives

| Token | Value | Name | Use Case |
|-------|-------|------|----------|
| \`fontWeight400\` | 400 | Regular | Body text |
| \`fontWeight500\` | 500 | Medium | Emphasized text |
| \`fontWeight600\` | 600 | Semi-Bold | Subheadings |
| \`fontWeight700\` | 700 | Bold | Headings |

## Letter Spacing Primitives

| Token | Value | Use Case |
|-------|-------|----------|
| \`fontLetterSpacing100\` | -2 | Very tight |
| \`fontLetterSpacing200\` | -1 | Tight |
| \`fontLetterSpacing300\` | -0.5 | Slightly tight |
| \`fontLetterSpacing400\` | 0 | Normal |
| \`fontLetterSpacing500\` | 0.5 | Slightly loose |
| \`fontLetterSpacing600\` | 1 | Loose |
| \`fontLetterSpacing700\` | 2 | Very loose |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const FontFamilies: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Font Family Primitives
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        The typefaces used throughout the design system
      </Text>

      <View style={{ gap: 16 }}>
        <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#666', marginBottom: 8 }}>
            fontGlobalSans
          </Text>
          <Text
            style={{ fontSize: 20, color: '#000', fontFamily: tokens.fontGlobalSans, marginBottom: 8 }}
          >
            Inter - Primary sans-serif for UI
          </Text>
          <Text
            style={{ fontSize: 14, color: '#666', fontFamily: tokens.fontGlobalSans }}
          >
            The quick brown fox jumps over the lazy dog. 0123456789
          </Text>
        </View>

        <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#666', marginBottom: 8 }}>
            fontGlobalSansAlt
          </Text>
          <Text
            style={{ fontSize: 20, color: '#000', fontFamily: tokens.fontGlobalSansAlt, marginBottom: 8 }}
          >
            TT Norms Pro - Alternative sans-serif
          </Text>
          <Text
            style={{ fontSize: 14, color: '#666', fontFamily: tokens.fontGlobalSansAlt }}
          >
            The quick brown fox jumps over the lazy dog. 0123456789
          </Text>
        </View>

        <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#666', marginBottom: 8 }}>
            fontGlobalMono
          </Text>
          <Text
            style={{ fontSize: 20, color: '#000', fontFamily: tokens.fontGlobalMono, marginBottom: 8 }}
          >
            Atlas Typewriter - Monospace
          </Text>
          <Text
            style={{ fontSize: 14, color: '#666', fontFamily: tokens.fontGlobalMono }}
          >
            The quick brown fox jumps over the lazy dog. 0123456789
          </Text>
        </View>

        <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#666', marginBottom: 8 }}>
            fontGlobalSansExpressive
          </Text>
          <Text
            style={{ fontSize: 20, color: '#000', fontFamily: tokens.fontGlobalSansExpressive, marginBottom: 8 }}
          >
            Campton - Expressive sans-serif
          </Text>
          <Text
            style={{ fontSize: 14, color: '#666', fontFamily: tokens.fontGlobalSansExpressive }}
          >
            The quick brown fox jumps over the lazy dog. 0123456789
          </Text>
        </View>
      </View>
    </ScrollView>
  ),
};

export const FontSizes: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Font Size Scale
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Complete scale from 8px to 64px
      </Text>

      <View style={{ gap: 12 }}>
        {[
          { token: 'fontSize100', value: tokens.fontSize100.number, label: 'Micro' },
          { token: 'fontSize150', value: tokens.fontSize150.number, label: 'Tiny' },
          { token: 'fontSize200', value: tokens.fontSize200.number, label: 'Small' },
          { token: 'fontSize250', value: tokens.fontSize250.number, label: 'Default' },
          { token: 'fontSize300', value: tokens.fontSize300.number, label: 'Medium' },
          { token: 'fontSize325', value: tokens.fontSize325.number, label: 'Large Body' },
          { token: 'fontSize350', value: tokens.fontSize350.number, label: 'Small Heading' },
          { token: 'fontSize400', value: tokens.fontSize400.number, label: 'H4' },
          { token: 'fontSize450', value: tokens.fontSize450.number, label: 'H3' },
          { token: 'fontSize500', value: tokens.fontSize500.number, label: 'H2' },
          { token: 'fontSize550', value: tokens.fontSize550.number, label: 'H1' },
          { token: 'fontSize600', value: tokens.fontSize600.number, label: 'Large H1' },
          { token: 'fontSize650', value: tokens.fontSize650.number, label: 'Display' },
          { token: 'fontSize700', value: tokens.fontSize700.number, label: 'Hero' },
        ].map(({ token, value, label }) => (
          <View
            key={token}
            style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
              <View style={{ width: 100 }}>
                <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#666' }}>
                  {token}
                </Text>
                <Text style={{ fontSize: 9, color: '#999' }}>
                  {value}px • {label}
                </Text>
              </View>
              <Text style={{ fontSize: value, color: '#000' }}>Sample</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Font Weight Primitives
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Available font weights for emphasis and hierarchy
      </Text>

      <View style={{ gap: 16 }}>
        {[
          { token: 'fontWeight400', value: String(tokens.fontWeight400), name: 'Regular', use: 'Body text' },
          { token: 'fontWeight500', value: String(tokens.fontWeight500), name: 'Medium', use: 'Emphasized text' },
          { token: 'fontWeight600', value: String(tokens.fontWeight600), name: 'Semi-Bold', use: 'Subheadings' },
          { token: 'fontWeight700', value: String(tokens.fontWeight700), name: 'Bold', use: 'Headings' },
        ].map(({ token, value, name, use }) => (
          <View key={token} style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#666' }}>
                {token}
              </Text>
              <Text style={{ fontSize: 10, color: '#999' }}>
                {value} • {name}
              </Text>
            </View>
            <Text
              style={{ fontSize: 20, color: '#000', fontWeight: value as any, marginBottom: 4 }}
            >
              The quick brown fox jumps over the lazy dog
            </Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{use}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  ),
};

export const LetterSpacing: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Letter Spacing (Tracking)
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Horizontal spacing between characters for optical refinement
      </Text>

      <View style={{ gap: 16 }}>
        {[
          { token: 'letterSpacing100', value: tokens.fontLetterSpacing100.number, label: 'Very Tight', use: 'Large display text' },
          { token: 'letterSpacing200', value: tokens.fontLetterSpacing200.number, label: 'Tight', use: 'Headlines' },
          { token: 'letterSpacing300', value: tokens.fontLetterSpacing300.number, label: 'Slightly Tight', use: 'Subheadings' },
          { token: 'letterSpacing400', value: tokens.fontLetterSpacing400.number, label: 'Normal', use: 'Default body text' },
          { token: 'letterSpacing500', value: tokens.fontLetterSpacing500.number, label: 'Slightly Loose', use: 'Small text' },
          { token: 'letterSpacing600', value: tokens.fontLetterSpacing600.number, label: 'Loose', use: 'Uppercase labels' },
          { token: 'letterSpacing700', value: tokens.fontLetterSpacing700.number, label: 'Very Loose', use: 'All-caps headings' },
        ].map(({ token, value, label, use }) => (
          <View key={token} style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#666' }}>
                {token}
              </Text>
              <Text style={{ fontSize: 10, color: '#999' }}>
                {value}px • {label}
              </Text>
            </View>
            <Text
              style={{ fontSize: 18, color: '#000', letterSpacing: value, marginBottom: 4 }}
            >
              The quick brown fox jumps over the lazy dog
            </Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{use}</Text>
          </View>
        ))}
      </View>

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: '#dbeafe',
          borderLeftWidth: 4,
          borderLeftColor: '#2563eb',
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e40af', marginBottom: 8 }}>
          Letter Spacing Guidelines
        </Text>
        <Text style={{ fontSize: 14, color: '#1e40af', lineHeight: 20 }}>
          • Negative letter spacing (tight) works well for large headings{'\n'}
          • Positive letter spacing (loose) improves readability of small text{'\n'}
          • Uppercase text benefits from increased letter spacing{'\n'}
          • Body text typically uses normal (0px) letter spacing{'\n'}
          • Optical refinement - adjust to taste within these ranges
        </Text>
      </View>
    </ScrollView>
  ),
};

export const LineHeights: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Line Height Scale
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Vertical rhythm and spacing between lines of text
      </Text>

      <View style={{ gap: 16 }}>
        {[
          { token: 'lineHeight350', value: tokens.fontLineHeight350.number, fontSize: 12, label: 'Small Text' },
          { token: 'lineHeight400', value: tokens.fontLineHeight400.number, fontSize: 14, label: 'Body Text' },
          { token: 'lineHeight450', value: tokens.fontLineHeight450.number, fontSize: 16, label: 'Medium Text' },
          { token: 'lineHeight500', value: tokens.fontLineHeight500.number, fontSize: 18, label: 'Large Body' },
          { token: 'lineHeight550', value: tokens.fontLineHeight550.number, fontSize: 24, label: 'Small Heading' },
          { token: 'lineHeight600', value: tokens.fontLineHeight600.number, fontSize: 28, label: 'Medium Heading' },
        ].map(({ token, value, fontSize, label }) => (
          <View key={token} style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#666' }}>
                {token}
              </Text>
              <Text style={{ fontSize: 10, color: '#999' }}>
                {value}px • {label}
              </Text>
            </View>
            <Text
              style={{ fontSize, lineHeight: value, color: '#000' }}
            >
              Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing.
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: '#dbeafe',
          borderLeftWidth: 4,
          borderLeftColor: '#2563eb',
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e40af', marginBottom: 8 }}>
          Line Height Best Practices
        </Text>
        <Text style={{ fontSize: 14, color: '#1e40af', lineHeight: 20 }}>
          • Body text typically uses 1.5x to 1.75x the font size{'\n'}
          • Headings use tighter line height (1.2x to 1.3x){'\n'}
          • Longer line lengths need more generous line height{'\n'}
          • Short line lengths can use tighter line height{'\n'}
          • Good vertical rhythm improves reading experience
        </Text>
      </View>
    </ScrollView>
  ),
};

export const ComposingTextStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Composing Text Styles from Primitives
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Examples showing how primitive typography tokens combine to create semantic text styles
      </Text>

      <View style={{ gap: 16 }}>
        <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Body Text Style
          </Text>
          <View style={{ padding: 12, backgroundColor: '#f9fafb', borderRadius: 4, marginBottom: 12 }}>
            <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#666', lineHeight: 16 }}>
              fontFamily: fontGlobalSans{'\n'}
              fontSize: fontSize250 (14){'\n'}
              lineHeight: fontLineHeight400 (24){'\n'}
              fontWeight: fontWeight400 (Regular){'\n'}
              letterSpacing: fontLetterSpacing400 (0)
            </Text>
          </View>
          <Text
            style={{
              fontFamily: tokens.fontGlobalSans,
              fontSize: tokens.fontSize250.number,
              lineHeight: tokens.fontLineHeight400.number,
              fontWeight: String(tokens.fontWeight400) as any,
              letterSpacing: tokens.fontLetterSpacing400.number,
              color: '#000',
            }}
          >
            This is body text using primitive tokens combined to create a readable, comfortable text style for paragraphs and general content. The line height provides good vertical rhythm.
          </Text>
        </View>

        <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Heading Style (H2)
          </Text>
          <View style={{ padding: 12, backgroundColor: '#f9fafb', borderRadius: 4, marginBottom: 12 }}>
            <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#666', lineHeight: 16 }}>
              fontFamily: fontGlobalSans{'\n'}
              fontSize: fontSize500 (32){'\n'}
              lineHeight: fontLineHeight650 (56){'\n'}
              fontWeight: fontWeight700 (Bold){'\n'}
              letterSpacing: fontLetterSpacing300 (-0.5)
            </Text>
          </View>
          <Text
            style={{
              fontFamily: tokens.fontGlobalSans,
              fontSize: tokens.fontSize500.number,
              lineHeight: tokens.fontLineHeight650.number,
              fontWeight: String(tokens.fontWeight700) as any,
              letterSpacing: tokens.fontLetterSpacing300.number,
              color: '#000',
            }}
          >
            This is a Heading
          </Text>
        </View>

        <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Small Caps Label Style
          </Text>
          <View style={{ padding: 12, backgroundColor: '#f9fafb', borderRadius: 4, marginBottom: 12 }}>
            <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#666', lineHeight: 16 }}>
              fontFamily: fontGlobalSans{'\n'}
              fontSize: fontSize200 (12){'\n'}
              lineHeight: fontLineHeight300 (16){'\n'}
              fontWeight: fontWeight600 (Semi-Bold){'\n'}
              letterSpacing: fontLetterSpacing600 (1){'\n'}
              textTransform: uppercase
            </Text>
          </View>
          <Text
            style={{
              fontFamily: tokens.fontGlobalSans,
              fontSize: tokens.fontSize200.number,
              lineHeight: tokens.fontLineHeight300.number,
              fontWeight: String(tokens.fontWeight600) as any,
              letterSpacing: tokens.fontLetterSpacing600.number,
              color: '#666',
              textTransform: 'uppercase',
            }}
          >
            Category Label
          </Text>
        </View>

        <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Code/Monospace Style
          </Text>
          <View style={{ padding: 12, backgroundColor: '#f9fafb', borderRadius: 4, marginBottom: 12 }}>
            <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#666', lineHeight: 16 }}>
              fontFamily: fontGlobalMono{'\n'}
              fontSize: fontSize200 (12){'\n'}
              lineHeight: fontLineHeight350 (20){'\n'}
              fontWeight: fontWeight400 (Regular){'\n'}
              letterSpacing: fontLetterSpacing400 (0)
            </Text>
          </View>
          <View style={{ backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' }}>
            <Text
              style={{
                fontFamily: tokens.fontGlobalMono,
                fontSize: tokens.fontSize200.number,
                lineHeight: tokens.fontLineHeight350.number,
                fontWeight: String(tokens.fontWeight400) as any,
                letterSpacing: tokens.fontLetterSpacing400.number,
                color: '#1e40af',
              }}
            >
              const message = "Hello World";
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: '#dbeafe',
          borderLeftWidth: 4,
          borderLeftColor: '#2563eb',
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e40af', marginBottom: 8 }}>
          Typography Token Architecture
        </Text>
        <Text style={{ fontSize: 14, color: '#1e40af', lineHeight: 20 }}>
          These examples show raw primitive combinations. In production, these would be wrapped in semantic tokens.
        </Text>
      </View>
    </ScrollView>
  ),
};
