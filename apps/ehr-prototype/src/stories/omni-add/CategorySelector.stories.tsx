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
    moreExpanded: {
      control: 'boolean',
      description: 'Whether secondary categories are shown',
    },
  },
  args: {
    onSelect: fn(),
    onToggleMore: fn(),
    moreExpanded: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const MoreExpanded: Story = {
  name: 'More Categories Expanded',
  args: {
    moreExpanded: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
