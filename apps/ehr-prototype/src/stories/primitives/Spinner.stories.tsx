import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Spinner } from '../../components/primitives/Spinner';
import { colors } from '../../styles/foundations';

const meta: Meta<typeof Spinner> = {
  title: 'Primitives/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Spinner size',
    },
    color: {
      control: 'color',
      description: 'Spinner color',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="sm" />
        <div style={{ fontSize: '12px', color: colors.fg.neutral.spotReadable, marginTop: '8px' }}>sm (16px)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="md" />
        <div style={{ fontSize: '12px', color: colors.fg.neutral.spotReadable, marginTop: '8px' }}>md (24px)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner size="lg" />
        <div style={{ fontSize: '12px', color: colors.fg.neutral.spotReadable, marginTop: '8px' }}>lg (32px)</div>
      </div>
    </div>
  ),
};

export const CustomColors: Story = {
  name: 'Custom Colors',
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Spinner color={colors.fg.accent.primary} />
      <Spinner color={colors.fg.positive.secondary} />
      <Spinner color={colors.fg.attention.secondary} />
      <Spinner color={colors.fg.alert.secondary} />
      <Spinner color={colors.fg.accent.primary} />
    </div>
  ),
};

export const InlineWithText: Story = {
  name: 'Inline with Text',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Spinner size="sm" />
        <span style={{ fontSize: '14px', color: colors.fg.neutral.spotReadable }}>Loading patient data...</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Spinner size="sm" color={colors.fg.accent.primary} />
        <span style={{ fontSize: '14px', color: colors.fg.neutral.spotReadable }}>AI processing transcript...</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Spinner size="sm" color={colors.fg.positive.secondary} />
        <span style={{ fontSize: '14px', color: colors.fg.neutral.spotReadable }}>Submitting order...</span>
      </div>
    </div>
  ),
};
