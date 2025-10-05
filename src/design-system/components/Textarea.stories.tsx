import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Design System/Textarea',
  component: Textarea,
  argTypes: {
    // Core variant props
    type: {
      control: 'select',
      options: ['outlined', 'filled'],
      description: 'The visual style type of the textarea',
    },

    // Label
    showLabel: {
      control: 'boolean',
      description: 'Show label above textarea',
    },
    label: {
      control: 'text',
      description: 'Label text displayed above the textarea',
      if: {
        arg: 'showLabel',
        truthy: true
      },
    },

    // Textarea field
    showPlaceholder: {
      control: 'boolean',
      description: 'Show placeholder text',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text inside the textarea',
      if: {
        arg: 'showPlaceholder',
        truthy: true
      },
    },

    // Helper/Error text
    showHelperText: {
      control: 'boolean',
      description: 'Show helper text below textarea',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the textarea',
      if: {
        arg: 'showHelperText',
        truthy: true
      },
    },
    error: {
      control: 'boolean',
      description: 'Error state (overrides helper text color and border)',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message (replaces helperText when error=true)',
      if: {
        arg: 'error',
        truthy: true
      },
    },

    // Textarea-specific props
    rows: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Number of visible text rows (controls initial height)',
    },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'both'],
      description: 'Resize behavior',
    },

    // State props
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the textarea is required',
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the textarea',
      table: {
        category: 'Accessibility',
      },
    },
    'aria-describedby': {
      control: 'text',
      description: 'ID of element describing the textarea',
      table: {
        category: 'Accessibility',
      },
    },
  },

  parameters: {
    controls: {
      // Exclude React props from controls
      exclude: ['id', 'wrapperClassName', 'containerClassName', 'children', 'className', 'style', 'ref', 'key', 'value', 'onChange', 'onFocus', 'onBlur'],
    },
    docs: {
      description: {
        component: `
Textarea component with Figma design system integration.

## Typography & Sizing
- Uses Body/Sm Regular (14px / 20px line height) - matches medium Input
- Padding: 10px 12px (vertical, horizontal) - matches medium Input
- Height: Auto-grows based on content
- Min-height: Based on rows prop (default 3 rows)

## Resize Behavior
- **none**: Not resizable
- **vertical**: Resizable vertically only (default)
- **both**: Resizable in both directions

## States
All states match the Input component styling for consistency.
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {
  args: {
    type: 'outlined',
    showLabel: true,
    label: 'Label',
    showPlaceholder: true,
    placeholder: 'Placeholder text',
    showHelperText: true,
    helperText: 'Helper text',
    error: false,
    errorMessage: 'Error text',
    rows: 3,
    resize: 'vertical',
    disabled: false,
    required: false,
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Textarea Types</h3>
        <div className="space-y-4 max-w-md">
          <Textarea type="outlined" label="Outlined" placeholder="Border with transparent background" />
          <Textarea type="filled" label="Filled" placeholder="Filled background" />
        </div>
      </div>
    </div>
  ),
};

export const RowsAndResize: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Different Row Counts</h3>
        <div className="space-y-4 max-w-md">
          <Textarea label="2 Rows" rows={2} placeholder="Short textarea (2 rows)" />
          <Textarea label="3 Rows (Default)" rows={3} placeholder="Default textarea (3 rows)" />
          <Textarea label="5 Rows" rows={5} placeholder="Taller textarea (5 rows)" />
          <Textarea label="10 Rows" rows={10} placeholder="Very tall textarea (10 rows)" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Resize Behavior</h3>
        <div className="space-y-4 max-w-md">
          <Textarea
            label="Not Resizable"
            resize="none"
            rows={3}
            placeholder="Cannot resize this textarea"
            helperText="resize='none'"
          />
          <Textarea
            label="Vertical Resize (Default)"
            resize="vertical"
            rows={3}
            placeholder="Resize vertically only"
            helperText="resize='vertical'"
          />
          <Textarea
            label="Both Directions"
            resize="both"
            rows={3}
            placeholder="Resize in both directions"
            helperText="resize='both'"
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
        <h3 className="text-lg font-bold mb-4">Textarea States</h3>
        <div className="space-y-4 max-w-md">
          <Textarea label="Default State" placeholder="Normal textarea" helperText="Helper text" />
          <Textarea label="Focused State" placeholder="Click to focus" helperText="Border changes to blue on focus" autoFocus />
          <Textarea label="Error State" placeholder="Invalid input" error errorMessage="This field is required" />
          <Textarea label="Disabled State" placeholder="Cannot edit" helperText="Disabled helper text" disabled />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Filled Type States</h3>
        <div className="space-y-4 max-w-md">
          <Textarea type="filled" label="Default State" placeholder="Normal textarea" helperText="Helper text" />
          <Textarea type="filled" label="Error State" placeholder="Invalid input" error errorMessage="This field is required" />
          <Textarea type="filled" label="Disabled State" placeholder="Cannot edit" helperText="Disabled helper text" disabled />
        </div>
      </div>
    </div>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Helper Text Examples</h3>
        <div className="space-y-4 max-w-md">
          <Textarea
            label="Comments"
            placeholder="Enter your comments"
            helperText="Please be detailed and specific"
          />
          <Textarea
            label="Description"
            placeholder="Describe the issue"
            rows={5}
            helperText="Maximum 500 characters"
          />
          <Textarea
            label="Notes"
            placeholder="Add notes here"
            helperText="These notes will be visible to all team members"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Error Messages (Replace Helper Text)</h3>
        <div className="space-y-4 max-w-md">
          <Textarea
            label="Feedback"
            placeholder="Enter your feedback"
            helperText="We appreciate your feedback"
            error
            errorMessage="Feedback is required"
          />
          <Textarea
            label="Message"
            placeholder="Write a message"
            helperText="Minimum 10 characters"
            error
            errorMessage="Message is too short"
          />
        </div>
      </div>
    </div>
  ),
};

export const RealWorldExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Feedback Form</h3>
        <div className="space-y-4">
          <Textarea
            label="How can we improve?"
            placeholder="Tell us what you think..."
            rows={5}
            helperText="Your feedback helps us make the product better"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Patient Notes</h3>
        <div className="space-y-4">
          <Textarea
            type="filled"
            label="Clinical Notes"
            placeholder="Enter clinical observations..."
            rows={8}
            helperText="Notes are automatically saved"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Event Description</h3>
        <div className="space-y-4">
          <Textarea
            label="Event Details"
            placeholder="Describe the event..."
            rows={6}
            resize="none"
            required
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Form Validation</h3>
        <div className="space-y-4">
          <Textarea
            label="Message"
            placeholder="Type your message"
            value="Hi"
            rows={4}
            error
            errorMessage="Message must be at least 10 characters"
          />
          <Textarea
            label="Additional Comments"
            placeholder="Any additional comments?"
            rows={3}
            helperText="Optional field"
          />
        </div>
      </div>
    </div>
  ),
};

export const ComparisonWithInput: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Textarea vs Input Styling Consistency</h3>
        <p className="text-sm text-gray-600 mb-4">
          Textarea uses the same styling as medium Input for consistency
        </p>
        <div className="space-y-4 max-w-md">
          <Textarea
            label="Multi-line Text"
            placeholder="This is a textarea (14px/20px)"
            rows={3}
            helperText="Uses medium Input dimensions and typography"
          />
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-2">For comparison, this would be an Input:</p>
            <div className="border border-[rgba(0,0,0,0.24)] rounded-lg px-3 py-2.5">
              <p className="text-[14px] leading-[20px] text-[#a4a4a4]">
                Single-line input (same 14px/20px, same 10px/12px padding)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const FilledTypeExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Filled Type in Different Contexts</h3>
        <div className="space-y-4 max-w-md">
          <Textarea
            type="filled"
            label="Quick Note"
            placeholder="Jot down your thoughts..."
            rows={4}
          />
          <Textarea
            type="filled"
            label="Meeting Notes"
            placeholder="Enter meeting notes..."
            rows={6}
            resize="vertical"
          />
          <Textarea
            type="filled"
            label="Code Snippet"
            placeholder="Paste code here..."
            rows={8}
            resize="both"
          />
        </div>
      </div>
    </div>
  ),
};
