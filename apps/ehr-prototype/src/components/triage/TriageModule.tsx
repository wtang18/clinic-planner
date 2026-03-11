/**
 * TriageModule Component
 *
 * Inline expandable card displaying triage data during charting.
 * Replaces VitalsRail — shows vitals, CC, HPI, PE in the main content area.
 *
 * Header chrome: 14px semibold title case "Triage Summary", right-aligned
 * chevron, hover highlight.
 *
 * Expanded: CC row, responsive VitalCell grid, HPI/PE narrative rows.
 * Collapsed: title + value-first vitals pills + chevron.
 *
 * Clicking a section calls onItemClick → opens corresponding ChartItem in DetailsPane.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { VitalsItem, VitalType, NarrativeItem, PhysicalExamItem } from '../../types/chart-items';
import type { VitalReading } from '../../types/vitals';
import { VitalCell, type VitalCellReading } from './VitalCell';
import { colors, spaceAround, spaceBetween, typography, body, borderRadius, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface TriageModuleProps {
  vitals: VitalsItem[];
  chiefComplaint?: string;
  ccItem?: NarrativeItem;
  hpiItem?: NarrativeItem;
  peItems?: PhysicalExamItem[];
  onItemClick?: (itemId: string) => void;
  defaultExpanded?: boolean;
  style?: React.CSSProperties;
}

// ============================================================================
// Projection: VitalsItem[] → per-VitalType most-recent reading (for collapsed)
// ============================================================================

interface ProjectedVital {
  label: string;
  value: string;
  flag?: 'high' | 'low' | 'critical';
}

function projectReadings(
  vitalsItems: VitalsItem[],
  vitalType: VitalType,
): VitalReading | undefined {
  let latest: VitalReading | undefined;
  for (const item of vitalsItems) {
    const measurement = item.data.measurements.find(m => m.type === vitalType);
    if (measurement) {
      const ts = item.data.capturedAt instanceof Date
        ? item.data.capturedAt
        : new Date(item.data.capturedAt);
      if (!latest || ts.getTime() > latest.timestamp.getTime()) {
        latest = {
          value: measurement.value,
          unit: measurement.unit,
          timestamp: ts,
          flag: measurement.flag,
        };
      }
    }
  }
  return latest;
}

function mapFlag(flag?: VitalReading['flag']): 'high' | 'low' | 'critical' | undefined {
  if (flag === 'high' || flag === 'low' || flag === 'critical') return flag;
  return undefined;
}

function projectVitals(vitals: VitalsItem[]): ProjectedVital[] {
  const result: ProjectedVital[] = [];

  const sys = projectReadings(vitals, 'bp-systolic');
  const dia = projectReadings(vitals, 'bp-diastolic');
  if (sys) {
    const bpValue = dia ? `${sys.value}/${dia.value}` : String(sys.value);
    const bpFlag = sys.flag === 'critical' || dia?.flag === 'critical'
      ? 'critical'
      : mapFlag(sys.flag) || mapFlag(dia?.flag);
    result.push({ label: 'BP', value: bpValue, flag: bpFlag });
  }

  const hr = projectReadings(vitals, 'pulse');
  if (hr) result.push({ label: 'HR', value: `${hr.value} hr`, flag: mapFlag(hr.flag) });

  const rr = projectReadings(vitals, 'resp');
  if (rr) result.push({ label: 'RR', value: `${rr.value} rr`, flag: mapFlag(rr.flag) });

  const temp = projectReadings(vitals, 'temp');
  if (temp) result.push({ label: 'Temp', value: `${temp.value}° F`, flag: mapFlag(temp.flag) });

  const spo2 = projectReadings(vitals, 'spo2');
  if (spo2) result.push({ label: 'SpO₂', value: `${spo2.value}%`, flag: mapFlag(spo2.flag) });

  return result;
}

// ============================================================================
// Projection: VitalsItem[] → VitalCell grid data (for expanded)
// ============================================================================

interface ProjectedVitalCell {
  label: string;
  readings: VitalCellReading[];
  flag?: 'high' | 'low' | 'critical';
}

/** Format a Date as "h:mma" (e.g., "8:58a") */
function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'p' : 'a';
  const displayH = h % 12 || 12;
  return `${displayH}:${m}${ampm}`;
}

/** Collect all readings for a vital type across VitalsItems, sorted newest first. */
function collectReadings(
  vitals: VitalsItem[],
  vitalType: VitalType,
): { value: number; unit: string; flag?: 'high' | 'low' | 'critical'; timestamp: Date; itemId: string }[] {
  const readings: { value: number; unit: string; flag?: 'high' | 'low' | 'critical'; timestamp: Date; itemId: string }[] = [];
  for (const item of vitals) {
    const measurement = item.data.measurements.find(m => m.type === vitalType);
    if (measurement) {
      const ts = item.data.capturedAt instanceof Date
        ? item.data.capturedAt
        : new Date(item.data.capturedAt);
      readings.push({
        value: measurement.value,
        unit: measurement.unit,
        flag: mapFlag(measurement.flag),
        timestamp: ts,
        itemId: item.id,
      });
    }
  }
  // Sort newest first
  readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return readings;
}

function projectVitalsGrid(vitals: VitalsItem[]): ProjectedVitalCell[] {
  const cells: ProjectedVitalCell[] = [];
  const hasMultiple = vitals.length > 1;

  // BP (merged systolic + diastolic)
  const sysReadings = collectReadings(vitals, 'bp-systolic');
  const diaReadings = collectReadings(vitals, 'bp-diastolic');
  if (sysReadings.length > 0) {
    const bpReadings: VitalCellReading[] = sysReadings.map(sys => {
      const dia = diaReadings.find(d => d.timestamp.getTime() === sys.timestamp.getTime());
      return {
        value: dia ? `${sys.value}/${dia.value}` : String(sys.value),
        timestamp: hasMultiple ? formatTime(sys.timestamp) : undefined,
        flag: sys.flag === 'critical' || dia?.flag === 'critical'
          ? 'critical' as const
          : sys.flag || dia?.flag,
        itemId: sys.itemId,
      };
    });
    const topFlag = bpReadings[0]?.flag;
    cells.push({ label: 'bp', readings: bpReadings, flag: topFlag });
  }

  // HR
  const hrReadings = collectReadings(vitals, 'pulse');
  if (hrReadings.length > 0) {
    cells.push({
      label: 'hr',
      readings: hrReadings.map(r => ({
        value: String(r.value),
        timestamp: hasMultiple ? formatTime(r.timestamp) : undefined,
        flag: r.flag,
        itemId: r.itemId,
      })),
      flag: hrReadings[0].flag,
    });
  }

  // RR
  const rrReadings = collectReadings(vitals, 'resp');
  if (rrReadings.length > 0) {
    cells.push({
      label: 'rr',
      readings: rrReadings.map(r => ({
        value: String(r.value),
        timestamp: hasMultiple ? formatTime(r.timestamp) : undefined,
        flag: r.flag,
        itemId: r.itemId,
      })),
      flag: rrReadings[0].flag,
    });
  }

  // Temp
  const tempReadings = collectReadings(vitals, 'temp');
  if (tempReadings.length > 0) {
    cells.push({
      label: '°F',
      readings: tempReadings.map(r => ({
        value: String(r.value),
        timestamp: hasMultiple ? formatTime(r.timestamp) : undefined,
        flag: r.flag,
        itemId: r.itemId,
      })),
      flag: tempReadings[0].flag,
    });
  }

  // SpO₂
  const spo2Readings = collectReadings(vitals, 'spo2');
  if (spo2Readings.length > 0) {
    cells.push({
      label: '% SpO₂',
      readings: spo2Readings.map(r => ({
        value: String(r.value),
        timestamp: hasMultiple ? formatTime(r.timestamp) : undefined,
        flag: r.flag,
        itemId: r.itemId,
      })),
      flag: spo2Readings[0].flag,
    });
  }

  // BMI (computed from latest weight + height)
  const weightReadings = collectReadings(vitals, 'weight');
  const heightReadings = collectReadings(vitals, 'height');
  const latestWeight = weightReadings[0];
  const latestHeight = heightReadings[0];
  if (latestWeight && latestHeight) {
    // Convert to metric for BMI: weight(kg) / height(m)²
    const weightKg = latestWeight.unit === 'lbs'
      ? latestWeight.value * 0.453592
      : latestWeight.value;
    const heightM = latestHeight.unit === 'in'
      ? latestHeight.value * 0.0254
      : latestHeight.unit === 'cm'
      ? latestHeight.value / 100
      : latestHeight.value;
    const bmi = weightKg / (heightM * heightM);
    cells.push({
      label: 'bmi',
      readings: [{ value: bmi.toFixed(1), itemId: latestWeight.itemId }],
    });
  } else {
    // Show placeholder if missing
    cells.push({
      label: 'bmi',
      readings: [{ value: '--' }],
    });
  }

  return cells;
}

// ============================================================================
// Collapsed pill color helpers
// ============================================================================

function pillBg(flag?: ProjectedVital['flag']): string {
  switch (flag) {
    case 'high': case 'low': return colors.bg.alert.low;
    case 'critical': return colors.bg.alert.medium;
    default: return colors.bg.transparent.subtle;
  }
}

function pillFg(flag?: ProjectedVital['flag']): string {
  switch (flag) {
    case 'high': case 'low': case 'critical': return colors.fg.alert.primary;
    default: return colors.fg.neutral.primary;
  }
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Callback-ref based ResizeObserver hook.
 *
 * useContainerWidth depended on a stable useRef object — when the grid div
 * unmounted (collapse) and remounted (expand), the observer never re-attached
 * and containerWidth stayed 0. A callback ref fires every time the DOM node
 * attaches or detaches, solving the re-measurement problem.
 */
function useResizeObserver(): [React.RefCallback<HTMLDivElement>, number] {
  const [width, setWidth] = useState(0);
  const roRef = useRef<ResizeObserver | null>(null);

  const callbackRef = useCallback((node: HTMLDivElement | null) => {
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    if (node) {
      setWidth(node.getBoundingClientRect().width);
      const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
      ro.observe(node);
      roRef.current = ro;
    }
  }, []);

  return [callbackRef, width];
}

// ============================================================================
// Layout helper
// ============================================================================

/** Round-robin distribute items into N columns for true vertical stacking. */
function distributeIntoColumns<T>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));
  return columns;
}

// ============================================================================
// Component
// ============================================================================

export const TriageModule: React.FC<TriageModuleProps> = ({
  vitals,
  chiefComplaint,
  ccItem,
  hpiItem,
  peItems,
  onItemClick,
  defaultExpanded = true,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isHovered, setIsHovered] = useState(false);
  const [gridRef, containerWidth] = useResizeObserver();

  const projected = useMemo(() => projectVitals(vitals), [vitals]);
  const gridCells = useMemo(() => projectVitalsGrid(vitals), [vitals]);
  const gridCols = containerWidth === 0 ? 6 : containerWidth >= 860 ? 6 : containerWidth >= 420 ? 3 : 2;
  const hasVitals = projected.length > 0;

  // Determine CC display text
  const ccText = ccItem?.displayText || chiefComplaint;

  // PE summary
  const peCount = peItems?.length || 0;
  const peSummary = peCount > 0
    ? `${peCount} system${peCount > 1 ? 's' : ''} documented`
    : undefined;

  // Check if anything to show
  const hasCC = !!ccText;
  const hasHPI = !!hpiItem?.displayText;
  const hasPE = peCount > 0;
  if (!hasCC && !hasVitals && !hasHPI && !hasPE) return null;

  // ── Collapsed ──
  if (!isExpanded) {
    return (
      <div style={{ ...styles.container, ...style }}>
        <div
          style={{
            ...styles.header,
            backgroundColor: isHovered ? colors.bg.transparent.subtle : 'transparent',
          }}
          role="button"
          tabIndex={0}
          onClick={() => setIsExpanded(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsExpanded(true); } }}
        >
          <span style={styles.headerTitle}>Triage Summary</span>
          {/* Vitals-only value-first pills */}
          <span style={styles.collapsedSummary}>
            {hasVitals && projected.map((v) => (
              <span key={v.label} style={{
                padding: '1px 6px',
                borderRadius: borderRadius.xs,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: typography.fontFamily.sans,
                whiteSpace: 'nowrap' as const,
                backgroundColor: pillBg(v.flag),
                color: pillFg(v.flag),
              }}>
                {v.value}
              </span>
            ))}
          </span>
          <ChevronRight size={14} color={colors.fg.neutral.spotReadable} style={{ flexShrink: 0 }} />
        </div>
      </div>
    );
  }

  // ── Expanded ──
  return (
    <div style={{ ...styles.container, ...style }}>
      {/* Header — matches WorkflowSection chrome */}
      <div
        style={{
          ...styles.header,
          backgroundColor: isHovered ? colors.bg.transparent.subtle : 'transparent',
          borderBottom: `1px solid ${colors.border.neutral.low}`,
        }}
        role="button"
        tabIndex={0}
        aria-expanded={true}
        onClick={() => setIsExpanded(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsExpanded(false); } }}
      >
        <span style={{ ...styles.headerTitle, color: colors.fg.accent.primary }}>Triage Summary</span>
        <ChevronDown size={14} color={colors.fg.neutral.spotReadable} style={{ flexShrink: 0 }} />
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* CC section */}
        {hasCC && (
          <TriageRow
            sectionLabel="Chief Complaint"
            text={ccText!}
            clickable={!!ccItem}
            onClick={ccItem ? () => onItemClick?.(ccItem.id) : undefined}
          />
        )}

        {/* Vitals grid — flex columns for true masonry stacking */}
        {hasVitals && (
          <div ref={gridRef}>
            <div style={styles.sectionLabel}>Vitals Overview</div>
            <div style={{
              ...styles.vitalsColumns,
              ...(gridCols === 6 && { alignItems: 'stretch' }),
            }}>
              {distributeIntoColumns(gridCells, gridCols).map((column, colIdx) => (
                <div key={colIdx} style={styles.vitalsColumn}>
                  {column.map((cell) => (
                    <VitalCell
                      key={cell.label}
                      label={cell.label}
                      readings={cell.readings}
                      flag={cell.flag}
                      onReadingClick={(itemId) => onItemClick?.(itemId)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HPI section */}
        {hasHPI && (
          <TriageRow
            sectionLabel="HPI"
            text={hpiItem!.displayText}
            clickable
            onClick={() => onItemClick?.(hpiItem!.id)}
            maxLines={3}
          />
        )}

        {/* PE section */}
        {hasPE && (
          <TriageRow
            sectionLabel="Physical Exam"
            text={peSummary!}
            clickable
            onClick={() => onItemClick?.(peItems![0].id)}
          />
        )}
      </div>
    </div>
  );
};

TriageModule.displayName = 'TriageModule';

// ============================================================================
// TriageRow — reusable section row with label, truncated text, chevron
// ============================================================================

const TriageRow: React.FC<{
  sectionLabel: string;
  text: string;
  clickable?: boolean;
  onClick?: () => void;
  maxLines?: number;
}> = ({ sectionLabel, text, clickable, onClick, maxLines = 1 }) => {
  const [rowHovered, setRowHovered] = useState(false);

  const sectionTextStyle: React.CSSProperties = maxLines > 1
    ? {
        ...styles.sectionText,
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
        whiteSpace: 'normal',
      }
    : styles.sectionText;

  return (
    <div
      style={{
        ...styles.sectionRow,
        cursor: clickable ? 'pointer' : 'default',
        backgroundColor: rowHovered && clickable ? colors.bg.transparent.subtle : 'transparent',
        borderRadius: borderRadius.xs,
        transition: `background-color ${transitions.fast}`,
      }}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setRowHovered(true)}
      onMouseLeave={() => setRowHovered(false)}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); }
      } : undefined}
    >
      <div style={styles.sectionRowInner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.relatedCompact }}>
          <div style={{ ...styles.sectionLabel, flex: 1, marginBottom: 0, paddingTop: 0 }}>{sectionLabel}</div>
          {clickable && (
            <ChevronRight size={12} color={colors.fg.neutral.spotReadable} style={{ flexShrink: 0 }} />
          )}
        </div>
        <div style={sectionTextStyle}>{text}</div>
      </div>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = {
  container: {
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.bg.neutral.base,
    overflow: 'hidden',
  } as React.CSSProperties,

  // Header — matches WorkflowSection: compact vertical, default horizontal
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    cursor: 'pointer',
    userSelect: 'none' as const,
    transition: `background-color ${transitions.fast}`,
  } as React.CSSProperties,

  headerTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: '20px',
    letterSpacing: -0.5,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  } as React.CSSProperties,

  // Content area — uniform padding for equal spacing above CC
  content: {
    padding: spaceAround.default,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spaceBetween.related,
  } as React.CSSProperties,

  // Section label — uppercase micro label
  sectionLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
    marginBottom: spaceBetween.repeating,
    paddingTop: spaceAround.compact,
  } as React.CSSProperties,

  // Section row — clickable narrative row
  sectionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.nudge4}px ${spaceAround.nudge6}px`,
    margin: `0 -${spaceAround.nudge6}px`,
  } as React.CSSProperties,

  sectionRowInner: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,

  sectionText: {
    fontSize: body.sm.regular.fontSize,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    lineHeight: `${body.sm.regular.lineHeight}px`,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,

  // Vitals columns — flex layout for true vertical stacking (no row-alignment gaps)
  vitalsColumns: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spaceBetween.repeating,
    transition: `opacity ${transitions.fast}`,
  } as React.CSSProperties,

  vitalsColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spaceBetween.repeating,
  } as React.CSSProperties,

  // Collapsed summary — vitals-only pills
  collapsedSummary: {
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: spaceBetween.coupled,
    overflow: 'hidden',
    minWidth: 0,
    flex: '0 1 auto',
  } as React.CSSProperties,
};
