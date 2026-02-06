import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { MedicationCard } from '../../components/chart-items/MedicationCard';
import type { MedicationItem } from '../../types/chart-items';
import { fn } from 'storybook/test';

// ============================================================================
// Mock Data
// ============================================================================

const baseMeta = {
  syncStatus: 'synced' as const,
  aiGenerated: false,
  requiresReview: false,
};

const baseItem = {
  createdAt: new Date('2024-01-15T10:30:00'),
  createdBy: { id: 'dr-1', name: 'Dr. Smith', role: 'physician' as const },
  modifiedAt: new Date('2024-01-15T10:30:00'),
  modifiedBy: { id: 'dr-1', name: 'Dr. Smith', role: 'physician' as const },
  source: { type: 'manual' as const },
  linkedDiagnoses: ['dx-1'],
  linkedEncounters: ['enc-1'],
  tags: [] as any[],
};

const mockAmoxicillin: MedicationItem = {
  ...baseItem,
  id: 'med-1',
  category: 'medication',
  status: 'confirmed',
  displayText: 'Amoxicillin 500mg',
  displaySubtext: '1 capsule PO TID x 10 days',
  _meta: baseMeta,
  data: {
    drugName: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    dosage: '500mg',
    route: 'PO',
    frequency: 'TID',
    duration: '10 days',
    quantity: 30,
    refills: 0,
    isControlled: false,
    prescriptionType: 'new',
    pharmacy: { id: 'pharm-1', name: 'CVS Pharmacy - Main St' },
  },
  actions: ['e-prescribe', 'modify', 'cancel'],
};

const mockControlled: MedicationItem = {
  ...baseItem,
  id: 'med-2',
  category: 'medication',
  status: 'pending-review',
  displayText: 'Alprazolam 0.5mg',
  displaySubtext: '1 tablet PO BID PRN anxiety',
  _meta: { ...baseMeta, requiresReview: true },
  data: {
    drugName: 'Alprazolam 0.5mg',
    genericName: 'Alprazolam',
    dosage: '0.5mg',
    route: 'PO',
    frequency: 'BID PRN',
    quantity: 60,
    refills: 0,
    isControlled: true,
    controlSchedule: 'IV',
    prescriptionType: 'new',
  },
  actions: ['print', 'modify', 'cancel'],
};

const mockAISuggested: MedicationItem = {
  ...baseItem,
  id: 'med-3',
  category: 'medication',
  status: 'pending-review',
  displayText: 'Ibuprofen 400mg',
  displaySubtext: '1 tablet PO Q6H PRN pain',
  source: { type: 'ai-generated' as const },
  _meta: {
    syncStatus: 'synced' as const,
    aiGenerated: true,
    aiConfidence: 0.92,
    requiresReview: true,
  },
  data: {
    drugName: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    dosage: '400mg',
    route: 'PO',
    frequency: 'Q6H PRN',
    duration: '7 days',
    quantity: 28,
    refills: 0,
    isControlled: false,
    prescriptionType: 'new',
  },
  actions: ['e-prescribe', 'modify', 'cancel'],
};

const mockDraft: MedicationItem = {
  ...baseItem,
  id: 'med-4',
  category: 'medication',
  status: 'draft',
  displayText: 'Metformin 500mg',
  displaySubtext: '1 tablet PO BID',
  _meta: baseMeta,
  data: {
    drugName: 'Metformin 500mg',
    genericName: 'Metformin',
    dosage: '500mg',
    route: 'PO',
    frequency: 'BID',
    isControlled: false,
    prescriptionType: 'new',
  },
  actions: ['e-prescribe', 'modify', 'cancel'],
};

const mockSent: MedicationItem = {
  ...baseItem,
  id: 'med-5',
  category: 'medication',
  status: 'ordered',
  displayText: 'Lisinopril 10mg',
  displaySubtext: '1 tablet PO daily',
  _meta: baseMeta,
  data: {
    drugName: 'Lisinopril 10mg',
    genericName: 'Lisinopril',
    dosage: '10mg',
    route: 'PO',
    frequency: 'daily',
    quantity: 30,
    refills: 3,
    isControlled: false,
    prescriptionType: 'new',
    pharmacy: { id: 'pharm-2', name: 'Walgreens - Oak Ave' },
  },
  actions: ['cancel'],
};

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta<typeof MedicationCard> = {
  title: 'Chart Items/MedicationCard',
  component: MedicationCard,
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

export const Compact: Story = {
  args: {
    medication: mockAmoxicillin,
    variant: 'compact',
  },
};

export const Expanded: Story = {
  args: {
    medication: mockAmoxicillin,
    variant: 'expanded',
    onPrescribe: fn(),
    onEdit: fn(),
  },
};

export const Controlled: Story = {
  name: 'Controlled Substance',
  args: {
    medication: mockControlled,
    variant: 'expanded',
    onEdit: fn(),
  },
};

export const AISuggested: Story = {
  name: 'AI Suggested',
  args: {
    medication: mockAISuggested,
    variant: 'expanded',
    onPrescribe: fn(),
    onEdit: fn(),
  },
};

export const Draft: Story = {
  args: {
    medication: mockDraft,
    variant: 'compact',
    onEdit: fn(),
  },
};

export const Sent: Story = {
  name: 'Sent (E-Prescribed)',
  args: {
    medication: mockSent,
    variant: 'expanded',
  },
};

export const MedicationList: Story = {
  name: 'Medication List',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px' }}>
      <MedicationCard medication={mockAmoxicillin} variant="compact" onEdit={fn()} />
      <MedicationCard medication={mockControlled} variant="compact" onEdit={fn()} />
      <MedicationCard medication={mockAISuggested} variant="compact" onEdit={fn()} />
      <MedicationCard medication={mockDraft} variant="compact" onEdit={fn()} />
      <MedicationCard medication={mockSent} variant="compact" />
    </div>
  ),
};
