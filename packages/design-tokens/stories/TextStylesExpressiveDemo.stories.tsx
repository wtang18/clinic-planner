import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Semantics/Text Styles (Expressive)',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Expressive Text Style Utilities

Text style utilities generated from Figma text styles export for **marketing and customer-facing content**.

## Quick Reference

**Font**: Campton (expressive typography), Atlas Typewriter (eyebrows)
**Responsive**: Yes (scales at 768px breakpoint)
**Count**: 49 utility classes
**Regenerate**: \`npm run text-styles:generate\`

---

## Features

- ✅ **Responsive**: Automatically scales between mobile and desktop viewports
- ✅ **Token-based**: References existing \`-expressive\` typography variants
- ✅ **Marketing-optimized**: Larger, bolder styles for customer-facing content
- ✅ **Auto-generated**: From Figma with "XX→YY" notation stripped

---

## Naming Convention

\`.text-expressive-{category}-{size}-{weight}\`

| Part | Options | Example |
|------|---------|---------|
| **category** | display, heading, body, label, eyebrow | \`display\` |
| **size** | xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl | \`xl\` |
| **weight** | regular, medium, bold | \`bold\` |

**Result**: \`.text-expressive-display-xl-bold\`

---

## Responsive Behavior

Expressive styles **automatically scale** between viewport sizes for dramatic marketing impact:

| Style | Mobile (≤768px) | Desktop (≥769px) | Scale |
|-------|-----------------|------------------|-------|
| \`display-xl-bold\` | 40px | 80px | **2x** |
| \`heading-3xl-bold\` | 32px | 64px | **2x** |
| \`body-md-regular\` | 16px | 18px | **1.125x** |

**How it works**: The \`-expressive\` token variants have viewport-specific values wrapped in media queries.

---

## Usage Examples

### Marketing Hero
\`\`\`tsx
<section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600">
  <div className="text-expressive-eyebrow-sm-medium text-white/80 mb-4">
    NEW RELEASE
  </div>
  <h1 className="text-expressive-display-xl-bold text-white mb-6">
    Transform Your Workflow
  </h1>
  <p className="text-expressive-body-lg-regular text-white/90">
    Designed for teams that move fast and think big.
  </p>
</section>
\`\`\`

### Customer Testimonial
\`\`\`tsx
<div className="elevation-lg rounded-xl p-8 bg-white">
  <p className="text-expressive-heading-xl-medium text-fg-neutral-primary mb-4">
    "This changed everything for our team."
  </p>
  <div className="text-expressive-label-sm-medium text-fg-neutral-secondary">
    Sarah Johnson, Product Manager
  </div>
</div>
\`\`\`

---

## Categories (49 Total)

| Category | Count | Use Case | Responsive | Most Common |
|----------|-------|----------|------------|-------------|
| **Display** | 12 | Hero headlines | ✅ 2x scale | \`display-xl-bold\` |
| **Heading** | 18 | Section titles | ✅ 1.5-2x scale | \`heading-3xl-bold\` |
| **Body** | 12 | Marketing copy | ✅ 1.125x scale | \`body-lg-regular\` |
| **Label** | 5 | UI elements | ❌ Static | \`label-md-medium\` |
| **Eyebrow** | 2 | Tags, overlines | ❌ Static | \`eyebrow-sm-medium\` |

---

## Working with Claude Code (AI Assistant)

### Regenerate After Figma Update
\`\`\`
I just exported updated expressive text styles from Figma.
The file has "24→40" numbers in the names—can you regenerate the utilities
and strip those out?
\`\`\`

### Find the Right Responsive Style
\`\`\`
I need a hero headline that scales from 40px to 80px between mobile and desktop.
What text style should I use?
\`\`\`

### Verify Responsive Scaling
\`\`\`
Show me the responsive behavior for text-expressive-display-xl-bold
(what sizes at mobile vs desktop and how it's implemented)
\`\`\`

### Migration from Core to Expressive
\`\`\`
This landing page currently uses core text styles (Inter font).
Can you migrate it to expressive styles (Campton font) for marketing impact?
\`\`\`

---

## Token Resolution (Responsive)

Expressive styles use viewport-specific tokens:

### Mobile (≤768px)
\`\`\`css
@media (max-width: 768px) {
  :root {
    --text-font-size-display-expressive-xl: var(--font-size-550); /* 40px */
  }
}
\`\`\`

### Desktop (≥769px)
\`\`\`css
@media (min-width: 769px) {
  :root {
    --text-font-size-display-expressive-xl: var(--font-size-750); /* 80px */
  }
}
\`\`\`

### Utility Class
\`\`\`css
.text-expressive-display-xl-bold {
  font-family: var(--text-font-family-display-expressive); /* Campton */
  font-size: var(--text-font-size-display-expressive-xl);  /* 40px → 80px */
  line-height: var(--text-line-height-display-expressive-xl);
  font-weight: var(--text-font-weight-display-bold);       /* 600 */
  letter-spacing: var(--text-letter-spacing-display-expressive);
}
\`\`\`

**Result**: Resize your browser to see the font size change at 768px!

---

## Core vs Expressive

| Aspect | Core | Expressive |
|--------|------|------------|
| **Font** | Inter | Campton |
| **Purpose** | Product UI | Marketing |
| **Responsive** | ❌ Static | ✅ Scales 1.125-2x |
| **Prefix** | \`.text-\` | \`.text-expressive-\` |
| **When to use** | App interface | Landing pages, campaigns |
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const AllStyles: Story = {
  render: () => (
    <div className="p-8 space-y-16 bg-[var(--color-bg-neutral-base)]">
      {/* Display Styles */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
          Display Styles (Large Headlines)
        </h2>
        <div className="space-y-4">
          <div>
            <div className="text-expressive-display-xl-bold text-[var(--color-fg-neutral-primary)]">
              Display XL Bold - Hero Title (40px→80px)
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-display-xl-bold</code>
          </div>
          <div>
            <div className="text-expressive-display-lg-medium text-[var(--color-fg-neutral-primary)]">
              Display Lg Medium - Section Title (32px→64px)
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-display-lg-medium</code>
          </div>
          <div>
            <div className="text-expressive-display-md-regular text-[var(--color-fg-neutral-primary)]">
              Display Md Regular - Subsection (28px→48px)
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-display-md-regular</code>
          </div>
        </div>
      </section>

      {/* Heading Styles */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
          Heading Styles (Page Structure)
        </h2>
        <div className="space-y-3">
          <div>
            <div className="text-expressive-heading-5xl-bold text-[var(--color-fg-neutral-primary)]">
              Heading 5XL Bold (48px→64px)
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-heading-5xl-bold</code>
          </div>
          <div>
            <div className="text-expressive-heading-3xl-medium text-[var(--color-fg-neutral-primary)]">
              Heading 3XL Medium (32px→64px)
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-heading-3xl-medium</code>
          </div>
          <div>
            <div className="text-expressive-heading-xl-bold text-[var(--color-fg-neutral-primary)]">
              Heading XL Bold - Card Title (20px→24px)
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-heading-xl-bold</code>
          </div>
          <div>
            <div className="text-expressive-heading-md-medium text-[var(--color-fg-neutral-primary)]">
              Heading Md Medium - Section Header (16px→20px)
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-heading-md-medium</code>
          </div>
        </div>
      </section>

      {/* Body Styles */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
          Body Styles (Content & Paragraphs)
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-expressive-body-lg-regular text-[var(--color-fg-neutral-primary)] max-w-2xl">
              Body Lg Regular - This is a larger body text size used for important marketing copy or lead text that needs emphasis. (18px→20px)
            </p>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-body-lg-regular</code>
          </div>
          <div>
            <p className="text-expressive-body-md-regular text-[var(--color-fg-neutral-secondary)] max-w-2xl">
              Body Md Regular - Standard body text for marketing content, providing good readability across all devices. (16px→18px)
            </p>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-body-md-regular</code>
          </div>
          <div>
            <p className="text-expressive-body-sm-regular text-[var(--color-fg-neutral-secondary)] max-w-2xl">
              Body Sm Regular - Smaller body text for secondary information or when you need to fit more content in marketing layouts. (14px→16px)
            </p>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-body-sm-regular</code>
          </div>
        </div>
      </section>

      {/* Label Styles */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
          Label Styles (UI Elements)
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-expressive-label-lg-medium text-[var(--color-fg-neutral-primary)]">Label Lg Medium</span>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-label-lg-medium</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-expressive-label-md-medium text-[var(--color-fg-neutral-primary)]">Label Md Medium</span>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-label-md-medium</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-expressive-label-sm-medium text-[var(--color-fg-neutral-primary)]">Label Sm Medium</span>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-label-sm-medium</code>
          </div>
        </div>
      </section>

      {/* Eyebrow Styles */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
          Eyebrow Styles (Overlines & Tags)
        </h2>
        <div className="space-y-3">
          <div>
            <div className="text-expressive-eyebrow-md-medium text-[var(--color-fg-neutral-secondary)]">
              Eyebrow Md Medium
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-eyebrow-md-medium</code>
          </div>
          <div>
            <div className="text-expressive-eyebrow-sm-medium text-[var(--color-fg-neutral-secondary)]">
              Eyebrow Sm Medium
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-expressive-eyebrow-sm-medium</code>
          </div>
        </div>
      </section>

      {/* Responsive Demo */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
          Responsive Sizing Demo
        </h2>
        <div className="bg-[var(--color-bg-neutral-subtle)] p-6 rounded-lg">
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-4">
            Resize your browser to see the text scale at the 768px breakpoint:
          </p>
          <div className="text-expressive-display-xl-bold text-[var(--color-fg-neutral-primary)] mb-2">
            40px → 80px
          </div>
          <div className="text-expressive-heading-2xl-medium text-[var(--color-fg-neutral-primary)] mb-2">
            24px → 40px
          </div>
          <div className="text-expressive-body-md-regular text-[var(--color-fg-neutral-secondary)]">
            16px → 18px
          </div>
        </div>
      </section>

      {/* Real-world Example */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
          Real-world Example (Marketing Hero)
        </h2>
        <div className="bg-[var(--color-bg-neutral-subtle)] p-8 rounded-lg max-w-3xl">
          <div className="text-expressive-eyebrow-sm-medium text-[var(--color-fg-neutral-secondary)] mb-3">
            NEW FEATURE
          </div>
          <h1 className="text-expressive-display-xl-bold text-[var(--color-fg-neutral-primary)] mb-4">
            Transform Your Clinic Planning
          </h1>
          <p className="text-expressive-body-lg-regular text-[var(--color-fg-neutral-secondary)] mb-6">
            Streamline your workflow with our powerful new scheduling tools. Designed for teams that need flexibility and precision.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-expressive-label-md-medium text-[var(--color-fg-neutral-primary)]">Learn More</span>
            <span className="text-expressive-body-sm-regular text-[var(--color-fg-neutral-secondary)]">Available now</span>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const ResponsiveComparison: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h1 className="text-3xl font-bold mb-8 text-[var(--color-fg-neutral-primary)]">
        Responsive Scaling Comparison
      </h1>

      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Resize your browser window to see the text sizes change at the 768px breakpoint.
          Expressive styles scale dramatically for marketing impact.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Display XL */}
        <div className="border-l-4 border-purple-500 pl-4">
          <code className="text-xs text-[var(--color-fg-neutral-secondary)] mb-2 block">
            .text-expressive-display-xl-bold
          </code>
          <div className="text-expressive-display-xl-bold text-[var(--color-fg-neutral-primary)]">
            Display XL Bold
          </div>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mt-2">
            Mobile: 40px → Desktop: 80px (2x scale)
          </p>
        </div>

        {/* Heading 3XL */}
        <div className="border-l-4 border-blue-500 pl-4">
          <code className="text-xs text-[var(--color-fg-neutral-secondary)] mb-2 block">
            .text-expressive-heading-3xl-bold
          </code>
          <div className="text-expressive-heading-3xl-bold text-[var(--color-fg-neutral-primary)]">
            Heading 3XL Bold
          </div>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mt-2">
            Mobile: 32px → Desktop: 64px (2x scale)
          </p>
        </div>

        {/* Body Md */}
        <div className="border-l-4 border-green-500 pl-4">
          <code className="text-xs text-[var(--color-fg-neutral-secondary)] mb-2 block">
            .text-expressive-body-md-regular
          </code>
          <div className="text-expressive-body-md-regular text-[var(--color-fg-neutral-primary)]">
            Body Md Regular - Marketing copy that scales subtly for better readability on larger screens.
          </div>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)] mt-2">
            Mobile: 16px → Desktop: 18px (1.125x scale)
          </p>
        </div>
      </div>
    </div>
  ),
};

export const ClaudeCodeExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6">Working with Claude Code (AI Assistant)</h2>
      <p className="text-gray-600 mb-8">
        Use these natural language prompts to work with Claude Code when managing expressive text styles.
      </p>

      <div className="space-y-8">
        {/* Regenerate After Figma Update */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-600">🔄</span>
            Regenerate After Figma Update
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "I just exported updated expressive text styles from Figma. The file has '24→40' numbers in the names—can you regenerate the utilities and strip those out?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will run <code className="bg-gray-100 px-1 rounded">npm run text-styles:generate</code> to regenerate utilities with clean names.
          </p>
        </div>

        {/* Find the Right Responsive Style */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">🔍</span>
            Find the Right Responsive Style
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "I need a hero headline that scales from 40px to 80px between mobile and desktop. What text style should I use?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will recommend <code className="bg-gray-100 px-1 rounded">text-expressive-display-xl-bold</code> and explain the responsive scaling.
          </p>
        </div>

        {/* Verify Responsive Scaling */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">📐</span>
            Verify Responsive Scaling
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Show me the responsive behavior for text-expressive-display-xl-bold (what sizes at mobile vs desktop and how it's implemented)"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will show the media query implementation and explain 40px→80px scaling at 768px breakpoint.
          </p>
        </div>

        {/* Migration from Core to Expressive */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-orange-600">🔧</span>
            Migration from Core to Expressive
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "This landing page currently uses core text styles (Inter font). Can you migrate it to expressive styles (Campton font) for marketing impact?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will replace core styles with expressive equivalents and explain the responsive scaling benefits.
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Expressive styles automatically scale at the 768px breakpoint</li>
          <li>• Use <code className="bg-white px-1 rounded">text-expressive-display-xl-bold</code> for hero headlines with dramatic impact</li>
          <li>• Body text scales more subtly (1.125x) for readability</li>
          <li>• Combine with color tokens for complete marketing layouts</li>
        </ul>
      </div>

      <div className="mt-6 p-6 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Full Documentation:</strong> See the Docs page above for complete responsive behavior details
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example prompts for working with Claude Code AI assistant when using Expressive text styles.',
      },
    },
  },
};
