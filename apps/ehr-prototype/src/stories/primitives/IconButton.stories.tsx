import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { IconButton } from '../../components/primitives/IconButton';
import { Icon } from '../../icons';
import { fn } from 'storybook/test';

const meta: Meta<typeof IconButton> = {
  title: 'Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'danger'],
      description: 'Visual variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <Icon name="pencil" size="small" />,
    label: 'Edit',
    variant: 'default',
  },
};

export const Ghost: Story = {
  args: {
    icon: <Icon name="more-vertical" size="small" />,
    label: 'More options',
    variant: 'ghost',
  },
};

export const Danger: Story = {
  args: {
    icon: <Icon name="trash" size="small" />,
    label: 'Delete',
    variant: 'danger',
  },
};

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <IconButton icon={<Icon name="pencil" size="small" />} label="Small" size="sm" onClick={fn()} />
      <IconButton icon={<Icon name="pencil" size="small" />} label="Medium" size="md" onClick={fn()} />
      <IconButton icon={<Icon name="pencil" size="medium" />} label="Large" size="lg" onClick={fn()} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    icon: <Icon name="pencil" size="small" />,
    label: 'Edit (disabled)',
    disabled: true,
  },
};

export const ClinicalActions: Story = {
  name: 'Clinical Actions',
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <IconButton icon={<Icon name="checkmark" size="small" />} label="Approve" variant="default" onClick={fn()} />
      <IconButton icon={<Icon name="pencil" size="small" />} label="Edit" variant="ghost" onClick={fn()} />
      <IconButton icon={<Icon name="x" size="small" />} label="Dismiss" variant="ghost" onClick={fn()} />
      <IconButton icon={<Icon name="trash" size="small" />} label="Delete" variant="danger" onClick={fn()} />
      <IconButton icon={<Icon name="more-vertical" size="small" />} label="More" variant="ghost" onClick={fn()} />
    </div>
  ),
};
