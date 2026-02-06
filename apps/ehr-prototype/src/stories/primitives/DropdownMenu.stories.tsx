import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Trash2, Edit, Copy, Download, Share2 } from 'lucide-react';
import { DropdownMenu } from '../../components/primitives/DropdownMenu';
import { colors } from '../../styles/foundations';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Primitives/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the menu is visible',
    },
    position: {
      control: 'select',
      options: ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
      description: 'Position relative to trigger element',
    },
    minWidth: {
      control: 'text',
      description: 'Minimum width of the menu',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Positioned overlay menu for selection lists and action menus. Renders absolutely positioned relative to a parent container.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', display: 'inline-block', padding: '120px 240px' }}>
        <div style={{
          padding: '8px 16px',
          backgroundColor: colors.bg.neutral.subtle,
          borderRadius: 4,
          fontSize: 14,
          color: colors.fg.neutral.secondary,
        }}>
          Trigger element
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems = [
  { label: 'Patient declined', value: 'patient-declined' },
  { label: 'Medical contraindication', value: 'medical-contraindication' },
  { label: 'Done elsewhere', value: 'completed-elsewhere' },
  { label: 'Other reason', value: 'other' },
];

export const Default: Story = {
  args: {
    isOpen: false,
    items: basicItems,
    onItemClick: (value: string) => console.log('Clicked:', value),
    position: 'bottom-right',
  },
};

export const Open: Story = {
  args: {
    isOpen: true,
    items: basicItems,
    onItemClick: (value: string) => console.log('Clicked:', value),
    position: 'bottom-right',
  },
};

export const WithIcons: Story = {
  args: {
    isOpen: true,
    items: [
      { label: 'Edit', value: 'edit', icon: <Edit size={16} /> },
      { label: 'Copy', value: 'copy', icon: <Copy size={16} /> },
      { label: 'Download', value: 'download', icon: <Download size={16} /> },
      { label: 'Share', value: 'share', icon: <Share2 size={16} /> },
      { label: 'Delete', value: 'delete', icon: <Trash2 size={16} /> },
    ],
    onItemClick: (value: string) => console.log('Clicked:', value),
    position: 'bottom-left',
  },
};

export const Positions: Story = {
  name: 'Position Variants',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '200px', padding: '160px 80px' }}>
      {(['bottom-left', 'bottom-right', 'top-left', 'top-right'] as const).map((position) => (
        <div key={position} style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            padding: '8px 12px',
            backgroundColor: colors.bg.neutral.subtle,
            borderRadius: 4,
            fontSize: 12,
            color: colors.fg.neutral.secondary,
            textAlign: 'center',
          }}>
            {position}
          </div>
          <DropdownMenu
            isOpen={true}
            items={[
              { label: 'Option A', value: 'a' },
              { label: 'Option B', value: 'b' },
              { label: 'Option C', value: 'c' },
            ]}
            onItemClick={() => {}}
            position={position}
            minWidth="140px"
          />
        </div>
      ))}
    </div>
  ),
};

export const DisabledItems: Story = {
  args: {
    isOpen: true,
    items: [
      { label: 'Available action', value: 'available' },
      { label: 'Disabled action', value: 'disabled', disabled: true },
      { label: 'Another available', value: 'another' },
      { label: 'Also disabled', value: 'also-disabled', disabled: true },
    ],
    onItemClick: (value: string) => console.log('Clicked:', value),
    position: 'bottom-right',
  },
};
