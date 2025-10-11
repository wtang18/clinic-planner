import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Foundations/Legacy Tokens/Spacing',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Spacing Tokens

A consistent spacing scale based on a 4px base unit for padding, margin, and gaps.

## Spacing Scale

The spacing system uses a numeric scale from 0-64:

| Token | Value | Rem | Common Use Cases |
|-------|-------|-----|------------------|
| 0 | 0px | 0 | Reset spacing |
| 1 | 4px | 0.25rem | Tight spacing, icon gaps |
| 2 | 8px | 0.5rem | Small padding, compact layouts |
| 3 | 12px | 0.75rem | Medium-tight spacing |
| 4 | 16px | 1rem | Default spacing, standard padding |
| 5 | 20px | 1.25rem | Medium spacing |
| 6 | 24px | 1.5rem | Large padding, section spacing |
| 7 | 28px | 1.75rem | Extra section spacing |
| 8 | 32px | 2rem | Section padding, large gaps |
| 9 | 36px | 2.25rem | Large section spacing |
| 10 | 40px | 2.5rem | Extra large spacing |
| 11 | 44px | 2.75rem | Generous spacing |
| 12 | 48px | 3rem | Page section padding |
| 14 | 56px | 3.5rem | Extra large sections |
| 16 | 64px | 4rem | Major page sections |
| 20 | 80px | 5rem | Spacious layouts |
| 24 | 96px | 6rem | Extra spacious layouts |
| 32 | 128px | 8rem | Large container spacing |
| 40 | 160px | 10rem | Extra large containers |
| 48 | 192px | 12rem | Major layout spacing |
| 56 | 224px | 14rem | Extra major spacing |
| 64 | 256px | 16rem | Maximum spacing |

## Spacing Utilities

### Padding
\`\`\`tsx
// All sides
<div className="p-4">16px padding on all sides</div>

// Individual sides
<div className="pt-2 pr-4 pb-2 pl-4">Top/bottom 8px, left/right 16px</div>

// Horizontal / Vertical
<div className="px-4 py-2">Horizontal 16px, vertical 8px</div>
\`\`\`

### Margin
\`\`\`tsx
// All sides
<div className="m-6">24px margin on all sides</div>

// Individual sides
<div className="mt-4 mb-8">Top 16px, bottom 32px</div>

// Horizontal / Vertical
<div className="mx-auto my-4">Centered horizontally, 16px vertical</div>

// Negative margins
<div className="-mt-4">Negative 16px top margin</div>
\`\`\`

### Gap (for Flexbox/Grid)
\`\`\`tsx
// Uniform gap
<div className="flex gap-4">16px gap between children</div>

// Row and column gaps
<div className="grid gap-x-4 gap-y-8">
  16px horizontal gap, 32px vertical gap
</div>
\`\`\`

### Space Between
\`\`\`tsx
// Flex/grid children spacing
<div className="flex flex-col space-y-4">
  16px space between children
</div>
\`\`\`

## Best Practices

- Use multiples of 4 for consistency
- Prefer smaller spacing (2-6) for component internals
- Use medium spacing (6-12) for section padding
- Use large spacing (12-24) for page-level layouts
- Maintain consistent spacing within similar components
- Use \`gap\` instead of margin for flex/grid layouts when possible
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const SpacingDemo = ({ size, pixels }: { size: string; pixels: string }) => (
  <div className="flex items-center gap-6 border-b border-gray-100 py-3">
    <div className="w-16 flex-shrink-0">
      <p className="text-sm font-semibold text-gray-900">{size}</p>
      <p className="text-xs text-gray-600">{pixels}</p>
    </div>
    <div className="flex items-center">
      <div
        className="bg-blue-500 h-8"
        style={{ width: pixels }}
      />
    </div>
  </div>
);

export const SpacingScale: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Spacing Scale</h2>
      <p className="text-sm text-gray-600 mb-6">
        All spacing values in the design system (4px base unit)
      </p>

      <div className="max-w-2xl">
        <SpacingDemo size="0" pixels="0px" />
        <SpacingDemo size="1" pixels="4px" />
        <SpacingDemo size="2" pixels="8px" />
        <SpacingDemo size="3" pixels="12px" />
        <SpacingDemo size="4" pixels="16px" />
        <SpacingDemo size="5" pixels="20px" />
        <SpacingDemo size="6" pixels="24px" />
        <SpacingDemo size="7" pixels="28px" />
        <SpacingDemo size="8" pixels="32px" />
        <SpacingDemo size="9" pixels="36px" />
        <SpacingDemo size="10" pixels="40px" />
        <SpacingDemo size="11" pixels="44px" />
        <SpacingDemo size="12" pixels="48px" />
        <SpacingDemo size="14" pixels="56px" />
        <SpacingDemo size="16" pixels="64px" />
        <SpacingDemo size="20" pixels="80px" />
        <SpacingDemo size="24" pixels="96px" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete spacing scale from 0 to 96px.',
      },
    },
  },
};

export const PaddingExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Padding Examples</h2>
        <p className="text-sm text-gray-600 mb-6">
          Common padding patterns for components
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-600 mb-2">p-2 (8px all sides) - Compact button</p>
          <div className="inline-block bg-blue-100 border-2 border-blue-500">
            <div className="bg-blue-500 text-white p-2 text-sm-bold">
              Button
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">p-4 (16px all sides) - Default button</p>
          <div className="inline-block bg-blue-100 border-2 border-blue-500">
            <div className="bg-blue-500 text-white p-4 text-base-bold">
              Button
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">px-4 py-2 - Standard button padding</p>
          <div className="inline-block bg-blue-100 border-2 border-blue-500">
            <div className="bg-blue-500 text-white px-4 py-2 text-sm-bold">
              Button
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">p-6 (24px all sides) - Card padding</p>
          <div className="bg-blue-100 border-2 border-blue-500 max-w-md">
            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-heading-sm mb-2">Card Title</h3>
              <p className="text-sm text-gray-600">Card content with standard padding for comfortable spacing.</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">p-8 (32px all sides) - Section padding</p>
          <div className="bg-blue-100 border-2 border-blue-500 max-w-md">
            <div className="bg-white p-8">
              <h2 className="text-heading-md mb-3">Section Title</h2>
              <p className="text-base">Content with generous padding for major page sections.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common padding patterns used in UI components.',
      },
    },
  },
};

export const MarginExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Margin Examples</h2>
        <p className="text-sm text-gray-600 mb-6">
          Common margin patterns for spacing elements
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-xs text-gray-600 mb-3">mb-2 (8px bottom) - Tight spacing</p>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-heading-sm mb-2">Heading</h3>
            <p className="text-sm">Text immediately following with 8px spacing.</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">mb-4 (16px bottom) - Standard spacing</p>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-heading-sm mb-4">Heading</h3>
            <p className="text-sm">Text with comfortable 16px spacing.</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">mb-6 (24px bottom) - Generous spacing</p>
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-heading-md mb-6">Section Heading</h2>
            <p className="text-base">Content with generous spacing for clear separation.</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">mt-8 (32px top) - Section separation</p>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-base">Previous content...</p>
            <h2 className="text-heading-md mt-8">New Section</h2>
            <p className="text-base">Clear visual break with 32px top margin.</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">mx-auto - Horizontal centering</p>
          <div className="bg-gray-50 p-4">
            <div className="bg-blue-500 text-white px-6 py-3 rounded-lg mx-auto w-fit">
              Centered Button
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common margin patterns for element spacing and alignment.',
      },
    },
  },
};

export const GapExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gap Examples</h2>
        <p className="text-sm text-gray-600 mb-6">
          Using gap for flexbox and grid layouts
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-xs text-gray-600 mb-3">gap-2 (8px) - Compact flex layout</p>
          <div className="flex gap-2 bg-gray-50 p-4 rounded">
            <div className="bg-blue-500 text-white px-4 py-2 rounded text-sm">Item 1</div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded text-sm">Item 2</div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded text-sm">Item 3</div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">gap-4 (16px) - Standard flex layout</p>
          <div className="flex gap-4 bg-gray-50 p-4 rounded">
            <div className="bg-blue-500 text-white px-4 py-2 rounded text-sm">Item 1</div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded text-sm">Item 2</div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded text-sm">Item 3</div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">gap-6 (24px) - Spacious flex layout</p>
          <div className="flex gap-6 bg-gray-50 p-4 rounded">
            <div className="bg-blue-500 text-white px-4 py-2 rounded text-sm">Item 1</div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded text-sm">Item 2</div>
            <div className="bg-blue-500 text-white px-4 py-2 rounded text-sm">Item 3</div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">grid with gap-4 - Card grid</p>
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
            <div className="bg-white border border-gray-200 p-4 rounded">Card 1</div>
            <div className="bg-white border border-gray-200 p-4 rounded">Card 2</div>
            <div className="bg-white border border-gray-200 p-4 rounded">Card 3</div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">gap-x-4 gap-y-8 - Different horizontal/vertical gaps</p>
          <div className="grid grid-cols-3 gap-x-4 gap-y-8 bg-gray-50 p-4 rounded">
            <div className="bg-white border border-gray-200 p-4 rounded">Card 1</div>
            <div className="bg-white border border-gray-200 p-4 rounded">Card 2</div>
            <div className="bg-white border border-gray-200 p-4 rounded">Card 3</div>
            <div className="bg-white border border-gray-200 p-4 rounded">Card 4</div>
            <div className="bg-white border border-gray-200 p-4 rounded">Card 5</div>
            <div className="bg-white border border-gray-200 p-4 rounded">Card 6</div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">flex-col gap-3 - Vertical stack</p>
          <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded max-w-md">
            <div className="bg-white border border-gray-200 p-3 rounded">List Item 1</div>
            <div className="bg-white border border-gray-200 p-3 rounded">List Item 2</div>
            <div className="bg-white border border-gray-200 p-3 rounded">List Item 3</div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Using gap utilities for modern flexbox and grid layouts.',
      },
    },
  },
};

export const ComponentSpacing: Story = {
  render: () => (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Component Spacing Patterns</h2>
        <p className="text-sm text-gray-600 mb-6">
          Real-world examples of spacing in common UI patterns
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-heading-sm mb-4">Form Layout</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <label className="text-sm-bold block mb-1">Full Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-base"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-sm-bold block mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2 text-base"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="text-sm-bold block mb-1">Message</label>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2 text-base"
                placeholder="Your message..."
              />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Uses: p-6 (card), space-y-4 (fields), mb-1 (labels), px-3 py-2 (inputs)
          </p>
        </div>

        <div>
          <h3 className="text-heading-sm mb-4">Stats Grid</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Total Users</p>
              <p className="text-heading-2xl">1,234</p>
              <p className="text-xs text-positive-primary mt-2">+12% this month</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Revenue</p>
              <p className="text-heading-2xl">$45K</p>
              <p className="text-xs text-positive-primary mt-2">+8% this month</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Orders</p>
              <p className="text-heading-2xl">567</p>
              <p className="text-xs text-alert-primary mt-2">-3% this month</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Uses: gap-4 (grid), p-6 (cards), mb-2 (label), mt-2 (change indicator)
          </p>
        </div>

        <div>
          <h3 className="text-heading-sm mb-4">Navigation Menu</h3>
          <div className="bg-white border border-gray-200 rounded-lg">
            <nav className="flex gap-1 p-2">
              <a className="px-4 py-2 rounded bg-blue-500 text-white text-sm-bold">Dashboard</a>
              <a className="px-4 py-2 rounded hover:bg-gray-100 text-sm-bold">Projects</a>
              <a className="px-4 py-2 rounded hover:bg-gray-100 text-sm-bold">Team</a>
              <a className="px-4 py-2 rounded hover:bg-gray-100 text-sm-bold">Settings</a>
            </nav>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Uses: p-2 (container), gap-1 (items), px-4 py-2 (nav items)
          </p>
        </div>

        <div>
          <h3 className="text-heading-sm mb-4">List with Dividers</h3>
          <div className="bg-white border border-gray-200 rounded-lg divide-y">
            <div className="p-4">
              <h4 className="text-base-bold mb-1">First Item</h4>
              <p className="text-sm text-gray-600">Description of the first item</p>
            </div>
            <div className="p-4">
              <h4 className="text-base-bold mb-1">Second Item</h4>
              <p className="text-sm text-gray-600">Description of the second item</p>
            </div>
            <div className="p-4">
              <h4 className="text-base-bold mb-1">Third Item</h4>
              <p className="text-sm text-gray-600">Description of the third item</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Uses: p-4 (list items), mb-1 (title spacing)
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Spacing Best Practices</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use <code className="bg-gray-200 px-1 rounded">gap</code> instead of margins for flex/grid children</li>
          <li>• Standard card padding is <code className="bg-gray-200 px-1 rounded">p-6</code> (24px)</li>
          <li>• Button padding typically uses <code className="bg-gray-200 px-1 rounded">px-4 py-2</code> or <code className="bg-gray-200 px-1 rounded">px-6 py-3</code></li>
          <li>• Use <code className="bg-gray-200 px-1 rounded">space-y-*</code> utilities for consistent vertical rhythm</li>
          <li>• Section spacing is usually <code className="bg-gray-200 px-1 rounded">p-8</code> or larger</li>
          <li>• Keep spacing consistent across similar components</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common spacing patterns used in real UI components.',
      },
    },
  },
};
