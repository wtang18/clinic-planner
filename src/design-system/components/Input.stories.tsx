import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Design System/Components/Input',
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
# Input Component

Production-ready text input with semantic token integration, icon support, and comprehensive validation states.

## Quick Reference

**Types**: 2 variants (outlined, filled)
**Sizes**: 3 sizes (small, medium, large)
**Tokens**: Uses semantic color tokens for theme support
**Icons**: 386+ icons supported via leftIcon/rightIcon props

---

## Features

- ✅ **Semantic Tokens**: Uses \`--color-bg-*\` and \`--color-fg-*\` tokens for automatic theme support
- ✅ **Icon Integration**: Built-in support for 386+ icons with automatic sizing
- ✅ **Subtext Support**: Currency symbols, units, and labels inside the field
- ✅ **Validation States**: Error states with custom messages
- ✅ **Accessibility**: ARIA support, proper labeling, focus management
- ✅ **Helper Text**: Optional descriptive text below the input

---

## Types

| Type | Background | Border | Use Case |
|------|------------|--------|----------|
| \`outlined\` | Transparent | Visible border | **Default - Most forms** |
| \`filled\` | Subtle background | No border | Dense layouts, alternative style |

---

## Sizes

| Size | Height | Padding | Icon Size | Font Size | Use Case |
|------|--------|---------|-----------|-----------|----------|
| \`small\` | 32px | 6px 12px | 20px | 14px | Compact UIs, toolbars |
| \`medium\` | 40px | 10px 12px | 20px | 14px | **Default - Most common** |
| \`large\` | 56px | 16px 16px | 24px | 16px | Hero sections, emphasis |

---

## Icon System

The \`leftIcon\` and \`rightIcon\` props accept icon names from the icon library (386+ options):

**Examples**:
\`\`\`tsx
// Search input
<Input leftIcon="search" placeholder="Search..." />

// Email input
<Input leftIcon="envelope" type="email" label="Email" />

// Password with visibility toggle
<Input leftIcon="lock" rightIcon="eye" type="password" label="Password" />

// Phone input
<Input leftIcon="phone" label="Phone Number" />
\`\`\`

Icon sizes are automatically determined by input size:
- **Small/Medium inputs**: 20px icons
- **Large inputs**: 24px icons

---

## Subtext System

The \`leftSubtext\` and \`rightSubtext\` props add small text inside the field:

**Examples**:
\`\`\`tsx
// Currency input
<Input leftSubtext="$" placeholder="0.00" label="Price" />

// Percentage input
<Input rightSubtext="%" placeholder="0" label="Discount" />

// URL prefix
<Input leftSubtext="https://" placeholder="example.com" label="Website" />

// Currency with unit
<Input leftSubtext="$" rightSubtext="USD" label="Amount" />
\`\`\`

**Position**: Inside the input field border
**Behavior**: Automatically hidden when field is disabled

---

## Validation States

Inputs support error states with custom messages:

\`\`\`tsx
// Show error
<Input
  label="Email"
  value="invalid-email"
  error
  errorMessage="Please enter a valid email address"
/>

// Helper text (no error)
<Input
  label="Password"
  helperText="Must be at least 8 characters"
/>
\`\`\`

Error messages replace helper text when \`error=true\`.

---

## Best Practices

### ✅ When to Use Inputs

- Single-line text entry
- Email, password, phone number fields
- Search bars
- Numeric inputs (prices, quantities)
- URL/link inputs

### ✅ Do

- Always provide a \`label\` for accessibility
- Use appropriate \`type\` attribute (email, password, tel, url, etc.)
- Provide helpful \`helperText\` for complex requirements
- Use \`leftIcon\` to indicate input type (search, email, phone)
- Use \`rightIcon\` for actions (clear, visibility toggle)
- Use \`leftSubtext\`/\`rightSubtext\` for units and prefixes
- Show clear error messages with \`errorMessage\`

### ❌ Don't

- Use for multi-line text (use Textarea instead)
- Forget labels for accessibility
- Use vague error messages ("Invalid input")
- Overload with too many icons/subtexts
- Use outlined and filled types inconsistently in the same form
- Disable inputs without explanation

---

## Accessibility

All Input components follow WCAG 2.1 Level AA guidelines and include comprehensive keyboard and screen reader support.

### Keyboard Navigation

- **Tab**: Focus the input field
- **Shift + Tab**: Move focus backward
- **Arrow Keys**: Move cursor within text
- **Home/End**: Jump to start/end of text
- **Ctrl/Cmd + A**: Select all text

### Screen Reader Support

Input automatically includes proper ARIA attributes:
- **\`id\`**: Automatically generated unique ID for each input
- **\`aria-label\`**: Use when no visible label is present (though visible labels are preferred)
- **\`aria-describedby\`**: Automatically links to helper text or error message
- **\`aria-required\`**: Automatically set when \`required={true}\`
- **\`aria-invalid\`**: Automatically set when \`error={true}\`

Screen readers announce:
- Label text
- Current value
- Whether field is required
- Helper text or error message
- Field state (disabled, invalid)

### Focus Management

All inputs include visible focus indicators:
- **Focus ring**: 2px solid blue outline with offset
- **High contrast**: Focus ring visible in high contrast mode
- **Keyboard only**: Focus ring only appears for keyboard navigation

### Labels and Helper Text

Always provide proper labeling:

\`\`\`tsx
// ✅ Correct - Visible label
<Input label="Email Address" type="email" />

// ✅ Correct - aria-label when no visible label
<Input placeholder="Search..." aria-label="Search patients" />

// ❌ Wrong - No label at all
<Input placeholder="Email" type="email" />
\`\`\`

Helper text provides additional context and is linked via \`aria-describedby\`:

\`\`\`tsx
<Input
  label="Password"
  helperText="Must be at least 8 characters with 1 number"
  type="password"
/>
\`\`\`

### Error States

Error messages are properly announced to screen readers:

\`\`\`tsx
// Error replaces helper text and updates aria-invalid
<Input
  label="Email"
  value="invalid-email"
  error
  errorMessage="Please enter a valid email address"
/>
\`\`\`

When \`error={true}\`:
- Input border changes to red
- \`aria-invalid="true"\` is set
- Error message is linked via \`aria-describedby\`
- Screen reader announces error on focus

### Required Fields

Use \`required\` prop for required fields:

\`\`\`tsx
<Input
  label="Email Address"
  required
  helperText="Required field"
/>
\`\`\`

This automatically adds:
- Visual indicator (asterisk or "required" text, depending on implementation)
- \`aria-required="true"\` attribute
- Proper screen reader announcement

### Disabled State

Disabled inputs are properly excluded from keyboard navigation:
- Visual: 50% opacity
- Semantic: \`disabled\` attribute on input element
- Keyboard: Not focusable (removed from tab order)
- Screen reader: Announced as "disabled"

### Color Contrast

All input text and borders meet WCAG AA contrast requirements:
- **Text**: 4.5:1 contrast ratio against background
- **Borders**: 3:1 contrast ratio (outlined type)
- **Error state**: High contrast red for alerts
- **Placeholder text**: WCAG AA compliant gray

### Touch Targets

All inputs meet minimum touch target size:
- **Small**: 32px height (minimum for touch)
- **Medium**: 40px height (recommended)
- **Large**: 56px height (comfortable)

### Best Practices for Accessibility

✅ **Do**:
- Always provide visible labels (use \`label\` prop)
- Use \`helperText\` for additional context or requirements
- Set \`type\` attribute appropriately (email, password, tel, url)
- Use \`required\` for mandatory fields
- Provide clear, specific error messages
- Ensure icons have meaningful context (paired with labels)

❌ **Don't**:
- Rely solely on placeholder text for labels (placeholders disappear)
- Use vague error messages ("Invalid input")
- Remove focus indicators
- Set \`disabled\` without explanation
- Use color alone to indicate required or error state
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

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
        <p className="text-sm text-gray-700 mb-4">
          Input components are fully keyboard accessible and follow WCAG guidelines.
        </p>
        <ul className="text-sm space-y-2 mb-6 text-gray-700">
          <li>✓ Keyboard navigation (Tab, Arrow keys, Home/End)</li>
          <li>✓ Screen reader support with ARIA attributes</li>
          <li>✓ Visible focus indicators (keyboard only)</li>
          <li>✓ WCAG AA color contrast ratios</li>
          <li>✓ Proper label associations</li>
          <li>✓ Error state announcements</li>
        </ul>

        <div className="space-y-6">
          {/* Keyboard Navigation Demo */}
          <div>
            <h4 className="text-base font-semibold mb-3">Keyboard Navigation</h4>
            <p className="text-sm text-gray-600 mb-3">
              Try using Tab to focus, then type and use Arrow keys to navigate:
            </p>
            <div className="space-y-3 max-w-md">
              <Input label="First Name" placeholder="Enter first name" />
              <Input label="Last Name" placeholder="Enter last name" />
              <Input label="Email" type="email" placeholder="Enter email" />
            </div>
          </div>

          {/* Labels and Helper Text */}
          <div>
            <h4 className="text-base font-semibold mb-3">Labels and Helper Text</h4>
            <div className="space-y-3 max-w-md">
              <div>
                <p className="text-xs text-gray-600 mb-2">✓ Correct - Visible label with helper text:</p>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  helperText="Must be at least 8 characters"
                />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">✓ Correct - aria-label when no visible label:</p>
                <Input
                  placeholder="Search..."
                  leftIcon="search"
                  aria-label="Search patients"
                />
              </div>
            </div>
          </div>

          {/* Error States */}
          <div>
            <h4 className="text-base font-semibold mb-3">Error State Announcements</h4>
            <p className="text-sm text-gray-600 mb-3">
              Screen readers announce error messages when input is focused:
            </p>
            <div className="space-y-3 max-w-md">
              <Input
                label="Email Address"
                value="invalid-email"
                error
                errorMessage="Please enter a valid email address"
              />
              <Input
                label="Phone Number"
                leftIcon="phone"
                value="123"
                error
                errorMessage="Phone number must be 10 digits"
              />
            </div>
          </div>

          {/* Required Fields */}
          <div>
            <h4 className="text-base font-semibold mb-3">Required Fields</h4>
            <div className="space-y-3 max-w-md">
              <Input
                label="Email Address"
                type="email"
                required
                helperText="Required field"
              />
              <Input
                label="Password"
                type="password"
                required
                helperText="Required field"
              />
            </div>
          </div>

          {/* Color Contrast */}
          <div>
            <h4 className="text-base font-semibold mb-3">Color Contrast</h4>
            <p className="text-sm text-gray-600 mb-3">
              All text and borders meet WCAG AA requirements:
            </p>
            <div className="space-y-3 max-w-md">
              <Input
                label="Default State"
                placeholder="4.5:1 text contrast"
                helperText="Helper text also meets 4.5:1 contrast"
              />
              <Input
                label="Error State"
                value="invalid"
                error
                errorMessage="Error text with high contrast red"
              />
            </div>
          </div>

          {/* Touch Targets */}
          <div>
            <h4 className="text-base font-semibold mb-3">Touch Target Sizes</h4>
            <p className="text-sm text-gray-600 mb-3">
              All inputs meet minimum touch target requirements:
            </p>
            <div className="space-y-3 max-w-md">
              <Input size="small" label="Small (32px)" placeholder="Minimum touch size" />
              <Input size="medium" label="Medium (40px)" placeholder="Recommended size" />
              <Input size="large" label="Large (56px)" placeholder="Comfortable size" />
            </div>
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
        Use these natural language prompts when working with Input components.
      </p>

      <div className="space-y-8">
        {/* Add Icon */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">✨</span>
            Add Icons to Input
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add a search icon to the left side of this input and a close icon on the right"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">leftIcon="search"</code> and <code className="bg-gray-100 px-1 rounded">rightIcon="close"</code>
          </p>
        </div>

        {/* Change Size */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">📏</span>
            Adjust Input Size
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Make this search input larger and more prominent"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will change <code className="bg-gray-100 px-1 rounded">size="medium"</code> to <code className="bg-gray-100 px-1 rounded">size="large"</code>
          </p>
        </div>

        {/* Add Subtext */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-600">🏷️</span>
            Add Currency or Unit Labels
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add a dollar sign prefix to this price input and USD suffix"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">leftSubtext="$"</code> and <code className="bg-gray-100 px-1 rounded">rightSubtext="USD"</code>
          </p>
        </div>

        {/* Add Validation */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            Add Error Validation
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Show an error message 'Invalid email format' when the email input is invalid"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add conditional <code className="bg-gray-100 px-1 rounded">error={'{isInvalid}'}</code> and <code className="bg-gray-100 px-1 rounded">errorMessage="Invalid email format"</code>
          </p>
        </div>

        {/* Add Helper Text */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-indigo-600">💡</span>
            Add Helper Text
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add helper text explaining that the password must be at least 8 characters"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">helperText="Must be at least 8 characters"</code>
          </p>
        </div>

        {/* Improve Accessibility */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-orange-600">♿</span>
            Improve Accessibility
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add a proper accessible label to this search input that doesn't have a visible label"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">aria-label="Search patients"</code> (or appropriate label based on context)
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Always provide visible labels using <code className="bg-white px-1 rounded">label</code> prop for accessibility</li>
          <li>• Use <code className="bg-white px-1 rounded">leftIcon</code> to indicate input type (search, email, phone)</li>
          <li>• Use <code className="bg-white px-1 rounded">leftSubtext</code>/<code className="bg-white px-1 rounded">rightSubtext</code> for currency symbols and units</li>
          <li>• Inputs use semantic tokens that automatically adapt to light/dark themes</li>
          <li>• Error messages automatically replace helper text and update ARIA attributes</li>
        </ul>
      </div>
    </div>
  ),
};
