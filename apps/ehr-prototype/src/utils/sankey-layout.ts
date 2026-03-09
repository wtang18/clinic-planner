/**
 * Sankey Layout Engine
 *
 * Transforms SankeyData into pixel coordinates for SVG rendering.
 * Produces band rectangles, flow paths (filled bezier ribbons), divider lines,
 * and label positions.
 */

import type {
  SankeyData,
  SankeyBand,
  SankeyFlow,
  AxisVisibility,
} from '../types/population-health';

// ============================================================================
// Layout Constants
// ============================================================================

export const SANKEY_PADDING = { top: 40, right: 140, bottom: 40, left: 140 };
export const SANKEY_PADDING_COMPACT = { top: 40, right: 96, bottom: 40, left: 96 };
export const AXIS_WIDTH = 24;
export const MIN_BAND_HEIGHT = 18;
export const BAND_GAP = 4;
export const ZONE_DIVIDER_GAP = 10;
export const LABEL_OFFSET = 12;
/** Minimum drawable width (between padding) to render flow ribbons */
export const MIN_FLOW_WIDTH = 200;
/** Gap between axis columns in bands-only (compact, no-flow) mode */
export const COMPACT_COLUMN_GAP = 8;

// ============================================================================
// Output Types
// ============================================================================

export interface SankeyBandLayout {
  id: string;
  label: string;
  count: number;
  x: number;
  y: number;
  width: number;
  height: number;
  zone?: 'conditions' | 'preventive';
  attention?: boolean;
  /** Abbreviated label for compact display */
  shortLabel?: string;
  /** Which axis this band belongs to */
  axis: 'left' | 'center' | 'right';
  /** Label position */
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'end' | 'middle';
}

export interface SankeyFlowLayout {
  sourceId: string;
  targetId: string;
  patientCount: number;
  patientIds: string[];
  attention?: boolean;
  /** SVG path `d` string for the filled bezier ribbon */
  path: string;
}

export interface SankeyDividerLayout {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SankeyLayoutResult {
  bands: SankeyBandLayout[];
  flows: SankeyFlowLayout[];
  dividers: SankeyDividerLayout[];
  /** Total SVG viewBox dimensions */
  width: number;
  height: number;
}

// ============================================================================
// Layout computation
// ============================================================================

/**
 * Compute pixel layout for the Sankey diagram.
 * @param data - Computed SankeyData
 * @param containerWidth - Available width in pixels
 * @param containerHeight - Available height in pixels
 * @param axisVisibility - Which axes to include
 * @param compact - Use reduced padding for split-pane compact mode
 */
export function computeSankeyLayout(
  data: SankeyData,
  containerWidth: number,
  containerHeight: number,
  axisVisibility: AxisVisibility,
  compact?: boolean,
): SankeyLayoutResult {
  const bands: SankeyBandLayout[] = [];
  const flows: SankeyFlowLayout[] = [];
  const dividers: SankeyDividerLayout[] = [];

  const padding = compact ? SANKEY_PADDING_COMPACT : SANKEY_PADDING;
  const drawableWidth = containerWidth - padding.left - padding.right;
  const drawableHeight = containerHeight - padding.top - padding.bottom;

  // Determine visible axes
  const visibleAxes: ('left' | 'center' | 'right')[] = [];
  if (axisVisibility.conditions || axisVisibility.preventive) visibleAxes.push('left');
  if (axisVisibility.riskLevel) visibleAxes.push('center');
  if (axisVisibility.actionStatus) visibleAxes.push('right');

  if (visibleAxes.length === 0) {
    return { bands, flows, dividers, width: containerWidth, height: containerHeight };
  }

  // Distribute axis X positions.
  // Two modes: when flows are rendered, spread axes across the full drawable width
  // so ribbons have room. When flows are skipped (narrow viewport), pack columns
  // tight with a small gap and center the group.
  const showFlows = drawableWidth >= MIN_FLOW_WIDTH;
  const axisXPositions: Record<string, number> = {};
  if (visibleAxes.length === 1) {
    axisXPositions[visibleAxes[0]] = padding.left + drawableWidth / 2 - AXIS_WIDTH / 2;
  } else if (showFlows) {
    const spacing = drawableWidth / (visibleAxes.length - 1);
    visibleAxes.forEach((axis, i) => {
      axisXPositions[axis] = padding.left + spacing * i - AXIS_WIDTH / 2;
    });
  } else {
    // Bands-only: pack columns tight and center the group
    const totalColumnsWidth = visibleAxes.length * AXIS_WIDTH + (visibleAxes.length - 1) * COMPACT_COLUMN_GAP;
    const startX = padding.left + (drawableWidth - totalColumnsWidth) / 2;
    visibleAxes.forEach((axis, i) => {
      axisXPositions[axis] = startX + i * (AXIS_WIDTH + COMPACT_COLUMN_GAP);
    });
  }

  // --- Layout left axis ---
  if (visibleAxes.includes('left')) {
    const x = axisXPositions.left;
    const showConditions = axisVisibility.conditions;
    const showPreventive = axisVisibility.preventive;

    const conditionBands = showConditions ? data.leftAxis.find((g) => g.zone === 'conditions')?.bands ?? [] : [];
    const preventiveBands = showPreventive ? data.leftAxis.find((g) => g.zone === 'preventive')?.bands ?? [] : [];

    const hasBothZones = conditionBands.length > 0 && preventiveBands.length > 0;
    const dividerSpace = hasBothZones ? ZONE_DIVIDER_GAP : 0;
    const totalBands = conditionBands.length + preventiveBands.length;
    const totalGaps = Math.max(0, conditionBands.length - 1) + Math.max(0, preventiveBands.length - 1);
    const availableForBands = drawableHeight - dividerSpace - totalGaps * BAND_GAP;

    // Proportional heights
    const totalCount = [...conditionBands, ...preventiveBands].reduce((s, b) => s + Math.max(b.count, 1), 0);

    let currentY = padding.top;

    // Condition zone
    for (let i = 0; i < conditionBands.length; i++) {
      const band = conditionBands[i];
      const rawHeight = (Math.max(band.count, 1) / totalCount) * availableForBands;
      const h = Math.max(rawHeight, MIN_BAND_HEIGHT);
      bands.push({
        ...band,
        x, y: currentY, width: AXIS_WIDTH, height: h,
        axis: 'left',
        labelX: x - LABEL_OFFSET,
        labelY: currentY + h / 2,
        labelAnchor: 'end',
      });
      currentY += h + BAND_GAP;
    }

    // Divider
    if (hasBothZones) {
      currentY += (ZONE_DIVIDER_GAP - BAND_GAP); // replace last band gap with divider gap
      const divY = currentY - ZONE_DIVIDER_GAP / 2;
      dividers.push({
        x1: x - 20,
        y1: divY,
        x2: x + AXIS_WIDTH + 20,
        y2: divY,
      });
    }

    // Preventive zone
    for (let i = 0; i < preventiveBands.length; i++) {
      const band = preventiveBands[i];
      const rawHeight = (Math.max(band.count, 1) / totalCount) * availableForBands;
      const h = Math.max(rawHeight, MIN_BAND_HEIGHT);
      bands.push({
        ...band,
        x, y: currentY, width: AXIS_WIDTH, height: h,
        axis: 'left',
        labelX: x - LABEL_OFFSET,
        labelY: currentY + h / 2,
        labelAnchor: 'end',
      });
      currentY += h + BAND_GAP;
    }
  }

  // --- Layout center axis ---
  if (visibleAxes.includes('center')) {
    const x = axisXPositions.center;
    const visibleBands = data.centerAxis.filter((b) => b.count > 0 || true); // show all tiers
    layoutAxisBands(visibleBands, x, drawableHeight, 'center', bands, padding.top);
  }

  // --- Layout right axis ---
  if (visibleAxes.includes('right')) {
    const x = axisXPositions.right;
    layoutAxisBands(data.rightAxis, x, drawableHeight, 'right', bands, padding.top);
  }

  // --- Flow computation (skip when drawable area is too narrow) ---
  // Below MIN_FLOW_WIDTH, ribbons become illegible — render bands only.
  if (showFlows) {
    const bandLookup = new Map<string, SankeyBandLayout>();
    for (const band of bands) {
      bandLookup.set(band.id, band);
    }

    // Pre-compute total inbound/outbound flow counts per band.
    // Left axis over-counts (multi-membership), so total inbound flow to a center
    // band can exceed band.count. We normalize by actual total flow to keep
    // ribbons within band height.
    const totalOutbound = new Map<string, number>();
    const totalInbound = new Map<string, number>();

    const activeLeftToCenter = visibleAxes.includes('left') && visibleAxes.includes('center');
    const activeCenterToRight = visibleAxes.includes('center') && visibleAxes.includes('right');

    if (activeLeftToCenter) {
      for (const flow of data.leftToCenterFlows) {
        if (flow.patientCount === 0) continue;
        totalOutbound.set(flow.sourceId, (totalOutbound.get(flow.sourceId) ?? 0) + flow.patientCount);
        totalInbound.set(flow.targetId, (totalInbound.get(flow.targetId) ?? 0) + flow.patientCount);
      }
    }

    if (activeCenterToRight) {
      for (const flow of data.centerToRightFlows) {
        if (flow.patientCount === 0) continue;
        totalOutbound.set(flow.sourceId, (totalOutbound.get(flow.sourceId) ?? 0) + flow.patientCount);
        totalInbound.set(flow.targetId, (totalInbound.get(flow.targetId) ?? 0) + flow.patientCount);
      }
    }

    // Compute flow exit/entry y-ranges and build paths
    const bandSourceConsumed = new Map<string, number>();
    const bandTargetConsumed = new Map<string, number>();

    if (activeLeftToCenter) {
      for (const flow of data.leftToCenterFlows) {
        const path = computeFlowPath(flow, bandLookup, bandSourceConsumed, bandTargetConsumed, totalOutbound, totalInbound);
        if (path) flows.push(path);
      }
    }

    if (activeCenterToRight) {
      for (const flow of data.centerToRightFlows) {
        const path = computeFlowPath(flow, bandLookup, bandSourceConsumed, bandTargetConsumed, totalOutbound, totalInbound);
        if (path) flows.push(path);
      }
    }
  }

  return {
    bands,
    flows,
    dividers,
    width: containerWidth,
    height: containerHeight,
  };
}

// ============================================================================
// Internal helpers
// ============================================================================

function layoutAxisBands(
  axisBands: SankeyBand[],
  x: number,
  drawableHeight: number,
  axis: 'center' | 'right',
  outBands: SankeyBandLayout[],
  topPadding: number = SANKEY_PADDING.top,
): void {
  const totalGaps = Math.max(0, axisBands.length - 1) * BAND_GAP;
  const availableForBands = drawableHeight - totalGaps;
  const totalCount = axisBands.reduce((s, b) => s + Math.max(b.count, 1), 0);

  let currentY = topPadding;

  for (const band of axisBands) {
    const rawHeight = (Math.max(band.count, 1) / totalCount) * availableForBands;
    const h = Math.max(rawHeight, MIN_BAND_HEIGHT);

    const isRight = axis === 'right';
    outBands.push({
      ...band,
      x, y: currentY, width: AXIS_WIDTH, height: h,
      axis,
      labelX: isRight ? x + AXIS_WIDTH + LABEL_OFFSET : x + AXIS_WIDTH / 2,
      labelY: currentY + h / 2,
      labelAnchor: isRight ? 'start' : 'middle',
    });
    currentY += h + BAND_GAP;
  }
}

function computeFlowPath(
  flow: SankeyFlow,
  bandLookup: Map<string, SankeyBandLayout>,
  sourceConsumed: Map<string, number>,
  targetConsumed: Map<string, number>,
  totalOutboundMap: Map<string, number>,
  totalInboundMap: Map<string, number>,
): SankeyFlowLayout | null {
  const sourceBand = bandLookup.get(flow.sourceId);
  const targetBand = bandLookup.get(flow.targetId);

  if (!sourceBand || !targetBand || flow.patientCount === 0) return null;

  // Source exit: proportional slice of source band's right edge.
  // Use actual total outbound flow count (may exceed band.count due to multi-membership).
  const sourceTotal = totalOutboundMap.get(flow.sourceId) || sourceBand.count || 1;
  const sourceSliceHeight = (flow.patientCount / sourceTotal) * sourceBand.height;
  const sourceOffset = sourceConsumed.get(flow.sourceId) ?? 0;
  sourceConsumed.set(flow.sourceId, sourceOffset + sourceSliceHeight);

  const sourceY0 = sourceBand.y + sourceOffset;
  const sourceY1 = sourceY0 + sourceSliceHeight;
  const sourceX = sourceBand.x + sourceBand.width;

  // Target entry: proportional slice of target band's left edge.
  // Use actual total inbound flow count to ensure ribbons fit within band height.
  const targetTotal = totalInboundMap.get(flow.targetId) || targetBand.count || 1;
  const targetSliceHeight = (flow.patientCount / targetTotal) * targetBand.height;
  const targetOffset = targetConsumed.get(flow.targetId) ?? 0;
  targetConsumed.set(flow.targetId, targetOffset + targetSliceHeight);

  const targetY0 = targetBand.y + targetOffset;
  const targetY1 = targetY0 + targetSliceHeight;
  const targetX = targetBand.x;

  // Build filled bezier ribbon path
  const path = buildRibbonPath(sourceX, sourceY0, sourceY1, targetX, targetY0, targetY1);

  return {
    sourceId: flow.sourceId,
    targetId: flow.targetId,
    patientCount: flow.patientCount,
    patientIds: flow.patientIds,
    attention: flow.attention,
    path,
  };
}

/** Number of sample points along the spine for perpendicular-offset ribbons. */
const RIBBON_SAMPLES = 24;

/**
 * Build a filled ribbon SVG path with constant perpendicular width.
 *
 * Instead of two parallel bezier curves (which pinch in the middle where the
 * curve is steep), we:
 * 1. Sample the center spine (cubic bezier) at N evenly-spaced t values
 * 2. At each sample, compute the tangent direction
 * 3. Offset perpendicular to the tangent by ±halfThickness
 * 4. Build a closed polygon from the upper and lower offset points
 *
 * The thickness linearly interpolates from source slice height to target
 * slice height along the spine.
 */
function buildRibbonPath(
  sx: number, sy0: number, sy1: number,
  tx: number, ty0: number, ty1: number,
): string {
  const sourceThickness = sy1 - sy0;
  const targetThickness = ty1 - ty0;

  // Spine control points: cubic bezier from source center to target center
  const sourceCenterY = (sy0 + sy1) / 2;
  const targetCenterY = (ty0 + ty1) / 2;
  const midX = (sx + tx) / 2;

  // P0, P1, P2, P3 for the center spine
  const p0x = sx, p0y = sourceCenterY;
  const p1x = midX, p1y = sourceCenterY;
  const p2x = midX, p2y = targetCenterY;
  const p3x = tx, p3y = targetCenterY;

  const upper: string[] = [];
  const lower: string[] = [];

  for (let i = 0; i <= RIBBON_SAMPLES; i++) {
    const t = i / RIBBON_SAMPLES;

    // Cubic bezier position: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    const cx = mt3 * p0x + 3 * mt2 * t * p1x + 3 * mt * t2 * p2x + t3 * p3x;
    const cy = mt3 * p0y + 3 * mt2 * t * p1y + 3 * mt * t2 * p2y + t3 * p3y;

    // Tangent: B'(t) = 3(1-t)²(P1-P0) + 6(1-t)t(P2-P1) + 3t²(P3-P2)
    const tdx =
      3 * mt2 * (p1x - p0x) +
      6 * mt * t * (p2x - p1x) +
      3 * t2 * (p3x - p2x);
    const tdy =
      3 * mt2 * (p1y - p0y) +
      6 * mt * t * (p2y - p1y) +
      3 * t2 * (p3y - p2y);

    // Normal perpendicular to tangent (rotate 90°): (-tdy, tdx), normalized
    const len = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
    const nx = -tdy / len;
    const ny = tdx / len;

    // Interpolated half-thickness at this t
    const halfThick = (sourceThickness * (1 - t) + targetThickness * t) / 2;

    // Offset points
    upper.push(`${cx + nx * halfThick},${cy + ny * halfThick}`);
    lower.push(`${cx - nx * halfThick},${cy - ny * halfThick}`);
  }

  // Build polygon: upper edge forward, lower edge backward
  return `M ${upper[0]} L ${upper.slice(1).join(' L ')} L ${lower.reverse().join(' L ')} Z`;
}
