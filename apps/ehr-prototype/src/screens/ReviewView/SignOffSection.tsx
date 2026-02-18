/**
 * SignOffSection Component
 *
 * Sign-off section with validation blockers and confirmation.
 */

import React from 'react';
import { AlertTriangle, CheckCircle, PenTool } from 'lucide-react';
import type { EncounterMeta } from '../../types';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';
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
      padding="lg"
      data-testid="sign-off-section"
      style={{
        ...styles.container,
        ...style,
      }}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <PenTool size={24} />
        </div>
        <div>
          <h3 style={styles.title}>Sign Encounter</h3>
          <p style={styles.subtitle}>
            Review and sign off on your documentation
          </p>
        </div>
      </div>

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
                  Required Items ({errorBlockers.length})
                </span>
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
                  Recommended Items ({warningBlockers.length})
                </span>
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
            <CheckCircle size={24} />
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
        {isSigningOff ? 'Signing...' : 'Sign Encounter'}
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
    gap: spaceBetween.related,
    marginBottom: spaceAround.defaultPlus,
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.accent.subtle,
    borderRadius: borderRadius.sm,
    color: colors.fg.accent.primary,
    flexShrink: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    margin: 0,
    marginBottom: spaceAround.nudge4,
  },
  subtitle: {
    fontSize: 14,
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
    width: '24px',
    height: '24px',
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
