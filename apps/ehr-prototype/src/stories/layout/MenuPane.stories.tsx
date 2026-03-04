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
- **To Do**: Collapsible task categories with filters
- **My Patients**: Registry views (All, High Risk, Chronic Care, Overdue Care) plus open patient workspaces

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
    onNavItemSelect: fn(),
    onCohortSelect: fn(),
    onPatientSelect: fn(),
    onTaskSelect: fn(),
    onWorkspaceClose: fn(),
  },
};

export const WithSelectedItem: Story = {
  name: 'With Selected Item',
  args: {
    patientWorkspaces: mockPatientWorkspaces,
    selectedCohortId: 'coh-diabetes',
    onNavItemSelect: fn(),
    onCohortSelect: fn(),
    onWorkspaceClose: fn(),
  },
};

export const NoPatients: Story = {
  name: 'No Open Workspaces',
  args: {
    patientWorkspaces: [],
    onNavItemSelect: fn(),
    onCohortSelect: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Menu with no open patient workspaces. Cohort tree remains visible under My Patients.',
      },
    },
  },
};

export const ManyTasks: Story = {
  name: 'High Task Count',
  args: {
    patientWorkspaces: mockPatientWorkspaces,
    onNavItemSelect: fn(),
    onCohortSelect: fn(),
    onWorkspaceClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge shows "99+" when count exceeds 99.',
      },
    },
  },
};
