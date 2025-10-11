import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Primitives/Dimensions',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Dimensions Primitive Tokens

Raw dimension values that serve as the foundation for all spacing and sizing in the design system.

## What are Primitives?

Primitive tokens are the lowest-level design tokens in our system. They represent raw, reusable values that are referenced by semantic tokens. Think of them as the "atoms" of our design system.

**Important**: In most cases, you should use semantic tokens (like \`--dimension-space-around-md\` or \`--dimension-space-between-related-md\`) instead of primitives. Only use primitive tokens when:
- Creating new semantic tokens
- Handling edge cases not covered by semantic tokens
- Building foundation-level components

## Available Primitive Dimensions

Our dimension primitives follow a T-shirt sizing scale from 0 to 1200, plus negative values for special cases like negative margins.

| Token | Value | Usage |
|-------|-------|-------|
| \`--dimension-space-0\` | 0px | Zero spacing (auto-added for semantic tokens) |
| \`--dimension-space-25\` | 2px | Micro spacing |
| \`--dimension-space-50\` | 4px | Tiny spacing |
| \`--dimension-space-75\` | 6px | Extra small spacing |
| \`--dimension-space-100\` | 8px | Small spacing |
| \`--dimension-space-125\` | 10px | Small-medium spacing |
| \`--dimension-space-150\` | 12px | Medium-small spacing |
| \`--dimension-space-200\` | 16px | Medium spacing |
| \`--dimension-space-250\` | 20px | Medium-large spacing |
| \`--dimension-space-300\` | 24px | Large spacing |
| \`--dimension-space-400\` | 32px | Extra large spacing |
| \`--dimension-space-500\` | 40px | XXL spacing |
| \`--dimension-space-550\` | 44px | XXL+ spacing |
| \`--dimension-space-600\` | 48px | XXXL spacing |
| \`--dimension-space-700\` | 56px | Huge spacing |
| \`--dimension-space-800\` | 64px | Massive spacing |
| \`--dimension-space-900\` | 72px | Giant spacing |
| \`--dimension-space-1000\` | 80px | Enormous spacing |
| \`--dimension-space-1200\` | 96px | Maximum spacing |

## Negative Dimensions

Negative dimensions are used for overlapping elements and negative margins.

| Token | Value |
|-------|-------|
| \`--dimension-space-negative-25\` | -2px |
| \`--dimension-space-negative-50\` | -4px |
| \`--dimension-space-negative-100\` | -8px |
| \`--dimension-space-negative-200\` | -16px |
| \`--dimension-space-negative-300\` | -24px |

## Usage

\`\`\`tsx
// ❌ Avoid using primitives directly in components
<div style={{ padding: 'var(--dimension-space-200)' }}>
  Content
</div>

// ✅ Use semantic tokens instead
<div style={{ padding: 'var(--dimension-space-around-medium)' }}>
  Content
</div>

// ✅ Use primitives when creating new semantic tokens
// In your token definition file:
{
  "dimension": {
    "space": {
      "around": {
        "custom": { "value": "{dimension.space.300}" }
      }
    }
  }
}
\`\`\`

## Scale Philosophy

The scale follows a hybrid approach:
- **0-200**: Fine-grained control with smaller increments for precise UI spacing
- **200-600**: Regular increments for common spacing needs
- **600-1200**: Larger jumps for macro layouts and page structure
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const DimensionDemo = ({
  token,
  value,
  description,
}: {
  token: string;
  value: string;
  description: string;
}) => (
  <div className="flex items-center gap-6 p-4 border-b border-[var(--color-bg-neutral-low)]">
    <div className="w-48 flex-shrink-0">
      <div className="text-sm font-semibold text-[var(--color-fg-neutral-primary)] mb-1 font-mono">
        {token}
      </div>
      <div className="text-xs text-[var(--color-fg-neutral-secondary)]">
        {value}
      </div>
    </div>
    <div className="flex items-center gap-3 flex-1">
      <div
        className="bg-[var(--color-bg-information-high)] h-8"
        style={{ width: `var(${token})` }}
      />
      <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
        {description}
      </span>
    </div>
  </div>
);

export const AllDimensions: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Complete Dimension Scale
      </h2>
      <div className="space-y-2">
        <DimensionDemo
          token="--dimension-space-0"
          value="0px"
          description="Zero spacing (baseline)"
        />
        <DimensionDemo
          token="--dimension-space-25"
          value="2px"
          description="Micro spacing for fine adjustments"
        />
        <DimensionDemo
          token="--dimension-space-50"
          value="4px"
          description="Tiny spacing for tight layouts"
        />
        <DimensionDemo
          token="--dimension-space-75"
          value="6px"
          description="Extra small spacing"
        />
        <DimensionDemo
          token="--dimension-space-100"
          value="8px"
          description="Small spacing for compact UIs"
        />
        <DimensionDemo
          token="--dimension-space-125"
          value="10px"
          description="Small-medium spacing"
        />
        <DimensionDemo
          token="--dimension-space-150"
          value="12px"
          description="Medium-small spacing"
        />
        <DimensionDemo
          token="--dimension-space-200"
          value="16px"
          description="Medium spacing - most common"
        />
        <DimensionDemo
          token="--dimension-space-250"
          value="20px"
          description="Medium-large spacing"
        />
        <DimensionDemo
          token="--dimension-space-300"
          value="24px"
          description="Large spacing for section breaks"
        />
        <DimensionDemo
          token="--dimension-space-400"
          value="32px"
          description="Extra large spacing"
        />
        <DimensionDemo
          token="--dimension-space-500"
          value="40px"
          description="XXL spacing for major sections"
        />
        <DimensionDemo
          token="--dimension-space-550"
          value="44px"
          description="XXL+ spacing"
        />
        <DimensionDemo
          token="--dimension-space-600"
          value="48px"
          description="XXXL spacing"
        />
        <DimensionDemo
          token="--dimension-space-700"
          value="56px"
          description="Huge spacing for page structure"
        />
        <DimensionDemo
          token="--dimension-space-800"
          value="64px"
          description="Massive spacing"
        />
        <DimensionDemo
          token="--dimension-space-900"
          value="72px"
          description="Giant spacing for hero sections"
        />
        <DimensionDemo
          token="--dimension-space-1000"
          value="80px"
          description="Enormous spacing"
        />
        <DimensionDemo
          token="--dimension-space-1200"
          value="96px"
          description="Maximum spacing for major layout gaps"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete scale of dimension primitives from 0px to 96px.',
      },
    },
  },
};

export const NegativeDimensions: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Negative Dimensions
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
        Used for overlapping elements, negative margins, and positioning adjustments.
      </p>
      <div className="space-y-2">
        <DimensionDemo
          token="--dimension-space-negative-25"
          value="-2px"
          description="Micro negative adjustment"
        />
        <DimensionDemo
          token="--dimension-space-negative-50"
          value="-4px"
          description="Small negative adjustment"
        />
        <DimensionDemo
          token="--dimension-space-negative-100"
          value="-8px"
          description="Medium negative adjustment"
        />
        <DimensionDemo
          token="--dimension-space-negative-200"
          value="-16px"
          description="Large negative adjustment"
        />
        <DimensionDemo
          token="--dimension-space-negative-300"
          value="-24px"
          description="Extra large negative adjustment"
        />
      </div>

      <div
        className="mt-8 p-6 bg-[var(--color-bg-attention-subtle)] border-l-4 border-[var(--color-bg-attention-high)] rounded"
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-attention-primary)]">
          Negative Dimension Use Cases
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-fg-attention-secondary)]">
          <li>• Overlapping avatars in a stack</li>
          <li>• Pulling elements closer together than their natural spacing</li>
          <li>• Fine-tuning alignment of icons with text</li>
          <li>• Creating negative space effects</li>
          <li>• Compensating for optical alignment issues</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Negative dimension values for special positioning cases.',
      },
    },
  },
};

export const ScaleComparison: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Scale Comparison
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-8">
        Visual comparison of key dimensions in the scale. Notice how the increments grow larger at higher values.
      </p>
      <div className="space-y-4">
        {[
          { token: '--dimension-space-50', label: '4px', color: 'bg-[var(--color-bg-positive-high)]' },
          { token: '--dimension-space-100', label: '8px', color: 'bg-[var(--color-bg-information-high)]' },
          { token: '--dimension-space-150', label: '12px', color: 'bg-[var(--color-bg-accent-high)]' },
          { token: '--dimension-space-200', label: '16px', color: 'bg-[var(--color-bg-attention-high)]' },
          { token: '--dimension-space-300', label: '24px', color: 'bg-[var(--color-bg-alert-high)]' },
          { token: '--dimension-space-400', label: '32px', color: 'bg-[var(--color-bg-positive-high)]' },
          { token: '--dimension-space-600', label: '48px', color: 'bg-[var(--color-bg-information-high)]' },
          { token: '--dimension-space-800', label: '64px', color: 'bg-[var(--color-bg-accent-high)]' },
          { token: '--dimension-space-1200', label: '96px', color: 'bg-[var(--color-bg-neutral-medium)]' },
        ].map(({ token, label, color }) => (
          <div key={token} className="flex items-center gap-4">
            <div className="w-16 text-xs font-mono text-[var(--color-fg-neutral-secondary)]">
              {label}
            </div>
            <div
              className={`h-8 rounded ${color}`}
              style={{ width: `var(${token})` }}
            />
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of commonly used dimension values.',
      },
    },
  },
};

export const SemanticTokenMapping: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        How Primitives Map to Semantic Tokens
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-8">
        Examples showing how primitive dimensions are referenced by semantic tokens.
      </p>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Space Between (Gap) Tokens
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-between-coupled
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-50 (4px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-between-repeating-sm
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-75 (6px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-between-repeating-md
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-100 (8px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-between-related-sm
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-100 (8px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-between-related-md
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-200 (16px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-between-separated
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-300 (24px)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Space Around (Padding) Tokens
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-around-4xs
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-25 (2px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-around-3xs
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-50 (4px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-around-2xs
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-75 (6px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-around-xs
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-100 (8px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-around-sm
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-150 (12px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-around-md
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-200 (16px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-space-around-lg
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-250 (20px)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Border Radius Tokens
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-radius-none
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-0 (0px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-radius-xs
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-50 (4px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-radius-sm
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-100 (8px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-radius-md
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-200 (16px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-radius-lg
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-300 (24px)
                </span>
              </div>
            </div>
            <div className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded border border-[var(--color-bg-neutral-low)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">
                  --dimension-radius-xl
                </span>
                <span className="text-xs text-[var(--color-fg-neutral-secondary)]">
                  uses
                </span>
                <span className="text-sm font-mono text-[var(--color-fg-information-primary)]">
                  --dimension-space-400 (32px)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-8 p-6 bg-[var(--color-bg-accent-subtle)] border-l-4 border-[var(--color-bg-accent-high)] rounded"
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-accent-primary)]">
          Token Architecture
        </h3>
        <p className="text-sm text-[var(--color-fg-accent-secondary)] mb-3">
          Our token system follows a three-tier architecture:
        </p>
        <ol className="space-y-2 text-sm text-[var(--color-fg-accent-secondary)] list-decimal list-inside">
          <li><strong>Primitives</strong> - Raw values (this page)</li>
          <li><strong>Semantic Tokens</strong> - Purpose-driven tokens that reference primitives</li>
          <li><strong>Component Tokens</strong> - Component-specific tokens that reference semantic tokens</li>
        </ol>
        <p className="text-sm text-[var(--color-fg-accent-secondary)] mt-3">
          This separation allows us to update the entire design system by changing primitive values in one place.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows how primitive dimensions are referenced by higher-level semantic tokens.',
      },
    },
  },
};
