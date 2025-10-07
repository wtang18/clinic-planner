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
      options: ['x-small', 'small', 'medium'],
      description: 'The size of the pill',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Whether to show only an icon (no text)',
    },
    truncate: {
      control: 'boolean',
      description: 'Truncate text with ellipsis when it overflows (use with max-width constraints)',
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

## Truncation
The \`truncate\` prop enables text truncation with ellipsis:
- Set \`truncate={true}\` on the Pill component
- Apply a max-width constraint via \`className\` (e.g., \`className="max-w-[200px]"\`)
- Text will automatically truncate with \`...\` when it exceeds the max-width
- Subtexts are preserved and won't truncate (useful for labels like "URL")

See the TextTruncation story for examples.
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
    truncate: false,
    label: 'Pill Label',
    showSubtextL: false,
    showSubtextR: false,
    interactive: false,
    state: 'default',
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes (e.g., "max-w-[200px]" for truncation)',
      if: { arg: 'truncate', truthy: true },
    },
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
          <Pill size="medium" label="Tasks" subtextL="3" subtextR="pending" />
          <Pill size="small" label="Completed" subtextL="✓" />
          <Pill size="x-small" label="2024" subtextL="Q1" subtextR="Jan" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Subtexts explicitly hidden with showSubtext=false</h3>
        <div className="flex flex-wrap gap-2">
          <Pill size="medium" label="Tasks" subtextL="3" subtextR="pending" showSubtextL={false} />
          <Pill size="medium" label="Tasks" subtextL="3" subtextR="pending" showSubtextR={false} />
          <Pill size="medium" label="Tasks" subtextL="3" subtextR="pending" showSubtextL={false} showSubtextR={false} />
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
          <Pill size="medium" iconOnly iconL="gear" aria-label="Settings" />
          <Pill size="small" iconOnly iconL="star" aria-label="Favorite" />
          <Pill size="medium" iconOnly iconL="checkmark" type="positive" aria-label="Success" />
          <Pill size="medium" iconOnly iconL="close" type="alert" aria-label="Close" />
          <Pill size="small" iconOnly iconL="info" type="info" aria-label="Info" />
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
          <Pill size="x-small" label="Extra Small" />
          <Pill size="x-small" type="positive" label="Success" />
          <Pill size="x-small" subtextL="Q1" label="2024" subtextR="Jan" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Small (sm) - 24px height, icons supported</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="small" label="Small" />
          <Pill size="small" type="positive" label="Success" />
          <Pill size="small" iconL="checkmark" label="With Icon" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Medium (md) - 32px height, icons supported</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="medium" label="Medium" />
          <Pill size="medium" type="positive" label="Success" />
          <Pill size="medium" iconL="checkmark" label="With Icon" />
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
          <Pill size="medium" iconOnly iconL="gear" aria-label="Settings" />
          <Pill size="small" iconOnly iconL="star" aria-label="Favorite" />
          <Pill size="medium" iconOnly iconL="checkmark" type="positive" aria-label="Success" />
          <Pill size="medium" iconOnly iconL="close" type="alert" aria-label="Close" />
          <Pill size="small" iconOnly iconL="info" type="info" aria-label="Info" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Comparison: Icon-Only vs Regular Pills (Same Size)</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <Pill size="medium" iconOnly iconL="star" aria-label="Favorite" type="accent" />
          <Pill size="medium" iconL="star" label="Favorite" type="accent" />
        </div>
      </div>
    </div>
  ),
};

export const TextTruncation: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Text Truncation with Max-Width Constraints</h3>
        <p className="text-sm text-gray-600 mb-4">
          When <code>truncate={'{true}'}</code>, text will truncate with ellipsis at the max-width boundary.
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">max-w-[150px]</p>
            <Pill
              type="transparent"
              size="small"
              label="This is a very long text that will be truncated"
              truncate
              className="max-w-[150px]"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">max-w-[200px]</p>
            <Pill
              type="transparent"
              size="small"
              label="This is a very long text that will be truncated"
              truncate
              className="max-w-[200px]"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">max-w-[300px]</p>
            <Pill
              type="transparent"
              size="small"
              label="This is a very long text that will be truncated"
              truncate
              className="max-w-[300px]"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Truncation with Subtexts (Subtexts Preserved)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Subtexts have <code>shrink-0</code> and won't truncate, ensuring labels like "URL" remain visible.
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">URL Pill - max-w-[200px]</p>
            <Pill
              type="transparent"
              size="small"
              subtextL="URL"
              label="https://www.example.com/very-long-path/to/resource/page.html"
              truncate
              className="max-w-[200px]"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">File Path - max-w-[250px]</p>
            <Pill
              type="transparent"
              size="small"
              subtextL="Path"
              label="/Users/username/Documents/Projects/my-project/src/components/design-system/Pill.tsx"
              truncate
              className="max-w-[250px]"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Email - max-w-[180px]</p>
            <Pill
              type="transparent"
              size="small"
              subtextL="To"
              label="very.long.email.address@example-domain.com"
              truncate
              className="max-w-[180px]"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Without Truncation (Comparison)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Without <code>truncate</code> prop, text overflows the container.
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">No truncate - max-w-[200px] (text overflows)</p>
            <Pill
              type="transparent"
              size="small"
              label="This is a very long text that will overflow the container"
              className="max-w-[200px]"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">With truncate - max-w-[200px] (text truncates with ellipsis)</p>
            <Pill
              type="transparent"
              size="small"
              label="This is a very long text that will overflow the container"
              truncate
              className="max-w-[200px]"
            />
          </div>
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
            size="medium"
            label="Alert"
            iconL="alert"
            subtextR="2"
            interactive
            onClick={() => alert('Alert clicked!')}
          />
          <Pill
            type="positive"
            size="medium"
            label="Download"
            iconR="arrow-down"
            interactive
            onClick={() => alert('Download clicked!')}
          />
          <Pill
            type="info"
            size="small"
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
          <Pill size="medium" iconOnly iconL="close" type="alert" aria-label="Close notification" interactive />
          <Pill size="medium" iconOnly iconL="heart" type="positive" aria-label="Like this item" interactive />
          <Pill size="small" iconOnly iconL="share" type="info" aria-label="Share content" interactive />
        </div>
      </div>
    </div>
  ),
};
