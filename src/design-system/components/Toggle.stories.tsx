import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Design System/Components/Toggle',
  component: Toggle,
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

### Accessibility

✓ **Keyboard Navigation**: Space or Enter to toggle
✓ **Screen Readers**: Announces as "switch" with "on"/"off" state
✓ **Focus Indicator**: Visible focus ring for keyboard users
✓ **ARIA Attributes**: \`role="switch"\`, \`aria-checked\`, \`aria-label\`/\`aria-labelledby\`
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

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
