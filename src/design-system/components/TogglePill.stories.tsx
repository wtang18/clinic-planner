import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TogglePill } from './TogglePill';

const meta: Meta<typeof TogglePill> = {
  title: 'Design System/Components/TogglePill',
  component: TogglePill,
  tags: ['autodocs'],
  argTypes: {
    // Core variant props
    size: {
      control: 'select',
      options: ['x-small', 'small', 'medium', 'large'],
      description: 'The size of the pill',
    },
    selected: {
      control: 'boolean',
      description: 'Whether the pill is selected',
    },

    // Text content
    label: {
      control: 'text',
      description: 'The main text label of the pill',
    },

    // Subtext props
    leftSubtext: {
      control: 'text',
      description: 'Left subtext content',
    },
    rightSubtext: {
      control: 'text',
      description: 'Right subtext content',
    },

    // State props
    disabled: {
      control: 'boolean',
      description: 'Whether the pill is disabled',
    },

    // Accessibility props
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the pill',
      table: {
        category: 'Accessibility',
      },
    },
    'aria-describedby': {
      control: 'text',
      description: 'ID of element that describes the pill',
      table: {
        category: 'Accessibility',
      },
    },
  },

  parameters: {
    controls: {
      exclude: ['onChange', 'iconL', 'iconR', 'leftIcon', 'rightIcon', 'className', 'style', 'ref', 'key'],
    },
    docs: {
      description: {
        component: `
TogglePill component with Figma design system integration.

Interactive pill that toggles between selected/unselected states. Similar to the regular Pill component but with built-in toggle functionality.

## States
- **Unselected**: Border style with transparent background
- **Selected**: Filled background, no border
- **Hover**: Enhanced colors for both selected and unselected states
- **Disabled**: 50% opacity, no interaction

## Size Specifications
- **X-SMALL**: 20px height, 12px text, 4px radius (icons not recommended)
- **SMALL**: 24px height, 12px text, 8px radius
- **MEDIUM** (default): 32px height, 14px text, 8px radius
- **LARGE**: 40px height, 14px text, 8px radius

Icon size is always small (20px) for all pill sizes.
        `.trim(),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TogglePill>;

// Wrapper component for controlled state in Playground
const ControlledTogglePill = (args: any) => {
  const [selected, setSelected] = useState(args.selected ?? false);
  return <TogglePill {...args} selected={selected} onChange={setSelected} />;
};

export const Playground: Story = {
  render: ControlledTogglePill,
  args: {
    size: 'medium',
    label: 'Toggle Pill',
    selected: false,
    disabled: false,
  },
};

export const BasicExample: Story = {
  render: () => {
    const [selected, setSelected] = useState<Record<string, boolean>>({
      first: false,
      second: false,
      third: false,
      fourth: false,
      fifth: false,
      sixth: false,
    });

    const togglePill = (id: string) => {
      setSelected(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Basic Toggle Pills</h3>
          <p className="text-sm text-gray-600 mb-4">Click to toggle each pill</p>
          <div className="flex flex-wrap gap-3">
            <TogglePill
              label="Option 1"
              selected={selected.first}
              onChange={() => togglePill('first')}
            />
            <TogglePill
              label="Option 2"
              selected={selected.second}
              onChange={() => togglePill('second')}
            />
            <TogglePill
              label="Option 3"
              selected={selected.third}
              onChange={() => togglePill('third')}
            />
            <TogglePill
              label="Option 4"
              selected={selected.fourth}
              onChange={() => togglePill('fourth')}
            />
            <TogglePill
              label="Option 5"
              selected={selected.fifth}
              onChange={() => togglePill('fifth')}
            />
            <TogglePill
              label="Option 6"
              selected={selected.sixth}
              onChange={() => togglePill('sixth')}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const AllSizes: Story = {
  render: () => {
    const [selected, setSelected] = useState<Record<string, boolean>>({
      xs: false,
      sm: false,
      md: false,
      lg: false,
    });

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Toggle Pill Sizes</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <TogglePill
              size="x-small"
              label="Extra Small"
              selected={selected.xs}
              onChange={() => setSelected(prev => ({ ...prev, xs: !prev.xs }))}
            />
            <TogglePill
              size="small"
              label="Small"
              selected={selected.sm}
              onChange={() => setSelected(prev => ({ ...prev, sm: !prev.sm }))}
            />
            <TogglePill
              size="medium"
              label="Medium"
              selected={selected.md}
              onChange={() => setSelected(prev => ({ ...prev, md: !prev.md }))}
            />
            <TogglePill
              size="large"
              label="Large"
              selected={selected.lg}
              onChange={() => setSelected(prev => ({ ...prev, lg: !prev.lg }))}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [selected, setSelected] = useState<Record<string, boolean>>({
      left: false,
      right: false,
      both: false,
    });

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Pills with Icons</h3>
          <div className="flex flex-wrap gap-3">
            <TogglePill
              iconL="checkmark"
              label="Left Icon"
              selected={selected.left}
              onChange={() => setSelected(prev => ({ ...prev, left: !prev.left }))}
            />
            <TogglePill
              label="Right Icon"
              iconR="chevron-down"
              selected={selected.right}
              onChange={() => setSelected(prev => ({ ...prev, right: !prev.right }))}
            />
            <TogglePill
              iconL="star"
              label="Both Icons"
              iconR="arrow-right"
              selected={selected.both}
              onChange={() => setSelected(prev => ({ ...prev, both: !prev.both }))}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const WithSubtexts: Story = {
  render: () => {
    const [selected, setSelected] = useState<Record<string, boolean>>({
      left: false,
      right: false,
      both: false,
    });

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Pills with Subtexts</h3>
          <div className="flex flex-wrap gap-3">
            <TogglePill
              leftSubtext="Type"
              label="With Left Subtext"
              selected={selected.left}
              onChange={() => setSelected(prev => ({ ...prev, left: !prev.left }))}
            />
            <TogglePill
              label="With Right Subtext"
              rightSubtext="5"
              selected={selected.right}
              onChange={() => setSelected(prev => ({ ...prev, right: !prev.right }))}
            />
            <TogglePill
              leftSubtext="Cat"
              label="Both Subtexts"
              rightSubtext="12"
              selected={selected.both}
              onChange={() => setSelected(prev => ({ ...prev, both: !prev.both }))}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    const [selected, setSelected] = useState(true);

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Toggle Pill States</h3>
          <div className="flex flex-wrap gap-3">
            <TogglePill label="Unselected" selected={false} onChange={() => {}} />
            <TogglePill label="Selected" selected={true} onChange={() => {}} />
            <TogglePill label="Disabled Unselected" selected={false} disabled onChange={() => {}} />
            <TogglePill label="Disabled Selected" selected={true} disabled onChange={() => {}} />
            <TogglePill
              label="Interactive"
              selected={selected}
              onChange={setSelected}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const FilterGroup: Story = {
  render: () => {
    const [activeFilters, setActiveFilters] = useState<string[]>(['all']);

    const toggleFilter = (filter: string) => {
      if (filter === 'all') {
        setActiveFilters(['all']);
      } else {
        const newFilters = activeFilters.includes(filter)
          ? activeFilters.filter(f => f !== filter)
          : [...activeFilters.filter(f => f !== 'all'), filter];

        setActiveFilters(newFilters.length === 0 ? ['all'] : newFilters);
      }
    };

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Filter Group Example</h3>
          <p className="text-sm text-gray-600 mb-4">
            Common use case: Filter buttons in a list or table view
          </p>
          <div className="flex flex-wrap gap-2">
            <TogglePill
              label="All"
              selected={activeFilters.includes('all')}
              onChange={() => toggleFilter('all')}
            />
            <TogglePill
              label="Active"
              selected={activeFilters.includes('active')}
              onChange={() => toggleFilter('active')}
            />
            <TogglePill
              label="Pending"
              selected={activeFilters.includes('pending')}
              onChange={() => toggleFilter('pending')}
            />
            <TogglePill
              label="Inactive"
              selected={activeFilters.includes('inactive')}
              onChange={() => toggleFilter('inactive')}
            />
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium mb-2">Active Filters:</p>
            <p className="text-sm">{activeFilters.join(', ')}</p>
          </div>
        </div>
      </div>
    );
  },
};

export const CategorySelector: Story = {
  render: () => {
    const [selectedCategory, setSelectedCategory] = useState('urgent-care');

    const categories = [
      { id: 'urgent-care', label: 'Urgent Care' },
      { id: 'primary-care', label: 'Primary Care' },
      { id: 'research', label: 'Research' },
      { id: 'workplace', label: 'Workplace Health' },
    ];

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Category Selector Example</h3>
          <p className="text-sm text-gray-600 mb-4">
            Single-select mode: Only one pill can be selected at a time
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <TogglePill
                key={category.id}
                label={category.label}
                selected={selectedCategory === category.id}
                onChange={() => setSelectedCategory(category.id)}
              />
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium mb-2">Selected Category:</p>
            <p className="text-sm">
              {categories.find(c => c.id === selectedCategory)?.label}
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [filter, setFilter] = useState(false);

    return (
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
          <p className="text-sm text-gray-600 mb-4">
            TogglePill components are fully keyboard accessible and announce state changes to screen readers.
          </p>
          <div className="flex flex-wrap gap-3">
            <TogglePill
              label="Keyboard Accessible"
              selected={filter}
              onChange={setFilter}
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            • <strong>Tab:</strong> Focus the pill<br />
            • <strong>Space or Enter:</strong> Toggle selection<br />
            • <strong>role="switch":</strong> Screen readers announce as a toggle switch<br />
            • <strong>aria-checked:</strong> Screen readers announce current state (on/off)
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
      <p className="text-gray-600 mb-8">Use these natural language prompts when working with TogglePill.</p>
      <div className="space-y-6">
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3"><span className="text-blue-600">🎨</span> Create Filter Pills</h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">"Add toggle pills for Active, Completed, and Archived filters"</code>
          </div>
          <p className="text-sm text-gray-600"><strong>Expected:</strong> Claude will create TogglePill components with selection state management</p>
        </div>
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3"><span className="text-green-600">📏</span> Adjust Size</h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">"Make these filter pills smaller for the compact view"</code>
          </div>
          <p className="text-sm text-gray-600"><strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1">size="small"</code></p>
        </div>
      </div>
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Use for multi-select filters and tags</li>
          <li>• Always handle selection state properly</li>
          <li>• Consider size based on available space</li>
        </ul>
      </div>
    </div>
  ),
};
