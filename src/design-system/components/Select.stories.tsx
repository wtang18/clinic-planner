import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Design System/Components/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    // Core variant props
    type: {
      control: 'select',
      options: ['outlined', 'filled'],
      description: 'The visual style type of the select',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the select',
    },

    // Label
    showLabel: {
      control: 'boolean',
      description: 'Show label above select',
    },
    label: {
      control: 'text',
      description: 'Label text displayed above the select',
      if: {
        arg: 'showLabel',
        truthy: true
      },
    },

    // Helper/Error text
    showHelperText: {
      control: 'boolean',
      description: 'Show helper text below select',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the select',
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

    // State props
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the select is required',
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the select',
      table: {
        category: 'Accessibility',
      },
    },
    'aria-describedby': {
      control: 'text',
      description: 'ID of element describing the select',
      table: {
        category: 'Accessibility',
      },
    },
  },

  parameters: {
    controls: {
      exclude: ['options', 'id', 'wrapperClassName', 'containerClassName', 'children', 'className', 'style', 'ref', 'key', 'value', 'onChange', 'onFocus', 'onBlur'],
    },
    docs: {
      description: {
        component: `
# Select Component

Production-ready select dropdown matching Input component styling, with semantic token integration and comprehensive validation states.

## Quick Reference

**Types**: 2 variants (outlined, filled)
**Sizes**: 3 sizes (small, medium, large)
**Tokens**: Uses semantic color tokens for theme support
**Styling**: Matches Input component exactly for consistency

---

## Features

- ✅ **Semantic Tokens**: Uses \`--color-bg-*\` and \`--color-fg-*\` tokens for automatic theme support
- ✅ **Input Consistency**: Matches Input component styling exactly
- ✅ **Dropdown Icon**: Built-in chevron-down icon positioned correctly
- ✅ **Validation States**: Error states with custom messages
- ✅ **Accessibility**: ARIA support, proper labeling, focus management
- ✅ **Helper Text**: Optional descriptive text below the select
- ✅ **Focus-Visible**: Focus ring only appears during keyboard navigation

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

## Usage

There are two ways to provide options:

### 1. Using the \`options\` prop (Recommended)

\`\`\`tsx
const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' }
];

<Select
  label="Month"
  options={months}
  value={selectedMonth}
  onChange={(e) => setSelectedMonth(e.target.value)}
/>
\`\`\`

### 2. Using children (Traditional)

\`\`\`tsx
<Select
  label="Country"
  value={country}
  onChange={handleChange}
>
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
  <option value="ca">Canada</option>
</Select>
\`\`\`

---

## Validation States

Selects support error states with custom messages:

\`\`\`tsx
// Show error
<Select
  label="Country"
  value=""
  error
  errorMessage="Please select a country"
>
  <option value="">Select...</option>
  <option value="us">United States</option>
</Select>

// Helper text (no error)
<Select
  label="State"
  helperText="Select your state of residence"
>
  <option value="">Select...</option>
</Select>
\`\`\`

Error messages replace helper text when \`error=true\`.

---

## Best Practices

### ✅ When to Use Select

- Choosing from 4+ predefined options
- Country, state, city selection
- Month, year selection
- Status or category selection
- Time zones, currencies

### ✅ Do

- Always provide a \`label\` for accessibility
- Include a "Select..." or empty option as the first choice
- Use appropriate option values (numbers, IDs, codes)
- Provide helpful \`helperText\` for context
- Show clear error messages with \`errorMessage\`
- Use \`required\` for mandatory fields

### ❌ Don't

- Use for 2-3 options (use radio buttons or TogglePills instead)
- Forget labels for accessibility
- Use vague error messages ("Invalid selection")
- Disable selects without explanation
- Use outlined and filled types inconsistently in the same form
- Use for very long lists (100+ options) - consider search/autocomplete

### 🔄 When to Use Alternatives

- **2-3 options**: Use radio buttons or TogglePills
- **Binary choice**: Use Toggle component
- **Many options with search**: Use autocomplete/combobox
- **Multiple selection**: Use checkbox list or multi-select

---

## Accessibility

All Select components follow WCAG 2.1 Level AA guidelines and include comprehensive keyboard and screen reader support.

### Keyboard Navigation

- **Tab**: Focus the select field
- **Shift + Tab**: Move focus backward
- **Space/Enter**: Open dropdown
- **Arrow Up/Down**: Navigate options
- **Escape**: Close dropdown
- **Home/End**: Jump to first/last option
- **Type letters**: Jump to option starting with letter

### Screen Reader Support

Select automatically includes proper ARIA attributes:
- **\`id\`**: Automatically generated unique ID
- **\`aria-label\`**: Use when no visible label is present (though visible labels are preferred)
- **\`aria-describedby\`**: Automatically links to helper text or error message
- **\`aria-required\`**: Automatically set when \`required={true}\`
- **\`aria-invalid\`**: Automatically set when \`error={true}\`

Screen readers announce:
- Label text
- Current selection
- Whether field is required
- Number of options
- Helper text or error message
- Field state (disabled, invalid)

### Focus Management

All selects include visible focus indicators:
- **Focus ring**: 2px solid blue outline with offset
- **High contrast**: Focus ring visible in high contrast mode
- **Keyboard only**: Focus ring only appears for keyboard navigation (Tab key)
- **Mouse clicks**: No focus ring when clicking with mouse

### Labels and Helper Text

Always provide proper labeling:

\`\`\`tsx
// ✅ Correct - Visible label
<Select label="Country">
  <option value="us">United States</option>
</Select>

// ✅ Correct - aria-label when no visible label
<Select aria-label="Filter by status">
  <option value="all">All</option>
</Select>

// ❌ Wrong - No label at all
<Select>
  <option>Select...</option>
</Select>
\`\`\`

Helper text provides additional context and is linked via \`aria-describedby\`:

\`\`\`tsx
<Select
  label="Time Zone"
  helperText="Select your local time zone"
>
  <option value="">Select...</option>
  <option value="est">Eastern (EST)</option>
</Select>
\`\`\`

### Error States

Error messages are properly announced to screen readers:

\`\`\`tsx
// Error replaces helper text and updates aria-invalid
<Select
  label="Country"
  value=""
  error
  errorMessage="Please select a country to continue"
>
  <option value="">Select...</option>
</Select>
\`\`\`

When \`error={true}\`:
- Select border changes to red
- \`aria-invalid="true"\` is set
- Error message is linked via \`aria-describedby\`
- Screen reader announces error on focus

### Required Fields

Use \`required\` prop for required fields:

\`\`\`tsx
<Select
  label="Country"
  required
  helperText="Required field"
>
  <option value="">Select...</option>
</Select>
\`\`\`

This automatically adds:
- Visual indicator (asterisk or "required" text)
- \`aria-required="true"\` attribute
- Proper screen reader announcement

### Disabled State

Disabled selects are properly excluded from keyboard navigation:
- Visual: Reduced opacity
- Semantic: \`disabled\` attribute on select element
- Keyboard: Not focusable (removed from tab order)
- Screen reader: Announced as "disabled"

### Color Contrast

All select text and borders meet WCAG AA contrast requirements:
- **Text**: 4.5:1 contrast ratio against background
- **Borders**: 3:1 contrast ratio (outlined type)
- **Error state**: High contrast red for alerts
- **Dropdown icon**: Meets contrast requirements

### Touch Targets

All selects meet minimum touch target size:
- **Small**: 32px height (minimum for touch)
- **Medium**: 40px height (recommended)
- **Large**: 56px height (comfortable)

### Best Practices for Accessibility

✅ **Do**:
- Always provide visible labels (use \`label\` prop)
- Use \`helperText\` for additional context
- Include a default/empty option ("Select...")
- Set \`required\` for mandatory fields
- Provide clear, specific error messages
- Keep option text concise and clear

❌ **Don't**:
- Rely solely on placeholder-like first option
- Use vague error messages ("Invalid selection")
- Remove focus indicators
- Set \`disabled\` without explanation
- Use color alone to indicate required or error state
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const monthOptions = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const Playground: Story = {
  args: {
    type: 'outlined',
    size: 'medium',
    showLabel: true,
    label: 'Label',
    showHelperText: true,
    helperText: 'Helper text',
    error: false,
    errorMessage: 'Error text',
    disabled: false,
    required: false,
  },
  render: (args) => (
    <Select {...args}>
      <option value="">Select an option</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </Select>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Select Sizes</h3>
        <div className="space-y-4 max-w-md">
          <Select size="small" label="Small Select" helperText="32px height" options={monthOptions} />
          <Select size="medium" label="Medium Select" helperText="40px height (default)" options={monthOptions} />
          <Select size="large" label="Large Select" helperText="56px height" options={monthOptions} />
        </div>
      </div>
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Select Types</h3>
        <div className="space-y-4 max-w-md">
          <Select type="outlined" label="Outlined" helperText="Border with transparent background" options={monthOptions} />
          <Select type="filled" label="Filled" helperText="Filled background" options={monthOptions} />
        </div>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">Select States</h3>
        <div className="space-y-4 max-w-md">
          <Select label="Default State" helperText="Normal select" options={monthOptions} />
          <Select label="Error State" value="" error errorMessage="This field is required">
            <option value="">Select a month</option>
            {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
          <Select label="Disabled State" helperText="Cannot select" disabled options={monthOptions} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Filled Type States</h3>
        <div className="space-y-4 max-w-md">
          <Select type="filled" label="Default State" helperText="Normal select" options={monthOptions} />
          <Select type="filled" label="Error State" value="" error errorMessage="This field is required">
            <option value="">Select a month</option>
            {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
          <Select type="filled" label="Disabled State" helperText="Cannot select" disabled options={monthOptions} />
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
          <Select
            label="Country"
            helperText="Select your country of residence"
          >
            <option value="">Select a country</option>
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="ca">Canada</option>
          </Select>
          <Select
            label="Time Zone"
            helperText="Choose your local time zone"
          >
            <option value="">Select time zone</option>
            <option value="est">Eastern (EST)</option>
            <option value="cst">Central (CST)</option>
            <option value="pst">Pacific (PST)</option>
          </Select>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Error Messages (Replace Helper Text)</h3>
        <div className="space-y-4 max-w-md">
          <Select
            label="Country"
            value=""
            helperText="Select your country"
            error
            errorMessage="Country is required"
          >
            <option value="">Select...</option>
            <option value="us">United States</option>
          </Select>
          <Select
            label="State"
            value=""
            helperText="Select your state"
            error
            errorMessage="Please select a state"
          >
            <option value="">Select...</option>
            <option value="ca">California</option>
          </Select>
        </div>
      </div>
    </div>
  ),
};

export const RealWorldExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Event Date Selection</h3>
        <div className="space-y-4">
          <Select
            type="filled"
            label="Month"
            options={monthOptions}
            required
          />
          <Select
            type="filled"
            label="Year"
            required
          >
            <option value="">Select year</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </Select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">User Profile Settings</h3>
        <div className="space-y-4">
          <Select
            label="Country"
            helperText="Your country of residence"
          >
            <option value="">Select a country</option>
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="ca">Canada</option>
          </Select>
          <Select
            label="Time Zone"
            helperText="Your local time zone"
          >
            <option value="">Select time zone</option>
            <option value="est">Eastern (EST)</option>
            <option value="cst">Central (CST)</option>
            <option value="mst">Mountain (MST)</option>
            <option value="pst">Pacific (PST)</option>
          </Select>
          <Select
            label="Language"
            helperText="Preferred language"
          >
            <option value="">Select language</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </Select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Form Validation</h3>
        <div className="space-y-4">
          <Select
            label="Event Type"
            value=""
            error
            errorMessage="Please select an event type"
          >
            <option value="">Select type</option>
            <option value="clinic">Clinic Event</option>
            <option value="marketing">Marketing Campaign</option>
            <option value="other">Other</option>
          </Select>
          <Select
            label="Priority"
            helperText="Event priority level"
          >
            <option value="">Select priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
        <h3 className="text-lg font-bold mb-4">Filters & Sorting</h3>
        <div className="space-y-4">
          <Select
            size="small"
            label="Status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </Select>
          <Select
            size="small"
            label="Sort By"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="priority">Priority</option>
          </Select>
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
          Select components are fully keyboard accessible and follow WCAG guidelines.
        </p>
        <ul className="text-sm space-y-2 mb-6 text-gray-700">
          <li>✓ Keyboard navigation (Tab, Arrow keys, Space/Enter)</li>
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
              Try using Tab to focus, Space/Enter to open, and Arrow keys to navigate:
            </p>
            <div className="space-y-3 max-w-md">
              <Select label="Month" options={monthOptions} />
              <Select label="Country">
                <option value="">Select...</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
              </Select>
            </div>
          </div>

          {/* Labels and Helper Text */}
          <div>
            <h4 className="text-base font-semibold mb-3">Labels and Helper Text</h4>
            <div className="space-y-3 max-w-md">
              <div>
                <p className="text-xs text-gray-600 mb-2">✓ Correct - Visible label with helper text:</p>
                <Select
                  label="Time Zone"
                  helperText="Select your local time zone"
                >
                  <option value="">Select...</option>
                  <option value="est">Eastern</option>
                  <option value="pst">Pacific</option>
                </Select>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">✓ Correct - aria-label when no visible label:</p>
                <Select
                  aria-label="Filter by status"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Error States */}
          <div>
            <h4 className="text-base font-semibold mb-3">Error State Announcements</h4>
            <p className="text-sm text-gray-600 mb-3">
              Screen readers announce error messages when select is focused:
            </p>
            <div className="space-y-3 max-w-md">
              <Select
                label="Country"
                value=""
                error
                errorMessage="Please select a country to continue"
              >
                <option value="">Select...</option>
                <option value="us">United States</option>
              </Select>
              <Select
                label="State"
                value=""
                error
                errorMessage="State is required"
              >
                <option value="">Select...</option>
                <option value="ca">California</option>
              </Select>
            </div>
          </div>

          {/* Required Fields */}
          <div>
            <h4 className="text-base font-semibold mb-3">Required Fields</h4>
            <div className="space-y-3 max-w-md">
              <Select
                label="Country"
                required
                helperText="Required field"
              >
                <option value="">Select...</option>
                <option value="us">United States</option>
              </Select>
              <Select
                label="Time Zone"
                required
                helperText="Required field"
              >
                <option value="">Select...</option>
                <option value="est">Eastern</option>
              </Select>
            </div>
          </div>

          {/* Touch Targets */}
          <div>
            <h4 className="text-base font-semibold mb-3">Touch Target Sizes</h4>
            <p className="text-sm text-gray-600 mb-3">
              All selects meet minimum touch target requirements:
            </p>
            <div className="space-y-3 max-w-md">
              <Select size="small" label="Small (32px)" options={monthOptions} />
              <Select size="medium" label="Medium (40px)" options={monthOptions} />
              <Select size="large" label="Large (56px)" options={monthOptions} />
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
        Use these natural language prompts when working with Select components.
      </p>

      <div className="space-y-8">
        {/* Add Options */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">✨</span>
            Add Options to Select
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Create a month selector with all 12 months as options"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will create a Select with options array containing all months
          </p>
        </div>

        {/* Change Size */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">📏</span>
            Adjust Select Size
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Make this date selector larger to match the other form fields"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will change <code className="bg-gray-100 px-1 rounded">size="medium"</code> to <code className="bg-gray-100 px-1 rounded">size="large"</code>
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
              "Show an error message 'Please select a country' when the country select is empty on submit"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add conditional <code className="bg-gray-100 px-1 rounded">error={'{isEmpty}'}</code> and <code className="bg-gray-100 px-1 rounded">errorMessage="Please select a country"</code>
          </p>
        </div>

        {/* Convert from native select */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-600">🔄</span>
            Convert Native Select to Design System
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Replace this native HTML select with our Select component from the design system"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will import Select component and convert the native select element to use it with proper props
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
              "Add helper text explaining that the time zone affects notification delivery"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">helperText="Time zone affects when you receive notifications"</code>
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
              "Add a proper accessible label to this filter select that doesn't have a visible label"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">aria-label="Filter by status"</code> (or appropriate label based on context)
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Always provide visible labels using <code className="bg-white px-1 rounded">label</code> prop for accessibility</li>
          <li>• Include a default/empty option ("Select...") as the first choice</li>
          <li>• Use <code className="bg-white px-1 rounded">options</code> prop for cleaner code with dynamic data</li>
          <li>• Selects automatically match Input component styling for consistency</li>
          <li>• Error messages automatically replace helper text and update ARIA attributes</li>
          <li>• Focus rings only appear during keyboard navigation (Tab key)</li>
        </ul>
      </div>
    </div>
  ),
};
