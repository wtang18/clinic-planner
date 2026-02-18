import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DiagnosisCard } from '../../components/chart-items/DiagnosisCard';
import type { DiagnosisItem, ChartItem } from '../../types/chart-items';
import { fn } from 'storybook/test';

// ============================================================================
// Mock Data
// ============================================================================

const baseMeta = {
  syncStatus: 'synced' as const,
  aiGenerated: false,
  requiresReview: false,
  reviewed: false,
};

const baseItem = {
  createdAt: new Date('2024-01-15T10:30:00'),
  createdBy: { id: 'dr-1', name: 'Dr. Smith', role: 'provider' as const },
  modifiedAt: new Date('2024-01-15T10:30:00'),
  modifiedBy: { id: 'dr-1', name: 'Dr. Smith', role: 'provider' as const },
  source: { type: 'manual' as const },
  linkedDiagnoses: [],
  linkedEncounters: ['enc-1'],
  tags: [] as any[],
  activityLog: [],
};

const mockURI: DiagnosisItem = {
  ...baseItem,
  id: 'dx-1',
  category: 'diagnosis',
  status: 'confirmed',
  displayText: 'Acute Upper Respiratory Infection',
  _meta: baseMeta,
  data: {
    description: 'Acute Upper Respiratory Infection',
    icdCode: 'J06.9',
    type: 'encounter',
    ranking: 'primary',
    clinicalStatus: 'active',
    onsetDate: new Date('2024-01-12'),
  },
};

const mockDiabetes: DiagnosisItem = {
  ...baseItem,
  id: 'dx-2',
  category: 'diagnosis',
  status: 'confirmed',
  displayText: 'Type 2 Diabetes Mellitus',
  _meta: baseMeta,
  data: {
    description: 'Type 2 Diabetes Mellitus without complications',
    icdCode: 'E11.9',
    type: 'chronic',
    ranking: 'secondary',
    clinicalStatus: 'active',
    onsetDate: new Date('2020-03-15'),
  },
};

const mockResolved: DiagnosisItem = {
  ...baseItem,
  id: 'dx-3',
  category: 'diagnosis',
  status: 'completed',
  displayText: 'Acute Bronchitis',
  _meta: baseMeta,
  data: {
    description: 'Acute Bronchitis',
    icdCode: 'J20.9',
    type: 'encounter',
    clinicalStatus: 'resolved',
    onsetDate: new Date('2023-11-01'),
    resolvedDate: new Date('2023-11-15'),
  },
};

const mockAISuggested: DiagnosisItem = {
  ...baseItem,
  id: 'dx-4',
  category: 'diagnosis',
  status: 'pending-review',
  displayText: 'Cough',
  source: { type: 'aiSuggestion' as const },
  _meta: {
    syncStatus: 'synced' as const,
    aiGenerated: true,
    aiConfidence: 0.78,
    requiresReview: true,
    reviewed: false,
  },
  data: {
    description: 'Cough',
    icdCode: 'R05.9',
    type: 'encounter',
    clinicalStatus: 'active',
  },
};

const mockLinkedItems: ChartItem[] = [
  {
    ...baseItem,
    id: 'med-1',
    category: 'medication',
    status: 'confirmed',
    displayText: 'Amoxicillin 500mg',
    tags: [],
    _meta: baseMeta,
    data: {} as any,
    actions: [],
  },
  {
    ...baseItem,
    id: 'lab-1',
    category: 'lab',
    status: 'completed',
    displayText: 'Rapid Strep Test',
    tags: [],
    _meta: baseMeta,
    data: {} as any,
  },
];

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta<typeof DiagnosisCard> = {
  title: 'Chart Items/DiagnosisCard',
  component: DiagnosisCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['compact', 'expanded'],
      description: 'Display density',
    },
    selected: {
      control: 'boolean',
      description: 'Selected state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  name: 'Primary Diagnosis',
  args: {
    diagnosis: mockURI,
    variant: 'compact',
  },
};

export const Chronic: Story = {
  name: 'Chronic Condition',
  args: {
    diagnosis: mockDiabetes,
    variant: 'compact',
  },
};

export const Resolved: Story = {
  args: {
    diagnosis: mockResolved,
    variant: 'compact',
  },
};

export const AISuggested: Story = {
  name: 'AI Suggested',
  args: {
    diagnosis: mockAISuggested,
    variant: 'compact',
    onEdit: fn(),
  },
};

export const ExpandedWithLinks: Story = {
  name: 'Expanded with Linked Items',
  args: {
    diagnosis: mockURI,
    variant: 'expanded',
    linkedItems: mockLinkedItems,
    onEdit: fn(),
  },
};

export const DiagnosisList: Story = {
  name: 'Diagnosis List',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px' }}>
      <DiagnosisCard diagnosis={mockURI} variant="compact" />
      <DiagnosisCard diagnosis={mockDiabetes} variant="compact" />
      <DiagnosisCard diagnosis={mockAISuggested} variant="compact" />
      <DiagnosisCard diagnosis={mockResolved} variant="compact" />
    </div>
  ),
};
