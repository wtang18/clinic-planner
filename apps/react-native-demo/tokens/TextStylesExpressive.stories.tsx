/**
 * Text Styles (Expressive) - React Native
 * Expressive text styles for marketing, branding, and hero content
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as tokens from '../../../src/design-system/tokens/build/react-native/tokens';

const meta: Meta = {
  title: 'Design System/Semantics/Text Styles (Expressive)',
  parameters: {
    docs: {
      description: {
        component: `
# Expressive Text Styles

Marketing-focused text styles for hero sections, landing pages, and brand-forward content. These styles use **Campton** and **Atlas Typewriter** for distinctive, expressive typography.

## When to Use Expressive Styles

Use expressive text styles for:
- **Marketing pages**: Landing pages, product showcases
- **Hero sections**: Large, attention-grabbing headlines
- **Brand content**: About pages, mission statements
- **Premium features**: Highlighting special offerings
- **Campaign materials**: Announcements, promotions

**Avoid** using expressive styles in:
- Application UI and forms
- Settings and configuration screens
- Data-dense interfaces
- Error messages and system notifications

## Responsive Sizing (Web Only)

**Important:** In the web design system, expressive text styles are responsive and scale up on larger viewports:

- **Display Expressive SM**: 24px (mobile) → 40px (desktop at 768px+)
- **Display Expressive MD**: 28px (mobile) → 48px (desktop at 768px+)
- **Display Expressive LG**: 32px (mobile) → 64px (desktop at 768px+)
- **Display Expressive XL**: 40px (mobile) → 80px (desktop at 768px+)

**React Native:** Uses static font sizes (24px, 28px, 32px, 40px) since RN doesn't support CSS media queries. For responsive sizing in React Native, manually adjust font sizes based on screen dimensions using Dimensions or useWindowDimensions() hooks.

## Expressive Text Hierarchy

### Display Expressive
Massive, bold headlines for maximum visual impact.
- **Sizes (React Native)**: sm (24px), md (28px), lg (32px), xl (40px)
- **Sizes (Web)**: sm (24px→40px), md (28px→48px), lg (32px→64px), xl (40px→80px)
- **Font**: Campton
- **Use**: Hero headlines, campaign titles

### Title Expressive
Brand-forward section titles.
- **Sizes**: sm (14px), md (18px), lg (20px), xl (24px)
- **Font**: Campton
- **Use**: Marketing section headers, feature callouts

### Heading Expressive
Marketing content headings with full hierarchy.
- **Sizes**: xs (12px) through 5xl (72px)
- **Font**: Campton
- **Use**: Marketing article headings, product features

### Body Expressive
Engaging body copy for marketing content.
- **Sizes**: xs (12px), sm (14px), md (16px), lg (18px)
- **Font**: Campton
- **Use**: Marketing descriptions, feature explanations

### Label Expressive
Distinctive labels for brand touchpoints.
- **Sizes**: sm (12px), md (14px), lg (16px), xl (18px)
- **Font**: Campton
- **Use**: Campaign CTAs, premium feature labels

### Eyebrow Expressive
Unique category markers with monospace flair.
- **Sizes**: xs (10px), sm (12px)
- **Font**: Atlas Typewriter (monospace)
- **Use**: Campaign tags, special categories

## Font Families

- **Campton**: Geometric sans-serif with personality for headlines and marketing copy
- **Atlas Typewriter**: Monospace font for distinctive eyebrow labels

## Core vs. Expressive

| Aspect | Core (Inter) | Expressive (Campton/Atlas) |
|--------|-------------|---------------------------|
| Purpose | Functional UI | Marketing & branding |
| Feel | Professional, clean | Bold, distinctive |
| Context | App interface | Landing pages, campaigns |
| Tone | Neutral | Brand-forward |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const ExpressiveTextDemo = ({
  label,
  category,
  size,
  fontSize,
  sampleText,
  description,
  fontFamily,
}: {
  label: string;
  category: string;
  size: string;
  fontSize: number;
  sampleText: string;
  description: string;
  fontFamily: string;
}) => (
  <View style={{ marginBottom: 24 }}>
    <Text
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
        marginBottom: 8,
        fontWeight: category === 'Display' || category === 'Title' ? '700' : '400',
      }}
    >
      {sampleText}
    </Text>
    <View style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 4 }}>
        {label} · {fontSize}px · {fontFamily}
      </Text>
      <Text style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>
        {description}
      </Text>
      <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#888' }}>
        textFontSize{category}Expressive{size}
      </Text>
    </View>
  </View>
);

export const DisplayExpressiveStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Display Expressive Styles
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Bold, brand-forward hero headlines using Campton
      </Text>

      <ExpressiveTextDemo
        label="Display Expressive SM"
        category="Display"
        size="Sm"
        fontSize={tokens.textFontSizeDisplayExpressiveSm.number}
        sampleText="Transform Your Healthcare"
        description="Compact expressive hero headline"
        fontFamily={tokens.textFontFamilyDisplayExpressive}
      />
      <ExpressiveTextDemo
        label="Display Expressive MD"
        category="Display"
        size="Md"
        fontSize={tokens.textFontSizeDisplayExpressiveMd.number}
        sampleText="Transform Your Healthcare"
        description="Standard expressive hero headline"
        fontFamily={tokens.textFontFamilyDisplayExpressive}
      />
      <ExpressiveTextDemo
        label="Display Expressive LG"
        category="Display"
        size="Lg"
        fontSize={tokens.textFontSizeDisplayExpressiveLg.number}
        sampleText="Transform Your Healthcare"
        description="Large expressive hero headline"
        fontFamily={tokens.textFontFamilyDisplayExpressive}
      />
      <ExpressiveTextDemo
        label="Display Expressive XL"
        category="Display"
        size="Xl"
        fontSize={tokens.textFontSizeDisplayExpressiveXl.number}
        sampleText="Transform Your Healthcare"
        description="Maximum impact hero headline"
        fontFamily={tokens.textFontFamilyDisplayExpressive}
      />
    </ScrollView>
  ),
};

export const TitleExpressiveStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Title Expressive Styles
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Brand-forward section titles for marketing content
      </Text>

      <ExpressiveTextDemo
        label="Title Expressive SM"
        category="Title"
        size="Sm"
        fontSize={tokens.textFontSizeTitleExpressiveSm.number}
        sampleText="Featured Benefits"
        description="Small marketing section title"
        fontFamily={tokens.textFontFamilyTitleExpressive}
      />
      <ExpressiveTextDemo
        label="Title Expressive MD"
        category="Title"
        size="Md"
        fontSize={tokens.textFontSizeTitleExpressiveMd.number}
        sampleText="Featured Benefits"
        description="Medium marketing section title"
        fontFamily={tokens.textFontFamilyTitleExpressive}
      />
      <ExpressiveTextDemo
        label="Title Expressive LG"
        category="Title"
        size="Lg"
        fontSize={tokens.textFontSizeTitleExpressiveLg.number}
        sampleText="Featured Benefits"
        description="Large marketing section title"
        fontFamily={tokens.textFontFamilyTitleExpressive}
      />
      <ExpressiveTextDemo
        label="Title Expressive XL"
        category="Title"
        size="Xl"
        fontSize={tokens.textFontSizeTitleExpressiveXl.number}
        sampleText="Featured Benefits"
        description="Extra large marketing section title"
        fontFamily={tokens.textFontFamilyTitleExpressive}
      />
    </ScrollView>
  ),
};

export const HeadingExpressiveStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Heading Expressive Styles
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Marketing content headings with personality
      </Text>

      <ExpressiveTextDemo
        label="Heading Expressive XS"
        category="Heading"
        size="Xs"
        fontSize={tokens.textFontSizeHeadingExpressiveXs.number}
        sampleText="Discover More Features"
        description="Extra small expressive heading"
        fontFamily={tokens.textFontFamilyHeadingExpressive}
      />
      <ExpressiveTextDemo
        label="Heading Expressive SM"
        category="Heading"
        size="Sm"
        fontSize={tokens.textFontSizeHeadingExpressiveSm.number}
        sampleText="Discover More Features"
        description="Small expressive heading"
        fontFamily={tokens.textFontFamilyHeadingExpressive}
      />
      <ExpressiveTextDemo
        label="Heading Expressive MD"
        category="Heading"
        size="Md"
        fontSize={tokens.textFontSizeHeadingExpressiveMd.number}
        sampleText="Discover More Features"
        description="Medium expressive heading"
        fontFamily={tokens.textFontFamilyHeadingExpressive}
      />
      <ExpressiveTextDemo
        label="Heading Expressive LG"
        category="Heading"
        size="Lg"
        fontSize={tokens.textFontSizeHeadingExpressiveLg.number}
        sampleText="Discover More Features"
        description="Large expressive heading"
        fontFamily={tokens.textFontFamilyHeadingExpressive}
      />
      <ExpressiveTextDemo
        label="Heading Expressive XL"
        category="Heading"
        size="Xl"
        fontSize={tokens.textFontSizeHeadingExpressiveXl.number}
        sampleText="Discover More"
        description="Extra large expressive heading"
        fontFamily={tokens.textFontFamilyHeadingExpressive}
      />
    </ScrollView>
  ),
};

export const BodyExpressiveStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Body Expressive Styles
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Engaging body copy for marketing and brand content
      </Text>

      <ExpressiveTextDemo
        label="Body Expressive XS"
        category="Body"
        size="Xs"
        fontSize={tokens.textFontSizeBodyExpressiveXs.number}
        sampleText="Experience healthcare that puts you first. Our patient-centered approach combines cutting-edge technology with compassionate care."
        description="Extra small marketing body text"
        fontFamily={tokens.textFontFamilyBodyExpressive}
      />
      <ExpressiveTextDemo
        label="Body Expressive SM"
        category="Body"
        size="Sm"
        fontSize={tokens.textFontSizeBodyExpressiveSm.number}
        sampleText="Experience healthcare that puts you first. Our patient-centered approach combines cutting-edge technology with compassionate care."
        description="Small marketing body text (most common)"
        fontFamily={tokens.textFontFamilyBodyExpressive}
      />
      <ExpressiveTextDemo
        label="Body Expressive MD"
        category="Body"
        size="Md"
        fontSize={tokens.textFontSizeBodyExpressiveMd.number}
        sampleText="Experience healthcare that puts you first. Our patient-centered approach combines cutting-edge technology with compassionate care."
        description="Medium marketing body text"
        fontFamily={tokens.textFontFamilyBodyExpressive}
      />
      <ExpressiveTextDemo
        label="Body Expressive LG"
        category="Body"
        size="Lg"
        fontSize={tokens.textFontSizeBodyExpressiveLg.number}
        sampleText="Experience healthcare that puts you first. Our patient-centered approach combines cutting-edge technology with compassionate care."
        description="Large marketing body text for emphasis"
        fontFamily={tokens.textFontFamilyBodyExpressive}
      />
    </ScrollView>
  ),
};

export const LabelExpressiveStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Label Expressive Styles
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Distinctive labels for campaign CTAs and premium features
      </Text>

      <ExpressiveTextDemo
        label="Label Expressive SM"
        category="Label"
        size="Sm"
        fontSize={tokens.textFontSizeLabelExpressiveSm.number}
        sampleText="Get Started Today"
        description="Small expressive label for buttons/CTAs"
        fontFamily={tokens.textFontFamilyLabelExpressive}
      />
      <ExpressiveTextDemo
        label="Label Expressive MD"
        category="Label"
        size="Md"
        fontSize={tokens.textFontSizeLabelExpressiveMd.number}
        sampleText="Get Started Today"
        description="Medium expressive label (standard)"
        fontFamily={tokens.textFontFamilyLabelExpressive}
      />
      <ExpressiveTextDemo
        label="Label Expressive LG"
        category="Label"
        size="Lg"
        fontSize={tokens.textFontSizeLabelExpressiveLg.number}
        sampleText="Get Started Today"
        description="Large expressive label for hero CTAs"
        fontFamily={tokens.textFontFamilyLabelExpressive}
      />
      <ExpressiveTextDemo
        label="Label Expressive XL"
        category="Label"
        size="Xl"
        fontSize={tokens.textFontSizeLabelExpressiveXl.number}
        sampleText="Get Started Today"
        description="Extra large expressive label for maximum emphasis"
        fontFamily={tokens.textFontFamilyLabelExpressive}
      />
    </ScrollView>
  ),
};

export const EyebrowExpressiveStyles: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Eyebrow Expressive Styles
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Distinctive monospace category labels using Atlas Typewriter
      </Text>

      <ExpressiveTextDemo
        label="Eyebrow Expressive XS"
        category="Eyebrow"
        size="Xs"
        fontSize={tokens.textFontSizeEyebrowExpressiveXs.number}
        sampleText="NEW FEATURE"
        description="Extra small monospace eyebrow (Atlas Typewriter)"
        fontFamily={tokens.textFontFamilyEyebrowExpressive}
      />
      <ExpressiveTextDemo
        label="Eyebrow Expressive SM"
        category="Eyebrow"
        size="Sm"
        fontSize={tokens.textFontSizeEyebrowExpressiveSm.number}
        sampleText="NEW FEATURE"
        description="Standard monospace eyebrow (Atlas Typewriter)"
        fontFamily={tokens.textFontFamilyEyebrowExpressive}
      />

      <View
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: '#f3eff6',
          borderLeftWidth: 4,
          borderLeftColor: '#a489bb',
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#4c3c5a', marginBottom: 8 }}>
          Eyebrow Distinctive Typography
        </Text>
        <Text style={{ fontSize: 14, color: '#4c3c5a', lineHeight: 20 }}>
          Expressive eyebrows use Atlas Typewriter, a monospace font, to create a distinctive,
          tech-forward aesthetic for campaign tags and special category markers.
        </Text>
      </View>
    </ScrollView>
  ),
};

export const MarketingExample: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Marketing Page Example
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
        Complete landing page hero showcasing expressive text hierarchy
      </Text>

      <View
        style={{
          padding: 24,
          backgroundColor: '#1b3644',
          borderRadius: 16,
        }}
      >
        {/* Eyebrow Expressive */}
        <Text
          style={{
            fontFamily: tokens.textFontFamilyEyebrowExpressive,
            fontSize: tokens.textFontSizeEyebrowExpressiveSm.number,
            color: '#6bd9a1',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginBottom: 16,
          }}
        >
          INTRODUCING
        </Text>

        {/* Display Expressive */}
        <Text
          style={{
            fontFamily: tokens.textFontFamilyDisplayExpressive,
            fontSize: tokens.textFontSizeDisplayExpressiveLg.number,
            fontWeight: '700',
            color: '#fff',
            marginBottom: 16,
            lineHeight: tokens.textFontSizeDisplayExpressiveLg.number * 1.2,
          }}
        >
          The Future of Patient Care
        </Text>

        {/* Body Expressive */}
        <Text
          style={{
            fontFamily: tokens.textFontFamilyBodyExpressive,
            fontSize: tokens.textFontSizeBodyExpressiveMd.number,
            color: '#c9e6f0',
            marginBottom: 24,
            lineHeight: tokens.textFontSizeBodyExpressiveMd.number * 1.6,
          }}
        >
          Experience seamless healthcare coordination with our AI-powered platform. Book
          appointments, access records, and connect with your care team—all in one place.
        </Text>

        {/* Title Expressive */}
        <Text
          style={{
            fontFamily: tokens.textFontFamilyTitleExpressive,
            fontSize: tokens.textFontSizeTitleExpressiveMd.number,
            fontWeight: '600',
            color: '#fff',
            marginBottom: 12,
          }}
        >
          Key Features
        </Text>

        {/* Heading Expressive */}
        <Text
          style={{
            fontFamily: tokens.textFontFamilyHeadingExpressive,
            fontSize: tokens.textFontSizeHeadingExpressiveSm.number,
            fontWeight: '600',
            color: '#e5f3f8',
            marginBottom: 8,
          }}
        >
          • Smart Scheduling
        </Text>
        <Text
          style={{
            fontFamily: tokens.textFontFamilyHeadingExpressive,
            fontSize: tokens.textFontSizeHeadingExpressiveSm.number,
            fontWeight: '600',
            color: '#e5f3f8',
            marginBottom: 8,
          }}
        >
          • Instant Messaging
        </Text>
        <Text
          style={{
            fontFamily: tokens.textFontFamilyHeadingExpressive,
            fontSize: tokens.textFontSizeHeadingExpressiveSm.number,
            fontWeight: '600',
            color: '#e5f3f8',
            marginBottom: 24,
          }}
        >
          • Secure Records
        </Text>

        {/* Label Expressive (CTA) */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 14,
            backgroundColor: '#6bd9a1',
            borderRadius: 8,
            alignSelf: 'flex-start',
          }}
        >
          <Text
            style={{
              fontFamily: tokens.textFontFamilyLabelExpressive,
              fontSize: tokens.textFontSizeLabelExpressiveMd.number,
              fontWeight: '600',
              color: '#0e6c52',
            }}
          >
            Start Your Journey
          </Text>
        </View>
      </View>

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
          Expressive Style Guidelines
        </Text>
        <Text style={{ fontSize: 14, color: '#856404', lineHeight: 20 }}>
          • Use for marketing pages and brand content only{'\n'}
          • Combine with dark backgrounds for maximum impact{'\n'}
          • Pair with vibrant accent colors{'\n'}
          • Maintain clear hierarchy: Display → Title → Heading → Body{'\n'}
          • Use Atlas Typewriter eyebrows for special campaigns{'\n'}
          • Keep CTAs bold and prominent with Label Expressive{'\n'}
          • Never mix Core and Expressive styles in same content block
        </Text>
      </View>
    </ScrollView>
  ),
};
