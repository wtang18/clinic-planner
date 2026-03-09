/**
 * SeverityScoringPanel Component
 *
 * Expandable panel below the severity badge showing scoring input values,
 * computed score, and path selection with manual override.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius } from '../../styles/foundations';
import type { SeverityScoringModel, SeverityPath } from '../../types/protocol';

// ============================================================================
// Types
// ============================================================================

export interface SeverityScoringPanelProps {
  scoringModel: SeverityScoringModel;
  currentScore: number;
  selectedPathId: string;
  isManualOverride: boolean;
  inputs: { id: string; value: number | null }[];
  onPathOverride?: (pathId: string) => void;
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const SeverityScoringPanel: React.FC<SeverityScoringPanelProps> = ({
  scoringModel,
  currentScore,
  selectedPathId,
  isManualOverride,
  inputs,
  onPathOverride,
  testID,
}) => {
  const [expanded, setExpanded] = useState(false);

  const currentPath = scoringModel.paths.find(p => p.id === selectedPathId);

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Collapsed header */}
      <div
        style={headerStyle}
        onClick={() => setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
      >
        {expanded
          ? <ChevronDown size={12} color={colors.fg.neutral.spotReadable} />
          : <ChevronRight size={12} color={colors.fg.neutral.spotReadable} />
        }
        <span style={{ fontSize: 12, fontWeight: 500, color: colors.fg.neutral.primary }}>
          {scoringModel.name}
        </span>
        <span style={{ fontSize: 11, color: colors.fg.neutral.spotReadable, marginLeft: 'auto' }}>
          Score: {Math.round(currentScore * 10) / 10}
          {currentPath && ` — ${currentPath.label}`}
          {isManualOverride && ' (override)'}
        </span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={bodyStyle}>
          {/* Input values */}
          {scoringModel.inputs.map((input, idx) => {
            const inputValue = inputs.find(i => i.id === input.id)?.value;
            return (
              <div key={input.id} style={inputRowStyle}>
                <span style={{ fontSize: 12, color: colors.fg.neutral.primary, flex: 1 }}>
                  {input.label}
                </span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: inputValue != null ? colors.fg.neutral.primary : colors.fg.neutral.spotReadable,
                }}>
                  {inputValue != null ? inputValue : 'Needed'}
                </span>
                <span style={{ fontSize: 10, color: colors.fg.neutral.spotReadable, width: 36, textAlign: 'right' }}>
                  ×{input.weight}
                </span>
              </div>
            );
          })}

          {/* Path selector */}
          <div style={{
            display: 'flex',
            gap: spaceBetween.coupled,
            marginTop: spaceBetween.repeating,
            paddingTop: spaceBetween.repeating,
            borderTop: `1px solid ${colors.border.neutral.low}`,
          }}>
            {scoringModel.paths.map(path => (
              <button
                key={path.id}
                style={{
                  ...pathButtonStyle,
                  ...(path.id === selectedPathId ? pathButtonActiveStyle : {}),
                }}
                onClick={() => onPathOverride?.(path.id)}
              >
                {path.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

SeverityScoringPanel.displayName = 'SeverityScoringPanel';

// ============================================================================
// Styles
// ============================================================================

const containerStyle: React.CSSProperties = {
  borderRadius: borderRadius.xs,
  border: `1px solid ${colors.border.neutral.low}`,
  backgroundColor: colors.bg.neutral.low,
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spaceBetween.coupled,
  padding: `${spaceAround.nudge6}px ${spaceAround.tight}px`,
  cursor: 'pointer',
  userSelect: 'none',
};

const bodyStyle: React.CSSProperties = {
  padding: `0 ${spaceAround.tight}px ${spaceAround.tight}px`,
  display: 'flex',
  flexDirection: 'column',
  gap: spaceBetween.coupled,
};

const inputRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spaceBetween.repeating,
};

const pathButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: `${spaceAround.nudge4}px ${spaceAround.tight}px`,
  fontSize: 11,
  fontWeight: 500,
  border: `1px solid ${colors.border.neutral.low}`,
  borderRadius: borderRadius.xs,
  backgroundColor: colors.bg.neutral.min,
  color: colors.fg.neutral.primary,
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'center',
};

const pathButtonActiveStyle: React.CSSProperties = {
  backgroundColor: colors.bg.accent.medium,
  borderColor: colors.bg.accent.medium,
  color: colors.fg.neutral.inversePrimary,
};
