import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { CareGapCard } from '../../components/care-gaps/CareGapCard';
import type { CareGapInstance } from '../../types/care-gaps';
import { fn } from 'storybook/test';

// ============================================================================
// Mock Data
// ============================================================================

const mockCriticalA1c: CareGapInstance = {
  id: 'cg-1',
  definitionId: 'def-a1c',
  patientId: 'pt-1',
  status: 'open',
  openedAt: new Date('2023-06-01'),
  dueBy: new Date('2023-12-01'),
  closureAttempts: [],
  excluded: false,
  addressedThisEncounter: false,
  encounterActions: [],
  _display: {
    name: 'Hemoglobin A1c',
    category: 'diabetes',
    priority: 'critical',
    actionLabel: 'Order A1c',
    dueLabel: 'Overdue by 30 days',
  },
};

const mockImportantEyeExam: CareGapInstance = {
  id: 'cg-2',
  definitionId: 'def-eye',
  patientId: 'pt-1',
  status: 'open',
  openedAt: new Date('2023-01-15'),
  dueBy: new Date('2024-01-15'),
  closureAttempts: [],
  excluded: false,
  addressedThisEncounter: false,
  encounterActions: [],
  _display: {
    name: 'Diabetic Eye Exam',
    category: 'diabetes',
    priority: 'important',
    actionLabel: 'Order Referral',
    dueLabel: 'Due in 15 days',
  },
};

const mockRoutineFlu: CareGapInstance = {
  id: 'cg-3',
  definitionId: 'def-flu',
  patientId: 'pt-1',
  status: 'open',
  openedAt: new Date('2024-09-01'),
  dueBy: new Date('2024-11-30'),
  closureAttempts: [],
  excluded: false,
  addressedThisEncounter: false,
  encounterActions: [],
  _display: {
    name: 'Influenza Vaccination',
    category: 'immunization',
    priority: 'routine',
    actionLabel: 'Administer Vaccine',
    dueLabel: 'Due in 60 days',
  },
};

const mockPending: CareGapInstance = {
  id: 'cg-4',
  definitionId: 'def-colon',
  patientId: 'pt-1',
  status: 'pending',
  statusReason: 'Colonoscopy scheduled for Feb 1',
  openedAt: new Date('2023-06-01'),
  closureAttempts: [
    { attemptedAt: new Date('2024-01-10'), itemId: 'ref-1', successful: false, reason: 'Rescheduled by patient' },
  ],
  excluded: false,
  addressedThisEncounter: true,
  encounterActions: ['ref-2'],
  _display: {
    name: 'Colorectal Cancer Screening',
    category: 'cancer-screening',
    priority: 'important',
    actionLabel: 'Order Colonoscopy',
    dueLabel: 'Pending completion',
  },
};

const mockClosed: CareGapInstance = {
  id: 'cg-5',
  definitionId: 'def-mammogram',
  patientId: 'pt-1',
  status: 'closed',
  openedAt: new Date('2023-01-01'),
  closedAt: new Date('2024-01-10'),
  closureAttempts: [],
  closedBy: { itemId: 'img-1', itemType: 'imaging', method: 'automatic' },
  excluded: false,
  addressedThisEncounter: false,
  encounterActions: [],
  _display: {
    name: 'Mammogram',
    category: 'cancer-screening',
    priority: 'routine',
    actionLabel: 'Order Mammogram',
    dueLabel: 'Closed Jan 10',
  },
};

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta<typeof CareGapCard> = {
  title: 'Care Gaps/CareGapCard',
  component: CareGapCard,
  tags: ['autodocs'],
  argTypes: {
    compact: {
      control: 'boolean',
      description: 'Compact display mode',
    },
  },
  args: {
    onAction: fn(),
    onExclude: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CriticalPriority: Story = {
  name: 'Critical Priority',
  args: {
    gap: mockCriticalA1c,
  },
};

export const ImportantPriority: Story = {
  name: 'Important Priority',
  args: {
    gap: mockImportantEyeExam,
  },
};

export const RoutinePriority: Story = {
  name: 'Routine Priority',
  args: {
    gap: mockRoutineFlu,
  },
};

export const PendingStatus: Story = {
  name: 'Pending Status',
  args: {
    gap: mockPending,
  },
};

export const ClosedStatus: Story = {
  name: 'Closed',
  args: {
    gap: mockClosed,
  },
};

export const CompactMode: Story = {
  name: 'Compact Mode',
  args: {
    gap: mockCriticalA1c,
    compact: true,
  },
};

export const CareGapList: Story = {
  name: 'Care Gap List',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px' }}>
      <CareGapCard gap={mockCriticalA1c} onAction={fn()} onExclude={fn()} />
      <CareGapCard gap={mockImportantEyeExam} onAction={fn()} onExclude={fn()} />
      <CareGapCard gap={mockRoutineFlu} onAction={fn()} onExclude={fn()} />
      <CareGapCard gap={mockPending} onAction={fn()} onExclude={fn()} />
    </div>
  ),
};
