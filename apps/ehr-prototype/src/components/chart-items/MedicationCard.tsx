/**
 * MedicationCard Component
 *
 * Specialized card for displaying medication items.
 */

import React from 'react';
import { Pill, Pencil, ShieldAlert, Send } from 'lucide-react';
import type { MedicationItem } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';
import { Card } from '../primitives/Card';
import { StatusBadge } from '../primitives/StatusBadge';
import { Button } from '../primitives/Button';
import { IconButton } from '../primitives/IconButton';
import { CardIconContainer } from '../primitives/CardIconContainer';
import { MetadataRow } from '../primitives/MetadataRow';

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
  const isCompact = variant === 'compact';
  const { data } = medication;

  // Format medication display
  const dosageInfo = [data.dosage, data.route, data.frequency].filter(Boolean).join(' · ');
  const statusLabel = getStatusLabel(medication.status);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: isCompact ? 'row' : 'column',
    gap: spaceBetween.relatedCompact,
    padding: isCompact ? spaceAround.compact : spaceAround.default,
    cursor: onSelect ? 'pointer' : 'default',
    transition: `all ${transitions.fast}`,
    ...(selected && {
      backgroundColor: colors.bg.accent.subtle,
    }),
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  };

  const headerRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceBetween.repeating,
  };

  const titleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    minWidth: 0,
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isCompact ? 14 : 16,
    lineHeight: isCompact ? '20px' : '24px',
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const dosageStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: '20px',
    color: colors.fg.neutral.secondary,
    margin: 0,
  };


  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    flexShrink: 0,
    marginTop: isCompact ? 0 : spaceAround.compact,
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
        <CardIconContainer color="default" size={isCompact ? 'md' : 'lg'}>
          <Pill size={isCompact ? 16 : 20} />
        </CardIconContainer>

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
                    gap: spaceBetween.coupled,
                    color: colors.fg.attention.secondary,
                    fontSize: 12,
                  }}
                  title={`Schedule ${data.controlSchedule || 'Controlled'}`}
                >
                  <ShieldAlert size={14} />
                  {!isCompact && <span>C-{data.controlSchedule}</span>}
                </span>
              )}
              <StatusBadge status={medication.status} label={statusLabel} customMap={MEDICATION_STATUS_MAP} />
            </div>

            {/* Compact actions */}
            {isCompact && (onPrescribe || onEdit) && (
              <div style={actionsStyle}>
                {onEdit && (
                  <IconButton
                    icon={<Pencil size={14} />}
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
              <MetadataRow
                items={[
                  ...(data.quantity ? [{ label: 'Qty', value: String(data.quantity) }] : []),
                  ...(data.refills !== undefined ? [{ label: 'Refills', value: String(data.refills) }] : []),
                  ...(data.duration ? [{ label: 'Duration', value: data.duration }] : []),
                ]}
              />

              {data.genericName && data.genericName !== data.drugName && (
                <MetadataRow
                  items={[{ label: 'Generic', value: data.genericName }]}
                />
              )}

              {data.pharmacy && (
                <MetadataRow
                  items={[{ label: 'Pharmacy', value: data.pharmacy.name }]}
                />
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
                leftIcon={<Send size={14} />}
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

const MEDICATION_STATUS_MAP: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  'draft': 'default',
  'pending-review': 'warning',
  'confirmed': 'success',
  'ordered': 'info',
  'completed': 'success',
  'cancelled': 'error',
};

MedicationCard.displayName = 'MedicationCard';
