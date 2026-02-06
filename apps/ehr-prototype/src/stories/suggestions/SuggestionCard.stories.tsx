import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SuggestionCard } from '../../components/suggestions/SuggestionCard';
import type { Suggestion } from '../../types/suggestions';
import { fn } from 'storybook/test';

// ============================================================================
// Mock Data
// ============================================================================

const mockMedication: Suggestion = {
  id: 'sug-1',
  type: 'chart-item',
  status: 'active',
  source: 'transcription',
  confidence: 0.92,
  reasoning: 'Patient mentioned cough for 5 days with productive sputum, suggesting bacterial infection. Amoxicillin is first-line for community-acquired infections.',
  createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
  displayText: 'Amoxicillin 500mg TID x 10 days',
  displaySubtext: 'Based on symptoms of productive cough with suspected bacterial URI',
  content: {
    type: 'new-item',
    category: 'medication',
    itemTemplate: {
      displayText: 'Amoxicillin 500mg',
      displaySubtext: '1 capsule PO TID for 10 days',
    },
  },
};

const mockDxLink: Suggestion = {
  id: 'sug-2',
  type: 'dx-association',
  status: 'active',
  source: 'ai-analysis',
  confidence: 0.85,
  reasoning: 'Patient symptoms and exam findings are consistent with acute upper respiratory infection.',
  createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
  displayText: 'Link diagnosis to medication',
  displaySubtext: 'Associate Amoxicillin with URI diagnosis',
  content: {
    type: 'dx-link',
    targetItemId: 'med-1',
    suggestedDx: [
      { description: 'Acute Upper Respiratory Infection', icdCode: 'J06.9', confidence: 0.92 },
      { description: 'Acute Sinusitis', icdCode: 'J01.90', confidence: 0.68 },
    ],
  },
};

const mockCorrection: Suggestion = {
  id: 'sug-3',
  type: 'correction',
  status: 'active',
  source: 'cds',
  confidence: 0.95,
  reasoning: 'Standard adult dosing for Amoxicillin for URI is 500mg TID, not 250mg BID.',
  createdAt: new Date(Date.now() - 1 * 60 * 1000),
  displayText: 'Dosage correction',
  displaySubtext: 'Recommended dose adjustment for Amoxicillin',
  content: {
    type: 'correction',
    targetItemId: 'med-2',
    field: 'dosage',
    currentValue: '250mg BID',
    suggestedValue: '500mg TID',
  },
};

const mockCareGapAction: Suggestion = {
  id: 'sug-4',
  type: 'care-gap-action',
  status: 'active',
  source: 'care-gap',
  confidence: 0.88,
  reasoning: 'Patient with Type 2 Diabetes has not had an A1c in 8 months. Guidelines recommend every 6 months.',
  createdAt: new Date(Date.now() - 10 * 60 * 1000),
  displayText: 'Order Hemoglobin A1c',
  displaySubtext: 'Care gap: Last A1c was 8 months ago',
  content: {
    type: 'care-gap-action',
    careGapId: 'cg-1',
    actionTemplate: {
      displayText: 'Order: Hemoglobin A1c',
      displaySubtext: 'Routine monitoring for diabetes',
    },
  },
};

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta<typeof SuggestionCard> = {
  title: 'Suggestions/SuggestionCard',
  component: SuggestionCard,
  tags: ['autodocs'],
  args: {
    onAccept: fn(),
    onAcceptWithChanges: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NewMedication: Story = {
  name: 'New Medication',
  args: {
    suggestion: mockMedication,
    transcriptExcerpt: "...been coughing for about five days now, it's a wet cough with some yellowish sputum...",
  },
};

export const DiagnosisLink: Story = {
  name: 'Diagnosis Link',
  args: {
    suggestion: mockDxLink,
  },
};

export const Correction: Story = {
  name: 'Dosage Correction',
  args: {
    suggestion: mockCorrection,
  },
};

export const CareGapAction: Story = {
  name: 'Care Gap Action',
  args: {
    suggestion: mockCareGapAction,
  },
};

export const WithoutTranscript: Story = {
  name: 'Without Transcript',
  args: {
    suggestion: mockMedication,
    showTranscript: false,
  },
};

export const SuggestionFeed: Story = {
  name: 'Suggestion Feed',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '550px' }}>
      <SuggestionCard
        suggestion={mockMedication}
        onAccept={fn()}
        onAcceptWithChanges={fn()}
        onDismiss={fn()}
        transcriptExcerpt="...coughing for about five days, wet cough with yellowish sputum..."
      />
      <SuggestionCard
        suggestion={mockDxLink}
        onAccept={fn()}
        onAcceptWithChanges={fn()}
        onDismiss={fn()}
      />
      <SuggestionCard
        suggestion={mockCareGapAction}
        onAccept={fn()}
        onAcceptWithChanges={fn()}
        onDismiss={fn()}
      />
    </div>
  ),
};
