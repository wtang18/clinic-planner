/**
 * DiagnosisCard Component
 *
 * Specialized card for displaying diagnosis items.
 */

import React from 'react';
import { Activity, Clock, Link } from 'lucide-react';
import type { ChartItem, DiagnosisItem } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { StatusBadge } from '../primitives/StatusBadge';
import { CardIconContainer } from '../primitives/CardIconContainer';
import { ListItemRow } from '../primitives/ListItemRow';
import { MetadataRow } from '../primitives/MetadataRow';

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
  const isCompact = variant === 'compact';
  const { data } = diagnosis;

  const isChronic = data.type === 'chronic';
  const isPrimary = data.ranking === 'primary' || data.ranking === 1;

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
    flexWrap: 'wrap',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: isCompact ? 14 : 16,
    lineHeight: isCompact ? '20px' : '24px',
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    margin: 0,
  };

  const icdCodeStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.mono,
    color: colors.fg.neutral.spotReadable,
    backgroundColor: colors.bg.neutral.subtle,
    padding: `${spaceAround.nudge2}px ${spaceAround.tight}px`,
    borderRadius: borderRadius.xs,
  };

  const linkedItemsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    color: colors.fg.neutral.spotReadable,
    fontSize: 12,
  };

  const linkedItemsListStyle: React.CSSProperties = {
    marginTop: spaceAround.compact,
    paddingTop: spaceAround.compact,
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
          {isChronic
            ? <Clock size={isCompact ? 16 : 20} />
            : <Activity size={isCompact ? 16 : 20} />
          }
        </CardIconContainer>

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
              {data.clinicalStatus && (
                <StatusBadge status={data.clinicalStatus} />
              )}
            </div>
          </div>

          {/* Meta info */}
          <MetadataRow
            items={[
              { value: <span style={{ textTransform: 'capitalize' }}>{data.type}</span> },
              ...(data.onsetDate ? [{ label: 'Onset', value: formatDate(data.onsetDate) }] : []),
              ...(linkedItems.length > 0 ? [{
                icon: <Link size={12} />,
                value: `${linkedItems.length} linked`,
              }] : []),
            ]}
          />

          {/* Linked items (expanded view) */}
          {!isCompact && linkedItems.length > 0 && (
            <div style={linkedItemsListStyle}>
              <div style={{
                fontSize: 12,
                fontWeight: typography.fontWeight.medium,
                color: colors.fg.neutral.secondary,
                marginBottom: spaceAround.tight,
              }}>
                Linked Items
              </div>
              {linkedItems.slice(0, 5).map((item) => (
                <ListItemRow
                  key={item.id}
                  compact
                  style={{ fontSize: 12, color: colors.fg.neutral.secondary }}
                >
                  <Badge
                    variant="default"
                    size="sm"
                  >
                    {getCategoryLabel(item.category)}
                  </Badge>
                  <span>{item.displayText}</span>
                </ListItemRow>
              ))}
              {linkedItems.length > 5 && (
                <div style={{
                  fontSize: 12,
                  color: colors.fg.neutral.disabled,
                  paddingTop: spaceAround.nudge4,
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
