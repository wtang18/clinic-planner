import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { PatientIndicator } from '../../components/ai-ui/PatientIndicator';
import { colors } from '../../styles/foundations';
import { fn } from 'storybook/test';

const meta: Meta<typeof PatientIndicator> = {
  title: 'AI UI/PatientIndicator',
  component: PatientIndicator,
  tags: ['autodocs'],
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1F2937' },
      ],
    },
    docs: {
      description: {
        component: `
The PatientIndicator shows which patient is being recorded in the minibar.

Features:
- **Avatar**: Colored circle with patient initials
- **Name**: Truncated if too long
- **Recording pulse**: Animation when actively recording
- **Mismatch warning**: Badge when viewing a different patient than recording
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 16, backgroundColor: '#1F2937', borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'John Smith',
    initials: 'JS',
    avatarColor: colors.fg.accent.primary,
    onClick: fn(),
  },
};

export const Recording: Story = {
  args: {
    name: 'Maria Garcia',
    initials: 'MG',
    avatarColor: '#10B981',
    isRecording: true,
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a pulsing ring animation when actively recording.',
      },
    },
  },
};

export const LongName: Story = {
  name: 'Long Name (Truncated)',
  args: {
    name: 'Christopher Wellington-Smithson III',
    avatarColor: '#8B5CF6',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Long names are truncated with ellipsis to fit the minibar.',
      },
    },
  },
};

export const Mismatch: Story = {
  name: 'Patient Mismatch Warning',
  args: {
    name: 'John Smith',
    initials: 'JS',
    isRecording: true,
    hasMismatch: true,
    mismatchText: 'Recording John Smith but viewing Maria Garcia',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a warning when recording one patient while viewing another. Highlights potential documentation errors.',
      },
    },
  },
};

export const AllStates: Story = {
  name: 'All States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#9CA3AF', width: 100, fontSize: 12 }}>Idle:</span>
        <PatientIndicator name="John Smith" initials="JS" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#9CA3AF', width: 100, fontSize: 12 }}>Recording:</span>
        <PatientIndicator name="Maria Garcia" initials="MG" isRecording avatarColor="#10B981" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#9CA3AF', width: 100, fontSize: 12 }}>Mismatch:</span>
        <PatientIndicator name="John Smith" initials="JS" isRecording hasMismatch />
      </div>
    </div>
  ),
};
