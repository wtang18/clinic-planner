/**
 * DiagnosisCard Component
 *
 * Specialized card for displaying diagnosis items.
 */

import React from 'react';
import type { ChartItem, DiagnosisItem } from '../../types/chart-items';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { getCategoryColor } from '../../styles/utils';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';

// ============================================================================
// Types
// ============================================================================

export interface DiagnosisCardProps {
  /** The diagnosis item to display */
  diagnosis: DiagnosisItem;
  /** Display variant */
  variant?: 'compact' | 'expanded';
  /** Items linked to this diagnosis */
  linkedItems?: ChartItem[];
  /** Whether the card is selected */
  selected?: boolean;
  /** Called when selected */
  onSelect?: () => void;
  /** Called when edit is clicked */
  onEdit?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const DiagnosisIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const ChronicIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const LinkIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

// ============================================================================
// Component
// ============================================================================

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({
  diagnosis,
  variant = 'compact',
  linkedItems = [],
  selected = false,
  onSelect,
  onEdit,
  style,
}) => {
  const categoryColors = getCategoryColor('diagnosis');
  const isCompact = variant === 'compact';
  const { data } = diagnosis;

  const isChronic = data.type === 'chronic';
  const isPrimary = data.ranking === 'primary' || data.ranking === 1;

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
    flexWrap: 'wrap',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isCompact ? typography.fontSize.sm[0] : typography.fontSize.base[0],
    lineHeight: isCompact ? typography.fontSize.sm[1].lineHeight : typography.fontSize.base[1].lineHeight,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[900],
    margin: 0,
  };

  const icdCodeStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    fontFamily: typography.fontFamily.mono,
    color: colors.neutral[500],
    backgroundColor: colors.neutral[100],
    padding: `${spacing[0.5]} ${spacing[2]}`,
    borderRadius: radii.base,
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
  };

  const linkedItemsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    color: colors.neutral[500],
    fontSize: typography.fontSize.xs[0],
  };

  const linkedItemsListStyle: React.CSSProperties = {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTop: `1px solid ${colors.neutral[200]}`,
  };

  const linkedItemRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[1]} 0`,
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[600],
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
            {isChronic ? <ChronicIcon /> : <DiagnosisIcon />}
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          <div style={headerRowStyle}>
            <div style={titleContainerStyle}>
              <p style={titleStyle}>{data.description}</p>
              <span style={icdCodeStyle}>{data.icdCode}</span>
              {isPrimary && (
                <Badge variant="info" size="sm">Primary</Badge>
              )}
              {isChronic && (
                <Badge variant="warning" size="sm">Chronic</Badge>
              )}
              {data.clinicalStatus === 'resolved' && (
                <Badge variant="success" size="sm">Resolved</Badge>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div style={metaStyle}>
            <span style={{ textTransform: 'capitalize' }}>{data.type}</span>
            {data.onsetDate && (
              <span>Onset: {formatDate(data.onsetDate)}</span>
            )}
            {linkedItems.length > 0 && (
              <div style={linkedItemsStyle}>
                <span style={{ width: '12px', height: '12px', display: 'flex' }}>
                  <LinkIcon />
                </span>
                <span>{linkedItems.length} linked</span>
              </div>
            )}
          </div>

          {/* Linked items (expanded view) */}
          {!isCompact && linkedItems.length > 0 && (
            <div style={linkedItemsListStyle}>
              <div style={{
                fontSize: typography.fontSize.xs[0],
                fontWeight: typography.fontWeight.medium,
                color: colors.neutral[600],
                marginBottom: spacing[2],
              }}>
                Linked Items
              </div>
              {linkedItems.slice(0, 5).map((item) => (
                <div key={item.id} style={linkedItemRowStyle}>
                  <Badge
                    variant="default"
                    size="sm"
                  >
                    {getCategoryLabel(item.category)}
                  </Badge>
                  <span>{item.displayText}</span>
                </div>
              ))}
              {linkedItems.length > 5 && (
                <div style={{
                  fontSize: typography.fontSize.xs[0],
                  color: colors.neutral[400],
                  paddingTop: spacing[1],
                }}>
                  + {linkedItems.length - 5} more
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function formatDate(date: Date): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getCategoryLabel(category: ChartItem['category']): string {
  const labels: Record<string, string> = {
    'chief-complaint': 'CC',
    'hpi': 'HPI',
    'ros': 'ROS',
    'physical-exam': 'PE',
    'vitals': 'Vitals',
    'medication': 'Rx',
    'allergy': 'Allergy',
    'lab': 'Lab',
    'imaging': 'Imaging',
    'procedure': 'Proc',
    'diagnosis': 'Dx',
    'plan': 'Plan',
    'instruction': 'Instr',
    'note': 'Note',
    'referral': 'Ref',
  };
  return labels[category] || category;
}

DiagnosisCard.displayName = 'DiagnosisCard';
