import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { Input } from '@/design-system/components/Input';
import { Pill } from '@/design-system/components/Pill';

const meta: Meta = {
  title: 'Design System/Semantics/Border Radius',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Border Radius Tokens

Semantic border radius tokens for consistent rounded corners across the design system.

## Available Tokens (6)

| Token | Value | Use Case |
|-------|-------|----------|
| \`--dimension-radius-none\` | 0px | No rounding (square corners) |
| \`--dimension-radius-xs\` | 4px | Minimal rounding for small elements |
| \`--dimension-radius-sm\` | 8px | Subtle rounding for buttons, inputs |
| \`--dimension-radius-md\` | 16px | Standard card rounding |
| \`--dimension-radius-lg\` | 24px | Prominent rounding for large cards |
| \`--dimension-radius-xl\` | 32px | Maximum rounding for hero sections |

## Usage

\`\`\`tsx
// Using CSS variables with Tailwind
<div className="rounded-[var(--dimension-radius-md)]">
  Standard card with 16px radius
</div>

// In inline styles
<div style={{ borderRadius: 'var(--dimension-radius-sm)' }}>
  Button with 8px radius
</div>
\`\`\`

## Design Principles

- **Consistency**: Use semantic tokens instead of arbitrary values
- **Hierarchy**: Larger elements use larger radius values
- **Purpose**: Radius should match the visual weight of the element
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const RadiusDemo = ({
  token,
  value,
  description,
}: {
  token: string;
  value: string;
  description: string;
}) => (
  <div className="flex items-center gap-6 p-4 border-b border-[var(--color-bg-neutral-low)]">
    <div className="w-40 flex-shrink-0">
      <div className="text-sm font-semibold text-[var(--color-fg-neutral-primary)] mb-1">
        {token}
      </div>
      <div className="text-xs text-[var(--color-fg-neutral-secondary)]">
        {value}
      </div>
    </div>
    <div
      className="w-24 h-24 bg-[var(--color-bg-positive-high)]"
      style={{ borderRadius: `var(${token})` }}
    />
    <p className="text-sm text-[var(--color-fg-neutral-secondary)] flex-1">
      {description}
    </p>
  </div>
);

export const AllRadii: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Border Radius Scale
      </h2>
      <div className="space-y-2">
        <RadiusDemo
          token="--dimension-radius-none"
          value="0px"
          description="No rounding - sharp corners for strict, formal elements"
        />
        <RadiusDemo
          token="--dimension-radius-xs"
          value="4px"
          description="Minimal rounding - badges, pills, small chips"
        />
        <RadiusDemo
          token="--dimension-radius-sm"
          value="8px"
          description="Subtle rounding - buttons, inputs, small cards"
        />
        <RadiusDemo
          token="--dimension-radius-md"
          value="16px"
          description="Standard rounding - default cards, modals, dropdowns"
        />
        <RadiusDemo
          token="--dimension-radius-lg"
          value="24px"
          description="Prominent rounding - featured cards, large containers"
        />
        <RadiusDemo
          token="--dimension-radius-xl"
          value="32px"
          description="Maximum rounding - hero sections, image containers"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete scale of border radius tokens from none (0px) to x-large (32px).',
      },
    },
  },
};

export const UsageExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8 bg-[var(--color-bg-neutral-base)]">
      <div>
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
          Real-World Usage Examples
        </h2>
      </div>

      {/* Pills/Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Pills & Badges (radius-x-small for xs size, radius-small for sm/md)
        </h3>
        <div className="flex gap-2 items-center">
          <Pill
            type="positive"
            size="x-small"
            label="Tiny"
          />
          <Pill
            type="info"
            size="small"
            label="Small"
          />
          <Pill
            type="alert"
            size="medium"
            label="Medium"
          />
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
          Pills use radius-xs (4px) for x-small size, radius-sm (8px) for small/medium sizes
        </p>
      </div>

      {/* Input Fields */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Input Fields (radius-small)
        </h3>
        <Input
          type="outlined"
          size="medium"
          placeholder="Enter your email..."
          className="w-full max-w-md"
        />
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
          Inputs use radius-sm (8px) for subtle rounding
        </p>
      </div>

      {/* Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Cards (radius-small for small size, radius-medium for medium size)
        </h3>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <Card size="small" variant="non-interactive">
            <h4 className="font-semibold text-[var(--color-fg-neutral-primary)]">
              Small Card
            </h4>
            <p className="text-sm text-[var(--color-fg-neutral-secondary)]">
              Small cards use radius-sm (8px)
            </p>
          </Card>
          <Card size="medium" variant="non-interactive">
            <h4 className="font-semibold text-[var(--color-fg-neutral-primary)]">
              Medium Card
            </h4>
            <p className="text-sm text-[var(--color-fg-neutral-secondary)]">
              Medium cards use radius-md (16px) for balanced appearance
            </p>
          </Card>
        </div>
      </div>

      {/* Buttons */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Buttons (fully rounded - not using radius tokens)
        </h3>
        <div className="flex gap-3">
          <Button
            type="generative"
            size="small"
            label="Primary"
          />
          <Button
            type="outlined"
            size="small"
            label="Secondary"
          />
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
          Buttons use rounded-full (pill shape) instead of semantic radius tokens
        </p>
      </div>

      {/* Large Radius Containers */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Large Containers (radius-large)
        </h3>
        <div
          className="p-8 bg-gradient-to-br from-[var(--color-bg-accent-subtle)] to-[var(--color-bg-information-subtle)]"
          style={{ borderRadius: 'var(--dimension-radius-lg)' }}
        >
          <h2 className="text-xl font-bold text-[var(--color-fg-neutral-primary)] mb-2">
            Featured Section
          </h2>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)]">
            Large radius (24px) creates a friendly, approachable feeling for hero sections and featured content.
          </p>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
          Use radius-lg (24px) for prominent sections and large containers
        </p>
      </div>

      {/* Extra Large Radius Containers */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Hero Sections (radius-x-large)
        </h3>
        <div
          className="p-12 bg-gradient-to-br from-[var(--color-bg-positive-subtle)] to-[var(--color-bg-accent-subtle)]"
          style={{ borderRadius: 'var(--dimension-radius-xl)' }}
        >
          <h2 className="text-3xl font-bold text-[var(--color-fg-neutral-primary)] mb-4">
            Welcome to Clinic Planner
          </h2>
          <p className="text-lg text-[var(--color-fg-neutral-secondary)] mb-6 max-w-2xl">
            Extra-large radius (32px) creates maximum visual softness for hero banners and showcase areas.
          </p>
          <Button
            type="generative"
            size="medium"
            label="Get Started"
          />
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
          Use radius-xl (32px) for hero sections and maximum visual impact
        </p>
      </div>

      {/* Best Practices */}
      <div
        className="p-6 bg-[var(--color-bg-accent-subtle)] border-l-4 border-[var(--color-bg-accent-high)]"
        style={{ borderRadius: 'var(--dimension-radius-sm)' }}
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-accent-primary)]">
          Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-fg-accent-secondary)]">
          <li>• Use <code className="bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded font-mono">radius-small</code> for interactive elements (buttons, inputs)</li>
          <li>• Use <code className="bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded font-mono">radius-medium</code> as the default for cards and containers</li>
          <li>• Use <code className="bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded font-mono">radius-large</code> sparingly for hero sections and featured content</li>
          <li>• Maintain consistency - don't mix arbitrary radius values with semantic tokens</li>
          <li>• Smaller elements (badges, pills) use smaller radius values</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common UI patterns using border radius tokens in context.',
      },
    },
  },
};

export const Comparison: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Side-by-Side Comparison
      </h2>
      <div className="grid grid-cols-3 gap-6">
        {[
          { token: '--dimension-radius-xs', label: 'X-Small (4px)' },
          { token: '--dimension-radius-sm', label: 'Small (8px)' },
          { token: '--dimension-radius-md', label: 'Medium (16px)' },
          { token: '--dimension-radius-lg', label: 'Large (24px)' },
          { token: '--dimension-radius-xl', label: 'X-Large (32px)' },
          { token: '--dimension-radius-none', label: 'None (0px)' },
        ].map(({ token, label }) => (
          <div key={token} className="text-center">
            <div
              className="w-full h-32 bg-[var(--color-bg-information-high)] mx-auto mb-3"
              style={{ borderRadius: `var(${token})` }}
            />
            <div className="text-sm font-semibold text-[var(--color-fg-neutral-primary)]">
              {label}
            </div>
            <div className="text-xs text-[var(--color-fg-neutral-secondary)] font-mono">
              {token}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Visual comparison of all border radius values.',
      },
    },
  },
};
