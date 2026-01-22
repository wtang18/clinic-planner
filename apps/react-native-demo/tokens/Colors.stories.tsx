/**
 * Semantic Colors - React Native
 * Purpose-driven color tokens for consistent UI design
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as tokens from '../../../src/design-system/tokens/build/react-native/tokens';

const meta: Meta = {
  title: 'Design System/Semantics/Colors',
  parameters: {
    docs: {
      description: {
        component: `
# Semantic Color Tokens

Purpose-driven color tokens for consistent, accessible UI design. These semantic tokens reference primitive colors and provide clear meaning through their naming.

## What are Semantic Colors?

Semantic color tokens abstract away raw color values and replace them with purpose-driven names that describe **what** the color is for, not **what** it looks like.

**Benefits**:
- **Meaningful names**: \`colorBgAlertSubtle\` is clearer than \`saturatedRed50\`
- **Themeability**: Change the entire color scheme by swapping primitive references
- **Consistency**: Colors with the same purpose look the same everywhere
- **Accessibility**: Semantic pairings (bg + fg) ensure sufficient contrast

## Semantic Color Categories

- **Neutral**: Base UI elements, text, backgrounds, borders
- **Alert**: Errors, destructive actions, critical warnings
- **Attention**: Warnings, cautions, important notices
- **Positive**: Success, confirmations, positive outcomes
- **Information**: Informational messages, links, helpful tips
- **Accent**: Special highlights, premium features, branding
- **Transparent**: Overlays, modals, glass effects

## Usage

Always pair background and foreground colors from the same semantic category for proper contrast.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Complete documentation for semantic color tokens
 */
export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        Semantic Color System
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Purpose-driven color tokens for consistent, accessible UI design with built-in semantic meaning.
      </Text>

      {/* Quick Reference */}
      <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Categories:</Text> 7 (Neutral, Alert, Positive, Information, Attention, Accent, Transparent)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Backgrounds:</Text> 60+ semantic background tokens</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Foregrounds:</Text> 40+ semantic foreground/text tokens</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Accessibility:</Text> WCAG AA contrast compliant pairings</Text>
        </View>
      </View>

      {/* Features */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Features
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Purpose-driven naming (what it's for, not what it looks like)</Text>
          <Text style={{ fontSize: 14 }}>✅ Built-in semantic categories for different UI states</Text>
          <Text style={{ fontSize: 14 }}>✅ Guaranteed WCAG AA contrast ratios for paired bg/fg colors</Text>
          <Text style={{ fontSize: 14 }}>✅ Themeability through primitive token references</Text>
          <Text style={{ fontSize: 14 }}>✅ Consistent naming convention across all platforms</Text>
        </View>
      </View>

      {/* Color Categories */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Semantic Categories
        </Text>

        <View style={{ gap: 16 }}>
          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Neutral</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Base UI elements, text, backgrounds, borders. Use for general interface components.
            </Text>
          </View>

          <View style={{ padding: 12, backgroundColor: '#FEE2E2', borderRadius: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Alert</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Errors, destructive actions, critical warnings. Use for dangerous or error states.
            </Text>
          </View>

          <View style={{ padding: 12, backgroundColor: '#D1FAE5', borderRadius: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Positive</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Success states, confirmations, positive outcomes. Use for successful operations.
            </Text>
          </View>

          <View style={{ padding: 12, backgroundColor: '#DBEAFE', borderRadius: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Information</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Informational messages, links, helpful tips. Use for neutral information.
            </Text>
          </View>

          <View style={{ padding: 12, backgroundColor: '#FEF3C7', borderRadius: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Attention</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Warnings, cautions, important notices. Use for alerts that need attention.
            </Text>
          </View>

          <View style={{ padding: 12, backgroundColor: '#F3E8FF', borderRadius: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Accent</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Special highlights, premium features, branding. Use for differentiation.
            </Text>
          </View>

          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6 }}>Transparent</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Overlays, modals, glass effects. Use for layered UI elements.
            </Text>
          </View>
        </View>
      </View>

      {/* Intensity Scale */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Intensity Scale
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          Each category has multiple intensity levels for different use cases:
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>Subtle:</Text> Lightest background, minimal emphasis</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>Low:</Text> Light background, gentle emphasis</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>Medium:</Text> Moderate background, clear visibility</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>High:</Text> Strong background, maximum emphasis</Text>
          <Text style={{ fontSize: 14 }}>• <Text style={{ fontWeight: '600' }}>-Accented:</Text> Variant with slightly different hue</Text>
        </View>
      </View>

      {/* Naming Convention */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Naming Convention
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
            color + [Bg|Fg] + Category + Intensity
          </Text>
          <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#059669' }}>
            colorBgAlertHigh
          </Text>
          <Text style={{ fontSize: 11, color: '#666', marginTop: 6 }}>
            "Alert" category background with "High" intensity
          </Text>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Bg:</Text> Background colors (for containers, surfaces)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Fg:</Text> Foreground colors (for text, icons)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Category:</Text> Neutral, Alert, Positive, Information, etc.</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Intensity:</Text> Subtle, Low, Medium, High, etc.</Text>
        </View>
      </View>

      {/* Accessibility */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Accessibility
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          All semantic color pairings meet WCAG 2.1 Level AA requirements:
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Text contrast: minimum 4.5:1 ratio for normal text</Text>
          <Text style={{ fontSize: 14 }}>✅ Large text contrast: minimum 3:1 ratio for large text (18pt+)</Text>
          <Text style={{ fontSize: 14 }}>✅ Interactive elements: minimum 3:1 ratio against adjacent colors</Text>
          <Text style={{ fontSize: 14 }}>✅ Pre-paired combinations ensure accessible text on backgrounds</Text>
          <Text style={{ fontSize: 14 }}>✅ Inverse colors for dark mode/high contrast scenarios</Text>
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
            <Text style={{ fontSize: 14 }}>• Always pair background and foreground from the same category</Text>
            <Text style={{ fontSize: 14 }}>• Use semantic tokens over primitive colors in application code</Text>
            <Text style={{ fontSize: 14 }}>• Choose category based on semantic meaning, not visual preference</Text>
            <Text style={{ fontSize: 14 }}>• Use "inverse" tokens for text on dark backgrounds</Text>
            <Text style={{ fontSize: 14 }}>• Refer to primitives only when creating new semantic tokens</Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#DC2626' }}>
            ❌ Don't
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14 }}>• Don't use Alert colors for positive actions or vice versa</Text>
            <Text style={{ fontSize: 14 }}>• Don't mix foreground and background from different categories</Text>
            <Text style={{ fontSize: 14 }}>• Don't override semantic tokens with hardcoded hex values</Text>
            <Text style={{ fontSize: 14 }}>• Don't use primitive tokens directly in components</Text>
            <Text style={{ fontSize: 14 }}>• Don't create your own color values outside the token system</Text>
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
              {`// Error message banner\n<View style={{\n  backgroundColor: colorBgAlertSubtle,\n  borderColor: colorBgAlertHigh,\n  padding: 16\n}}>\n  <Text style={{ color: colorFgAlertPrimary }}>\n    Error message\n  </Text>\n</View>`}
            </Text>
            <View style={{ backgroundColor: tokens.colorBgAlertSubtle, borderWidth: 2, borderColor: tokens.colorBgAlertHigh, padding: 12, borderRadius: 6 }}>
              <Text style={{ color: tokens.colorFgAlertPrimary, fontSize: 14 }}>
                Error: Unable to save changes
              </Text>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Success notification\n<View style={{\n  backgroundColor: colorBgPositiveSubtle,\n  padding: 16\n}}>\n  <Text style={{ color: colorFgPositivePrimary }}>\n    Success message\n  </Text>\n</View>`}
            </Text>
            <View style={{ backgroundColor: tokens.colorBgPositiveSubtle, padding: 12, borderRadius: 6 }}>
              <Text style={{ color: tokens.colorFgPositivePrimary, fontSize: 14 }}>
                ✓ Changes saved successfully
              </Text>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`// Information callout\n<View style={{\n  backgroundColor: colorBgInformationLow,\n  padding: 16\n}}>\n  <Text style={{ color: colorFgInformationPrimary }}>\n    Info message\n  </Text>\n</View>`}
            </Text>
            <View style={{ backgroundColor: tokens.colorBgInformationLow, padding: 12, borderRadius: 6 }}>
              <Text style={{ color: tokens.colorFgInformationPrimary, fontSize: 14 }}>
                ℹ New features available in this release
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Semantics vs Primitives */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Semantics vs Primitives
        </Text>
        <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#F59E0B' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 8 }}>
            Why Semantic Over Primitive?
          </Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • <Text style={{ fontWeight: '600' }}>Meaningful:</Text> colorBgAlertSubtle vs saturatedRed50
            </Text>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • <Text style={{ fontWeight: '600' }}>Themeable:</Text> Change all alert colors by updating one primitive reference
            </Text>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • <Text style={{ fontWeight: '600' }}>Consistent:</Text> All errors look the same across the app
            </Text>
            <Text style={{ fontSize: 13, color: '#92400E' }}>
              • <Text style={{ fontWeight: '600' }}>Accessible:</Text> Guaranteed contrast ratios for paired tokens
            </Text>
          </View>
        </View>
      </View>

      {/* React Native vs Web Color Architecture */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          React Native Light/Dark Mode Support
        </Text>
        <View style={{ backgroundColor: '#D1FAE5', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#059669' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#065F46', marginBottom: 8 }}>
            ✨ New: Automatic Theme System
          </Text>
          <Text style={{ fontSize: 13, color: '#065F46', marginBottom: 8 }}>
            React Native now has automatic light/dark mode support via the ThemeProvider! Just like the web design system, components use the same semantic token names (e.g., theme.colorBgNeutralBase) and values automatically change based on the current theme mode.
          </Text>
          <View style={{ gap: 6, marginTop: 8 }}>
            <Text style={{ fontSize: 13, color: '#065F46' }}>
              • <Text style={{ fontWeight: '600' }}>Same token names:</Text> colorBgNeutralBase works in both light and dark modes
            </Text>
            <Text style={{ fontSize: 13, color: '#065F46' }}>
              • <Text style={{ fontWeight: '600' }}>Automatic switching:</Text> Uses useColorScheme() to detect system theme
            </Text>
            <Text style={{ fontSize: 13, color: '#065F46' }}>
              • <Text style={{ fontWeight: '600' }}>No conditional logic:</Text> Components never check theme mode manually
            </Text>
            <Text style={{ fontSize: 13, color: '#065F46' }}>
              • <Text style={{ fontWeight: '600' }}>Context-based:</Text> ThemeProvider supplies tokens via React Context
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: '#065F46', marginTop: 8, fontStyle: 'italic' }}>
            See the "Theme Demo" story for examples and documentation, or check ./theme/ThemeProvider.tsx for implementation details.
          </Text>
        </View>

        {/* Web vs RN Comparison */}
        <View style={{ backgroundColor: '#DBEAFE', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#2563EB', marginTop: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E40AF', marginBottom: 8 }}>
            Web vs React Native Implementation
          </Text>
          <Text style={{ fontSize: 13, color: '#1E40AF', marginBottom: 8 }}>
            Both platforms follow the same principle: same semantic token names, different values per theme mode.
          </Text>
          <View style={{ gap: 6, marginTop: 8 }}>
            <Text style={{ fontSize: 13, color: '#1E40AF' }}>
              <Text style={{ fontWeight: '600' }}>Web:</Text> CSS custom properties + [data-theme="dark"] selector
            </Text>
            <Text style={{ fontSize: 13, color: '#1E40AF' }}>
              <Text style={{ fontWeight: '600' }}>React Native:</Text> Context Provider + useColorScheme() hook
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: '#1E40AF', marginTop: 8 }}>
            Both approaches ensure components use consistent token names across platforms while adapting to light/dark modes automatically.
          </Text>
        </View>
      </View>
    </ScrollView>
  ),
};

const SemanticSwatch = ({
  label,
  bgColor,
  fgColor,
}: {
  label: string;
  bgColor: string;
  fgColor: string;
}) => (
  <View style={{ flex: 1, marginBottom: 12 }}>
    <View
      style={{
        width: '100%',
        height: 48,
        backgroundColor: bgColor,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e1e1e1',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
      }}
    >
      <Text style={{ color: fgColor, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
    <Text style={{ fontSize: 10, color: '#666', textAlign: 'center' }}>{label}</Text>
  </View>
);

export const SemanticNeutral: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Neutral Backgrounds
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        For general UI elements and containers
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <SemanticSwatch label="base" bgColor={tokens.colorBgNeutralBase} fgColor={tokens.colorFgNeutralPrimary} />
        <SemanticSwatch label="min" bgColor={tokens.colorBgNeutralMin} fgColor={tokens.colorFgNeutralPrimary} />
        <SemanticSwatch label="subtle" bgColor={tokens.colorBgNeutralSubtle} fgColor={tokens.colorFgNeutralPrimary} />
        <SemanticSwatch label="low" bgColor={tokens.colorBgNeutralLow} fgColor={tokens.colorFgNeutralPrimary} />
        <SemanticSwatch label="low-accented" bgColor={tokens.colorBgNeutralLowAccented} fgColor={tokens.colorFgNeutralPrimary} />
        <SemanticSwatch label="medium" bgColor={tokens.colorBgNeutralMedium} fgColor={tokens.colorFgNeutralPrimary} />
        <SemanticSwatch label="inverse-base" bgColor={tokens.colorBgNeutralInverseBase} fgColor={tokens.colorFgNeutralInversePrimary} />
        <SemanticSwatch label="inverse-low" bgColor={tokens.colorBgNeutralInverseLow} fgColor={tokens.colorFgNeutralInversePrimary} />
      </View>
    </ScrollView>
  ),
};

export const SemanticAlert: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Alert Backgrounds
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        For errors and destructive actions
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <SemanticSwatch label="subtle" bgColor={tokens.colorBgAlertSubtle} fgColor={tokens.colorFgAlertPrimary} />
        <SemanticSwatch label="low" bgColor={tokens.colorBgAlertLow} fgColor={tokens.colorFgAlertPrimary} />
        <SemanticSwatch label="low-accented" bgColor={tokens.colorBgAlertLowAccented} fgColor={tokens.colorFgAlertPrimary} />
        <SemanticSwatch label="medium" bgColor={tokens.colorBgAlertMedium} fgColor={tokens.colorFgAlertPrimary} />
        <SemanticSwatch label="high" bgColor={tokens.colorBgAlertHigh} fgColor={tokens.colorFgAlertInversePrimary} />
        <SemanticSwatch label="high-accented" bgColor={tokens.colorBgAlertHighAccented} fgColor={tokens.colorFgAlertInversePrimary} />
      </View>

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: tokens.colorBgAlertSubtle,
          borderLeftWidth: 4,
          borderLeftColor: tokens.colorBgAlertHigh,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: tokens.colorFgAlertPrimary, marginBottom: 4 }}>
          Error
        </Text>
        <Text style={{ fontSize: 14, color: tokens.colorFgAlertSecondary }}>
          Something went wrong. Please try again.
        </Text>
      </View>
    </ScrollView>
  ),
};

export const SemanticPositive: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Positive Backgrounds
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        For success states and confirmations
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <SemanticSwatch label="subtle" bgColor={tokens.colorBgPositiveSubtle} fgColor={tokens.colorFgPositivePrimary} />
        <SemanticSwatch label="low" bgColor={tokens.colorBgPositiveLow} fgColor={tokens.colorFgPositivePrimary} />
        <SemanticSwatch label="low-accented" bgColor={tokens.colorBgPositiveLowAccented} fgColor={tokens.colorFgPositivePrimary} />
        <SemanticSwatch label="medium" bgColor={tokens.colorBgPositiveMedium} fgColor={tokens.colorFgPositivePrimary} />
        <SemanticSwatch label="strong" bgColor={tokens.colorBgPositiveStrong} fgColor={tokens.colorFgPositivePrimary} />
        <SemanticSwatch label="high" bgColor={tokens.colorBgPositiveHigh} fgColor={tokens.colorFgPositiveInversePrimary} />
        <SemanticSwatch label="high-accented" bgColor={tokens.colorBgPositiveHighAccented} fgColor={tokens.colorFgPositiveInversePrimary} />
      </View>

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: tokens.colorBgPositiveSubtle,
          borderLeftWidth: 4,
          borderLeftColor: tokens.colorBgPositiveHigh,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: tokens.colorFgPositivePrimary, marginBottom: 4 }}>
          Success
        </Text>
        <Text style={{ fontSize: 14, color: tokens.colorFgPositiveSecondary }}>
          Your changes have been saved.
        </Text>
      </View>
    </ScrollView>
  ),
};

export const SemanticInformation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Information Backgrounds
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        For informational messages and links
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <SemanticSwatch label="subtle" bgColor={tokens.colorBgInformationSubtle} fgColor={tokens.colorFgInformationPrimary} />
        <SemanticSwatch label="low" bgColor={tokens.colorBgInformationLow} fgColor={tokens.colorFgInformationPrimary} />
        <SemanticSwatch label="low-accented" bgColor={tokens.colorBgInformationLowAccented} fgColor={tokens.colorFgInformationPrimary} />
        <SemanticSwatch label="medium" bgColor={tokens.colorBgInformationMedium} fgColor={tokens.colorFgInformationPrimary} />
        <SemanticSwatch label="high" bgColor={tokens.colorBgInformationHigh} fgColor={tokens.colorFgInformationInversePrimary} />
        <SemanticSwatch label="high-accented" bgColor={tokens.colorBgInformationHighAccented} fgColor={tokens.colorFgInformationInversePrimary} />
      </View>

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: tokens.colorBgInformationSubtle,
          borderLeftWidth: 4,
          borderLeftColor: tokens.colorBgInformationHigh,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: tokens.colorFgInformationPrimary, marginBottom: 4 }}>
          Information
        </Text>
        <Text style={{ fontSize: 14, color: tokens.colorFgInformationSecondary }}>
          New features are available in this release.
        </Text>
      </View>
    </ScrollView>
  ),
};

export const SemanticAttention: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Attention Backgrounds
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        For warnings and important notices
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <SemanticSwatch label="subtle" bgColor={tokens.colorBgAttentionSubtle} fgColor={tokens.colorFgAttentionPrimary} />
        <SemanticSwatch label="low" bgColor={tokens.colorBgAttentionLow} fgColor={tokens.colorFgAttentionPrimary} />
        <SemanticSwatch label="low-accented" bgColor={tokens.colorBgAttentionLowAccented} fgColor={tokens.colorFgAttentionPrimary} />
        <SemanticSwatch label="medium" bgColor={tokens.colorBgAttentionMedium} fgColor={tokens.colorFgAttentionPrimary} />
        <SemanticSwatch label="high" bgColor={tokens.colorBgAttentionHigh} fgColor={tokens.colorFgAttentionPrimary} />
        <SemanticSwatch label="high-accented" bgColor={tokens.colorBgAttentionHighAccented} fgColor={tokens.colorFgAttentionPrimary} />
      </View>

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: tokens.colorBgAttentionSubtle,
          borderLeftWidth: 4,
          borderLeftColor: tokens.colorBgAttentionHigh,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: tokens.colorFgAttentionPrimary, marginBottom: 4 }}>
          Warning
        </Text>
        <Text style={{ fontSize: 14, color: tokens.colorFgAttentionSecondary }}>
          This action cannot be undone. Please review before proceeding.
        </Text>
      </View>
    </ScrollView>
  ),
};

export const SemanticAccent: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Accent Backgrounds
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        For brand highlights and premium features
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <SemanticSwatch label="subtle" bgColor={tokens.colorBgAccentSubtle} fgColor={tokens.colorFgAccentPrimary} />
        <SemanticSwatch label="low" bgColor={tokens.colorBgAccentLow} fgColor={tokens.colorFgAccentPrimary} />
        <SemanticSwatch label="low-accented" bgColor={tokens.colorBgAccentLowAccented} fgColor={tokens.colorFgAccentPrimary} />
        <SemanticSwatch label="medium" bgColor={tokens.colorBgAccentMedium} fgColor={tokens.colorFgAccentPrimary} />
        <SemanticSwatch label="high" bgColor={tokens.colorBgAccentHigh} fgColor={tokens.colorFgAccentPrimary} />
        <SemanticSwatch label="high-accented" bgColor={tokens.colorBgAccentHighAccented} fgColor={tokens.colorFgAccentPrimary} />
      </View>

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: tokens.colorBgAccentSubtle,
          borderLeftWidth: 4,
          borderLeftColor: tokens.colorBgAccentHigh,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: tokens.colorFgAccentPrimary, marginBottom: 4 }}>
          Premium Feature
        </Text>
        <Text style={{ fontSize: 14, color: tokens.colorFgAccentSecondary }}>
          Upgrade to unlock advanced analytics and insights.
        </Text>
      </View>
    </ScrollView>
  ),
};

export const SemanticInput: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Input Backgrounds
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        For form inputs and interactive elements
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <SemanticSwatch label="subtle" bgColor={tokens.colorBgInputSubtle} fgColor={tokens.colorFgInputPrimary} />
        <SemanticSwatch label="subtle-accented" bgColor={tokens.colorBgInputSubtleAccented} fgColor={tokens.colorFgInputPrimary} />
        <SemanticSwatch label="low" bgColor={tokens.colorBgInputLow} fgColor={tokens.colorFgInputPrimary} />
        <SemanticSwatch label="low-accented" bgColor={tokens.colorBgInputLowAccented} fgColor={tokens.colorFgInputPrimary} />
        <SemanticSwatch label="medium" bgColor={tokens.colorBgInputMedium} fgColor={tokens.colorFgInputPrimary} />
        <SemanticSwatch label="high" bgColor={tokens.colorBgInputHigh} fgColor={tokens.colorFgInputPrimary} />
        <SemanticSwatch label="high-accented" bgColor={tokens.colorBgInputHighAccented} fgColor={tokens.colorFgInputPrimary} />
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 }}>
          Example Form Field
        </Text>
        <View
          style={{
            padding: 12,
            backgroundColor: tokens.colorBgInputSubtle,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: tokens.colorBgInputMedium,
          }}
        >
          <Text style={{ fontSize: 14, color: tokens.colorFgInputPrimary }}>
            Enter your email address
          </Text>
        </View>
      </View>
    </ScrollView>
  ),
};

export const SemanticTransparent: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Transparent Backgrounds
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        For overlays, glass effects, and layered UI
      </Text>

      <View
        style={{
          backgroundColor: '#e5f3f8',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          Standard Transparent
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <SemanticSwatch label="min" bgColor={tokens.colorBgTransparentMin} fgColor="#000" />
          <SemanticSwatch label="subtle" bgColor={tokens.colorBgTransparentSubtle} fgColor="#000" />
          <SemanticSwatch label="subtle-accented" bgColor={tokens.colorBgTransparentSubtleAccented} fgColor="#000" />
          <SemanticSwatch label="low" bgColor={tokens.colorBgTransparentLow} fgColor="#000" />
          <SemanticSwatch label="low-accented" bgColor={tokens.colorBgTransparentLowAccented} fgColor="#000" />
          <SemanticSwatch label="medium" bgColor={tokens.colorBgTransparentMedium} fgColor="#000" />
          <SemanticSwatch label="high" bgColor={tokens.colorBgTransparentHigh} fgColor="#fff" />
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#323232',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 }}>
          Inverse Transparent (for dark backgrounds)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <SemanticSwatch label="min" bgColor={tokens.colorBgTransparentInverseMin} fgColor="#fff" />
          <SemanticSwatch label="subtle" bgColor={tokens.colorBgTransparentInverseSubtle} fgColor="#fff" />
          <SemanticSwatch label="subtle-accented" bgColor={tokens.colorBgTransparentInverseSubtleAccented} fgColor="#fff" />
          <SemanticSwatch label="low" bgColor={tokens.colorBgTransparentInverseLow} fgColor="#fff" />
          <SemanticSwatch label="low-accented" bgColor={tokens.colorBgTransparentInverseLowAccented} fgColor="#fff" />
          <SemanticSwatch label="medium" bgColor={tokens.colorBgTransparentInverseMedium} fgColor="#fff" />
          <SemanticSwatch label="high" bgColor={tokens.colorBgTransparentInverseHigh} fgColor="#000" />
        </View>
      </View>
    </ScrollView>
  ),
};

const ForegroundSwatch = ({
  label,
  color,
}: {
  label: string;
  color: string;
}) => (
  <View style={{ marginBottom: 16, minWidth: 150 }}>
    <View
      style={{
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 8,
      }}
    >
      <Text style={{ color, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
        Aa
      </Text>
      <Text style={{ color, fontSize: 12 }}>
        The quick brown fox jumps over the lazy dog
      </Text>
    </View>
    <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#666' }}>
      {label}
    </Text>
    <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#999' }}>
      {color}
    </Text>
  </View>
);

export const ForegroundColors: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Foreground (Text) Colors
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
        Semantic foreground colors for text and icons
      </Text>

      {/* Neutral Foregrounds */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Neutral
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <ForegroundSwatch label="Primary" color={tokens.colorFgNeutralPrimary} />
          <ForegroundSwatch label="Secondary" color={tokens.colorFgNeutralSecondary} />
          <ForegroundSwatch label="Soft" color={tokens.colorFgNeutralSoft} />
          <ForegroundSwatch label="Softer" color={tokens.colorFgNeutralSofter} />
          <ForegroundSwatch label="Softest" color={tokens.colorFgNeutralSoftest} />
          <ForegroundSwatch label="Disabled" color={tokens.colorFgNeutralDisabled} />
        </View>
      </View>

      {/* Neutral Inverse */}
      <View style={{ marginBottom: 24, backgroundColor: '#1a1a1a', padding: 16, borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#fff' }}>
          Neutral Inverse (on dark backgrounds)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ backgroundColor: '#2a2a2a', padding: 16, borderRadius: 8 }}>
            <ForegroundSwatch label="Inverse Primary" color={tokens.colorFgNeutralInversePrimary} />
          </View>
          <View style={{ backgroundColor: '#2a2a2a', padding: 16, borderRadius: 8 }}>
            <ForegroundSwatch label="Inverse Secondary" color={tokens.colorFgNeutralInverseSecondary} />
          </View>
        </View>
      </View>

      {/* Alert */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Alert (Errors)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <ForegroundSwatch label="Primary" color={tokens.colorFgAlertPrimary} />
          <ForegroundSwatch label="Secondary" color={tokens.colorFgAlertSecondary} />
          <ForegroundSwatch label="Inverse Primary" color={tokens.colorFgAlertInversePrimary} />
          <ForegroundSwatch label="Inverse Secondary" color={tokens.colorFgAlertInverseSecondary} />
        </View>
      </View>

      {/* Positive */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Positive (Success)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <ForegroundSwatch label="Primary" color={tokens.colorFgPositivePrimary} />
          <ForegroundSwatch label="Secondary" color={tokens.colorFgPositiveSecondary} />
          <ForegroundSwatch label="Inverse Primary" color={tokens.colorFgPositiveInversePrimary} />
          <ForegroundSwatch label="Inverse Secondary" color={tokens.colorFgPositiveInverseSecondary} />
        </View>
      </View>

      {/* Information */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Information
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <ForegroundSwatch label="Primary" color={tokens.colorFgInformationPrimary} />
          <ForegroundSwatch label="Secondary" color={tokens.colorFgInformationSecondary} />
          <ForegroundSwatch label="Inverse Primary" color={tokens.colorFgInformationInversePrimary} />
          <ForegroundSwatch label="Inverse Secondary" color={tokens.colorFgInformationInverseSecondary} />
        </View>
      </View>

      {/* Attention */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Attention (Warnings)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <ForegroundSwatch label="Primary" color={tokens.colorFgAttentionPrimary} />
          <ForegroundSwatch label="Secondary" color={tokens.colorFgAttentionSecondary} />
        </View>
      </View>

      {/* Accent */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Accent
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <ForegroundSwatch label="Primary" color={tokens.colorFgAccentPrimary} />
          <ForegroundSwatch label="Secondary" color={tokens.colorFgAccentSecondary} />
        </View>
      </View>

      {/* Input */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Input
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <ForegroundSwatch label="Primary" color={tokens.colorFgInputPrimary} />
          <ForegroundSwatch label="Secondary" color={tokens.colorFgInputSecondary} />
          <ForegroundSwatch label="Soft" color={tokens.colorFgInputSoft} />
        </View>
      </View>

      {/* Specialty */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Specialty Colors
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <ForegroundSwatch label="Carby Primary" color={tokens.colorFgCarbyPrimary} />
          <ForegroundSwatch label="Carby Secondary" color={tokens.colorFgCarbySecondary} />
          <ForegroundSwatch label="Carby Accent" color={tokens.colorFgCarbyAccent} />
          <ForegroundSwatch label="Generative Primary" color={tokens.colorFgGenerativePrimary} />
          <ForegroundSwatch label="Generative Inverse Primary" color={tokens.colorFgGenerativeInversePrimary} />
          <ForegroundSwatch label="Generative Inverse Secondary" color={tokens.colorFgGenerativeInverseSecondary} />
        </View>
      </View>
    </ScrollView>
  ),
};

export const SemanticSpecialty: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Specialty Semantic Colors
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Application-specific semantic color tokens
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Carby (Sustainability)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <SemanticSwatch label="default" bgColor={tokens.colorBgCarbyDefault} fgColor={tokens.colorFgCarbyPrimary} />
          <SemanticSwatch label="default-accent" bgColor={tokens.colorBgCarbyDefaultAccent} fgColor={tokens.colorFgCarbyPrimary} />
          <SemanticSwatch label="high-contrast" bgColor={tokens.colorBgCarbyHighContrast} fgColor={tokens.colorFgCarbyPrimary} />
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Generative AI
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <SemanticSwatch label="strong" bgColor={tokens.colorBgGenerativeStrong} fgColor={tokens.colorFgGenerativePrimary} />
          <SemanticSwatch label="high" bgColor={tokens.colorBgGenerativeHigh} fgColor={tokens.colorFgGenerativeInversePrimary} />
          <SemanticSwatch label="high-accented" bgColor={tokens.colorBgGenerativeHighAccented} fgColor={tokens.colorFgGenerativeInversePrimary} />
        </View>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: tokens.colorBgCarbySubtle,
          borderLeftWidth: 4,
          borderLeftColor: tokens.colorBgCarbyHigh,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: tokens.colorFgCarbyPrimary, marginBottom: 4 }}>
          Carbon Neutral
        </Text>
        <Text style={{ fontSize: 14, color: tokens.colorFgCarbySecondary }}>
          This facility operates with net-zero carbon emissions.
        </Text>
      </View>

      <View
        style={{
          padding: 16,
          backgroundColor: tokens.colorBgGenerativeSubtle,
          borderLeftWidth: 4,
          borderLeftColor: tokens.colorBgGenerativeHigh,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: tokens.colorFgGenerativePrimary, marginBottom: 4 }}>
          AI Generated
        </Text>
        <Text style={{ fontSize: 14, color: tokens.colorFgGenerativeSecondary }}>
          This content was created with AI assistance.
        </Text>
      </View>
    </ScrollView>
  ),
};
