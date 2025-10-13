import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Semantics/Spacing',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Spacing Tokens

Semantic spacing tokens for consistent padding and gaps across the design system.

## Token Categories

### Space Between (Gaps)
Tokens for gaps between elements (flexbox gap, grid gap):

| Token | Value | Use Case |
|-------|-------|----------|
| \`--dimension-space-between-coupled\` | 4px | Tightly coupled elements (icon + text) |
| \`--dimension-space-between-repeating-sm\` | 6px | Small repeated elements (pills, chips) |
| \`--dimension-space-between-repeating-md\` | 8px | Medium repeated elements (cards in grid) |
| \`--dimension-space-between-related-sm\` | 8px | Related content sections |
| \`--dimension-space-between-related-md\` | 16px | Clearly related but distinct sections |
| \`--dimension-space-between-separated-md\` | 24px | Separated content sections |

### Space Around (Padding)
Tokens for padding around elements:

| Token | Value | Use Case |
|-------|-------|----------|
| \`--dimension-space-around-xs\` | 8px | Minimal padding (pills, small buttons) |
| \`--dimension-space-around-sm\` | 12px | Compact padding (medium buttons, inputs) |
| \`--dimension-space-around-md\` | 16px | Standard padding (cards, default buttons) |
| \`--dimension-space-around-lg\` | 20px | Generous padding (large cards, sections) |

**Note**: Space Around tokens can be applied to individual sides (paddingTop, paddingRight, paddingBottom, paddingLeft) for asymmetric layouts.

## Usage

\`\`\`tsx
// Gap between elements
<div className="flex" style={{ gap: 'var(--dimension-space-between-related-sm)' }}>
  <button>First</button>
  <button>Second</button>
</div>

// Padding around content
<div style={{ padding: 'var(--dimension-space-around-md)' }}>
  Card content with standard padding
</div>

// Directional padding (asymmetric)
<div style={{
  paddingTop: 'var(--dimension-space-around-lg)',
  paddingBottom: 'var(--dimension-space-around-lg)',
  paddingLeft: 'var(--dimension-space-around-md)',
  paddingRight: 'var(--dimension-space-around-md)'
}}>
  Card with more vertical breathing room
</div>

// Combining with Tailwind
<div className="flex" style={{ gap: 'var(--dimension-space-between-repeating-md)' }}>
  <div style={{ padding: 'var(--dimension-space-around-sm)' }}>Item 1</div>
  <div style={{ padding: 'var(--dimension-space-around-sm)' }}>Item 2</div>
</div>
\`\`\`

## Design Principles

- **Between vs Around**: Use "between" tokens for gaps, "around" tokens for padding
- **Semantic naming**: Token names describe relationships, not pixel values
- **Visual hierarchy**: Larger gaps/padding = more separation/emphasis
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const SpaceBetween: Story = {
  render: () => (
    <div className="p-8 space-y-8 bg-[var(--color-bg-neutral-base)]">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Space Between (Gap) Tokens
        </h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Used for gaps between elements in flex/grid layouts
        </p>
      </div>

      {/* Coupled */}
      <div>
        <div className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">
          between-coupled <span className="text-[var(--color-fg-neutral-secondary)] font-normal">(4px)</span>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Tightly coupled elements like icon + text
        </p>
        <div className="inline-flex items-center bg-[var(--color-bg-neutral-subtle)] px-4 py-2 rounded-lg" style={{ gap: 'var(--dimension-space-between-coupled)' }}>
          <svg className="w-4 h-4 text-[var(--color-fg-neutral-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-[var(--color-fg-neutral-primary)]">Checkmark with label</span>
        </div>
      </div>

      {/* Repeating Small */}
      <div>
        <div className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">
          between-repeating-small <span className="text-[var(--color-fg-neutral-secondary)] font-normal">(6px)</span>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Small repeated elements like pills or chips
        </p>
        <div className="flex flex-wrap" style={{ gap: 'var(--dimension-space-between-repeating-sm)' }}>
          {['Design', 'Development', 'Testing', 'Deployment'].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-[var(--color-bg-information-medium)] text-[var(--color-fg-information-primary)] text-xs font-semibold rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Repeating Medium */}
      <div>
        <div className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">
          between-repeating-medium <span className="text-[var(--color-fg-neutral-secondary)] font-normal">(8px)</span>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Medium repeated elements like cards in a grid
        </p>
        <div className="grid grid-cols-3" style={{ gap: 'var(--dimension-space-between-repeating-md)' }}>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="p-4 bg-[var(--color-bg-neutral-subtle)] border border-[var(--color-bg-neutral-low)] rounded-lg"
            >
              <div className="text-sm font-semibold text-[var(--color-fg-neutral-primary)]">Card {num}</div>
              <div className="text-xs text-[var(--color-fg-neutral-secondary)] mt-1">Grid item</div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Small */}
      <div>
        <div className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">
          between-related-small <span className="text-[var(--color-fg-neutral-secondary)] font-normal">(8px)</span>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Related content sections
        </p>
        <div className="flex flex-col" style={{ gap: 'var(--dimension-space-between-related-sm)' }}>
          <div className="p-3 bg-[var(--color-bg-positive-subtle)] rounded">
            <div className="text-sm font-semibold text-[var(--color-fg-positive-primary)]">Section A</div>
          </div>
          <div className="p-3 bg-[var(--color-bg-positive-subtle)] rounded">
            <div className="text-sm font-semibold text-[var(--color-fg-positive-primary)]">Section B</div>
          </div>
        </div>
      </div>

      {/* Related Medium */}
      <div>
        <div className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">
          between-related-medium <span className="text-[var(--color-fg-neutral-secondary)] font-normal">(16px)</span>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Clearly related but distinct sections
        </p>
        <div className="flex flex-col" style={{ gap: 'var(--dimension-space-between-related-md)' }}>
          <div className="p-4 bg-[var(--color-bg-accent-subtle)] rounded-lg border border-[var(--color-bg-accent-medium)]">
            <div className="text-sm font-semibold text-[var(--color-fg-accent-primary)]">Major Section 1</div>
            <div className="text-xs text-[var(--color-fg-accent-secondary)] mt-1">More breathing room</div>
          </div>
          <div className="p-4 bg-[var(--color-bg-accent-subtle)] rounded-lg border border-[var(--color-bg-accent-medium)]">
            <div className="text-sm font-semibold text-[var(--color-fg-accent-primary)]">Major Section 2</div>
            <div className="text-xs text-[var(--color-fg-accent-secondary)] mt-1">Clear visual separation</div>
          </div>
        </div>
      </div>

      {/* Separated */}
      <div>
        <div className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">
          between-separated <span className="text-[var(--color-fg-neutral-secondary)] font-normal">(24px)</span>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Separated content sections (distinct topics)
        </p>
        <div className="flex flex-col" style={{ gap: 'var(--dimension-space-between-separated-md)' }}>
          <div className="p-6 bg-[var(--color-bg-information-subtle)] rounded-lg">
            <h3 className="text-lg font-bold text-[var(--color-fg-information-primary)] mb-2">Topic A</h3>
            <p className="text-sm text-[var(--color-fg-information-secondary)]">
              Completely separate topic with maximum spacing
            </p>
          </div>
          <div className="p-6 bg-[var(--color-bg-alert-subtle)] rounded-lg">
            <h3 className="text-lg font-bold text-[var(--color-fg-alert-primary)] mb-2">Topic B</h3>
            <p className="text-sm text-[var(--color-fg-alert-secondary)]">
              Distinct content requiring clear visual break
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Semantic gap tokens for spacing between elements.',
      },
    },
  },
};

export const SpaceAround: Story = {
  render: () => (
    <div className="p-8 space-y-8 bg-[var(--color-bg-neutral-base)]">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Space Around (Padding) Tokens
        </h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Used for padding around content inside containers
        </p>
      </div>

      {/* X-Small */}
      <div>
        <div className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">
          around-x-small <span className="text-[var(--color-fg-neutral-secondary)] font-normal">(8px)</span>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Minimal padding for pills and small buttons
        </p>
        <div className="inline-flex gap-2">
          <button
            className="bg-[var(--color-bg-positive-high)] text-[var(--color-fg-neutral-inverse-primary)] text-sm font-semibold rounded"
            style={{ padding: 'var(--dimension-space-around-xs)' }}
          >
            Compact Button
          </button>
          <span
            className="bg-[var(--color-bg-information-medium)] text-[var(--color-fg-information-primary)] text-xs font-semibold rounded inline-flex items-center"
            style={{ padding: 'var(--dimension-space-around-xs)' }}
          >
            Badge
          </span>
        </div>
      </div>

      {/* Small */}
      <div>
        <div className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">
          around-small <span className="text-[var(--color-fg-neutral-secondary)] font-normal">(12px)</span>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Compact padding for medium buttons and inputs
        </p>
        <button
          className="bg-[var(--color-bg-positive-high)] text-[var(--color-fg-neutral-inverse-primary)] font-semibold rounded-lg"
          style={{ padding: 'var(--dimension-space-around-sm)' }}
        >
          Standard Button
        </button>
      </div>

      {/* Medium */}
      <div>
        <div className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">
          around-medium <span className="text-[var(--color-fg-neutral-secondary)] font-normal">(16px)</span>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Standard padding for cards and containers (most common)
        </p>
        <div
          className="bg-[var(--color-bg-neutral-subtle)] border border-[var(--color-bg-neutral-low)] rounded-lg max-w-md"
          style={{ padding: 'var(--dimension-space-around-md)' }}
        >
          <h4 className="font-semibold text-[var(--color-fg-neutral-primary)] mb-2">Event Card</h4>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)]">
            This card uses standard medium padding (16px) for comfortable content spacing.
          </p>
        </div>
      </div>

      {/* Large */}
      <div>
        <div className="text-sm font-semibold mb-2 text-[var(--color-fg-neutral-primary)]">
          around-large <span className="text-[var(--color-fg-neutral-secondary)] font-normal">(20px)</span>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Generous padding for large cards and prominent sections
        </p>
        <div
          className="bg-gradient-to-br from-[var(--color-bg-accent-subtle)] to-[var(--color-bg-information-subtle)] rounded-lg max-w-2xl"
          style={{ padding: 'var(--dimension-space-around-lg)' }}
        >
          <h3 className="text-xl font-bold text-[var(--color-fg-neutral-primary)] mb-3">
            Featured Section
          </h3>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)]">
            Large padding creates a spacious, premium feel for featured content and hero sections.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Semantic padding tokens for spacing around content.',
      },
    },
  },
};

export const DirectionalSpacing: Story = {
  render: () => (
    <div className="p-8 space-y-8 bg-[var(--color-bg-neutral-base)]">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg-neutral-primary)]">
          Directional Spacing
        </h2>
        <p className="text-sm text-[var(--color-fg-neutral-secondary)] mb-6">
          Space Around tokens can be applied to individual sides for asymmetric padding
        </p>
      </div>

      {/* Different vertical and horizontal padding */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Asymmetric Card Padding
        </h3>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Cards with more vertical breathing room than horizontal
        </p>
        <div
          className="bg-[var(--color-bg-neutral-subtle)] border border-[var(--color-bg-neutral-low)] rounded-lg max-w-md"
          style={{
            paddingTop: 'var(--dimension-space-around-lg)',
            paddingBottom: 'var(--dimension-space-around-lg)',
            paddingLeft: 'var(--dimension-space-around-md)',
            paddingRight: 'var(--dimension-space-around-md)',
          }}
        >
          <h4 className="font-semibold text-[var(--color-fg-neutral-primary)] mb-2">Featured Event</h4>
          <p className="text-sm text-[var(--color-fg-neutral-secondary)]">
            Larger top/bottom padding (20px) creates vertical emphasis, while medium left/right padding (16px) keeps content width comfortable.
          </p>
        </div>
        <div className="mt-2 text-xs text-[var(--color-fg-neutral-secondary)]">
          <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">
            paddingTop/Bottom: around-large (20px)
          </code>
          {' • '}
          <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">
            paddingLeft/Right: around-medium (16px)
          </code>
        </div>
      </div>

      {/* Top-heavy padding */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Top-Heavy Padding
        </h3>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Extra top padding for header sections
        </p>
        <div
          className="bg-gradient-to-b from-[var(--color-bg-accent-subtle)] to-[var(--color-bg-neutral-base)] rounded-lg max-w-md"
          style={{
            paddingTop: 'var(--dimension-space-around-lg)',
            paddingBottom: 'var(--dimension-space-around-sm)',
            paddingLeft: 'var(--dimension-space-around-md)',
            paddingRight: 'var(--dimension-space-around-md)',
          }}
        >
          <h3 className="text-xl font-bold text-[var(--color-fg-accent-primary)] mb-2">
            Section Header
          </h3>
          <p className="text-sm text-[var(--color-fg-accent-secondary)]">
            Generous top padding (20px) creates hierarchy, while smaller bottom padding (12px) keeps it compact.
          </p>
        </div>
        <div className="mt-2 text-xs text-[var(--color-fg-neutral-secondary)]">
          <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">
            paddingTop: around-large (20px)
          </code>
          {' • '}
          <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">
            paddingBottom: around-small (12px)
          </code>
        </div>
      </div>

      {/* Sidebar-style padding */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Sidebar-Style Padding
        </h3>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Extra left padding for indented/nested content
        </p>
        <div
          className="bg-[var(--color-bg-information-subtle)] border-l-4 border-[var(--color-bg-information-high)] rounded max-w-md"
          style={{
            paddingTop: 'var(--dimension-space-around-md)',
            paddingBottom: 'var(--dimension-space-around-md)',
            paddingLeft: 'var(--dimension-space-around-lg)',
            paddingRight: 'var(--dimension-space-around-md)',
          }}
        >
          <h4 className="font-semibold text-[var(--color-fg-information-primary)] mb-1">Pro Tip</h4>
          <p className="text-sm text-[var(--color-fg-information-secondary)]">
            Larger left padding (20px) creates clear indentation, while other sides use medium padding (16px).
          </p>
        </div>
        <div className="mt-2 text-xs text-[var(--color-fg-neutral-secondary)]">
          <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">
            paddingLeft: around-large (20px)
          </code>
          {' • '}
          <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">
            other sides: around-medium (16px)
          </code>
        </div>
      </div>

      {/* Compact horizontal, standard vertical */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Inline Button with Asymmetric Padding
        </h3>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mb-3">
          Wider horizontal padding for better clickability
        </p>
        <button
          className="bg-[var(--color-bg-positive-high)] text-[var(--color-fg-neutral-inverse-primary)] font-semibold rounded"
          style={{
            paddingTop: 'var(--dimension-space-around-xs)',
            paddingBottom: 'var(--dimension-space-around-xs)',
            paddingLeft: 'var(--dimension-space-around-md)',
            paddingRight: 'var(--dimension-space-around-md)',
          }}
        >
          Call to Action
        </button>
        <div className="mt-2 text-xs text-[var(--color-fg-neutral-secondary)]">
          <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">
            paddingTop/Bottom: around-x-small (8px)
          </code>
          {' • '}
          <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">
            paddingLeft/Right: around-medium (16px)
          </code>
        </div>
      </div>

      {/* Best Practices */}
      <div
        className="bg-[var(--color-bg-accent-subtle)] border-l-4 border-[var(--color-bg-accent-high)] rounded"
        style={{ padding: 'var(--dimension-space-around-md)' }}
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-accent-primary)]">
          Directional Spacing Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-fg-accent-secondary)]">
          <li>• Use directional padding to create visual hierarchy and emphasis</li>
          <li>• Consistent asymmetric padding across similar components maintains rhythm</li>
          <li>• Common pattern: Larger vertical padding for breathing room, standard horizontal for content width</li>
          <li>• Avoid arbitrary values - stick to token combinations for predictable spacing</li>
          <li>• CSS properties: <code className="bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded font-mono">paddingTop</code>, <code className="bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded font-mono">paddingRight</code>, <code className="bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded font-mono">paddingBottom</code>, <code className="bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded font-mono">paddingLeft</code></li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Applying spacing tokens to individual sides for asymmetric layouts.',
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

      {/* Button Group */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Button Group
        </h3>
        <div className="flex" style={{ gap: 'var(--dimension-space-between-related-sm)' }}>
          <button
            className="bg-[var(--color-bg-positive-high)] text-[var(--color-fg-neutral-inverse-primary)] font-semibold rounded"
            style={{ padding: 'var(--dimension-space-around-sm)' }}
          >
            Save
          </button>
          <button
            className="border border-[var(--color-bg-neutral-low)] text-[var(--color-fg-neutral-primary)] font-semibold rounded"
            style={{ padding: 'var(--dimension-space-around-sm)' }}
          >
            Cancel
          </button>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
          Gap: <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">between-related-small</code> •
          Padding: <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">around-small</code>
        </p>
      </div>

      {/* Tag List */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Tag List
        </h3>
        <div className="flex flex-wrap" style={{ gap: 'var(--dimension-space-between-repeating-sm)' }}>
          {['React', 'TypeScript', 'Tailwind', 'Storybook', 'Design Tokens'].map((tag) => (
            <span
              key={tag}
              className="bg-[var(--color-bg-accent-medium)] text-[var(--color-fg-accent-primary)] text-xs font-semibold rounded"
              style={{ padding: 'var(--dimension-space-around-xs)' }}
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
          Gap: <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">between-repeating-small</code> •
          Padding: <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">around-x-small</code>
        </p>
      </div>

      {/* Card Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Card Grid
        </h3>
        <div className="grid grid-cols-2 max-w-2xl" style={{ gap: 'var(--dimension-space-between-repeating-md)' }}>
          {[1, 2].map((num) => (
            <div
              key={num}
              className="bg-[var(--color-bg-neutral-subtle)] border border-[var(--color-bg-neutral-low)] rounded-lg"
              style={{ padding: 'var(--dimension-space-around-md)' }}
            >
              <h4 className="font-semibold text-[var(--color-fg-neutral-primary)] mb-2">Event {num}</h4>
              <p className="text-sm text-[var(--color-fg-neutral-secondary)]">
                Standard card spacing
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
          Gap: <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">between-repeating-medium</code> •
          Padding: <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">around-medium</code>
        </p>
      </div>

      {/* Form Layout */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-neutral-primary)]">
          Form Layout
        </h3>
        <div
          className="bg-[var(--color-bg-neutral-subtle)] rounded-lg border border-[var(--color-bg-neutral-low)] max-w-md"
          style={{ padding: 'var(--dimension-space-around-md)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--dimension-space-between-related-md)' }}>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-fg-neutral-primary)] mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-[var(--color-bg-neutral-low)] rounded text-sm text-[var(--color-fg-neutral-primary)]"
                style={{ padding: 'var(--dimension-space-around-sm)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-fg-neutral-primary)] mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-[var(--color-bg-neutral-low)] rounded text-sm text-[var(--color-fg-neutral-primary)]"
                style={{ padding: 'var(--dimension-space-around-sm)' }}
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--color-fg-neutral-secondary)] mt-2">
          Form gap: <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">between-related-medium</code> •
          Input padding: <code className="bg-[var(--color-bg-neutral-subtle)] px-2 py-1 rounded font-mono">around-small</code>
        </p>
      </div>

      {/* Best Practices */}
      <div
        className="bg-[var(--color-bg-information-subtle)] border-l-4 border-[var(--color-bg-information-high)] rounded"
        style={{ padding: 'var(--dimension-space-around-md)' }}
      >
        <h3 className="text-lg font-semibold mb-3 text-[var(--color-fg-information-primary)]">
          Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-[var(--color-fg-information-secondary)]">
          <li>• Use "between" tokens for gaps (flexbox gap, grid gap)</li>
          <li>• Use "around" tokens for padding inside containers</li>
          <li>• Match the semantic meaning: "coupled" for tightly related, "separated" for distinct topics</li>
          <li>• <code className="bg-[var(--color-bg-neutral-base)] px-2 py-1 rounded font-mono">around-medium</code> is the most common padding for cards</li>
          <li>• Consistent spacing creates visual rhythm and improves scannability</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common UI patterns combining gap and padding tokens.',
      },
    },
  },
};

export const AllTokens: Story = {
  render: () => (
    <div className="p-8 bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-fg-neutral-primary)]">
        Complete Token Reference
      </h2>
      <div className="grid grid-cols-2 gap-8">
        {/* Between Tokens */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Space Between (Gap)
          </h3>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-[var(--color-bg-neutral-subtle)] rounded">
              <div className="font-mono text-xs text-[var(--color-fg-neutral-secondary)] mb-1">
                --dimension-space-between-coupled
              </div>
              <div className="text-[var(--color-fg-neutral-primary)]">4px</div>
            </div>
            <div className="p-3 bg-[var(--color-bg-neutral-subtle)] rounded">
              <div className="font-mono text-xs text-[var(--color-fg-neutral-secondary)] mb-1">
                --dimension-space-between-repeating-sm
              </div>
              <div className="text-[var(--color-fg-neutral-primary)]">6px</div>
            </div>
            <div className="p-3 bg-[var(--color-bg-neutral-subtle)] rounded">
              <div className="font-mono text-xs text-[var(--color-fg-neutral-secondary)] mb-1">
                --dimension-space-between-repeating-md
              </div>
              <div className="text-[var(--color-fg-neutral-primary)]">8px</div>
            </div>
            <div className="p-3 bg-[var(--color-bg-neutral-subtle)] rounded">
              <div className="font-mono text-xs text-[var(--color-fg-neutral-secondary)] mb-1">
                --dimension-space-between-related-sm
              </div>
              <div className="text-[var(--color-fg-neutral-primary)]">8px</div>
            </div>
            <div className="p-3 bg-[var(--color-bg-neutral-subtle)] rounded">
              <div className="font-mono text-xs text-[var(--color-fg-neutral-secondary)] mb-1">
                --dimension-space-between-related-md
              </div>
              <div className="text-[var(--color-fg-neutral-primary)]">16px</div>
            </div>
            <div className="p-3 bg-[var(--color-bg-neutral-subtle)] rounded">
              <div className="font-mono text-xs text-[var(--color-fg-neutral-secondary)] mb-1">
                --dimension-space-between-separated-md
              </div>
              <div className="text-[var(--color-fg-neutral-primary)]">24px</div>
            </div>
          </div>
        </div>

        {/* Around Tokens */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-fg-neutral-primary)]">
            Space Around (Padding)
          </h3>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-[var(--color-bg-neutral-subtle)] rounded">
              <div className="font-mono text-xs text-[var(--color-fg-neutral-secondary)] mb-1">
                --dimension-space-around-xs
              </div>
              <div className="text-[var(--color-fg-neutral-primary)]">8px</div>
            </div>
            <div className="p-3 bg-[var(--color-bg-neutral-subtle)] rounded">
              <div className="font-mono text-xs text-[var(--color-fg-neutral-secondary)] mb-1">
                --dimension-space-around-sm
              </div>
              <div className="text-[var(--color-fg-neutral-primary)]">12px</div>
            </div>
            <div className="p-3 bg-[var(--color-bg-neutral-subtle)] rounded">
              <div className="font-mono text-xs text-[var(--color-fg-neutral-secondary)] mb-1">
                --dimension-space-around-md
              </div>
              <div className="text-[var(--color-fg-neutral-primary)]">16px</div>
            </div>
            <div className="p-3 bg-[var(--color-bg-neutral-subtle)] rounded">
              <div className="font-mono text-xs text-[var(--color-fg-neutral-secondary)] mb-1">
                --dimension-space-around-lg
              </div>
              <div className="text-[var(--color-fg-neutral-primary)]">20px</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete list of all spacing tokens with their values.',
      },
    },
  },
};
