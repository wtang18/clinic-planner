/**
 * SankeyChart
 *
 * Custom SVG Sankey diagram with three axes:
 * left (conditions+preventive), center (risk tier), right (action status).
 * Renders filled bezier ribbon flows and interactive band rectangles.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors, borderRadius, typography, transitions } from '../../styles/foundations';
import type { SankeyBandLayout, SankeyFlowLayout, SankeyLayoutResult } from '../../utils/sankey-layout';
import type { DimensionSelection } from '../../types/population-health';

// ============================================================================
// Props
// ============================================================================

interface SankeyChartProps {
  layout: SankeyLayoutResult;
  dimensionSelection: DimensionSelection;
  hoveredBandId: string | null;
  onBandClick: (bandId: string, axis: 'left' | 'center' | 'right') => void;
  onBandHover: (bandId: string | null) => void;
}

// ============================================================================
// Color helpers
// ============================================================================

function isSelected(bandId: string, selection: DimensionSelection): boolean {
  if (selection.conditions.includes(bandId)) return true;
  if (selection.preventive.includes(bandId)) return true;
  if (selection.riskTiers.some((t) => `risk-${t}` === bandId)) return true;
  if (selection.actionStatuses.some((s) => `action-${s}` === bandId)) return true;
  return false;
}

function hasAnySelection(selection: DimensionSelection): boolean {
  return (
    selection.conditions.length > 0 ||
    selection.preventive.length > 0 ||
    selection.riskTiers.length > 0 ||
    selection.actionStatuses.length > 0
  );
}

/** Get connected band IDs from a given band via flows */
function getConnectedBandIds(
  bandId: string,
  flows: SankeyFlowLayout[],
): Set<string> {
  const connected = new Set<string>();
  connected.add(bandId);
  for (const flow of flows) {
    if (flow.sourceId === bandId) connected.add(flow.targetId);
    if (flow.targetId === bandId) connected.add(flow.sourceId);
  }
  return connected;
}

function getBandFill(
  band: SankeyBandLayout,
  selection: DimensionSelection,
  hoveredBandId: string | null,
  flows: SankeyFlowLayout[],
): string {
  const selected = isSelected(band.id, selection);
  if (selected) return colors.bg.accent.low;
  if (hoveredBandId === band.id) return colors.bg.accent.subtle;
  if (band.attention) return colors.bg.attention.low;
  return colors.bg.neutral.subtle;
}

function getBandStroke(
  band: SankeyBandLayout,
  selection: DimensionSelection,
  hoveredBandId: string | null,
): string {
  if (isSelected(band.id, selection)) return colors.border.accent.medium;
  if (hoveredBandId === band.id) return colors.border.accent.low;
  return 'transparent';
}

function getBandStrokeWidth(
  band: SankeyBandLayout,
  selection: DimensionSelection,
  hoveredBandId: string | null,
): number {
  if (isSelected(band.id, selection)) return 1.5;
  if (hoveredBandId === band.id) return 1.5;
  return 0;
}

function getBandOpacity(
  band: SankeyBandLayout,
  selection: DimensionSelection,
  hoveredBandId: string | null,
  flows: SankeyFlowLayout[],
): number {
  const active = hasAnySelection(selection) || hoveredBandId !== null;
  if (!active) return 1;

  // If this band is selected or hovered, full opacity
  if (isSelected(band.id, selection)) return 1;
  if (hoveredBandId === band.id) return 1;

  // If connected to hovered band, full opacity
  if (hoveredBandId) {
    const connected = getConnectedBandIds(hoveredBandId, flows);
    if (connected.has(band.id)) return 1;
  }

  // Dimmed
  return 0.3;
}

function getFlowFill(
  flow: SankeyFlowLayout,
  selection: DimensionSelection,
  hoveredBandId: string | null,
): string {
  if (flow.attention) return colors.bg.attention.medium;
  // If connected to selection or hover, tint with accent
  const active = hasAnySelection(selection) || hoveredBandId !== null;
  if (active) {
    const connectedToSelection =
      isSelected(flow.sourceId, selection) || isSelected(flow.targetId, selection);
    const connectedToHover =
      hoveredBandId === flow.sourceId || hoveredBandId === flow.targetId;
    if (connectedToSelection || connectedToHover) {
      return colors.bg.accent.low;
    }
  }
  return colors.bg.neutral.low;
}

function getFlowOpacity(
  flow: SankeyFlowLayout,
  selection: DimensionSelection,
  hoveredBandId: string | null,
): number {
  const active = hasAnySelection(selection) || hoveredBandId !== null;
  if (!active) return flow.attention ? 0.5 : 0.25;

  const connectedToSelection =
    isSelected(flow.sourceId, selection) || isSelected(flow.targetId, selection);
  const connectedToHover =
    hoveredBandId === flow.sourceId || hoveredBandId === flow.targetId;

  if (connectedToSelection || connectedToHover) return 0.6;
  return 0.08;
}

// ============================================================================
// Transition timing
// ============================================================================

/** Geometry transitions (position, size) — slightly longer for smooth feel */
const GEO_TRANSITION = '300ms ease';
/** Visual transitions (opacity, fill, stroke) — snappier for responsiveness */
const VIS_TRANSITION = '200ms ease';
/** Entrance fade for bands/labels/dividers */
const ENTRANCE_TRANSITION = `opacity ${VIS_TRANSITION}`;

const BAND_TRANSITION = [
  `x ${GEO_TRANSITION}`, `y ${GEO_TRANSITION}`,
  `width ${GEO_TRANSITION}`, `height ${GEO_TRANSITION}`,
  `fill ${VIS_TRANSITION}`, `stroke ${VIS_TRANSITION}`,
  `stroke-width ${VIS_TRANSITION}`, `opacity ${VIS_TRANSITION}`,
].join(', ');

const LABEL_TRANSITION = `opacity ${VIS_TRANSITION}, fill ${VIS_TRANSITION}`;

const FLOW_TRANSITION = `opacity 450ms ease-in, fill ${VIS_TRANSITION}`;

const DIVIDER_TRANSITION = [
  `x1 ${GEO_TRANSITION}`, `y1 ${GEO_TRANSITION}`,
  `x2 ${GEO_TRANSITION}`, `y2 ${GEO_TRANSITION}`,
].join(', ');

/**
 * Mount phase for staged entrance animation:
 * - 'hidden':  first frame — everything at final positions, opacity 0, no transitions
 * - 'bands':   bands/labels/dividers fade in (opacity only); flows stay hidden
 * - 'ready':   entrance done — flows fade in, full interactive transitions enabled
 */
type MountPhase = 'hidden' | 'bands' | 'ready';

// ============================================================================
// Component
// ============================================================================

export const SankeyChart: React.FC<SankeyChartProps> = ({
  layout,
  dimensionSelection,
  hoveredBandId,
  onBandClick,
  onBandHover,
}) => {
  // ---------------------------------------------------------------------------
  // Staged entrance: bands settle first, then flows fade in
  // ---------------------------------------------------------------------------
  const [mountPhase, setMountPhase] = useState<MountPhase>('hidden');

  useEffect(() => {
    // Frame 0: rendered at final positions, opacity 0, no transitions.
    // Frame 1: bands fade in.
    const raf = requestAnimationFrame(() => setMountPhase('bands'));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (mountPhase !== 'bands') return;
    // After bands settle, reveal flows
    const timer = setTimeout(() => setMountPhase('ready'), 300);
    return () => clearTimeout(timer);
  }, [mountPhase]);

  const bandsVisible = mountPhase !== 'hidden';
  const flowsVisible = mountPhase === 'ready';

  // ---------------------------------------------------------------------------

  const handleBandClick = useCallback(
    (band: SankeyBandLayout) => {
      onBandClick(band.id, band.axis);
    },
    [onBandClick],
  );

  const handleBandMouseEnter = useCallback(
    (bandId: string) => onBandHover(bandId),
    [onBandHover],
  );

  const handleBandMouseLeave = useCallback(
    () => onBandHover(null),
    [onBandHover],
  );

  // SVG geometry properties set via style for CSS transition support (SVG2).
  // Cast needed because React's CSSProperties doesn't include SVG geometry props.
  const svgStyle = (props: Record<string, unknown>) => props as React.CSSProperties;

  return (
    <svg
      width={layout.width}
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      style={{ display: 'block' }}
    >
      {/* Flow ribbons (behind bands) — hidden until bands settle */}
      <g className="flows">
        {layout.flows.map((flow) => (
          <path
            key={`flow-${flow.sourceId}-${flow.targetId}`}
            d={flow.path}
            style={svgStyle({
              fill: getFlowFill(flow, dimensionSelection, hoveredBandId),
              opacity: flowsVisible ? getFlowOpacity(flow, dimensionSelection, hoveredBandId) : 0,
              transition: flowsVisible ? FLOW_TRANSITION : 'none',
            })}
          />
        ))}
      </g>

      {/* Zone dividers */}
      {layout.dividers.map((div, i) => (
        <line
          key={`div-${i}`}
          stroke={colors.border.neutral.low}
          strokeWidth={1}
          strokeDasharray="4 3"
          style={svgStyle({
            x1: div.x1, y1: div.y1,
            x2: div.x2, y2: div.y2,
            opacity: bandsVisible ? 1 : 0,
            transition: bandsVisible ? `${DIVIDER_TRANSITION}, ${ENTRANCE_TRANSITION}` : 'none',
          })}
        />
      ))}

      {/* Band rectangles */}
      <g className="bands">
        {layout.bands.map((band) => {
          // During entrance: suppress geometry transitions, fade opacity only.
          // Once ready: full interactive transitions.
          const bandTransition = !bandsVisible ? 'none'
            : mountPhase === 'bands' ? ENTRANCE_TRANSITION
            : BAND_TRANSITION;

          return (
            <g key={band.id}>
              <rect
                rx={borderRadius.xs}
                style={svgStyle({
                  x: band.x, y: band.y,
                  width: band.width, height: band.height,
                  fill: getBandFill(band, dimensionSelection, hoveredBandId, layout.flows),
                  stroke: getBandStroke(band, dimensionSelection, hoveredBandId),
                  strokeWidth: getBandStrokeWidth(band, dimensionSelection, hoveredBandId),
                  opacity: bandsVisible ? getBandOpacity(band, dimensionSelection, hoveredBandId, layout.flows) : 0,
                  cursor: 'pointer',
                  transition: bandTransition,
                })}
                onClick={() => handleBandClick(band)}
                onMouseEnter={() => handleBandMouseEnter(band.id)}
                onMouseLeave={handleBandMouseLeave}
              />
            </g>
          );
        })}
      </g>

      {/* Labels */}
      <g className="labels">
        {layout.bands.map((band) => {
          const labelOpacity = bandsVisible
            ? getBandOpacity(band, dimensionSelection, hoveredBandId, layout.flows)
            : 0;
          const labelTrans = bandsVisible ? LABEL_TRANSITION : 'none';

          return (
            <g key={`label-${band.id}`}>
              {/* Label text */}
              <text
                x={band.labelX}
                y={band.labelY - 4}
                textAnchor={band.labelAnchor}
                fontSize={12}
                fontFamily={typography.fontFamily.sans}
                fontWeight={typography.fontWeight.medium}
                style={{
                  fill: colors.fg.neutral.primary,
                  opacity: labelOpacity,
                  transition: labelTrans,
                  pointerEvents: 'none',
                }}
              >
                {band.label}
              </text>
              {/* Count text */}
              <text
                x={band.labelX}
                y={band.labelY + 10}
                textAnchor={band.labelAnchor}
                fontSize={11}
                fontFamily={typography.fontFamily.sans}
                style={{
                  fill: colors.fg.neutral.spotReadable,
                  opacity: labelOpacity,
                  transition: labelTrans,
                  pointerEvents: 'none',
                }}
              >
                {band.count}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

SankeyChart.displayName = 'SankeyChart';
