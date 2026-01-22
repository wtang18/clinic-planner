/**
 * MedicationCard Component
 *
 * Specialized card for displaying medication items.
 */

import React from 'react';
import type { MedicationItem } from '../../types/chart-items';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { getCategoryColor } from '../../styles/utils';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { IconButton } from '../primitives/IconButton';

// ============================================================================
// Types
// ============================================================================

export interface MedicationCardProps {
  /** The medication item to display */
  medication: MedicationItem;
  /** Display variant */
  variant?: 'compact' | 'expanded';
  /** Called when prescribe is clicked */
  onPrescribe?: () => void;
  /** Called when edit is clicked */
  onEdit?: () => void;
  /** Whether the card is selected */
  selected?: boolean;
  /** Called when selected */
  onSelect?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const PillIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.5 20.5L3.5 13.5a4.95 4.95 0 0 1 7-7l7 7a4.95 4.95 0 0 1-7 7z" />
    <path d="M8.5 8.5l7 7" />
  </svg>
);

const EditIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ControlledIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

const SendIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  variant = 'compact',
  onPrescribe,
  onEdit,
  selected = false,
  onSelect,
  style,
}) => {
  const categoryColors = getCategoryColor('medication');
  const isCompact = variant === 'compact';
  const { data } = medication;

  // Format medication display
  const dosageInfo = [data.dosage, data.route, data.frequency].filter(Boolean).join(' · ');
  const statusLabel = getStatusLabel(medication.status);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: isCompact ? 'row' : 'column',
    gap: spacing[3],
    padding: isCompact ? spacing[3] : spacing[4],
    borderLeft: `3px solid ${categoryColors.border}`,
    cursor: onSelect ? 'pointer' : 'default',
    transition: `all ${transitions.fast}`,
    ...(selected && {
      backgroundColor: colors.primary[50],
    }),
    ...style,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isCompact ? '32px' : '40px',
    height: isCompact ? '32px' : '40px',
    backgroundColor: categoryColors.lightBg,
    borderRadius: radii.lg,
    color: categoryColors.icon,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
  };

  const headerRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  };

  const titleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    minWidth: 0,
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isCompact ? typography.fontSize.sm[0] : typography.fontSize.base[0],
    lineHeight: isCompact ? typography.fontSize.sm[1].lineHeight : typography.fontSize.base[1].lineHeight,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[900],
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const dosageStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm[0],
    lineHeight: typography.fontSize.sm[1].lineHeight,
    color: colors.neutral[600],
    margin: 0,
  };

  const detailRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    flexShrink: 0,
    marginTop: isCompact ? 0 : spacing[3],
  };

  return (
    <Card
      variant={selected ? 'elevated' : 'default'}
      padding="none"
      interactive={!!onSelect}
      selected={selected}
      onClick={onSelect}
    >
      <div style={containerStyle}>
        {/* Icon */}
        <div style={iconContainerStyle}>
          <div style={{ width: isCompact ? '16px' : '20px', height: isCompact ? '16px' : '20px' }}>
            <PillIcon />
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          <div style={headerRowStyle}>
            <div style={titleContainerStyle}>
              <p style={titleStyle}>{data.drugName}</p>
              {data.isControlled && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    color: colors.status.warning,
                    fontSize: typography.fontSize.xs[0],
                  }}
                  title={`Schedule ${data.controlSchedule || 'Controlled'}`}
                >
                  <span style={{ width: '14px', height: '14px', display: 'flex' }}>
                    <ControlledIcon />
                  </span>
                  {!isCompact && <span>C-{data.controlSchedule}</span>}
                </span>
              )}
              <Badge variant={getStatusVariant(medication.status)} size="sm">
                {statusLabel}
              </Badge>
            </div>

            {/* Compact actions */}
            {isCompact && (onPrescribe || onEdit) && (
              <div style={actionsStyle}>
                {onEdit && (
                  <IconButton
                    icon={<EditIcon />}
                    label="Edit medication"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Dosage info */}
          <p style={dosageStyle}>{dosageInfo}</p>

          {/* Additional details for expanded view */}
          {!isCompact && (
            <>
              <div style={detailRowStyle}>
                {data.quantity && (
                  <span>Qty: {data.quantity}</span>
                )}
                {data.refills !== undefined && (
                  <span>Refills: {data.refills}</span>
                )}
                {data.duration && (
                  <span>Duration: {data.duration}</span>
                )}
              </div>

              {data.genericName && data.genericName !== data.drugName && (
                <div style={detailRowStyle}>
                  <span>Generic: {data.genericName}</span>
                </div>
              )}

              {data.pharmacy && (
                <div style={detailRowStyle}>
                  <span>Pharmacy: {data.pharmacy.name}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Expanded actions */}
        {!isCompact && (onPrescribe || onEdit) && (
          <div style={actionsStyle}>
            {onPrescribe && medication.actions.includes('e-prescribe') && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<SendIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onPrescribe();
                }}
              >
                E-Prescribe
              </Button>
            )}
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function getStatusLabel(status: MedicationItem['status']): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'pending-review':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'ordered':
      return 'Sent';
    case 'completed':
      return 'Complete';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

function getStatusVariant(status: MedicationItem['status']): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'draft':
      return 'default';
    case 'pending-review':
      return 'warning';
    case 'confirmed':
      return 'success';
    case 'ordered':
      return 'info';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
}

MedicationCard.displayName = 'MedicationCard';
