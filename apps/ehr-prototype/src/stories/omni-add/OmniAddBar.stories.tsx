import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { OmniAddBar } from '../../components/omni-add/OmniAddBar';
import { colors } from '../../styles/foundations';
import { fn } from 'storybook/test';

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta<typeof OmniAddBar> = {
  title: 'OmniAdd/OmniAddBar',
  component: OmniAddBar,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
  args: {
    onItemAdd: fn(),
    onUndo: fn(),
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default (Touch Mode)',
  args: {},
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const InContext: Story = {
  name: 'In Context (with Chart Items)',
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      {/* Simulated chart items above */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          padding: '12px 16px',
          border: `1px solid ${colors.border.neutral.subtle}`,
          borderRadius: '8px',
          borderLeft: `3px solid ${colors.fg.accent.primary}`,
          marginBottom: '8px',
          fontSize: '14px',
        }}>
          <strong>Amoxicillin 500mg</strong>
          <div style={{ color: colors.fg.neutral.spotReadable, fontSize: '12px' }}>1 cap PO TID x 10 days</div>
        </div>
        <div style={{
          padding: '12px 16px',
          border: `1px solid ${colors.border.neutral.subtle}`,
          borderRadius: '8px',
          borderLeft: `3px solid ${colors.fg.attention.secondary}`,
          marginBottom: '8px',
          fontSize: '14px',
        }}>
          <strong>Acute URI</strong>
          <div style={{ color: colors.fg.neutral.spotReadable, fontSize: '12px' }}>J06.9 - Primary</div>
        </div>
      </div>

      {/* OmniAdd Bar */}
      <OmniAddBar
        onItemAdd={fn()}
        onUndo={fn()}
      />
    </div>
  ),
};
