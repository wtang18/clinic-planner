import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ChartItemCard } from '../../components/chart-items/ChartItemCard';
import type { ChartItem } from '../../types/chart-items';
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
  activityLog: [],
};

const mockMedication: ChartItem = {
  ...baseItem,
  id: 'med-1',
  category: 'medication',
  status: 'confirmed',
  displayText: 'Amoxicillin 500mg',
  displaySubtext: 'Take 1 capsule PO TID for 10 days',
  tags: [
    { label: 'Medication', type: 'category' },
    { label: 'E-Prescribed', type: 'workflow' },
  ],
  _meta: baseMeta,
  data: {} as any,
  actions: [],
};

const mockLab: ChartItem = {
  ...baseItem,
  id: 'lab-1',
  category: 'lab',
  status: 'completed',
  displayText: 'CBC with Differential',
  displaySubtext: 'Resulted: Jan 15, 2024',
  tags: [
    { label: 'Lab', type: 'category' },
    { label: 'Quest', type: 'source' },
    { label: 'WBC High', type: 'alert' },
  ],
  _meta: baseMeta,
  data: {} as any,
};

const mockDiagnosis: ChartItem = {
  ...baseItem,
  id: 'dx-1',
  category: 'diagnosis',
  status: 'confirmed',
  displayText: 'Acute Upper Respiratory Infection',
  displaySubtext: 'ICD-10: J06.9',
  tags: [
    { label: 'Diagnosis', type: 'category' },
    { label: 'Primary', type: 'status' },
  ],
  _meta: baseMeta,
  data: {} as any,
};

const mockAISuggestion: ChartItem = {
  ...baseItem,
  id: 'ai-1',
  category: 'medication',
  status: 'pending-review',
  displayText: 'Ibuprofen 400mg PRN',
  displaySubtext: 'Take 1 tablet every 6 hours as needed for pain',
  tags: [
    { label: 'AI Suggested', type: 'ai' },
    { label: 'Needs Review', type: 'ai' },
  ],
  source: { type: 'aiSuggestion' as const },
  _meta: {
    syncStatus: 'synced' as const,
    aiGenerated: true,
    aiConfidence: 0.85,
    requiresReview: true,
    reviewed: false,
  },
  data: {} as any,
  actions: [],
};

const mockVitals: ChartItem = {
  ...baseItem,
  id: 'vitals-1',
  category: 'vitals',
  status: 'confirmed',
  displayText: 'Vitals - 10:30 AM',
  displaySubtext: 'BP 138/88, HR 78, Temp 98.6°F',
  tags: [
    { label: 'Vitals', type: 'category' },
    { label: 'BP High', type: 'alert' },
  ],
  _meta: baseMeta,
  data: {} as any,
};

const mockImaging: ChartItem = {
  ...baseItem,
  id: 'img-1',
  category: 'imaging',
  status: 'ordered',
  displayText: 'Chest X-ray PA/Lateral',
  displaySubtext: 'Rule out pneumonia',
  tags: [
    { label: 'Imaging', type: 'category' },
    { label: 'Ordered', type: 'status' },
  ],
  _meta: baseMeta,
  data: {} as any,
};

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta<typeof ChartItemCard> = {
  title: 'Chart Items/ChartItemCard',
  component: ChartItemCard,
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
    showActions: {
      control: 'boolean',
      description: 'Show edit/delete actions',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Medication: Story = {
  args: {
    item: mockMedication,
    variant: 'compact',
  },
};

export const MedicationExpanded: Story = {
  name: 'Medication (Expanded)',
  args: {
    item: mockMedication,
    variant: 'expanded',
  },
};

export const Lab: Story = {
  args: {
    item: mockLab,
    variant: 'compact',
  },
};

export const Diagnosis: Story = {
  args: {
    item: mockDiagnosis,
    variant: 'compact',
  },
};

export const Vitals: Story = {
  args: {
    item: mockVitals,
    variant: 'compact',
  },
};

export const Imaging: Story = {
  args: {
    item: mockImaging,
    variant: 'compact',
  },
};

export const AISuggested: Story = {
  name: 'AI Suggested',
  args: {
    item: mockAISuggestion,
    variant: 'expanded',
  },
};

export const WithActions: Story = {
  name: 'With Actions',
  args: {
    item: mockMedication,
    variant: 'compact',
    showActions: true,
    onEdit: fn(),
    onDelete: fn(),
  },
};

export const Selected: Story = {
  args: {
    item: mockMedication,
    variant: 'compact',
    selected: true,
    onSelect: fn(),
  },
};

export const AllCategories: Story = {
  name: 'All Categories',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px' }}>
      <ChartItemCard item={mockMedication} />
      <ChartItemCard item={mockLab} />
      <ChartItemCard item={mockDiagnosis} />
      <ChartItemCard item={mockVitals} />
      <ChartItemCard item={mockImaging} />
      <ChartItemCard item={mockAISuggestion} />
    </div>
  ),
};
