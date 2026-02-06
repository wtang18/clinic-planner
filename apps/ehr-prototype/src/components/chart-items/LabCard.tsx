/**
 * LabCard Component
 *
 * Specialized card for displaying lab items with results highlighting.
 */

import React from 'react';
import { FlaskConical, AlertTriangle } from 'lucide-react';
import type { LabItem, LabResult } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { StatusBadge } from '../primitives/StatusBadge';
import { Button } from '../primitives/Button';
import { CardIconContainer } from '../primitives/CardIconContainer';
import { AbnormalFlag } from '../primitives/AbnormalFlag';
import { MetadataRow } from '../primitives/MetadataRow';

// ============================================================================
// Types
// ============================================================================

export interface LabCardProps {
  /** The lab item to display */
  lab: LabItem;
  /** Display variant */
  variant?: 'compact' | 'expanded';
  /** Called when view results is clicked */
  onViewResults?: () => void;
  /** Whether the card is selected */
  selected?: boolean;
  /** Called when selected */
  onSelect?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Helper Components
// ============================================================================

interface ResultRowProps {
  result: LabResult;
  compact?: boolean;
}

const ResultRow: React.FC<ResultRowProps> = ({ result, compact }) => {
  const isAbnormal = result.flag && result.flag !== 'normal';
  const isCritical = result.flag === 'critical';

  const flagBgColor = isCritical
    ? colors.bg.alert.subtle
    : isAbnormal
    ? colors.bg.attention.subtle
    : 'transparent';

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceBetween.repeating,
    padding: compact ? `${spaceAround.nudge4}px 0` : `${spaceAround.tight}px 0`,
  };

  const componentStyle: React.CSSProperties = {
    fontSize: compact ? 12 : 14,
    color: colors.fg.neutral.secondary,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const valueContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: isAbnormal ? `${spaceAround.nudge2}px ${spaceAround.tight}px` : 0,
    backgroundColor: flagBgColor,
    borderRadius: borderRadius.xs,
  };

  const rangeStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.disabled,
    marginLeft: spaceAround.tight,
  };

  return (
    <div style={rowStyle}>
      <span style={componentStyle}>{result.component}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.repeating }}>
        <div style={valueContainerStyle}>
          <AbnormalFlag
            flag={result.flag}
            value={result.value}
            unit={result.unit}
            size={compact ? 'sm' : 'md'}
            style={{ fontFamily: typography.fontFamily.mono }}
          />
        </div>
        {!compact && (
          <span style={rangeStyle}>({result.referenceRange})</span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================

export const LabCard: React.FC<LabCardProps> = ({
  lab,
  variant = 'compact',
  onViewResults,
  selected = false,
  onSelect,
  style,
}) => {
  const isCompact = variant === 'compact';
  const { data } = lab;

  // Check for abnormal results
  const abnormalResults = data.results?.filter(r => r.flag && r.flag !== 'normal') || [];
  const criticalResults = data.results?.filter(r => r.flag === 'critical') || [];
  const hasAbnormal = abnormalResults.length > 0;
  const hasCritical = criticalResults.length > 0;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedCompact,
    padding: isCompact ? spaceAround.compact : spaceAround.default,
    cursor: onSelect ? 'pointer' : 'default',
    transition: `all ${transitions.fast}`,
    ...(selected && {
      backgroundColor: colors.bg.accent.subtle,
    }),
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.relatedCompact,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  };

  const titleRowStyle: React.CSSProperties = {
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


  const resultsContainerStyle: React.CSSProperties = {
    marginTop: spaceAround.tight,
    paddingTop: spaceAround.tight,
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
        {/* Header */}
        <div style={headerStyle}>
          <CardIconContainer color={hasCritical ? 'alert' : 'default'} size={isCompact ? 'md' : 'lg'}>
            {hasCritical
              ? <AlertTriangle size={isCompact ? 16 : 20} />
              : <FlaskConical size={isCompact ? 16 : 20} />
            }
          </CardIconContainer>

          <div style={contentStyle}>
            <div style={titleRowStyle}>
              <div style={titleContainerStyle}>
                <p style={titleStyle}>
                  {data.panelName || data.testName}
                </p>
                <StatusBadge
                  status={data.orderStatus}
                  label={getOrderStatusLabel(data.orderStatus)}
                  customMap={LAB_ORDER_STATUS_MAP}
                />
                {hasCritical && (
                  <Badge variant="error" size="sm">Critical</Badge>
                )}
                {hasAbnormal && !hasCritical && (
                  <Badge variant="warning" size="sm">Abnormal</Badge>
                )}
              </div>
            </div>

            <MetadataRow
              items={[
                ...(data.priority !== 'routine' ? [{
                  value: <span style={{ color: data.priority === 'stat' ? colors.fg.alert.secondary : colors.fg.attention.secondary }}>{data.priority.toUpperCase()}</span>,
                }] : []),
                ...(data.labVendor ? [{ value: data.labVendor }] : []),
                ...(data.collectionType ? [{ value: data.collectionType }] : []),
                ...(data.resultedAt ? [{ label: 'Resulted', value: formatDate(data.resultedAt) }] : []),
              ]}
            />
          </div>
        </div>

        {/* Results (expanded view or if there are abnormal results in compact) */}
        {data.results && data.results.length > 0 && (!isCompact || hasAbnormal) && (
          <div style={resultsContainerStyle}>
            {(isCompact ? abnormalResults.slice(0, 3) : data.results).map((result, index) => (
              <ResultRow key={`${result.component}-${index}`} result={result} compact={isCompact} />
            ))}
            {isCompact && data.results.length > abnormalResults.length && (
              <div style={{
                fontSize: 12,
                color: colors.fg.neutral.spotReadable,
                paddingTop: spaceAround.tight,
              }}>
                + {data.results.length - abnormalResults.slice(0, 3).length} more results
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!isCompact && onViewResults && data.orderStatus === 'resulted' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: spaceAround.tight }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewResults();
              }}
            >
              View Full Results
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function getOrderStatusLabel(status: LabItem['data']['orderStatus']): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'ordered':
      return 'Ordered';
    case 'collected':
      return 'Collected';
    case 'processing':
      return 'Processing';
    case 'resulted':
      return 'Resulted';
    default:
      return status;
  }
}

const LAB_ORDER_STATUS_MAP: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  'draft': 'default',
  'ordered': 'info',
  'collected': 'info',
  'processing': 'warning',
  'resulted': 'success',
};

function formatDate(date: Date): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

LabCard.displayName = 'LabCard';
