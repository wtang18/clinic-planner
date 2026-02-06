/**
 * EncounterContextBar Component
 *
 * Encounter information bar replacing the old PatientHeader in the canvas.
 * Shows visit type, provider, badges, time, room, and appointment info.
 */

import React from 'react';
import { Clock, MapPin, Calendar, User } from 'lucide-react';
import { colors, borderRadius, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';
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

function getStatusBadgeStyle(status: EncounterMeta['status']): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spaceAround.nudge2}px ${spaceAround.nudge6}px`,
    borderRadius: borderRadius.xs,
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'capitalize',
  };

  switch (status) {
    case 'in-progress':
      return {
        ...baseStyle,
        backgroundColor: colors.bg.attention.subtle,
        color: colors.fg.attention.primary,
      };
    case 'complete':
    case 'signed':
      return {
        ...baseStyle,
        backgroundColor: colors.bg.positive.subtle,
        color: colors.fg.positive.primary,
      };
    case 'checked-in':
      return {
        ...baseStyle,
        backgroundColor: colors.bg.information.subtle,
        color: colors.fg.information.primary,
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: colors.bg.neutral.subtle,
        color: colors.fg.neutral.secondary,
      };
  }
}

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
  compact = false,
  style,
  testID,
}) => {
  if (compact) {
    // Compact mode: just visit type + provider
    const compactStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: spaceBetween.relatedCompact,
      padding: `${spaceAround.tight}px ${spaceAround.default}px`,
      ...style,
    };

    return (
      <div style={compactStyle} data-testid={testID}>
        <span
          style={{
            fontSize: 14,
            fontFamily: typography.fontFamily.sans,
            fontWeight: typography.fontWeight.semibold,
            color: colors.fg.neutral.primary,
          }}
        >
          {formatEncounterType(encounter.type)}
        </span>
        {providerName && (
          <>
            <span style={{ color: colors.fg.neutral.spotReadable }}>&middot;</span>
            <span
              style={{
                fontSize: 14,
                fontFamily: typography.fontFamily.sans,
                color: colors.fg.neutral.secondary,
              }}
            >
              {providerName}
              {providerCredentials && `, ${providerCredentials}`}
            </span>
          </>
        )}
      </div>
    );
  }

  // Full mode
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    ...style,
  };

  const topRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    flexWrap: 'wrap',
  };

  const bottomRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
    flexWrap: 'wrap',
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  };

  const metaItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  };

  const encounterBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spaceAround.nudge2}px ${spaceAround.tight}px`,
    backgroundColor: colors.bg.accent.subtle,
    color: colors.fg.accent.primary,
    borderRadius: borderRadius.xs,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Top row: Type, Chief complaint, Status */}
      <div style={topRowStyle}>
        <span style={encounterBadgeStyle}>{formatEncounterType(encounter.type)}</span>

        {chiefComplaint && (
          <span
            style={{
              fontSize: 16,
              fontFamily: typography.fontFamily.sans,
              fontWeight: typography.fontWeight.semibold,
              color: colors.fg.neutral.primary,
            }}
          >
            {chiefComplaint}
          </span>
        )}

        <span style={getStatusBadgeStyle(encounter.status)}>
          {encounter.status.replace('-', ' ')}
        </span>
      </div>

      {/* Bottom row: Provider, Time, Room, Org */}
      <div style={bottomRowStyle}>
        {providerName && (
          <div style={metaItemStyle}>
            <User size={14} />
            <span>
              {providerName}
              {providerCredentials && `, ${providerCredentials}`}
            </span>
          </div>
        )}

        {startTime && (
          <div style={metaItemStyle}>
            <Clock size={14} />
            <span>{startTime}</span>
          </div>
        )}

        {room && (
          <div style={metaItemStyle}>
            <MapPin size={14} />
            <span>Room {room}</span>
          </div>
        )}

        {encounter.appointmentId && (
          <div style={metaItemStyle}>
            <Calendar size={14} />
            <span>Appt #{encounter.appointmentId.slice(0, 8)}</span>
          </div>
        )}

        {organization && (
          <span style={{ color: colors.fg.neutral.spotReadable }}>
            {organization}
          </span>
        )}
      </div>
    </div>
  );
};

EncounterContextBar.displayName = 'EncounterContextBar';
