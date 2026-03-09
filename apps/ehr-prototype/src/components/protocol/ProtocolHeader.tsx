/**
 * ProtocolHeader Component
 *
 * Protocol title bar with name, severity badge (if scoring model),
 * completion count, and kebab menu (Dismiss).
 */

import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';
import { completionBadgeStyle } from './protocol.styles';
import { SeverityScoringPanel } from './SeverityScoringPanel';
import type { ActiveProtocolState } from '../../types/protocol';

// ============================================================================
// Types
// ============================================================================

export interface ProtocolHeaderProps {
  protocol: ActiveProtocolState;
  completion: { done: number; total: number };
  severityData?: { score: number; inputs: { id: string; value: number | null }[] } | null;
  onDismiss?: (protocolId: string) => void;
  onPathOverride?: (pathId: string) => void;
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ProtocolHeader: React.FC<ProtocolHeaderProps> = ({
  protocol,
  completion,
  severityData,
  onDismiss,
  onPathOverride,
  testID,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close kebab on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen]);

  const template = protocol.templateSnapshot;
  const severityPath = protocol.severity?.selectedPathId
    ? template.severityScoringModel?.paths.find(p => p.id === protocol.severity?.selectedPathId)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.coupled }} data-testid={testID}>
    <div style={headerContainerStyle}>
      {/* Protocol name + inline count */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: spaceBetween.relatedCompact,
      }}>
        <span style={{
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: -0.5,
          fontFamily: typography.fontFamily.sans,
          fontWeight: typography.fontWeight.semibold,
          color: colors.fg.neutral.primary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {template.name}
        </span>
        <span style={completionBadgeStyle}>
          {completion.done}/{completion.total}
        </span>
      </div>

      {/* Severity badge */}
      {severityPath && (
        <span style={{
          fontSize: 11,
          fontWeight: 500,
          padding: `2px ${spaceAround.nudge6}px`,
          borderRadius: borderRadius.xs,
          backgroundColor: colors.bg.neutral.low,
          color: colors.fg.neutral.primary,
          whiteSpace: 'nowrap',
        }}>
          {severityPath.label}
        </span>
      )}

      {/* Kebab menu */}
      <div style={{ position: 'relative' }}>
        <button
          style={kebabStyle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Protocol menu"
        >
          <MoreVertical size={14} />
        </button>
        {menuOpen && (
          <div style={menuStyle}>
            <button
              style={menuItemStyle}
              onClick={() => {
                onDismiss?.(protocol.id);
                setMenuOpen(false);
              }}
            >
              Dismiss Protocol
            </button>
          </div>
        )}
      </div>
    </div>

      {/* Severity scoring panel (below header row) */}
      {template.severityScoringModel && protocol.severity && severityData && (
        <SeverityScoringPanel
          scoringModel={template.severityScoringModel}
          currentScore={severityData.score}
          selectedPathId={protocol.severity.selectedPathId}
          isManualOverride={protocol.severity.isManualOverride}
          inputs={severityData.inputs}
          onPathOverride={onPathOverride}
          testID={testID ? `${testID}-scoring` : undefined}
        />
      )}
    </div>
  );
};

ProtocolHeader.displayName = 'ProtocolHeader';

// ============================================================================
// Styles
// ============================================================================

const headerContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spaceBetween.repeating,
};

const kebabStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  color: colors.fg.neutral.spotReadable,
  borderRadius: borderRadius.xs,
  padding: 0,
  fontFamily: 'inherit',
};

const menuStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: 4,
  backgroundColor: colors.bg.neutral.min,
  border: `1px solid ${colors.border.neutral.low}`,
  borderRadius: borderRadius.sm,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  zIndex: 10,
  minWidth: 150,
};

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: 13,
  color: colors.fg.neutral.primary,
  fontFamily: 'inherit',
};
