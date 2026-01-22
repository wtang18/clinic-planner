import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Design System/Components/Toggle',
  component: Toggle,
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Label position',
    },
  },
  args: {
    size: 'medium',
    disabled: false,
    labelPosition: 'right',
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>Toggle</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Switch control for binary on/off states with smooth animation
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Quick Reference</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Medium:</Text> 48x28px track, 24x24px thumb
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Small:</Text> 32x18px track, 14x14px thumb
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Off:</Text> Gray track, white thumb
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>On:</Text> Blue track (#376c89), white thumb
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Features</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Smooth spring animation</Text>
          <Text style={{ fontSize: 14 }}>✅ Two sizes (small, medium)</Text>
          <Text style={{ fontSize: 14 }}>✅ Label positioning (left, right)</Text>
          <Text style={{ fontSize: 14 }}>✅ Disabled state support</Text>
          <Text style={{ fontSize: 14 }}>✅ Accessibility with switch role</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Platform Differences</Text>
        <Text style={{ fontSize: 14 }}>
          • RN uses Animated API for smooth transitions{'\n'}
          • RN uses TouchableOpacity for interaction{'\n'}
          • accessibilityRole="switch" for screen readers
        </Text>
      </View>
    </ScrollView>
  ),
};

export const Playground: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <View style={{ padding: 16 }}>
        <Toggle {...args} checked={checked} onChange={setChecked} />
      </View>
    );
  },
  args: {
    size: 'medium',
    disabled: false,
    labelPosition: 'right',
    label: 'Enable notifications',
  },
};

export const AllSizes: Story = {
  render: () => {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(true);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Small (32x18px)</Text>
        <Toggle size="small" checked={checked1} onChange={setChecked1} label="Small toggle" />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Medium (48x28px) - Default
        </Text>
        <Toggle size="medium" checked={checked2} onChange={setChecked2} label="Medium toggle" />
      </ScrollView>
    );
  },
};

export const States: Story = {
  render: () => {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(true);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Off</Text>
        <Toggle checked={checked1} onChange={setChecked1} label="Toggle me on" />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>On</Text>
        <Toggle checked={checked2} onChange={setChecked2} label="Toggle me off" />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>Disabled Off</Text>
        <Toggle checked={false} onChange={() => {}} disabled label="Disabled off" />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>Disabled On</Text>
        <Toggle checked={true} onChange={() => {}} disabled label="Disabled on" />
      </ScrollView>
    );
  },
};

export const LabelPositions: Story = {
  render: () => {
    const [checked1, setChecked1] = useState(true);
    const [checked2, setChecked2] = useState(true);
    const [checked3, setChecked3] = useState(true);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Label Right (Default)</Text>
        <Toggle checked={checked1} onChange={setChecked1} label="Enable feature" labelPosition="right" />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>Label Left</Text>
        <Toggle checked={checked2} onChange={setChecked2} label="Enable feature" labelPosition="left" />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>No Label</Text>
        <Toggle checked={checked3} onChange={setChecked3} accessibilityLabel="Enable feature" />
      </ScrollView>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [autoSave, setAutoSave] = useState(true);
    const [airplane, setAirplane] = useState(false);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Settings Panel</Text>
        <View style={{ gap: 16 }}>
          <Toggle checked={notifications} onChange={setNotifications} label="Push Notifications" />
          <Toggle checked={darkMode} onChange={setDarkMode} label="Dark Mode" />
          <Toggle checked={autoSave} onChange={setAutoSave} label="Auto-save" />
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Compact Settings (Small)
        </Text>
        <View style={{ gap: 12 }}>
          <Toggle size="small" checked={airplane} onChange={setAirplane} label="Airplane Mode" />
          <Toggle size="small" checked={true} onChange={() => {}} label="Wi-Fi" />
          <Toggle size="small" checked={false} onChange={() => {}} label="Bluetooth" />
        </View>
      </ScrollView>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(true);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Accessibility Features</Text>
          <Text style={{ fontSize: 14 }}>✓ Switch role for screen readers</Text>
          <Text style={{ fontSize: 14 }}>✓ Checked state announced</Text>
          <Text style={{ fontSize: 14 }}>✓ Disabled state announced</Text>
          <Text style={{ fontSize: 14 }}>✓ Touch targets: 44x44 minimum (medium)</Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#555' }}>✓ Good: Clear label</Text>
            <Toggle
              checked={checked1}
              onChange={setChecked1}
              label="Enable push notifications"
            />

            <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}>
              ✓ Good: accessibilityLabel for no-label toggles
            </Text>
            <Toggle
              checked={checked2}
              onChange={setChecked2}
              accessibilityLabel="Toggle dark mode"
            />
          </View>
        </View>
      </ScrollView>
    );
  },
};
