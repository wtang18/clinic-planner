import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Design System/Components/Input',
  component: Input,
  argTypes: {
    type: {
      control: 'select',
      options: ['outlined', 'filled'],
      description: 'Visual type of the input',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size variant',
    },
    label: {
      control: 'text',
      description: 'Label text displayed above input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below input',
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
    leftIcon: {
      control: 'text',
      description: 'Left icon name',
    },
    rightIcon: {
      control: 'text',
      description: 'Right icon name',
    },
    leftSubtext: {
      control: 'text',
      description: 'Left subtext (e.g., "$")',
    },
    rightSubtext: {
      control: 'text',
      description: 'Right subtext (e.g., "USD")',
    },
  },
  args: {
    type: 'outlined',
    size: 'medium',
    error: false,
    required: false,
    editable: true,
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>Input</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Text input field with label, helper text, icons, and validation states
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
            <Text style={{ fontWeight: '600' }}>Outlined:</Text> Transparent bg with border
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Filled:</Text> Colored bg, no border
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Icons:</Text> 20px (small/medium), 24px (large)
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Features</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Two types: outlined and filled</Text>
          <Text style={{ fontSize: 14 }}>✅ Three sizes: small, medium, large</Text>
          <Text style={{ fontSize: 14 }}>✅ Label with required indicator</Text>
          <Text style={{ fontSize: 14 }}>✅ Helper text and error messages</Text>
          <Text style={{ fontSize: 14 }}>✅ Left and right icons</Text>
          <Text style={{ fontSize: 14 }}>✅ Left and right subtext (prefix/suffix)</Text>
          <Text style={{ fontSize: 14 }}>✅ Focus and error states</Text>
          <Text style={{ fontSize: 14 }}>✅ Disabled/read-only support</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Platform Differences</Text>
        <Text style={{ fontSize: 14 }}>
          • RN uses TextInput instead of input element{'\n'}
          • RN uses onFocus/onBlur for state management{'\n'}
          • RN doesn't have hover states (mobile platform){'\n'}
          • Focus border shows on all focus (no focus-visible){'\n'}
          • Uses editable prop instead of disabled
        </Text>
      </View>
    </ScrollView>
  ),
};

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <View style={{ padding: 16 }}>
        <Input
          {...args}
          value={value}
          onChangeText={setValue}
        />
      </View>
    );
  },
  args: {
    type: 'outlined',
    size: 'medium',
    label: 'Email',
    placeholder: 'you@example.com',
    helperText: "We'll never share your email",
    error: false,
    required: false,
    editable: true,
  },
};

export const States: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('Focused text');
    const [value3, setValue3] = useState('Invalid email');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Default</Text>
        <Input
          label="Full Name"
          placeholder="Enter your name"
          value={value1}
          onChangeText={setValue1}
          helperText="As it appears on your ID"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Focused (Tap to focus)
        </Text>
        <Input
          label="Email"
          placeholder="you@example.com"
          value={value2}
          onChangeText={setValue2}
          helperText="Primary email address"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>Error</Text>
        <Input
          label="Email"
          placeholder="you@example.com"
          value={value3}
          onChangeText={setValue3}
          error
          errorMessage="Please enter a valid email address"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Disabled
        </Text>
        <Input
          label="Account Type"
          value="Premium"
          editable={false}
          helperText="Cannot be changed"
        />
      </ScrollView>
    );
  },
};

export const Types: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Outlined (Default)
        </Text>
        <Input
          type="outlined"
          label="Email"
          placeholder="you@example.com"
          value={value1}
          onChangeText={setValue1}
          helperText="Transparent background with border"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Filled
        </Text>
        <Input
          type="filled"
          label="Email"
          placeholder="you@example.com"
          value={value2}
          onChangeText={setValue2}
          helperText="Filled background, no border"
        />
      </ScrollView>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Small (32px)
        </Text>
        <Input
          size="small"
          label="Email"
          placeholder="you@example.com"
          value={value1}
          onChangeText={setValue1}
          helperText="Compact size for dense layouts"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Medium (40px) - Default
        </Text>
        <Input
          size="medium"
          label="Email"
          placeholder="you@example.com"
          value={value2}
          onChangeText={setValue2}
          helperText="Standard size for most use cases"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Large (56px)
        </Text>
        <Input
          size="large"
          label="Email"
          placeholder="you@example.com"
          value={value3}
          onChangeText={setValue3}
          helperText="Large size for prominent inputs"
        />
      </ScrollView>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Left Icon</Text>
        <Input
          label="Username"
          leftIcon="user"
          placeholder="Enter username"
          value={value1}
          onChangeText={setValue1}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Right Icon
        </Text>
        <Input
          label="Email"
          placeholder="you@example.com"
          rightIcon="mail"
          value={value2}
          onChangeText={setValue2}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Both Icons
        </Text>
        <Input
          label="Password"
          leftIcon="lock"
          placeholder="Enter password"
          rightIcon="eye"
          value={value3}
          onChangeText={setValue3}
          secureTextEntry
        />
      </ScrollView>
    );
  },
};

export const WithSubtext: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('1234');
    const [value3, setValue3] = useState('example');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Left Subtext (Prefix)
        </Text>
        <Input
          label="Website URL"
          leftSubtext="https://"
          placeholder="yoursite.com"
          value={value1}
          onChangeText={setValue1}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Right Subtext (Suffix)
        </Text>
        <Input
          label="Username"
          placeholder="username"
          rightSubtext="@company.com"
          value={value2}
          onChangeText={setValue2}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Both Subtexts
        </Text>
        <Input
          label="Price"
          leftSubtext="$"
          placeholder="0.00"
          rightSubtext="USD"
          value={value3}
          onChangeText={setValue3}
          keyboardType="numeric"
        />
      </ScrollView>
    );
  },
};

export const Required: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Required Fields</Text>
        <Input
          label="Email"
          placeholder="you@example.com"
          value={value1}
          onChangeText={setValue1}
          required
          helperText="This field is required"
        />

        <View style={{ marginTop: 16 }}>
          <Input
            label="Password"
            placeholder="Enter password"
            value={value2}
            onChangeText={setValue2}
            required
            secureTextEntry
            helperText="Must be at least 8 characters"
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <Input
            label="Phone Number"
            placeholder="(555) 123-4567"
            value={value3}
            onChangeText={setValue3}
            required
            error={value3.length > 0 && value3.length < 10}
            errorMessage="Phone number must be 10 digits"
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [search, setSearch] = useState('');
    const [amount, setAmount] = useState('');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Login Form</Text>
        <Input
          label="Email"
          leftIcon="mail"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={{ marginTop: 16 }}>
          <Input
            label="Password"
            leftIcon="lock"
            placeholder="Enter password"
            rightIcon="eye"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Search Bar
        </Text>
        <Input
          leftIcon="magnifying-glass"
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Payment Amount
        </Text>
        <Input
          label="Amount"
          leftSubtext="$"
          placeholder="0.00"
          rightSubtext="USD"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          helperText="Enter the amount you wish to transfer"
        />
      </ScrollView>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('invalid');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Accessibility Features</Text>
          <Text style={{ fontSize: 14 }}>✓ Clear labels for all inputs</Text>
          <Text style={{ fontSize: 14 }}>✓ Helper text provides context</Text>
          <Text style={{ fontSize: 14 }}>✓ Error messages are descriptive</Text>
          <Text style={{ fontSize: 14 }}>✓ Required fields clearly marked</Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#555' }}>✓ Good: Clear label and helper text</Text>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={value1}
              onChangeText={setValue1}
              helperText="First and last name"
              required
            />

            <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}>
              ✓ Good: Descriptive error message
            </Text>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={value2}
              onChangeText={setValue2}
              error
              errorMessage="Please enter a valid email address (e.g., name@domain.com)"
              required
            />
          </View>
        </View>
      </ScrollView>
    );
  },
};
