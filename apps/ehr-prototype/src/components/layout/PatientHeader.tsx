/**
 * PatientHeader Component
 *
 * Patient context header with demographics and alerts.
 */

import React from 'react';
import type { PatientContext, EncounterMeta } from '../../types';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { Badge } from '../primitives/Badge';

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
// Icons
// ============================================================================

const UserIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const HeartIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

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
    padding: `${spacing[3]} ${spacing[5]}`,
    backgroundColor: colors.neutral[0],
    borderBottom: `1px solid ${colors.neutral[200]}`,
    ...style,
  };

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
  };

  const patientInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    cursor: onPatientClick ? 'pointer' : 'default',
    transition: `opacity ${transitions.fast}`,
  };

  const avatarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    backgroundColor: colors.primary[100],
    borderRadius: radii.full,
    color: colors.primary[600],
  };

  const nameContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[0.5],
  };

  const nameStyle: React.CSSProperties = {
    fontSize: typography.fontSize.lg[0],
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[900],
    margin: 0,
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    fontSize: typography.fontSize.sm[0],
    color: colors.neutral[600],
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '32px',
    backgroundColor: colors.neutral[200],
  };

  const encounterInfoStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[0.5],
  };

  const encounterLabelStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  };

  const encounterTypeStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm[0],
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
  };

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
  };

  const allergyStripStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[1.5]} ${spacing[3]}`,
    backgroundColor: severeAllergies.length > 0 ? colors.status.errorLight : colors.status.warningLight,
    borderRadius: radii.md,
    fontSize: typography.fontSize.sm[0],
    color: severeAllergies.length > 0 ? colors.status.error : colors.status.warning,
  };

  const careGapIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[1.5]} ${spacing[3]}`,
    backgroundColor: careGapCount > 0 ? colors.status.warningLight : colors.neutral[100],
    borderRadius: radii.md,
    cursor: onCareGapsClick ? 'pointer' : 'default',
    transition: `all ${transitions.fast}`,
  };

  return (
    <header style={containerStyle}>
      {/* Left: Patient info + Encounter */}
      <div style={leftSectionStyle}>
        {/* Patient info */}
        <div
          style={patientInfoStyle}
          onClick={onPatientClick}
          role={onPatientClick ? 'button' : undefined}
          tabIndex={onPatientClick ? 0 : undefined}
        >
          <div style={avatarStyle}>
            <span style={{ width: '24px', height: '24px', display: 'flex' }}>
              <UserIcon />
            </span>
          </div>
          <div style={nameContainerStyle}>
            <h1 style={nameStyle}>{fullName}</h1>
            <div style={metaStyle}>
              <span>{demographics.age}y {demographics.gender}</span>
              <span>·</span>
              <span>MRN: {patient.mrn}</span>
              {demographics.pronouns && (
                <>
                  <span>·</span>
                  <span>{demographics.pronouns}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={dividerStyle} />

        {/* Encounter info */}
        <div style={encounterInfoStyle}>
          <span style={encounterLabelStyle}>Encounter</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <span style={encounterTypeStyle}>{formatEncounterType(encounter.type)}</span>
            <Badge variant={getEncounterStatusVariant(encounter.status)} size="sm">
              {formatEncounterStatus(encounter.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Right: Allergies + Care gaps */}
      <div style={rightSectionStyle}>
        {/* Allergies */}
        {hasAllergies && (
          <div style={allergyStripStyle}>
            <span style={{ width: '16px', height: '16px', display: 'flex' }}>
              <AlertTriangleIcon />
            </span>
            <span>
              {severeAllergies.length > 0
                ? `${severeAllergies.length} severe allerg${severeAllergies.length !== 1 ? 'ies' : 'y'}`
                : `${clinicalSummary!.allergies.length} allerg${clinicalSummary!.allergies.length !== 1 ? 'ies' : 'y'}`
              }
            </span>
          </div>
        )}

        {/* Care gaps */}
        <div
          style={careGapIndicatorStyle}
          onClick={onCareGapsClick}
          role={onCareGapsClick ? 'button' : undefined}
          tabIndex={onCareGapsClick ? 0 : undefined}
        >
          <span style={{
            width: '16px',
            height: '16px',
            display: 'flex',
            color: careGapCount > 0 ? colors.status.warning : colors.neutral[400],
          }}>
            <HeartIcon />
          </span>
          <span style={{
            fontSize: typography.fontSize.sm[0],
            fontWeight: typography.fontWeight.medium,
            color: careGapCount > 0 ? colors.status.warning : colors.neutral[500],
          }}>
            {careGapCount > 0
              ? `${careGapCount} gap${careGapCount !== 1 ? 's' : ''}`
              : 'No gaps'
            }
          </span>
        </div>
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
