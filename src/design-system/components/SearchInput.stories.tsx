import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'Design System/Components/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
SearchInput component based on Figma design system.

**Background States:**
- Default: rgba(0,0,0,0.12) with backdrop-blur-xl
- Hover: rgba(0,0,0,0.20)
- Focused: rgba(0,0,0,0.12)
- Focused+Hover: rgba(0,0,0,0.20)

**Features:**
- Magnifying glass icon on left
- Clear (x) icon appears when value is present
- Fully rounded border (99px)
- Matches Input component sizes
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the search input',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component for interactive stories
function SearchInputWithState(args: any) {
  const [value, setValue] = useState(args.value || '');

  return (
    <div style={{ width: '400px' }}>
      <SearchInput
        {...args}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          console.log('Search value changed:', newValue);
        }}
        onClear={() => {
          console.log('Search cleared');
        }}
      />
    </div>
  );
}

/**
 * Playground story with controllable value and all props
 */
export const Playground: Story = {
  render: (args) => <SearchInputWithState {...args} />,
  args: {
    placeholder: 'Search',
    size: 'medium',
    disabled: false,
  },
};

/**
 * All size variants
 */
export const Sizes: Story = {
  render: () => {
    const [small, setSmall] = useState('');
    const [medium, setMedium] = useState('');
    const [large, setLarge] = useState('');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
        <div>
          <p style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Small</p>
          <SearchInput value={small} onChange={setSmall} size="small" />
        </div>
        <div>
          <p style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Medium (Default)</p>
          <SearchInput value={medium} onChange={setMedium} size="medium" />
        </div>
        <div>
          <p style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Large</p>
          <SearchInput value={large} onChange={setLarge} size="large" />
        </div>
      </div>
    );
  },
};

/**
 * Empty state (default)
 */
export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div style={{ width: '400px' }}>
        <SearchInput value={value} onChange={setValue} />
      </div>
    );
  },
};

/**
 * With value (shows clear button)
 */
export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState('Sample search query');

    return (
      <div style={{ width: '400px' }}>
        <SearchInput value={value} onChange={setValue} />
      </div>
    );
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div style={{ width: '400px' }}>
        <SearchInput value={value} onChange={setValue} disabled />
      </div>
    );
  },
};

/**
 * Disabled with value
 */
export const DisabledWithValue: Story = {
  render: () => {
    const [value, setValue] = useState('Cannot clear this');

    return (
      <div style={{ width: '400px' }}>
        <SearchInput value={value} onChange={setValue} disabled />
      </div>
    );
  },
};

/**
 * Custom placeholder
 */
export const CustomPlaceholder: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div style={{ width: '400px' }}>
        <SearchInput
          value={value}
          onChange={setValue}
          placeholder="Search marketing materials..."
        />
      </div>
    );
  },
};

/**
 * With onChange handler logging
 */
export const WithLogging: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div style={{ width: '400px' }}>
        <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', fontFamily: 'monospace' }}>
            Current value: "{value}"
          </p>
        </div>
        <SearchInput
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            console.log('Search changed:', newValue);
          }}
          onClear={() => {
            console.log('Search cleared!');
          }}
          placeholder="Type to see value update..."
        />
      </div>
    );
  },
};

/**
 * Full width example
 */
export const FullWidth: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div style={{ width: '100%', minWidth: '600px' }}>
        <SearchInput value={value} onChange={setValue} />
      </div>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Accessibility Features</h3>
        <p className="text-sm text-gray-700 mb-4">SearchInput components are fully keyboard accessible.</p>
        <ul className="text-sm space-y-2 mb-6 text-gray-700">
          <li>✓ Keyboard navigation (Tab, Escape to clear)</li>
          <li>✓ Screen reader support with aria-label</li>
          <li>✓ Visible focus indicators</li>
          <li>✓ WCAG AA color contrast</li>
        </ul>
        <div className="space-y-4 max-w-md">
          <div>
            <p className="text-xs text-gray-600 mb-2">✓ Correct - Has aria-label:</p>
            <SearchInput placeholder="Search patients..." aria-label="Search patients by name" />
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-2">Keyboard accessible clear button:</p>
            <SearchInput placeholder="Try typing and pressing Escape" />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const ClaudeCodeExamples: Story = {
  render: () => (
    <div className="p-8 max-w-4xl bg-[var(--color-bg-neutral-base)]">
      <h2 className="text-2xl font-bold mb-6">Working with Claude Code (AI Assistant)</h2>
      <p className="text-gray-600 mb-8">Use these natural language prompts when working with SearchInput.</p>
      <div className="space-y-6">
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3"><span className="text-blue-600">🔍</span> Add Search</h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">"Add a search input to filter the patient list"</code>
          </div>
          <p className="text-sm text-gray-600"><strong>Expected:</strong> Claude will add SearchInput with appropriate placeholder and onChange handler</p>
        </div>
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3"><span className="text-green-600">📏</span> Change Size</h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">"Make the search input larger"</code>
          </div>
          <p className="text-sm text-gray-600"><strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1">size="large"</code></p>
        </div>
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3"><span className="text-orange-600">♿</span> Improve Accessibility</h3>
          <div className="bg-white p-4 rounded border mb-3">
            <code className="text-sm text-gray-800">"Add an accessible label to describe this search field"</code>
          </div>
          <p className="text-sm text-gray-600"><strong>Expected:</strong> Claude will add <code className="bg-gray-100 px-1">aria-label</code> with descriptive text</p>
        </div>
      </div>
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Always provide aria-label for accessibility</li>
          <li>• Use debouncing for search queries</li>
          <li>• SearchInput uses semantic tokens for theming</li>
        </ul>
      </div>
    </div>
  ),
};
