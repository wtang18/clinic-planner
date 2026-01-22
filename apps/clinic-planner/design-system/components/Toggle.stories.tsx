import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Design System/Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    // Core props
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'The size of the toggle',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the toggle is on/off',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },

    // Label props
    label: {
      control: 'text',
      description: 'Optional label text',
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the label relative to toggle',
      if: { arg: 'label', truthy: true },
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label (required if no label prop)',
      table: {
        category: 'Accessibility',
      },
    },
    'aria-describedby': {
      control: 'text',
      description: 'ID of element describing the toggle',
      table: {
        category: 'Accessibility',
      },
    },
  },

  parameters: {
    controls: {
      exclude: ['onChange', 'className', 'style', 'ref', 'key'],
    },
    docs: {
      description: {
        component: `
# Toggle Component

Production-ready toggle/switch component with semantic token integration and smooth animations.

## Quick Reference

See the **Visual Examples** story below for a quick preview of toggle states and sizes.

**Sizes**: 2 sizes (small, medium)
**States**: On/Off with hover and disabled states
**Tokens**: Uses semantic input and transparent tokens for theme support

---

## Features

- ✅ **Semantic Tokens**: Uses \`--color-bg-input-*\` and \`--color-bg-transparent-*\` tokens for automatic theme support
- ✅ **Smooth Animations**: Thumb slides smoothly with transition effects
- ✅ **Accessibility**: Full keyboard navigation, ARIA switch role, screen reader support
- ✅ **Controlled Component**: Fully controlled state management
- ✅ **Optional Labels**: Left or right label positioning

---

## Sizes

| Size | Track Dimensions | Thumb Size | Padding | Use Case |
|------|------------------|------------|---------|----------|
| \`small\` | 32x18px | 14x14px | 2px | Compact UIs, dense settings |
| \`medium\` | 48x28px | 24x24px | 2px | **Default - Most common** |

---

## States

| State | Track Color | Thumb Position | Hover Effect | Interactive |
|-------|-------------|----------------|--------------|-------------|
| **Off** | \`bg-transparent-low\` (gray) | Left | Darker gray | Yes |
| **On** | \`bg-input-high\` (blue) | Right | Darker blue | Yes |
| **Disabled Off** | Gray, 50% opacity | Left | None | No |
| **Disabled On** | Blue, 50% opacity | Right | None | No |

All state transitions include smooth animations.

---

## Token Usage

Toggle uses semantic tokens that adapt to themes:

\`\`\`tsx
// Off state
// Track: var(--color-bg-transparent-low)
// Hover: var(--color-bg-transparent-low-accented)

// On state
// Track: var(--color-bg-input-high)
// Hover: var(--color-bg-input-high-accented)

// Thumb: Always white (--color-white-solid)
\`\`\`

---

## Best Practices

### ✅ When to Use Toggles

- Binary settings (on/off, enable/disable)
- Feature flags and preferences
- Instant state changes (no form submission needed)
- Visibility controls (show/hide sections)
- Notification preferences

### ✅ Do

- Provide a clear label describing what the toggle controls
- Use \`onChange\` to handle state updates immediately
- Show the effect of the toggle change immediately
- Use labels that work in both on/off states ("Dark Mode", not "Turn on dark mode")
- Provide \`aria-label\` if no visible label is present

### ❌ Don't

- Use for actions that require confirmation (use Button instead)
- Use for more than two options (use SegmentedControl or Radio buttons)
- Rely solely on color to indicate state (motion and position are primary indicators)
- Change the label text based on the toggle state
- Use when the change isn't immediate (use Checkbox with submit button instead)

---

## Accessibility

All Toggle components follow WCAG 2.1 Level AA guidelines and include comprehensive keyboard and screen reader support.

### Keyboard Navigation

- **Tab**: Focus the toggle
- **Space or Enter**: Toggle between on/off states
- **Shift + Tab**: Move focus backward

### Screen Reader Support

Toggle automatically includes proper ARIA attributes:
- **role="switch"**: Announces element as a toggle switch (not checkbox)
- **aria-checked**: Announces current state ("on" or "off")
- **aria-label**: Use when no visible label is present
- **aria-labelledby**: Automatically links to visible label if provided
- **aria-disabled**: Automatically set when \`disabled={true}\`

Screen readers announce:
- "Switch" (not "checkbox")
- Label text
- Current state (on/off or checked/unchecked)
- Disabled state if applicable

### Focus Management

All toggles include visible focus indicators:
- **Focus ring**: 2px solid blue outline with offset
- **High contrast**: Focus ring visible in high contrast mode
- **Keyboard only**: Focus ring only appears for keyboard navigation

### Labels

Always provide proper labeling for accessibility:

\`\`\`tsx
// ✅ Correct - Visible label
<Toggle
  checked={enabled}
  onChange={setEnabled}
  label="Enable notifications"
/>

// ✅ Correct - aria-label when no visible label
<Toggle
  checked={enabled}
  onChange={setEnabled}
  aria-label="Enable dark mode"
/>

// ❌ Wrong - No label at all
<Toggle checked={enabled} onChange={setEnabled} />
\`\`\`

Label position is flexible:
\`\`\`tsx
// Label on left (common for settings)
<Toggle label="Dark Mode" labelPosition="left" checked={dark} onChange={setDark} />

// Label on right (default)
<Toggle label="Enable" labelPosition="right" checked={enabled} onChange={setEnabled} />
\`\`\`

### Disabled State

Disabled toggles are properly excluded from keyboard navigation:
- Visual: 50% opacity + no pointer events
- Semantic: \`aria-disabled="true"\` attribute
- Keyboard: Not focusable (removed from tab order)
- Screen reader: Announced as "disabled"

### Color Contrast

Toggle states meet WCAG AA contrast requirements:
- **Off state**: Gray track with sufficient contrast (3:1 minimum)
- **On state**: Blue track with 4.5:1+ contrast
- **Thumb**: White thumb always has high contrast against track
- **Motion indicators**: Position and animation are primary state indicators (not just color)

### Touch Targets

All toggles meet minimum touch target size:
- **Small**: 32x18px track with 14px thumb (minimum for touch)
- **Medium**: 48x28px track with 24px thumb (comfortable)

### Best Practices for Accessibility

✅ **Do**:
- Always provide visible label or aria-label
- Use labels that describe the setting, not the action (e.g., "Dark Mode" not "Toggle dark mode")
- Use consistent label text regardless of toggle state
- Show the effect of toggle change immediately
- Use role="switch" (handled automatically)
- Ensure sufficient color contrast for both states

❌ **Don't**:
- Forget to provide a label (screen readers need it)
- Change label text based on toggle state (confusing for screen readers)
- Use toggle for actions that require confirmation
- Rely solely on color to indicate state (use motion/position)
- Use toggles for more than two options
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

// Visual Examples Story - appears first in docs
export const VisualExamples: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: 'var(--color-fg-neutral-secondary)' }}>Off:</span>
        <Toggle size="medium" checked={false} onChange={() => {}} aria-label="Off example" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: 'var(--color-fg-neutral-secondary)' }}>On:</span>
        <Toggle size="medium" checked={true} onChange={() => {}} aria-label="On example" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px', color: 'var(--color-fg-neutral-secondary)' }}>Small:</span>
        <Toggle size="small" checked={true} onChange={() => {}} aria-label="Small example" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Quick visual reference showing toggle states and sizes.',
      },
    },
  },
};

// Wrapper component for controlled state in Playground
const ControlledToggle = (args: any) => {
  const [checked, setChecked] = useState(args.checked ?? false);
  return <Toggle {...args} checked={checked} onChange={setChecked} />;
};

export const Playground: Story = {
  render: ControlledToggle,
  args: {
    size: 'medium',
    checked: false,
    disabled: false,
    label: 'Toggle setting',
    labelPosition: 'right',
  },
};

export const AllSizes: Story = {
  render: () => {
    const [small, setSmall] = useState(false);
    const [medium, setMedium] = useState(false);

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Toggle Sizes</h3>
          <div className="flex flex-col gap-4">
            <Toggle
              size="small"
              checked={small}
              onChange={setSmall}
              label="Small toggle"
            />
            <Toggle
              size="medium"
              checked={medium}
              onChange={setMedium}
              label="Medium toggle"
            />
          </div>
        </div>
      </div>
    );
  },
};

export const WithLabels: Story = {
  render: () => {
    const [left, setLeft] = useState(false);
    const [right, setRight] = useState(true);
    const [noLabel, setNoLabel] = useState(false);

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Toggle with Labels</h3>
          <div className="flex flex-col gap-4">
            <Toggle
              checked={left}
              onChange={setLeft}
              label="Label on left"
              labelPosition="left"
            />
            <Toggle
              checked={right}
              onChange={setRight}
              label="Label on right"
              labelPosition="right"
            />
            <div className="flex items-center gap-2">
              <Toggle
                checked={noLabel}
                onChange={setNoLabel}
                aria-label="Toggle without visible label"
              />
              <span className="text-sm text-gray-600">
                (No visible label, uses aria-label)
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => {
    const [offState, setOffState] = useState(false);
    const [onState, setOnState] = useState(true);

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Toggle States</h3>
          <div className="flex flex-col gap-4">
            <Toggle checked={offState} onChange={setOffState} label="Off state" />
            <Toggle checked={onState} onChange={setOnState} label="On state" />
            <Toggle checked={false} onChange={() => {}} disabled label="Disabled off" />
            <Toggle checked={true} onChange={() => {}} disabled label="Disabled on" />
          </div>
        </div>
      </div>
    );
  },
};

export const ControlledExample: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Controlled Toggle</h3>
          <p className="text-sm text-gray-600 mb-4">
            State is managed by parent component. Current state: {checked ? 'ON' : 'OFF'}
          </p>
          <div className="flex flex-col gap-4">
            <Toggle checked={checked} onChange={setChecked} label="Controlled toggle" />
            <button
              onClick={() => setChecked(!checked)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-fit"
            >
              Toggle from external button
            </button>
            <button
              onClick={() => setChecked(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 w-fit"
            >
              Reset to OFF
            </button>
          </div>
        </div>
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      notifications: true,
      darkMode: false,
      autoSave: true,
      analytics: false,
    });

    const handleToggle = (key: keyof typeof settings) => {
      setSettings((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Settings Form Example</h3>
          <div className="max-w-md bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium">Enable notifications</h4>
                <p className="text-sm text-gray-600">Receive email updates</p>
              </div>
              <Toggle
                checked={settings.notifications}
                onChange={() => handleToggle('notifications')}
                aria-label="Enable notifications"
              />
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium">Dark mode</h4>
                <p className="text-sm text-gray-600">Use dark theme</p>
              </div>
              <Toggle
                checked={settings.darkMode}
                onChange={() => handleToggle('darkMode')}
                aria-label="Enable dark mode"
              />
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium">Auto-save</h4>
                <p className="text-sm text-gray-600">Automatically save changes</p>
              </div>
              <Toggle
                checked={settings.autoSave}
                onChange={() => handleToggle('autoSave')}
                aria-label="Enable auto-save"
              />
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium">Analytics</h4>
                <p className="text-sm text-gray-600">Share usage data</p>
              </div>
              <Toggle
                checked={settings.analytics}
                onChange={() => handleToggle('analytics')}
                aria-label="Enable analytics"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium mb-2">Current Settings:</p>
            <pre className="text-xs">{JSON.stringify(settings, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  },
};

export const ClaudeCodeExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6">Working with Claude Code (AI Assistant)</h2>
      <p className="text-gray-600 mb-8">
        Use these natural language prompts to work with Claude Code when using the Toggle component.
      </p>

      <div className="space-y-8">
        {/* Add Toggle for Setting */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-600">⚙️</span>
            Add Settings Toggle
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add a toggle switch to enable/disable dark mode in the settings"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add a Toggle component with <code className="bg-gray-100 px-1 rounded">checked</code> state and <code className="bg-gray-100 px-1 rounded">onChange</code> handler, plus a label
          </p>
        </div>

        {/* Change Toggle Size */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-600">📏</span>
            Adjust Toggle Size
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Use the small toggle size for this compact settings panel"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">size="small"</code> to the Toggle
          </p>
        </div>

        {/* Add Label */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">🏷️</span>
            Add Descriptive Label
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Add a label to the left of the toggle that says 'Email Notifications'"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">label="Email Notifications"</code> and <code className="bg-gray-100 px-1 rounded">labelPosition="left"</code>
          </p>
        </div>

        {/* Disable Toggle */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-red-600">🚫</span>
            Conditionally Disable
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "Disable this toggle when the user doesn't have admin permissions"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add conditional <code className="bg-gray-100 px-1 rounded">disabled={'{!isAdmin}'}</code> prop
          </p>
        </div>

        {/* Immediate Effect */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-orange-600">⚡</span>
            Trigger Immediate Action
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "When the user toggles 'Show Advanced Options', immediately show/hide the advanced settings section"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add Toggle with onChange handler that updates state, and conditional rendering for the advanced section
          </p>
        </div>

        {/* Accessibility */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-indigo-600">♿</span>
            Add Accessible Label
          </h3>
          <div className="bg-white p-4 rounded border border-gray-200 mb-3">
            <code className="text-sm text-gray-800">
              "This toggle doesn't have a visible label, add an aria-label for screen readers"
            </code>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1 rounded">aria-label</code> prop with descriptive text
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Toggles are for instant binary changes (on/off)</li>
          <li>• Always provide a clear label describing what the toggle controls</li>
          <li>• Use labels that work in both states (e.g., "Dark Mode" not "Enable Dark Mode")</li>
          <li>• Show the effect of the toggle immediately, no submit button needed</li>
          <li>• Toggles use semantic tokens that automatically adapt to light/dark themes</li>
        </ul>
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(false);

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
          <p className="text-sm text-gray-600 mb-4">
            Toggle components are fully keyboard accessible. Try using Tab, Space, and Enter keys.
          </p>
          <div className="flex flex-col gap-4">
            <Toggle
              checked={enabled}
              onChange={setEnabled}
              label="Keyboard accessible toggle"
            />
            <p className="text-sm text-gray-600">
              • <strong>Tab:</strong> Focus the toggle
              <br />
              • <strong>Space or Enter:</strong> Toggle on/off
              <br />
              • <strong>role="switch":</strong> Screen readers announce as a switch
              <br />
              • <strong>aria-checked:</strong> Screen readers announce current state
            </p>
          </div>
        </div>
      </div>
    );
  },
};
