import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AbnormalFlag } from '../../components/primitives/AbnormalFlag';
import { colors } from '../../styles/foundations';

const meta: Meta<typeof AbnormalFlag> = {
  title: 'Primitives/AbnormalFlag',
  component: AbnormalFlag,
  tags: ['autodocs'],
  argTypes: {
    flag: {
      control: 'select',
      options: ['normal', 'low', 'high', 'critical'],
      description: 'Abnormality flag level',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size: sm = smaller text/icons, md = standard',
    },
    value: {
      control: 'text',
      description: 'The value to display',
    },
    unit: {
      control: 'text',
      description: 'Optional unit label',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Inline indicator for lab results and vital measurements that shows abnormality via color and directional arrows. Used in LabCard and VitalsCard.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Normal',
  args: {
    flag: 'normal',
    value: '98.6',
    unit: 'F',
    size: 'md',
  },
};

export const High: Story = {
  name: 'High Value',
  args: {
    flag: 'high',
    value: '142',
    unit: 'mg/dL',
    size: 'md',
  },
};

export const Low: Story = {
  name: 'Low Value',
  args: {
    flag: 'low',
    value: '3.2',
    unit: 'mEq/L',
    size: 'md',
  },
};

export const Critical: Story = {
  name: 'Critical Value',
  args: {
    flag: 'critical',
    value: '180',
    unit: 'mmHg',
    size: 'md',
  },
};

export const WithUnits: Story = {
  name: 'With Units',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, width: 80 }}>Normal</span>
        <AbnormalFlag flag="normal" value="120" unit="mg/dL" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, width: 80 }}>High</span>
        <AbnormalFlag flag="high" value="142" unit="mg/dL" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, width: 80 }}>Low</span>
        <AbnormalFlag flag="low" value="3.2" unit="mEq/L" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, width: 80 }}>Critical</span>
        <AbnormalFlag flag="critical" value="180" unit="mmHg" />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: 'Size Comparison',
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable }}>sm</span>
        <AbnormalFlag flag="high" value="142" unit="mg/dL" size="sm" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable }}>md</span>
        <AbnormalFlag flag="high" value="142" unit="mg/dL" size="md" />
      </div>
    </div>
  ),
};
