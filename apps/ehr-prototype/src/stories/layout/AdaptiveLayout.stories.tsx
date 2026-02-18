import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AdaptiveLayout } from '../../components/layout/AdaptiveLayout';
import { MenuPane } from '../../components/layout/MenuPane';
import { PatientOverviewPane } from '../../components/layout/PatientOverviewPane';
import { CanvasPane } from '../../components/layout/CanvasPane';
import { EncounterContextBar } from '../../components/layout/EncounterContextBar';
import { colors, spaceAround } from '../../styles/foundations';

const meta: Meta<typeof AdaptiveLayout> = {
  title: 'Layout/AdaptiveLayout',
  component: AdaptiveLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The AdaptiveLayout implements a 3-pane architecture following iOS/iPadOS/macOS 26 conventions:

- **Menu Pane** (left, 200px): Navigation with hubs, workspaces, and patient workspaces
- **Patient Overview Pane** (left, 280px): Longitudinal patient data (allergies, meds, problems, vitals)
- **Canvas Pane** (center, flex): Main charting area with floating header

**Keyboard Shortcuts:**
- \`Cmd+\\\` - Toggle menu pane
- \`Cmd+Shift+\\\` - Toggle patient overview
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
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
];

const mockPatientOverview = {
  name: 'John Smith',
  mrn: '12345678',
  dob: '1985-03-15',
  age: 39,
  gender: 'Male',
  pronouns: 'he/him',
  allergies: [
    { id: 'a1', allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' as const },
    { id: 'a2', allergen: 'Sulfa', reaction: 'Rash', severity: 'moderate' as const },
  ],
  medications: [
    { id: 'm1', name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', status: 'active' as const },
    { id: 'm2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', status: 'active' as const },
  ],
  problems: [
    { id: 'pr1', name: 'Type 2 Diabetes', icdCode: 'E11.9', status: 'active' as const, isPrimary: true },
    { id: 'pr2', name: 'Essential Hypertension', icdCode: 'I10', status: 'active' as const },
  ],
  vitals: [
    {
      id: 'v1',
      name: 'Blood Pressure',
      shortName: 'BP',
      readings: [
        { value: 128, unit: 'mmHg', timestamp: '2024-01-15', isAbnormal: false },
        { value: 132, unit: 'mmHg', timestamp: '2024-01-10', isAbnormal: false },
        { value: 145, unit: 'mmHg', timestamp: '2024-01-05', isAbnormal: true },
      ],
    },
    {
      id: 'v2',
      name: 'Heart Rate',
      shortName: 'HR',
      readings: [
        { value: 72, unit: 'bpm', timestamp: '2024-01-15', isAbnormal: false },
        { value: 78, unit: 'bpm', timestamp: '2024-01-10', isAbnormal: false },
      ],
    },
  ],
};

const mockEncounter = {
  id: 'enc-1',
  appointmentId: 'apt-12345',
  type: 'urgent-care' as const,
  status: 'in-progress' as const,
  chiefComplaint: 'Cough and congestion',
  startTime: new Date(),
};

const PlaceholderContent = () => (
  <div style={{ padding: spaceAround.default }}>
    <h3 style={{ marginBottom: spaceAround.default }}>Chart Items</h3>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          padding: spaceAround.default,
          marginBottom: spaceAround.tight,
          backgroundColor: colors.bg.neutral.base,
          borderRadius: 8,
          border: `1px solid ${colors.border.neutral.low}`,
        }}
      >
        Chart Item {i}
      </div>
    ))}
  </div>
);

export const Default: Story = {
  render: () => (
    <div style={{ height: '100vh' }}>
      <AdaptiveLayout
        menuPane={
          <MenuPane
            patientWorkspaces={mockPatientWorkspaces}
          />
        }
        overviewPane={
          <PatientOverviewPane patient={mockPatientOverview} />
        }
        canvasPane={
          <CanvasPane
            headerContent={
              <EncounterContextBar
                encounter={mockEncounter}
                chiefComplaint="Cough and congestion"
                providerName="Dr. Sarah Johnson"
                providerCredentials="MD"
                room="4A"
                startTime="2:30 PM"
              />
            }
          >
            <PlaceholderContent />
          </CanvasPane>
        }
      />
    </div>
  ),
};

export const MenuCollapsed: Story = {
  name: 'Menu Collapsed',
  render: () => (
    <div style={{ height: '100vh' }}>
      <AdaptiveLayout
        menuPane={
          <MenuPane patientWorkspaces={mockPatientWorkspaces} />
        }
        overviewPane={
          <PatientOverviewPane patient={mockPatientOverview} />
        }
        canvasPane={
          <CanvasPane
            headerContent={
              <EncounterContextBar
                encounter={mockEncounter}
                chiefComplaint="Cough and congestion"
                providerName="Dr. Sarah Johnson"
              />
            }
          >
            <PlaceholderContent />
          </CanvasPane>
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Click the menu toggle (hamburger icon) in the header to collapse/expand the menu pane.',
      },
    },
  },
};

export const CanvasOnly: Story = {
  name: 'Canvas Only (Immersive)',
  render: () => (
    <div style={{ height: '100vh' }}>
      <AdaptiveLayout
        canvasPane={
          <CanvasPane
            headerContent={
              <EncounterContextBar
                encounter={mockEncounter}
                chiefComplaint="Cough and congestion"
                providerName="Dr. Sarah Johnson"
              />
            }
          >
            <PlaceholderContent />
          </CanvasPane>
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Immersive mode with only the canvas pane visible. All sidebars can be collapsed to maximize charting space.',
      },
    },
  },
};
