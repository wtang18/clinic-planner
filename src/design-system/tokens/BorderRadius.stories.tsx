import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Foundations/Legacy Tokens/Border Radius',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Border Radius Tokens

A comprehensive border radius system for creating consistent rounded corners.

## Border Radius Scale

| Token | Value | Common Use Cases |
|-------|-------|------------------|
| rounded-none | 0px | Sharp corners, reset rounding |
| rounded-sm | 2px | Subtle rounding, tight elements |
| rounded (default) | 4px | Default UI elements, buttons, inputs |
| rounded-md | 6px | Cards, modals (slightly more rounded) |
| rounded-lg | 8px | Cards, containers, panels |
| rounded-xl | 12px | Large cards, prominent containers |
| rounded-2xl | 16px | Hero sections, feature cards |
| rounded-3xl | 24px | Extra rounded, decorative elements |
| rounded-full | 9999px | Pills, avatars, circular buttons |

## Common Patterns

### Individual Corners
You can round specific corners:
- \`rounded-t-*\`: Top left and top right
- \`rounded-r-*\`: Top right and bottom right
- \`rounded-b-*\`: Bottom left and bottom right
- \`rounded-l-*\`: Top left and bottom left
- \`rounded-tl-*\`: Top left only
- \`rounded-tr-*\`: Top right only
- \`rounded-br-*\`: Bottom right only
- \`rounded-bl-*\`: Bottom left only

### Usage Examples

\`\`\`tsx
// Default button
<button className="rounded px-4 py-2">Button</button>

// Card
<div className="rounded-lg p-6 bg-white border">Card</div>

// Modal
<div className="rounded-xl p-8 bg-white shadow-lg">Modal</div>

// Pill/badge
<span className="rounded-full px-3 py-1">Badge</span>

// Avatar
<img className="rounded-full w-10 h-10" src="..." />

// Rounded top only (for stacked cards)
<div className="rounded-t-lg bg-blue-500">Header</div>
<div className="bg-white">Content</div>
\`\`\`

## Best Practices

- Use \`rounded\` (4px) as the default for most UI elements
- Use \`rounded-lg\` (8px) for cards and containers
- Use \`rounded-xl\` (12px) or larger for prominent features
- Use \`rounded-full\` for circular elements (avatars, pills)
- Keep border radius consistent across similar components
- Larger elements can support larger border radius values
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const RadiusDemo = ({
  className,
  label,
  value
}: {
  className: string;
  label: string;
  value: string;
}) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`w-24 h-24 bg-blue-500 border-4 border-blue-600 ${className}`} />
    <div className="text-center">
      <p className="text-xs font-semibold text-gray-900">{label}</p>
      <p className="text-2xs text-gray-600">{value}</p>
    </div>
  </div>
);

export const RadiusScale: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Border Radius Scale</h2>
      <p className="text-sm text-gray-600 mb-6">
        All border radius values in the design system
      </p>

      <div className="grid grid-cols-5 gap-8">
        <RadiusDemo className="rounded-none" label="none" value="0px" />
        <RadiusDemo className="rounded-sm" label="sm" value="2px" />
        <RadiusDemo className="rounded" label="default" value="4px" />
        <RadiusDemo className="rounded-md" label="md" value="6px" />
        <RadiusDemo className="rounded-lg" label="lg" value="8px" />
        <RadiusDemo className="rounded-xl" label="xl" value="12px" />
        <RadiusDemo className="rounded-2xl" label="2xl" value="16px" />
        <RadiusDemo className="rounded-3xl" label="3xl" value="24px" />
        <RadiusDemo className="rounded-full" label="full" value="9999px" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete border radius scale from sharp corners to full circles.',
      },
    },
  },
};

export const ButtonRounding: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Button Border Radius</h2>
        <p className="text-sm text-gray-600 mb-6">
          Common border radius values for buttons
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-none text-sm-bold">
            No Rounding
          </button>
          <span className="text-xs text-gray-600">rounded-none (0px)</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-sm text-sm-bold">
            Subtle Round
          </button>
          <span className="text-xs text-gray-600">rounded-sm (2px)</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-blue-500 text-white px-6 py-2 rounded text-sm-bold">
            Default Button
          </button>
          <span className="text-xs text-gray-600">rounded (4px) - Recommended</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-md text-sm-bold">
            Medium Round
          </button>
          <span className="text-xs text-gray-600">rounded-md (6px)</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm-bold">
            Large Round
          </button>
          <span className="text-xs text-gray-600">rounded-lg (8px)</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm-bold">
            Pill Button
          </button>
          <span className="text-xs text-gray-600">rounded-full (9999px)</span>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different border radius options for button components.',
      },
    },
  },
};

export const CardRounding: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Card Border Radius</h2>
        <p className="text-sm text-gray-600 mb-6">
          Common border radius values for cards and containers
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-gray-600 mb-2">rounded (4px) - Compact card</p>
          <div className="bg-white border border-gray-200 rounded p-6">
            <h3 className="text-heading-sm mb-2">Card Title</h3>
            <p className="text-sm text-gray-600">Subtle rounding for compact cards.</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">rounded-md (6px) - Standard card</p>
          <div className="bg-white border border-gray-200 rounded-md p-6">
            <h3 className="text-heading-sm mb-2">Card Title</h3>
            <p className="text-sm text-gray-600">Slightly more rounded corners.</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">rounded-lg (8px) - Default card (Recommended)</p>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-heading-sm mb-2">Card Title</h3>
            <p className="text-sm text-gray-600">Standard rounding for most cards.</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">rounded-xl (12px) - Prominent card</p>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-heading-sm mb-2">Card Title</h3>
            <p className="text-sm text-gray-600">More rounded for emphasis.</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">rounded-2xl (16px) - Feature card</p>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-heading-sm mb-2">Card Title</h3>
            <p className="text-sm text-gray-600">Generous rounding for featured content.</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">rounded-3xl (24px) - Hero card</p>
          <div className="bg-white border border-gray-200 rounded-3xl p-6">
            <h3 className="text-heading-sm mb-2">Card Title</h3>
            <p className="text-sm text-gray-600">Extra rounded for hero sections.</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different border radius options for card components.',
      },
    },
  },
};

export const CircularElements: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Circular Elements (rounded-full)</h2>
        <p className="text-sm text-gray-600 mb-6">
          Using rounded-full for avatars, badges, and pills
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs text-gray-600 mb-3">Avatars</p>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs-bold">
              JD
            </div>
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm-bold">
              AB
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-base-bold">
              CD
            </div>
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white text-lg-bold">
              EF
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Badges / Pills</p>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs-bold">
              New
            </span>
            <span className="rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs-bold">
              Active
            </span>
            <span className="rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-xs-bold">
              Pending
            </span>
            <span className="rounded-full bg-red-100 text-red-800 px-3 py-1 text-xs-bold">
              Closed
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Pill Buttons</p>
          <div className="flex items-center gap-3">
            <button className="rounded-full bg-blue-500 text-white px-6 py-2 text-sm-bold hover:bg-blue-600">
              Primary Action
            </button>
            <button className="rounded-full border-2 border-gray-300 px-6 py-2 text-sm-bold hover:bg-gray-50">
              Secondary Action
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Icon Buttons</p>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600">
              +
            </button>
            <button className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50">
              ×
            </button>
            <button className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600">
              ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Using rounded-full for circular elements like avatars and badges.',
      },
    },
  },
};

export const PartialRounding: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Partial Border Radius</h2>
        <p className="text-sm text-gray-600 mb-6">
          Rounding specific corners for complex layouts
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs text-gray-600 mb-3">Top corners only (rounded-t-lg)</p>
          <div className="max-w-md">
            <div className="bg-blue-500 text-white p-4 rounded-t-lg">
              <p className="font-semibold">Card Header</p>
            </div>
            <div className="bg-white border-x border-b border-gray-200 p-4">
              <p className="text-sm">Card content with rounded top only</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Bottom corners only (rounded-b-lg)</p>
          <div className="max-w-md">
            <div className="bg-white border-x border-t border-gray-200 p-4">
              <p className="text-sm">Card content</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-b-lg">
              <p className="text-xs text-gray-600">Card footer with rounded bottom</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Right corners only (rounded-r-lg)</p>
          <div className="flex max-w-md">
            <div className="w-2 bg-blue-500" />
            <div className="flex-1 bg-white border border-gray-200 p-4 rounded-r-lg">
              <p className="text-sm">Message with accent border and right rounding</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Individual corners (rounded-tl-lg, rounded-br-lg)</p>
          <div className="max-w-md bg-white border border-gray-200 p-6 rounded-tl-lg rounded-br-lg">
            <p className="text-sm">Content with only top-left and bottom-right corners rounded</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Tabs with rounded tops</p>
          <div className="max-w-md">
            <div className="flex gap-1">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-t-lg text-sm-bold">
                Active Tab
              </button>
              <button className="px-4 py-2 bg-gray-200 rounded-t-lg text-sm-bold">
                Tab 2
              </button>
              <button className="px-4 py-2 bg-gray-200 rounded-t-lg text-sm-bold">
                Tab 3
              </button>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-b-lg rounded-tr-lg">
              <p className="text-sm">Tab content area</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Rounding specific corners for complex UI patterns.',
      },
    },
  },
};

export const UsageExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Border Radius Usage Examples</h2>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-heading-sm mb-4">Form Inputs</h3>
          <div className="space-y-3 max-w-md">
            <input
              type="text"
              placeholder="Default input (rounded)"
              className="w-full border border-gray-300 rounded px-3 py-2 text-base"
            />
            <input
              type="text"
              placeholder="Rounded input (rounded-lg)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base"
            />
            <input
              type="text"
              placeholder="Pill input (rounded-full)"
              className="w-full border border-gray-300 rounded-full px-4 py-2 text-base"
            />
          </div>
        </div>

        <div>
          <h3 className="text-heading-sm mb-4">Modal Dialog</h3>
          <div className="max-w-md bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
            <h3 className="text-heading-lg mb-4">Confirm Action</h3>
            <p className="text-base mb-6">
              Are you sure you want to proceed with this action?
            </p>
            <div className="flex gap-3 justify-end">
              <button className="px-6 py-2 border border-gray-300 rounded-lg text-sm-bold hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm-bold hover:bg-blue-600">
                Confirm
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Modal uses rounded-xl (12px)</p>
        </div>

        <div>
          <h3 className="text-heading-sm mb-4">Alert Messages</h3>
          <div className="space-y-3">
            <div className="bg-positive-subtle border-l-4 border-positive-high p-4 rounded-r-lg">
              <p className="text-positive-primary font-semibold mb-1">Success</p>
              <p className="text-positive-primary text-sm">Operation completed successfully.</p>
            </div>
            <div className="bg-alert-subtle border border-alert-high p-4 rounded-lg">
              <p className="text-alert-primary font-semibold mb-1">Error</p>
              <p className="text-alert-primary text-sm">Something went wrong.</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-heading-sm mb-4">Tag Group</h3>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs-bold">
              React
            </span>
            <span className="rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs-bold">
              TypeScript
            </span>
            <span className="rounded-full bg-purple-100 text-purple-800 px-3 py-1 text-xs-bold">
              Tailwind
            </span>
            <span className="rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-xs-bold">
              Storybook
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Border Radius Best Practices</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use <code className="bg-gray-200 px-1 rounded">rounded</code> (4px) as default for buttons and inputs</li>
          <li>• Use <code className="bg-gray-200 px-1 rounded">rounded-lg</code> (8px) for cards and containers</li>
          <li>• Use <code className="bg-gray-200 px-1 rounded">rounded-xl</code> (12px) or larger for modals and prominent features</li>
          <li>• Use <code className="bg-gray-200 px-1 rounded">rounded-full</code> for circular elements (avatars, badges, pills)</li>
          <li>• Larger elements can support larger border radius values</li>
          <li>• Keep border radius consistent across similar components</li>
          <li>• Use partial rounding (rounded-t-*, rounded-l-*, etc.) for connected UI elements</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world examples of border radius in common UI patterns.',
      },
    },
  },
};
