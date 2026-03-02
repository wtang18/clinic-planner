/**
 * RailFloatingStatus Component
 *
 * Compact floating pill that keeps processing awareness visible when the
 * full 200px rail is collapsed at narrow widths. Shows aggregate processing
 * status (icon + label). Tapping navigates to the Process view.
 *
 * Uses `position: sticky` to pin below the top bar on scroll, with a
 * glass.floating blur treatment for visual integration.
 */

import React from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useProcessingBatches } from '../../hooks/useProcessingBatches';
import type { BatchSummary } from '../../types/drafts';
import { colors, borderRadius, glass, LAYOUT } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface RailFloatingStatusProps {
  onTap: () => void;
  style?: React.CSSProperties;
}

type AggregateStatus = 'idle' | 'in-progress' | 'needs-attention' | 'complete';

// ============================================================================
// Helpers
// ============================================================================

function getAggregateStatus(batches: BatchSummary[]): AggregateStatus {
  const hasAttention = batches.some(b => b.statusBreakdown.needsAttention > 0);
  if (hasAttention) return 'needs-attention';

  const hasInProgress = batches.some(b => b.statusBreakdown.inProgress > 0);
  if (hasInProgress) return 'in-progress';

  const hasComplete = batches.some(b => b.statusBreakdown.complete > 0);
  if (hasComplete) return 'complete';

  return 'idle';
}

function getSummaryLabel(batches: BatchSummary[]): string {
  const attentionCount = batches.reduce((sum, b) => sum + b.statusBreakdown.needsAttention, 0);
  if (attentionCount > 0) {
    return `${attentionCount} item${attentionCount === 1 ? '' : 's'} need${attentionCount === 1 ? 's' : ''} attention`;
  }

  const inProgressCount = batches.reduce((sum, b) => sum + b.statusBreakdown.inProgress, 0);
  if (inProgressCount > 0) {
    return `${inProgressCount} processing`;
  }

  const completeCount = batches.reduce((sum, b) => sum + b.statusBreakdown.complete, 0);
  if (completeCount > 0) {
    return 'Processing complete';
  }

  return 'All clear';
}

const StatusIcon: React.FC<{ status: AggregateStatus }> = ({ status }) => {
  switch (status) {
    case 'needs-attention':
      return <AlertCircle size={14} color={colors.fg.alert.secondary} />;
    case 'in-progress':
      return <Loader size={14} color={colors.fg.information.secondary} />;
    case 'complete':
      return <CheckCircle size={14} color={colors.fg.positive.secondary} />;
    case 'idle':
      return <CheckCircle size={14} color={colors.fg.neutral.disabled} />;
  }
};

// ============================================================================
// Component
// ============================================================================

export function RailFloatingStatus({ onTap, style }: RailFloatingStatusProps) {
  const batches = useProcessingBatches();
  const hasAnyItems = batches.some(b => b.count > 0);

  if (!hasAnyItems) return null;

  const status = getAggregateStatus(batches);
  const label = getSummaryLabel(batches);

  return (
    <button
      onClick={onTap}
      style={{ ...styles.pill, ...style }}
      data-testid="rail-floating-status"
    >
      <StatusIcon status={status} />
      <span style={styles.label}>{label}</span>
    </button>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  pill: {
    // Layout
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    // Sticky behavior
    position: 'sticky',
    top: LAYOUT.headerHeight + 4,
    zIndex: 50, // Between content and nav row
    // Glass treatment
    ...glass.floating,
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    borderRadius: borderRadius.full,
    // Interactive
    cursor: 'pointer',
    // Reset button styles
    fontFamily: 'inherit',
    outline: 'none',
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: colors.fg.neutral.secondary,
    whiteSpace: 'nowrap',
  },
};

RailFloatingStatus.displayName = 'RailFloatingStatus';
