/**
 * PatientHeader Component
 *
 * Patient context header with demographics and alerts.
 */

import React from 'react';
import { User, AlertTriangle, Heart } from 'lucide-react';
import type { PatientContext, EncounterMeta } from '../../types';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { Badge } from '../primitives/Badge';
import { Pill } from '../primitives/Pill';

// ============================================================================
// Types
// ============================================================================

export interface PatientHeaderProps {
  /** Patient context data */
  patient: PatientContext;
  /** Current encounter metadata */
  encounter: EncounterMeta;
  /** Number of open care gaps */
  careGapCount?: number;
  /** Called when patient name/info is clicked */
  onPatientClick?: () => void;
  /** Called when care gaps badge is clicked */
  onCareGapsClick?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  patient,
  encounter,
  careGapCount = 0,
  onPatientClick,
  onCareGapsClick,
  style,
}) => {
  const { demographics, clinicalSummary } = patient;
  const fullName = demographics.preferredName
    ? `${demographics.preferredName} (${demographics.firstName}) ${demographics.lastName}`
    : `${demographics.firstName} ${demographics.lastName}`;

  const hasAllergies = clinicalSummary?.allergies && clinicalSummary.allergies.length > 0;
  const severeAllergies = clinicalSummary?.allergies?.filter(a => a.severity === 'severe') || [];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px ${spaceAround.defaultPlus}px`,
    backgroundColor: colors.bg.neutral.base,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
    ...style,
  };

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
  };

  const patientInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    cursor: onPatientClick ? 'pointer' : 'default',
    transition: `opacity ${transitions.fast}`,
  };

  const avatarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    backgroundColor: colors.bg.accent.subtle,
    borderRadius: borderRadius.full,
    color: colors.fg.accent.primary,
  };

  const nameContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  };

  const nameStyle: React.CSSProperties = {
    fontSize: 18,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    margin: 0,
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '32px',
    backgroundColor: colors.border.neutral.low,
  };

  const encounterInfoStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  };

  const encounterLabelStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  const encounterTypeStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
  };

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.related,
  };

  return (
    <header style={containerStyle}>
      <div style={leftSectionStyle}>
        <div
          style={patientInfoStyle}
          onClick={onPatientClick}
          role={onPatientClick ? 'button' : undefined}
          tabIndex={onPatientClick ? 0 : undefined}
        >
          <div style={avatarStyle}>
            <User size={24} />
          </div>
          <div style={nameContainerStyle}>
            <h1 style={nameStyle}>{fullName}</h1>
            <div style={metaStyle}>
              <span>{demographics.age}y {demographics.gender}</span>
              <span>&middot;</span>
              <span>MRN: {patient.mrn}</span>
              {demographics.pronouns && (
                <>
                  <span>&middot;</span>
                  <span>{demographics.pronouns}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={dividerStyle} />

        <div style={encounterInfoStyle}>
          <span style={encounterLabelStyle}>Encounter</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.repeating }}>
            <span style={encounterTypeStyle}>{formatEncounterType(encounter.type)}</span>
            <Badge variant={getEncounterStatusVariant(encounter.status)} size="sm">
              {formatEncounterStatus(encounter.status)}
            </Badge>
          </div>
        </div>
      </div>

      <div style={rightSectionStyle}>
        {hasAllergies && (
          <Pill color={severeAllergies.length > 0 ? 'alert' : 'attention'} icon={<AlertTriangle size={14} />}>
            {severeAllergies.length > 0
              ? `${severeAllergies.length} severe allerg${severeAllergies.length !== 1 ? 'ies' : 'y'}`
              : `${clinicalSummary!.allergies.length} allerg${clinicalSummary!.allergies.length !== 1 ? 'ies' : 'y'}`
            }
          </Pill>
        )}

        <Pill color="default" icon={<Heart size={14} />} onClick={onCareGapsClick} data-testid="care-gap-indicator">
          <span data-testid="care-gap-count">
            {careGapCount > 0
              ? `${careGapCount} gap${careGapCount !== 1 ? 's' : ''}`
              : 'No gaps'
            }
          </span>
        </Pill>
      </div>
    </header>
  );
};

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

function formatEncounterStatus(status: EncounterMeta['status']): string {
  const labels: Record<string, string> = {
    'scheduled': 'Scheduled',
    'checked-in': 'Checked In',
    'in-progress': 'In Progress',
    'complete': 'Complete',
    'signed': 'Signed',
    'amended': 'Amended',
    'cancelled': 'Cancelled',
  };
  return labels[status] || status;
}

function getEncounterStatusVariant(status: EncounterMeta['status']): 'default' | 'success' | 'warning' | 'info' {
  switch (status) {
    case 'scheduled':
      return 'default';
    case 'checked-in':
      return 'info';
    case 'in-progress':
      return 'warning';
    case 'complete':
    case 'signed':
      return 'success';
    default:
      return 'default';
  }
}

PatientHeader.displayName = 'PatientHeader';
