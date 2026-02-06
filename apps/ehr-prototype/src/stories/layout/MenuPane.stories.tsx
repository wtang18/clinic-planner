import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { MenuPane } from '../../components/layout/MenuPane';
import { fn } from 'storybook/test';

const meta: Meta<typeof MenuPane> = {
  title: 'Layout/MenuPane',
  component: MenuPane,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The MenuPane provides navigation structure with:

- **Hubs**: Home and Visits for global navigation
- **Workspaces**: Agent, To Do, and My Patients
- **Patient Workspaces**: Expandable tree showing active patients with their tasks and visits

The menu is 200px wide and collapses completely (not to an icon-only state).
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 200, height: 500, backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockPatientWorkspaces = [
  {
    id: 'p1',
    name: 'John Smith',
    initials: 'JS',
    avatarColor: '#3B82F6',
    tasks: [
      { id: 't1', title: 'Urgent Care Visit', type: 'urgent' as const },
      { id: 't2', title: 'Sign Off Chart', type: 'signoff' as const },
    ],
    currentVisit: 'Cough',
  },
  {
    id: 'p2',
    name: 'Maria Garcia',
    initials: 'MG',
    avatarColor: '#10B981',
    tasks: [
      { id: 't3', title: 'Follow-up Review', type: 'routine' as const },
    ],
    currentVisit: 'Diabetes Management',
  },
];

export const Default: Story = {
  args: {
    patientWorkspaces: mockPatientWorkspaces,
    todoCount: 12,
    onNavItemSelect: fn(),
    onPatientSelect: fn(),
    onTaskSelect: fn(),
  },
};

export const WithSelectedItem: Story = {
  name: 'With Selected Item',
  args: {
    patientWorkspaces: mockPatientWorkspaces,
    todoCount: 5,
    selectedItemId: 'todo',
    onNavItemSelect: fn(),
  },
};

export const NoPatients: Story = {
  name: 'No Patient Workspaces',
  args: {
    patientWorkspaces: [],
    todoCount: 0,
    onNavItemSelect: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Menu when no patients are currently open in workspaces.',
      },
    },
  },
};

export const ManyTasks: Story = {
  name: 'High Task Count',
  args: {
    patientWorkspaces: mockPatientWorkspaces,
    todoCount: 99,
    onNavItemSelect: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge shows "99+" when count exceeds 99.',
      },
    },
  },
};
