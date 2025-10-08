import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchInput } from './SearchInput';

const meta = {
  title: 'Design System/SearchInput',
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
