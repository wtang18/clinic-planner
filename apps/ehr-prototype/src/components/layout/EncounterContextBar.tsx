/**
 * EncounterContextBar Component
 *
 * Encounter information bar replacing the old PatientHeader in the canvas.
 * Row 1: Chief complaint headline (15px semibold)
 * Row 2: Dot-separated metadata strip (type · status · provider · room · payer · org · visit mode · appt ID)
 * Compact: Single row dot-separated summary.
 */

import React from 'react';
import { colors, spaceAround, spaceBetween, typography, heading, LAYOUT } from '../../styles/foundations';
import type { EncounterMeta } from '../../types';

// ============================================================================
// Types
// ============================================================================

export interface EncounterContextBarProps {
  /** Encounter metadata */
  encounter: EncounterMeta;
  /** Chief complaint (from VisitMeta) */
  chiefComplaint?: string;
  /** Provider name */
  providerName?: string;
  /** Provider credentials */
  providerCredentials?: string;
  /** Room number/name */
  room?: string;
  /** Visit start time */
  startTime?: string;
  /** Organization name */
  organization?: string;
  /** Payer name */
  payer?: string;
  /** Visit mode */
  visitMode?: 'walk-in' | 'scheduled' | 'virtual';
  /** Compact mode (for collapsed header) */
  compact?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function formatEncounterType(type: EncounterMeta['type']): string {
  const labels: Record<string, string> = {
    'office-visit': 'Office Visit',
    'urgent-care': 'Urgent Care',
    'telehealth': 'Telehealth',
    'annual-wellness': 'Annual Wellness',
    'follow-up': 'Follow-up',
    'procedure': 'Procedure',
    'consult': 'Consult',
  };
  return labels[type] || type;
}

function formatStatus(status: EncounterMeta['status']): string {
  return status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getStatusColor(status: EncounterMeta['status']): string {
  switch (status) {
    case 'in-progress':
      return colors.fg.attention.primary;
    case 'complete':
    case 'signed':
      return colors.fg.positive.primary;
    case 'checked-in':
      return colors.fg.information.primary;
    default:
      return colors.fg.neutral.spotReadable;
  }
}

function formatVisitMode(mode: 'walk-in' | 'scheduled' | 'virtual'): string {
  const labels: Record<string, string> = {
    'walk-in': 'Walk-in',
    'scheduled': 'Scheduled',
    'virtual': 'Virtual',
  };
  return labels[mode] || mode;
}

/** Builds a dot-separated metadata array, filtering out undefined items */
function buildMetaItems(
  encounter: EncounterMeta,
  props: Pick<EncounterContextBarProps, 'providerName' | 'providerCredentials' | 'room' | 'payer' | 'organization' | 'visitMode'>,
): { text: string; color?: string }[] {
  const items: { text: string; color?: string }[] = [];

  items.push({ text: formatEncounterType(encounter.type) });
  items.push({ text: formatStatus(encounter.status), color: getStatusColor(encounter.status) });

  if (props.providerName) {
    const provider = props.providerCredentials
      ? `${props.providerName}, ${props.providerCredentials}`
      : props.providerName;
    items.push({ text: provider });
  }

  if (props.room) {
    items.push({ text: `Room ${props.room}` });
  }

  if (props.payer) {
    items.push({ text: props.payer });
  }

  if (props.organization) {
    items.push({ text: props.organization });
  }

  if (props.visitMode) {
    items.push({ text: formatVisitMode(props.visitMode) });
  }

  if (encounter.appointmentId) {
    items.push({ text: `Appt #${encounter.appointmentId.slice(0, 8)}` });
  }

  return items;
}

// ============================================================================
// MetaStrip — dot-separated inline metadata
// ============================================================================

const MetaStrip: React.FC<{ items: { text: string; color?: string }[] }> = ({ items }) => (
  <div style={styles.metaStrip}>
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span style={styles.dot}>·</span>}
        <span style={{ color: item.color || colors.fg.neutral.spotReadable }}>
          {item.text}
        </span>
      </React.Fragment>
    ))}
  </div>
);

// ============================================================================
// Component
// ============================================================================

export const EncounterContextBar: React.FC<EncounterContextBarProps> = ({
  encounter,
  chiefComplaint,
  providerName,
  providerCredentials,
  room,
  startTime,
  organization,
  payer,
  visitMode,
  compact = false,
  style,
  testID,
}) => {
  const metaItems = buildMetaItems(encounter, {
    providerName,
    providerCredentials,
    room,
    payer,
    organization,
    visitMode,
  });

  if (compact) {
    // Compact: single-row dot-separated (type · status · provider)
    const compactItems = metaItems.slice(0, 3);
    return (
      <div
        style={{
          ...styles.compactContainer,
          ...style,
        }}
        data-testid={testID}
      >
        <div style={styles.inner}>
          <MetaStrip items={compactItems} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, ...style }} data-testid={testID}>
      <div style={styles.inner}>
        {/* Row 1: Chief complaint headline */}
        {chiefComplaint && (
          <span style={styles.headline}>{chiefComplaint}</span>
        )}

        {/* Row 2: Dot-separated metadata strip */}
        <MetaStrip items={metaItems} />
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
    padding: `${spaceAround.compact}px ${LAYOUT.canvasContentPadding}px`,
  },
  compactContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: `${spaceAround.tight}px ${LAYOUT.canvasContentPadding}px`,
  },
  inner: {
    maxWidth: 900,
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  },
  headline: {
    fontFamily: heading.md.medium.fontFamily,
    fontSize: heading.md.medium.fontSize,
    lineHeight: `${heading.md.medium.lineHeight}px`,
    fontWeight: heading.md.medium.fontWeight,
    letterSpacing: heading.md.medium.letterSpacing,
    color: colors.fg.neutral.primary,
  },
  metaStrip: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spaceBetween.coupled,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    lineHeight: '16px',
  },
  dot: {
    color: colors.fg.neutral.disabled,
  },
};

EncounterContextBar.displayName = 'EncounterContextBar';
