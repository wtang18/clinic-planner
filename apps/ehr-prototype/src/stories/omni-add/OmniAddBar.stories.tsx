import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { OmniAddBar } from '../../components/omni-add/OmniAddBar';
import type { Suggestion } from '../../types/suggestions';
import { colors } from '../../styles/foundations';
import { fn } from 'storybook/test';

// ============================================================================
// Mock Data
// ============================================================================

const mockSuggestions: Suggestion[] = [
  {
    id: 'sug-1',
    type: 'chart-item',
    status: 'active',
    source: 'transcription',
    confidence: 0.92,
    createdAt: new Date(),
    displayText: 'Add: Amoxicillin 500mg TID',
    content: {
      type: 'new-item',
      category: 'medication',
      itemTemplate: { displayText: 'Amoxicillin 500mg' },
    },
  },
  {
    id: 'sug-2',
    type: 'chart-item',
    status: 'active',
    source: 'ai-analysis',
    confidence: 0.78,
    createdAt: new Date(),
    displayText: 'Order: CBC w/ Diff',
    content: {
      type: 'new-item',
      category: 'lab',
      itemTemplate: { displayText: 'CBC with Differential' },
    },
  },
  {
    id: 'sug-3',
    type: 'care-gap-action',
    status: 'active',
    source: 'care-gap',
    confidence: 0.85,
    createdAt: new Date(),
    displayText: 'A1c - Due',
    content: {
      type: 'care-gap-action',
      careGapId: 'cg-1',
      actionTemplate: { displayText: 'Order A1c' },
    },
  },
];

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
    onSuggestionAccept: fn(),
    onSuggestionDismiss: fn(),
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default (Collapsed)',
  args: {},
};

export const WithSuggestions: Story = {
  name: 'With Active Suggestions',
  args: {
    activeSuggestions: mockSuggestions,
  },
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
        activeSuggestions={mockSuggestions.slice(0, 2)}
        onSuggestionAccept={fn()}
        onSuggestionDismiss={fn()}
      />
    </div>
  ),
};
