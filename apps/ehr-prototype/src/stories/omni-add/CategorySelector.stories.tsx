import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { CategorySelector } from '../../components/omni-add/CategorySelector';
import { fn } from 'storybook/test';

const meta: Meta<typeof CategorySelector> = {
  title: 'OmniAdd/CategorySelector',
  component: CategorySelector,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
  args: {
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithRecentCategories: Story = {
  name: 'With Recent Categories',
  args: {
    recentCategories: ['medication', 'lab', 'diagnosis'],
  },
};

export const WithSelection: Story = {
  name: 'Selected Category',
  args: {
    selected: 'medication',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
