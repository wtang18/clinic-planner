import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Primitives/Typography',
  parameters: {
    layout: 'padded',
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
- **Font Weights** - Light, regular, medium, semi-bold, and bold
- **Letter Spacing** - Horizontal spacing between characters

## Why Primitives?

By breaking typography into primitive tokens, we can:
- Mix and match properties to create semantic text styles
- Reference specific values consistently across the system
- Build semantic typography tokens (like \`--text-body-medium\`) from primitives

**Important**: In most cases, use semantic text style tokens (like \`--text-body-medium\`) instead of primitives. Only use primitives when creating new semantic text styles.

## Font Family Primitives

The typefaces used throughout the design system.

| Token | Value | Use Case |
|-------|-------|----------|
| \`--font-global-sans\` | Inter | Primary sans-serif for UI and body text |
| \`--font-global-sans-alt\` | TT Norms Pro | Alternative sans-serif for special use cases |
| \`--font-global-mono\` | Atlas Typewriter | Monospace for code and technical content |
| \`--font-global-sans-expressive\` | Campton | Expressive sans-serif for headings and marketing |

## Font Size Primitives

Granular font sizes from 8px to 160px.

| Token | Value | Common Usage |
|-------|-------|--------------|
| \`--font-size-100\` | 8px | Micro text (captions, legal) |
| \`--font-size-150\` | 10px | Tiny text (metadata) |
| \`--font-size-200\` | 12px | Small text (supporting info) |
| \`--font-size-250\` | 14px | Default body text |
| \`--font-size-300\` | 16px | Emphasized body text |
| \`--font-size-325\` | 18px | Large body text |
| \`--font-size-350\` | 20px | Small headings |
| \`--font-size-400\` | 24px | H4 headings |
| \`--font-size-450\` | 28px | H3 headings |
| \`--font-size-500\` | 32px | H2 headings |
| \`--font-size-550\` | 40px | H1 headings |
| \`--font-size-600\` | 48px | Large H1 |
| \`--font-size-650\` | 56px | Display headings |
| \`--font-size-700\` | 64px | Hero text |
| \`--font-size-750\` | 80px | Extra large hero |
| \`--font-size-800\` | 96px | Massive display |
| \`--font-size-950\` | 160px | Special oversized text |

## Line Height Primitives

Vertical spacing between lines of text.

| Token | Value | Typical Pairing |
|-------|-------|-----------------|
| \`--font-line-height-200\` | 12px | With font-size-100 |
| \`--font-line-height-300\` | 16px | With font-size-150 |
| \`--font-line-height-350\` | 20px | With font-size-200 |
| \`--font-line-height-400\` | 24px | With font-size-250 |
| \`--font-line-height-450\` | 28px | With font-size-300 |
| \`--font-line-height-500\` | 32px | With font-size-325 |
| \`--font-line-height-550\` | 40px | With font-size-400 |
| \`--font-line-height-600\` | 48px | With font-size-450 |
| \`--font-line-height-650\` | 56px | With font-size-500 |
| \`--font-line-height-700\` | 64px | With font-size-550 |
| \`--font-line-height-750\` | 80px | With font-size-600 |
| \`--font-line-height-800\` | 96px | With font-size-650 |
| \`--font-line-height-900\` | 128px | With font-size-700+ |
| \`--font-line-height-1000\` | 192px | With font-size-950 |

## Font Weight Primitives

Available font weights.

| Token | Value | Name | Use Case |
|-------|-------|------|----------|
| \`--font-weight-400\` | 400 | Regular | Body text |
| \`--font-weight-500\` | 500 | Medium | Emphasized text |
| \`--font-weight-600\` | 600 | Semi-Bold | Subheadings |
| \`--font-weight-700\` | 700 | Bold | Headings, strong emphasis |

## Letter Spacing Primitives

Horizontal spacing between characters (tracking).

| Token | Value | Use Case |
|-------|-------|----------|
| \`--font-letter-spacing-100\` | -2px | Very tight (large display text) |
| \`--font-letter-spacing-200\` | -1px | Tight (headlines) |
| \`--font-letter-spacing-300\` | -0.5px | Slightly tight (subheadings) |
| \`--font-letter-spacing-400\` | 0px | Normal (default) |
| \`--font-letter-spacing-500\` | 0.5px | Slightly loose (small text) |
| \`--font-letter-spacing-600\` | 1px | Loose (uppercase labels) |
| \`--font-letter-spacing-700\` | 2px | Very loose (all-caps headings) |

## Usage

\`\`\`tsx
// ❌ Avoid using primitives directly in components
<h1 style={{
  fontFamily: 'var(--font-global-sans)',
  fontSize: 'var(--font-size-550)',
  lineHeight: 'var(--font-line-height-700)',
  fontWeight: 'var(--font-weight-700)'
}}>
  Headline
</h1>

// ✅ Use semantic text style tokens instead
<h1 className="text-[var(--text-heading-large)]">
  Headline
</h1>

// ✅ Use primitives when creating new semantic text styles
// In your token definition file:
{
  "text": {
    "heading": {
      "custom": {
        "fontFamily": "{font.global.sans}",
        "fontSize": "{font.size.550}",
        "lineHeight": "{font.lineHeight.700}",
        "fontWeight": "{font.weight.700}"
      }
    }
  }
}
\`\`\`

## Typography Scale Philosophy

The scale follows a T-shirt sizing approach with numeric values:
- **100-300**: Small text for UI elements, captions, and supporting content
- **300-550**: Body text and headings for application content
- **600-950**: Display and hero text for marketing and special emphasis
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const FontFamilies: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Font Family Primitives
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-8">
        The typefaces used throughout the design system.
      </p>
      <div className="space-y-6">
        <div className="p-6 bg-white rounded-lg border border-[var(--color-bg-neutral-low)]">
          <div className="text-sm font-mono text-[var(--color-fg-neutral-secondary)] mb-2">
            --font-global-sans
          </div>
          <p
            className="text-2xl text-[var(--color-fg-neutral-primary)]"
            style={{ fontFamily: 'var(--font-global-sans)' }}
          >
            Inter - Primary sans-serif for UI and body text
          </p>
          <p
            className="text-sm text-[var(--color-fg-neutral-secondary)] mt-3"
            style={{ fontFamily: 'var(--font-global-sans)' }}
          >
            The quick brown fox jumps over the lazy dog. 0123456789
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-[var(--color-bg-neutral-low)]">
          <div className="text-sm font-mono text-[var(--color-fg-neutral-secondary)] mb-2">
            --font-global-sans-alt
          </div>
          <p
            className="text-2xl text-[var(--color-fg-neutral-primary)]"
            style={{ fontFamily: 'var(--font-global-sans-alt)' }}
          >
            TT Norms Pro - Alternative sans-serif
          </p>
          <p
            className="text-sm text-[var(--color-fg-neutral-secondary)] mt-3"
            style={{ fontFamily: 'var(--font-global-sans-alt)' }}
          >
            The quick brown fox jumps over the lazy dog. 0123456789
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-[var(--color-bg-neutral-low)]">
          <div className="text-sm font-mono text-[var(--color-fg-neutral-secondary)] mb-2">
            --font-global-mono
          </div>
          <p
            className="text-2xl text-[var(--color-fg-neutral-primary)]"
            style={{ fontFamily: 'var(--font-global-mono)' }}
          >
            Atlas Typewriter - Monospace for code
          </p>
          <p
            className="text-sm text-[var(--color-fg-neutral-secondary)] mt-3"
            style={{ fontFamily: 'var(--font-global-mono)' }}
          >
            The quick brown fox jumps over the lazy dog. 0123456789
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-[var(--color-bg-neutral-low)]">
          <div className="text-sm font-mono text-[var(--color-fg-neutral-secondary)] mb-2">
            --font-global-sans-expressive
          </div>
          <p
            className="text-2xl text-[var(--color-fg-neutral-primary)]"
            style={{ fontFamily: 'var(--font-global-sans-expressive)' }}
          >
            Campton - Expressive sans-serif for headings
          </p>
          <p
            className="text-sm text-[var(--color-fg-neutral-secondary)] mt-3"
            style={{ fontFamily: 'var(--font-global-sans-expressive)' }}
          >
            The quick brown fox jumps over the lazy dog. 0123456789
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Font family tokens showing all available typefaces.',
      },
    },
  },
};

export const FontSizes: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Font Size Scale
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-8">
        Complete scale from 8px to 160px.
      </p>
      <div className="space-y-4">
        {[
          { token: '--font-size-100', value: '8px', label: 'Micro' },
          { token: '--font-size-150', value: '10px', label: 'Tiny' },
          { token: '--font-size-200', value: '12px', label: 'Small' },
          { token: '--font-size-250', value: '14px', label: 'Default' },
          { token: '--font-size-300', value: '16px', label: 'Medium' },
          { token: '--font-size-325', value: '18px', label: 'Large Body' },
          { token: '--font-size-350', value: '20px', label: 'Small Heading' },
          { token: '--font-size-400', value: '24px', label: 'H4' },
          { token: '--font-size-450', value: '28px', label: 'H3' },
          { token: '--font-size-500', value: '32px', label: 'H2' },
          { token: '--font-size-550', value: '40px', label: 'H1' },
          { token: '--font-size-600', value: '48px', label: 'Large H1' },
          { token: '--font-size-650', value: '56px', label: 'Display' },
          { token: '--font-size-700', value: '64px', label: 'Hero' },
          { token: '--font-size-750', value: '80px', label: 'XL Hero' },
          { token: '--font-size-800', value: '96px', label: 'Massive' },
        ].map(({ token, value, label }) => (
          <div
            key={token}
            className="flex items-baseline gap-4 p-4 border-b border-[var(--color-bg-neutral-low)]"
          >
            <div className="w-48 flex-shrink-0">
              <div className="text-xs font-mono text-[var(--color-fg-neutral-secondary)]">
                {token}
              </div>
              <div className="text-xs text-[var(--color-fg-neutral-secondary)]">
                {value} • {label}
              </div>
            </div>
            <p
              className="text-[var(--color-fg-neutral-primary)]"
              style={{ fontSize: `var(${token})` }}
            >
              Sample Text
            </p>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete font size scale with visual examples.',
      },
    },
  },
};

export const FontWeights: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Font Weight Primitives
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-8">
        Available font weights for emphasis and hierarchy.
      </p>
      <div className="space-y-6">
        {[
          { token: '--font-weight-400', value: '400', name: 'Regular', use: 'Body text and default weight' },
          { token: '--font-weight-500', value: '500', name: 'Medium', use: 'Emphasized text and buttons' },
          { token: '--font-weight-600', value: '600', name: 'Semi-Bold', use: 'Subheadings and labels' },
          { token: '--font-weight-700', value: '700', name: 'Bold', use: 'Headings and strong emphasis' },
        ].map(({ token, value, name, use }) => (
          <div key={token} className="p-6 bg-white rounded-lg border border-[var(--color-bg-neutral-low)]">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <div className="text-sm font-mono text-[var(--color-fg-neutral-secondary)]">
                  {token}
                </div>
                <div className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  {value} • {name}
                </div>
              </div>
            </div>
            <p
              className="text-2xl text-[var(--color-fg-neutral-primary)] mb-2"
              style={{ fontWeight: `var(${token})` }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-[var(--color-fg-neutral-secondary)]">{use}</p>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Font weight tokens showing different emphasis levels.',
      },
    },
  },
};

export const LetterSpacing: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Letter Spacing (Tracking)
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-8">
        Horizontal spacing between characters for optical refinement.
      </p>
      <div className="space-y-6">
        {[
          { token: '--font-letter-spacing-100', value: '-2px', label: 'Very Tight', use: 'Large display text for optical balance' },
          { token: '--font-letter-spacing-200', value: '-1px', label: 'Tight', use: 'Headlines for compact appearance' },
          { token: '--font-letter-spacing-300', value: '-0.5px', label: 'Slightly Tight', use: 'Subheadings for refinement' },
          { token: '--font-letter-spacing-400', value: '0px', label: 'Normal', use: 'Default for most body text' },
          { token: '--font-letter-spacing-500', value: '0.5px', label: 'Slightly Loose', use: 'Small text for readability' },
          { token: '--font-letter-spacing-600', value: '1px', label: 'Loose', use: 'Uppercase labels and tags' },
          { token: '--font-letter-spacing-700', value: '2px', label: 'Very Loose', use: 'All-caps headings and emphasis' },
        ].map(({ token, value, label, use }) => (
          <div key={token} className="p-6 bg-white rounded-lg border border-[var(--color-bg-neutral-low)]">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <div className="text-sm font-mono text-[var(--color-fg-neutral-secondary)]">
                  {token}
                </div>
                <div className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  {value} • {label}
                </div>
              </div>
            </div>
            <p
              className="text-xl text-[var(--color-fg-neutral-primary)] mb-2"
              style={{ letterSpacing: `var(${token})` }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-sm text-[var(--color-fg-neutral-secondary)]">{use}</p>
          </div>
        ))}
      </div>

      <div
        className="mt-8 p-6 bg-[var(--color-bg-information-subtle)] border-l-4 border-[var(--color-bg-information-high)] rounded"
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-information-primary)]">
          Letter Spacing Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-fg-information-secondary)]">
          <li>• Negative letter spacing (tight) works well for large headings</li>
          <li>• Positive letter spacing (loose) improves readability of small text</li>
          <li>• Uppercase text benefits from increased letter spacing</li>
          <li>• Body text typically uses normal (0px) letter spacing</li>
          <li>• Optical refinement - adjust to taste within these ranges</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Letter spacing tokens for tracking adjustments.',
      },
    },
  },
};

export const LineHeights: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Line Height Scale
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-8">
        Vertical rhythm and spacing between lines of text.
      </p>
      <div className="space-y-8">
        {[
          { token: '--font-line-height-350', value: '20px', fontSize: '12px', label: 'Small Text' },
          { token: '--font-line-height-400', value: '24px', fontSize: '14px', label: 'Body Text' },
          { token: '--font-line-height-450', value: '28px', fontSize: '16px', label: 'Medium Text' },
          { token: '--font-line-height-500', value: '32px', fontSize: '18px', label: 'Large Body' },
          { token: '--font-line-height-550', value: '40px', fontSize: '24px', label: 'Small Heading' },
          { token: '--font-line-height-600', value: '48px', fontSize: '28px', label: 'Medium Heading' },
        ].map(({ token, value, fontSize, label }) => (
          <div key={token} className="p-6 bg-white rounded-lg border border-[var(--color-bg-neutral-low)]">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <div className="text-sm font-mono text-[var(--color-fg-neutral-secondary)]">
                  {token}
                </div>
                <div className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  {value} • {label}
                </div>
              </div>
            </div>
            <p
              className="text-[var(--color-fg-neutral-primary)]"
              style={{ lineHeight: `var(${token})`, fontSize }}
            >
              Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing.
            </p>
          </div>
        ))}
      </div>

      <div
        className="mt-8 p-6 bg-[var(--color-bg-accent-subtle)] border-l-4 border-[var(--color-bg-accent-high)] rounded"
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-accent-primary)]">
          Line Height Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-fg-accent-secondary)]">
          <li>• Body text typically uses 1.5x to 1.75x the font size</li>
          <li>• Headings use tighter line height (1.2x to 1.3x)</li>
          <li>• Longer line lengths need more generous line height</li>
          <li>• Short line lengths can use tighter line height</li>
          <li>• Good vertical rhythm improves reading experience</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Line height tokens for vertical rhythm and readability.',
      },
    },
  },
};

export const ComposingTextStyles: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Composing Text Styles from Primitives
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-8">
        Examples showing how primitive typography tokens combine to create semantic text styles.
      </p>

      <div className="space-y-8">
        <div className="p-6 bg-white rounded-lg border border-[var(--color-bg-neutral-low)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Body Text Style
          </h3>
          <div className="mb-4 p-3 bg-gray-50 rounded text-xs font-mono text-gray-600 space-y-1">
            <div>fontFamily: var(--font-global-sans)</div>
            <div>fontSize: var(--font-size-250) // 14px</div>
            <div>lineHeight: var(--font-line-height-400) // 24px</div>
            <div>fontWeight: var(--font-weight-400) // Regular</div>
            <div>letterSpacing: var(--font-letter-spacing-400) // 0px</div>
          </div>
          <p
            className="text-[var(--color-fg-neutral-primary)]"
            style={{
              fontFamily: 'var(--font-global-sans)',
              fontSize: 'var(--font-size-250)',
              lineHeight: 'var(--font-line-height-400)',
              fontWeight: 'var(--font-weight-400)',
              letterSpacing: 'var(--font-letter-spacing-400)',
            }}
          >
            This is body text using primitive tokens combined to create a readable, comfortable text style for paragraphs and general content. The line height provides good vertical rhythm.
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-[var(--color-bg-neutral-low)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Heading Style (H2)
          </h3>
          <div className="mb-4 p-3 bg-gray-50 rounded text-xs font-mono text-gray-600 space-y-1">
            <div>fontFamily: var(--font-global-sans)</div>
            <div>fontSize: var(--font-size-500) // 32px</div>
            <div>lineHeight: var(--font-line-height-650) // 56px</div>
            <div>fontWeight: var(--font-weight-700) // Bold</div>
            <div>letterSpacing: var(--font-letter-spacing-300) // -0.5px</div>
          </div>
          <h2
            className="text-[var(--color-fg-neutral-primary)]"
            style={{
              fontFamily: 'var(--font-global-sans)',
              fontSize: 'var(--font-size-500)',
              lineHeight: 'var(--font-line-height-650)',
              fontWeight: 'var(--font-weight-700)',
              letterSpacing: 'var(--font-letter-spacing-300)',
            }}
          >
            This is a Heading
          </h2>
        </div>

        <div className="p-6 bg-white rounded-lg border border-[var(--color-bg-neutral-low)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Small Caps Label Style
          </h3>
          <div className="mb-4 p-3 bg-gray-50 rounded text-xs font-mono text-gray-600 space-y-1">
            <div>fontFamily: var(--font-global-sans)</div>
            <div>fontSize: var(--font-size-200) // 12px</div>
            <div>lineHeight: var(--font-line-height-300) // 16px</div>
            <div>fontWeight: var(--font-weight-600) // Semi-Bold</div>
            <div>letterSpacing: var(--font-letter-spacing-600) // 1px</div>
            <div>textTransform: uppercase</div>
          </div>
          <p
            className="text-[var(--color-fg-neutral-secondary)] uppercase"
            style={{
              fontFamily: 'var(--font-global-sans)',
              fontSize: 'var(--font-size-200)',
              lineHeight: 'var(--font-line-height-300)',
              fontWeight: 'var(--font-weight-600)',
              letterSpacing: 'var(--font-letter-spacing-600)',
            }}
          >
            Category Label
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-[var(--color-bg-neutral-low)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Code/Monospace Style
          </h3>
          <div className="mb-4 p-3 bg-gray-50 rounded text-xs font-mono text-gray-600 space-y-1">
            <div>fontFamily: var(--font-global-mono)</div>
            <div>fontSize: var(--font-size-200) // 12px</div>
            <div>lineHeight: var(--font-line-height-350) // 20px</div>
            <div>fontWeight: var(--font-weight-400) // Regular</div>
            <div>letterSpacing: var(--font-letter-spacing-400) // 0px</div>
          </div>
          <code
            className="text-[var(--color-fg-information-primary)] bg-[var(--color-bg-information-subtle)] px-2 py-1 rounded"
            style={{
              fontFamily: 'var(--font-global-mono)',
              fontSize: 'var(--font-size-200)',
              lineHeight: 'var(--font-line-height-350)',
              fontWeight: 'var(--font-weight-400)',
              letterSpacing: 'var(--font-letter-spacing-400)',
            }}
          >
            const message = "Hello World";
          </code>
        </div>
      </div>

      <div
        className="mt-8 p-6 bg-[var(--color-bg-accent-subtle)] border-l-4 border-[var(--color-bg-accent-high)] rounded"
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-accent-primary)]">
          Typography Token Architecture
        </h3>
        <p className="text-sm text-[var(--color-fg-accent-secondary)] mb-3">
          These examples show raw primitive combinations. In production, these would be wrapped in semantic tokens like:
        </p>
        <ul className="space-y-1 text-xs font-mono text-[var(--color-fg-accent-secondary)]">
          <li>• --text-body-medium (for body text)</li>
          <li>• --text-heading-large (for H2)</li>
          <li>• --text-label-small (for uppercase labels)</li>
          <li>• --text-code-small (for inline code)</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'How primitive typography tokens combine to create complete text styles.',
      },
    },
  },
};
