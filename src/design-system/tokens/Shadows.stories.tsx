import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Foundations/Legacy Tokens/Shadows',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Shadow Tokens

A comprehensive shadow system for adding depth and elevation to UI elements.

## Shadow Scale

| Token | Value | Common Use Cases |
|-------|-------|------------------|
| shadow-xs | 0px 1px 2px rgba(0,0,0,0.05) | Subtle depth, barely visible |
| shadow-sm | 0px 1px 3px + 0px 1px 2px | Small elevation, hover states |
| shadow (default) | 0px 4px 6px + 0px 2px 4px | Default elevation, cards |
| shadow-md | 0px 10px 15px + 0px 4px 6px | Medium elevation, dropdowns |
| shadow-lg | 0px 20px 25px + 0px 10px 10px | Large elevation, modals |
| shadow-xl | 0px 25px 50px | Extra large elevation, dialogs |
| shadow-2xl | 0px 35px 60px | Maximum elevation, overlays |
| shadow-inner | inset 0px 2px 4px | Inner shadow, pressed states |
| shadow-none | none | Remove shadow |

## Shadow Layers

Most shadows use multiple layers for more realistic depth:
- **Top layer**: Larger, softer blur for ambient shadow
- **Bottom layer**: Tighter, darker for direct shadow

## Usage

\`\`\`tsx
// Cards and containers
<div className="shadow-md rounded-lg p-6">Card with medium shadow</div>

// Floating elements (dropdowns, tooltips)
<div className="shadow-lg rounded-md">Dropdown menu</div>

// Modal dialogs
<div className="shadow-xl rounded-xl p-8">Modal content</div>

// Hover states
<button className="hover:shadow-lg transition-shadow">
  Button with shadow on hover
</button>

// Inner shadow (pressed buttons)
<button className="active:shadow-inner">
  Button with inner shadow when pressed
</button>
\`\`\`

## Best Practices

- Use shadows to indicate elevation and layering
- Larger shadows = higher elevation
- Use \`shadow-sm\` or \`shadow\` for most cards
- Use \`shadow-lg\` or larger for floating elements
- Combine with \`transition-shadow\` for smooth hover effects
- Don't overuse large shadows - reserve for truly elevated elements
- Inner shadows work well for pressed/active states
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const ShadowDemo = ({
  className,
  label,
  description
}: {
  className: string;
  label: string;
  description: string;
}) => (
  <div className="flex flex-col items-center gap-4">
    <div className={`w-40 h-40 bg-white rounded-lg ${className}`} />
    <div className="text-center">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="text-xs text-gray-600 max-w-[200px]">{description}</p>
    </div>
  </div>
);

export const ShadowScale: Story = {
  render: () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Shadow Scale</h2>
      <p className="text-sm text-gray-600 mb-8">
        All shadow values in the design system, from subtle to dramatic
      </p>

      <div className="bg-gray-50 p-12 rounded-lg">
        <div className="grid grid-cols-3 gap-12">
          <ShadowDemo
            className="shadow-xs"
            label="shadow-xs"
            description="Barely visible, subtle depth"
          />
          <ShadowDemo
            className="shadow-sm"
            label="shadow-sm"
            description="Small elevation"
          />
          <ShadowDemo
            className="shadow"
            label="shadow (default)"
            description="Default card shadow"
          />
          <ShadowDemo
            className="shadow-md"
            label="shadow-md"
            description="Medium elevation"
          />
          <ShadowDemo
            className="shadow-lg"
            label="shadow-lg"
            description="Large elevation"
          />
          <ShadowDemo
            className="shadow-xl"
            label="shadow-xl"
            description="Extra large"
          />
          <ShadowDemo
            className="shadow-2xl"
            label="shadow-2xl"
            description="Maximum elevation"
          />
          <ShadowDemo
            className="shadow-inner"
            label="shadow-inner"
            description="Inner shadow"
          />
          <ShadowDemo
            className="shadow-none border border-gray-200"
            label="shadow-none"
            description="No shadow"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete shadow scale showing all elevation levels.',
      },
    },
  },
};

export const CardShadows: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Card Shadows</h2>
        <p className="text-sm text-gray-600 mb-6">
          Common shadow values for card components
        </p>
      </div>

      <div className="bg-gray-50 p-8 rounded-lg">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-gray-600 mb-3">shadow-sm - Subtle card</p>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-heading-sm mb-2">Card Title</h3>
              <p className="text-sm text-gray-600">
                Subtle shadow for minimal elevation.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-3">shadow - Default card (Recommended)</p>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-heading-sm mb-2">Card Title</h3>
              <p className="text-sm text-gray-600">
                Standard shadow for most cards.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-3">shadow-md - Elevated card</p>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-heading-sm mb-2">Card Title</h3>
              <p className="text-sm text-gray-600">
                More prominent shadow for emphasis.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-3">shadow-lg - Floating card</p>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-heading-sm mb-2">Card Title</h3>
              <p className="text-sm text-gray-600">
                Dramatic shadow for high elevation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different shadow options for card components.',
      },
    },
  },
};

export const InteractiveShadows: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Interactive Shadows</h2>
        <p className="text-sm text-gray-600 mb-6">
          Using shadows for hover and active states
        </p>
      </div>

      <div className="bg-gray-50 p-8 rounded-lg space-y-8">
        <div>
          <p className="text-xs text-gray-600 mb-3">Hover state - shadow increases by one step</p>
          <button className="bg-white rounded-lg shadow hover:shadow-md transition-shadow px-6 py-3 text-sm-bold border border-gray-200">
            Hover me
          </button>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Active state - inner shadow</p>
          <button className="bg-white rounded-lg shadow active:shadow-inner transition-shadow px-6 py-3 text-sm-bold border border-gray-200">
            Click me
          </button>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Card with hover elevation (shadow → shadow-md)</p>
          <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer max-w-md">
            <h3 className="text-heading-sm mb-2">Interactive Card</h3>
            <p className="text-sm text-gray-600">
              This card elevates by one shadow step when you hover over it.
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Button group with hover effects (each increases by one step)</p>
          <div className="flex gap-3">
            <button className="bg-blue-500 text-white rounded-lg shadow hover:shadow-md transition-shadow px-6 py-2 text-sm-bold">
              Primary
            </button>
            <button className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow transition-shadow px-6 py-2 text-sm-bold">
              Secondary
            </button>
            <button className="bg-white border border-gray-300 rounded-lg hover:shadow-sm transition-shadow px-6 py-2 text-sm-bold">
              Tertiary
            </button>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Using shadows for interactive states and transitions.',
      },
    },
  },
};

export const FloatingElements: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Floating Elements</h2>
        <p className="text-sm text-gray-600 mb-6">
          Shadows for dropdowns, popovers, and modals
        </p>
      </div>

      <div className="bg-gray-50 p-12 rounded-lg space-y-12">
        <div>
          <p className="text-xs text-gray-600 mb-3">Dropdown menu (shadow-lg)</p>
          <div className="relative inline-block">
            <button className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm-bold">
              Menu
            </button>
            <div className="absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-48">
              <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-50">Menu Item 1</a>
              <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-50">Menu Item 2</a>
              <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-50">Menu Item 3</a>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Tooltip (shadow-md)</p>
          <div className="relative inline-block">
            <button className="bg-blue-500 text-white rounded px-4 py-2 text-sm-bold">
              Hover for tooltip
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-md whitespace-nowrap">
              This is a tooltip
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Modal dialog (shadow-2xl)</p>
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
            <h3 className="text-heading-lg mb-4">Modal Title</h3>
            <p className="text-base mb-6">
              This is a modal dialog with maximum shadow for dramatic elevation above the page content.
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
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-3">Popover (shadow-lg)</p>
          <div className="relative inline-block">
            <button className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm-bold">
              Show Popover
            </button>
            <div className="absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64">
              <h4 className="text-sm-bold mb-2">Popover Title</h4>
              <p className="text-xs text-gray-600">
                This is a popover with additional context and information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shadows for floating UI elements like dropdowns and modals.',
      },
    },
  },
};

export const ElevationHierarchy: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Elevation Hierarchy</h2>
        <p className="text-sm text-gray-600 mb-6">
          Understanding elevation levels in layered interfaces
        </p>
      </div>

      <div className="bg-gray-100 p-12 rounded-lg">
        <div className="space-y-8">
          <div className="relative">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-heading-sm mb-4">Level 1: Base Content (shadow-sm)</h3>
              <p className="text-sm text-gray-600 mb-6">
                Base level cards and containers on the page.
              </p>

              <div className="relative">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h4 className="text-sm-bold mb-3">Level 2: Elevated Card (shadow-md)</h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Cards that float above the base content.
                  </p>

                  <div className="relative">
                    <div className="bg-white rounded-lg shadow-lg p-4">
                      <p className="text-xs-bold mb-2">Level 3: Dropdown (shadow-lg)</p>
                      <p className="text-2xs text-gray-600 mb-3">
                        Floating menus and dropdowns.
                      </p>

                      <div className="bg-white rounded-lg shadow-2xl p-3">
                        <p className="text-2xs-bold mb-1">Level 4: Modal (shadow-2xl)</p>
                        <p className="text-2xs text-gray-600">
                          Dialogs and overlays at the highest level.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Elevation Guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Level 0</strong> (no shadow): Flat elements on page background</li>
          <li>• <strong>Level 1</strong> (shadow-sm/shadow): Standard cards and containers</li>
          <li>• <strong>Level 2</strong> (shadow-md): Sticky headers, elevated cards</li>
          <li>• <strong>Level 3</strong> (shadow-lg): Dropdowns, popovers, tooltips</li>
          <li>• <strong>Level 4</strong> (shadow-xl/2xl): Modals, dialogs, overlays</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Understanding elevation hierarchy and when to use each shadow level.',
      },
    },
  },
};

export const UsageExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Shadow Usage Examples</h2>
      </div>

      <div className="bg-gray-50 p-8 rounded-lg space-y-8">
        <div>
          <h3 className="text-heading-sm mb-4">Dashboard Card Grid</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
              <p className="text-heading-2xl">$45,231</p>
              <p className="text-xs text-positive-primary mt-2">+12% from last month</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">New Users</p>
              <p className="text-heading-2xl">1,234</p>
              <p className="text-xs text-positive-primary mt-2">+8% from last month</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Active Sessions</p>
              <p className="text-heading-2xl">567</p>
              <p className="text-xs text-alert-primary mt-2">-3% from last month</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">Cards use shadow (default)</p>
        </div>

        <div>
          <h3 className="text-heading-sm mb-4">Button with Hover Effect</h3>
          <button className="bg-blue-500 text-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 px-6 py-3 text-base-bold">
            Hover for elevation
          </button>
          <p className="text-xs text-gray-600 mt-3">
            shadow → shadow-md on hover with transition-shadow
          </p>
        </div>

        <div>
          <h3 className="text-heading-sm mb-4">Search Bar with Focus State</h3>
          <input
            type="text"
            placeholder="Search..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:shadow-md focus:outline-none transition-shadow"
          />
          <p className="text-xs text-gray-600 mt-3">
            No shadow → shadow-md on focus
          </p>
        </div>

        <div>
          <h3 className="text-heading-sm mb-4">Notification Toast</h3>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="text-sm-bold mb-1">Success!</p>
                <p className="text-xs text-gray-600">Your changes have been saved.</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">Toast uses shadow-lg</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Shadow Best Practices</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use <code className="bg-gray-200 px-1 rounded">shadow</code> as default for most cards</li>
          <li>• Use <code className="bg-gray-200 px-1 rounded">shadow-lg</code> or larger for floating elements</li>
          <li>• Combine with <code className="bg-gray-200 px-1 rounded">transition-shadow</code> for smooth hover effects</li>
          <li>• Use <code className="bg-gray-200 px-1 rounded">shadow-inner</code> for pressed/active button states</li>
          <li>• Don't stack too many different shadow levels - keep hierarchy clear</li>
          <li>• Larger shadows = higher elevation = more important content</li>
          <li>• Test shadows on different backgrounds - they may be less visible on dark backgrounds</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world examples of shadow usage in UI components.',
      },
    },
  },
};
