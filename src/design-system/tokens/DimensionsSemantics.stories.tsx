import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Semantics/Dimensions',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Semantic Dimension Tokens

Purpose-driven dimension tokens that reference primitive values for consistent spacing, sizing, and border radius throughout the application.

## What are Semantic Tokens?

Semantic tokens are purpose-driven design tokens that give meaning to raw primitive values. Instead of using \`--dimension-space-200\`, you use \`--dimension-space-around-md\` which communicates intent and purpose.

**Benefits of Semantic Tokens:**
- **Meaningful Names**: Token names describe their purpose (\`space-around-md\` vs \`space-200\`)
- **Easier Refactoring**: Change the entire design system by updating semantic token references
- **Consistency**: Enforces consistent spacing patterns across the app
- **Scalability**: Add new semantic tokens without changing component code

## Token Categories

Our semantic dimensions are organized into three main categories:

### 1. Space Between (Gap/Spacing)

Tokens for gaps between elements using CSS \`gap\`, \`column-gap\`, \`row-gap\`, and margins between siblings.

### 2. Space Around (Padding)

Tokens for padding around elements using CSS \`padding\`, \`padding-inline\`, \`padding-block\`.

### 3. Border Radius

Tokens for rounded corners using CSS \`border-radius\`.

## Usage

\`\`\`tsx
// ✅ Use semantic tokens in components
<div style={{
  padding: 'var(--dimension-space-around-md)',
  gap: 'var(--dimension-space-between-related-sm)',
  borderRadius: 'var(--dimension-radius-md)'
}}>
  Content
</div>

// ❌ Avoid using primitives directly
<div style={{
  padding: 'var(--dimension-space-200)',
  gap: 'var(--dimension-space-100)',
  borderRadius: 'var(--dimension-space-200)'
}}>
  Content
</div>
\`\`\`

## Naming Convention

All semantic dimensions use abbreviated size scales:
- **4xs, 3xs, 2xs**: Extra-extra small sizes
- **xs, sm, md, lg, xl**: Standard t-shirt sizing
- **Descriptive names**: \`coupled\`, \`separated\`, \`repeating\`, \`related\` for relationship-based tokens
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const SpacingDemo = ({
  token,
  value,
  primitiveReference,
  description,
  useCase,
}: {
  token: string;
  value: string;
  primitiveReference: string;
  description: string;
  useCase?: string;
}) => (
  <div className="mb-6 p-4 bg-[var(--color-bg-neutral-subtle)] rounded-lg border border-[var(--color-bg-neutral-low)]">
    <div className="mb-3">
      <div className="text-base font-semibold text-[var(--color-fg-neutral-primary)] mb-1 font-mono">
        {token}
      </div>
      <div className="text-sm text-[var(--color-fg-neutral-secondary)] mb-1">
        {description}
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[var(--color-fg-neutral-secondary)]">Resolves to:</span>
        <code className="px-2 py-1 bg-[var(--color-bg-neutral-base)] rounded text-[var(--color-fg-information-primary)] font-mono">
          {primitiveReference}
        </code>
        <span className="text-[var(--color-fg-neutral-soft)]">({value})</span>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div
        className="bg-[var(--color-bg-information-medium)] rounded"
        style={{ width: `var(${token})`, height: '40px' }}
      />
      <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">{value}</span>
    </div>

    {useCase && (
      <div className="mt-3 p-3 bg-[var(--color-bg-information-subtle)] rounded text-xs text-[var(--color-fg-information-secondary)]">
        <strong>Use case:</strong> {useCase}
      </div>
    )}
  </div>
);

export const SpaceBetween: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">
        Space Between Tokens
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
        Use these tokens for gaps between elements (CSS \`gap\`, \`column-gap\`, \`row-gap\`) and margins between sibling elements.
      </p>

      <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
        Relationship-Based Spacing
      </h3>

      <SpacingDemo
        token="--dimension-space-between-coupled"
        value="4px"
        primitiveReference="--dimension-space-50"
        description="Tightly coupled elements"
        useCase="Icon next to text, badge next to label, or elements that should feel like a single unit"
      />

      <SpacingDemo
        token="--dimension-space-between-repeating-sm"
        value="6px"
        primitiveReference="--dimension-space-75"
        description="Small gap for repeating elements"
        useCase="Pills in a filter bar, tags, or other small repeating items"
      />

      <SpacingDemo
        token="--dimension-space-between-repeating-md"
        value="8px"
        primitiveReference="--dimension-space-100"
        description="Medium gap for repeating elements"
        useCase="Cards in a grid, list items, or medium-sized repeating elements"
      />

      <SpacingDemo
        token="--dimension-space-between-related-sm"
        value="8px"
        primitiveReference="--dimension-space-100"
        description="Small gap for related elements"
        useCase="Form fields in a compact form, related buttons in a button group"
      />

      <SpacingDemo
        token="--dimension-space-between-related-md"
        value="16px"
        primitiveReference="--dimension-space-200"
        description="Medium gap for related elements"
        useCase="Sections within a card, related form groups, or content blocks"
      />

      <SpacingDemo
        token="--dimension-space-between-separated-sm"
        value="24px"
        primitiveReference="--dimension-space-300"
        description="Small distinct separation between unrelated elements"
        useCase="Major page sections, distinct content areas, or unrelated feature groups"
      />

      <SpacingDemo
        token="--dimension-space-between-separated-md"
        value="32px"
        primitiveReference="--dimension-space-400"
        description="Medium distinct separation between unrelated elements"
        useCase="Major layout gaps, sidebar spacing, or large section breaks"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Semantic tokens for gaps and spacing between elements, organized by relationship.',
      },
    },
  },
};

export const SpaceAround: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">
        Space Around Tokens
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
        Use these tokens for padding around elements (CSS \`padding\`, \`padding-inline\`, \`padding-block\`).
      </p>

      <SpacingDemo
        token="--dimension-space-around-4xs"
        value="2px"
        primitiveReference="--dimension-space-25"
        description="Micro padding"
        useCase="Dense UI elements, tight icon buttons, or minimal spacing needs"
      />

      <SpacingDemo
        token="--dimension-space-around-3xs"
        value="4px"
        primitiveReference="--dimension-space-50"
        description="Extra-extra-small padding"
        useCase="Compact badges, small pills, or very tight containers"
      />

      <SpacingDemo
        token="--dimension-space-around-2xs"
        value="6px"
        primitiveReference="--dimension-space-75"
        description="Extra-small padding"
        useCase="Small buttons, compact list items, or tight cards"
      />

      <SpacingDemo
        token="--dimension-space-around-xs"
        value="8px"
        primitiveReference="--dimension-space-100"
        description="Extra-small padding"
        useCase="Small buttons, compact input fields, or dense cards"
      />

      <SpacingDemo
        token="--dimension-space-around-sm"
        value="12px"
        primitiveReference="--dimension-space-150"
        description="Small padding"
        useCase="Standard buttons, form inputs, or small cards"
      />

      <SpacingDemo
        token="--dimension-space-around-md"
        value="16px"
        primitiveReference="--dimension-space-200"
        description="Medium padding (most common)"
        useCase="Cards, modals, panels, or standard containers"
      />

      <SpacingDemo
        token="--dimension-space-around-lg"
        value="20px"
        primitiveReference="--dimension-space-250"
        description="Large padding"
        useCase="Large cards, hero sections, or prominent containers"
      />

      <SpacingDemo
        token="--dimension-space-around-xl"
        value="24px"
        primitiveReference="--dimension-space-300"
        description="Extra-large padding"
        useCase="Page-level padding, major containers, or spacious layouts"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Semantic tokens for padding around elements, organized by size.',
      },
    },
  },
};

export const BorderRadius: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--color-fg-neutral-primary)]">
        Border Radius Tokens
      </h2>
      <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
        Use these tokens for rounded corners (CSS \`border-radius\`).
      </p>

      <div className="space-y-6">
        {[
          {
            token: '--dimension-radius-none',
            value: '0px',
            primitive: '--dimension-space-0',
            description: 'No rounding (sharp corners)',
            useCase: 'Tables, data grids, or elements requiring sharp edges',
          },
          {
            token: '--dimension-radius-xs',
            value: '4px',
            primitive: '--dimension-space-50',
            description: 'Extra-small rounding',
            useCase: 'Small buttons, badges, tags, or tight UI elements',
          },
          {
            token: '--dimension-radius-sm',
            value: '8px',
            primitive: '--dimension-space-100',
            description: 'Small rounding',
            useCase: 'Standard buttons, inputs, or small cards',
          },
          {
            token: '--dimension-radius-md',
            value: '16px',
            primitive: '--dimension-space-200',
            description: 'Medium rounding (most common)',
            useCase: 'Cards, modals, panels, or standard containers',
          },
          {
            token: '--dimension-radius-lg',
            value: '24px',
            primitive: '--dimension-space-300',
            description: 'Large rounding',
            useCase: 'Large cards, prominent containers, or hero sections',
          },
          {
            token: '--dimension-radius-xl',
            value: '32px',
            primitive: '--dimension-space-400',
            description: 'Extra-large rounding',
            useCase: 'Pills, rounded containers, or decorative elements',
          },
        ].map(({ token, value, primitive, description, useCase }) => (
          <div
            key={token}
            className="p-4 bg-[var(--color-bg-neutral-subtle)] rounded-lg border border-[var(--color-bg-neutral-low)]"
          >
            <div className="mb-3">
              <div className="text-base font-semibold text-[var(--color-fg-neutral-primary)] mb-1 font-mono">
                {token}
              </div>
              <div className="text-sm text-[var(--color-fg-neutral-secondary)] mb-1">
                {description}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--color-fg-neutral-secondary)]">Resolves to:</span>
                <code className="px-2 py-1 bg-[var(--color-bg-neutral-base)] rounded text-[var(--color-fg-information-primary)] font-mono">
                  {primitive}
                </code>
                <span className="text-[var(--color-fg-neutral-soft)]">({value})</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="bg-[var(--color-bg-accent-medium)] w-32 h-20"
                style={{ borderRadius: `var(${token})` }}
              />
              <span className="text-sm font-mono text-[var(--color-fg-neutral-primary)]">{value}</span>
            </div>

            <div className="mt-3 p-3 bg-[var(--color-bg-information-subtle)] rounded text-xs text-[var(--color-fg-information-secondary)]">
              <strong>Use case:</strong> {useCase}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Semantic tokens for border radius, from sharp corners to fully rounded.',
      },
    },
  },
};

export const UsageExamples: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Usage Examples
      </h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Button Component
          </h3>
          <div className="p-4 bg-[var(--color-bg-neutral-max)] rounded-lg border border-[var(--color-bg-neutral-low)]">
            <pre className="text-xs text-[var(--color-fg-neutral-primary)] font-mono overflow-x-auto">
{`// Component using semantic dimensions
<button style={{
  padding: 'var(--dimension-space-around-sm)',
  borderRadius: 'var(--dimension-radius-sm)',
  gap: 'var(--dimension-space-between-coupled)'
}}>
  <Icon />
  Button Text
</button>`}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Card Component
          </h3>
          <div className="p-4 bg-[var(--color-bg-neutral-max)] rounded-lg border border-[var(--color-bg-neutral-low)]">
            <pre className="text-xs text-[var(--color-fg-neutral-primary)] font-mono overflow-x-auto">
{`// Card with semantic spacing
<div style={{
  padding: 'var(--dimension-space-around-md)',
  borderRadius: 'var(--dimension-radius-md)',
  gap: 'var(--dimension-space-between-related-md)'
}}>
  <h3>Card Title</h3>
  <p>Card content with proper spacing</p>
  <div style={{ gap: 'var(--dimension-space-between-related-sm)' }}>
    <button>Action 1</button>
    <button>Action 2</button>
  </div>
</div>`}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Form Layout
          </h3>
          <div className="p-4 bg-[var(--color-bg-neutral-max)] rounded-lg border border-[var(--color-bg-neutral-low)]">
            <pre className="text-xs text-[var(--color-fg-neutral-primary)] font-mono overflow-x-auto">
{`// Form with semantic spacing
<form style={{ gap: 'var(--dimension-space-between-related-md)' }}>
  <div style={{ gap: 'var(--dimension-space-between-coupled)' }}>
    <label>Email</label>
    <input style={{
      padding: 'var(--dimension-space-around-sm)',
      borderRadius: 'var(--dimension-radius-sm)'
    }} />
  </div>
  <div style={{ gap: 'var(--dimension-space-between-coupled)' }}>
    <label>Password</label>
    <input style={{
      padding: 'var(--dimension-space-around-sm)',
      borderRadius: 'var(--dimension-radius-sm)'
    }} />
  </div>
</form>`}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-[var(--color-bg-positive-subtle)] border-l-4 border-[var(--color-bg-positive-high)] rounded">
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-positive-primary)]">
          Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-fg-positive-secondary)]">
          <li>✅ Always use semantic tokens in component styles</li>
          <li>✅ Choose tokens based on purpose, not just size</li>
          <li>✅ Use \`space-between-coupled\` for icon + text combinations</li>
          <li>✅ Use \`space-between-related-*\` for form fields and related content</li>
          <li>✅ Use \`space-around-md\` as your default padding</li>
          <li>✅ Match border radius size to element size (small buttons get \`radius-sm\`)</li>
        </ul>
      </div>

      <div className="mt-6 p-6 bg-[var(--color-bg-alert-subtle)] border-l-4 border-[var(--color-bg-alert-high)] rounded">
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-alert-primary)]">
          Common Mistakes
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-fg-alert-secondary)]">
          <li>❌ Using primitive tokens directly in components</li>
          <li>❌ Mixing semantic and primitive tokens in the same component</li>
          <li>❌ Using hardcoded pixel values instead of tokens</li>
          <li>❌ Creating one-off spacing values instead of using existing tokens</li>
          <li>❌ Using oversized radius on small elements (\`radius-xl\` on a button)</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world examples showing how to use semantic dimension tokens in components.',
      },
    },
  },
};
