import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Clock, MapPin, User, Calendar } from 'lucide-react';
import { MetadataRow } from '../../components/primitives/MetadataRow';
import { colors } from '../../styles/foundations';

const meta: Meta<typeof MetadataRow> = {
  title: 'Primitives/MetadataRow',
  component: MetadataRow,
  tags: ['autodocs'],
  argTypes: {
    separator: {
      control: 'select',
      options: ['dot', 'pipe', 'space'],
      description: 'Separator between items',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Text size',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A row of metadata items with optional labels, icons, and separators. Used for displaying diagnosis details, medication info, lab metadata, and other inline data.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { value: 'Chronic' },
      { value: 'Onset: Jan 15, 2024' },
      { value: '3 linked' },
    ],
  },
};

export const WithLabels: Story = {
  name: 'With Labels',
  args: {
    items: [
      { label: 'Qty', value: '30' },
      { label: 'Refills', value: '3' },
      { label: 'Duration', value: '90 days' },
    ],
  },
};

export const WithSeparators: Story = {
  name: 'Separator Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, marginBottom: 4 }}>space (default)</div>
        <MetadataRow
          separator="space"
          items={[
            { value: 'STAT' },
            { value: 'LabCorp' },
            { value: 'Blood draw' },
          ]}
        />
      </div>
      <div>
        <div style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, marginBottom: 4 }}>dot</div>
        <MetadataRow
          separator="dot"
          items={[
            { value: 'STAT' },
            { value: 'LabCorp' },
            { value: 'Blood draw' },
          ]}
        />
      </div>
      <div>
        <div style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, marginBottom: 4 }}>pipe</div>
        <MetadataRow
          separator="pipe"
          items={[
            { value: 'STAT' },
            { value: 'LabCorp' },
            { value: 'Blood draw' },
          ]}
        />
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  name: 'With Icons',
  args: {
    items: [
      { icon: <Clock size={12} />, value: '2h ago' },
      { icon: <MapPin size={12} />, value: 'Room 204' },
      { icon: <User size={12} />, value: 'Dr. Smith' },
    ],
    size: 'md',
  },
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, marginBottom: 4 }}>sm (12px)</div>
        <MetadataRow
          size="sm"
          items={[
            { label: 'Pharmacy', value: 'CVS Main St' },
            { label: 'Resulted', value: 'Jan 20, 2:30 PM' },
          ]}
        />
      </div>
      <div>
        <div style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, marginBottom: 4 }}>md (14px)</div>
        <MetadataRow
          size="md"
          items={[
            { label: 'Pharmacy', value: 'CVS Main St' },
            { label: 'Resulted', value: 'Jan 20, 2:30 PM' },
          ]}
        />
      </div>
    </div>
  ),
};
