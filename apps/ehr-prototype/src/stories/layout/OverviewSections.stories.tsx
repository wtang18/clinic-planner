import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AllergiesSection } from '../../components/overview/AllergiesSection';
import { MedicationsSection } from '../../components/overview/MedicationsSection';
import { ProblemsSection } from '../../components/overview/ProblemsSection';
import { VitalsSection } from '../../components/overview/VitalsSection';
import { fn } from 'storybook/test';

// ============================================================================
// Allergies Section
// ============================================================================

const allergiesMeta: Meta<typeof AllergiesSection> = {
  title: 'Layout/Overview Sections/AllergiesSection',
  component: AllergiesSection,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 260, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default allergiesMeta;
type AllergiesStory = StoryObj<typeof allergiesMeta>;

export const AllergiesDefault: AllergiesStory = {
  name: 'Default',
  args: {
    allergies: [
      { id: 'a1', allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' },
      { id: 'a2', allergen: 'Sulfa', reaction: 'Rash', severity: 'moderate' },
      { id: 'a3', allergen: 'Aspirin', reaction: 'GI upset', severity: 'mild' },
    ],
  },
};

export const AllergiesSevereOnly: AllergiesStory = {
  name: 'Severe Allergies',
  args: {
    allergies: [
      { id: 'a1', allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' },
      { id: 'a2', allergen: 'Cephalosporins', reaction: 'Anaphylaxis', severity: 'severe' },
    ],
  },
};

export const AllergiesNKA: AllergiesStory = {
  name: 'No Known Allergies',
  args: {
    allergies: [],
  },
};

export const AllergiesCollapsed: AllergiesStory = {
  name: 'Collapsed State',
  args: {
    allergies: [
      { id: 'a1', allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' },
      { id: 'a2', allergen: 'Sulfa', reaction: 'Rash', severity: 'moderate' },
    ],
    defaultCollapsed: true,
  },
};

// ============================================================================
// Medications Section Story
// ============================================================================

export const MedicationsDefault: StoryObj<typeof MedicationsSection> = {
  name: 'Medications - Default',
  render: () => (
    <div style={{ width: 260, padding: 8 }}>
      <MedicationsSection
        medications={[
          { id: 'm1', name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', status: 'active' },
          { id: 'm2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', status: 'active' },
          { id: 'm3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Daily', status: 'active' },
        ]}
        onMedicationClick={fn()}
      />
    </div>
  ),
};

export const MedicationsMany: StoryObj<typeof MedicationsSection> = {
  name: 'Medications - Many Items',
  render: () => (
    <div style={{ width: 260, padding: 8 }}>
      <MedicationsSection
        medications={[
          { id: 'm1', name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', status: 'active' },
          { id: 'm2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', status: 'active' },
          { id: 'm3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Daily', status: 'active' },
          { id: 'm4', name: 'Omeprazole', dosage: '20mg', frequency: 'Daily', status: 'active' },
          { id: 'm5', name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', status: 'active' },
          { id: 'm6', name: 'Gabapentin', dosage: '300mg', frequency: 'Three times daily', status: 'active' },
          { id: 'm7', name: 'Levothyroxine', dosage: '50mcg', frequency: 'Daily', status: 'active' },
        ]}
        maxItems={5}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows "Show more" button when medications exceed maxItems limit.',
      },
    },
  },
};

// ============================================================================
// Problems Section Story
// ============================================================================

export const ProblemsDefault: StoryObj<typeof ProblemsSection> = {
  name: 'Problems - Default',
  render: () => (
    <div style={{ width: 260, padding: 8 }}>
      <ProblemsSection
        problems={[
          { id: 'pr1', name: 'Type 2 Diabetes', icdCode: 'E11.9', status: 'active', isPrimary: true },
          { id: 'pr2', name: 'Essential Hypertension', icdCode: 'I10', status: 'active' },
          { id: 'pr3', name: 'Hyperlipidemia', icdCode: 'E78.5', status: 'active' },
        ]}
        onProblemClick={fn()}
      />
    </div>
  ),
};

// ============================================================================
// Vitals Section Story
// ============================================================================

export const VitalsDefault: StoryObj<typeof VitalsSection> = {
  name: 'Vitals - Default',
  render: () => (
    <div style={{ width: 260, padding: 8 }}>
      <VitalsSection
        vitals={[
          {
            id: 'v1',
            name: 'Blood Pressure',
            shortName: 'BP',
            readings: [
              { value: 128, unit: 'mmHg', timestamp: '2024-01-15', isAbnormal: false },
              { value: 132, unit: 'mmHg', timestamp: '2024-01-10', isAbnormal: false },
              { value: 145, unit: 'mmHg', timestamp: '2024-01-05', isAbnormal: true },
              { value: 138, unit: 'mmHg', timestamp: '2024-01-01', isAbnormal: false },
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
            ],
          },
        ]}
        onVitalClick={fn()}
      />
    </div>
  ),
};

export const VitalsAbnormal: StoryObj<typeof VitalsSection> = {
  name: 'Vitals - With Abnormal Values',
  render: () => (
    <div style={{ width: 260, padding: 8 }}>
      <VitalsSection
        vitals={[
          {
            id: 'v1',
            name: 'Blood Pressure',
            shortName: 'BP',
            readings: [
              { value: 165, unit: 'mmHg', timestamp: '2024-01-15', isAbnormal: true },
              { value: 158, unit: 'mmHg', timestamp: '2024-01-10', isAbnormal: true },
              { value: 145, unit: 'mmHg', timestamp: '2024-01-05', isAbnormal: true },
            ],
          },
          {
            id: 'v2',
            name: 'Temperature',
            shortName: 'Temp',
            readings: [
              { value: 102.4, unit: '°F', timestamp: '2024-01-15', isAbnormal: true },
              { value: 101.8, unit: '°F', timestamp: '2024-01-10', isAbnormal: true },
            ],
          },
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Abnormal vitals are highlighted with red accents and show in collapsed summary.',
      },
    },
  },
};
