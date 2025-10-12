import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Components/Button',
  component: Button,
  tags: ['autodocs'],
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
# Button Component

Production-ready button component with semantic token integration and comprehensive variant support.

## Quick Reference

**Types**: 9 variants (primary, outlined, solid, transparent, generative, high-impact, no-fill, subtle, carby)
**Sizes**: 5 sizes (x-small, small, medium, large, large-floating)
**Tokens**: Uses semantic color tokens for theme support

---

## Features

- ✅ **Semantic Tokens**: Uses \`--color-bg-*\` and \`--color-fg-*\` tokens for automatic theme support
- ✅ **Icon Integration**: Built-in support for 386+ icons with automatic sizing
- ✅ **Accessibility**: ARIA support, keyboard navigation, focus management
- ✅ **States**: Default, hover, active, disabled states
- ✅ **Flexible**: Text-only, icon-only, or combined layouts

---

## Button Types

| Type | Background Token | Use Case |
|------|------------------|----------|
| \`primary\` | \`bg-neutral-inverse-base\` | Primary actions (save, submit) |
| \`outlined\` | \`transparent\` with border | Secondary actions (cancel, back) |
| \`solid\` | \`bg-neutral-low\` | Tertiary actions |
| \`transparent\` | \`bg-transparent-low\` | Glassmorphism, overlays |
| \`generative\` | \`bg-positive-high\` | AI/ML features |
| \`high-impact\` | \`bg-alert-high\` | Destructive actions (delete) |
| \`no-fill\` | \`transparent\` | Minimal actions |
| \`subtle\` | \`bg-neutral-subtle\` | Very minimal |
| \`carby\` | \`bg-carby-default\` | Brand-specific |

---

## Icon System

Icons are **automatically sized** based on button size:
- **20px icons** (small): x-small, small, medium buttons
- **24px icons** (medium): large, large-floating buttons

### Using Icons

\`\`\`tsx
// Icon library (386+ options)
<Button iconL="star" label="Favorite" />
<Button iconR="chevron-down" label="Menu" />
<Button iconL="checkmark" iconR="arrow-right" label="Continue" />

// Icon-only (requires aria-label)
<Button iconOnly iconL="star" aria-label="Add to favorites" />

// Custom React icons
<Button leftIcon={<CustomIcon />} label="Custom" />
\`\`\`

---

## Sizes

| Size | Height | Padding | Icon Size | Use Case |
|------|--------|---------|-----------|----------|
| \`x-small\` | 24px | 0px 12px | 20px | Compact UIs, dense layouts |
| \`small\` | 32px | 6px 12px | 20px | **Default - Most common** |
| \`medium\` | 40px | 10px 16px | 20px | Standard forms |
| \`large\` | 56px | 16px 24px | 24px | Hero sections, CTAs |
| \`large-floating\` | 56px | 16px 24px | 24px | Large + elevation shadow |

---

## Token Usage

All button types use semantic tokens:

\`\`\`css
/* Primary Button */
.button-primary {
  background: var(--color-bg-neutral-inverse-base);  /* Dark bg */
  color: var(--color-fg-neutral-inverse-primary);    /* White text */
}

/* Transparent Button */
.button-transparent {
  background: var(--color-bg-transparent-low);       /* Semi-transparent */
  backdrop-filter: blur(24px);                       /* Glassmorphism */
}

/* Carby Button */
.button-carby {
  background: var(--color-bg-carby-default);         /* Brand green */
  color: var(--color-fg-carby-primary);              /* Dark text */
}
\`\`\`

---

## Accessibility

All Button components follow WCAG 2.1 Level AA guidelines and include comprehensive keyboard and screen reader support.

### Keyboard Navigation

- **Tab**: Focus the button
- **Enter or Space**: Activate the button
- **Shift + Tab**: Move focus backward

### Screen Reader Support

Buttons automatically include proper ARIA attributes:
- **role="button"**: Implicit from \`<button>\` element
- **aria-label**: Required for icon-only buttons, optional for text buttons
- **aria-describedby**: Links to additional descriptive text when needed
- **aria-disabled**: Automatically set when \`disabled={true}\`

### Focus Management

All buttons include visible focus indicators:
- **Focus ring**: 2px solid blue outline with offset
- **High contrast**: Focus ring visible in high contrast mode
- **Keyboard only**: Focus ring only appears for keyboard navigation (not mouse clicks)

### Icon-Only Buttons

Icon-only buttons **require** \`aria-label\` for accessibility:

\`\`\`tsx
// ✅ Correct - Has aria-label
<Button iconOnly iconL="trash" aria-label="Delete item" />

// ❌ Wrong - Missing aria-label
<Button iconOnly iconL="trash" />
\`\`\`

### Disabled State

Disabled buttons are properly announced to screen readers:
- Visual: 50% opacity + no pointer events
- Semantic: \`aria-disabled="true"\` attribute
- Keyboard: Not focusable (removed from tab order)

### Color Contrast

All button types meet WCAG AA contrast requirements:
- **Primary**: 4.5:1 contrast ratio (white on dark)
- **Outlined**: 3:1 border contrast + 4.5:1 text
- **Transparent**: Backdrop blur ensures readability
- **High-Impact**: High contrast red for critical actions

### Best Practices for Accessibility

✅ **Do**:
- Always provide \`aria-label\` for icon-only buttons
- Use descriptive labels ("Delete event" not "Delete")
- Maintain consistent button order across pages
- Use \`high-impact\` type for destructive actions (clear visual signal)
- Ensure buttons are at least 24px tall for touch targets

❌ **Don't**:
- Rely solely on color to convey meaning
- Use buttons for navigation (use links instead)
- Create buttons smaller than 24px height
- Disable buttons without explanation
- Use vague labels like "Click here" or "Submit"

---

## Best Practices

### ✅ Do

- Use \`primary\` for main actions (save, submit, continue)
- Use \`outlined\` for secondary actions (cancel, back)
- Use \`high-impact\` for destructive actions (delete, remove)
- Provide \`aria-label\` for icon-only buttons
- Use \`transparent\` over images/gradients for glassmorphism
- Group related buttons together with consistent spacing
- Use appropriate sizes for context (large for heroes, small for toolbars)

### ❌ Don't

- Use multiple \`primary\` buttons in the same view
- Use \`high-impact\` for non-destructive actions
- Forget accessibility for icon-only buttons
- Mix button sizes randomly in the same group
- Override semantic tokens with hard-coded colors
- Create buttons with poor contrast ratios
- Use buttons for navigation (use links/anchors instead)
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

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
        <p className="text-sm text-gray-700 mb-4">
          All Button components follow WCAG 2.1 Level AA guidelines.
        </p>
        <ul className="text-sm space-y-2 mb-6 text-gray-700">
          <li>✓ Keyboard navigation (Tab, Enter, Space)</li>
          <li>✓ Screen reader support with ARIA attributes</li>
          <li>✓ Visible focus indicators (keyboard only)</li>
          <li>✓ WCAG AA color contrast ratios</li>
          <li>✓ Minimum 24px touch targets</li>
        </ul>

        <div className="space-y-6">
          {/* Keyboard Navigation */}
          <div>
            <h4 className="text-base font-semibold mb-3">Keyboard Navigation</h4>
            <p className="text-sm text-gray-600 mb-3">
              Try using Tab, Enter, and Space keys to navigate and activate these buttons:
            </p>
            <div className="flex gap-3">
              <Button type="primary" label="Save" onClick={() => alert('Saved!')} />
              <Button type="outlined" label="Cancel" onClick={() => alert('Cancelled')} />
              <Button type="transparent" label="Preview" onClick={() => alert('Preview')} />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Notice the focus ring appears only when using keyboard (not mouse clicks)
            </p>
          </div>

          {/* Icon-Only with aria-label */}
          <div>
            <h4 className="text-base font-semibold mb-3">Icon-Only Buttons (requires aria-label)</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button iconOnly iconL="trash" aria-label="Delete item" type="high-impact" />
                <code className="text-sm bg-white px-2 py-1 rounded">aria-label="Delete item"</code>
                <span className="text-sm text-green-600">✓ Correct</span>
              </div>
              <div className="flex items-center gap-3">
                <Button iconOnly iconL="star" aria-label="Add to favorites" />
                <code className="text-sm bg-white px-2 py-1 rounded">aria-label="Add to favorites"</code>
                <span className="text-sm text-green-600">✓ Correct</span>
              </div>
              <div className="flex items-center gap-3">
                <Button iconOnly iconL="gear" aria-label="Open settings" type="transparent" />
                <code className="text-sm bg-white px-2 py-1 rounded">aria-label="Open settings"</code>
                <span className="text-sm text-green-600">✓ Correct</span>
              </div>
            </div>
          </div>

          {/* Disabled State */}
          <div>
            <h4 className="text-base font-semibold mb-3">Disabled State</h4>
            <p className="text-sm text-gray-600 mb-3">
              Disabled buttons are not focusable and have <code className="bg-white px-1 rounded">aria-disabled="true"</code>
            </p>
            <div className="flex gap-3">
              <Button type="primary" label="Save" disabled />
              <Button type="outlined" label="Cancel" disabled />
              <Button iconOnly iconL="star" aria-label="Favorite" disabled />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Try tabbing through - disabled buttons are skipped in tab order
            </p>
          </div>

          {/* Color Contrast */}
          <div>
            <h4 className="text-base font-semibold mb-3">Color Contrast (WCAG AA)</h4>
            <p className="text-sm text-gray-600 mb-3">
              All button types meet 4.5:1 contrast ratio for text, 3:1 for borders:
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col items-center gap-2">
                <Button type="primary" label="Primary" />
                <span className="text-xs text-gray-500">4.5:1</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button type="outlined" label="Outlined" />
                <span className="text-xs text-gray-500">4.5:1 + 3:1</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button type="high-impact" label="Delete" />
                <span className="text-xs text-gray-500">7:1 (AAA)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button type="carby" label="Carby" />
                <span className="text-xs text-gray-500">4.5:1</span>
              </div>
            </div>
          </div>

          {/* Touch Targets */}
          <div>
            <h4 className="text-base font-semibold mb-3">Touch Target Sizes</h4>
            <p className="text-sm text-gray-600 mb-3">
              All buttons meet minimum 24px height for accessible touch targets:
            </p>
            <div className="flex items-end gap-3">
              <div className="flex flex-col items-center gap-2">
                <Button size="x-small" label="24px" />
                <span className="text-xs text-gray-500">x-small</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button size="small" label="32px" />
                <span className="text-xs text-gray-500">small</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button size="medium" label="40px" />
                <span className="text-xs text-gray-500">medium</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button size="large" label="56px" />
                <span className="text-xs text-gray-500">large</span>
              </div>
            </div>
          </div>

          {/* Descriptive Labels */}
          <div>
            <h4 className="text-base font-semibold mb-3">Descriptive Labels</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button type="high-impact" iconL="trash" label="Delete event" />
                <span className="text-sm text-green-600">✓ Specific and clear</span>
              </div>
              <div className="flex items-center gap-3">
                <Button type="primary" label="Submit" />
                <span className="text-sm text-red-600">✗ Vague (submit what?)</span>
              </div>
              <div className="flex items-center gap-3">
                <Button type="primary" iconR="arrow-right" label="Continue to checkout" />
                <span className="text-sm text-green-600">✓ Clear next action</span>
              </div>
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
        Use these natural language prompts to work with Claude Code when using the Button component.
      </p>

      <div className="space-y-8">
        {/* Update Button Type */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-600">🎨</span>
            Update Button Type
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Change the save button from outlined to primary type"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will update <code className="bg-gray-100 px-1 rounded">type="outlined"</code> to <code className="bg-gray-100 px-1 rounded">type="primary"</code>
          </p>
        </div>

        {/* Add Icon */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">✨</span>
            Add Icon to Button
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add a checkmark icon to the left of the submit button"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">iconL="checkmark"</code> to the button
          </p>
        </div>

        {/* Replace with Semantic Tokens */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">🔄</span>
            Migrate to Semantic Tokens
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "This custom button uses bg-green-500. Can you replace it with our semantic carby button type?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will suggest <code className="bg-gray-100 px-1 rounded">{"<Button type=\"carby\" />"}</code> using semantic tokens
          </p>
        </div>

        {/* Create Destructive Action */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            Create Destructive Action Button
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Create a delete button with a trash icon and make it look dangerous"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will create <code className="bg-gray-100 px-1 rounded">{"<Button type=\"high-impact\" iconL=\"trash\" label=\"Delete\" />"}</code>
          </p>
        </div>

        {/* Make Button Accessible */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-orange-600">♿</span>
            Fix Accessibility
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "This icon-only button is missing an aria-label. Can you fix it?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">aria-label="Descriptive text"</code> to the button
          </p>
        </div>

        {/* Find Right Button Size */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-indigo-600">📏</span>
            Choose Right Size
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "What button size should I use for a hero CTA on a landing page?"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will recommend <code className="bg-gray-100 px-1 rounded">size="large"</code> or <code className="bg-gray-100 px-1 rounded">size="large-floating"</code> for prominence
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Always use <code className="bg-white px-1 rounded">type="primary"</code> for main actions</li>
          <li>• Use <code className="bg-white px-1 rounded">type="high-impact"</code> only for destructive actions</li>
          <li>• Icon-only buttons require <code className="bg-white px-1 rounded">aria-label</code> for accessibility</li>
          <li>• Button types use semantic tokens that adapt to light/dark themes automatically</li>
        </ul>
      </div>

      <div className="mt-6 p-6 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Component Documentation:</strong> See the Docs page above for complete API reference and token usage
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example prompts for working with Claude Code AI assistant when using the Button component.',
      },
    },
  },
};
