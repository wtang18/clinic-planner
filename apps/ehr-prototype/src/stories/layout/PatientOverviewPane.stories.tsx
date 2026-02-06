import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { PatientOverviewPane } from '../../components/layout/PatientOverviewPane';
import { fn } from 'storybook/test';

const meta: Meta<typeof PatientOverviewPane> = {
  title: 'Layout/PatientOverviewPane',
  component: PatientOverviewPane,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The PatientOverviewPane displays longitudinal patient data in collapsible sections:

1. **Patient Identity Header**: Name, MRN, DOB, age, gender, shortcuts menu
2. **Allergies** (safety critical, always first): Severity indicators, reactions
3. **Medications**: Active medications with dosage and frequency
4. **Problems**: Active conditions with ICD codes
5. **Vitals**: Recent readings with mini sparklines showing trends

Each section collapses to show a summary with key alerts when space is limited.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280, height: 600, backgroundColor: '#F9FAFB', border: '1px solid #e5e7eb' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockPatient = {
  name: 'John Smith',
  mrn: '12345678',
  dob: '1985-03-15',
  age: 39,
  gender: 'Male',
  pronouns: 'he/him',
  allergies: [
    { id: 'a1', allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' as const },
    { id: 'a2', allergen: 'Sulfa', reaction: 'Rash', severity: 'moderate' as const },
    { id: 'a3', allergen: 'Aspirin', reaction: 'GI upset', severity: 'mild' as const },
  ],
  medications: [
    { id: 'm1', name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', status: 'active' as const },
    { id: 'm2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', status: 'active' as const },
    { id: 'm3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Daily', status: 'active' as const },
    { id: 'm4', name: 'Omeprazole', dosage: '20mg', frequency: 'Daily', status: 'active' as const },
  ],
  problems: [
    { id: 'pr1', name: 'Type 2 Diabetes', icdCode: 'E11.9', status: 'active' as const, isPrimary: true },
    { id: 'pr2', name: 'Essential Hypertension', icdCode: 'I10', status: 'active' as const },
    { id: 'pr3', name: 'Hyperlipidemia', icdCode: 'E78.5', status: 'active' as const },
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
        { value: 138, unit: 'mmHg', timestamp: '2024-01-01', isAbnormal: false },
        { value: 142, unit: 'mmHg', timestamp: '2023-12-28', isAbnormal: true },
      ],
    },
    {
      id: 'v2',
      name: 'Heart Rate',
      shortName: 'HR',
      readings: [
        { value: 72, unit: 'bpm', timestamp: '2024-01-15', isAbnormal: false },
        { value: 78, unit: 'bpm', timestamp: '2024-01-10', isAbnormal: false },
        { value: 75, unit: 'bpm', timestamp: '2024-01-05', isAbnormal: false },
      ],
    },
    {
      id: 'v3',
      name: 'Temperature',
      shortName: 'Temp',
      readings: [
        { value: 98.6, unit: '°F', timestamp: '2024-01-15', isAbnormal: false },
        { value: 101.2, unit: '°F', timestamp: '2024-01-10', isAbnormal: true },
      ],
    },
  ],
};

export const Default: Story = {
  args: {
    patient: mockPatient,
    onPatientClick: fn(),
    onCopyMrn: fn(),
    onOpenFullChart: fn(),
  },
};

export const NoAllergies: Story = {
  name: 'No Known Allergies',
  args: {
    patient: {
      ...mockPatient,
      allergies: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows "No known allergies (NKA)" when allergies list is empty.',
      },
    },
  },
};

export const SevereAllergies: Story = {
  name: 'Multiple Severe Allergies',
  args: {
    patient: {
      ...mockPatient,
      allergies: [
        { id: 'a1', allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' as const },
        { id: 'a2', allergen: 'Cephalosporins', reaction: 'Anaphylaxis', severity: 'severe' as const },
        { id: 'a3', allergen: 'Sulfa', reaction: 'Stevens-Johnson', severity: 'severe' as const },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'High-alert patient with multiple severe allergies shown prominently.',
      },
    },
  },
};

export const NoPatient: Story = {
  name: 'No Patient Selected',
  args: {
    patient: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no patient is selected.',
      },
    },
  },
};
