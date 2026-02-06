import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from '../../components/primitives/StatusBadge';
import { colors, spaceBetween } from '../../styles/foundations';

const meta: Meta<typeof StatusBadge> = {
  title: 'Primitives/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'text',
      description: 'The status key used to determine variant and label',
    },
    label: {
      control: 'text',
      description: 'Optional custom label (overrides auto-formatting)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Badge size',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'pending-review',
  },
};

export const AllTaskStatuses: Story = {
  name: 'All Task Statuses',
  render: () => {
    const taskStatuses = [
      'queued',
      'processing',
      'pending-review',
      'ready',
      'completed',
      'failed',
      'cancelled',
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.fg.neutral.primary, marginBottom: 4 }}>
          Task Statuses
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spaceBetween.repeating }}>
          {taskStatuses.map((status) => (
            <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <StatusBadge status={status} />
              <span style={{ fontSize: 11, color: colors.fg.neutral.spotReadable }}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const AllChartStatuses: Story = {
  name: 'All Chart Item Statuses',
  render: () => {
    const chartStatuses = [
      'draft',
      'confirmed',
      'active',
      'pending',
      'discontinued',
      'on-hold',
    ];

    const careGapStatuses = [
      'open',
      'closed',
      'excluded',
    ];

    const genericStatuses = [
      'new',
      'in-progress',
      'resolved',
      'error',
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.fg.neutral.primary, marginBottom: 8 }}>
            Chart Item Statuses
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spaceBetween.repeating }}>
            {chartStatuses.map((status) => (
              <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <StatusBadge status={status} />
                <span style={{ fontSize: 11, color: colors.fg.neutral.spotReadable }}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.fg.neutral.primary, marginBottom: 8 }}>
            Care Gap Statuses
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spaceBetween.repeating }}>
            {careGapStatuses.map((status) => (
              <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <StatusBadge status={status} />
                <span style={{ fontSize: 11, color: colors.fg.neutral.spotReadable }}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.fg.neutral.primary, marginBottom: 8 }}>
            Generic Statuses
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spaceBetween.repeating }}>
            {genericStatuses.map((status) => (
              <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <StatusBadge status={status} />
                <span style={{ fontSize: 11, color: colors.fg.neutral.spotReadable }}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const CustomLabel: Story = {
  name: 'Custom Label',
  render: () => (
    <div style={{ display: 'flex', gap: spaceBetween.repeating, flexWrap: 'wrap' }}>
      <StatusBadge status="completed" label="Done" />
      <StatusBadge status="pending-review" label="Awaiting MD" />
      <StatusBadge status="processing" label="In Flight" />
      <StatusBadge status="failed" label="Error: timeout" />
      <StatusBadge status="draft" label="Not Started" />
    </div>
  ),
};

export const CustomMap: Story = {
  name: 'Custom Map',
  render: () => {
    const labOrderMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'draft': 'default',
      'ordered': 'info',
      'collected': 'info',
      'processing': 'warning',
      'resulted': 'success',
    };

    const labStatuses = ['draft', 'ordered', 'collected', 'processing', 'resulted'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.fg.neutral.primary, marginBottom: 4 }}>
          Lab Order Statuses (Custom Map)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spaceBetween.repeating }}>
          {labStatuses.map((status) => (
            <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <StatusBadge status={status} customMap={labOrderMap} />
              <span style={{ fontSize: 11, color: colors.fg.neutral.spotReadable }}>{status}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, marginTop: 8 }}>
          Using a custom map allows domain-specific status-to-variant mappings
          that differ from the centralized defaults.
        </div>
      </div>
    );
  },
};
