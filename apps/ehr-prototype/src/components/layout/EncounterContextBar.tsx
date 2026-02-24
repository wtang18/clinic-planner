/**
 * EncounterContextBar Component
 *
 * Encounter information bar replacing the old PatientHeader in the canvas.
 * Row 1: Chief complaint headline (15px semibold)
 * Row 2: Dot-separated metadata strip (type · status · provider · room · payer · org · visit mode · appt ID)
 * Compact: Single row dot-separated summary.
 */

import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { colors, spaceAround, spaceBetween, typography, heading, body, borderRadius, LAYOUT } from '../../styles/foundations';
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
  /** Insurance group name */
  groupName?: string;
  /** Longitudinal case ID */
  caseId?: string;
  /** Flexible tags */
  tags?: string[];
  /** Whether the encounter is locked */
  locked?: boolean;
  /** Editable visit name */
  visitName?: string;
  /** Called when visit name changes */
  onVisitNameChange?: (name: string) => void;
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

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' \u00B7 '
    + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** Builds a dot-separated metadata array, filtering out undefined items */
function buildMetaItems(
  encounter: EncounterMeta,
  props: Pick<EncounterContextBarProps, 'providerName' | 'providerCredentials' | 'room' | 'payer' | 'groupName' | 'caseId' | 'locked' | 'organization' | 'visitMode'>,
): { text: string; color?: string; icon?: React.ReactNode }[] {
  const items: { text: string; color?: string; icon?: React.ReactNode }[] = [];

  // Date/Time
  const dateSource = encounter.scheduledAt || encounter.startedAt;
  if (dateSource) {
    items.push({ text: formatDateTime(dateSource) });
  }

  items.push({ text: formatEncounterType(encounter.type) });

  // Status — override to "Locked" if locked
  if (props.locked) {
    items.push({
      text: 'Locked',
      color: colors.fg.neutral.spotReadable,
      icon: <Lock size={11} />,
    });
  } else {
    items.push({ text: formatStatus(encounter.status), color: getStatusColor(encounter.status) });
  }

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

  if (props.groupName) {
    items.push({ text: `Group: ${props.groupName}` });
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

  if (props.caseId) {
    items.push({ text: `Case #${props.caseId}` });
  }

  return items;
}

// ============================================================================
// MetaStrip — dot-separated inline metadata
// ============================================================================

const MetaStrip: React.FC<{ items: { text: string; color?: string; icon?: React.ReactNode }[] }> = ({ items }) => (
  <div style={styles.metaStrip}>
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span style={styles.dot}>·</span>}
        <span style={{
          color: item.color || colors.fg.neutral.spotReadable,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
        }}>
          {item.icon}
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
  groupName,
  caseId,
  tags,
  locked,
  visitName,
  onVisitNameChange,
  visitMode,
  compact = false,
  style,
  testID,
}) => {
  const [editingName, setEditingName] = useState(visitName ?? '');

  const metaItems = buildMetaItems(encounter, {
    providerName,
    providerCredentials,
    room,
    payer,
    groupName,
    caseId,
    locked,
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

        {/* Row 1b: Editable visit name */}
        {(visitName !== undefined || onVisitNameChange) && (
          onVisitNameChange && !locked ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => onVisitNameChange(editingName)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              style={styles.visitNameInput}
              placeholder="Visit name..."
            />
          ) : (
            <span style={styles.visitNameText}>{visitName}</span>
          )
        )}

        {/* Row 2: Dot-separated metadata strip */}
        <MetaStrip items={metaItems} />

        {/* Row 3: Tags */}
        {tags && tags.length > 0 && (
          <div style={styles.tagRow}>
            {tags.map((tag) => (
              <span key={tag} style={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
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
    padding: `${spaceAround.compact}px ${LAYOUT.canvasContentPadding}px ${spaceAround.spacious}px`,
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
  visitNameInput: {
    fontFamily: body.sm.regular.fontFamily,
    fontSize: body.sm.regular.fontSize,
    lineHeight: `${body.sm.regular.lineHeight}px`,
    fontWeight: body.sm.regular.fontWeight,
    color: colors.fg.neutral.secondary,
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: `1px solid transparent`,
    padding: 0,
    outline: 'none',
    width: '100%',
    maxWidth: 300,
    transition: 'border-color 150ms ease',
    // hover/focus handled via CSS-in-JS limitation — use onFocus/onBlur inline
  } as React.CSSProperties,
  visitNameText: {
    fontFamily: body.sm.regular.fontFamily,
    fontSize: body.sm.regular.fontSize,
    lineHeight: `${body.sm.regular.lineHeight}px`,
    color: colors.fg.neutral.secondary,
  },
  tagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    flexWrap: 'wrap',
  } as React.CSSProperties,
  tag: {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
    backgroundColor: colors.bg.neutral.subtle,
    padding: '1px 8px',
    borderRadius: borderRadius.full,
    lineHeight: '16px',
  },
};

EncounterContextBar.displayName = 'EncounterContextBar';
