import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SuggestionChip } from '../../components/suggestions/SuggestionChip';
import type { Suggestion } from '../../types/suggestions';
import { fn } from 'storybook/test';

// ============================================================================
// Mock Data
// ============================================================================

const mockTranscription: Suggestion = {
  id: 'sug-1',
  type: 'chart-item',
  status: 'active',
  source: 'transcription',
  confidence: 0.92,
  createdAt: new Date(),
  displayText: 'Add: Amoxicillin 500mg TID x10d',
  content: {
    type: 'new-item',
    category: 'medication',
    itemTemplate: { displayText: 'Amoxicillin 500mg' },
  },
};

const mockAIAnalysis: Suggestion = {
  id: 'sug-2',
  type: 'chart-item',
  status: 'active',
  source: 'ai-analysis',
  confidence: 0.75,
  createdAt: new Date(),
  displayText: 'Order: CBC with Differential',
  content: {
    type: 'new-item',
    category: 'lab',
    itemTemplate: { displayText: 'CBC with Differential' },
  },
};

const mockCareGap: Suggestion = {
  id: 'sug-3',
  type: 'care-gap-action',
  status: 'active',
  source: 'care-gap',
  confidence: 0.88,
  createdAt: new Date(),
  displayText: 'Annual A1c - Overdue',
  content: {
    type: 'care-gap-action',
    careGapId: 'cg-1',
    actionTemplate: { displayText: 'Order A1c' },
  },
};

const mockCDS: Suggestion = {
  id: 'sug-4',
  type: 'dx-association',
  status: 'active',
  source: 'cds',
  confidence: 0.65,
  createdAt: new Date(),
  displayText: 'Link: URI (J06.9)',
  content: {
    type: 'dx-link',
    targetItemId: 'med-1',
    suggestedDx: [
      { description: 'URI', icdCode: 'J06.9', confidence: 0.85 },
    ],
  },
};

const mockLowConfidence: Suggestion = {
  id: 'sug-5',
  type: 'chart-item',
  status: 'active',
  source: 'transcription',
  confidence: 0.45,
  createdAt: new Date(),
  displayText: 'Possible: Inhaler PRN',
  content: {
    type: 'new-item',
    category: 'medication',
    itemTemplate: { displayText: 'Albuterol inhaler' },
  },
};

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta<typeof SuggestionChip> = {
  title: 'Suggestions/SuggestionChip',
  component: SuggestionChip,
  tags: ['autodocs'],
  args: {
    onAccept: fn(),
    onDismiss: fn(),
    onModify: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FromTranscription: Story = {
  name: 'From Transcription',
  args: {
    suggestion: mockTranscription,
  },
};

export const FromAIAnalysis: Story = {
  name: 'From AI Analysis',
  args: {
    suggestion: mockAIAnalysis,
  },
};

export const CareGap: Story = {
  name: 'Care Gap',
  args: {
    suggestion: mockCareGap,
  },
};

export const CDS: Story = {
  name: 'Clinical Decision Support',
  args: {
    suggestion: mockCDS,
  },
};

export const LowConfidence: Story = {
  name: 'Low Confidence',
  args: {
    suggestion: mockLowConfidence,
  },
};

export const AllSources: Story = {
  name: 'All Source Types',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <SuggestionChip suggestion={mockTranscription} onAccept={fn()} onDismiss={fn()} onModify={fn()} />
      <SuggestionChip suggestion={mockAIAnalysis} onAccept={fn()} onDismiss={fn()} onModify={fn()} />
      <SuggestionChip suggestion={mockCareGap} onAccept={fn()} onDismiss={fn()} onModify={fn()} />
      <SuggestionChip suggestion={mockCDS} onAccept={fn()} onDismiss={fn()} onModify={fn()} />
      <SuggestionChip suggestion={mockLowConfidence} onAccept={fn()} onDismiss={fn()} onModify={fn()} />
    </div>
  ),
};
