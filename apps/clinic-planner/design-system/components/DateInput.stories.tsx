import type { Meta, StoryObj } from '@storybook/react';
import { DateInput } from './DateInput';
import { useState } from 'react';

const meta: Meta<typeof DateInput> = {
  title: 'Design System/Components/DateInput',
  component: DateInput,
  tags: ['autodocs'],

  argTypes: {
    // 1. CORE PROPS
    value: {
      control: 'text',
      description: 'Selected date value (YYYY-MM-DD format)',
      table: {
        category: 'Core Props',
        type: { summary: 'string' },
      },
    },
    onChange: {
      description: 'Callback when date changes',
      table: {
        category: 'Core Props',
        type: { summary: '(e: ChangeEvent<HTMLInputElement>) => void' },
      },
    },

    // 2. CONTENT PROPS
    label: {
      control: 'text',
      description: 'Label text displayed above the date input',
      table: {
        category: 'Content Props',
        type: { summary: 'string' },
      },
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the date input',
      table: {
        category: 'Content Props',
        type: { summary: 'string' },
      },
    },
    errorMessage: {
      control: 'text',
      description: 'Error message (replaces helperText when error=true)',
      table: {
        category: 'Content Props',
        type: { summary: 'string' },
      },
    },

    // 3. VISUAL PROPS
    type: {
      control: 'select',
      options: ['outlined', 'filled'],
      description: 'Visual style variant',
      table: {
        category: 'Visual Props',
        type: { summary: '"outlined" | "filled"' },
        defaultValue: { summary: 'outlined' },
      },
    },

    // 4. LAYOUT PROPS
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size variant',
      table: {
        category: 'Layout Props',
        type: { summary: '"small" | "medium" | "large"' },
        defaultValue: { summary: 'medium' },
      },
    },
    wrapperClassName: {
      control: 'text',
      description: 'Additional classes for wrapper div',
      table: {
        category: 'Layout Props',
        type: { summary: 'string' },
      },
    },
    containerClassName: {
      control: 'text',
      description: 'Additional classes for input container',
      table: {
        category: 'Layout Props',
        type: { summary: 'string' },
      },
    },

    // 5. STATE PROPS
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: {
        category: 'State Props',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Required field',
      table: {
        category: 'State Props',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    error: {
      control: 'boolean',
      description: 'Error state',
      table: {
        category: 'State Props',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },

    // 6. ACCESSIBILITY PROPS
    id: {
      control: 'text',
      description: 'ID for the input element',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
      },
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible label for screen readers',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
      },
    },
    'aria-describedby': {
      control: 'text',
      description: 'ID(s) of elements describing the input',
      table: {
        category: 'Accessibility',
        type: { summary: 'string' },
      },
    },
  },

  parameters: {
    controls: {
      exclude: ['children', 'className', 'style', 'ref', 'key', 'onFocus', 'onBlur', 'onMouseEnter', 'onMouseLeave'],
    },
    docs: {
      description: {
        component: `
# DateInput

Production-ready date input component with native browser date picker, matching design system styling across all form components.

## Quick Reference

**Types**: 2 variants (outlined, filled)
**Sizes**: 3 sizes (small, medium, large)
**Tokens**: Uses semantic color and dimension tokens

---

## Features

- ✅ **Native Date Picker**: Uses HTML5 date input with built-in calendar widget
- ✅ **Design System Consistency**: Matches Input and Select component styling
- ✅ **Full State Management**: Default, hover, focused, error, and disabled states
- ✅ **Keyboard Accessible**: Tab navigation with focus-visible indicators
- ✅ **Screen Reader Support**: Proper ARIA labels and semantic HTML
- ✅ **Token-Based**: Uses design system tokens for theming

---

## Types

| Type | Token Base | Use Case |
|------|-----------|----------|
| \`outlined\` | Border with transparent background | Default form inputs, clean interfaces |
| \`filled\` | Filled background, no border | Dense forms, cards, elevated surfaces |

**Outlined** uses box-shadow for borders to prevent size jumping between states.
**Filled** changes background color on hover/focus.

---

## Sizes

| Size | Height | Padding | Icon Size | Use Case |
|------|--------|---------|-----------|----------|
| \`small\` | 32px | 6px 12px | Small (20px) | Compact forms, tables, inline editing |
| \`medium\` | 40px | 10px 12px | Small (20px) | Standard forms, most common use case |
| \`large\` | 56px | 16px 16px | Medium (24px) | Prominent forms, mobile-optimized interfaces |

**Note:** Vertical padding is balanced to center text and icon. Large variant uses 16px body text.

---

## Calendar Icon

DateInput displays a calendar icon on the right side of the input field:

- **Icon**: Uses the \`calendar\` icon from the design system
- **Size**: Small icon (20px) for small/medium, medium icon (24px) for large
- **Position**: Absolutely positioned, right-aligned, vertically centered
- **Interaction**: Native date picker opens on input click (icon is decorative)

The native browser calendar picker indicator is hidden and replaced with our design system icon for visual consistency.

---

## Token Usage

DateInput uses semantic tokens that adapt to themes:

\`\`\`tsx
// Outlined type (default)
<DateInput type="outlined">
  // Border: --color-bg-neutral-low (default)
  // Border Hover: --color-bg-neutral-medium
  // Border Focus: --color-bg-input-high (2px)
  // Border Error: --color-bg-alert-high
</DateInput>

// Filled type
<DateInput type="filled">
  // Background: --color-bg-transparent-subtle (default)
  // Background Hover: --color-bg-transparent-low
  // Background Focus: --color-bg-input-low
  // Background Error: --color-bg-alert-low
</DateInput>

// Text colors
// Primary text: --color-fg-neutral-primary
// Label: --color-fg-neutral-tertiary
// Error text: --color-fg-alert-high
// Disabled text: --color-fg-neutral-secondary

// Border radius
// All sizes: --dimension-radius-sm (8px)

// Focus ring
// Color: --color-a11y-primary (bright blue for accessibility)
\`\`\`

---

## Accessibility

All DateInput components follow WCAG 2.1 Level AA guidelines and include comprehensive keyboard and screen reader support.

### Keyboard Navigation

- **Tab**: Navigate to/from date input
- **Space/Enter**: Open native date picker (browser-dependent)
- **Arrow Keys**: Navigate within date picker calendar (browser-dependent)
- **Escape**: Close date picker (browser-dependent)

### Screen Reader Support

DateInput automatically includes proper ARIA attributes:
- **\`aria-label\`**: Custom accessible label (if provided)
- **\`aria-describedby\`**: Links to helper text or error message
- **\`aria-invalid\`**: Indicates error state (when \`error={true}\`)
- **\`aria-required\`**: Indicates required field (when \`required={true}\`)

The calendar icon is decorative and hidden from screen readers using \`pointer-events-none\`.

### Focus Management

DateInput uses a standardized focus ring for keyboard navigation:
- **Focus ring**: 2px bright blue (#4578ff) ring with 2px offset
- **Keyboard only**: Visible only when navigating with Tab (not mouse clicks)
- **High contrast mode**: Automatically adapts to user's contrast preferences

### Label Requirements

\`\`\`tsx
// ✅ Correct - Always provide a label or aria-label
<DateInput label="Event Date" value={date} onChange={setDate} />

// ✅ Also correct - aria-label for screen readers
<DateInput aria-label="Select event date" value={date} onChange={setDate} />

// ❌ Wrong - No accessible label
<DateInput value={date} onChange={setDate} />
\`\`\`

### Disabled State

When disabled:
- Input is not focusable or editable
- Cursor changes to \`not-allowed\`
- Colors use \`--color-fg-neutral-disabled\` token
- Screen readers announce disabled state
- Native date picker cannot be opened

### Color Contrast

All DateInput variants meet WCAG AA contrast requirements:
- **Text**: 4.5:1 minimum contrast ratio
- **Focus ring**: 3:1 minimum contrast ratio against background
- **Error state**: High contrast red for visibility

### Best Practices for Accessibility

✅ **Do**:
- Always provide a \`label\` or \`aria-label\`
- Use \`helperText\` to provide format hints
- Show \`errorMessage\` for validation feedback
- Mark required fields with \`required={true}\`
- Use semantic date format (YYYY-MM-DD)

❌ **Don't**:
- Rely solely on placeholder text for labels
- Use date input without accessible name
- Skip error messages for failed validation
- Disable without clear indication why

---

## Best Practices

### ✅ When to Use DateInput

- Selecting specific calendar dates (events, birthdays, appointments)
- Date range inputs (start/end dates)
- Forms requiring date validation
- Filtering data by date
- Date-based scheduling interfaces

### ✅ Do

- Provide clear labels describing what date to select
- Use helper text for format requirements or constraints
- Show validation errors with specific messages
- Set reasonable \`min\` and \`max\` date constraints when applicable
- Use \`filled\` type in card-based or elevated form layouts

### ❌ Don't

- Use for approximate dates (use dropdown selects instead)
- Require dates far in the past/future (consider year dropdown first)
- Use without labels or accessible names
- Show cryptic error messages ("Invalid date" → "Please select a date after today")
- Nest inside elements that prevent date picker from opening
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DateInput>;

// ============================================================================
// 1. PLAYGROUND
// ============================================================================

export const Playground: Story = {
  args: {
    label: 'Select Date',
    helperText: 'Choose a date from the calendar',
    type: 'outlined',
    size: 'medium',
    disabled: false,
    error: false,
  },
};

// ============================================================================
// 2. ALL TYPES
// ============================================================================

export const AllTypes: Story = {
  render: () => {
    const [outlinedDate, setOutlinedDate] = useState('2025-01-15');
    const [filledDate, setFilledDate] = useState('2025-01-15');

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Type Variants</h3>
          <p className="text-sm text-gray-600 mb-6">
            DateInput supports two visual types: outlined (border) and filled (background).
          </p>
          <div className="space-y-6 max-w-md">
            <DateInput
              type="outlined"
              label="Outlined Type"
              helperText="Border with transparent background"
              value={outlinedDate}
              onChange={(e) => setOutlinedDate(e.target.value)}
            />
            <DateInput
              type="filled"
              label="Filled Type"
              helperText="Filled background with no border"
              value={filledDate}
              onChange={(e) => setFilledDate(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// 3. ALL SIZES
// ============================================================================

export const AllSizes: Story = {
  render: () => {
    const [date, setDate] = useState('2025-01-15');

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Size Variants</h3>
          <p className="text-sm text-gray-600 mb-6">
            DateInput supports small (32px), medium (40px), and large (56px) sizes.
          </p>
          <div className="space-y-6 max-w-md">
            <DateInput
              size="small"
              label="Small (32px)"
              helperText="Compact forms, tables"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DateInput
              size="medium"
              label="Medium (40px)"
              helperText="Standard forms (default)"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DateInput
              size="large"
              label="Large (56px)"
              helperText="Prominent forms, mobile"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Sizes with Filled Type</h3>
          <div className="space-y-6 max-w-md">
            <DateInput
              type="filled"
              size="small"
              label="Small Filled"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DateInput
              type="filled"
              size="medium"
              label="Medium Filled"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DateInput
              type="filled"
              size="large"
              label="Large Filled"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// 4. STATES
// ============================================================================

export const States: Story = {
  render: () => {
    const [date, setDate] = useState('2025-01-15');

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Interactive States - Outlined</h3>
          <p className="text-sm text-gray-600 mb-6">
            Interact with each input to see hover, focus, and error states.
          </p>
          <div className="space-y-6 max-w-md">
            <DateInput
              label="Default State"
              helperText="Normal date input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DateInput
              label="With Error"
              error
              errorMessage="Please select a date after today"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DateInput
              label="Required Field"
              helperText="This field is required"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DateInput
              label="Disabled State"
              helperText="Cannot be edited"
              disabled
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Interactive States - Filled</h3>
          <div className="space-y-6 max-w-md">
            <DateInput
              type="filled"
              label="Default State"
              helperText="Normal date input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DateInput
              type="filled"
              label="With Error"
              error
              errorMessage="Please select a date after today"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DateInput
              type="filled"
              label="Required Field"
              helperText="This field is required"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <DateInput
              type="filled"
              label="Disabled State"
              helperText="Cannot be edited"
              disabled
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// 5. REAL WORLD EXAMPLES
// ============================================================================

export const RealWorldExamples: Story = {
  render: () => {
    const [eventDate, setEventDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [birthDate, setBirthDate] = useState('');

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Event Creation Form</h3>
          <div className="bg-white rounded-xl p-6 max-w-md space-y-4">
            <DateInput
              type="filled"
              label="Event Date"
              helperText="When does your event take place?"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Date Range Filter</h3>
          <div className="bg-white rounded-xl p-6 max-w-md space-y-4">
            <DateInput
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <DateInput
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">User Profile Form</h3>
          <div className="bg-white rounded-xl p-6 max-w-md space-y-4">
            <DateInput
              type="filled"
              label="Date of Birth"
              helperText="You must be 18 or older to register"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max="2007-01-01"
            />
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// 6. ACCESSIBILITY DEMO
// ============================================================================

export const AccessibilityDemo: Story = {
  render: () => {
    const [date1, setDate1] = useState('2025-01-15');
    const [date2, setDate2] = useState('');

    return (
      <div className="p-8 space-y-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
          <p className="text-sm text-gray-700 mb-4">
            DateInput follows WCAG 2.1 Level AA guidelines.
          </p>
          <ul className="text-sm space-y-2 mb-6 text-gray-700">
            <li>✓ Keyboard navigation with Tab key</li>
            <li>✓ Focus-visible indicators (keyboard only, not mouse)</li>
            <li>✓ Proper ARIA labels and semantic HTML</li>
            <li>✓ Screen reader announcements for states</li>
            <li>✓ High contrast mode support</li>
          </ul>

          <div className="space-y-6">
            {/* Keyboard Navigation Demo */}
            <div>
              <h4 className="text-base font-semibold mb-3">Keyboard Navigation</h4>
              <p className="text-sm text-gray-600 mb-3">
                Try navigating with Tab key - notice the blue focus ring appears only for keyboard navigation, not mouse clicks.
              </p>
              <div className="space-y-4 max-w-md">
                <DateInput
                  label="First Date Input"
                  value={date1}
                  onChange={(e) => setDate1(e.target.value)}
                />
                <DateInput
                  label="Second Date Input"
                  value={date2}
                  onChange={(e) => setDate2(e.target.value)}
                />
              </div>
            </div>

            {/* ARIA Attributes Demo */}
            <div>
              <h4 className="text-base font-semibold mb-3">ARIA Attributes</h4>
              <p className="text-sm text-gray-600 mb-3">
                All date inputs have proper ARIA attributes for screen readers.
              </p>
              <div className="space-y-3 max-w-md">
                <DateInput
                  label="With aria-label"
                  aria-label="Select event start date"
                  value={date1}
                  onChange={(e) => setDate1(e.target.value)}
                />
                <DateInput
                  label="Required field"
                  helperText="This field is required"
                  required
                  value={date2}
                  onChange={(e) => setDate2(e.target.value)}
                />
                <DateInput
                  label="Error state"
                  error
                  errorMessage="Date must be in the future"
                  value={date1}
                  onChange={(e) => setDate1(e.target.value)}
                />
              </div>
            </div>

            {/* Label Requirements */}
            <div>
              <h4 className="text-base font-semibold mb-3">Label Requirements</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 bg-white p-3 rounded border border-green-200">
                    <code className="text-sm">&lt;DateInput label="Event Date" /&gt;</code>
                  </div>
                  <span className="text-sm text-green-600 font-medium">✓ Correct</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-1 bg-white p-3 rounded border border-green-200">
                    <code className="text-sm">&lt;DateInput aria-label="Select date" /&gt;</code>
                  </div>
                  <span className="text-sm text-green-600 font-medium">✓ Correct</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-1 bg-white p-3 rounded border border-red-200">
                    <code className="text-sm">&lt;DateInput /&gt;</code>
                  </div>
                  <span className="text-sm text-red-600 font-medium">✗ Wrong - No label</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// 7. CLAUDE CODE EXAMPLES
// ============================================================================

export const ClaudeCodeExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6">Working with Claude Code (AI Assistant)</h2>
      <p className="text-gray-600 mb-8">
        Use these natural language prompts when working with DateInput in your React components.
      </p>

      <div className="space-y-8">
        {/* Example 1 */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-600">📋</span>
            Creating a Basic Date Input
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add a date input for the event date with a label and helper text"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will import DateInput and add <code>&lt;DateInput label="Event Date" helperText="Select the event date" value=&#123;date&#125; onChange=&#123;(e) =&gt; setDate(e.target.value)&#125; /&gt;</code>
          </p>
        </div>

        {/* Example 2 */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">🎨</span>
            Changing the Visual Style
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Change the date input to use the filled type instead of outlined"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will update to <code>type="filled"</code> for a filled background style
          </p>
        </div>

        {/* Example 3 */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-orange-600">⚠️</span>
            Adding Validation
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add validation to show an error if the selected date is in the past"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add validation logic and set <code>error=&#123;isPastDate&#125; errorMessage="Please select a future date"</code>
          </p>
        </div>

        {/* Example 4 */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">📏</span>
            Adjusting Size
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Make the date input larger for better mobile usability"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code>size="large"</code> to increase height to 56px with larger text
          </p>
        </div>

        {/* Example 5 */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-red-600">🚫</span>
            Date Range Constraints
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Restrict the date picker to only allow dates within the next year"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code>min=&#123;today&#125; max=&#123;nextYear&#125;</code> props using calculated date strings
          </p>
        </div>

        {/* Example 6 */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-indigo-600">♿</span>
            Improving Accessibility
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add proper accessibility attributes to the date input for screen readers"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code>aria-label</code>, <code>required</code>, and ensure <code>label</code> prop is set
          </p>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• DateInput value format is always YYYY-MM-DD (HTML5 standard)</li>
          <li>• Use <code>min</code> and <code>max</code> props to set date constraints</li>
          <li>• The filled type works best in card-based layouts or elevated surfaces</li>
          <li>• Always provide a <code>label</code> or <code>aria-label</code> for accessibility</li>
          <li>• Use <code>helperText</code> to provide context about date format or requirements</li>
          <li>• The native date picker appearance varies by browser but maintains consistent input styling</li>
        </ul>
      </div>
    </div>
  ),
};
