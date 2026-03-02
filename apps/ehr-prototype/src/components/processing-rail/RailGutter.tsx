/**
 * RailGutter Component
 *
 * Collapsed 40px icon strip variant of the processing rail.
 * Shows aggregate status indicators for processing batches.
 * Each icon is tappable — will open a popover with detail (Phase 3).
 *
 * Current implementation: minimal shell with a processing status dot
 * derived from batch aggregate status. Completeness and E&M icons
 * will be added in Phase 2/3.
 */

import React from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import type { BatchSummary } from '../../types/drafts';
import { colors, borderRadius, LAYOUT } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface RailGutterProps {
  batches: BatchSummary[];
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

// ============================================================================
// Component
// ============================================================================

export const RailGutter: React.FC<RailGutterProps> = ({ batches, style }) => {
  const status = getAggregateStatus(batches);

  return (
    <div style={{ ...styles.container, ...style }} data-testid="rail-gutter">
      {/* Processing aggregate dot */}
      <div style={styles.iconSlot} title="Processing status">
        <StatusIcon status={status} />
      </div>

      {/* Completeness icon — Phase 2 */}
      {/* E&M icon — Phase 2 */}
    </div>
  );
};

const StatusIcon: React.FC<{ status: AggregateStatus }> = ({ status }) => {
  switch (status) {
    case 'needs-attention':
      return <AlertCircle size={18} color={colors.fg.alert.secondary} />;
    case 'in-progress':
      return <Loader size={18} color={colors.fg.information.secondary} />;
    case 'complete':
      return <CheckCircle size={18} color={colors.fg.positive.secondary} />;
    case 'idle':
      return <CheckCircle size={18} color={colors.fg.neutral.disabled} />;
  }
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: LAYOUT.railGutterWidth,
    minWidth: LAYOUT.railGutterWidth,
    backgroundColor: colors.bg.neutral.base,
    border: '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: borderRadius.sm,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 0',
    gap: 12,
    alignSelf: 'flex-start',
  },
  iconSlot: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
  },
};

RailGutter.displayName = 'RailGutter';
