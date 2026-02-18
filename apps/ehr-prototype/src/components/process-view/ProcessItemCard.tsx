/**
 * ProcessItemCard Component
 *
 * Renders a chart item within a batch section with processing steps
 * and next-action button. Tappable to open the details pane.
 */

import React from 'react';
import { CheckCircle, Circle, AlertTriangle, Loader } from 'lucide-react';
import type { ProcessViewItem, ProcessingStep } from '../../state/selectors/process-view';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface ProcessItemCardProps {
  processItem: ProcessViewItem;
  onSelect?: () => void;
  onAction?: (actionType: string, taskId?: string) => void;
  style?: React.CSSProperties;
}

// ============================================================================
// Step Icon
// ============================================================================

const StepIcon: React.FC<{ status: ProcessingStep['status']; size?: number }> = ({
  status,
  size = 14,
}) => {
  switch (status) {
    case 'complete':
      return <CheckCircle size={size} color={colors.fg.positive.secondary} />;
    case 'active':
      return <Loader size={size} color={colors.fg.information.secondary} />;
    case 'failed':
      return <AlertTriangle size={size} color={colors.fg.alert.secondary} />;
    case 'pending':
    default:
      return <Circle size={size} color={colors.fg.neutral.disabled} />;
  }
};

// ============================================================================
// Component
// ============================================================================

export const ProcessItemCard: React.FC<ProcessItemCardProps> = ({
  processItem,
  onSelect,
  onAction,
  style,
}) => {
  const { item, processingSteps, nextAction } = processItem;
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      style={{
        ...styles.container,
        ...(isHovered && styles.containerHover),
        ...style,
      }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      data-testid={`process-item-${item.id}`}
    >
      {/* Item info */}
      <div style={styles.itemInfo}>
        <span style={styles.itemName}>{item.displayText}</span>
        {item.displaySubtext && (
          <span style={styles.itemSubtext}>{item.displaySubtext}</span>
        )}
      </div>

      {/* Processing steps */}
      {processingSteps.length > 0 && (
        <div style={styles.stepsRow} data-testid="processing-steps">
          {processingSteps.map((step, i) => (
            <div key={step.taskId || i} style={styles.step} title={step.label}>
              <StepIcon status={step.status} />
              <span style={styles.stepLabel}>{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Next action button */}
      {nextAction && onAction && (
        <button
          type="button"
          style={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            onAction(nextAction.actionType, nextAction.taskId);
          }}
          data-testid={`action-${nextAction.actionType}`}
        >
          {nextAction.label}
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.compact}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.neutral.base,
    borderRadius: borderRadius.sm,
    border: `1px solid ${colors.border.neutral.low}`,
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
  },
  containerHover: {
    backgroundColor: colors.bg.neutral.subtle,
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    lineHeight: 1.3,
  },
  itemSubtext: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    lineHeight: 1.3,
  },
  stepsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spaceBetween.related,
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  stepLabel: {
    fontSize: 11,
    color: colors.fg.neutral.secondary,
  },
  actionButton: {
    alignSelf: 'flex-start',
    padding: `${spaceAround.nudge4}px ${spaceAround.compact}px`,
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    backgroundColor: colors.bg.accent.subtle,
    border: `1px solid ${colors.border.accent.low}`,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
  },
};

ProcessItemCard.displayName = 'ProcessItemCard';
