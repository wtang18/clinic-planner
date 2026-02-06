import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AlertTriangle, Heart, Star, Clock, Check } from 'lucide-react';
import { Pill } from '../../components/primitives/Pill';
import { colors } from '../../styles/foundations';
import { fn } from 'storybook/test';

const meta: Meta<typeof Pill> = {
  title: 'Primitives/Pill',
  component: Pill,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['default', 'alert', 'attention', 'success', 'accent'],
      description: 'Semantic color class',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size: sm = tighter padding, md = standard',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Compact status indicator with optional icon and click handler. Used for inline metadata like allergy indicators and care gap counts.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    color: 'default',
    size: 'md',
    children: 'Label',
  },
};

export const WithIcon: Story = {
  args: {
    color: 'attention',
    size: 'md',
    icon: <AlertTriangle size={14} />,
    children: 'Penicillin allergy',
  },
};

export const AllColors: Story = {
  name: 'Color Variants',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Pill color="default" icon={<Clock size={14} />}>Default</Pill>
      <Pill color="alert" icon={<AlertTriangle size={14} />}>Alert</Pill>
      <Pill color="attention" icon={<AlertTriangle size={14} />}>Attention</Pill>
      <Pill color="success" icon={<Check size={14} />}>Success</Pill>
      <Pill color="accent" icon={<Star size={14} />}>Accent</Pill>
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable }}>sm</span>
        <Pill color="accent" size="sm" icon={<Star size={14} />}>Small</Pill>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable }}>md</span>
        <Pill color="accent" size="md" icon={<Star size={14} />}>Medium</Pill>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  name: 'Clickable',
  args: {
    color: 'default',
    icon: <Heart size={14} />,
    children: '3 care gaps',
    onClick: fn(),
  },
};

export const InContext: Story = {
  name: 'In Context (Patient Header)',
  render: () => (
    <div style={{
      display: 'flex', gap: '8px', alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: colors.bg.neutral.base,
      borderRadius: '8px',
      border: `1px solid ${colors.border.neutral.low}`,
    }}>
      <span style={{ fontSize: 16, fontWeight: 500, color: colors.fg.neutral.primary }}>
        Jane Smith, 45F
      </span>
      <Pill color="alert" size="sm" icon={<AlertTriangle size={14} />}>
        Severe: Penicillin
      </Pill>
      <Pill color="default" size="sm" icon={<Heart size={14} />} onClick={() => {}}>
        2 care gaps
      </Pill>
    </div>
  ),
};
