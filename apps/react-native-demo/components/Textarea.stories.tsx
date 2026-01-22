import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Design System/Components/Textarea',
  component: Textarea,
  argTypes: {
    type: {
      control: 'select',
      options: ['outlined', 'filled'],
      description: 'Visual type of the textarea',
    },
    label: {
      control: 'text',
      description: 'Label text displayed above textarea',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below textarea',
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
    rows: {
      control: 'number',
      description: 'Number of visible rows (controls initial height)',
    },
  },
  args: {
    type: 'outlined',
    error: false,
    required: false,
    editable: true,
    rows: 3,
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>Textarea</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Multi-line text input with label, helper text, and validation states. Automatically grows with content.
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Quick Reference</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Types:</Text> outlined (default), filled
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
            <Text style={{ fontWeight: '600' }}>Typography:</Text> 14px / 20px line height
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Padding:</Text> 12px horizontal, 10px vertical
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Features</Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Two types: outlined and filled</Text>
          <Text style={{ fontSize: 14 }}>✅ Configurable rows for initial height</Text>
          <Text style={{ fontSize: 14 }}>✅ Auto-grows with content (multiline)</Text>
          <Text style={{ fontSize: 14 }}>✅ Label with required indicator</Text>
          <Text style={{ fontSize: 14 }}>✅ Helper text and error messages</Text>
          <Text style={{ fontSize: 14 }}>✅ Focus and error states</Text>
          <Text style={{ fontSize: 14 }}>✅ Disabled/read-only support</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Usage Examples</Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<Textarea\n  label="Description"\n  placeholder="Enter description"\n/>`}
            </Text>
            {(() => {
              const [value, setValue] = useState('');
              return (
                <Textarea
                  label="Description"
                  placeholder="Enter description"
                  value={value}
                  onChangeText={setValue}
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
          <Text style={{ fontSize: 14 }}>✅ Touch targets meet minimum size</Text>
          <Text style={{ fontSize: 14 }}>✅ Screen reader support</Text>
          <Text style={{ fontSize: 14 }}>✅ Clear labels and helper text</Text>
          <Text style={{ fontSize: 14 }}>✅ Error messages are descriptive</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Best Practices</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>✅ Do</Text>
        <View style={{ gap: 6, marginBottom: 12 }}>
          <Text style={{ fontSize: 14 }}>• Use for multi-line text input</Text>
          <Text style={{ fontSize: 14 }}>• Set appropriate number of rows for content</Text>
          <Text style={{ fontSize: 14 }}>• Provide clear labels and helper text</Text>
          <Text style={{ fontSize: 14 }}>• Show character count for limited inputs</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>❌ Don't</Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Don't use for single-line input (use Input instead)</Text>
          <Text style={{ fontSize: 14 }}>• Don't set too few rows for long content</Text>
          <Text style={{ fontSize: 14 }}>• Don't use without a label</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Platform Differences</Text>
        <Text style={{ fontSize: 14 }}>
          • RN uses TextInput with multiline prop{'\n'}
          • RN always auto-grows (no manual resize){'\n'}
          • RN uses editable instead of disabled{'\n'}
          • No hover states (mobile platform){'\n'}
          • Uses numberOfLines for initial rows
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
        <Textarea
          {...args}
          value={value}
          onChangeText={setValue}
        />
      </View>
    );
  },
  args: {
    type: 'outlined',
    label: 'Description',
    placeholder: 'Enter your description here...',
    helperText: 'Provide a detailed description',
    error: false,
    required: false,
    editable: true,
    rows: 3,
  },
};

export const States: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('This is some focused text that spans multiple lines to demonstrate the textarea behavior.');
    const [value3, setValue3] = useState('Invalid input');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Default</Text>
        <Textarea
          label="Comments"
          placeholder="Enter your comments"
          value={value1}
          onChangeText={setValue1}
          helperText="Share your thoughts"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Focused (Tap to focus)
        </Text>
        <Textarea
          label="Description"
          placeholder="Enter description"
          value={value2}
          onChangeText={setValue2}
          helperText="Be as detailed as possible"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>Error</Text>
        <Textarea
          label="Feedback"
          placeholder="Enter your feedback"
          value={value3}
          onChangeText={setValue3}
          error
          errorMessage="Please provide constructive feedback (minimum 20 characters)"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Disabled
        </Text>
        <Textarea
          label="Terms and Conditions"
          value="These terms cannot be edited. They are for informational purposes only."
          editable={false}
          helperText="Read-only content"
          rows={4}
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
        <Textarea
          type="outlined"
          label="Comments"
          placeholder="Enter your comments..."
          value={value1}
          onChangeText={setValue1}
          helperText="Transparent background with border"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Filled
        </Text>
        <Textarea
          type="filled"
          label="Notes"
          placeholder="Enter your notes..."
          value={value2}
          onChangeText={setValue2}
          helperText="Filled background, no border"
        />
      </ScrollView>
    );
  },
};

export const Rows: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          3 Rows (Default)
        </Text>
        <Textarea
          rows={3}
          label="Short Note"
          placeholder="Brief comment..."
          value={value1}
          onChangeText={setValue1}
          helperText="For short notes"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          5 Rows
        </Text>
        <Textarea
          rows={5}
          label="Description"
          placeholder="Detailed description..."
          value={value2}
          onChangeText={setValue2}
          helperText="For longer content"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          10 Rows
        </Text>
        <Textarea
          rows={10}
          label="Essay"
          placeholder="Write your essay..."
          value={value3}
          onChangeText={setValue3}
          helperText="For extensive writing"
        />
      </ScrollView>
    );
  },
};

export const Required: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Required Fields</Text>
        <Textarea
          label="Description"
          placeholder="Enter description..."
          value={value1}
          onChangeText={setValue1}
          required
          helperText="This field is required"
          rows={4}
        />

        <View style={{ marginTop: 16 }}>
          <Textarea
            label="Additional Comments"
            placeholder="Any additional comments..."
            value={value2}
            onChangeText={setValue2}
            required
            error={value2.length > 0 && value2.length < 10}
            errorMessage="Comment must be at least 10 characters"
            rows={4}
          />
        </View>
      </ScrollView>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => {
    const [feedback, setFeedback] = useState('');
    const [bio, setBio] = useState('');
    const [message, setMessage] = useState('');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Feedback Form</Text>
        <Textarea
          label="Your Feedback"
          placeholder="Tell us what you think..."
          value={feedback}
          onChangeText={setFeedback}
          helperText="Help us improve our product"
          rows={5}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          User Bio
        </Text>
        <Textarea
          label="About You"
          placeholder="Share a bit about yourself..."
          value={bio}
          onChangeText={setBio}
          helperText={`${bio.length}/500 characters`}
          maxLength={500}
          rows={4}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Message Compose
        </Text>
        <Textarea
          type="filled"
          label="Message"
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          rows={6}
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
          <Text style={{ fontSize: 14 }}>✓ Clear labels for all textareas</Text>
          <Text style={{ fontSize: 14 }}>✓ Helper text provides context</Text>
          <Text style={{ fontSize: 14 }}>✓ Error messages are descriptive</Text>
          <Text style={{ fontSize: 14 }}>✓ Required fields clearly marked</Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#555' }}>✓ Good: Clear label and helper text</Text>
            <Textarea
              label="Feedback"
              placeholder="Enter your feedback..."
              value={value1}
              onChangeText={setValue1}
              helperText="Share detailed feedback to help us improve"
              required
              rows={4}
            />

            <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}>
              ✓ Good: Descriptive error message
            </Text>
            <Textarea
              label="Comments"
              placeholder="Enter comments..."
              value={value2}
              onChangeText={setValue2}
              error
              errorMessage="Please provide more detailed comments (minimum 20 characters)"
              required
              rows={4}
            />
          </View>
        </View>
      </ScrollView>
    );
  },
};
