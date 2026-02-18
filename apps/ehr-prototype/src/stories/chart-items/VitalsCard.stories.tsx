import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { VitalsCard } from '../../components/chart-items/VitalsCard';
import type { VitalsItem } from '../../types/chart-items';
import { colors } from '../../styles/foundations';
import { fn } from 'storybook/test';

// ============================================================================
// Mock Data
// ============================================================================

const baseMeta = {
  syncStatus: 'synced' as const,
  aiGenerated: false,
  requiresReview: false,
  reviewed: true,
};

const baseItem = {
  createdAt: new Date('2024-01-15T10:30:00'),
  createdBy: { id: 'nurse-1', name: 'J. Martinez, RN', role: 'nurse' as const },
  modifiedAt: new Date('2024-01-15T10:30:00'),
  modifiedBy: { id: 'nurse-1', name: 'J. Martinez, RN', role: 'nurse' as const },
  source: { type: 'manual' as const },
  linkedDiagnoses: [],
  linkedEncounters: ['enc-1'],
  activityLog: [],
  tags: [] as any[],
};

const mockNormal: VitalsItem = {
  ...baseItem,
  id: 'vitals-1',
  category: 'vitals',
  status: 'confirmed',
  displayText: 'Vitals',
  _meta: baseMeta,
  data: {
    capturedAt: new Date('2024-01-15T10:30:00'),
    position: 'sitting',
    measurements: [
      { type: 'bp-systolic', value: 120, unit: 'mmHg', flag: 'normal' },
      { type: 'bp-diastolic', value: 78, unit: 'mmHg', flag: 'normal' },
      { type: 'pulse', value: 72, unit: 'bpm', flag: 'normal' },
      { type: 'temp', value: 98.6, unit: '°F', flag: 'normal' },
      { type: 'resp', value: 16, unit: '/min', flag: 'normal' },
      { type: 'spo2', value: 98, unit: '%', flag: 'normal' },
    ],
  },
};

const mockHypertensive: VitalsItem = {
  ...baseItem,
  id: 'vitals-2',
  category: 'vitals',
  status: 'confirmed',
  displayText: 'Vitals',
  _meta: baseMeta,
  data: {
    capturedAt: new Date('2024-01-15T10:30:00'),
    position: 'sitting',
    measurements: [
      { type: 'bp-systolic', value: 158, unit: 'mmHg', flag: 'high' },
      { type: 'bp-diastolic', value: 98, unit: 'mmHg', flag: 'high' },
      { type: 'pulse', value: 88, unit: 'bpm', flag: 'normal' },
      { type: 'temp', value: 98.4, unit: '°F', flag: 'normal' },
      { type: 'resp', value: 18, unit: '/min', flag: 'normal' },
      { type: 'spo2', value: 97, unit: '%', flag: 'normal' },
    ],
  },
};

const mockCritical: VitalsItem = {
  ...baseItem,
  id: 'vitals-3',
  category: 'vitals',
  status: 'confirmed',
  displayText: 'Vitals',
  _meta: baseMeta,
  data: {
    capturedAt: new Date('2024-01-15T10:30:00'),
    position: 'supine',
    measurements: [
      { type: 'bp-systolic', value: 82, unit: 'mmHg', flag: 'critical' },
      { type: 'bp-diastolic', value: 55, unit: 'mmHg', flag: 'critical' },
      { type: 'pulse', value: 120, unit: 'bpm', flag: 'high' },
      { type: 'temp', value: 101.4, unit: '°F', flag: 'high' },
      { type: 'resp', value: 24, unit: '/min', flag: 'high' },
      { type: 'spo2', value: 89, unit: '%', flag: 'critical' },
    ],
  },
};

const mockPediatric: VitalsItem = {
  ...baseItem,
  id: 'vitals-4',
  category: 'vitals',
  status: 'confirmed',
  displayText: 'Vitals',
  _meta: baseMeta,
  data: {
    capturedAt: new Date('2024-01-15T10:30:00'),
    position: 'sitting',
    measurements: [
      { type: 'bp-systolic', value: 100, unit: 'mmHg', flag: 'normal' },
      { type: 'bp-diastolic', value: 65, unit: 'mmHg', flag: 'normal' },
      { type: 'pulse', value: 95, unit: 'bpm', flag: 'normal' },
      { type: 'temp', value: 99.1, unit: '°F', flag: 'normal' },
      { type: 'resp', value: 20, unit: '/min', flag: 'normal' },
      { type: 'spo2', value: 99, unit: '%', flag: 'normal' },
      { type: 'weight', value: 55, unit: 'lbs', flag: 'normal' },
      { type: 'height', value: 48, unit: 'in', flag: 'normal' },
    ],
  },
};

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta<typeof VitalsCard> = {
  title: 'Chart Items/VitalsCard',
  component: VitalsCard,
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

export const NormalVitals: Story = {
  name: 'Normal Vitals',
  args: {
    vitals: mockNormal,
    variant: 'expanded',
  },
};

export const Hypertensive: Story = {
  name: 'Hypertensive (Abnormal)',
  args: {
    vitals: mockHypertensive,
    variant: 'expanded',
  },
};

export const CriticalVitals: Story = {
  name: 'Critical Vitals',
  args: {
    vitals: mockCritical,
    variant: 'expanded',
  },
};

export const CompactNormal: Story = {
  name: 'Compact - Normal',
  args: {
    vitals: mockNormal,
    variant: 'compact',
  },
};

export const CompactAbnormal: Story = {
  name: 'Compact - Abnormal',
  args: {
    vitals: mockHypertensive,
    variant: 'compact',
  },
};

export const Pediatric: Story = {
  name: 'Pediatric (with Height/Weight)',
  args: {
    vitals: mockPediatric,
    variant: 'expanded',
  },
};

export const VitalsTimeline: Story = {
  name: 'Vitals Timeline',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px' }}>
      <div style={{ fontSize: '12px', color: colors.fg.neutral.spotReadable, padding: '4px 0' }}>Today, 10:30 AM</div>
      <VitalsCard vitals={mockHypertensive} variant="compact" onSelect={fn()} />
      <div style={{ fontSize: '12px', color: colors.fg.neutral.spotReadable, padding: '4px 0' }}>Today, 9:00 AM</div>
      <VitalsCard vitals={mockNormal} variant="compact" onSelect={fn()} />
    </div>
  ),
};
