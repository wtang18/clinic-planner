import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  argTypes: {
    // Core variant props
    type: {
      control: 'select',
      options: ['primary', 'outlined', 'solid', 'transparent', 'generative', 'high-impact', 'no-fill', 'subtle', 'carby'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['x-small', 'small', 'medium', 'large', 'large-floating'],
      description: 'The size of the button',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Whether to show only an icon (no text)',
    },

    // Text content
    label: {
      control: 'text',
      description: 'The main text label of the button',
      if: { arg: 'iconOnly', truthy: false },
    },

    // Icon props
    // Note: iconL and iconR accept IconName types (386+ options) which don't work well with Storybook controls
    // Icon names must be specified directly in code (see IconVariations story for examples)
    // Icon size is automatically determined by button size: 20px for xSmall/small/medium, 24px for large/largeFloating

    // Subtext props
    showSubtext: {
      control: 'boolean',
      description: 'Show inline subtext after the label',
      if: { arg: 'iconOnly', truthy: false },
    },
    subtext: {
      control: 'text',
      description: 'The subtext content',
      if: {
        arg: 'showSubtext',
        truthy: true
      },
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the button',
      table: {
        category: 'Accessibility',
      },
    },
    'aria-describedby': {
      control: 'text',
      description: 'ID of element that describes the button',
      table: {
        category: 'Accessibility',
      },
    },

    // State props
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'disabled'],
      description: 'The state of the button',
    },
  },

  parameters: {
    controls: {
      // Exclude icon and React props from controls
      exclude: ['iconL', 'iconR', 'leftIcon', 'rightIcon', 'showText', 'children', 'className', 'style', 'ref', 'key'],
    },
    docs: {
      description: {
        component: `
Button component with Figma design system integration.

## Icon Sizing
Icons are automatically sized based on button size:
- **Small icons (20px)**: xSmall, small, medium buttons
- **Medium icons (24px)**: large, largeFloating buttons

Icon size is determined by the button's \`size\` prop, not a separate icon size prop.

## Icon Props
The \`iconL\` and \`iconR\` props accept icon names from the icon library (386+ options). Examples:
- \`iconL="star"\` - Star icon on left
- \`iconR="chevron-down"\` - Chevron down icon on right
- \`iconL="checkmark" iconR="arrow-right"\` - Custom icon combination

See the IconVariations story for more examples.
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  args: {
    type: 'primary',
    size: 'medium',
    iconOnly: false,
    label: 'Button',
    showSubtext: false,
    subtext: 'Subtext',
    disabled: false,
    state: 'default',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Button Types</h3>
        <div className="flex flex-wrap gap-4">
          <Button type="primary" label="Primary" />
          <Button type="outlined" label="Outlined" />
          <Button type="solid" label="Solid" />
          <Button type="transparent" label="Transparent" />
          <Button type="generative" label="Generative" />
          <Button type="high-impact" label="High Impact" />
          <Button type="no-fill" label="No Fill" />
          <Button type="subtle" label="Subtle" />
          <Button type="carby" label="Carby" />
        </div>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Button Sizes</h3>
        <div className="flex items-end gap-4">
          <Button size="x-small" label="X-Small" />
          <Button size="small" label="Small" />
          <Button size="medium" label="Medium" />
          <Button size="large" label="Large" />
          <Button size="large-floating" label="Large Floating" />
        </div>
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">With Icons</h3>
        <div className="flex flex-wrap gap-4">
          <Button iconL="star" label="Left Icon" />
          <Button iconR="chevron-down" label="Right Icon" />
          <Button iconL="star" iconR="chevron-down" label="Both Icons" />
          <Button iconOnly iconL="star" aria-label="Icon only button" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Icon Only Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button type="primary" iconOnly iconL="star" aria-label="Primary action" />
          <Button type="outlined" iconOnly iconL="star" aria-label="Outlined action" />
          <Button type="solid" iconOnly iconL="star" aria-label="Solid action" />
          <Button type="transparent" iconOnly iconL="star" aria-label="Transparent action" />
          <Button type="generative" iconOnly iconL="star" aria-label="Generate" />
          <Button type="high-impact" iconOnly iconL="star" aria-label="High impact action" />
          <Button type="no-fill" iconOnly iconL="star" aria-label="No fill action" />
          <Button type="subtle" iconOnly iconL="star" aria-label="Subtle action" />
          <Button type="carby" iconOnly iconL="star" aria-label="Carby action" />
        </div>
      </div>
    </div>
  ),
};

export const WithSubtext: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">With Inline Subtext</h3>
        <div className="flex flex-col gap-4">
          <Button
            size="small"
            label="Save"
            showSubtext
            subtext="Draft"
          />
          <Button
            size="medium"
            label="Submit"
            showSubtext
            subtext="Final"
            iconL="star"
          />
          <Button
            size="large"
            label="Download"
            showSubtext
            subtext="PDF"
            iconL="star"
            iconR="chevron-down"
          />
          <Button
            size="large-floating"
            type="high-impact"
            label="Deploy"
            showSubtext
            subtext="Production"
            iconL="star"
          />
        </div>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Button States</h3>
        <div className="flex gap-4">
          <Button state="default" label="Default" />
          <Button state="hover" label="Hover" />
          <Button state="disabled" label="Disabled" />
          <Button disabled label="Disabled (prop)" />
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
        <div className="flex flex-wrap gap-4">
          <Button iconL="checkmark" label="Checkmark" />
          <Button iconL="heart" label="Favorite" />
          <Button iconL="star" label="Star" />
          <Button iconL="bell" label="Notifications" />
          <Button iconL="calendar" label="Schedule" />
          <Button iconL="envelope" label="Email" />
          <Button iconL="phone" label="Call" />
          <Button iconL="trash" label="Delete" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Navigation Icons</h3>
        <div className="flex flex-wrap gap-4">
          <Button iconL="arrow-left" label="Back" type="outlined" />
          <Button iconR="arrow-right" label="Next" type="outlined" />
          <Button iconL="arrow-up" label="Up" type="outlined" />
          <Button iconR="arrow-down" label="Down" type="outlined" />
          <Button iconL="home" label="Home" type="outlined" />
          <Button iconR="external-link" label="Open" type="outlined" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Action Icons</h3>
        <div className="flex flex-wrap gap-4">
          <Button iconL="plus" label="Add" type="primary" />
          <Button iconL="pencil" label="Edit" type="primary" />
          <Button iconL="trash" label="Delete" type="high-impact" />
          <Button iconL="download-arrow" label="Download" type="solid" />
          <Button iconL="upload-arrow" label="Upload" type="solid" />
          <Button iconL="share-arrow" label="Share" type="transparent" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Medical Icons</h3>
        <div className="flex flex-wrap gap-4">
          <Button iconL="stethoscope" label="Exam" />
          <Button iconL="pill" label="Medication" />
          <Button iconL="syringe" label="Vaccine" />
          <Button iconL="heart-wave" label="Vitals" />
          <Button iconL="calendar" iconR="chevron-down" label="Appointments" />
        </div>
      </div>
    </div>
  ),
};

export const CustomIcons: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Custom React Element Icons</h3>
        <p className="text-sm text-gray-600 mb-4">
          For custom icons not in the library, pass React elements via leftIcon or rightIcon props
        </p>
        <div className="flex gap-4">
          <Button
            leftIcon={
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12L15 7H5L10 12Z" />
              </svg>
            }
            label="Custom Left"
          />
          <Button
            rightIcon={
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M12 10L7 5V15L12 10Z" />
              </svg>
            }
            label="Custom Right"
          />
          <Button
            type="solid"
            leftIcon={
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
              </svg>
            }
            label="Success"
          />
        </div>
      </div>
    </div>
  ),
};

export const RealWorldExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Form Actions</h3>
        <div className="flex gap-3">
          <Button type="primary" size="medium" label="Save Changes" />
          <Button type="outlined" size="medium" label="Cancel" />
          <Button type="transparent" size="medium" label="Preview" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Navigation</h3>
        <div className="flex gap-3">
          <Button type="outlined" size="small" iconL="arrow-left" label="Back" />
          <Button type="primary" size="small" iconR="arrow-right" label="Continue" />
          <Button type="no-fill" size="small" label="Skip" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Danger Actions</h3>
        <div className="flex gap-3">
          <Button type="high-impact" size="medium" label="Delete Event" />
          <Button type="high-impact" size="medium" disabled label="Confirm Delete" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-4">AI Features</h3>
        <div className="flex gap-3">
          <Button type="generative" size="medium" iconL="lightbulb" label="Generate Content" />
          <Button type="generative" size="medium" label="Analyze" showSubtext subtext="Beta" />
        </div>
      </div>
    </div>
  ),
};


export const IconTester: Story = {
  render: () => (
    <div className="p-8 space-y-6">
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700 font-semibold mb-2">Icon Testing Sandbox</p>
        <p className="text-xs text-gray-600">
          Edit the iconL and iconR props below to test different icons from your library.
          You'll get autocomplete with all 386+ available icon names.
        </p>
      </div>
      
      <div>
        <h3 className="font-bold mb-3">Test Button with Custom Icons</h3>
        <Button 
          type="transparent"
          size="medium"
          iconL="star"              // ← Edit this
          iconR="chevron-down"      // ← Edit this
          label="Test Icons" 
        />
      </div>
      
      <div>
        <h3 className="font-bold mb-3">Test Button with Custom Icons</h3>
        <Button 
          type="primary"
          size="large"
          iconL="star"              // ← Edit this
          iconR="chevron-down"      // ← Edit this
          label="Test Icons" 
        />
      </div>

      <div>
        <h3 className="font-bold mb-3">Icon Only</h3>
        <Button 
          iconOnly
          type="transparent"
          iconL="plus"          // ← Edit this
          aria-label="Test Icons"
        />
      </div>

      <div>
        <h3 className="font-bold mb-3">Icon Only</h3>
        <Button 
          iconOnly
          size="large"
          iconL="plus"          // ← Edit this
          aria-label="Test Icons"
        />
      </div>

    </div>
  ),
};
