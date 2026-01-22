/**
 * Text Styles (Core/Base) - React Native
 * Functional text styles for UI elements and content
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as tokens from '../../../src/design-system/tokens/build/react-native/tokens';

const meta: Meta = {
  title: 'Design System/Semantics/Text Styles (Core)',
  parameters: {
    docs: {
      description: {
        component: `
# Core Text Styles

Functional text styles for UI components and application content. These styles use **Inter** as the primary font family for clarity and readability.

## Text Style Hierarchy

### Display
Large, attention-grabbing text for hero sections and page titles.
- **Sizes**: sm (24px), md (28px), lg (32px), xl (40px)
- **Use**: Hero headings, landing pages, major announcements

### Title
Section titles and primary headings within pages.
- **Sizes**: sm (14px), lg (20px), xl (24px)
- **Use**: Page sections, card titles, modal headers

### Heading
Content headings with full size range for various hierarchy levels.
- **Sizes**: xs (12px) through 5xl (72px)
- **Use**: Article headings, section breaks, hierarchical content

### Body
Standard paragraph and content text.
- **Sizes**: xs (12px), sm (14px), md (16px), lg (18px)
- **Use**: Main content, descriptions, long-form text

### Label
UI labels, form fields, and metadata.
- **Sizes**: sm (12px), md (14px), lg (16px), xl (18px)
- **Use**: Form labels, button text, UI controls, captions

### Eyebrow
Small, uppercase labels for categorization.
- **Sizes**: xs (10px), sm (12px)
- **Use**: Category tags, kickers, overline text

## Font Family

All core text styles use **Inter**, a highly legible sans-serif font optimized for UI and screen reading.

## Usage

Text style tokens are composed of individual properties that you combine:
- \`textFontFamily[Category]\`: Font family
- \`textFontSize[Category][Size]\`: Font size
- \`textLineHeight[Category][Size]\`: Line height
- \`textFontWeight[Category][Size]\`: Font weight (if available)
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Complete documentation for core text styles
 */
export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>Core Text Styles</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Functional text styles for UI components and application content using Inter font family.
      </Text>

      <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Quick Reference</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Categories:</Text> 6 (Display, Title, Heading, Body, Label, Eyebrow)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Font Family:</Text> Inter (legible sans-serif for UI)</Text>
          <Text style={{ fontSize: 14 }}><Text style={{ fontWeight: '600' }}>Range:</Text> 10px (Eyebrow XS) to 72px (Heading 5XL)</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Features</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ 6 semantic categories for different content types</Text>
          <Text style={{ fontSize: 14 }}>✅ Multiple sizes within each category for hierarchy</Text>
          <Text style={{ fontSize: 14 }}>✅ Inter font optimized for readability and UI</Text>
          <Text style={{ fontSize: 14 }}>✅ Consistent naming across platforms</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Text Style Categories</Text>
        <View style={{ gap: 12 }}>
          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Display (24-40px)</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>Hero sections, landing pages, major announcements</Text>
          </View>
          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Title (14-24px)</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>Page sections, card titles, modal headers</Text>
          </View>
          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Heading (12-72px)</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>Content headings with full hierarchy (H1-H6)</Text>
          </View>
          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Body (12-18px)</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>Paragraphs, descriptions, long-form text</Text>
          </View>
          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Label (12-18px)</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>Form labels, button text, UI controls</Text>
          </View>
          <View style={{ padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Eyebrow (10-12px)</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>Category tags, kickers, overline text (uppercase)</Text>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Best Practices</Text>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#059669' }}>✅ Do</Text>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 14 }}>• Use Display for hero sections only</Text>
            <Text style={{ fontSize: 14 }}>• Maintain clear hierarchy with consistent categories</Text>
            <Text style={{ fontSize: 14 }}>• Use Body SM (14px) for mobile, MD (16px) for desktop</Text>
            <Text style={{ fontSize: 14 }}>• Always uppercase Eyebrow text</Text>
          </View>
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#DC2626' }}>❌ Don't</Text>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 14 }}>• Don't mix multiple Display sizes on one page</Text>
            <Text style={{ fontSize: 14 }}>• Don't skip hierarchy levels (use H1, H2, H3 in order)</Text>
            <Text style={{ fontSize: 14 }}>• Don't use Label for body content</Text>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Usage</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 }}>
          <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 6 }}>
            {`<Text style={{\n  fontFamily: textFontFamilyBody,\n  fontSize: textFontSizeBodySm.number,\n  lineHeight: textLineHeightBodySm.number\n}}>`}
          </Text>
        </View>
      </View>
    </ScrollView>
  ),
};

const TextStyleDemo = ({
  label,
  category,
  size,
  fontSize,
  sampleText,
  description,
}: {
  label: string;
  category: string;
  size: string;
  fontSize: number;
  sampleText: string;
  description: string;
}) => (
  <View style={{ marginBottom: 24 }}>
    <Text
      style={{
        fontFamily: tokens.textFontFamilyBody,
        fontSize: fontSize,
        marginBottom: 8,
      }}
    >
      {sampleText}
    </Text>
    <View style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 4 }}>
        {label} · {fontSize}px
      </Text>
      <Text style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>
        {description}
      </Text>
      <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#888' }}>
        textFontSize{category}{size}
      </Text>
    </View>
  </View>
);

export const DisplayStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Display Styles</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Large, attention-grabbing text for hero sections
      </Text>

      <TextStyleDemo
        label="Display SM"
        category="Display"
        size="Sm"
        fontSize={tokens.textFontSizeDisplaySm.number}
        sampleText="Hero Section Title"
        description="Smallest display size for compact hero sections"
      />
      <TextStyleDemo
        label="Display MD"
        category="Display"
        size="Md"
        fontSize={tokens.textFontSizeDisplayMd.number}
        sampleText="Hero Section Title"
        description="Medium display size for standard hero sections"
      />
      <TextStyleDemo
        label="Display LG"
        category="Display"
        size="Lg"
        fontSize={tokens.textFontSizeDisplayLg.number}
        sampleText="Hero Section Title"
        description="Large display size for prominent hero sections"
      />
      <TextStyleDemo
        label="Display XL"
        category="Display"
        size="Xl"
        fontSize={tokens.textFontSizeDisplayXl.number}
        sampleText="Hero Section Title"
        description="Extra large display for maximum impact"
      />
    </ScrollView>
  ),
};

export const TitleStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Title Styles</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Section titles and primary headings within pages
      </Text>

      <TextStyleDemo
        label="Title SM"
        category="Title"
        size="Sm"
        fontSize={tokens.textFontSizeTitleSm.number}
        sampleText="Section Title"
        description="Small titles for compact sections or secondary headings"
      />
      <TextStyleDemo
        label="Title LG"
        category="Title"
        size="Lg"
        fontSize={tokens.textFontSizeTitleLg.number}
        sampleText="Section Title"
        description="Large titles for page sections and card headers"
      />
      <TextStyleDemo
        label="Title XL"
        category="Title"
        size="Xl"
        fontSize={tokens.textFontSizeTitleXl.number}
        sampleText="Section Title"
        description="Extra large titles for major page sections"
      />
    </ScrollView>
  ),
};

export const HeadingStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Heading Styles</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Content headings with full hierarchy range
      </Text>

      <TextStyleDemo
        label="Heading XS"
        category="Heading"
        size="Xs"
        fontSize={tokens.textFontSizeHeadingXs.number}
        sampleText="Content Heading"
        description="Smallest heading for dense content"
      />
      <TextStyleDemo
        label="Heading SM"
        category="Heading"
        size="Sm"
        fontSize={tokens.textFontSizeHeadingSm.number}
        sampleText="Content Heading"
        description="Small heading for subsections"
      />
      <TextStyleDemo
        label="Heading MD"
        category="Heading"
        size="Md"
        fontSize={tokens.textFontSizeHeadingMd.number}
        sampleText="Content Heading"
        description="Medium heading (H3-level)"
      />
      <TextStyleDemo
        label="Heading LG"
        category="Heading"
        size="Lg"
        fontSize={tokens.textFontSizeHeadingLg.number}
        sampleText="Content Heading"
        description="Large heading (H2-level)"
      />
      <TextStyleDemo
        label="Heading XL"
        category="Heading"
        size="Xl"
        fontSize={tokens.textFontSizeHeadingXl.number}
        sampleText="Content Heading"
        description="Extra large heading (H1-level)"
      />
      <TextStyleDemo
        label="Heading 2XL"
        category="Heading"
        size="2xl"
        fontSize={tokens.textFontSizeHeading2xl.number}
        sampleText="Content Heading"
        description="Double extra large for major headings"
      />
      <TextStyleDemo
        label="Heading 3XL"
        category="Heading"
        size="3xl"
        fontSize={tokens.textFontSizeHeading3xl.number}
        sampleText="Major Heading"
        description="Triple extra large"
      />
    </ScrollView>
  ),
};

export const BodyStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Body Styles</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Standard paragraph and content text
      </Text>

      <TextStyleDemo
        label="Body XS"
        category="Body"
        size="Xs"
        fontSize={tokens.textFontSizeBodyXs.number}
        sampleText="This is body text for general content and descriptions. It should be legible and comfortable to read."
        description="Extra small body text for captions or fine print"
      />
      <TextStyleDemo
        label="Body SM"
        category="Body"
        size="Sm"
        fontSize={tokens.textFontSizeBodySm.number}
        sampleText="This is body text for general content and descriptions. It should be legible and comfortable to read."
        description="Small body text (most common for mobile)"
      />
      <TextStyleDemo
        label="Body MD"
        category="Body"
        size="Md"
        fontSize={tokens.textFontSizeBodyMd.number}
        sampleText="This is body text for general content and descriptions. It should be legible and comfortable to read."
        description="Medium body text (standard for desktop/tablet)"
      />
      <TextStyleDemo
        label="Body LG"
        category="Body"
        size="Lg"
        fontSize={tokens.textFontSizeBodyLg.number}
        sampleText="This is body text for general content and descriptions. It should be legible and comfortable to read."
        description="Large body text for accessibility or emphasis"
      />
    </ScrollView>
  ),
};

export const LabelStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Label Styles</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        UI labels, form fields, and metadata
      </Text>

      <TextStyleDemo
        label="Label SM"
        category="Label"
        size="Sm"
        fontSize={tokens.textFontSizeLabelSm.number}
        sampleText="Form Label or Button Text"
        description="Small labels for compact UI elements"
      />
      <TextStyleDemo
        label="Label MD"
        category="Label"
        size="Md"
        fontSize={tokens.textFontSizeLabelMd.number}
        sampleText="Form Label or Button Text"
        description="Medium labels (standard size)"
      />
      <TextStyleDemo
        label="Label LG"
        category="Label"
        size="Lg"
        fontSize={tokens.textFontSizeLabelLg.number}
        sampleText="Form Label or Button Text"
        description="Large labels for prominent buttons"
      />
      <TextStyleDemo
        label="Label XL"
        category="Label"
        size="Xl"
        fontSize={tokens.textFontSizeLabelXl.number}
        sampleText="Form Label or Button Text"
        description="Extra large labels for hero CTAs"
      />
    </ScrollView>
  ),
};

export const EyebrowStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Eyebrow Styles</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Small, uppercase labels for categorization
      </Text>

      <TextStyleDemo
        label="Eyebrow XS"
        category="Eyebrow"
        size="Xs"
        fontSize={tokens.textFontSizeEyebrowXs.number}
        sampleText="CATEGORY"
        description="Extra small eyebrow for compact spaces"
      />
      <TextStyleDemo
        label="Eyebrow SM"
        category="Eyebrow"
        size="Sm"
        fontSize={tokens.textFontSizeEyebrowSm.number}
        sampleText="CATEGORY"
        description="Standard eyebrow size"
      />
    </ScrollView>
  ),
};

export const UsageExample: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Usage Example</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Complete article layout showing text style hierarchy
      </Text>

      <View
        style={{
          padding: 16,
          backgroundColor: '#fff',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#e1e1e1',
        }}
      >
        {/* Eyebrow */}
        <Text
          style={{
            fontFamily: tokens.textFontFamilyEyebrow,
            fontSize: tokens.textFontSizeEyebrowXs.number,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          HEALTHCARE NEWS
        </Text>

        {/* Title */}
        <Text
          style={{
            fontFamily: tokens.textFontFamilyTitle,
            fontSize: tokens.textFontSizeTitleLg.number,
            fontWeight: '700',
            color: '#000',
            marginBottom: 16,
          }}
        >
          New Patient Portal Features
        </Text>

        {/* Heading */}
        <Text
          style={{
            fontFamily: tokens.textFontFamilyHeading,
            fontSize: tokens.textFontSizeHeadingMd.number,
            fontWeight: '600',
            color: '#000',
            marginBottom: 12,
          }}
        >
          Enhanced Appointment Scheduling
        </Text>

        {/* Body */}
        <Text
          style={{
            fontFamily: tokens.textFontFamilyBody,
            fontSize: tokens.textFontSizeBodySm.number,
            color: '#333',
            lineHeight: tokens.textFontSizeBodySm.number * 1.5,
            marginBottom: 16,
          }}
        >
          Patients can now schedule, reschedule, and cancel appointments directly through the
          portal. The new interface provides real-time availability and instant confirmation.
        </Text>

        {/* Label */}
        <Text
          style={{
            fontFamily: tokens.textFontFamilyLabel,
            fontSize: tokens.textFontSizeLabelSm.number,
            color: '#666',
          }}
        >
          Published: March 15, 2024
        </Text>
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
          Text Style Guidelines
        </Text>
        <Text style={{ fontSize: 14, color: '#1e40af', lineHeight: 20 }}>
          • Use Display for hero sections only{'\n'}
          • Title for page/section headers{'\n'}
          • Heading for content hierarchy (H1-H6){'\n'}
          • Body for paragraphs and descriptions{'\n'}
          • Label for UI controls and form fields{'\n'}
          • Eyebrow for category tags (always uppercase){'\n'}
          • Maintain consistent hierarchy throughout your app
        </Text>
      </View>
    </ScrollView>
  ),
};
