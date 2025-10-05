import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pill } from './Pill';

const meta: Meta<typeof Pill> = {
  title: 'Design System/Pill',
  component: Pill,
  argTypes: {
    // Core variant props
    type: {
      control: 'select',
      options: ['transparent', 'outlined', 'subtle-outlined', 'positive', 'attention', 'alert', 'high-alert', 'info', 'important-info', 'accent', 'no-fill', 'carby'],
      description: 'The visual style variant of the pill',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
      description: 'The size of the pill',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Whether to show only an icon (no text)',
    },

    // Content props
    label: {
      control: 'text',
      description: 'The main label text',
      if: { arg: 'iconOnly', truthy: false },
    },

    // Icon props
    // Note: iconL and iconR accept IconName types (386+ options) which don't work well with Storybook controls
    // Icon names must be specified directly in code (see IconVariations story for examples)
    // Icon size is automatically 20px (small) for all pill sizes
    // Icons render automatically when iconL/iconR props are provided

    // Subtext props
    showSubtextL: {
      control: 'boolean',
      description: 'Show left subtext',
      if: { arg: 'iconOnly', truthy: false },
    },
    subtextL: {
      control: 'text',
      description: 'Left subtext content',
      if: {
        arg: 'showSubtextL',
        truthy: true
      },
      table: {
        defaultValue: { summary: 'Left' },
      },
    },
    showSubtextR: {
      control: 'boolean',
      description: 'Show right subtext',
      if: { arg: 'iconOnly', truthy: false },
    },
    subtextR: {
      control: 'text',
      description: 'Right subtext content',
      if: {
        arg: 'showSubtextR',
        truthy: true
      },
      table: {
        defaultValue: { summary: 'Right' },
      },
    },

    // Interaction props
    interactive: {
      control: 'boolean',
      description: 'Whether the pill is interactive (clickable)',
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'disabled'],
      description: 'Visual state (only applies when interactive)',
      if: { arg: 'interactive', truthy: true },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state (alias for state="disabled")',
      if: { arg: 'interactive', truthy: true },
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label (required for icon-only pills)',
      table: {
        category: 'Accessibility',
      },
    },
    'aria-describedby': {
      control: 'text',
      description: 'ID of element describing the pill',
      table: {
        category: 'Accessibility',
      },
    },
  },

  parameters: {
    controls: {
      // Exclude icon and React props from controls
      exclude: ['iconL', 'iconR', 'leftIcon', 'rightIcon', 'onClick', 'children', 'className', 'style', 'ref', 'key'],
    },
    docs: {
      description: {
        component: `
Pill/Badge component with Figma design system integration.

## Icon Props
The \`iconL\` and \`iconR\` props accept icon names from the icon library (386+ options). Examples:
- \`iconL="star"\` - Star icon on left
- \`iconR="chevron-down"\` - Chevron down icon on right
- \`iconL="checkmark" iconR="arrow-right"\` - Custom icon combination

Icons render automatically when iconL/iconR props are provided.

## Subtext Props
The \`subtextL\` and \`subtextR\` props add small text before/after the label:
- Shown by default when content is provided
- Use \`showSubtextL={false}\` or \`showSubtextR={false}\` to hide them
- Hidden automatically when \`iconOnly={true}\`

See the IconVariations and WithSubtexts stories for examples.
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pill>;

export const Playground: Story = {
  args: {
    type: 'transparent',
    size: 'md',
    iconOnly: false,
    label: 'Pill Label',
    showSubtextL: false,
    showSubtextR: false,
    interactive: false,
    state: 'default',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">All 12 Pill Types</h3>
        <div className="flex flex-wrap gap-2">
          <Pill type="transparent" label="Transparent" />
          <Pill type="outlined" label="Outlined" />
          <Pill type="subtle-outlined" label="Subtle Outlined" />
          <Pill type="positive" label="Positive" />
          <Pill type="attention" label="Attention" />
          <Pill type="alert" label="Alert" />
          <Pill type="high-alert" label="High Alert" />
          <Pill type="info" label="Info" />
          <Pill type="important-info" label="Important Info" />
          <Pill type="accent" label="Accent" />
          <Pill type="no-fill" label="No Fill" />
          <Pill type="carby" label="Carby" />
        </div>
      </div>
    </div>
  ),
};

export const WithSubtexts: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Subtexts (shown by default when provided)</h3>
        <div className="flex flex-wrap gap-2">
          <Pill size="md" label="Tasks" subtextL="3" subtextR="pending" />
          <Pill size="sm" label="Completed" subtextL="✓" />
          <Pill size="xs" label="2024" subtextL="Q1" subtextR="Jan" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Subtexts explicitly hidden with showSubtext=false</h3>
        <div className="flex flex-wrap gap-2">
          <Pill size="md" label="Tasks" subtextL="3" subtextR="pending" showSubtextL={false} />
          <Pill size="md" label="Tasks" subtextL="3" subtextR="pending" showSubtextR={false} />
          <Pill size="md" label="Tasks" subtextL="3" subtextR="pending" showSubtextL={false} showSubtextR={false} />
        </div>
      </div>
    </div>
  ),
};

export const IconVariations: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Icon Library Examples</h3>
        <p className="text-sm text-gray-600 mb-4">
          The icon system provides 386+ icons. Specify icon names via iconL and iconR props.
        </p>
        <div className="flex flex-wrap gap-2">
          <Pill iconL="checkmark" label="Checkmark" />
          <Pill iconL="heart" label="Favorite" />
          <Pill iconL="star" label="Star" />
          <Pill iconL="bell" label="Notifications" />
          <Pill iconL="calendar" label="Schedule" />
          <Pill iconL="envelope" label="Email" />
          <Pill iconL="phone" label="Call" />
          <Pill iconL="trash" label="Delete" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Navigation Icons</h3>
        <div className="flex flex-wrap gap-2">
          <Pill iconL="arrow-left" label="Back" type="outlined" />
          <Pill iconR="arrow-right" label="Next" type="outlined" />
          <Pill iconL="arrow-up" label="Up" type="outlined" />
          <Pill iconR="arrow-down" label="Down" type="outlined" />
          <Pill iconL="home" label="Home" type="outlined" />
          <Pill iconR="external-link" label="Open" type="outlined" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Status Icons</h3>
        <div className="flex flex-wrap gap-2">
          <Pill iconL="checkmark" label="Success" type="positive" />
          <Pill iconL="alert" label="Warning" type="attention" />
          <Pill iconL="close" label="Error" type="alert" />
          <Pill iconL="info" label="Info" type="info" />
          <Pill iconL="star" label="Featured" type="accent" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Icon-Only Pills (sm/md only)</h3>
        <div className="flex flex-wrap gap-2">
          <Pill size="md" iconOnly iconL="gear" aria-label="Settings" />
          <Pill size="sm" iconOnly iconL="star" aria-label="Favorite" />
          <Pill size="md" iconOnly iconL="checkmark" type="positive" aria-label="Success" />
          <Pill size="md" iconOnly iconL="close" type="alert" aria-label="Close" />
          <Pill size="sm" iconOnly iconL="info" type="info" aria-label="Info" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Combined Icons (Left + Right)</h3>
        <div className="flex flex-wrap gap-2">
          <Pill iconL="star" label="Featured" iconR="chevron-compact-down" />
          <Pill iconL="calendar" label="Schedule" iconR="arrow-right" type="outlined" />
          <Pill iconL="alert" label="Alert" iconR="close" type="attention" />
        </div>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Extra Small (xs) - 20px height, no icons</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="xs" label="Extra Small" />
          <Pill size="xs" type="positive" label="Success" />
          <Pill size="xs" subtextL="Q1" label="2024" subtextR="Jan" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Small (sm) - 24px height, icons supported</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="sm" label="Small" />
          <Pill size="sm" type="positive" label="Success" />
          <Pill size="sm" iconL="checkmark" label="With Icon" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Medium (md) - 32px height, icons supported</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="md" label="Medium" />
          <Pill size="md" type="positive" label="Success" />
          <Pill size="md" iconL="checkmark" label="With Icon" />
        </div>
      </div>
    </div>
  ),
};

export const InteractiveStates: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Interactive Pills (hover to see effect)</h3>
        <div className="flex flex-wrap gap-2">
          <Pill type="positive" label="Interactive Positive" interactive onClick={() => alert('Clicked!')} />
          <Pill type="outlined" label="Interactive Outlined" interactive onClick={() => alert('Clicked!')} />
          <Pill type="no-fill" label="Interactive No Fill" interactive onClick={() => alert('Clicked!')} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Disabled Pills</h3>
        <div className="flex flex-wrap gap-2">
          <Pill type="transparent" label="Disabled" disabled />
          <Pill type="positive" label="Disabled Positive" disabled />
          <Pill type="alert" label="Disabled Alert" disabled />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">State Variants (interactive required)</h3>
        <div className="flex flex-wrap gap-2">
          <Pill type="positive" label="Default State" interactive state="default" />
          <Pill type="positive" label="Hover State" interactive state="hover" />
          <Pill type="positive" label="Disabled State" interactive state="disabled" />
        </div>
      </div>
    </div>
  ),
};

export const IconOnlyCentering: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Icon-Only Pills - Properly Centered</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="md" iconOnly iconL="gear" aria-label="Settings" />
          <Pill size="sm" iconOnly iconL="star" aria-label="Favorite" />
          <Pill size="md" iconOnly iconL="checkmark" type="positive" aria-label="Success" />
          <Pill size="md" iconOnly iconL="close" type="alert" aria-label="Close" />
          <Pill size="sm" iconOnly iconL="info" type="info" aria-label="Info" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Comparison: Icon-Only vs Regular Pills (Same Size)</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="md" iconOnly iconL="star" aria-label="Favorite" type="accent" />
          <Pill size="md" iconL="star" label="Favorite" type="accent" />
        </div>
      </div>
    </div>
  ),
};

export const AdvancedExamples: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Complex Pills with All Features</h3>
        <div className="flex flex-wrap gap-2">
          <Pill
            type="attention"
            size="md"
            label="Alert"
            iconL="alert"
            subtextR="2"
            interactive
            onClick={() => alert('Alert clicked!')}
          />
          <Pill
            type="positive"
            size="md"
            label="Download"
            iconR="arrow-down"
            interactive
            onClick={() => alert('Download clicked!')}
          />
          <Pill
            type="info"
            size="sm"
            iconL="info"
            subtextL="i"
            label="Information"
            subtextR="new"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Accessibility: Icon-only with aria-label</h3>
        <div className="flex flex-wrap gap-2">
          <Pill size="md" iconOnly iconL="close" type="alert" aria-label="Close notification" interactive />
          <Pill size="md" iconOnly iconL="heart" type="positive" aria-label="Like this item" interactive />
          <Pill size="sm" iconOnly iconL="share" type="info" aria-label="Share content" interactive />
        </div>
      </div>
    </div>
  ),
};
