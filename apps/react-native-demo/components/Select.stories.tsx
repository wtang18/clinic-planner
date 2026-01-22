import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Design System/Components/Select',
  component: Select,
  argTypes: {
    type: {
      control: 'select',
      options: ['outlined', 'filled'],
      description: 'Visual type of the select',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size variant',
    },
    label: {
      control: 'text',
      description: 'Label text displayed above select',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below select',
    },
    error: {
      control: 'boolean',
      description: 'Error state',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message (overrides helperText when error=true)',
    },
    required: {
      control: 'boolean',
      description: 'Required field',
    },
    editable: {
      control: 'boolean',
      description: 'Editable state',
    },
  },
  args: {
    type: 'outlined',
    size: 'medium',
    error: false,
    required: false,
    editable: true,
    placeholder: 'Select an option',
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

// Sample options for examples
const countryOptions = [
  { label: 'United States', value: 'us' },
  { label: 'Canada', value: 'ca' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Australia', value: 'au' },
  { label: 'Germany', value: 'de' },
  { label: 'France', value: 'fr' },
  { label: 'Japan', value: 'jp' },
];

const sizeOptions = [
  { label: 'Extra Small', value: 'xs' },
  { label: 'Small', value: 's' },
  { label: 'Medium', value: 'm' },
  { label: 'Large', value: 'l' },
  { label: 'Extra Large', value: 'xl' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>Select</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Dropdown select field with native picker. Displays chevron icon and opens platform-specific picker when tapped.
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Quick Reference</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Types:</Text> outlined (default), filled
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Sizes:</Text> small (32px), medium (40px), large (56px)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Border Radius:</Text> 8px
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Icon:</Text> Chevron-down icon (right side)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>iOS:</Text> Inline wheel picker
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Android:</Text> Native dropdown dialog
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Features</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Two types: outlined and filled</Text>
          <Text style={{ fontSize: 14 }}>✅ Three sizes: small, medium, large</Text>
          <Text style={{ fontSize: 14 }}>✅ Chevron icon indicator</Text>
          <Text style={{ fontSize: 14 }}>✅ Native picker integration</Text>
          <Text style={{ fontSize: 14 }}>✅ Label with required indicator</Text>
          <Text style={{ fontSize: 14 }}>✅ Helper text and error messages</Text>
          <Text style={{ fontSize: 14 }}>✅ Focus and error states</Text>
          <Text style={{ fontSize: 14 }}>✅ Disabled/read-only support</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Platform Differences</Text>
        <Text style={{ fontSize: 14 }}>
          • iOS: Inline wheel picker{'\n'}
          • Android: Native dropdown dialog{'\n'}
          • Web: Native HTML select dropdown{'\n'}
          • Uses @react-native-picker/picker{'\n'}
          • Value is string (same as web)
        </Text>
      </View>
    </ScrollView>
  ),
};

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <View style={{ padding: 16 }}>
        <Select
          {...args}
          value={value}
          onChange={setValue}
          options={countryOptions}
        />
      </View>
    );
  },
  args: {
    type: 'outlined',
    size: 'medium',
    label: 'Country',
    placeholder: 'Select a country',
    helperText: 'Choose your country',
    error: false,
    required: false,
    editable: true,
  },
};

export const States: Story = {
  render: () => {
    const [value1, setValue1] = useState<string | undefined>(undefined);
    const [value2, setValue2] = useState<string | undefined>('us');
    const [value3, setValue3] = useState<string | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Default</Text>
        <Select
          label="Country"
          value={value1}
          onChange={setValue1}
          options={countryOptions}
          helperText="Tap to select a country"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          With Value (Tap to change)
        </Text>
        <Select
          label="Country"
          value={value2}
          onChange={setValue2}
          options={countryOptions}
          helperText="Tap to change selection"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>Error</Text>
        <Select
          label="Country"
          value={value3}
          onChange={setValue3}
          options={countryOptions}
          error
          errorMessage="Please select a country"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Disabled
        </Text>
        <Select
          label="Region"
          value="us"
          options={countryOptions}
          editable={false}
          helperText="Cannot be changed"
        />
      </ScrollView>
    );
  },
};

export const Types: Story = {
  render: () => {
    const [value1, setValue1] = useState<string | undefined>(undefined);
    const [value2, setValue2] = useState<string | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Outlined (Default)
        </Text>
        <Select
          type="outlined"
          label="Country"
          value={value1}
          onChange={setValue1}
          options={countryOptions}
          helperText="Transparent background with border"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Filled
        </Text>
        <Select
          type="filled"
          label="Country"
          value={value2}
          onChange={setValue2}
          options={countryOptions}
          helperText="Filled background, no border"
        />
      </ScrollView>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [value1, setValue1] = useState<string | undefined>(undefined);
    const [value2, setValue2] = useState<string | undefined>(undefined);
    const [value3, setValue3] = useState<string | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Small (32px)
        </Text>
        <Select
          size="small"
          label="Size"
          value={value1}
          onChange={setValue1}
          options={sizeOptions}
          helperText="Compact size for dense layouts"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Medium (40px) - Default
        </Text>
        <Select
          size="medium"
          label="Size"
          value={value2}
          onChange={setValue2}
          options={sizeOptions}
          helperText="Standard size for most use cases"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Large (56px)
        </Text>
        <Select
          size="large"
          label="Size"
          value={value3}
          onChange={setValue3}
          options={sizeOptions}
          helperText="Large size for prominent selects"
        />
      </ScrollView>
    );
  },
};

export const Required: Story = {
  render: () => {
    const [value1, setValue1] = useState<string | undefined>(undefined);
    const [value2, setValue2] = useState<string | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Required Fields</Text>
        <Select
          label="Country"
          value={value1}
          onChange={setValue1}
          options={countryOptions}
          required
          helperText="This field is required"
        />

        <View style={{ marginTop: 16 }}>
          <Select
            label="Priority"
            value={value2}
            onChange={setValue2}
            options={priorityOptions}
            required
            error={!value2}
            errorMessage="Please select a priority level"
          />
        </View>
      </ScrollView>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => {
    const [country, setCountry] = useState<string | undefined>(undefined);
    const [size, setSize] = useState<string | undefined>(undefined);
    const [priority, setPriority] = useState<string | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Shipping Form</Text>
        <Select
          label="Country"
          value={country}
          onChange={setCountry}
          options={countryOptions}
          helperText="Select your shipping country"
          required
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Product Size
        </Text>
        <Select
          label="Size"
          value={size}
          onChange={setSize}
          options={sizeOptions}
          helperText="Choose your preferred size"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Task Priority
        </Text>
        <Select
          size="large"
          label="Priority"
          value={priority}
          onChange={setPriority}
          options={priorityOptions}
          helperText="Set the task priority level"
          required
        />
      </ScrollView>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [value1, setValue1] = useState<string | undefined>(undefined);
    const [value2, setValue2] = useState<string | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Accessibility Features</Text>
          <Text style={{ fontSize: 14 }}>✓ Clear labels for all selects</Text>
          <Text style={{ fontSize: 14 }}>✓ Native picker for easy selection</Text>
          <Text style={{ fontSize: 14 }}>✓ Error messages are descriptive</Text>
          <Text style={{ fontSize: 14 }}>✓ Required fields clearly marked</Text>
          <Text style={{ fontSize: 14 }}>✓ Platform-specific picker UX</Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#555' }}>✓ Good: Clear label and helper text</Text>
            <Select
              label="Country"
              value={value1}
              onChange={setValue1}
              options={countryOptions}
              helperText="Select your country of residence"
              required
              accessibilityLabel="Country selection"
              accessibilityHint="Tap to select a country from the list"
            />

            <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}>
              ✓ Good: Descriptive error message
            </Text>
            <Select
              label="Priority"
              value={value2}
              onChange={setValue2}
              options={priorityOptions}
              error
              errorMessage="Please select a priority level for this task"
              required
            />
          </View>
        </View>
      </ScrollView>
    );
  },
};
