import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Check, Pencil, Send, X } from 'lucide-react';
import { ActionGroup } from '../../components/primitives/ActionGroup';
import { Button } from '../../components/primitives/Button';
import { colors } from '../../styles/foundations';

const meta: Meta<typeof ActionGroup> = {
  title: 'Primitives/ActionGroup',
  component: ActionGroup,
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['start', 'end', 'space-between'],
      description: 'Horizontal alignment of children',
    },
    gap: {
      control: 'number',
      description: 'Custom gap override in pixels',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A layout container for grouping action buttons with consistent spacing and alignment. Used in card footers, form actions, and toolbar patterns.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: '16px', backgroundColor: colors.bg.neutral.base, borderRadius: '8px', border: `1px solid ${colors.border.neutral.low}` }}>
      <ActionGroup>
        <Button variant="primary" size="sm" leftIcon={<Check size={14} />}>Accept</Button>
        <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />}>Edit</Button>
        <Button variant="ghost" size="sm">Dismiss</Button>
      </ActionGroup>
    </div>
  ),
};

export const SpaceBetween: Story = {
  name: 'Space Between',
  render: () => (
    <div style={{ padding: '16px', backgroundColor: colors.bg.neutral.base, borderRadius: '8px', border: `1px solid ${colors.border.neutral.low}` }}>
      <ActionGroup layout="space-between">
        <ActionGroup>
          <Button variant="primary" size="sm" leftIcon={<Send size={14} />}>Send</Button>
          <Button variant="secondary" size="sm">Save Draft</Button>
        </ActionGroup>
        <Button variant="ghost" size="sm" leftIcon={<X size={14} />}>Cancel</Button>
      </ActionGroup>
    </div>
  ),
};

export const End: Story = {
  name: 'End Aligned',
  render: () => (
    <div style={{ padding: '16px', backgroundColor: colors.bg.neutral.base, borderRadius: '8px', border: `1px solid ${colors.border.neutral.low}` }}>
      <ActionGroup layout="end">
        <Button variant="secondary" size="sm">Cancel</Button>
        <Button variant="primary" size="sm">Confirm</Button>
      </ActionGroup>
    </div>
  ),
};

export const CustomGap: Story = {
  name: 'Custom Gap',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, marginBottom: 4 }}>gap: 4</div>
        <ActionGroup gap={4}>
          <Button variant="primary" size="sm">A</Button>
          <Button variant="secondary" size="sm">B</Button>
          <Button variant="ghost" size="sm">C</Button>
        </ActionGroup>
      </div>
      <div>
        <div style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, marginBottom: 4 }}>gap: 16 (default)</div>
        <ActionGroup gap={16}>
          <Button variant="primary" size="sm">A</Button>
          <Button variant="secondary" size="sm">B</Button>
          <Button variant="ghost" size="sm">C</Button>
        </ActionGroup>
      </div>
      <div>
        <div style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, marginBottom: 4 }}>gap: 32</div>
        <ActionGroup gap={32}>
          <Button variant="primary" size="sm">A</Button>
          <Button variant="secondary" size="sm">B</Button>
          <Button variant="ghost" size="sm">C</Button>
        </ActionGroup>
      </div>
    </div>
  ),
};
