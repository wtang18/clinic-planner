import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Primitives/Elevation',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Elevation Primitive Tokens

Raw shadow property values that serve as the building blocks for creating elevation effects in the design system.

## What are Elevation Primitives?

Elevation primitives are the lowest-level tokens for creating shadows and depth. They represent individual shadow properties:
- **Offset** (X and Y) - How far the shadow moves from the element
- **Blur** - How soft the shadow edges are
- **Spread** - How much the shadow grows or shrinks
- **Color** - The shadow color with specific opacity

## Why Primitives?

Box shadows in CSS require multiple properties: \`box-shadow: x-offset y-offset blur spread color\`. By breaking these into primitive tokens, we can:
- Mix and match properties to create custom shadows
- Reference specific values consistently
- Build semantic elevation tokens from primitives

**Important**: In most cases, use semantic elevation tokens (like \`--elevation-low\`) instead of composing shadows from primitives. Only use primitives when creating new semantic elevation levels.

## Shadow Offset Primitives

Control how far the shadow moves from the element.

| Token | Value | Description |
|-------|-------|-------------|
| \`--elevation-shadow-x-0\` | 0px | No horizontal offset |
| \`--elevation-shadow-x-1\` | 2px | Minimal horizontal offset |
| \`--elevation-shadow-y-0\` | 0px | No vertical offset |
| \`--elevation-shadow-y-1\` | 2px | Very subtle lift |
| \`--elevation-shadow-y-2\` | 4px | Subtle lift |
| \`--elevation-shadow-y-3\` | 6px | Small lift |
| \`--elevation-shadow-y-4\` | 8px | Medium lift |
| \`--elevation-shadow-y-6\` | 12px | Noticeable lift |
| \`--elevation-shadow-y-8\` | 16px | Elevated |
| \`--elevation-shadow-y-12\` | 24px | High elevation |
| \`--elevation-shadow-y-16\` | 32px | Very high elevation |
| \`--elevation-shadow-y-20\` | 40px | Maximum elevation |

## Shadow Blur Primitives

Control the softness of shadow edges.

| Token | Value | Description |
|-------|-------|-------------|
| \`--elevation-shadow-blur-0\` | 0px | No blur (sharp shadow) |
| \`--elevation-shadow-blur-2\` | 2px | Minimal blur |
| \`--elevation-shadow-blur-4\` | 4px | Subtle blur |
| \`--elevation-shadow-blur-6\` | 6px | Small blur |
| \`--elevation-shadow-blur-8\` | 8px | Medium blur |
| \`--elevation-shadow-blur-12\` | 12px | Noticeable blur |
| \`--elevation-shadow-blur-16\` | 16px | Large blur |
| \`--elevation-shadow-blur-20\` | 20px | Very large blur |
| \`--elevation-shadow-blur-24\` | 24px | Extra large blur |
| \`--elevation-shadow-blur-32\` | 32px | Dramatic blur |
| \`--elevation-shadow-blur-40\` | 40px | Maximum blur |

## Shadow Spread Primitives

Control the size of the shadow.

| Token | Value | Description |
|-------|-------|-------------|
| \`--elevation-shadow-spread-0\` | 0px | No spread |
| \`--elevation-shadow-spread-2\` | 2px | Slight outward spread |
| \`--elevation-shadow-spread-4\` | 4px | Outward spread |
| \`--elevation-shadow-spread-negative-2\` | -2px | Slight inward spread |
| \`--elevation-shadow-spread-negative-4\` | -4px | Inward spread |

## Shadow Color Primitives

Pre-defined shadow colors with specific opacity levels.

| Token | Opacity | Use Case |
|-------|---------|----------|
| \`--elevation-shadow-color-subtle\` | 5% | Very subtle shadows for flat designs |
| \`--elevation-shadow-color-soft\` | 6% | Soft shadows for minimal elevation |
| \`--elevation-shadow-color-default\` | 12% | Default shadow for most use cases |
| \`--elevation-shadow-color-medium\` | 24% | Medium shadow for moderate elevation |
| \`--elevation-shadow-color-strong\` | 36% | Strong shadow for high elevation |

## Composing Shadows from Primitives

\`\`\`tsx
// Example: Creating a custom elevation level
const customElevation = \`
  0
  var(--elevation-shadow-y-4)
  var(--elevation-shadow-blur-8)
  var(--elevation-shadow-spread-0)
  var(--elevation-shadow-color-default)
\`;

<div style={{ boxShadow: customElevation }}>
  Custom elevated element
</div>

// ✅ Better: Use semantic elevation tokens
<div style={{ boxShadow: 'var(--elevation-medium)' }}>
  Semantically elevated element
</div>
\`\`\`

## Design Principles

- **Natural Light**: Shadows cast downward (positive Y offset) simulate overhead lighting
- **Larger = Softer**: Higher elevations use larger blur values for realism
- **Spread Sparingly**: Spread is rarely needed; blur usually achieves the desired effect
- **Consistent Colors**: Stick to the shadow color primitives for opacity consistency
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const ShadowOffsetDemo = ({
  token,
  value,
  description,
}: {
  token: string;
  value: string;
  description: string;
}) => (
  <div className="flex items-center gap-6 p-4 border-b border-[var(--color-bg-neutral-low)]">
    <div className="w-56 flex-shrink-0">
      <div className="text-sm font-semibold text-[var(--color-fg-neutral-primary)] mb-1 font-mono text-xs">
        {token}
      </div>
      <div className="text-xs text-[var(--color-fg-neutral-secondary)]">
        {value}
      </div>
    </div>
    <div
      className="w-24 h-24 bg-white rounded-lg"
      style={{
        boxShadow: `0 var(${token}) 8px 0 rgba(0, 0, 0, 0.12)`,
      }}
    />
    <p className="text-xs text-[var(--color-fg-neutral-secondary)] flex-1">
      {description}
    </p>
  </div>
);

const ShadowBlurDemo = ({
  token,
  value,
  description,
}: {
  token: string;
  value: string;
  description: string;
}) => (
  <div className="flex items-center gap-6 p-4 border-b border-[var(--color-bg-neutral-low)]">
    <div className="w-56 flex-shrink-0">
      <div className="text-sm font-semibold text-[var(--color-fg-neutral-primary)] mb-1 font-mono text-xs">
        {token}
      </div>
      <div className="text-xs text-[var(--color-fg-neutral-secondary)]">
        {value}
      </div>
    </div>
    <div
      className="w-24 h-24 bg-white rounded-lg"
      style={{
        boxShadow: `0 4px var(${token}) 0 rgba(0, 0, 0, 0.12)`,
      }}
    />
    <p className="text-xs text-[var(--color-fg-neutral-secondary)] flex-1">
      {description}
    </p>
  </div>
);

export const ShadowOffsets: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Shadow Offset Primitives
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
        Y-offset determines how far the shadow is cast downward, simulating the height of the element.
      </p>
      <div className="space-y-2">
        <ShadowOffsetDemo
          token="--elevation-shadow-y-0"
          value="0px"
          description="No shadow (flat)"
        />
        <ShadowOffsetDemo
          token="--elevation-shadow-y-1"
          value="2px"
          description="Very subtle lift, barely visible"
        />
        <ShadowOffsetDemo
          token="--elevation-shadow-y-2"
          value="4px"
          description="Subtle lift for hover states"
        />
        <ShadowOffsetDemo
          token="--elevation-shadow-y-3"
          value="6px"
          description="Small lift for cards"
        />
        <ShadowOffsetDemo
          token="--elevation-shadow-y-4"
          value="8px"
          description="Medium lift for elevated cards"
        />
        <ShadowOffsetDemo
          token="--elevation-shadow-y-6"
          value="12px"
          description="Noticeable lift for floating elements"
        />
        <ShadowOffsetDemo
          token="--elevation-shadow-y-8"
          value="16px"
          description="Elevated dropdowns and popovers"
        />
        <ShadowOffsetDemo
          token="--elevation-shadow-y-12"
          value="24px"
          description="High elevation for modals"
        />
        <ShadowOffsetDemo
          token="--elevation-shadow-y-16"
          value="32px"
          description="Very high elevation"
        />
        <ShadowOffsetDemo
          token="--elevation-shadow-y-20"
          value="40px"
          description="Maximum elevation for top-level dialogs"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Y-offset values determine the perceived height of elevated elements.',
      },
    },
  },
};

export const ShadowBlurs: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Shadow Blur Primitives
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
        Blur creates soft edges on shadows. Larger blur values make shadows appear more diffused and natural.
      </p>
      <div className="space-y-2">
        <ShadowBlurDemo
          token="--elevation-shadow-blur-0"
          value="0px"
          description="Sharp shadow (no blur)"
        />
        <ShadowBlurDemo
          token="--elevation-shadow-blur-2"
          value="2px"
          description="Minimal blur"
        />
        <ShadowBlurDemo
          token="--elevation-shadow-blur-4"
          value="4px"
          description="Subtle blur"
        />
        <ShadowBlurDemo
          token="--elevation-shadow-blur-6"
          value="6px"
          description="Small blur"
        />
        <ShadowBlurDemo
          token="--elevation-shadow-blur-8"
          value="8px"
          description="Medium blur (most common)"
        />
        <ShadowBlurDemo
          token="--elevation-shadow-blur-12"
          value="12px"
          description="Noticeable blur"
        />
        <ShadowBlurDemo
          token="--elevation-shadow-blur-16"
          value="16px"
          description="Large blur for high elevation"
        />
        <ShadowBlurDemo
          token="--elevation-shadow-blur-20"
          value="20px"
          description="Very large blur"
        />
        <ShadowBlurDemo
          token="--elevation-shadow-blur-24"
          value="24px"
          description="Extra large blur"
        />
        <ShadowBlurDemo
          token="--elevation-shadow-blur-32"
          value="32px"
          description="Dramatic blur for modals"
        />
        <ShadowBlurDemo
          token="--elevation-shadow-blur-40"
          value="40px"
          description="Maximum blur for hero elements"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Blur values control the softness and diffusion of shadow edges.',
      },
    },
  },
};

export const ShadowColors: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Shadow Color Primitives
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
        Pre-defined black alpha values for consistent shadow opacity across the design system.
      </p>
      <div className="grid grid-cols-2 gap-6">
        {[
          { token: '--elevation-shadow-color-subtle', opacity: '5%', description: 'Very subtle shadows for minimal elevation' },
          { token: '--elevation-shadow-color-soft', opacity: '6%', description: 'Soft shadows for subtle lift' },
          { token: '--elevation-shadow-color-default', opacity: '12%', description: 'Default shadow for most use cases' },
          { token: '--elevation-shadow-color-medium', opacity: '24%', description: 'Medium shadow for noticeable elevation' },
          { token: '--elevation-shadow-color-strong', opacity: '36%', description: 'Strong shadow for high elevation' },
        ].map(({ token, opacity, description }) => (
          <div key={token} className="space-y-3">
            <div>
              <div className="text-sm font-semibold text-[var(--color-fg-neutral-primary)] mb-1 font-mono">
                {token}
              </div>
              <div className="text-xs text-[var(--color-fg-neutral-secondary)]">
                {opacity} opacity
              </div>
            </div>
            <div
              className="w-full h-32 bg-white rounded-lg"
              style={{
                boxShadow: `0 8px 16px 0 var(${token})`,
              }}
            />
            <p className="text-xs text-[var(--color-fg-neutral-secondary)]">
              {description}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mt-8 p-6 bg-[var(--color-bg-information-subtle)] border-l-4 border-[var(--color-bg-information-high)] rounded"
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-information-primary)]">
          Why Predefined Shadow Colors?
        </h3>
        <p className="text-sm text-[var(--color-fg-information-secondary)]">
          Using consistent opacity values ensures that shadows look harmonious across the entire UI. These values have been carefully chosen to work well on white and light backgrounds while maintaining sufficient contrast.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shadow color tokens with predefined opacity levels for consistency.',
      },
    },
  },
};

export const ShadowSpread: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Shadow Spread Primitives
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
        Spread expands or contracts the shadow. Positive values make shadows larger, negative values make them smaller.
      </p>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-base font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Positive Spread (Outward)
          </h3>
          <div className="space-y-6">
            <div>
              <div className="text-sm font-mono text-[var(--color-fg-neutral-primary)] mb-3">
                --elevation-shadow-spread-2 (2px)
              </div>
              <div
                className="w-full h-32 bg-white rounded-lg"
                style={{
                  boxShadow: `0 4px 8px var(--elevation-shadow-spread-2) var(--elevation-shadow-color-default)`,
                }}
              />
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
                Shadow expands slightly beyond the blur
              </p>
            </div>
            <div>
              <div className="text-sm font-mono text-[var(--color-fg-neutral-primary)] mb-3">
                --elevation-shadow-spread-4 (4px)
              </div>
              <div
                className="w-full h-32 bg-white rounded-lg"
                style={{
                  boxShadow: `0 4px 8px var(--elevation-shadow-spread-4) var(--elevation-shadow-color-default)`,
                }}
              />
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
                Shadow expands more noticeably
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Negative Spread (Inward)
          </h3>
          <div className="space-y-6">
            <div>
              <div className="text-sm font-mono text-[var(--color-fg-neutral-primary)] mb-3">
                --elevation-shadow-spread-negative-2 (-2px)
              </div>
              <div
                className="w-full h-32 bg-white rounded-lg"
                style={{
                  boxShadow: `0 4px 8px var(--elevation-shadow-spread-negative-2) var(--elevation-shadow-color-default)`,
                }}
              />
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
                Shadow contracts slightly, creating tighter shadow
              </p>
            </div>
            <div>
              <div className="text-sm font-mono text-[var(--color-fg-neutral-primary)] mb-3">
                --elevation-shadow-spread-negative-4 (-4px)
              </div>
              <div
                className="w-full h-32 bg-white rounded-lg"
                style={{
                  boxShadow: `0 4px 8px var(--elevation-shadow-spread-negative-4) var(--elevation-shadow-color-default)`,
                }}
              />
              <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
                Shadow contracts more, useful for inset effects
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-8 p-6 bg-[var(--color-bg-attention-subtle)] border-l-4 border-[var(--color-bg-attention-high)] rounded"
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-attention-primary)]">
          When to Use Spread
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-fg-attention-secondary)]">
          <li>• Spread is rarely needed - blur usually achieves the desired effect</li>
          <li>• Positive spread: For creating borders or halos around elements</li>
          <li>• Negative spread: For creating tighter, more focused shadows</li>
          <li>• In most cases, leave spread at 0 and adjust blur instead</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spread values that expand or contract the shadow size.',
      },
    },
  },
};

export const ComposingElevations: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Composing Shadows from Primitives
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-8">
        Examples showing how primitive tokens combine to create elevation effects. Remember: use semantic tokens in production!
      </p>

      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
              Low Elevation (Hover State)
            </h3>
            <div
              className="w-full h-40 bg-white rounded-lg flex items-center justify-center"
              style={{
                boxShadow: `
                  var(--elevation-shadow-x-0)
                  var(--elevation-shadow-y-2)
                  var(--elevation-shadow-blur-4)
                  var(--elevation-shadow-spread-0)
                  var(--elevation-shadow-color-soft)
                `,
              }}
            >
              <div className="text-center">
                <div className="text-sm font-mono text-gray-600 mb-2">
                  Y: 4px, Blur: 4px
                </div>
                <div className="text-xs text-gray-500">Color: soft (6% opacity)</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
              Medium Elevation (Card)
            </h3>
            <div
              className="w-full h-40 bg-white rounded-lg flex items-center justify-center"
              style={{
                boxShadow: `
                  var(--elevation-shadow-x-0)
                  var(--elevation-shadow-y-4)
                  var(--elevation-shadow-blur-8)
                  var(--elevation-shadow-spread-0)
                  var(--elevation-shadow-color-default)
                `,
              }}
            >
              <div className="text-center">
                <div className="text-sm font-mono text-gray-600 mb-2">
                  Y: 8px, Blur: 8px
                </div>
                <div className="text-xs text-gray-500">Color: default (12% opacity)</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
              High Elevation (Dropdown)
            </h3>
            <div
              className="w-full h-40 bg-white rounded-lg flex items-center justify-center"
              style={{
                boxShadow: `
                  var(--elevation-shadow-x-0)
                  var(--elevation-shadow-y-8)
                  var(--elevation-shadow-blur-16)
                  var(--elevation-shadow-spread-0)
                  var(--elevation-shadow-color-medium)
                `,
              }}
            >
              <div className="text-center">
                <div className="text-sm font-mono text-gray-600 mb-2">
                  Y: 16px, Blur: 16px
                </div>
                <div className="text-xs text-gray-500">Color: medium (24% opacity)</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
              Very High Elevation (Modal)
            </h3>
            <div
              className="w-full h-40 bg-white rounded-lg flex items-center justify-center"
              style={{
                boxShadow: `
                  var(--elevation-shadow-x-0)
                  var(--elevation-shadow-y-12)
                  var(--elevation-shadow-blur-24)
                  var(--elevation-shadow-spread-0)
                  var(--elevation-shadow-color-strong)
                `,
              }}
            >
              <div className="text-center">
                <div className="text-sm font-mono text-gray-600 mb-2">
                  Y: 24px, Blur: 24px
                </div>
                <div className="text-xs text-gray-500">Color: strong (36% opacity)</div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="p-6 bg-[var(--color-bg-accent-subtle)] border-l-4 border-[var(--color-bg-accent-high)] rounded"
        >
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-accent-primary)]">
            Elevation Formula
          </h3>
          <p className="text-sm text-[var(--color-fg-accent-secondary)] mb-3">
            Notice the pattern: as elevation increases, both Y-offset and blur increase proportionally, while opacity also increases to maintain shadow visibility.
          </p>
          <div className="text-xs font-mono bg-white p-3 rounded text-gray-700">
            box-shadow: [x-offset] [y-offset] [blur] [spread] [color];
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'How primitive elevation tokens combine to create realistic shadow effects.',
      },
    },
  },
};
