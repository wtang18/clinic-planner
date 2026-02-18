/**
 * EMLevel Component
 *
 * Displays a mock E&M level suggestion (99211-99215) based on documented
 * elements. Purely informational — no actions.
 */

import React from 'react';
import { CheckCircle, Circle, BarChart3 } from 'lucide-react';
import type { EMLevel as EMLevelType, EMElement } from '../../state/selectors/process-view';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface EMLevelProps {
  emLevel: EMLevelType;
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export const EMLevel: React.FC<EMLevelProps> = ({ emLevel, style }) => {
  const documentedCount = emLevel.elements.filter(e => e.documented).length;

  return (
    <div style={{ ...styles.container, ...style }} data-testid="em-level">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <BarChart3 size={16} color={colors.fg.accent.primary} />
          <span style={styles.title}>Charge Capture</span>
        </div>
        <span style={styles.informational}>Informational</span>
      </div>

      {/* E&M Level */}
      <div style={styles.levelRow}>
        <span style={styles.levelCode}>{emLevel.code}</span>
        <span style={styles.levelDescription}>{emLevel.description}</span>
      </div>

      {/* Level bar visualization */}
      <div style={styles.levelBar} data-testid="em-level-bar">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            style={{
              ...styles.levelSegment,
              backgroundColor: level <= emLevel.level
                ? colors.fg.accent.primary
                : colors.bg.neutral.subtle,
            }}
          />
        ))}
      </div>

      {/* Elements */}
      <div style={styles.elements}>
        {emLevel.elements.map((element) => (
          <ElementRow key={element.name} element={element} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// ElementRow
// ============================================================================

const ElementRow: React.FC<{ element: EMElement }> = ({ element }) => (
  <div style={styles.elementRow} data-testid={`em-element-${element.name}`}>
    <div style={styles.elementLeft}>
      {element.documented ? (
        <CheckCircle size={14} color={colors.fg.positive.secondary} />
      ) : (
        <Circle size={14} color={colors.fg.neutral.disabled} />
      )}
      <span
        style={{
          ...styles.elementName,
          color: element.documented
            ? colors.fg.neutral.primary
            : colors.fg.neutral.disabled,
        }}
      >
        {element.name}
      </span>
    </div>
    {element.detail && (
      <span style={styles.elementDetail}>{element.detail}</span>
    )}
  </div>
);

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: colors.bg.neutral.base,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.neutral.low}`,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.neutral.subtle,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  title: {
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
  },
  informational: {
    fontSize: 11,
    color: colors.fg.neutral.spotReadable,
    backgroundColor: colors.bg.neutral.min,
    padding: `2px 6px`,
    borderRadius: borderRadius.sm,
  },
  levelRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
  },
  levelCode: {
    fontSize: 20,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.accent.primary,
  },
  levelDescription: {
    fontSize: 14,
    color: colors.fg.neutral.spotReadable,
  },
  levelBar: {
    display: 'flex',
    gap: 2,
    padding: `0 ${spaceAround.default}px`,
    marginBottom: spaceAround.compact,
  },
  levelSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  elements: {
    borderTop: `1px solid ${colors.border.neutral.low}`,
  },
  elementRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  },
  elementLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
  },
  elementName: {
    fontSize: 13,
  },
  elementDetail: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
  },
};

EMLevel.displayName = 'EMLevel';
