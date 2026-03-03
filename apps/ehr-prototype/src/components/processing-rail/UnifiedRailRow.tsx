/**
 * UnifiedRailRow
 *
 * A single row in the unified processing rail. Combines completeness
 * (left icon) and processing status (right side) into one scannable row.
 *
 * Left slot rendering:
 * - Processing rows with items → chevron (▸/▾) for expand/collapse
 * - Documentation rows → presence icon (✓ dark or ○ gray)
 * - Empty processing rows → 14px placeholder
 *
 * Right slot rendering:
 * - Processing rows with items → status chips (⟳n ●n ✓n)
 * - Special label (Charge Nav E&M code) → label text
 * - Documentation rows with items → item count
 * - Empty processing rows → "—"
 * - Otherwise → nothing
 */

import React from 'react';
import { ChevronDown, ChevronRight, Check, Circle } from 'lucide-react';
import type { RailRow } from '../../types/drafts';
import { Spinner } from '../primitives/Spinner';
import { colors, spaceAround, spaceBetween, body } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface UnifiedRailRowProps {
  row: RailRow;
  /** Whether this is the last row in its group (omits bottom border) */
  isLastInGroup?: boolean;
  /** Called when the row is tapped — navigates to the target section */
  onRowTap?: (deepLink: RailRow['deepLink']) => void;
}

// ============================================================================
// Status Chips (reused from BatchSummaryRow pattern)
// ============================================================================

const CHIP_DOT_SIZE = 6;

const StatusChips: React.FC<{ chips: RailRow['processing'] extends infer T ? T extends { chips: infer C } ? C : never : never }> = ({ chips }) => {
  if (!chips) return null;
  return (
    <span style={styles.chipsContainer}>
      {chips.inProgress > 0 && (
        <span style={styles.chip} data-testid="chip-in-progress">
          <Spinner size="xs" color={colors.fg.information.secondary} />
          <span style={{ ...styles.chipCount, color: colors.fg.information.secondary }}>
            {chips.inProgress}
          </span>
        </span>
      )}
      {chips.needsAttention > 0 && (
        <span style={styles.chip} data-testid="chip-needs-attention">
          <span style={{
            width: CHIP_DOT_SIZE,
            height: CHIP_DOT_SIZE,
            borderRadius: '50%',
            backgroundColor: colors.fg.alert.secondary,
            flexShrink: 0,
          }} />
          <span style={{ ...styles.chipCount, color: colors.fg.alert.secondary }}>
            {chips.needsAttention}
          </span>
        </span>
      )}
      {chips.complete > 0 && (
        <span style={styles.chip} data-testid="chip-complete">
          <Check size={10} strokeWidth={2.5} color={colors.fg.positive.primary} />
          <span style={{ ...styles.chipCount, color: colors.fg.positive.primary }}>
            {chips.complete}
          </span>
        </span>
      )}
    </span>
  );
};

// ============================================================================
// Presence Icon
// ============================================================================

const ICON_SIZE = 12;

const PresenceIcon: React.FC<{ presence: RailRow['presence'] }> = ({ presence }) => {
  switch (presence) {
    case 'present':
      return <Check size={ICON_SIZE} strokeWidth={2.5} color={colors.fg.neutral.primary} />;
    case 'not-present':
      return <Circle size={ICON_SIZE} color={colors.fg.neutral.disabled} />;
    default:
      return null;
  }
};

// ============================================================================
// Item Status Dot (for expanded child items)
// ============================================================================

const ItemStatusDot: React.FC<{ status: string }> = ({ status }) => {
  if (['in-progress', 'generating', 'updating'].includes(status)) {
    return <Spinner size="xs" color={colors.fg.information.secondary} />;
  }
  if (['needs-attention', 'pending'].includes(status)) {
    return <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.fg.alert.secondary, flexShrink: 0 }} />;
  }
  if (['complete', 'accepted'].includes(status)) {
    return <Check size={10} strokeWidth={2.5} color={colors.fg.positive.primary} />;
  }
  return <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.fg.neutral.disabled, flexShrink: 0 }} />;
};

// ============================================================================
// Component
// ============================================================================

const CHEVRON_SIZE = 14;

export function UnifiedRailRow({
  row,
  isLastInGroup = false,
  onRowTap,
}: UnifiedRailRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hasProcessingItems = row.processing !== null && row.processing.items.length > 0;
  const isEmpty = row.presence === null && !hasProcessingItems;

  // Left slot: chevron for processing rows with items, presence icon for others
  const showChevron = hasProcessingItems;
  const showPresenceIcon = !showChevron && row.presence !== null;

  const handleRowClick = React.useCallback(() => {
    if (hasProcessingItems) {
      // Chevron rows: expand/collapse on row tap
      setExpanded(prev => !prev);
    } else if (row.presence !== null && onRowTap) {
      // ✓ or ○ rows: navigate to section
      onRowTap(row.deepLink);
    }
    // null presence + no items: no action
  }, [hasProcessingItems, row.presence, row.deepLink, onRowTap]);

  const handleItemClick = React.useCallback((itemDeepLink?: RailRow['deepLink']) => {
    if (itemDeepLink && onRowTap) {
      onRowTap(itemDeepLink);
    }
  }, [onRowTap]);

  // Determine right-side content
  const renderRightSide = () => {
    // Processing chips
    if (hasProcessingItems && row.processing) {
      return <StatusChips chips={row.processing.chips} />;
    }
    // Special label (Charge Nav E&M code)
    if (row.specialLabel) {
      return <span style={styles.specialLabel}>{row.specialLabel}</span>;
    }
    // Item count for documentation rows
    if (row.itemCount > 0 && !row.processing) {
      return <span style={styles.itemCount}>{row.itemCount}</span>;
    }
    // Empty processing-capable row
    if (row.processing !== null || row.specialLabel !== undefined) {
      return <span style={styles.emptyDash}>—</span>;
    }
    // Truly empty processing row (no batch data, no items)
    if (row.presence === null) {
      return <span style={styles.emptyDash}>—</span>;
    }
    return null;
  };

  return (
    <div style={isLastInGroup ? styles.containerLast : styles.container}>
      <div
        style={{
          ...styles.header,
          cursor: hasProcessingItems || row.presence !== null ? 'pointer' : 'default',
          opacity: isEmpty ? 0.5 : 1,
        }}
        role="button"
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRowClick(); }}
        aria-expanded={showChevron ? expanded : undefined}
        data-testid={`rail-row-${row.id}`}
      >
        <span style={styles.headerLeft}>
          {/* Left slot: chevron or presence icon or placeholder */}
          {showChevron ? (
            <span
              style={styles.chevronIcon}
              aria-hidden="true"
            >
              {expanded ? <ChevronDown size={CHEVRON_SIZE} /> : <ChevronRight size={CHEVRON_SIZE} />}
            </span>
          ) : showPresenceIcon ? (
            <span style={styles.presenceIcon}>
              <PresenceIcon presence={row.presence} />
            </span>
          ) : (
            <span style={styles.leftPlaceholder} />
          )}
          <span
            style={{
              ...styles.label,
              color: row.presence === 'not-present' && !hasProcessingItems
                ? colors.fg.neutral.disabled
                : colors.fg.neutral.primary,
            }}
          >
            {row.label}
          </span>
        </span>
        <span style={styles.headerRight}>
          {renderRightSide()}
        </span>
      </div>

      {/* Expanded items — status dot + label, aligned with parent icon/label columns */}
      {expanded && hasProcessingItems && row.processing && (
        <div style={styles.itemList}>
          {row.processing.items.map(item => (
            <div
              key={item.kind === 'draft' ? item.draftId : item.taskId}
              style={{
                ...styles.itemRow,
                cursor: item.deepLink ? 'pointer' : 'default',
              }}
              role={item.deepLink ? 'button' : undefined}
              tabIndex={item.deepLink ? 0 : undefined}
              onClick={() => handleItemClick(item.deepLink)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleItemClick(item.deepLink); }}
            >
              <span style={styles.itemIconCol}>
                <ItemStatusDot status={item.status} />
              </span>
              <span style={styles.itemLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    // No within-group borders — groups are separated by spacing gaps in ProcessingRail
  },
  containerLast: {
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: `${spaceBetween.repeating}px ${spaceAround.compact}px`,
    minHeight: 28,
    background: 'transparent',
    border: 'none',
    textAlign: 'left' as const,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    minWidth: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    wordBreak: 'break-word' as const,
  },
  chevronIcon: {
    display: 'flex',
    alignItems: 'center',
    color: colors.fg.neutral.secondary,
    flexShrink: 0,
    width: CHEVRON_SIZE,
  },
  presenceIcon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    width: CHEVRON_SIZE,
    justifyContent: 'center',
  },
  leftPlaceholder: {
    width: CHEVRON_SIZE,
    flexShrink: 0,
  },
  emptyDash: {
    ...body.sm,
    color: colors.fg.neutral.secondary,
  },
  specialLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.fg.neutral.secondary,
    fontVariantNumeric: 'tabular-nums',
  },
  itemCount: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.fg.neutral.secondary,
    fontVariantNumeric: 'tabular-nums',
  },
  chipsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
  },
  chipCount: {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: '14px',
  },
  itemList: {
    paddingBottom: spaceBetween.repeating,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.coupled,
    padding: `2px ${spaceAround.compact}px`,
  },
  itemIconCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: CHEVRON_SIZE,
    flexShrink: 0,
    minHeight: 18,
  },
  itemLabel: {
    fontSize: 12,
    lineHeight: '18px',
    fontWeight: 400,
    color: colors.fg.neutral.secondary,
  },
};
