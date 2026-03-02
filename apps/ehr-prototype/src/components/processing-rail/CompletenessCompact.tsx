/**
 * CompletenessCompact
 *
 * Completeness module for the processing rail. Shows an 11px uppercase
 * header with n/m fraction, and always-visible detail rows for each
 * checklist section with status icons. Styled consistently with the
 * Processing module's BatchSummaryRow pattern.
 *
 * Future: rows will be tappable to deep-link to the corresponding
 * section in Review view (see docs/demo/planned/rail-navigation-hub.md).
 */

import React from 'react';
import { CheckCircle, AlertCircle, Circle } from 'lucide-react';
import type { ChecklistItem } from '../../state/selectors/process-view';
import { colors, spaceAround, spaceBetween } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface CompletenessCompactProps {
  checklist: ChecklistItem[];
  style?: React.CSSProperties;
}

// ============================================================================
// Status icon
// ============================================================================

const StatusIcon: React.FC<{ status: ChecklistItem['status'] }> = ({ status }) => {
  switch (status) {
    case 'documented':
      return <CheckCircle size={12} color={colors.fg.positive.secondary} />;
    case 'pending':
      return <AlertCircle size={12} color={colors.fg.attention.secondary} />;
    case 'not-documented':
      return <Circle size={12} color={colors.fg.neutral.disabled} />;
  }
};

// ============================================================================
// Component
// ============================================================================

export const CompletenessCompact: React.FC<CompletenessCompactProps> = ({
  checklist,
  style,
}) => {
  const documented = checklist.filter(c => c.status === 'documented').length;
  const total = checklist.length;

  return (
    <div style={{ ...style }} data-testid="completeness-compact">
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.label}>Completeness</span>
        <span style={styles.fraction}>{documented}/{total}</span>
      </div>

      {/* Detail rows */}
      <div style={styles.detailList}>
        {checklist.map((item) => (
          <div
            key={item.id}
            style={styles.detailRow}
            data-testid={`completeness-detail-${item.id}`}
          >
            <span style={styles.detailLeft}>
              <StatusIcon status={item.status} />
              <span
                style={{
                  ...styles.detailLabel,
                  color: item.status === 'not-documented'
                    ? colors.fg.neutral.disabled
                    : colors.fg.neutral.primary,
                }}
              >
                {item.label}
              </span>
            </span>
            {item.itemCount > 0 && (
              <span style={styles.detailCount}>{item.itemCount}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.fg.neutral.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  fraction: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.fg.neutral.secondary,
    fontVariantNumeric: 'tabular-nums',
  },
  detailList: {
    paddingBottom: spaceBetween.coupled,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceBetween.coupled}px ${spaceAround.compact}px ${spaceBetween.coupled}px ${spaceAround.default}px`,
    minHeight: 28,
  },
  detailLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    minWidth: 0,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 500,
    lineHeight: '16px',
    wordBreak: 'break-word' as const,
  },
  detailCount: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.fg.neutral.secondary,
    fontVariantNumeric: 'tabular-nums',
  },
};

CompletenessCompact.displayName = 'CompletenessCompact';
