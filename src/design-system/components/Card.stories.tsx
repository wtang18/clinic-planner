import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from './Button';
import { Pill } from './Pill';

const meta: Meta<typeof Card> = {
  title: 'Design System/Card',
  component: Card,
  argTypes: {
    // Core variant props
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'The size of the card',
    },
    variant: {
      control: 'select',
      options: ['interactive', 'non-interactive'],
      description: 'Whether the card is clickable/interactive',
    },

    // State props
    disabled: {
      control: 'boolean',
      description: 'Whether the card is disabled (interactive variant only)',
      if: { arg: 'variant', eq: 'interactive' },
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the card',
      table: {
        category: 'Accessibility',
      },
    },
  },

  parameters: {
    controls: {
      exclude: ['children', 'className', 'style', 'ref', 'key', 'as', 'onClick'],
    },
    docs: {
      description: {
        component: `
Card component with Figma design system integration.

## Size Specifications
- **Small**: 8px border radius, 12px padding, 8px gap
- **Medium** (default): 16px border radius, 16px padding, 16px gap

## Variant Specifications
- **Interactive**: Clickable/hoverable card with shadow effects and cursor pointer
- **Non-interactive**: Static container without shadow

Interactive cards show a default shadow and a hover shadow effect.
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  args: {
    size: 'medium',
    variant: 'non-interactive',
    disabled: false,
    children: (
      <>
        <h3 className="text-base font-semibold">Card Title</h3>
        <p className="text-sm text-gray-600">Card content goes here</p>
      </>
    ),
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Card Sizes</h3>
        <div className="flex flex-wrap gap-4">
          <Card size="small">
            <h4 className="text-sm font-semibold">Small Card</h4>
            <p className="text-xs text-gray-600">8px radius, 12px padding</p>
          </Card>
          <Card size="medium">
            <h4 className="text-base font-semibold">Medium Card</h4>
            <p className="text-sm text-gray-600">16px radius, 16px padding</p>
          </Card>
        </div>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Card Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Card variant="non-interactive">
            <h4 className="text-base font-semibold">Non-Interactive</h4>
            <p className="text-sm text-gray-600">Static container without shadow</p>
          </Card>
          <Card variant="interactive" onClick={() => alert('Card clicked!')}>
            <h4 className="text-base font-semibold">Interactive</h4>
            <p className="text-sm text-gray-600">Click me! Has shadow and hover effect</p>
          </Card>
          <Card variant="interactive" disabled>
            <h4 className="text-base font-semibold">Disabled Interactive</h4>
            <p className="text-sm text-gray-600">Cannot be clicked, 50% opacity</p>
          </Card>
        </div>
      </div>
    </div>
  ),
};

export const WithComplexContent: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Cards with Complex Content</h3>
        <div className="flex flex-wrap gap-4">
          {/* Event Card Example */}
          <Card size="small" variant="interactive" className="max-w-xs">
            <h4 className="text-sm font-medium">World Heart Day</h4>
            <p className="text-xs text-gray-600">Sep 29 – Oct 1</p>
            <div className="flex gap-1.5 mt-1.5">
              <Pill type="transparent" size="small" label="Primary Care" />
              <Pill type="transparent" size="small" label="Yearly" />
            </div>
          </Card>

          {/* Detail Card Example */}
          <Card size="medium" className="max-w-md">
            <p className="text-sm font-medium text-gray-600">Urgent Care Perspective</p>
            <p className="text-base text-gray-900">
              Focus on emergency cardiovascular events and urgent care protocols for heart-related emergencies.
            </p>
          </Card>

          {/* Material Card Example */}
          <Card size="medium" className="max-w-md">
            <div className="flex items-center justify-between w-full">
              <h4 className="text-base font-medium flex-1">Marketing Material</h4>
              <div className="flex gap-2">
                <Button type="no-fill" size="x-small" iconOnly iconL="pencil" aria-label="Edit" />
                <Button type="no-fill" size="x-small" iconOnly iconL="trash" aria-label="Delete" />
              </div>
            </div>
            <div className="flex gap-2">
              <Pill type="transparent" size="small" label="World Heart Day" />
              <Pill
                type="transparent"
                size="small"
                subtextL="URL"
                label="example.com/heart-health"
                truncate
                className="max-w-[150px]"
              />
            </div>
            <p className="text-sm text-gray-600">Campaign materials for heart health awareness</p>
            <div className="flex justify-between w-full text-xs text-gray-400">
              <span>Created Jan 15, 2025</span>
              <span>Updated Jan 20, 2025</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveStates: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Interactive Card States</h3>
        <p className="text-sm text-gray-600 mb-4">
          Interactive cards show different visual states. Hover over the cards to see the effect.
        </p>
        <div className="flex flex-wrap gap-4">
          <Card variant="interactive" onClick={() => console.log('Default state clicked')}>
            <h4 className="text-base font-semibold">Default State</h4>
            <p className="text-sm text-gray-600">Has default shadow, shows hover shadow on hover</p>
          </Card>
          <Card variant="interactive" disabled>
            <h4 className="text-base font-semibold">Disabled State</h4>
            <p className="text-sm text-gray-600">50% opacity, no shadow, cannot be clicked</p>
          </Card>
        </div>
      </div>
    </div>
  ),
};

export const ResponsiveLayout: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Responsive Grid Layout</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} variant="interactive">
              <h4 className="text-base font-semibold">Card {i}</h4>
              <p className="text-sm text-gray-600">
                This card is part of a responsive grid layout that adapts to different screen sizes.
              </p>
              <Button type="no-fill" size="small" label="View Details" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  ),
};
