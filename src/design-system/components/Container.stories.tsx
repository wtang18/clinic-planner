import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';
import { Card } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Container> = {
  title: 'Design System/Components/Container',
  component: Container,
  tags: ['autodocs'],
  argTypes: {
    // Core variant props
    variant: {
      control: 'select',
      options: ['non-interactive', 'interactive'],
      description: 'Whether container is interactive (clickable/hoverable)',
    },
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Spacing between child elements',
    },

    // State props
    disabled: {
      control: 'boolean',
      description: 'Whether the container is disabled (interactive variant only)',
      if: { arg: 'variant', eq: 'interactive' },
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the container',
      table: {
        category: 'Accessibility',
      },
    },
  },

  parameters: {
    controls: {
      // Exclude complex props from controls
      exclude: ['children', 'onClick', 'className', 'as', 'ref', 'key'],
    },
    docs: {
      description: {
        component: `
Container component with Figma design system integration.

## Purpose
A wrapper component that provides consistent spacing and layout for child components, typically used to contain Card components or other content.

## Variants
- **non-interactive** (default): Static container without hover effects
- **interactive**: Clickable/hoverable container with background color change

## Gap Sizes
- **sm**: 8px gap between children
- **md**: 16px gap between children (default)
- **lg**: 24px gap between children

## Styling
- Background: rgba(0,0,0,0.06) - subtle gray
- Hover (interactive): rgba(0,0,0,0.12) - darker gray
- Border Radius: 16px
- Padding: 16px on all sides
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Playground: Story = {
  args: {
    variant: 'non-interactive',
    gap: 'md',
    disabled: false,
  },
  render: (args) => (
    <Container {...args}>
      <Card>
        <h3 className="font-semibold text-sm">Card 1</h3>
        <p className="text-xs text-gray-600">Sample content</p>
      </Card>
      <Card>
        <h3 className="font-semibold text-sm">Card 2</h3>
        <p className="text-xs text-gray-600">Sample content</p>
      </Card>
      <Card>
        <h3 className="font-semibold text-sm">Card 3</h3>
        <p className="text-xs text-gray-600">Sample content</p>
      </Card>
    </Container>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Non-Interactive (Default)</h3>
        <p className="text-sm text-gray-600 mb-4">Static container without hover effects</p>
        <Container variant="non-interactive">
          <Card>
            <h3 className="font-semibold text-sm">Card 1</h3>
            <p className="text-xs text-gray-600">This container does not respond to hover</p>
          </Card>
          <Card>
            <h3 className="font-semibold text-sm">Card 2</h3>
            <p className="text-xs text-gray-600">Sample content</p>
          </Card>
        </Container>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Interactive</h3>
        <p className="text-sm text-gray-600 mb-4">Hover to see background change</p>
        <Container
          variant="interactive"
          onClick={() => alert('Container clicked!')}
          aria-label="Clickable container"
        >
          <Card>
            <h3 className="font-semibold text-sm">Card 1</h3>
            <p className="text-xs text-gray-600">Hover over this container to see the effect</p>
          </Card>
          <Card>
            <h3 className="font-semibold text-sm">Card 2</h3>
            <p className="text-xs text-gray-600">Sample content</p>
          </Card>
        </Container>
      </div>
    </div>
  ),
};

export const GapVariants: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Small Gap (8px)</h3>
        <Container gap="sm">
          <Card>
            <h3 className="font-semibold text-sm">Card 1</h3>
          </Card>
          <Card>
            <h3 className="font-semibold text-sm">Card 2</h3>
          </Card>
          <Card>
            <h3 className="font-semibold text-sm">Card 3</h3>
          </Card>
        </Container>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Medium Gap (16px) - Default</h3>
        <Container gap="md">
          <Card>
            <h3 className="font-semibold text-sm">Card 1</h3>
          </Card>
          <Card>
            <h3 className="font-semibold text-sm">Card 2</h3>
          </Card>
          <Card>
            <h3 className="font-semibold text-sm">Card 3</h3>
          </Card>
        </Container>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Large Gap (24px)</h3>
        <Container gap="lg">
          <Card>
            <h3 className="font-semibold text-sm">Card 1</h3>
          </Card>
          <Card>
            <h3 className="font-semibold text-sm">Card 2</h3>
          </Card>
          <Card>
            <h3 className="font-semibold text-sm">Card 3</h3>
          </Card>
        </Container>
      </div>
    </div>
  ),
};

export const DisabledState: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Interactive Disabled</h3>
        <p className="text-sm text-gray-600 mb-4">50% opacity, cannot be clicked</p>
        <Container
          variant="interactive"
          disabled
          onClick={() => alert('This should not fire!')}
        >
          <Card>
            <h3 className="font-semibold text-sm">Card 1</h3>
            <p className="text-xs text-gray-600">This container is disabled</p>
          </Card>
          <Card>
            <h3 className="font-semibold text-sm">Card 2</h3>
            <p className="text-xs text-gray-600">Sample content</p>
          </Card>
        </Container>
      </div>
    </div>
  ),
};

export const WithHeaderAndContent: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Container with Header Row</h3>
        <Container>
          {/* Header Row */}
          <div className="flex items-center justify-between w-full">
            <h2 className="text-base font-semibold">January</h2>
            <Button type="outlined" size="small" label="+" />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2 w-full">
            <Card>
              <h3 className="font-medium text-sm">Flu Shot Campaign</h3>
              <div className="inline-flex items-center px-1.5 py-0.5 bg-gray-200 rounded text-xs">
                Annual
              </div>
            </Card>
            <Card>
              <h3 className="font-medium text-sm">COVID-19 Booster</h3>
              <div className="inline-flex items-center px-1.5 py-0.5 bg-gray-200 rounded text-xs">
                Seasonal
              </div>
            </Card>
          </div>
        </Container>
      </div>
    </div>
  ),
};

export const NestedContent: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Complex Nested Content</h3>
        <Container gap="lg">
          {/* Section 1 */}
          <div className="w-full">
            <h3 className="text-sm font-semibold mb-2">Active Events</h3>
            <div className="flex flex-col gap-2">
              <Card>
                <h4 className="font-medium text-sm">Event 1</h4>
                <p className="text-xs text-gray-600">Description here</p>
              </Card>
              <Card>
                <h4 className="font-medium text-sm">Event 2</h4>
                <p className="text-xs text-gray-600">Description here</p>
              </Card>
            </div>
          </div>

          {/* Section 2 */}
          <div className="w-full">
            <h3 className="text-sm font-semibold mb-2">Completed Events</h3>
            <div className="flex flex-col gap-2">
              <Card>
                <h4 className="font-medium text-sm">Event 3</h4>
                <p className="text-xs text-gray-600">Description here</p>
              </Card>
            </div>
          </div>
        </Container>
      </div>
    </div>
  ),
};

export const RealWorldExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Event Planning Dashboard</h3>
        <Container>
          <div className="flex items-center justify-between w-full">
            <h2 className="text-base font-semibold">Upcoming Events</h2>
            <Button type="generative" size="small" label="Add Event" />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Card variant="interactive" onClick={() => console.log('Event clicked')}>
              <h3 className="font-medium text-sm">Annual Health Fair</h3>
              <p className="text-xs text-gray-600">March 15, 2025</p>
              <div className="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                Active
              </div>
            </Card>
            <Card variant="interactive" onClick={() => console.log('Event clicked')}>
              <h3 className="font-medium text-sm">Flu Shot Campaign</h3>
              <p className="text-xs text-gray-600">Ongoing</p>
              <div className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                Seasonal
              </div>
            </Card>
          </div>
        </Container>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Collapsible Sections</h3>
        <div className="space-y-4">
          <Container
            variant="interactive"
            gap="sm"
            onClick={() => console.log('Section clicked')}
            aria-label="January events section"
          >
            <div className="flex items-center justify-between w-full">
              <h3 className="text-sm font-semibold">January</h3>
              <span className="text-xs text-gray-500">3 events</span>
            </div>
          </Container>

          <Container
            variant="interactive"
            gap="sm"
            onClick={() => console.log('Section clicked')}
            aria-label="February events section"
          >
            <div className="flex items-center justify-between w-full">
              <h3 className="text-sm font-semibold">February</h3>
              <span className="text-xs text-gray-500">5 events</span>
            </div>
          </Container>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Material Categories</h3>
        <Container gap="sm">
          <h3 className="text-sm font-semibold w-full">Marketing Materials</h3>
          <div className="flex flex-col gap-1 w-full">
            <Card variant="non-interactive">
              <p className="text-sm">Brochure - Flu Prevention</p>
            </Card>
            <Card variant="non-interactive">
              <p className="text-sm">Poster - Vaccination Schedule</p>
            </Card>
            <Card variant="non-interactive">
              <p className="text-sm">Flyer - Health Fair 2025</p>
            </Card>
          </div>
        </Container>
      </div>
    </div>
  ),
};

export const InteractiveStates: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Hover States</h3>
        <p className="text-sm text-gray-600 mb-4">
          Hover over the interactive container to see the background change
        </p>
        <Container
          variant="interactive"
          onClick={() => console.log('Container clicked')}
        >
          <Card>
            <h3 className="font-semibold text-sm">Interactive Container</h3>
            <p className="text-xs text-gray-600">
              Background changes from rgba(0,0,0,0.06) to rgba(0,0,0,0.12) on hover
            </p>
          </Card>
        </Container>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Keyboard Navigation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Click to focus, then press Enter or Space to activate
        </p>
        <Container
          variant="interactive"
          onClick={() => alert('Container activated via keyboard!')}
          aria-label="Keyboard accessible container"
        >
          <Card>
            <h3 className="font-semibold text-sm">Try Keyboard Navigation</h3>
            <p className="text-xs text-gray-600">
              Click to focus, then press Enter or Space
            </p>
          </Card>
        </Container>
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
        <ul className="text-sm space-y-2 mb-4 text-gray-700">
          <li>✓ Proper role="button" for interactive containers</li>
          <li>✓ Keyboard navigation (Enter/Space)</li>
          <li>✓ Focus ring for keyboard users</li>
          <li>✓ aria-disabled state</li>
          <li>✓ aria-label support</li>
        </ul>
        <Container
          variant="interactive"
          onClick={() => console.log('Accessible container clicked')}
          aria-label="Example accessible container with multiple cards"
        >
          <Card>
            <h3 className="font-semibold text-sm">Accessible Container</h3>
            <p className="text-xs text-gray-600">
              This container follows WCAG accessibility guidelines
            </p>
          </Card>
        </Container>
      </div>
    </div>
  ),
};

export const SemanticHTML: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Semantic Element Variants</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">as="section"</p>
            <Container as="section" aria-label="Events section">
              <Card>
                <h3 className="font-semibold text-sm">Section Container</h3>
              </Card>
            </Container>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">as="article"</p>
            <Container as="article">
              <Card>
                <h3 className="font-semibold text-sm">Article Container</h3>
              </Card>
            </Container>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">as="aside"</p>
            <Container as="aside">
              <Card>
                <h3 className="font-semibold text-sm">Aside Container</h3>
              </Card>
            </Container>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ClaudeCodeExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6">Working with Claude Code (AI Assistant)</h2>
      <p className="text-gray-600 mb-8">Use these natural language prompts when working with Container.</p>
      <div className="space-y-6">
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3"><span className="text-blue-600">📋</span> Create Container Layout</h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">"Wrap these cards in a container with medium gap spacing"</code>
          </div>
          <p className="text-sm text-gray-600"><strong>Expected:</strong> Claude will wrap content in Container with <code className="bg-gray-100 px-1">gap="medium"</code></p>
        </div>
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3"><span className="text-green-600">📏</span> Adjust Gap</h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">"Increase spacing between items in this container"</code>
          </div>
          <p className="text-sm text-gray-600"><strong>Expected:</strong> Claude will change gap prop to a larger value</p>
        </div>
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3"><span className="text-purple-600">🎨</span> Make Interactive</h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">"Make this container clickable as a whole"</code>
          </div>
          <p className="text-sm text-gray-600"><strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1">variant="interactive"</code> and onClick handler</p>
        </div>
      </div>
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use Container to group related elements with consistent spacing</li>
          <li>• Gap options: x-small, small, medium, large, x-large</li>
          <li>• Interactive variant for clickable container groups</li>
        </ul>
      </div>
    </div>
  ),
};
