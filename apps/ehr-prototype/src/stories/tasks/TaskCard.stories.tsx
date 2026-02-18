import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { TaskCard } from '../../components/tasks/TaskCard';
import type { BackgroundTask } from '../../types/suggestions';
import { fn } from 'storybook/test';

// ============================================================================
// Mock Data
// ============================================================================

const mockQueued: BackgroundTask = {
  id: 'task-1',
  type: 'drug-interaction',
  status: 'queued',
  priority: 'normal',
  trigger: { action: 'medication-added', itemId: 'med-1' },
  createdAt: new Date(Date.now() - 30 * 1000),
  displayTitle: 'Drug Interaction Check',
  displayStatus: 'Queued',
};

const mockProcessing: BackgroundTask = {
  id: 'task-2',
  type: 'note-generation',
  status: 'processing',
  priority: 'low',
  trigger: { action: 'encounter-review' },
  progress: 45,
  progressMessage: 'Generating clinical note from encounter data...',
  createdAt: new Date(Date.now() - 60 * 1000),
  startedAt: new Date(Date.now() - 30 * 1000),
  displayTitle: 'Generate Visit Note',
  displayStatus: 'Processing',
};

const mockPendingReview: BackgroundTask = {
  id: 'task-3',
  type: 'dx-association',
  status: 'pending-review',
  priority: 'normal',
  trigger: { action: 'medication-added', itemId: 'med-1' },
  result: {
    suggestions: [
      { description: 'Acute URI', icdCode: 'J06.9', confidence: 0.92 },
    ],
  },
  createdAt: new Date(Date.now() - 120 * 1000),
  startedAt: new Date(Date.now() - 90 * 1000),
  completedAt: new Date(Date.now() - 60 * 1000),
  displayTitle: 'Diagnosis Association',
  displayStatus: 'Needs Review',
};

const mockReady: BackgroundTask = {
  id: 'task-4',
  type: 'rx-send',
  status: 'ready',
  priority: 'high',
  trigger: { action: 'prescribe', itemId: 'med-1' },
  result: 'Prescription validated. Ready to send to CVS Pharmacy.',
  createdAt: new Date(Date.now() - 180 * 1000),
  startedAt: new Date(Date.now() - 150 * 1000),
  completedAt: new Date(Date.now() - 120 * 1000),
  displayTitle: 'E-Prescribe: Amoxicillin 500mg',
  displayStatus: 'Ready to Send',
};

const mockCompleted: BackgroundTask = {
  id: 'task-5',
  type: 'lab-send',
  status: 'completed',
  priority: 'normal',
  trigger: { action: 'order-lab', itemId: 'lab-1' },
  createdAt: new Date(Date.now() - 300 * 1000),
  startedAt: new Date(Date.now() - 270 * 1000),
  completedAt: new Date(Date.now() - 240 * 1000),
  displayTitle: 'Lab Order: CBC w/ Diff',
  displayStatus: 'Sent',
};

const mockFailed: BackgroundTask = {
  id: 'task-6',
  type: 'rx-send',
  status: 'failed',
  priority: 'high',
  trigger: { action: 'prescribe', itemId: 'med-2' },
  error: 'Connection to pharmacy network timed out. Please retry.',
  createdAt: new Date(Date.now() - 240 * 1000),
  startedAt: new Date(Date.now() - 210 * 1000),
  displayTitle: 'E-Prescribe: Lisinopril 10mg',
  displayStatus: 'Failed',
};

const mockDrugInteraction: BackgroundTask = {
  id: 'task-7',
  type: 'drug-interaction',
  status: 'pending-review',
  priority: 'urgent',
  trigger: { action: 'medication-added', itemId: 'med-3' },
  result: 'Warning: Potential interaction between Warfarin and Amoxicillin. May increase INR.',
  createdAt: new Date(Date.now() - 60 * 1000),
  startedAt: new Date(Date.now() - 45 * 1000),
  completedAt: new Date(Date.now() - 30 * 1000),
  displayTitle: 'Drug Interaction Warning',
  displayStatus: 'Review Required',
};

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta<typeof TaskCard> = {
  title: 'Tasks/TaskCard',
  component: TaskCard,
  tags: ['autodocs'],
  argTypes: {
    compact: {
      control: 'boolean',
      description: 'Compact display mode',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Queued: Story = {
  args: {
    task: mockQueued,
  },
};

export const Processing: Story = {
  args: {
    task: mockProcessing,
    onCancel: fn(),
  },
};

export const PendingReview: Story = {
  name: 'Pending Review',
  args: {
    task: mockPendingReview,
    onApprove: fn(),
    onReject: fn(),
  },
};

export const ReadyToSend: Story = {
  name: 'Ready to Send',
  args: {
    task: mockReady,
    onApprove: fn(),
    onReject: fn(),
  },
};

export const Completed: Story = {
  args: {
    task: mockCompleted,
  },
};

export const Failed: Story = {
  args: {
    task: mockFailed,
    onRetry: fn(),
  },
};

export const DrugInteraction: Story = {
  name: 'Drug Interaction Warning',
  args: {
    task: mockDrugInteraction,
    onApprove: fn(),
    onReject: fn(),
  },
};

export const CompactMode: Story = {
  name: 'Compact Mode',
  args: {
    task: mockProcessing,
    compact: true,
    onCancel: fn(),
  },
};

export const TaskQueue: Story = {
  name: 'Task Queue',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px' }}>
      <TaskCard task={mockDrugInteraction} onApprove={fn()} onReject={fn()} />
      <TaskCard task={mockReady} onApprove={fn()} onReject={fn()} />
      <TaskCard task={mockProcessing} onCancel={fn()} />
      <TaskCard task={mockQueued} />
      <TaskCard task={mockFailed} onRetry={fn()} />
      <TaskCard task={mockCompleted} />
    </div>
  ),
};
