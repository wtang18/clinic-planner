import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Design System/Components/SegmentedControl',
  component: SegmentedControl,
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size variant of the segmented control',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all segments',
    },
  },
  args: {
    size: 'medium',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Documentation: Story = {
  render: () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* HEADER */}
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
        SegmentedControl
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
        Multi-choice control with mutually exclusive segments for view switching and filtering
      </Text>

      {/* QUICK REFERENCE */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Quick Reference
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 8 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Container:</Text> 4px padding, rounded-full, subtle background
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Segments:</Text> Flex-grow equally, 12px h-padding, 6px v-padding
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Selected:</Text> White background with elevation-sm shadow
          </Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>Subtext:</Text> Optional counts/metadata with 60% opacity
          </Text>
        </View>
      </View>

      {/* FEATURES */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Features
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 14 }}>✅ Mutually exclusive selection</Text>
          <Text style={{ fontSize: 14 }}>✅ Equal-width segments that grow to fill space</Text>
          <Text style={{ fontSize: 14 }}>✅ Optional subtext for counts</Text>
          <Text style={{ fontSize: 14 }}>✅ Individual segment disable support</Text>
          <Text style={{ fontSize: 14 }}>✅ Elevation shadow on selected segment</Text>
          <Text style={{ fontSize: 14 }}>✅ Accessibility with radio group semantics</Text>
          <Text style={{ fontSize: 14 }}>✅ Design token integration</Text>
        </View>
      </View>

      {/* USAGE EXAMPLES */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Usage Examples
        </Text>
        <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 13, fontFamily: 'monospace', color: '#1F2937', marginBottom: 8 }}>
              {`<SegmentedControl\n  options={[\n    { value: 'day', label: 'Day' },\n    { value: 'week', label: 'Week' },\n    { value: 'month', label: 'Month' }\n  ]}\n  value={view}\n  onChange={setView}\n/>`}
            </Text>
            <SegmentedControlExample />
          </View>
        </View>
      </View>

      {/* ACCESSIBILITY */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Accessibility
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 8 }}>
          Follows WCAG 2.1 Level AA guidelines
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>✅ Radio group semantics with accessibilityRole</Text>
          <Text style={{ fontSize: 14 }}>✅ Proper checked/disabled state announcement</Text>
          <Text style={{ fontSize: 14 }}>✅ Touch targets: 44x44 minimum</Text>
          <Text style={{ fontSize: 14 }}>✅ Color contrast: WCAG AA compliant</Text>
        </View>
      </View>

      {/* BEST PRACTICES */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
          Best Practices
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          ✅ Do
        </Text>
        <View style={{ gap: 6, marginBottom: 12 }}>
          <Text style={{ fontSize: 14 }}>• Use for 2-5 mutually exclusive options</Text>
          <Text style={{ fontSize: 14 }}>• Keep labels short (1-2 words)</Text>
          <Text style={{ fontSize: 14 }}>• Use subtext for counts when relevant</Text>
          <Text style={{ fontSize: 14 }}>• Provide accessibilityLabel for context</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          ❌ Don't
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 14 }}>• Don't use for more than 5 options (use Dropdown)</Text>
          <Text style={{ fontSize: 14 }}>• Don't use for non-mutually-exclusive choices</Text>
          <Text style={{ fontSize: 14 }}>• Don't use long labels that wrap</Text>
        </View>
      </View>

      {/* PLATFORM DIFFERENCES */}
      <View style={{ backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          React Native vs Web
        </Text>
        <Text style={{ fontSize: 14 }}>
          • RN uses onPress instead of onClick{'\n'}
          • RN uses accessibilityRole instead of role{'\n'}
          • RN uses accessibilityState instead of aria-checked{'\n'}
          • Hover states replaced with activeOpacity on press
        </Text>
      </View>
    </ScrollView>
  ),
};

// Helper component for interactive example
const SegmentedControlExample = () => {
  const [value, setValue] = useState('day');
  return (
    <SegmentedControl
      options={[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
};

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState('week');
    return (
      <View style={{ padding: 16 }}>
        <SegmentedControl
          {...args}
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          value={value}
          onChange={setValue}
        />
      </View>
    );
  },
  args: {
    disabled: false,
  },
};

export const WithSubtext: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          With Count Badges
        </Text>
        <SegmentedControl
          options={[
            { value: 'all', label: 'All', subtext: '24' },
            { value: 'active', label: 'Active', subtext: '12' },
            { value: 'completed', label: 'Completed', subtext: '12' },
          ]}
          value={value}
          onChange={setValue}
        />
      </ScrollView>
    );
  },
};

export const States: Story = {
  render: () => {
    const [value1, setValue1] = useState('option1');
    const [value2, setValue2] = useState('option1');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Default
        </Text>
        <SegmentedControl
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          value={value1}
          onChange={setValue1}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Disabled
        </Text>
        <SegmentedControl
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          value={value2}
          onChange={setValue2}
          disabled
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Individual Segment Disabled
        </Text>
        <SegmentedControl
          options={[
            { value: 'option1', label: 'Available' },
            { value: 'option2', label: 'Disabled', disabled: true },
            { value: 'option3', label: 'Available' },
          ]}
          value={value1}
          onChange={setValue1}
        />
      </ScrollView>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => {
    const [dateView, setDateView] = useState('week');
    const [taskFilter, setTaskFilter] = useState('active');
    const [chartType, setChartType] = useState('bar');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Calendar View Switcher
        </Text>
        <SegmentedControl
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          value={dateView}
          onChange={setDateView}
          accessibilityLabel="Calendar view selector"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Task Filter with Counts
        </Text>
        <SegmentedControl
          options={[
            { value: 'all', label: 'All', subtext: '24' },
            { value: 'active', label: 'Active', subtext: '12' },
            { value: 'completed', label: 'Done', subtext: '12' },
          ]}
          value={taskFilter}
          onChange={setTaskFilter}
          accessibilityLabel="Task filter"
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Chart Type Selector
        </Text>
        <SegmentedControl
          options={[
            { value: 'bar', label: 'Bar' },
            { value: 'line', label: 'Line' },
            { value: 'pie', label: 'Pie' },
          ]}
          value={chartType}
          onChange={setChartType}
          accessibilityLabel="Chart type selector"
        />
      </ScrollView>
    );
  },
};

export const SegmentCounts: Story = {
  render: () => {
    const [value2, setValue2] = useState('option1');
    const [value3, setValue3] = useState('option1');
    const [value4, setValue4] = useState('option1');
    const [value5, setValue5] = useState('option1');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          2 Segments
        </Text>
        <SegmentedControl
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ]}
          value={value2}
          onChange={setValue2}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          3 Segments
        </Text>
        <SegmentedControl
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          value={value3}
          onChange={setValue3}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          4 Segments
        </Text>
        <SegmentedControl
          options={[
            { value: 'option1', label: 'Opt 1' },
            { value: 'option2', label: 'Opt 2' },
            { value: 'option3', label: 'Opt 3' },
            { value: 'option4', label: 'Opt 4' },
          ]}
          value={value4}
          onChange={setValue4}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          5 Segments (Maximum Recommended)
        </Text>
        <SegmentedControl
          options={[
            { value: 'option1', label: 'Q1' },
            { value: 'option2', label: 'Q2' },
            { value: 'option3', label: 'Q3' },
            { value: 'option4', label: 'Q4' },
            { value: 'option5', label: 'All' },
          ]}
          value={value5}
          onChange={setValue5}
        />
      </ScrollView>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [value, setValue] = useState('week');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>
            Accessibility Features
          </Text>
          <Text style={{ fontSize: 14 }}>✓ Radio group semantics (accessibilityRole="radiogroup")</Text>
          <Text style={{ fontSize: 14 }}>✓ Each segment has accessibilityRole="radio"</Text>
          <Text style={{ fontSize: 14 }}>✓ Checked state announced via accessibilityState</Text>
          <Text style={{ fontSize: 14 }}>✓ Disabled state support</Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            <Text style={{ fontSize: 14, color: '#555' }}>✓ Good: Clear labels with context</Text>
            <SegmentedControl
              options={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
              ]}
              value={value}
              onChange={setValue}
              accessibilityLabel="Calendar view selector"
            />

            <Text style={{ fontSize: 14, color: '#555', marginTop: 8 }}>✓ Good: Subtext provides additional context</Text>
            <SegmentedControl
              options={[
                { value: 'all', label: 'All', subtext: '24' },
                { value: 'active', label: 'Active', subtext: '12' },
              ]}
              value="all"
              onChange={() => {}}
              accessibilityLabel="Task filter with counts"
            />
          </View>
        </View>
      </ScrollView>
    );
  },
};

export const SizeVariants: Story = {
  render: () => {
    const [smallValue, setSmallValue] = useState('day');
    const [mediumValue, setMediumValue] = useState('week');
    const [largeValue, setLargeValue] = useState('month');

    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Small (32px total height, 24px segment)
        </Text>
        <SegmentedControl
          size="small"
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          value={smallValue}
          onChange={setSmallValue}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Medium (40px total height, 32px segment) - Default
        </Text>
        <SegmentedControl
          size="medium"
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          value={mediumValue}
          onChange={setMediumValue}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 }}>
          Large (56px total height, 48px segment)
        </Text>
        <SegmentedControl
          size="large"
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          value={largeValue}
          onChange={setLargeValue}
        />

        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 32, marginBottom: 12 }}>
          With Subtext - All Sizes
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
          Small
        </Text>
        <SegmentedControl
          size="small"
          options={[
            { value: 'all', label: 'All', subtext: '24' },
            { value: 'active', label: 'Active', subtext: '12' },
            { value: 'done', label: 'Done', subtext: '12' },
          ]}
          value="all"
          onChange={() => {}}
        />

        <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
          Medium
        </Text>
        <SegmentedControl
          size="medium"
          options={[
            { value: 'all', label: 'All', subtext: '24' },
            { value: 'active', label: 'Active', subtext: '12' },
            { value: 'done', label: 'Done', subtext: '12' },
          ]}
          value="active"
          onChange={() => {}}
        />

        <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
          Large
        </Text>
        <SegmentedControl
          size="large"
          options={[
            { value: 'all', label: 'All', subtext: '24' },
            { value: 'active', label: 'Active', subtext: '12' },
            { value: 'done', label: 'Done', subtext: '12' },
          ]}
          value="done"
          onChange={() => {}}
        />
      </ScrollView>
    );
  },
};
