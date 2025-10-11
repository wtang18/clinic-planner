import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Foundations/Text Styles - Core',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Core Text Style Utilities

Text style utilities generated from Figma text styles export for **product UI**.

## Quick Reference

**Font**: Inter (sans-serif)
**Responsive**: No (static sizing across all viewports)
**Count**: 49 utility classes
**Regenerate**: \`npm run text-styles:generate\`

---

## Features

- ✅ **Token-based**: All styles reference existing typography tokens (font-family, font-size, line-height, font-weight, letter-spacing)
- ✅ **Auto-generated**: Regenerate from Figma export in seconds
- ✅ **Type-safe**: Clear naming convention with predictable class names
- ✅ **Composable**: Combine with color tokens for complete styling

---

## Naming Convention

\`.text-{category}-{size}-{weight}\`

| Part | Options | Example |
|------|---------|---------|
| **category** | display, heading, body, label, eyebrow | \`heading\` |
| **size** | xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl | \`xl\` |
| **weight** | regular, medium, bold | \`bold\` |

**Result**: \`.text-heading-xl-bold\`

---

## Usage Examples

### Basic Usage
\`\`\`tsx
<h1 className="text-heading-xl-bold text-fg-neutral-primary">
  Page Title
</h1>

<p className="text-body-md-regular text-fg-neutral-secondary">
  Body paragraph text
</p>
\`\`\`

### Real-World Card
\`\`\`tsx
<div className="elevation-md rounded-lg p-6 bg-bg-neutral-base">
  <div className="text-eyebrow-sm-medium text-fg-neutral-secondary mb-2">
    ANNOUNCEMENT
  </div>
  <h3 className="text-heading-xl-bold text-fg-neutral-primary mb-2">
    New Feature Launch
  </h3>
  <p className="text-body-md-regular text-fg-neutral-secondary">
    We're excited to announce...
  </p>
</div>
\`\`\`

---

## Categories (49 Total)

| Category | Count | Use Case | Most Common |
|----------|-------|----------|-------------|
| **Display** | 12 | Hero titles, main headlines | \`display-xl-bold\` |
| **Heading** | 18 | Page structure, sections | \`heading-xl-bold\`, \`heading-md-medium\` |
| **Body** | 12 | Paragraphs, content | \`body-md-regular\` |
| **Label** | 5 | Form labels, UI elements | \`label-sm-medium\` |
| **Eyebrow** | 2 | Overlines, tags, categories | \`eyebrow-sm-medium\` |

---

## Working with Claude Code (AI Assistant)

### Regenerate After Figma Update
\`\`\`
I just exported new text styles from Figma to typography-core-figma-export.json.
Can you regenerate the CSS utilities?
\`\`\`

### Find the Right Style
\`\`\`
I need a bold heading for a card title. What text style should I use?
\`\`\`

### Migration Help
\`\`\`
Can you migrate this component to use text style utilities instead of Tailwind classes?
<h2 className="text-xl font-bold">Title</h2>
\`\`\`

### Verify Token Chain
\`\`\`
Show me the full token resolution for text-body-md-medium
(what tokens it references and what values they resolve to)
\`\`\`

---

## Token Resolution

Each text style composes from 5 semantic tokens:

\`\`\`css
.text-body-md-medium {
  font-family: var(--text-font-family-body);      /* → Inter */
  font-size: var(--text-font-size-body-md);       /* → 16px */
  line-height: var(--text-line-height-body-md);   /* → 24px */
  font-weight: var(--text-font-weight-body-medium); /* → 500 */
  letter-spacing: var(--text-letter-spacing-body);  /* → 0px */
}
\`\`\`

This means:
- ✅ Update tokens → all styles update automatically
- ✅ No hard-coded values in utilities
- ✅ Single source of truth
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
            <div className="text-display-xl-bold text-[var(--color-fg-neutral-primary)]">
              Display XL Bold - Main Hero Title
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-display-xl-bold</code>
          </div>
          <div>
            <div className="text-display-lg-medium text-[var(--color-fg-neutral-primary)]">
              Display Lg Medium - Section Title
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-display-lg-medium</code>
          </div>
          <div>
            <div className="text-display-md-regular text-[var(--color-fg-neutral-primary)]">
              Display Md Regular - Subsection
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-display-md-regular</code>
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
            <div className="text-heading-5xl-bold text-[var(--color-fg-neutral-primary)]">
              Heading 5XL Bold
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-heading-5xl-bold</code>
          </div>
          <div>
            <div className="text-heading-3xl-medium text-[var(--color-fg-neutral-primary)]">
              Heading 3XL Medium
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-heading-3xl-medium</code>
          </div>
          <div>
            <div className="text-heading-xl-bold text-[var(--color-fg-neutral-primary)]">
              Heading XL Bold - Card Title
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-heading-xl-bold</code>
          </div>
          <div>
            <div className="text-heading-md-medium text-[var(--color-fg-neutral-primary)]">
              Heading Md Medium - Section Header
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-heading-md-medium</code>
          </div>
          <div>
            <div className="text-heading-sm-bold text-[var(--color-fg-neutral-primary)]">
              Heading Sm Bold - Subsection
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-heading-sm-bold</code>
          </div>
        </div>
      </section>

      {/* Body Styles */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
          Body Styles (Paragraphs & Content)
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-body-lg-regular text-[var(--color-fg-neutral-primary)] max-w-2xl">
              Body Lg Regular - This is a larger body text size used for important paragraphs or lead text that needs emphasis without being a heading.
            </p>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-body-lg-regular</code>
          </div>
          <div>
            <p className="text-body-md-regular text-[var(--color-fg-neutral-secondary)] max-w-2xl">
              Body Md Regular - This is the most common body text size, perfect for standard paragraphs and most content. It provides good readability at 16px.
            </p>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-body-md-regular</code>
          </div>
          <div>
            <p className="text-body-md-medium text-[var(--color-fg-neutral-primary)] max-w-2xl">
              Body Md Medium - Same size as regular but with medium weight for emphasis within body content.
            </p>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-body-md-medium</code>
          </div>
          <div>
            <p className="text-body-sm-regular text-[var(--color-fg-neutral-secondary)] max-w-2xl">
              Body Sm Regular - Smaller body text for secondary information, captions, or when you need to fit more content in a smaller space. Still readable at 14px.
            </p>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-body-sm-regular</code>
          </div>
          <div>
            <p className="text-body-xs-regular text-[var(--color-fg-neutral-secondary)] max-w-2xl">
              Body XS Regular - Extra small body text for tertiary information, footnotes, or very dense content layouts.
            </p>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-body-xs-regular</code>
          </div>
        </div>
      </section>

      {/* Label Styles */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
          Label Styles (Forms & UI Elements)
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-label-lg-medium text-[var(--color-fg-neutral-primary)]">Label Lg Medium</span>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-label-lg-medium</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label-md-medium text-[var(--color-fg-neutral-primary)]">Label Md Medium</span>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-label-md-medium</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label-sm-medium text-[var(--color-fg-neutral-primary)]">Label Sm Medium</span>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-label-sm-medium</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label-xs-medium text-[var(--color-fg-neutral-primary)]">Label XS Medium</span>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-label-xs-medium</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label-2xs-medium text-[var(--color-fg-neutral-primary)]">Label 2XS Medium</span>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-label-2xs-medium</code>
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
            <div className="text-eyebrow-md-medium text-[var(--color-fg-neutral-secondary)]">
              Eyebrow Md Medium
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-eyebrow-md-medium</code>
          </div>
          <div>
            <div className="text-eyebrow-sm-medium text-[var(--color-fg-neutral-secondary)]">
              Eyebrow Sm Medium
            </div>
            <code className="text-xs text-[var(--color-fg-neutral-secondary)]">.text-eyebrow-sm-medium</code>
          </div>
        </div>
      </section>

      {/* Real-world Example */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
          Real-world Example (Event Card)
        </h2>
        <div className="bg-[var(--color-bg-neutral-subtle)] p-6 rounded-lg max-w-md">
          <div className="text-eyebrow-sm-medium text-[var(--color-fg-neutral-secondary)] mb-2">
            UPCOMING EVENT
          </div>
          <h3 className="text-heading-xl-bold text-[var(--color-fg-neutral-primary)] mb-2">
            Monthly Clinic Review
          </h3>
          <p className="text-body-md-regular text-[var(--color-fg-neutral-secondary)] mb-4">
            Join us for our monthly review session where we discuss patient outcomes, process improvements, and team updates.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-label-sm-medium text-[var(--color-fg-neutral-primary)]">Date:</span>
            <span className="text-body-sm-regular text-[var(--color-fg-neutral-secondary)]">December 15, 2025</span>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const ByCategory: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h1 className="text-3xl font-bold mb-8 text-[var(--color-fg-neutral-primary)]">
        Core Text Styles by Category
      </h1>

      <div className="grid grid-cols-2 gap-8">
        {/* Display */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">Display</h2>
          <div className="space-y-2 text-[var(--color-fg-neutral-primary)]">
            <div className="text-display-sm-regular">Display Sm Regular</div>
            <div className="text-display-sm-medium">Display Sm Medium</div>
            <div className="text-display-sm-bold">Display Sm Bold</div>
            <div className="text-display-md-regular">Display Md Regular</div>
            <div className="text-display-md-medium">Display Md Medium</div>
            <div className="text-display-md-bold">Display Md Bold</div>
            <div className="text-display-lg-regular">Display Lg Regular</div>
            <div className="text-display-lg-medium">Display Lg Medium</div>
            <div className="text-display-lg-bold">Display Lg Bold</div>
            <div className="text-display-xl-regular">Display XL Regular</div>
            <div className="text-display-xl-medium">Display XL Medium</div>
            <div className="text-display-xl-bold">Display XL Bold</div>
          </div>
        </div>

        {/* Body */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">Body</h2>
          <div className="space-y-2 text-[var(--color-fg-neutral-primary)]">
            <div className="text-body-xs-regular">Body XS Regular</div>
            <div className="text-body-xs-medium">Body XS Medium</div>
            <div className="text-body-xs-bold">Body XS Bold</div>
            <div className="text-body-sm-regular">Body Sm Regular</div>
            <div className="text-body-sm-medium">Body Sm Medium</div>
            <div className="text-body-sm-bold">Body Sm Bold</div>
            <div className="text-body-md-regular">Body Md Regular</div>
            <div className="text-body-md-medium">Body Md Medium</div>
            <div className="text-body-md-bold">Body Md Bold</div>
            <div className="text-body-lg-regular">Body Lg Regular</div>
            <div className="text-body-lg-medium">Body Lg Medium</div>
            <div className="text-body-lg-bold">Body Lg Bold</div>
          </div>
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
        Use these natural language prompts to work with Claude Code when managing text styles.
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
              "I just exported new text styles from Figma to typography-core-figma-export.json. Can you regenerate the CSS utilities?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will run <code className="bg-gray-100 px-1 rounded">npm run text-styles:generate</code> and confirm utilities are updated.
          </p>
        </div>

        {/* Find the Right Style */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">🔍</span>
            Find the Right Style
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "I need a bold heading for a card title. What text style should I use?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will recommend <code className="bg-gray-100 px-1 rounded">text-heading-xl-bold</code> or <code className="bg-gray-100 px-1 rounded">text-heading-lg-bold</code> based on the context.
          </p>
        </div>

        {/* Migration Help */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">🔧</span>
            Migration from Tailwind
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Can you migrate this component to use text style utilities instead of Tailwind classes?
              &lt;h2 className=&quot;text-xl font-bold&quot;&gt;Title&lt;/h2&gt;"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will suggest <code className="bg-gray-100 px-1 rounded">&lt;h2 className="text-heading-xl-bold text-fg-neutral-primary"&gt;</code>
          </p>
        </div>

        {/* Verify Token Chain */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-orange-600">🔗</span>
            Verify Token Resolution
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Show me the full token resolution for text-body-md-medium (what tokens it references and what values they resolve to)"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will show the full chain from utility class → semantic tokens → primitive tokens → final values.
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Combine text styles with color tokens for complete styling</li>
          <li>• Use <code className="bg-white px-1 rounded">text-heading-xl-bold</code> for card titles</li>
          <li>• Use <code className="bg-white px-1 rounded">text-body-md-regular</code> for most paragraph text</li>
          <li>• Text styles only handle typography—add color classes separately</li>
        </ul>
      </div>

      <div className="mt-6 p-6 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Full Documentation:</strong> See <code className="bg-white px-2 py-1 rounded">docs/TEXT-STYLES-CORE-SUMMARY.md</code> for complete details
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example prompts for working with Claude Code AI assistant when using Core text styles.',
      },
    },
  },
};
