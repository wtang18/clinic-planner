/**
 * DemoLauncher Component
 *
 * Landing screen for launching demo scenarios.
 */

import React from 'react';
import { Play, User, Stethoscope } from 'lucide-react';
import { useNavigation } from './NavigationContext';
import { DEMO_ENCOUNTERS, type DemoEncounterId } from './routes';
import { Card } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';
import { CardIconContainer } from '../components/primitives/CardIconContainer';
import { colors, spaceAround, spaceBetween, typography, borderRadius, shadows } from '../styles/foundations';

// ============================================================================
// Demo Scenarios
// ============================================================================

interface DemoScenario {
  id: DemoEncounterId;
  title: string;
  description: string;
  patientName: string;
  encounterType: string;
  tags: string[];
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: DEMO_ENCOUNTERS.UC_COUGH,
    title: 'Urgent Care - Cough',
    description: '42-year-old female presenting with productive cough for 5 days, worse at night.',
    patientName: 'Sarah Johnson',
    encounterType: 'Urgent Care',
    tags: ['Respiratory', 'Acute'],
  },
  {
    id: DEMO_ENCOUNTERS.PC_DIABETES,
    title: 'Primary Care - Diabetes Follow-up',
    description: '58-year-old male with Type 2 DM and HTN for quarterly follow-up. A1C monitoring due.',
    patientName: 'Robert Chen',
    encounterType: 'Primary Care',
    tags: ['Chronic', 'Care Gaps'],
  },
  {
    id: DEMO_ENCOUNTERS.HEALTHY_ADULT,
    title: 'Annual Wellness Visit',
    description: '35-year-old healthy adult presenting for annual wellness exam.',
    patientName: 'Emily Davis',
    encounterType: 'Preventive',
    tags: ['Wellness', 'Screening'],
  },
];

// ============================================================================
// ScenarioCard Component
// ============================================================================

interface ScenarioCardProps {
  scenario: DemoScenario;
  onLaunch: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onLaunch }) => {
  return (
    <Card variant="elevated" padding="lg" style={styles.scenarioCard} data-testid={`scenario-card-${scenario.id}`}>
      <div style={styles.scenarioHeader}>
        <CardIconContainer color="accent" size="lg">
          <Stethoscope size={20} />
        </CardIconContainer>
        <div style={styles.scenarioMeta}>
          <span style={styles.encounterType}>{scenario.encounterType}</span>
        </div>
      </div>

      <h3 style={styles.scenarioTitle}>{scenario.title}</h3>
      <p style={styles.scenarioDescription}>{scenario.description}</p>

      <div style={styles.patientInfo}>
        <span style={styles.patientIcon}>
          <User size={20} />
        </span>
        <span style={styles.patientName}>{scenario.patientName}</span>
      </div>

      <div style={styles.tags}>
        {scenario.tags.map((tag) => (
          <span key={tag} style={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={onLaunch}
        style={styles.launchButton}
        leftIcon={<Play size={18} />}
      >
        Start Encounter
      </Button>
    </Card>
  );
};

// ============================================================================
// DemoLauncher Component
// ============================================================================

export const DemoLauncher: React.FC = () => {
  const { navigateToEncounter } = useNavigation();

  const handleLaunch = (scenarioId: DemoEncounterId) => {
    navigateToEncounter(scenarioId, 'capture');
  };

  return (
    <div style={styles.container} data-testid="demo-launcher">
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>EHR Prototype</h1>
        <p style={styles.subtitle}>
          Select a demo scenario to explore the AI-assisted charting experience.
        </p>
      </div>

      {/* Scenario Grid */}
      <div style={styles.scenarioGrid}>
        {DEMO_SCENARIOS.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onLaunch={() => handleLaunch(scenario.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          This is a prototype for demonstration purposes only.
          Patient data is simulated.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.bg.neutral.min,
    padding: spaceAround.generous,
    fontFamily: typography.fontFamily.sans,
  },
  header: {
    textAlign: 'center',
    marginBottom: spaceAround.generous,
  },
  title: {
    fontSize: 32,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.bold,
    color: colors.fg.neutral.primary,
    marginBottom: spaceAround.compact,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    maxWidth: '500px',
    margin: '0 auto',
  },
  scenarioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: spaceBetween.separatedSm,
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  scenarioCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  scenarioHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spaceAround.compact,
  },
  scenarioMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  encounterType: {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    backgroundColor: colors.bg.accent.subtle,
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
    borderRadius: borderRadius.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scenarioTitle: {
    fontSize: 20,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    marginBottom: spaceAround.tight,
  },
  scenarioDescription: {
    fontSize: 14,
    color: colors.fg.neutral.secondary,
    lineHeight: '1.5',
    marginBottom: spaceAround.default,
    flex: 1,
  },
  patientInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    marginBottom: spaceAround.default,
    padding: spaceAround.compact,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.sm,
  },
  patientIcon: {
    width: '20px',
    height: '20px',
    display: 'flex',
    color: colors.fg.neutral.spotReadable,
  },
  patientName: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.repeating,
    marginBottom: spaceAround.default,
  },
  tag: {
    fontSize: 12,
    color: colors.fg.neutral.secondary,
    backgroundColor: colors.bg.neutral.subtle,
    padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
    borderRadius: borderRadius.xs,
  },
  launchButton: {
    width: '100%',
  },
  footer: {
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: spaceAround.generous,
  },
  footerText: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
  },
};

DemoLauncher.displayName = 'DemoLauncher';
