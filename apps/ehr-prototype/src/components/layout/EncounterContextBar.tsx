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
import type { EncounterMeta, Specialty } from '../../types';
import { getSpecialtyLabel } from '../../utils/specialty';

// ============================================================================
// Types
// ============================================================================

export interface EncounterContextBarProps {
  /** Encounter metadata */
  encounter: EncounterMeta;
  /** Encounter specialty */
  specialty?: Specialty;
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

/** Formats time with timezone (e.g., "10:30 AM PST") */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/** Formats concise date with full year (e.g., "2/24/2026") */
function formatConciseDate(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
}

/** Builds a dot-separated metadata array, filtering out undefined items.
 *  Order: Time+TZ · Specialty · Provider · Payer · Group · Status+Room · Appt ID · Case ID · Locked */
function buildMetaItems(
  encounter: EncounterMeta,
  props: Pick<EncounterContextBarProps, 'specialty' | 'providerName' | 'providerCredentials' | 'room' | 'payer' | 'groupName' | 'caseId' | 'locked' | 'organization' | 'visitMode'>,
): { text: string; color?: string; icon?: React.ReactNode }[] {
  const items: { text: string; color?: string; icon?: React.ReactNode }[] = [];

  // 1. Time + timezone (date now in headline)
  const dateSource = encounter.scheduledAt || encounter.startedAt;
  if (dateSource) {
    items.push({ text: formatTime(dateSource) });
  }

  // 2. Specialty label
  if (props.specialty) {
    items.push({ text: getSpecialtyLabel(props.specialty) });
  }

  // 3. Provider (+ credentials)
  if (props.providerName) {
    const provider = props.providerCredentials
      ? `${props.providerName}, ${props.providerCredentials}`
      : props.providerName;
    items.push({ text: provider });
  }

  // 4. Payer
  if (props.payer) {
    items.push({ text: props.payer });
  }

  // 5. Group/Employer
  if (props.groupName) {
    items.push({ text: `Group: ${props.groupName}` });
  }

  if (props.organization) {
    items.push({ text: props.organization });
  }

  // 6. Status + Room (combined when both present)
  if (props.locked) {
    const lockText = props.room ? `Locked · Room ${props.room}` : 'Locked';
    items.push({
      text: lockText,
      color: colors.fg.neutral.spotReadable,
      icon: <Lock size={11} />,
    });
  } else {
    const statusText = props.room
      ? `${formatStatus(encounter.status)} · Room ${props.room}`
      : formatStatus(encounter.status);
    items.push({ text: statusText, color: getStatusColor(encounter.status) });
  }

  // 7. Appt ID
  if (encounter.appointmentId) {
    items.push({ text: `Appt #${encounter.appointmentId.slice(0, 8)}` });
  }

  // 8. Case ID
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
  specialty,
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
    specialty,
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

  // Build headline: "2/24/2026 · Cough x 5 days"
  const dateSource = encounter.scheduledAt || encounter.startedAt;
  const headlineDateStr = dateSource ? formatConciseDate(dateSource) : undefined;

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
        {/* Row 1: Date + Chief complaint headline (e.g., "2/24/2026 · Cough x 5 days") */}
        {(headlineDateStr || chiefComplaint) && (
          <span style={styles.headline}>
            {headlineDateStr && chiefComplaint
              ? `${headlineDateStr} · ${chiefComplaint}`
              : headlineDateStr || chiefComplaint}
          </span>
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
