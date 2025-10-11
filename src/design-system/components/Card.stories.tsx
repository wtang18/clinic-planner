import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from './Button';
import { Pill } from './Pill';

const meta: Meta<typeof Card> = {
  title: 'Design System/Components/Card',
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
# Card Component

Production-ready card container with semantic token integration and flexible layout support.

## Quick Reference

**Variants**: 2 types (interactive, non-interactive)
**Sizes**: 2 sizes (small, medium)
**Tokens**: Uses semantic elevation and neutral tokens for theme support

---

## Features

- ✅ **Semantic Tokens**: Uses \`--color-bg-*\` tokens and elevation classes for automatic theme support
- ✅ **Flexible Container**: Wraps any content with consistent spacing and layout
- ✅ **Interactive States**: Hover shadow elevation for clickable cards
- ✅ **Accessibility**: Proper keyboard navigation and ARIA support
- ✅ **Semantic HTML**: Can render as any HTML element (div, section, article, etc.)

---

## Variants

| Variant | Shadow | Hover Effect | Cursor | Use Case |
|---------|--------|--------------|--------|----------|
| \`non-interactive\` | None | None | Default | Static content containers |
| \`interactive\` | elevation | elevation-md | Pointer | Clickable cards, navigation |

---

## Sizes

| Size | Border Radius | Padding | Gap | Use Case |
|------|---------------|---------|-----|----------|
| \`small\` | 8px | 12px | 8px | Compact layouts, dense lists |
| \`medium\` | 16px | 16px | 16px | **Default - Most common** |

---

## Token Usage

Cards use semantic tokens and Figma elevation classes:

\`\`\`tsx
// Non-interactive card
<Card variant="non-interactive">
  // Uses: bg-neutral-base, no shadow
</Card>

// Interactive card (default shadow)
<Card variant="interactive" onClick={() => {}}>
  // Uses: bg-neutral-base, elevation class
  // Hover: elevation-md class
</Card>
\`\`\`

---

## Best Practices

### ✅ When to Use Cards

- Group related information together
- Create clickable navigation targets
- Display list items with consistent styling
- Organize dashboard sections
- Wrap form sections or settings groups

### ✅ Do

- Use \`interactive\` variant for clickable cards
- Provide \`onClick\` handler for interactive cards
- Use \`aria-label\` for interactive cards without clear text
- Group related content within a single card
- Use \`small\` size for dense layouts, \`medium\` for standard layouts

### ❌ Don't

- Use cards for single text elements (use Pills or Buttons instead)
- Nest interactive cards within other interactive elements
- Use non-interactive variant with onClick handler
- Forget keyboard accessibility for interactive cards
- Mix card sizes inconsistently in the same list
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
            <p className="text-sm text-gray-600">Click me! Elevates from shadow to shadow-md on hover</p>
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
            <p className="text-sm text-gray-600">Has shadow, elevates to shadow-md on hover</p>
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

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
        <p className="text-sm text-gray-700 mb-4">
          Interactive cards are fully keyboard accessible and follow WCAG guidelines.
        </p>
        <ul className="text-sm space-y-2 mb-6 text-gray-700">
          <li>✓ Proper role="button" for interactive cards</li>
          <li>✓ Keyboard navigation (Tab to focus, Enter/Space to click)</li>
          <li>✓ Visible focus ring for keyboard users</li>
          <li>✓ aria-label support for cards without descriptive text</li>
          <li>✓ aria-disabled state for disabled cards</li>
        </ul>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-600 mb-2">Interactive card with clear text (no aria-label needed):</p>
            <Card
              variant="interactive"
              onClick={() => alert('Card clicked!')}
            >
              <h4 className="text-base font-semibold">Event Details</h4>
              <p className="text-sm text-gray-600">Click to view more information</p>
            </Card>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-2">Interactive card with aria-label for clarity:</p>
            <Card
              variant="interactive"
              onClick={() => alert('Card clicked!')}
              aria-label="View patient record for John Doe"
            >
              <h4 className="text-base font-semibold">John Doe</h4>
              <p className="text-sm text-gray-600">Last visit: Jan 15, 2025</p>
            </Card>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-2">Disabled interactive card:</p>
            <Card
              variant="interactive"
              disabled
            >
              <h4 className="text-base font-semibold">Disabled Card</h4>
              <p className="text-sm text-gray-600">This card cannot be interacted with</p>
            </Card>
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
      <p className="text-gray-600 mb-8">
        Use these natural language prompts to work with Claude Code when using the Card component.
      </p>

      <div className="space-y-8">
        {/* Update Card Variant */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-600">🎨</span>
            Make Card Interactive
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Make this card clickable so users can navigate to the event details page"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">variant="interactive"</code> and <code className="bg-gray-100 px-1 rounded">onClick</code> handler
          </p>
        </div>

        {/* Change Card Size */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">📏</span>
            Adjust Card Size
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Use the small card size for this compact event list"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">size="small"</code>
          </p>
        </div>

        {/* Add Accessibility */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-orange-600">♿</span>
            Improve Accessibility
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add an accessible label to this interactive card that describes the patient's name and last visit date"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">aria-label="View patient record for [name], last visit [date]"</code>
          </p>
        </div>

        {/* Create Card List */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">📋</span>
            Create Consistent Card Layout
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Create a grid of interactive cards for the event list, using medium size with consistent spacing"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will create a responsive grid layout with Card components using appropriate variant and size
          </p>
        </div>

        {/* Disable Card */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-red-600">🚫</span>
            Disable Interaction
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Disable this card when the event is in the past"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add conditional <code className="bg-gray-100 px-1 rounded">disabled={'{isEventPast}'}</code> prop
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use <code className="bg-white px-1 rounded">variant="interactive"</code> for clickable cards</li>
          <li>• Always provide onClick handler for interactive cards</li>
          <li>• Use <code className="bg-white px-1 rounded">aria-label</code> for cards without descriptive text content</li>
          <li>• Cards use semantic tokens that automatically adapt to light/dark themes</li>
        </ul>
      </div>
    </div>
  ),
};
