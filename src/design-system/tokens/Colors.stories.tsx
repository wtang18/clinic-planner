import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Foundations/Colors',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Semantic Color Tokens

Purpose-driven color tokens for consistent, accessible UI design. These semantic tokens reference primitive colors and provide clear meaning through their naming.

## What are Semantic Colors?

Semantic color tokens abstract away raw color values (like `#e5f3f8` or `blue-50`) and replace them with purpose-driven names that describe **what** the color is for, not **what** it looks like.

**Benefits**:
- **Meaningful names**: `--color-bg-alert-subtle` is clearer than `saturated-red-50`
- **Themeability**: Change the entire color scheme by swapping primitive references
- **Consistency**: Colors with the same purpose look the same everywhere
- **Accessibility**: Semantic pairings (bg + fg) ensure sufficient contrast

## Semantic Color Categories

Colors are organized by intent with background (bg) and foreground (fg) variants:

- **Neutral**: Base UI elements, text, backgrounds, borders
- **Alert**: Errors, destructive actions, critical warnings
- **Attention**: Warnings, cautions, important notices
- **Positive**: Success, confirmations, positive outcomes
- **Information**: Informational messages, links, helpful tips
- **Accent**: Special highlights, premium features, branding
- **Transparent**: Overlays, modals, glass effects

## Intensity Scale

**Background Colors** follow an intensity scale from subtle to high:
- \`base\`: Default background (usually white/near-white)
- \`min\`: Minimal tint, barely visible
- \`subtle\`: Very light tint for subtle containers
- \`low\`: Light tint for cards and panels
- \`low-accented\`: Light with slightly more color
- \`medium\`: Mid-tone for moderate emphasis
- \`high\`: Dark, high emphasis for buttons/CTAs
- \`high-accented\`: Darkest, maximum emphasis
- \`inverse-*\`: Dark mode variants

**Foreground Colors** are optimized for readability:
- \`primary\`: Main text color (highest contrast)
- \`secondary\`: Supporting text (medium contrast)
- \`spot-readable\`: Subtle colored text
- \`disabled\`: Inactive/disabled text
- \`inverse-primary\`: Text on dark backgrounds
- \`inverse-secondary\`: Secondary text on dark backgrounds

## Usage

\`\`\`tsx
// ✅ Use semantic color tokens
<div className="bg-[var(--color-bg-alert-subtle)] border-l-4 border-[var(--color-bg-alert-high)]">
  <p className="text-[var(--color-fg-alert-primary)]">Error message</p>
</div>

// ✅ Pair backgrounds and foregrounds from the same category
<button className="bg-[var(--color-bg-positive-high)] text-[var(--color-fg-positive-inverse-primary)]">
  Save Changes
</button>

// ❌ Don't use primitive colors directly
<div style={{ backgroundColor: '#fcedeb', color: '#b4272c' }}>
  Error message
</div>

// ❌ Don't mix categories inappropriately
<div className="bg-[var(--color-bg-alert-subtle)] text-[var(--color-fg-positive-primary)]">
  Confusing mixed semantics
</div>
\`\`\`

## Relationship to Primitives

Semantic tokens reference primitive colors from the **Primitives/Colors** story:

| Semantic Token | References Primitive |
|----------------|---------------------|
| \`--color-bg-alert-subtle\` | \`saturated-red-50\` |
| \`--color-bg-positive-high\` | \`green-600\` |
| \`--color-bg-information-subtle\` | \`blue-50\` |
| \`--color-fg-neutral-primary\` | \`gray-900\` |

See **Primitives/Colors** for the complete list of base color values.
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Semantic color swatch with both bg and fg
const SemanticSwatch = ({
  label,
  bgToken,
  fgToken
}: {
  label: string;
  bgToken: string;
  fgToken: string;
}) => (
  <div className="flex flex-col gap-1">
    <div
      className="w-full h-12 rounded-lg border flex items-center justify-center text-xs font-semibold"
      style={{
        backgroundColor: `var(${bgToken})`,
        color: `var(${fgToken})`
      }}
    >
      {label}
    </div>
    <span className="text-2xs text-[var(--color-fg-neutral-secondary)] text-center">{label}</span>
  </div>
);

export const SemanticNeutral: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Neutral Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For general UI elements and containers</p>
        <div className="grid grid-cols-4 gap-4">
          <SemanticSwatch label="base" bgToken="--color-bg-neutral-base" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="min" bgToken="--color-bg-neutral-min" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="subtle" bgToken="--color-bg-neutral-subtle" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-neutral-low" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-neutral-low-accented" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-neutral-medium" fgToken="--color-fg-neutral-primary" />
          <SemanticSwatch label="inverse-base" bgToken="--color-bg-neutral-inverse-base" fgToken="--color-fg-neutral-inverse-primary" />
          <SemanticSwatch label="inverse-low" bgToken="--color-bg-neutral-inverse-low" fgToken="--color-fg-neutral-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Neutral Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For text and icons on light backgrounds</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-[var(--color-fg-neutral-primary)] font-semibold mb-1">Primary</p>
            <p className="text-[var(--color-fg-neutral-primary)] text-xs">Main text content</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-[var(--color-fg-neutral-secondary)] font-semibold mb-1">Secondary</p>
            <p className="text-[var(--color-fg-neutral-secondary)] text-xs">Supporting text</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-[var(--color-fg-neutral-spot-readable)] font-semibold mb-1">Spot Readable</p>
            <p className="text-[var(--color-fg-neutral-spot-readable)] text-xs">Subtle hints</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-[var(--color-fg-neutral-disabled)] font-semibold mb-1">Disabled</p>
            <p className="text-[var(--color-fg-neutral-disabled)] text-xs">Inactive state</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Neutral semantic colors for general UI elements.',
      },
    },
  },
};

export const SemanticAlert: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Alert Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For errors and destructive actions</p>
        <div className="grid grid-cols-3 gap-4">
          <SemanticSwatch label="subtle" bgToken="--color-bg-alert-subtle" fgToken="--color-fg-alert-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-alert-low" fgToken="--color-fg-alert-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-alert-low-accented" fgToken="--color-fg-alert-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-alert-medium" fgToken="--color-fg-alert-primary" />
          <SemanticSwatch label="high" bgToken="--color-bg-alert-high" fgToken="--color-fg-alert-inverse-primary" />
          <SemanticSwatch label="high-accented" bgToken="--color-bg-alert-high-accented" fgToken="--color-fg-alert-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Alert Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For error text and icons on light backgrounds</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-primary)' }} className="font-semibold mb-1">Primary</p>
            <p style={{ color: 'var(--color-fg-alert-primary)' }} className="text-xs">Main error text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-alert-primary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-secondary)' }} className="font-semibold mb-1">Secondary</p>
            <p style={{ color: 'var(--color-fg-alert-secondary)' }} className="text-xs">Supporting error text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-alert-secondary</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-inverse-primary)' }} className="font-semibold mb-1">Inverse Primary</p>
            <p style={{ color: 'var(--color-fg-alert-inverse-primary)' }} className="text-xs">Text on dark alert bg</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-alert-inverse-primary</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-inverse-secondary)' }} className="font-semibold mb-1">Inverse Secondary</p>
            <p style={{ color: 'var(--color-fg-alert-inverse-secondary)' }} className="text-xs">Supporting on dark</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-alert-inverse-secondary</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div className="space-y-3">
          <div style={{ backgroundColor: 'var(--color-bg-alert-subtle)', borderLeftWidth: '4px', borderLeftColor: 'var(--color-bg-alert-high)' }} className="p-4 rounded">
            <p style={{ color: 'var(--color-fg-alert-primary)' }} className="font-semibold mb-1">Error</p>
            <p style={{ color: 'var(--color-fg-alert-secondary)' }} className="text-sm">Something went wrong. Please try again.</p>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-alert-high)' }} className="p-4 rounded">
            <p style={{ color: 'var(--color-fg-alert-inverse-primary)' }} className="font-semibold">Delete Account</p>
            <p style={{ color: 'var(--color-fg-alert-inverse-secondary)' }} className="text-sm">This action cannot be undone</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert colors for errors and destructive actions.',
      },
    },
  },
};

export const SemanticPositive: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Positive Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For success states and confirmations</p>
        <div className="grid grid-cols-3 gap-4">
          <SemanticSwatch label="subtle" bgToken="--color-bg-positive-subtle" fgToken="--color-fg-positive-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-positive-low" fgToken="--color-fg-positive-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-positive-low-accented" fgToken="--color-fg-positive-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-positive-medium" fgToken="--color-fg-positive-primary" />
          <SemanticSwatch label="strong" bgToken="--color-bg-positive-strong" fgToken="--color-fg-positive-inverse-primary" />
          <SemanticSwatch label="high" bgToken="--color-bg-positive-high" fgToken="--color-fg-positive-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Positive Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For success text and icons on light backgrounds</p>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-primary)' }} className="font-semibold mb-1">Primary</p>
            <p style={{ color: 'var(--color-fg-positive-primary)' }} className="text-xs">Main success text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-positive-primary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-secondary)' }} className="font-semibold mb-1">Secondary</p>
            <p style={{ color: 'var(--color-fg-positive-secondary)' }} className="text-xs">Supporting text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-positive-secondary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-spot-readable)' }} className="font-semibold mb-1">Spot Readable</p>
            <p style={{ color: 'var(--color-fg-positive-spot-readable)' }} className="text-xs">Subtle hints</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-positive-spot-readable</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-inverse-primary)' }} className="font-semibold mb-1">Inverse Primary</p>
            <p style={{ color: 'var(--color-fg-positive-inverse-primary)' }} className="text-xs">Text on dark bg</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-positive-inverse-primary</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-inverse-secondary)' }} className="font-semibold mb-1">Inverse Secondary</p>
            <p style={{ color: 'var(--color-fg-positive-inverse-secondary)' }} className="text-xs">Supporting on dark</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-positive-inverse-secondary</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div className="space-y-3">
          <div style={{ backgroundColor: 'var(--color-bg-positive-subtle)', borderLeftWidth: '4px', borderLeftColor: 'var(--color-bg-positive-high)' }} className="p-4 rounded">
            <p style={{ color: 'var(--color-fg-positive-primary)' }} className="font-semibold mb-1">Success</p>
            <p style={{ color: 'var(--color-fg-positive-secondary)' }} className="text-sm">Your changes have been saved.</p>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-positive-strong)' }} className="p-4 rounded">
            <p style={{ color: 'var(--color-fg-positive-inverse-primary)' }} className="font-semibold">Active Subscription</p>
            <p style={{ color: 'var(--color-fg-positive-inverse-secondary)' }} className="text-sm">Your plan is active</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Positive colors for success states and confirmations.',
      },
    },
  },
};

export const SemanticAttention: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Attention Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For warnings and important notices</p>
        <div className="grid grid-cols-3 gap-4">
          <SemanticSwatch label="subtle" bgToken="--color-bg-attention-subtle" fgToken="--color-fg-attention-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-attention-low" fgToken="--color-fg-attention-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-attention-low-accented" fgToken="--color-fg-attention-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-attention-medium" fgToken="--color-fg-attention-primary" />
          <SemanticSwatch label="high" bgToken="--color-bg-attention-high" fgToken="--color-fg-attention-inverse-primary" />
          <SemanticSwatch label="high-accented" bgToken="--color-bg-attention-high-accented" fgToken="--color-fg-attention-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Attention Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For warning text and icons on light backgrounds</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-attention-primary)' }} className="font-semibold mb-1">Primary</p>
            <p style={{ color: 'var(--color-fg-attention-primary)' }} className="text-xs">Main warning text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-attention-primary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-attention-secondary)' }} className="font-semibold mb-1">Secondary</p>
            <p style={{ color: 'var(--color-fg-attention-secondary)' }} className="text-xs">Supporting text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-attention-secondary</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div style={{ backgroundColor: 'var(--color-bg-attention-subtle)', borderLeftWidth: '4px', borderLeftColor: 'var(--color-bg-attention-high)' }} className="p-4 rounded">
          <p style={{ color: 'var(--color-fg-attention-primary)' }} className="font-semibold mb-1">Warning</p>
          <p style={{ color: 'var(--color-fg-attention-secondary)' }} className="text-sm">This action requires your attention.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Attention colors for warnings and important notices.',
      },
    },
  },
};

export const SemanticInformation: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Information Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For informational messages and links</p>
        <div className="grid grid-cols-3 gap-4">
          <SemanticSwatch label="subtle" bgToken="--color-bg-information-subtle" fgToken="--color-fg-information-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-information-low" fgToken="--color-fg-information-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-information-low-accented" fgToken="--color-fg-information-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-information-medium" fgToken="--color-fg-information-primary" />
          <SemanticSwatch label="high" bgToken="--color-bg-information-high" fgToken="--color-fg-information-inverse-primary" />
          <SemanticSwatch label="high-accented" bgToken="--color-bg-information-high-accented" fgToken="--color-fg-information-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Information Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For informational text and icons on light backgrounds</p>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-information-primary)' }} className="font-semibold mb-1">Primary</p>
            <p style={{ color: 'var(--color-fg-information-primary)' }} className="text-xs">Main info text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-information-primary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-information-secondary)' }} className="font-semibold mb-1">Secondary</p>
            <p style={{ color: 'var(--color-fg-information-secondary)' }} className="text-xs">Supporting text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-information-secondary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-information-spot-readable)' }} className="font-semibold mb-1">Spot Readable</p>
            <p style={{ color: 'var(--color-fg-information-spot-readable)' }} className="text-xs">Subtle hints</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-information-spot-readable</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-information-inverse-primary)' }} className="font-semibold mb-1">Inverse Primary</p>
            <p style={{ color: 'var(--color-fg-information-inverse-primary)' }} className="text-xs">Text on dark bg</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-information-inverse-primary</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-information-inverse-secondary)' }} className="font-semibold mb-1">Inverse Secondary</p>
            <p style={{ color: 'var(--color-fg-information-inverse-secondary)' }} className="text-xs">Supporting on dark</p>
            <p className="text-2xs font-mono text-gray-400 mt-2">--color-fg-information-inverse-secondary</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div style={{ backgroundColor: 'var(--color-bg-information-subtle)', borderLeftWidth: '4px', borderLeftColor: 'var(--color-bg-information-high)' }} className="p-4 rounded">
          <p style={{ color: 'var(--color-fg-information-primary)' }} className="font-semibold mb-1">Information</p>
          <p style={{ color: 'var(--color-fg-information-secondary)' }} className="text-sm">New features are available in this release.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Information colors for informational messages.',
      },
    },
  },
};

export const SemanticAccent: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Accent Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For special highlights and premium features</p>
        <div className="grid grid-cols-3 gap-4">
          <SemanticSwatch label="subtle" bgToken="--color-bg-accent-subtle" fgToken="--color-fg-accent-primary" />
          <SemanticSwatch label="low" bgToken="--color-bg-accent-low" fgToken="--color-fg-accent-primary" />
          <SemanticSwatch label="low-accented" bgToken="--color-bg-accent-low-accented" fgToken="--color-fg-accent-primary" />
          <SemanticSwatch label="medium" bgToken="--color-bg-accent-medium" fgToken="--color-fg-accent-primary" />
          <SemanticSwatch label="high" bgToken="--color-bg-accent-high" fgToken="--color-fg-accent-inverse-primary" />
          <SemanticSwatch label="high-accented" bgToken="--color-bg-accent-high-accented" fgToken="--color-fg-accent-inverse-primary" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Accent Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For accent text and icons on light backgrounds</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-accent-primary)' }} className="font-semibold mb-1">Primary</p>
            <p style={{ color: 'var(--color-fg-accent-primary)' }} className="text-xs">Main accent text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-accent-primary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-accent-secondary)' }} className="font-semibold mb-1">Secondary</p>
            <p style={{ color: 'var(--color-fg-accent-secondary)' }} className="text-xs">Supporting text</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-accent-secondary</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-accent-spot-readable)' }} className="font-semibold mb-1">Spot Readable</p>
            <p style={{ color: 'var(--color-fg-accent-spot-readable)' }} className="text-xs">Subtle hints</p>
            <p className="text-2xs font-mono text-gray-600 mt-2">--color-fg-accent-spot-readable</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div style={{ backgroundColor: 'var(--color-bg-accent-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-accent-high)' }} className="p-4 rounded">
          <p style={{ color: 'var(--color-fg-accent-primary)' }} className="font-semibold mb-1">Premium Feature</p>
          <p style={{ color: 'var(--color-fg-accent-secondary)' }} className="text-sm">Upgrade to unlock advanced analytics.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accent colors for special highlights and premium features.',
      },
    },
  },
};

export const SemanticTransparent: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Transparent Backgrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For overlays, modals, and layered UI elements</p>

        {/* Regular transparent backgrounds (black alpha) */}
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-4 text-gray-700">Standard (Black Alpha)</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-min)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">min</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-min</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-subtle)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">subtle</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-subtle</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-subtle-accented)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">subtle-accented</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-subtle-accented</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-low)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">low</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-low</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-low-accented)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">low-accented</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-low-accented</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-medium)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">medium</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-medium</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-high)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">high</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-high</p>
            </div>
          </div>
        </div>

        {/* Inverse transparent backgrounds (white alpha) */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-gray-700">Inverse (White Alpha)</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-min)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-min</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-min</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-subtle)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-subtle</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-subtle</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-subtle-accented)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-subtle-accented</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-subtle-accented</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-low)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-low</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-low</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-low-accented)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-low-accented</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-low-accented</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-medium)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-medium</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-medium</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-24 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg overflow-hidden">
                <div style={{ backgroundColor: 'var(--color-bg-transparent-inverse-high)' }} className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded">inverse-high</span>
                </div>
              </div>
              <p className="text-2xs font-mono text-gray-600">--color-bg-transparent-inverse-high</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Transparent Foregrounds</h2>
        <p className="text-sm text-gray-600 mb-6">For text and icons with varying opacity</p>

        {/* Regular transparent foregrounds (black alpha) */}
        <div className="mb-8">
          <h3 className="text-base font-semibold mb-4 text-gray-700">Standard (Black Alpha)</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-softer)' }} className="font-semibold mb-1">Softer</p>
              <p className="text-2xs font-mono text-gray-600">--color-fg-transparent-softer</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-soft)' }} className="font-semibold mb-1">Soft</p>
              <p className="text-2xs font-mono text-gray-600">--color-fg-transparent-soft</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-medium)' }} className="font-semibold mb-1">Medium</p>
              <p className="text-2xs font-mono text-gray-600">--color-fg-transparent-medium</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-strong)' }} className="font-semibold mb-1">Strong</p>
              <p className="text-2xs font-mono text-gray-600">--color-fg-transparent-strong</p>
            </div>
          </div>
        </div>

        {/* Inverse transparent foregrounds (white alpha) */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-gray-700">Inverse (White Alpha)</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-inverse-softer)' }} className="font-semibold mb-1">Inverse Softer</p>
              <p className="text-2xs font-mono text-gray-400">--color-fg-transparent-inverse-softer</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-inverse-soft)' }} className="font-semibold mb-1">Inverse Soft</p>
              <p className="text-2xs font-mono text-gray-400">--color-fg-transparent-inverse-soft</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-inverse-medium)' }} className="font-semibold mb-1">Inverse Medium</p>
              <p className="text-2xs font-mono text-gray-400">--color-fg-transparent-inverse-medium</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p style={{ color: 'var(--color-fg-transparent-inverse-strong)' }} className="font-semibold mb-1">Inverse Strong</p>
              <p className="text-2xs font-mono text-gray-400">--color-fg-transparent-inverse-strong</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Example Usage</h2>
        <div className="space-y-4">
          {/* Modal overlay example */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg overflow-hidden">
            <div style={{ backgroundColor: 'var(--color-bg-transparent-medium)' }} className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Modal Dialog</h4>
                <p className="text-sm text-gray-600">Using transparent-medium for the overlay backdrop</p>
              </div>
            </div>
          </div>

          {/* Tooltip example */}
          <div className="bg-white border rounded-lg p-6">
            <div className="inline-block">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Hover for tooltip
              </button>
              <div
                style={{ backgroundColor: 'var(--color-bg-transparent-inverse-high)' }}
                className="mt-2 px-3 py-2 rounded text-sm"
              >
                <p style={{ color: 'var(--color-fg-transparent-inverse-strong)' }}>
                  Tooltip with inverse transparent colors
                </p>
              </div>
            </div>
          </div>

          {/* Card with transparent overlay */}
          <div className="relative h-40 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg overflow-hidden">
            <div style={{ backgroundColor: 'var(--color-bg-transparent-low)' }} className="absolute inset-0 p-6 flex flex-col justify-end">
              <h4 style={{ color: 'var(--color-fg-transparent-inverse-strong)' }} className="font-bold text-lg mb-1">
                Image Card Overlay
              </h4>
              <p style={{ color: 'var(--color-fg-transparent-inverse-medium)' }} className="text-sm">
                Using transparent overlays for better text readability
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Usage Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use standard (black alpha) transparent tokens on light backgrounds</li>
          <li>• Use inverse (white alpha) transparent tokens on dark backgrounds</li>
          <li>• Transparent backgrounds are ideal for overlays, modals, and tooltips</li>
          <li>• Transparent foregrounds work well for text that needs to adapt to various backgrounds</li>
          <li>• Start with lower opacity variants (min, subtle, low) and increase as needed</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Transparent color tokens for overlays, modals, and adaptive UI elements.',
      },
    },
  },
};

export const UsageExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-4">Semantic Color Usage Examples</h2>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Alert Messages</h3>
        <div className="space-y-3">
          <div style={{ backgroundColor: 'var(--color-bg-alert-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-alert-high)' }} className="rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-primary)' }} className="font-semibold">Validation Error</p>
            <p style={{ color: 'var(--color-fg-alert-primary)' }} className="text-sm">Please fill in all required fields.</p>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-alert-high)' }} className="rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-alert-inverse-primary)' }} className="font-semibold">Delete Confirmation</p>
            <p style={{ color: 'var(--color-fg-alert-inverse-secondary)' }} className="text-sm">This will permanently delete your data.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Success Messages</h3>
        <div className="space-y-3">
          <div style={{ backgroundColor: 'var(--color-bg-positive-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-positive-high)' }} className="rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-positive-primary)' }} className="font-semibold">Success!</p>
            <p style={{ color: 'var(--color-fg-positive-primary)' }} className="text-sm">Your profile has been updated.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Information Messages</h3>
        <div style={{ backgroundColor: 'var(--color-bg-information-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-information-high)' }} className="rounded-lg p-4">
          <p style={{ color: 'var(--color-fg-information-primary)' }} className="font-semibold">Did you know?</p>
          <p style={{ color: 'var(--color-fg-information-primary)' }} className="text-sm">You can customize your dashboard layout.</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Warning Messages</h3>
        <div style={{ backgroundColor: 'var(--color-bg-attention-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-attention-high)' }} className="rounded-lg p-4">
          <p style={{ color: 'var(--color-fg-attention-primary)' }} className="font-semibold">Caution</p>
          <p style={{ color: 'var(--color-fg-attention-primary)' }} className="text-sm">This operation may take several minutes.</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Cards & Containers</h3>
        <div className="grid grid-cols-2 gap-4">
          <div style={{ backgroundColor: 'var(--color-bg-neutral-base)', borderWidth: '1px', borderColor: 'var(--color-bg-neutral-low)' }} className="rounded-lg p-4 shadow-sm">
            <p style={{ color: 'var(--color-fg-neutral-primary)' }} className="font-semibold">Default Card</p>
            <p style={{ color: 'var(--color-fg-neutral-secondary)' }} className="text-sm">Using neutral colors</p>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-neutral-subtle)', borderWidth: '1px', borderColor: 'var(--color-bg-neutral-low)' }} className="rounded-lg p-4">
            <p style={{ color: 'var(--color-fg-neutral-primary)' }} className="font-semibold">Subtle Background</p>
            <p style={{ color: 'var(--color-fg-neutral-secondary)' }} className="text-sm">For less emphasis</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Usage Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use semantic colors (alert, positive, etc.) instead of raw color scales when possible</li>
          <li>• Pair background and foreground colors from the same semantic group</li>
          <li>• Use "subtle" and "low" variants for large areas</li>
          <li>• Use "high" and "high-accented" variants for small, important elements</li>
          <li>• Test color combinations for sufficient contrast (WCAG AA minimum)</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world examples of using semantic colors in UI components.',
      },
    },
  },
};
