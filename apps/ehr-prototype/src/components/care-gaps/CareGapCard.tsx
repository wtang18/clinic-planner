/**
 * CareGapCard Component
 *
 * Individual care gap display with actions and exclusion options.
 */

import React from 'react';
import type { CareGapInstance, CareGapExclusionReason, CareGapClosureCriteria } from '../../types/care-gaps';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { getCareGapPriorityColor } from '../../styles/utils';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';

// ============================================================================
// Types
// ============================================================================

export interface ClosureAction {
  type: string;
  label: string;
  payload?: unknown;
}

export interface CareGapCardProps {
  /** The care gap instance to display */
  gap: CareGapInstance;
  /** Called when an action is taken to close the gap */
  onAction: (action: ClosureAction) => void;
  /** Called when the gap is excluded */
  onExclude: (reason: CareGapExclusionReason) => void;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const CheckIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const ClockIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const AlertIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const XCircleIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

// ============================================================================
// Constants
// ============================================================================

const EXCLUSION_REASONS = [
  { type: 'patient-declined', label: 'Patient declined' },
  { type: 'medical-contraindication', label: 'Medical contraindication' },
  { type: 'completed-elsewhere', label: 'Done elsewhere' },
  { type: 'other', label: 'Other reason' },
] as const;

// ============================================================================
// Component
// ============================================================================

export const CareGapCard: React.FC<CareGapCardProps> = ({
  gap,
  onAction,
  onExclude,
  compact = false,
  style,
}) => {
  const [showExcludeMenu, setShowExcludeMenu] = React.useState(false);

  const { priority, name, category, actionLabel, dueLabel } = gap._display;
  const priorityColors = getCareGapPriorityColor(priority);
  const isOverdue = dueLabel?.includes('Overdue');
  const isAddressed = gap.addressedThisEncounter;
  const isPending = gap.status === 'pending';
  const isClosed = gap.status === 'closed';
  const isExcluded = gap.excluded;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: compact ? 'row' : 'column',
    gap: compact ? spacing[3] : spacing[3],
    padding: compact ? spacing[3] : spacing[4],
    borderLeft: `3px solid ${priorityColors.color}`,
    backgroundColor: isAddressed || isClosed ? colors.status.successLight : isPending ? colors.status.warningLight : 'transparent',
    opacity: isExcluded ? 0.6 : 1,
    transition: `all ${transitions.fast}`,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: compact ? 'center' : 'flex-start',
    gap: spacing[3],
    flex: 1,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: compact ? '28px' : '36px',
    height: compact ? '28px' : '36px',
    backgroundColor: priorityColors.bgColor,
    borderRadius: radii.full,
    color: priorityColors.color,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
  };

  const titleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: compact ? typography.fontSize.sm[0] : typography.fontSize.base[0],
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[900],
    margin: 0,
  };

  const dueLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    fontSize: typography.fontSize.xs[0],
    color: isOverdue ? colors.status.error : colors.neutral[500],
    fontWeight: isOverdue ? typography.fontWeight.medium : typography.fontWeight.normal,
  };

  const categoryStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
    textTransform: 'capitalize',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    flexShrink: 0,
    position: 'relative',
  };

  const excludeMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: spacing[1],
    backgroundColor: colors.neutral[0],
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: radii.md,
    boxShadow: `0 4px 6px -1px rgb(0 0 0 / 0.1)`,
    zIndex: 10,
    minWidth: '200px',
  };

  const menuItemStyle: React.CSSProperties = {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.sm[0],
    color: colors.neutral[700],
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
  };

  // Closure action based on gap type
  const handleAction = () => {
    onAction({
      type: category,
      label: actionLabel,
      payload: { gapId: gap.id, definitionId: gap.definitionId },
    });
  };

  // Handle exclusion
  const handleExclude = (type: string) => {
    let reason: CareGapExclusionReason;
    switch (type) {
      case 'patient-declined':
        reason = { type: 'patient-declined', documentedAt: new Date() };
        break;
      case 'medical-contraindication':
        reason = { type: 'medical-contraindication', diagnosis: '' };
        break;
      case 'completed-elsewhere':
        reason = { type: 'completed-elsewhere' };
        break;
      default:
        reason = { type: 'other', reason: '' };
    }
    onExclude(reason);
    setShowExcludeMenu(false);
  };

  return (
    <Card variant="default" padding="none">
      <div style={containerStyle}>
        {/* Main content */}
        <div style={headerStyle}>
          {/* Priority icon */}
          <div style={iconContainerStyle}>
            <span style={{ width: compact ? '14px' : '18px', height: compact ? '14px' : '18px', display: 'flex' }}>
              {isClosed || isAddressed ? (
                <CheckIcon />
              ) : isOverdue ? (
                <AlertIcon />
              ) : (
                <ClockIcon />
              )}
            </span>
          </div>

          {/* Content */}
          <div style={contentStyle}>
            <div style={titleRowStyle}>
              <p style={titleStyle}>{name}</p>
              <Badge
                variant={priority === 'critical' ? 'error' : priority === 'important' ? 'warning' : 'success'}
                size="sm"
              >
                {priority}
              </Badge>
              {isAddressed && <Badge variant="success" size="sm">Addressed</Badge>}
              {isPending && <Badge variant="warning" size="sm">Pending</Badge>}
              {isExcluded && <Badge variant="default" size="sm">Excluded</Badge>}
            </div>

            {!compact && (
              <>
                <span style={categoryStyle}>{formatCategory(category)}</span>
                {dueLabel && (
                  <div style={dueLabelStyle}>
                    <span style={{ width: '12px', height: '12px', display: 'flex' }}>
                      <ClockIcon />
                    </span>
                    {dueLabel}
                  </div>
                )}
              </>
            )}

            {compact && dueLabel && (
              <span style={dueLabelStyle}>{dueLabel}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        {!isExcluded && !isClosed && (
          <div style={actionsStyle}>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAction}
              disabled={isAddressed || isPending}
            >
              {actionLabel}
            </Button>

            <div style={{ position: 'relative' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExcludeMenu(!showExcludeMenu)}
                rightIcon={<ChevronDownIcon />}
              >
                Exclude
              </Button>

              {showExcludeMenu && (
                <div style={excludeMenuStyle}>
                  {EXCLUSION_REASONS.map((reason) => (
                    <div
                      key={reason.type}
                      style={menuItemStyle}
                      onClick={() => handleExclude(reason.type)}
                      onMouseEnter={(e) => {
                        (e.target as HTMLDivElement).style.backgroundColor = colors.neutral[100];
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLDivElement).style.backgroundColor = 'transparent';
                      }}
                    >
                      {reason.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function formatCategory(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

CareGapCard.displayName = 'CareGapCard';
