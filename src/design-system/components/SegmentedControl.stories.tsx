import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Design System/SegmentedControl',
  component: SegmentedControl,
  argTypes: {
    // Core props
    value: {
      control: 'text',
      description: 'Currently selected value',
    },

    // State props
    disabled: {
      control: 'boolean',
      description: 'Whether all segments are disabled',
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the segmented control',
      table: {
        category: 'Accessibility',
      },
    },
  },

  parameters: {
    controls: {
      // Exclude complex props from controls
      exclude: ['options', 'onChange', 'className', 'ref', 'key'],
    },
    docs: {
      description: {
        component: `
SegmentedControl component with Figma design system integration.

## Structure
- Container with connected segments (no gaps between segments)
- Only one segment can be selected at a time
- Each segment can have an optional subtext

## Options Format
Each option in the \`options\` array should have:
- \`value\`: string - Unique identifier
- \`label\`: string - Display text
- \`subtext\`: string (optional) - Additional text shown inline
- \`disabled\`: boolean (optional) - Disable individual segment

## Keyboard Navigation
- Arrow Left/Up: Select previous segment
- Arrow Right/Down: Select next segment
- Space/Enter: Activate focused segment

## Accessibility
Uses proper ARIA roles (\`radiogroup\`, \`radio\`) and supports keyboard navigation.
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState('option1');

    return (
      <SegmentedControl
        {...args}
        value={value}
        onChange={setValue}
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' },
        ]}
      />
    );
  },
  args: {
    disabled: false,
  },
};

export const BasicExamples: Story = {
  render: () => {
    const [view, setView] = React.useState('day');
    const [filter, setFilter] = React.useState('all');

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">View Selector (3 options)</h3>
          <SegmentedControl
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
            value={view}
            onChange={setView}
            aria-label="Select view"
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Filter (2 options)</h3>
          <SegmentedControl
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
            ]}
            value={filter}
            onChange={setFilter}
            aria-label="Filter items"
          />
        </div>
      </div>
    );
  },
};

export const WithSubtext: Story = {
  render: () => {
    const [tab, setTab] = React.useState('all');

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">With Counts (Subtext)</h3>
          <SegmentedControl
            options={[
              { value: 'all', label: 'All', subtext: '24' },
              { value: 'active', label: 'Active', subtext: '12' },
              { value: 'completed', label: 'Completed', subtext: '12' },
            ]}
            value={tab}
            onChange={setTab}
            aria-label="Filter by status"
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">With Labels</h3>
          <SegmentedControl
            options={[
              { value: 'inbox', label: 'Inbox', subtext: 'new' },
              { value: 'sent', label: 'Sent', subtext: 'all' },
              { value: 'drafts', label: 'Drafts', subtext: '3' },
            ]}
            value={tab}
            onChange={setTab}
            aria-label="Select mailbox"
          />
        </div>
      </div>
    );
  },
};

export const DifferentSegmentCounts: Story = {
  render: () => {
    const [twoOption, setTwoOption] = React.useState('option1');
    const [threeOption, setThreeOption] = React.useState('option1');
    const [fourOption, setFourOption] = React.useState('option1');
    const [fiveOption, setFiveOption] = React.useState('option1');

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">2 Segments</h3>
          <SegmentedControl
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
            ]}
            value={twoOption}
            onChange={setTwoOption}
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">3 Segments</h3>
          <SegmentedControl
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ]}
            value={threeOption}
            onChange={setThreeOption}
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">4 Segments</h3>
          <SegmentedControl
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
              { value: 'option4', label: 'Option 4' },
            ]}
            value={fourOption}
            onChange={setFourOption}
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">5 Segments</h3>
          <SegmentedControl
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
              { value: 'option4', label: 'Option 4' },
              { value: 'option5', label: 'Option 5' },
            ]}
            value={fiveOption}
            onChange={setFiveOption}
          />
        </div>
      </div>
    );
  },
};

export const DisabledStates: Story = {
  render: () => {
    const [value1, setValue1] = React.useState('option1');
    const [value2, setValue2] = React.useState('option1');

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Entire Control Disabled</h3>
          <SegmentedControl
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ]}
            value={value1}
            onChange={setValue1}
            disabled
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Individual Segments Disabled</h3>
          <SegmentedControl
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2', disabled: true },
              { value: 'option3', label: 'Option 3' },
            ]}
            value={value2}
            onChange={setValue2}
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Mixed Disabled with Subtext</h3>
          <SegmentedControl
            options={[
              { value: 'all', label: 'All', subtext: '24' },
              { value: 'active', label: 'Active', subtext: '12', disabled: true },
              { value: 'completed', label: 'Completed', subtext: '12' },
            ]}
            value={value2}
            onChange={setValue2}
          />
        </div>
      </div>
    );
  },
};

export const InteractiveStates: Story = {
  render: () => {
    const [value, setValue] = React.useState('option2');

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Hover Over Segments</h3>
          <p className="text-sm text-gray-600 mb-4">
            Hover over unselected segments to see the hover state
          </p>
          <SegmentedControl
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ]}
            value={value}
            onChange={setValue}
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Keyboard Navigation</h3>
          <p className="text-sm text-gray-600 mb-4">
            Click to focus, then use arrow keys to navigate
          </p>
          <SegmentedControl
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
              { value: 'option4', label: 'Option 4' },
            ]}
            value={value}
            onChange={setValue}
          />
        </div>
      </div>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => {
    const [calendarView, setCalendarView] = React.useState('week');
    const [emailFilter, setEmailFilter] = React.useState('unread');
    const [chartPeriod, setChartPeriod] = React.useState('7d');
    const [taskStatus, setTaskStatus] = React.useState('pending');

    return (
      <div className="p-8 space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
          <h3 className="text-lg font-bold mb-4">Calendar View Selector</h3>
          <SegmentedControl
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
            ]}
            value={calendarView}
            onChange={setCalendarView}
            aria-label="Select calendar view"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
          <h3 className="text-lg font-bold mb-4">Email Inbox Filter</h3>
          <SegmentedControl
            options={[
              { value: 'all', label: 'All', subtext: '156' },
              { value: 'unread', label: 'Unread', subtext: '12' },
              { value: 'starred', label: 'Starred', subtext: '8' },
            ]}
            value={emailFilter}
            onChange={setEmailFilter}
            aria-label="Filter emails"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
          <h3 className="text-lg font-bold mb-4">Analytics Time Period</h3>
          <SegmentedControl
            options={[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' },
            ]}
            value={chartPeriod}
            onChange={setChartPeriod}
            aria-label="Select time period"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
          <h3 className="text-lg font-bold mb-4">Task Management</h3>
          <SegmentedControl
            options={[
              { value: 'pending', label: 'Pending', subtext: '5' },
              { value: 'inProgress', label: 'In Progress', subtext: '3' },
              { value: 'completed', label: 'Completed', subtext: '24' },
            ]}
            value={taskStatus}
            onChange={setTaskStatus}
            aria-label="Filter tasks by status"
          />
        </div>
      </div>
    );
  },
};

export const ResponsiveBehavior: Story = {
  render: () => {
    const [value, setValue] = React.useState('option1');

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Full Width Container</h3>
          <p className="text-sm text-gray-600 mb-4">
            Segments expand equally to fill available space
          </p>
          <div className="w-full">
            <SegmentedControl
              options={[
                { value: 'option1', label: 'Short' },
                { value: 'option2', label: 'Medium Label' },
                { value: 'option3', label: 'Very Long Label Text' },
              ]}
              value={value}
              onChange={setValue}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Constrained Width</h3>
          <div className="max-w-xs">
            <SegmentedControl
              options={[
                { value: 'option1', label: 'Day' },
                { value: 'option2', label: 'Week' },
                { value: 'option3', label: 'Month' },
              ]}
              value={value}
              onChange={setValue}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Variable Label Lengths</h3>
          <p className="text-sm text-gray-600 mb-4">
            All segments have equal width regardless of label length
          </p>
          <SegmentedControl
            options={[
              { value: 'a', label: 'A' },
              { value: 'medium', label: 'Medium' },
              { value: 'verylong', label: 'Very Long Text' },
            ]}
            value={value}
            onChange={setValue}
          />
        </div>
      </div>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [value, setValue] = React.useState('option1');

    return (
      <div className="p-8 space-y-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
          <ul className="text-sm space-y-2 mb-4 text-gray-700">
            <li>✓ Proper ARIA roles (radiogroup/radio)</li>
            <li>✓ Keyboard navigation with arrow keys</li>
            <li>✓ Proper focus management</li>
            <li>✓ aria-checked state updates</li>
            <li>✓ Screen reader announcements</li>
          </ul>
          <SegmentedControl
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ]}
            value={value}
            onChange={setValue}
            aria-label="Example segmented control with accessibility features"
          />
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Try It Out</h3>
          <p className="text-sm text-gray-600 mb-4">
            1. Click on the control to focus<br />
            2. Use Arrow Left/Right to navigate<br />
            3. Press Space or Enter to select<br />
            4. Use Tab to move focus away
          </p>
          <SegmentedControl
            options={[
              { value: 'inbox', label: 'Inbox', subtext: '12' },
              { value: 'sent', label: 'Sent', subtext: '5' },
              { value: 'drafts', label: 'Drafts', subtext: '2' },
              { value: 'spam', label: 'Spam', subtext: '0' },
            ]}
            value={value}
            onChange={setValue}
            aria-label="Keyboard navigation demonstration"
          />
        </div>
      </div>
    );
  },
};
