import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as tokens from '@carbon-health/design-tokens/react-native';

// ============================================================================
// Status Dot Component
// ============================================================================

interface StatusDotProps {
  color: string;
  label: string;
  description?: string;
}

const StatusDot: React.FC<StatusDotProps> = ({ color, label, description }) => (
  <View style={dotStyles.container}>
    <View style={[dotStyles.dot, { backgroundColor: color }]} />
    <View style={dotStyles.info}>
      <Text style={dotStyles.label}>{label}</Text>
      {description && <Text style={dotStyles.description}>{description}</Text>}
    </View>
  </View>
);

const dotStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.colorFgNeutralPrimary,
  },
  description: {
    fontSize: 12,
    color: tokens.colorFgNeutralSecondary,
    marginTop: 2,
  },
});

// ============================================================================
// Status Badge Component
// ============================================================================

interface StatusBadgeProps {
  color: string;
  backgroundColor: string;
  label: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ color, backgroundColor, label }) => (
  <View style={[badgeStyles.badge, { backgroundColor }]}>
    <Text style={[badgeStyles.badgeText, { color }]}>{label}</Text>
  </View>
);

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

// ============================================================================
// Semantic Status Colors (Positive, Attention, Alert, Information)
// ============================================================================

const SemanticStatusDemo: React.FC = () => (
  <View style={sectionStyles.container}>
    <Text style={sectionStyles.title}>Semantic Status Colors</Text>
    <Text style={sectionStyles.description}>
      Status colors from @carbon-health/design-tokens semantic layer.
    </Text>

    <View style={sectionStyles.group}>
      <Text style={sectionStyles.groupTitle}>Status Indicators</Text>
      <StatusDot color={tokens.colorFgPositiveSpotReadable} label="Positive / Success" description="Confirmed, completed, healthy" />
      <StatusDot color={tokens.colorFgAttentionSecondary} label="Attention / Warning" description="Needs review, pending, caution" />
      <StatusDot color={tokens.colorFgAlertSecondary} label="Alert / Error" description="Failed, critical, urgent" />
      <StatusDot color={tokens.colorFgInformationSpotReadable} label="Information" description="Active, informational, in progress" />
    </View>

    <View style={sectionStyles.group}>
      <Text style={sectionStyles.groupTitle}>Status Badges</Text>
      <View style={sectionStyles.badgeRow}>
        <StatusBadge color={tokens.colorFgPositivePrimary} backgroundColor={tokens.colorBgPositiveSubtle} label="Completed" />
        <StatusBadge color={tokens.colorFgAttentionPrimary} backgroundColor={tokens.colorBgAttentionSubtle} label="Pending" />
        <StatusBadge color={tokens.colorFgAlertPrimary} backgroundColor={tokens.colorBgAlertSubtle} label="Critical" />
        <StatusBadge color={tokens.colorFgInformationPrimary} backgroundColor={tokens.colorBgInformationSubtle} label="Active" />
      </View>
    </View>
  </View>
);

// ============================================================================
// Clinical Category Colors (mapped to primitives)
// ============================================================================

const ClinicalCategoryDemo: React.FC = () => (
  <View style={sectionStyles.container}>
    <Text style={sectionStyles.title}>Clinical Category Colors</Text>
    <Text style={sectionStyles.description}>
      Colors assigned to different types of clinical items. Mapped from primitive color ramps.
    </Text>

    <View style={sectionStyles.group}>
      <Text style={sectionStyles.groupTitle}>Chart Item Categories</Text>
      <StatusDot color={tokens.colorPurple600} label="Medication" description="Prescriptions, drug orders" />
      <StatusDot color={tokens.colorBlue600} label="Lab" description="Laboratory tests and results" />
      <StatusDot color={tokens.colorYellow600} label="Diagnosis" description="ICD codes, problem list" />
      <StatusDot color={tokens.colorSaturatedRed500} label="Vital Signs" description="BP, HR, Temp, SpO2" />
      <StatusDot color={tokens.colorGreen600} label="Imaging" description="X-rays, CT, MRI, Ultrasound" />
      <StatusDot color={tokens.colorGray600} label="Procedure" description="Surgical, therapeutic procedures" />
      <StatusDot color={tokens.colorRed600} label="Allergy" description="Drug, food, environmental allergies" />
    </View>

    <View style={sectionStyles.group}>
      <Text style={sectionStyles.groupTitle}>Category Badges</Text>
      <View style={sectionStyles.badgeRow}>
        <StatusBadge color={tokens.colorPurple700} backgroundColor={tokens.colorPurple50} label="Medication" />
        <StatusBadge color={tokens.colorBlue700} backgroundColor={tokens.colorBlue50} label="Lab" />
        <StatusBadge color={tokens.colorYellow700} backgroundColor={tokens.colorYellow50} label="Diagnosis" />
        <StatusBadge color={tokens.colorSaturatedRed700} backgroundColor={tokens.colorSaturatedRed50} label="Vital" />
      </View>
      <View style={[sectionStyles.badgeRow, { marginTop: 8 }]}>
        <StatusBadge color={tokens.colorGreen700} backgroundColor={tokens.colorGreen50} label="Imaging" />
        <StatusBadge color={tokens.colorGray700} backgroundColor={tokens.colorGray50} label="Procedure" />
        <StatusBadge color={tokens.colorRed700} backgroundColor={tokens.colorRed50} label="Allergy" />
      </View>
    </View>
  </View>
);

// ============================================================================
// AI / Generative Indicators
// ============================================================================

const AIConfidenceDemo: React.FC = () => (
  <View style={sectionStyles.container}>
    <Text style={sectionStyles.title}>AI / Generative Indicators</Text>
    <Text style={sectionStyles.description}>
      Colors for AI-generated content, suggestions, and confidence levels.
    </Text>

    <View style={sectionStyles.group}>
      <Text style={sectionStyles.groupTitle}>AI Status</Text>
      <StatusDot color={tokens.colorFgAccentSecondary} label="AI Suggestion" description="Proposed by AI, needs review" />
      <StatusDot color={tokens.colorFgGenerativeSpotReadable} label="AI Generated" description="Content created by AI" />
      <StatusDot color={tokens.colorBgCarbyDefault} label="Carby" description="Carby assistant branding" />
    </View>

    <View style={sectionStyles.group}>
      <Text style={sectionStyles.groupTitle}>Confidence Levels</Text>
      <StatusDot color={tokens.colorFgPositiveSpotReadable} label="High Confidence" description="Above 90% confidence" />
      <StatusDot color={tokens.colorFgAttentionSecondary} label="Medium Confidence" description="60-90% confidence" />
      <StatusDot color={tokens.colorFgAlertSecondary} label="Low Confidence" description="Below 60% confidence" />
    </View>

    <View style={sectionStyles.group}>
      <Text style={sectionStyles.groupTitle}>AI Badges</Text>
      <View style={sectionStyles.badgeRow}>
        <StatusBadge color={tokens.colorFgAccentPrimary} backgroundColor={tokens.colorBgAccentSubtle} label="AI Suggested" />
        <StatusBadge color={tokens.colorFgPositivePrimary} backgroundColor={tokens.colorBgPositiveSubtle} label="High" />
        <StatusBadge color={tokens.colorFgAttentionPrimary} backgroundColor={tokens.colorBgAttentionSubtle} label="Medium" />
        <StatusBadge color={tokens.colorFgAlertPrimary} backgroundColor={tokens.colorBgAlertSubtle} label="Low" />
      </View>
    </View>
  </View>
);

// ============================================================================
// Care Gap Priority Colors
// ============================================================================

const CareGapPriorityDemo: React.FC = () => (
  <View style={sectionStyles.container}>
    <Text style={sectionStyles.title}>Care Gap Priority</Text>
    <Text style={sectionStyles.description}>
      Colors indicating urgency of care gaps and preventive care reminders.
    </Text>

    <View style={sectionStyles.group}>
      <Text style={sectionStyles.groupTitle}>Priority Levels</Text>
      <StatusDot color={tokens.colorFgAlertSecondary} label="Critical" description="Overdue, immediate action needed" />
      <StatusDot color={tokens.colorFgAttentionSecondary} label="Important" description="Due soon, should be addressed" />
      <StatusDot color={tokens.colorFgPositiveSpotReadable} label="Routine" description="Upcoming, for planning" />
    </View>

    <View style={sectionStyles.group}>
      <Text style={sectionStyles.groupTitle}>Priority Badges</Text>
      <View style={sectionStyles.badgeRow}>
        <StatusBadge color={tokens.colorFgAlertPrimary} backgroundColor={tokens.colorBgAlertSubtle} label="Critical" />
        <StatusBadge color={tokens.colorFgAttentionPrimary} backgroundColor={tokens.colorBgAttentionSubtle} label="Important" />
        <StatusBadge color={tokens.colorFgPositivePrimary} backgroundColor={tokens.colorBgPositiveSubtle} label="Routine" />
      </View>
    </View>

    <View style={sectionStyles.group}>
      <Text style={sectionStyles.groupTitle}>Example Usage</Text>
      <View style={exampleStyles.card}>
        <View style={exampleStyles.cardHeader}>
          <View style={[exampleStyles.priorityDot, { backgroundColor: tokens.colorFgAlertSecondary }]} />
          <Text style={exampleStyles.cardTitle}>Diabetic Eye Exam</Text>
          <StatusBadge color={tokens.colorFgAlertPrimary} backgroundColor={tokens.colorBgAlertSubtle} label="Overdue" />
        </View>
        <Text style={exampleStyles.cardDescription}>
          Last completed 14 months ago. Annual screening recommended.
        </Text>
      </View>
      <View style={exampleStyles.card}>
        <View style={exampleStyles.cardHeader}>
          <View style={[exampleStyles.priorityDot, { backgroundColor: tokens.colorFgAttentionSecondary }]} />
          <Text style={exampleStyles.cardTitle}>A1c Monitoring</Text>
          <StatusBadge color={tokens.colorFgAttentionPrimary} backgroundColor={tokens.colorBgAttentionSubtle} label="Due Soon" />
        </View>
        <Text style={exampleStyles.cardDescription}>
          Last completed 5 months ago. Every 6 months recommended.
        </Text>
      </View>
      <View style={exampleStyles.card}>
        <View style={exampleStyles.cardHeader}>
          <View style={[exampleStyles.priorityDot, { backgroundColor: tokens.colorFgPositiveSpotReadable }]} />
          <Text style={exampleStyles.cardTitle}>Flu Vaccination</Text>
          <StatusBadge color={tokens.colorFgPositivePrimary} backgroundColor={tokens.colorBgPositiveSubtle} label="Upcoming" />
        </View>
        <Text style={exampleStyles.cardDescription}>
          Annual flu season approaching. Schedule in 2 months.
        </Text>
      </View>
    </View>
  </View>
);

const exampleStyles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: tokens.colorBgNeutralBase,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colorBgNeutralLow,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colorFgNeutralPrimary,
  },
  cardDescription: {
    fontSize: 13,
    color: tokens.colorFgNeutralSecondary,
    paddingLeft: 16,
  },
});

const sectionStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: tokens.colorFgNeutralPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: tokens.colorFgNeutralSecondary,
    marginBottom: 24,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colorFgNeutralSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

// ============================================================================
// Storybook Meta & Stories
// ============================================================================

const meta: Meta = {
  title: 'Design Tokens/Status Indicators',
  component: SemanticStatusDemo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Status indicator colors from @carbon-health/design-tokens. Semantic states, clinical categories, AI confidence, and care gap priorities.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SemanticStatus: Story = {
  name: 'Semantic Status',
};

export const ClinicalCategories: Story = {
  name: 'Clinical Categories',
  render: () => <ClinicalCategoryDemo />,
};

export const AIConfidence: Story = {
  name: 'AI / Generative',
  render: () => <AIConfidenceDemo />,
};

export const CareGapPriority: Story = {
  name: 'Care Gap Priority',
  render: () => <CareGapPriorityDemo />,
};
