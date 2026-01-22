import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { DateInput } from './DateInput';

const meta: Meta<typeof DateInput> = {
  title: 'Design System/Components/DateInput',
  component: DateInput,
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
  },
  args: {
    type: 'outlined',
    size: 'medium',
    error: false,
    required: false,
    editable: true,
    placeholder: 'YYYY-MM-DD',
  },
};

export default meta;
type Story = StoryObj<typeof DateInput>;

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>DateInput</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Date input field with native date picker. Displays calendar icon and opens platform-specific picker when tapped.
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
            <Text style={{ fontWeight: '600' }}>Icon:</Text> Calendar icon (right side)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Format:</Text> YYYY-MM-DD display (native picker)
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>iOS:</Text> Inline calendar/wheel picker
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Android:</Text> Native dialog picker
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Features</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Two types: outlined and filled</Text>
          <Text style={{ fontSize: 14 }}>✅ Three sizes: small, medium, large</Text>
          <Text style={{ fontSize: 14 }}>✅ Calendar icon indicator</Text>
          <Text style={{ fontSize: 14 }}>✅ Native date picker integration</Text>
          <Text style={{ fontSize: 14 }}>✅ Label with required indicator</Text>
          <Text style={{ fontSize: 14 }}>✅ Helper text and error messages</Text>
          <Text style={{ fontSize: 14 }}>✅ Focus and error states</Text>
          <Text style={{ fontSize: 14 }}>✅ Disabled/read-only support</Text>
          <Text style={{ fontSize: 14 }}>✅ Min/max date constraints</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Usage Examples</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<DateInput\n  label="Event Date"\n  value={date}\n  onChange={setDate}\n/>`}
            </Text>
            {(() => {
              const [value, setValue] = useState<Date | undefined>(undefined);
              return (
                <DateInput
                  label="Event Date"
                  value={value}
                  onChange={setValue}
                />
              );
            })()}
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Accessibility</Text>
        <Text style={{ fontSize: 14, marginBottom: 8 }}>
          Follows WCAG 2.1 Level AA guidelines
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>✅ Touch targets: 44x44 minimum</Text>
          <Text style={{ fontSize: 14 }}>✅ Screen reader support</Text>
          <Text style={{ fontSize: 14 }}>✅ Clear labels and format hints</Text>
          <Text style={{ fontSize: 14 }}>✅ Error messages are descriptive</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Best Practices</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>✅ Do</Text>
        <View style={{ gap: 6, marginBottom: 12 }}>
          <Text style={{ fontSize: 14 }}>• Use for date selection</Text>
          <Text style={{ fontSize: 14 }}>• Provide format hints in placeholder or helper text</Text>
          <Text style={{ fontSize: 14 }}>• Validate date format and provide clear error messages</Text>
          <Text style={{ fontSize: 14 }}>• Consider integrating a native date picker library</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>❌ Don't</Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Don't use for non-date input</Text>
          <Text style={{ fontSize: 14 }}>• Don't assume users know the date format</Text>
          <Text style={{ fontSize: 14 }}>• Don't use without validation</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Platform Differences</Text>
        <Text style={{ fontSize: 14 }}>
          • iOS: Inline calendar (iPad) or wheel picker (iPhone){'\n'}
          • Android: Native calendar dialog{'\n'}
          • Web: Native HTML5 date picker{'\n'}
          • Uses @react-native-community/datetimepicker{'\n'}
          • Value is Date object (not string like web)
        </Text>
      </View>
    </ScrollView>
  ),
};

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | undefined>(undefined);
    return (
      <View style={{ padding: 16 }}>
        <DateInput
          {...args}
          value={value}
          onChange={setValue}
        />
      </View>
    );
  },
  args: {
    type: 'outlined',
    size: 'medium',
    label: 'Event Date',
    helperText: 'Select a date',
    error: false,
    required: false,
    editable: true,
  },
};

export const States: Story = {
  render: () => {
    const [value1, setValue1] = useState<Date | undefined>(undefined);
    const [value2, setValue2] = useState<Date | undefined>(new Date(2024, 2, 15)); // March 15, 2024
    const [value3, setValue3] = useState<Date | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Default</Text>
        <DateInput
          label="Start Date"
          value={value1}
          onChange={setValue1}
          helperText="Tap to select a date"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          With Value (Tap to change)
        </Text>
        <DateInput
          label="End Date"
          value={value2}
          onChange={setValue2}
          helperText="Tap to change the date"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>Error</Text>
        <DateInput
          label="Birth Date"
          value={value3}
          onChange={setValue3}
          error
          errorMessage="Please select a valid date"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Disabled
        </Text>
        <DateInput
          label="Created Date"
          value={new Date(2024, 0, 1)} // January 1, 2024
          editable={false}
          helperText="Cannot be changed"
        />
      </ScrollView>
    );
  },
};

export const Types: Story = {
  render: () => {
    const [value1, setValue1] = useState<Date | undefined>(undefined);
    const [value2, setValue2] = useState<Date | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Outlined (Default)
        </Text>
        <DateInput
          type="outlined"
          label="Event Date"
          value={value1}
          onChange={setValue1}
          helperText="Transparent background with border"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Filled
        </Text>
        <DateInput
          type="filled"
          label="Deadline"
          value={value2}
          onChange={setValue2}
          helperText="Filled background, no border"
        />
      </ScrollView>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [value1, setValue1] = useState<Date | undefined>(undefined);
    const [value2, setValue2] = useState<Date | undefined>(undefined);
    const [value3, setValue3] = useState<Date | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Small (32px)
        </Text>
        <DateInput
          size="small"
          label="Date"
          value={value1}
          onChange={setValue1}
          helperText="Compact size for dense layouts"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Medium (40px) - Default
        </Text>
        <DateInput
          size="medium"
          label="Date"
          value={value2}
          onChange={setValue2}
          helperText="Standard size for most use cases"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Large (56px)
        </Text>
        <DateInput
          size="large"
          label="Date"
          value={value3}
          onChange={setValue3}
          helperText="Large size for prominent inputs"
        />
      </ScrollView>
    );
  },
};

export const Required: Story = {
  render: () => {
    const [value1, setValue1] = useState<Date | undefined>(undefined);
    const [value2, setValue2] = useState<Date | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Required Fields</Text>
        <DateInput
          label="Start Date"
          value={value1}
          onChange={setValue1}
          required
          helperText="This field is required"
        />

        <View style={{ marginTop: 16 }}>
          <DateInput
            label="End Date"
            value={value2}
            onChange={setValue2}
            required
            error={!value2}
            errorMessage="Please select a date"
          />
        </View>
      </ScrollView>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => {
    const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Event Form</Text>
        <DateInput
          label="Event Date"
          value={eventDate}
          onChange={setEventDate}
          helperText="Select the date of your event"
          required
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Task Due Date
        </Text>
        <DateInput
          label="Due Date"
          value={dueDate}
          onChange={setDueDate}
          helperText="When should this task be completed?"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Appointment Booking
        </Text>
        <DateInput
          size="large"
          label="Appointment Date"
          value={appointmentDate}
          onChange={setAppointmentDate}
          helperText="Choose your preferred appointment date"
          required
        />
      </ScrollView>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [value1, setValue1] = useState<Date | undefined>(undefined);
    const [value2, setValue2] = useState<Date | undefined>(undefined);

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Accessibility Features</Text>
          <Text style={{ fontSize: 14 }}>✓ Clear labels for all inputs</Text>
          <Text style={{ fontSize: 14 }}>✓ Native date picker for easy selection</Text>
          <Text style={{ fontSize: 14 }}>✓ Error messages are descriptive</Text>
          <Text style={{ fontSize: 14 }}>✓ Required fields clearly marked</Text>
          <Text style={{ fontSize: 14 }}>✓ Platform-specific picker UX</Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#555' }}>✓ Good: Clear label and helper text</Text>
            <DateInput
              label="Birth Date"
              value={value1}
              onChange={setValue1}
              helperText="Select your birth date"
              required
              accessibilityLabel="Birth date input"
              accessibilityHint="Tap to select a date"
            />

            <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}>
              ✓ Good: Descriptive error message
            </Text>
            <DateInput
              label="Event Date"
              value={value2}
              onChange={setValue2}
              error
              errorMessage="Please select a valid event date"
              required
            />
          </View>
        </View>
      </ScrollView>
    );
  },
};
