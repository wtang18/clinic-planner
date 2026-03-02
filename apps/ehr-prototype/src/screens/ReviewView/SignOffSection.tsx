/**
 * SignOffSection Component
 *
 * Sign-off section with validation blockers and confirmation.
 */

import React from 'react';
import { AlertTriangle, CheckCircle, PenTool } from 'lucide-react';
import type { EncounterMeta } from '../../types';
import { colors, spaceAround, spaceBetween, borderRadius, typography, heading, body } from '../../styles/foundations';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';

// ============================================================================
// Types
// ============================================================================

export interface SignOffBlocker {
  type: 'unreviewed-ai' | 'incomplete-item' | 'missing-dx' | 'pending-task' | 'missing-note' | 'safety-critical';
  message: string;
  itemId?: string;
  severity: 'error' | 'warning';
}

export interface SignOffSectionProps {
  /** Current encounter metadata */
  encounter: EncounterMeta;
  /** Called when sign-off is clicked */
  onSignOff: () => void;
  /** List of blockers preventing sign-off */
  blockers: SignOffBlocker[];
  /** Whether sign-off is in progress */
  isSigningOff?: boolean;
  /** Header title — defaults to "Sign Encounter" */
  title?: string;
  /** Header subtitle — defaults to "Review and sign off on your documentation" */
  subtitle?: string;
  /** Button label — defaults to "Sign Encounter" */
  buttonLabel?: string;
  /** Content rendered between header and blockers (e.g., checklist, E&M level) */
  children?: React.ReactNode;
  /** data-testid on the Card wrapper — defaults to "sign-off-section" */
  testId?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const SignOffSection: React.FC<SignOffSectionProps> = ({
  encounter,
  onSignOff,
  blockers,
  isSigningOff = false,
  title = 'Sign Encounter',
  subtitle: subtitleText = 'Review and sign off on your documentation',
  buttonLabel = 'Sign Encounter',
  children,
  testId = 'sign-off-section',
  style,
}) => {
  const hasErrors = blockers.some((b) => b.severity === 'error');
  const hasWarnings = blockers.some((b) => b.severity === 'warning');
  const hasBlockers = blockers.length > 0;

  const errorBlockers = blockers.filter((b) => b.severity === 'error');
  const warningBlockers = blockers.filter((b) => b.severity === 'warning');

  return (
    <Card
      variant="elevated"
      padding="md"
      data-testid={testId}
      style={{
        ...styles.container,
        ...style,
      }}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <PenTool size={16} />
        </div>
        <div>
          <h3 style={styles.title}>{title}</h3>
          <p style={styles.subtitle}>
            {subtitleText}
          </p>
        </div>
      </div>

      {/* Extra content (e.g., checklist, E&M level) */}
      {children}

      {/* Blockers */}
      {hasBlockers && (
        <div style={styles.blockersContainer}>
          {/* Errors */}
          {errorBlockers.length > 0 && (
            <div style={styles.blockerSection}>
              <div style={styles.blockerSectionHeader}>
                <span style={{ ...styles.blockerIcon, color: colors.fg.alert.secondary }}>
                  <AlertTriangle size={16} />
                </span>
                <span style={styles.blockerSectionTitle}>
                  Required Items
                </span>
                <span style={styles.blockerCount}>{errorBlockers.length}</span>
              </div>
              <ul style={styles.blockerList}>
                {errorBlockers.map((blocker, i) => (
                  <li
                    key={i}
                    style={{
                      ...styles.blockerItem,
                      color: colors.fg.alert.secondary,
                    }}
                    data-testid="sign-off-blocker"
                  >
                    {blocker.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {warningBlockers.length > 0 && (
            <div style={styles.blockerSection}>
              <div style={styles.blockerSectionHeader}>
                <span style={{ ...styles.blockerIcon, color: colors.fg.attention.secondary }}>
                  <AlertTriangle size={16} />
                </span>
                <span style={styles.blockerSectionTitle}>
                  Recommended Items
                </span>
                <span style={styles.blockerCount}>{warningBlockers.length}</span>
              </div>
              <ul style={styles.blockerList}>
                {warningBlockers.map((blocker, i) => (
                  <li
                    key={i}
                    style={{
                      ...styles.blockerItem,
                      color: colors.fg.attention.secondary,
                    }}
                  >
                    {blocker.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Ready state */}
      {!hasBlockers && (
        <div style={styles.readyState}>
          <div style={styles.readyIcon}>
            <CheckCircle size={16} />
          </div>
          <p style={styles.readyText}>
            All documentation is complete. Ready to sign.
          </p>
        </div>
      )}

      {/* Sign button */}
      <Button
        variant="primary"
        size="lg"
        disabled={hasErrors || isSigningOff}
        onClick={onSignOff}
        style={styles.signButton}
        data-testid="sign-off-btn"
      >
        {isSigningOff ? 'Signing...' : buttonLabel}
      </Button>

      {/* Legal note */}
      {!hasErrors && (
        <p style={styles.legalNote}>
          By signing, I confirm that this documentation accurately reflects the
          care provided and is complete to the best of my knowledge.
        </p>
      )}

      {/* Encounter info */}
      <div style={styles.encounterInfo} data-testid="encounter-status">
        <span>Encounter: {encounter.id}</span>
        <span>·</span>
        <span>Status: {encounter.status}</span>
      </div>
    </Card>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: spaceAround.spacious,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.repeating,
    marginBottom: spaceAround.default,
  },
  headerIcon: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.accent.subtle,
    borderRadius: borderRadius.sm,
    color: colors.fg.accent.primary,
    flexShrink: 0,
  },
  title: {
    fontFamily: heading.md.medium.fontFamily,
    fontSize: heading.md.medium.fontSize,
    lineHeight: `${heading.md.medium.lineHeight}px`,
    fontWeight: heading.md.medium.fontWeight,
    letterSpacing: heading.md.medium.letterSpacing,
    color: colors.fg.neutral.primary,
    margin: 0,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: body.xs.regular.fontFamily,
    fontSize: body.xs.regular.fontSize,
    lineHeight: `${body.xs.regular.lineHeight}px`,
    fontWeight: body.xs.regular.fontWeight,
    letterSpacing: body.xs.regular.letterSpacing,
    color: colors.fg.neutral.spotReadable,
    margin: 0,
  },
  blockersContainer: {
    marginBottom: spaceAround.defaultPlus,
    padding: spaceAround.default,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.sm,
  },
  blockerSection: {
    marginBottom: spaceAround.default,
  },
  blockerSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    marginBottom: spaceAround.tight,
  },
  blockerIcon: {
    width: '16px',
    height: '16px',
    display: 'flex',
  },
  blockerSectionTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.secondary,
  },
  blockerCount: {
    fontSize: 12,
    fontWeight: typography.fontWeight.regular,
    color: colors.fg.neutral.spotReadable,
  },
  blockerList: {
    margin: 0,
    paddingLeft: spaceAround.spacious,
    listStyle: 'disc',
  },
  blockerItem: {
    fontSize: 14,
    marginBottom: spaceAround.nudge4,
  },
  readyState: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: spaceAround.default,
    backgroundColor: colors.bg.positive.subtle,
    borderRadius: borderRadius.sm,
    marginBottom: spaceAround.defaultPlus,
  },
  readyIcon: {
    width: 16,
    height: 16,
    display: 'flex',
    color: colors.fg.positive.secondary,
  },
  readyText: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.positive.secondary,
    margin: 0,
  },
  signButton: {
    width: '100%',
    marginBottom: spaceAround.default,
  },
  legalNote: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    textAlign: 'center',
    margin: 0,
    marginBottom: spaceAround.default,
  },
  encounterInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spaceBetween.repeating,
    fontSize: 12,
    color: colors.fg.neutral.disabled,
  },
};

SignOffSection.displayName = 'SignOffSection';
