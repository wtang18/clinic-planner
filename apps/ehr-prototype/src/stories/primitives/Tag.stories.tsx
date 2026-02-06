import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Tag } from '../../components/primitives/Tag';
import { colors } from '../../styles/foundations';
import { fn } from 'storybook/test';

const meta: Meta<typeof Tag> = {
  title: 'Primitives/Tag',
  component: Tag,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['status', 'source', 'alert', 'category', 'ai', 'workflow'],
      description: 'Tag type determines color',
    },
    label: {
      control: 'text',
      description: 'Tag label text',
    },
    removable: {
      control: 'boolean',
      description: 'Show remove button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Status: Story = {
  args: {
    type: 'status',
    label: 'Confirmed',
  },
};

export const Source: Story = {
  args: {
    type: 'source',
    label: 'Quest Diagnostics',
  },
};

export const Alert: Story = {
  args: {
    type: 'alert',
    label: 'Out of Range',
  },
};

export const Category: Story = {
  args: {
    type: 'category',
    label: 'Medication',
  },
};

export const AITag: Story = {
  name: 'AI',
  args: {
    type: 'ai',
    label: 'AI Suggested',
  },
};

export const Workflow: Story = {
  args: {
    type: 'workflow',
    label: 'E-Prescribed',
  },
};

export const Removable: Story = {
  args: {
    type: 'category',
    label: 'Removable Tag',
    removable: true,
    onRemove: fn(),
  },
};

export const Clickable: Story = {
  args: {
    type: 'status',
    label: 'Click Me',
    onClick: fn(),
  },
};

export const AllTypes: Story = {
  name: 'All Types',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <Tag type="status" label="New" />
      <Tag type="status" label="Confirmed" />
      <Tag type="source" label="Quest" />
      <Tag type="source" label="In-House" />
      <Tag type="alert" label="Critical" />
      <Tag type="alert" label="OOR" />
      <Tag type="category" label="Lab" />
      <Tag type="category" label="Rx" />
      <Tag type="ai" label="AI Suggested" />
      <Tag type="ai" label="Needs Review" />
      <Tag type="workflow" label="E-Prescribed" />
      <Tag type="workflow" label="Requisition Sent" />
    </div>
  ),
};

export const CustomColor: Story = {
  name: 'Custom Color',
  args: {
    type: 'category',
    label: 'Custom Teal',
    color: colors.fg.positive.secondary,
  },
};

export const ChartItemTags: Story = {
  name: 'Chart Item Example',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Medication order */}
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: colors.fg.neutral.secondary }}>
          Amoxicillin 500mg
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Tag type="category" label="Medication" />
          <Tag type="ai" label="AI Suggested" />
          <Tag type="workflow" label="E-Prescribed" />
        </div>
      </div>
      {/* Lab result */}
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: colors.fg.neutral.secondary }}>
          CBC with Differential
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Tag type="category" label="Lab" />
          <Tag type="source" label="Quest" />
          <Tag type="alert" label="WBC High" />
          <Tag type="status" label="Final" />
        </div>
      </div>
      {/* Diagnosis */}
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: colors.fg.neutral.secondary }}>
          Upper Respiratory Infection
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Tag type="category" label="Diagnosis" />
          <Tag type="ai" label="Needs Review" />
          <Tag type="status" label="Pending" />
        </div>
      </div>
    </div>
  ),
};
