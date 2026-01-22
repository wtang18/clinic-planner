/**
 * LabCard Component
 *
 * Specialized card for displaying lab items with results highlighting.
 */

import React from 'react';
import type { LabItem, LabResult } from '../../types/chart-items';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { getCategoryColor } from '../../styles/utils';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';

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
// Icons
// ============================================================================

const LabIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 3h6v5.5l3 5.5v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4l3-5.5V3z" />
    <path d="M9 3h6" />
  </svg>
);

const AlertIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5,12 12,5 19,12" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19,12 12,19 5,12" />
  </svg>
);

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
  const isHigh = result.flag === 'high' || result.flag === 'critical';
  const isLow = result.flag === 'low';

  const flagColor = isCritical
    ? colors.status.error
    : isAbnormal
    ? colors.status.warning
    : colors.neutral[600];

  const flagBgColor = isCritical
    ? colors.status.errorLight
    : isAbnormal
    ? colors.status.warningLight
    : 'transparent';

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    padding: compact ? `${spacing[1]} 0` : `${spacing[2]} 0`,
    borderBottom: `1px solid ${colors.neutral[100]}`,
  };

  const componentStyle: React.CSSProperties = {
    fontSize: compact ? typography.fontSize.xs[0] : typography.fontSize.sm[0],
    color: colors.neutral[700],
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const valueContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    padding: isAbnormal ? `${spacing[0.5]} ${spacing[2]}` : 0,
    backgroundColor: flagBgColor,
    borderRadius: radii.base,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: compact ? typography.fontSize.xs[0] : typography.fontSize.sm[0],
    fontWeight: isAbnormal ? typography.fontWeight.semibold : typography.fontWeight.normal,
    color: flagColor,
    fontFamily: typography.fontFamily.mono,
  };

  const unitStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
  };

  const rangeStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[400],
    marginLeft: spacing[2],
  };

  return (
    <div style={rowStyle}>
      <span style={componentStyle}>{result.component}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
        <div style={valueContainerStyle}>
          {isAbnormal && (
            <span style={{ width: '12px', height: '12px', display: 'flex', color: flagColor }}>
              {isHigh ? <ArrowUpIcon /> : isLow ? <ArrowDownIcon /> : null}
            </span>
          )}
          <span style={valueStyle}>{result.value}</span>
          <span style={unitStyle}>{result.unit}</span>
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
  const categoryColors = getCategoryColor('lab');
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
    gap: spacing[3],
    padding: isCompact ? spacing[3] : spacing[4],
    borderLeft: `3px solid ${hasCritical ? colors.status.error : hasAbnormal ? colors.status.warning : categoryColors.border}`,
    cursor: onSelect ? 'pointer' : 'default',
    transition: `all ${transitions.fast}`,
    ...(selected && {
      backgroundColor: colors.primary[50],
    }),
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing[3],
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isCompact ? '32px' : '40px',
    height: isCompact ? '32px' : '40px',
    backgroundColor: hasCritical ? colors.status.errorLight : hasAbnormal ? colors.status.warningLight : categoryColors.lightBg,
    borderRadius: radii.lg,
    color: hasCritical ? colors.status.error : hasAbnormal ? colors.status.warning : categoryColors.icon,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
  };

  const titleRowStyle: React.CSSProperties = {
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

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
  };

  const resultsContainerStyle: React.CSSProperties = {
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTop: `1px solid ${colors.neutral[200]}`,
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
          <div style={iconContainerStyle}>
            <div style={{ width: isCompact ? '16px' : '20px', height: isCompact ? '16px' : '20px' }}>
              {hasCritical ? <AlertIcon /> : <LabIcon />}
            </div>
          </div>

          <div style={contentStyle}>
            <div style={titleRowStyle}>
              <div style={titleContainerStyle}>
                <p style={titleStyle}>
                  {data.panelName || data.testName}
                </p>
                <Badge variant={getOrderStatusVariant(data.orderStatus)} size="sm">
                  {getOrderStatusLabel(data.orderStatus)}
                </Badge>
                {hasCritical && (
                  <Badge variant="error" size="sm">Critical</Badge>
                )}
                {hasAbnormal && !hasCritical && (
                  <Badge variant="warning" size="sm">Abnormal</Badge>
                )}
              </div>
            </div>

            <div style={metaStyle}>
              {data.priority !== 'routine' && (
                <span style={{ color: data.priority === 'stat' ? colors.status.error : colors.status.warning }}>
                  {data.priority.toUpperCase()}
                </span>
              )}
              {data.labVendor && <span>{data.labVendor}</span>}
              {data.collectionType && <span>{data.collectionType}</span>}
              {data.resultedAt && (
                <span>Resulted: {formatDate(data.resultedAt)}</span>
              )}
            </div>
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
                fontSize: typography.fontSize.xs[0],
                color: colors.neutral[500],
                paddingTop: spacing[2],
              }}>
                + {data.results.length - abnormalResults.slice(0, 3).length} more results
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!isCompact && onViewResults && data.orderStatus === 'resulted' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: spacing[2] }}>
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

function getOrderStatusVariant(status: LabItem['data']['orderStatus']): 'default' | 'success' | 'warning' | 'info' {
  switch (status) {
    case 'draft':
      return 'default';
    case 'ordered':
      return 'info';
    case 'collected':
      return 'info';
    case 'processing':
      return 'warning';
    case 'resulted':
      return 'success';
    default:
      return 'default';
  }
}

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
