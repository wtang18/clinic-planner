/**
 * ProcessingRail
 *
 * 200px sidebar showing unified encounter status during capture mode.
 * Single module card with 14 rows grouped by clinical workflow phase:
 *
 * - History: CC, HPI, Physical Exam
 * - Reasoning: Assessment, Plan
 * - Orders: Rx, Labs, Imaging, Referrals
 * - Documentation: Instructions, Visit Note
 * - Closure: Charge Nav, Sign-off
 *
 * Groups are separated by thin dividers (no headers). Each row combines
 * a completeness dimension (left icon) with a processing dimension
 * (right-side chips/counts).
 *
 * At narrow widths, CaptureView uses RailFloatingStatus instead of this
 * component — ProcessingRail is only rendered for the 'full' rail tier.
 */

import React from 'react';
import { useSelector } from '../../hooks/useEncounterState';
import { selectUnifiedRailRows, RAIL_GROUPS } from '../../state/selectors/process-view';
import type { RailRow, RailGroup } from '../../types/drafts';
import { UnifiedRailRow } from './UnifiedRailRow';
import { colors, spaceAround, spaceBetween, borderRadius, label, LAYOUT } from '../../styles/foundations';

/** @deprecated Use LAYOUT.railWidth instead */
export const RAIL_WIDTH = LAYOUT.railWidth;

export interface ProcessingRailProps {
  /** Called when any row is tapped — navigates to the target section */
  onRowTap?: (deepLink: RailRow['deepLink']) => void;
  style?: React.CSSProperties;
}

export function ProcessingRail({
  onRowTap,
  style,
}: ProcessingRailProps) {
  const rows = useSelector(selectUnifiedRailRows);

  // Group rows by their group property
  const rowsByGroup = React.useMemo(() => {
    const grouped = new Map<RailGroup, RailRow[]>();
    for (const group of RAIL_GROUPS) {
      grouped.set(group, []);
    }
    for (const row of rows) {
      grouped.get(row.group)!.push(row);
    }
    return grouped;
  }, [rows]);

  return (
    <div style={{ ...styles.rail, ...style }}>
      <div style={styles.module}>
        <div style={styles.moduleHeader}>
          <span style={styles.moduleHeaderText}>Encounter Status</span>
        </div>
        {RAIL_GROUPS.map((group, gi) => {
          const groupRows = rowsByGroup.get(group) || [];
          if (groupRows.length === 0) return null;
          return (
            <React.Fragment key={group}>
              {gi > 0 && <div style={styles.groupDivider} />}
              <div
                style={styles.group}
                data-testid={`rail-group-${group}`}
              >
              {groupRows.map((row, ri) => (
                <UnifiedRailRow
                  key={row.id}
                  row={row}
                  isLastInGroup={ri === groupRows.length - 1}
                  onRowTap={onRowTap}
                />
              ))}
            </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  rail: {
    width: LAYOUT.railWidth,
    minWidth: LAYOUT.railWidth,
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
  module: {
    backgroundColor: colors.bg.neutral.base,
    border: '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  moduleHeader: {
    padding: `${spaceBetween.repeating}px ${spaceAround.compact}px`,
    paddingBottom: spaceBetween.repeatingSm,
  },
  moduleHeaderText: {
    fontSize: label.xs.semibold.fontSize,
    lineHeight: `${label.xs.semibold.lineHeight}px`,
    fontWeight: label.xs.semibold.fontWeight as React.CSSProperties['fontWeight'],
    color: colors.fg.neutral.secondary,
  },
  group: {
    // No margin — dividers handle visual separation between groups
  },
  groupDivider: {
    height: 1,
    backgroundColor: colors.border.neutral.low,
    marginLeft: spaceAround.compact,
    marginRight: spaceAround.compact,
    marginTop: spaceBetween.repeatingSm,
    marginBottom: spaceBetween.repeatingSm,
  },
};
