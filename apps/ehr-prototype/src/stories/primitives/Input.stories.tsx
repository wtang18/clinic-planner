import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Input } from '../../components/primitives/Input';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
  </svg>
);

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'number', 'search', 'password', 'email'],
      description: 'Input type',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
    error: {
      control: 'text',
      description: 'Error message',
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    placeholder: 'Small input',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    placeholder: 'Large input',
    size: 'lg',
  },
};

export const WithError: Story = {
  name: 'With Error',
  args: {
    placeholder: 'Enter email',
    error: 'Please enter a valid email address',
    defaultValue: 'invalid@',
    id: 'email-input',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
};

export const WithLeftIcon: Story = {
  name: 'With Left Icon',
  args: {
    placeholder: 'Search patients...',
    leftIcon: <SearchIcon />,
  },
};

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px' }}>
      <Input size="sm" placeholder="Small (32px)" />
      <Input size="md" placeholder="Medium (40px)" />
      <Input size="lg" placeholder="Large (48px)" />
    </div>
  ),
};

export const ClinicalSearch: Story = {
  name: 'Clinical Search',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
      <Input
        placeholder="Search medications..."
        leftIcon={<SearchIcon />}
        size="md"
      />
      <Input
        placeholder="Search by ICD-10 code or description..."
        leftIcon={<SearchIcon />}
        size="md"
      />
      <Input
        type="number"
        placeholder="Enter dosage"
        size="md"
      />
    </div>
  ),
};

export const FormExample: Story = {
  name: 'Form Example',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px' }}>
      <div>
        <label style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
          Patient Name
        </label>
        <Input placeholder="Last, First" id="patient-name" />
      </div>
      <div>
        <label style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
          MRN
        </label>
        <Input placeholder="Medical Record Number" id="mrn" />
      </div>
      <div>
        <label style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
          Email
        </label>
        <Input
          type="email"
          placeholder="patient@email.com"
          error="Email is required"
          id="email"
        />
      </div>
    </div>
  ),
};
