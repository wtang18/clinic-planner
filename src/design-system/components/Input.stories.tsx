import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Design System/Input',
  component: Input,
  argTypes: {
    // Core variant props
    type: {
      control: 'select',
      options: ['outlined', 'filled'],
      description: 'The visual style type of the input',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the input',
    },

    // Label
    showLabel: {
      control: 'boolean',
      description: 'Show label above input',
    },
    label: {
      control: 'text',
      description: 'Label text displayed above the input',
      if: {
        arg: 'showLabel',
        truthy: true
      },
    },

    // Input field
    showPlaceholder: {
      control: 'boolean',
      description: 'Show placeholder text',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text inside the input',
      if: {
        arg: 'showPlaceholder',
        truthy: true
      },
    },

    // Helper/Error text
    showHelperText: {
      control: 'boolean',
      description: 'Show helper text below input',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the input',
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

    // Icon props
    // Note: leftIcon and rightIcon accept IconName types (386+ options) which don't work well with Storybook controls
    // Icon names must be specified directly in code (see IconVariations story for examples)
    // Icon size is automatically determined by input size: 20px (small/medium), 24px (large)

    // Subtext props (inside field)
    showLeftSubtext: {
      control: 'boolean',
      description: 'Show left subtext inside field (e.g., "$")',
    },
    leftSubtext: {
      control: 'text',
      description: 'Left subtext content (small text inside field, left)',
      if: {
        arg: 'showLeftSubtext',
        truthy: true
      },
    },
    showRightSubtext: {
      control: 'boolean',
      description: 'Show right subtext inside field (e.g., "%")',
    },
    rightSubtext: {
      control: 'text',
      description: 'Right subtext content (small text inside field, right)',
      if: {
        arg: 'showRightSubtext',
        truthy: true
      },
    },

    // State props
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the input',
      table: {
        category: 'Accessibility',
      },
    },
    'aria-describedby': {
      control: 'text',
      description: 'ID of element describing the input',
      table: {
        category: 'Accessibility',
      },
    },
  },

  parameters: {
    controls: {
      // Exclude icon and React props from controls
      exclude: ['leftIcon', 'rightIcon', 'id', 'wrapperClassName', 'containerClassName', 'children', 'className', 'style', 'ref', 'key', 'value', 'onChange', 'onFocus', 'onBlur'],
    },
    docs: {
      description: {
        component: `
Input component with Figma design system integration.

## Icon Props
The \`leftIcon\` and \`rightIcon\` props accept icon names from the icon library (386+ options). Examples:
- \`leftIcon="search"\` - Search icon on left
- \`rightIcon="envelope"\` - Envelope icon on right
- \`leftIcon="dollar-sign" rightIcon="calculator"\` - Custom icon combination

Icons are positioned inside the input field border. Icon size is automatically determined:
- **Small/Medium inputs**: 20px icons (small)
- **Large inputs**: 24px icons (medium)

## Subtext Props
The \`leftSubtext\` and \`rightSubtext\` props add small text inside the field:
- Position: Inside the input field border (left/right)
- Use cases: Currency symbols ("$"), units ("%", "USD"), etc.
- Automatically hidden when field is disabled

See the IconVariations and WithSubtexts stories for examples.
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {
  args: {
    type: 'outlined',
    size: 'medium',
    showLabel: true,
    label: 'Label',
    showPlaceholder: true,
    placeholder: 'Placeholder text',
    showHelperText: true,
    helperText: 'Helper text',
    error: false,
    errorMessage: 'Error text',
    showLeftSubtext: false,
    leftSubtext: '$',
    showRightSubtext: false,
    rightSubtext: '%',
    disabled: false,
    required: false,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Input Sizes</h3>
        <div className="space-y-4 max-w-md">
          <Input size="small" label="Small Input" placeholder="Small (32px height)" helperText="14px text" />
          <Input size="medium" label="Medium Input" placeholder="Medium (40px height)" helperText="14px text" />
          <Input size="large" label="Large Input" placeholder="Large (56px height)" helperText="16px text" />
        </div>
      </div>
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Input Types</h3>
        <div className="space-y-4 max-w-md">
          <Input type="outlined" label="Outlined" placeholder="Border with transparent background" />
          <Input type="filled" label="Filled" placeholder="Filled background" />
        </div>
      </div>
    </div>
  ),
};

export const WithSubtexts: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Subtexts Inside Field</h3>
        <div className="space-y-4 max-w-md">
          <Input
            label="Price"
            placeholder="0.00"
            leftSubtext="$"
            helperText="Enter amount in USD"
          />
          <Input
            label="Percentage"
            placeholder="0"
            rightSubtext="%"
            helperText="Enter discount percentage"
          />
          <Input
            label="Amount"
            placeholder="100.00"
            leftSubtext="$"
            rightSubtext="USD"
            helperText="Currency and unit displayed"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Subtexts with Different Sizes</h3>
        <div className="space-y-4 max-w-md">
          <Input size="small" label="Small" placeholder="0.00" leftSubtext="$" />
          <Input size="medium" label="Medium" placeholder="0.00" leftSubtext="$" />
          <Input size="large" label="Large" placeholder="0.00" leftSubtext="$" />
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
          The icon system provides 386+ icons. Specify icon names via leftIcon and rightIcon props.
        </p>
        <div className="space-y-4 max-w-md">
          <Input leftIcon="search" label="Search" placeholder="Search..." />
          <Input leftIcon="envelope" label="Email" placeholder="Enter your email" />
          <Input leftIcon="phone" label="Phone" placeholder="Enter phone number" />
          <Input leftIcon="calendar" label="Date" placeholder="Select date" />
          <Input leftIcon="user" label="Username" placeholder="Choose username" />
          <Input leftIcon="lock" label="Password" placeholder="Enter password" type="password" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Right Icons</h3>
        <div className="space-y-4 max-w-md">
          <Input rightIcon="chevron-down" label="Select" placeholder="Choose option" />
          <Input rightIcon="eye" label="Password" placeholder="Enter password" type="password" />
          <Input rightIcon="info" label="Information" placeholder="Enter details" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Combined Icons (Left + Right)</h3>
        <div className="space-y-4 max-w-md">
          <Input leftIcon="search" rightIcon="close" label="Search" placeholder="Search and clear" />
          <Input leftIcon="calendar" rightIcon="chevron-down" label="Date" placeholder="Select date" />
          <Input leftIcon="lock" rightIcon="eye" label="Password" placeholder="Show/hide password" type="password" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Icons with Subtexts</h3>
        <div className="space-y-4 max-w-md">
          <Input leftIcon="dollar-sign" rightSubtext="USD" label="Price" placeholder="0.00" />
          <Input leftSubtext="$" rightIcon="calculator" label="Amount" placeholder="Calculate" />
          <Input leftIcon="percent" rightSubtext="%" label="Discount" placeholder="0" />
        </div>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Input States</h3>
        <div className="space-y-4 max-w-md">
          <Input label="Default State" placeholder="Normal input" helperText="Helper text" />
          <Input label="Focused State" placeholder="Click to focus" helperText="Border changes to blue on focus" autoFocus />
          <Input label="Error State" placeholder="Invalid input" error errorMessage="This field is required" />
          <Input label="Disabled State" placeholder="Cannot edit" helperText="Disabled helper text" disabled />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Filled Type States</h3>
        <div className="space-y-4 max-w-md">
          <Input type="filled" label="Default State" placeholder="Normal input" helperText="Helper text" />
          <Input type="filled" label="Error State" placeholder="Invalid input" error errorMessage="This field is required" />
          <Input type="filled" label="Disabled State" placeholder="Cannot edit" helperText="Disabled helper text" disabled />
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
          <Input
            label="Email"
            placeholder="Enter your email"
            helperText="We'll never share your email with anyone"
          />
          <Input
            label="Password"
            placeholder="Create password"
            type="password"
            helperText="Must be at least 8 characters with 1 number"
          />
          <Input
            label="Username"
            placeholder="Choose username"
            helperText="Only letters, numbers, and underscores allowed"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Error Messages (Replace Helper Text)</h3>
        <div className="space-y-4 max-w-md">
          <Input
            label="Email"
            placeholder="user@example.com"
            helperText="We'll never share your email"
            error
            errorMessage="Invalid email format"
          />
          <Input
            label="Password"
            placeholder="Enter password"
            type="password"
            helperText="Must be at least 8 characters"
            error
            errorMessage="Password is too short"
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
        <h3 className="text-lg font-bold mb-4">Login Form</h3>
        <div className="space-y-4">
          <Input
            leftIcon="envelope"
            label="Email"
            placeholder="Enter your email"
            type="email"
            required
          />
          <Input
            leftIcon="lock"
            rightIcon="eye"
            label="Password"
            placeholder="Enter your password"
            type="password"
            required
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Payment Information</h3>
        <div className="space-y-4">
          <Input
            label="Amount"
            placeholder="0.00"
            leftSubtext="$"
            rightSubtext="USD"
            helperText="Enter payment amount"
          />
          <Input
            leftIcon="credit-card"
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            helperText="16-digit card number"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Search & Filters</h3>
        <div className="space-y-4">
          <Input
            leftIcon="search"
            rightIcon="close"
            placeholder="Search patients..."
            size="large"
          />
          <Input
            leftIcon="calendar"
            rightIcon="chevron-down"
            label="Date Range"
            placeholder="Select dates"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Form Validation</h3>
        <div className="space-y-4">
          <Input
            label="Username"
            placeholder="johndoe"
            value="jo"
            error
            errorMessage="Username must be at least 3 characters"
          />
          <Input
            label="Phone Number"
            placeholder="(555) 123-4567"
            leftIcon="phone"
            error
            errorMessage="Invalid phone number format"
          />
          <Input
            label="Website"
            placeholder="https://example.com"
            leftIcon="link"
            helperText="Must be a valid URL"
          />
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
          Edit the leftIcon and rightIcon props below to test different icons from your library.
          You'll get autocomplete with all 386+ available icon names.
        </p>
      </div>

      <div className="max-w-md">
        <h3 className="font-bold mb-3">Test Input with Custom Icons</h3>
        <Input
          size="medium"
          label="Test Field"
          leftIcon="star"              // ← Edit this
          rightIcon="chevron-down"      // ← Edit this
          placeholder="Test icons here"
        />
      </div>

      <div className="max-w-md">
        <h3 className="font-bold mb-3">Large Input with Icons</h3>
        <Input
          size="large"
          label="Large Test Field"
          leftIcon="search"            // ← Edit this
          rightIcon="close"             // ← Edit this
          placeholder="Test large input"
        />
      </div>

      <div className="max-w-md">
        <h3 className="font-bold mb-3">Filled Type with Icons</h3>
        <Input
          type="filled"
          size="medium"
          label="Filled Test Field"
          leftIcon="envelope"          // ← Edit this
          rightIcon="info"              // ← Edit this
          placeholder="Test filled type"
        />
      </div>
    </div>
  ),
};
