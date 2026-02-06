import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { LabCard } from '../../components/chart-items/LabCard';
import type { LabItem } from '../../types/chart-items';
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
  linkedDiagnoses: [],
  linkedEncounters: ['enc-1'],
  tags: [] as any[],
};

const mockCBC: LabItem = {
  ...baseItem,
  id: 'lab-1',
  category: 'lab',
  status: 'completed',
  displayText: 'CBC with Differential',
  _meta: baseMeta,
  data: {
    testName: 'Complete Blood Count',
    panelName: 'CBC with Differential',
    priority: 'routine',
    collectionType: 'send-out',
    labVendor: 'Quest Diagnostics',
    orderStatus: 'resulted',
    resultedAt: new Date('2024-01-15T14:00:00'),
    results: [
      { component: 'WBC', value: '12.5', unit: 'K/uL', referenceRange: '4.5-11.0', flag: 'high' },
      { component: 'RBC', value: '4.8', unit: 'M/uL', referenceRange: '4.5-5.5', flag: 'normal' },
      { component: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '13.5-17.5', flag: 'normal' },
      { component: 'Hematocrit', value: '42.1', unit: '%', referenceRange: '38.0-50.0', flag: 'normal' },
      { component: 'Platelets', value: '245', unit: 'K/uL', referenceRange: '150-400', flag: 'normal' },
    ],
  },
};

const mockBMP: LabItem = {
  ...baseItem,
  id: 'lab-2',
  category: 'lab',
  status: 'completed',
  displayText: 'Basic Metabolic Panel',
  _meta: baseMeta,
  data: {
    testName: 'Basic Metabolic Panel',
    panelName: 'BMP',
    priority: 'routine',
    collectionType: 'in-house',
    orderStatus: 'resulted',
    resultedAt: new Date('2024-01-15T13:30:00'),
    results: [
      { component: 'Glucose', value: '105', unit: 'mg/dL', referenceRange: '70-100', flag: 'high' },
      { component: 'BUN', value: '18', unit: 'mg/dL', referenceRange: '7-20', flag: 'normal' },
      { component: 'Creatinine', value: '1.1', unit: 'mg/dL', referenceRange: '0.7-1.3', flag: 'normal' },
      { component: 'Sodium', value: '140', unit: 'mEq/L', referenceRange: '136-145', flag: 'normal' },
      { component: 'Potassium', value: '4.2', unit: 'mEq/L', referenceRange: '3.5-5.0', flag: 'normal' },
    ],
  },
};

const mockCritical: LabItem = {
  ...baseItem,
  id: 'lab-3',
  category: 'lab',
  status: 'completed',
  displayText: 'A1c',
  _meta: baseMeta,
  data: {
    testName: 'Hemoglobin A1c',
    priority: 'routine',
    collectionType: 'in-house',
    orderStatus: 'resulted',
    resultedAt: new Date('2024-01-15T12:00:00'),
    results: [
      { component: 'Hemoglobin A1c', value: '9.8', unit: '%', referenceRange: '4.0-5.6', flag: 'critical' },
    ],
  },
};

const mockOrdered: LabItem = {
  ...baseItem,
  id: 'lab-4',
  category: 'lab',
  status: 'confirmed',
  displayText: 'Lipid Panel',
  _meta: baseMeta,
  data: {
    testName: 'Lipid Panel',
    priority: 'routine',
    collectionType: 'send-out',
    labVendor: 'Quest Diagnostics',
    orderStatus: 'ordered',
  },
};

const mockStat: LabItem = {
  ...baseItem,
  id: 'lab-5',
  category: 'lab',
  status: 'confirmed',
  displayText: 'Troponin',
  _meta: baseMeta,
  data: {
    testName: 'Troponin I',
    priority: 'stat',
    collectionType: 'in-house',
    orderStatus: 'processing',
    collectedAt: new Date('2024-01-15T10:35:00'),
  },
};

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta<typeof LabCard> = {
  title: 'Chart Items/LabCard',
  component: LabCard,
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

export const NormalResults: Story = {
  name: 'Normal Results (BMP)',
  args: {
    lab: mockBMP,
    variant: 'expanded',
    onViewResults: fn(),
  },
};

export const AbnormalResults: Story = {
  name: 'Abnormal Results (CBC)',
  args: {
    lab: mockCBC,
    variant: 'expanded',
    onViewResults: fn(),
  },
};

export const CriticalResults: Story = {
  name: 'Critical Result (A1c)',
  args: {
    lab: mockCritical,
    variant: 'expanded',
    onViewResults: fn(),
  },
};

export const Ordered: Story = {
  name: 'Pending Order',
  args: {
    lab: mockOrdered,
    variant: 'compact',
  },
};

export const StatOrder: Story = {
  name: 'STAT Order',
  args: {
    lab: mockStat,
    variant: 'compact',
  },
};

export const CompactWithAbnormal: Story = {
  name: 'Compact (Abnormal)',
  args: {
    lab: mockCBC,
    variant: 'compact',
  },
};

export const LabList: Story = {
  name: 'Lab Results List',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px' }}>
      <LabCard lab={mockCritical} variant="compact" />
      <LabCard lab={mockCBC} variant="compact" />
      <LabCard lab={mockBMP} variant="compact" />
      <LabCard lab={mockOrdered} variant="compact" />
      <LabCard lab={mockStat} variant="compact" />
    </div>
  ),
};
