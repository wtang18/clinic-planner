/**
 * CareGapCard Component
 *
 * Individual care gap display with actions and exclusion options.
 */

import React from 'react';
import { Check, ChevronDown, Clock, AlertTriangle } from 'lucide-react';
import type { CareGapInstance, CareGapExclusionReason, CareGapClosureCriteria } from '../../types/care-gaps';
import { colors, spaceAround, spaceBetween, typography, transitions } from '../../styles/foundations';
import { getCareGapPriorityColor } from '../../styles/utils';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { CardIconContainer } from '../primitives/CardIconContainer';
import { DropdownMenu } from '../primitives/DropdownMenu';
import { ActionGroup } from '../primitives/ActionGroup';

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
    gap: spaceBetween.relatedCompact,
    padding: compact ? spaceAround.compact : spaceAround.default,
    backgroundColor: priority === 'critical' ? colors.bg.alert.subtle : colors.bg.neutral.base,
    opacity: isExcluded ? 0.6 : 1,
    transition: `all ${transitions.fast}`,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: compact ? 'center' : 'flex-start',
    gap: spaceBetween.relatedCompact,
    flex: 1,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  };

  const titleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    flexWrap: 'wrap',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: compact ? 14 : 16,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.primary,
    margin: 0,
  };

  const dueLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    fontSize: 12,
    color: isOverdue ? colors.fg.alert.secondary : colors.fg.neutral.spotReadable,
    fontWeight: isOverdue ? typography.fontWeight.medium : typography.fontWeight.regular,
  };

  const categoryStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'capitalize',
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
    <Card variant="default" padding="none" data-testid={`care-gap-card-${gap.id}`}>
      <div style={containerStyle}>
        {/* Main content */}
        <div style={headerStyle}>
          {/* Priority icon */}
          <CardIconContainer color={priority === 'critical' ? 'alert' : 'default'} size={compact ? 'sm' : 'lg'}>
            {isClosed || isAddressed ? (
              <Check size={compact ? 14 : 18} />
            ) : isOverdue ? (
              <AlertTriangle size={compact ? 14 : 18} />
            ) : (
              <Clock size={compact ? 14 : 18} />
            )}
          </CardIconContainer>

          {/* Content */}
          <div style={contentStyle}>
            <div style={titleRowStyle}>
              <p style={titleStyle}>{name}</p>
              <Badge
                variant={priority === 'critical' ? 'error' : 'default'}
                size="sm"
              >
                {priority}
              </Badge>
              {isAddressed && <Badge variant="success" size="sm" data-testid="gap-status">Addressed</Badge>}
              {isPending && <Badge variant="warning" size="sm" data-testid="gap-status">Pending</Badge>}
              {isExcluded && <Badge variant="default" size="sm" data-testid="gap-status">Excluded</Badge>}
              {!isAddressed && !isPending && !isExcluded && gap.status === 'open' && (
                <Badge variant="info" size="sm" data-testid="gap-status">Open</Badge>
              )}
            </div>

            {!compact && (
              <>
                <span style={categoryStyle}>{formatCategory(category)}</span>
                {dueLabel && (
                  <div style={dueLabelStyle}>
                    <Clock size={12} />
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
          <ActionGroup style={{ flexShrink: 0, position: 'relative' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAction}
              disabled={isAddressed || isPending}
              data-testid="gap-action-btn"
            >
              {actionLabel}
            </Button>

            <div style={{ position: 'relative' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExcludeMenu(!showExcludeMenu)}
                rightIcon={<ChevronDown size={14} />}
              >
                Exclude
              </Button>

              <DropdownMenu
                isOpen={showExcludeMenu}
                items={EXCLUSION_REASONS.map((reason) => ({
                  label: reason.label,
                  value: reason.type,
                }))}
                onItemClick={handleExclude}
                position="bottom-right"
              />
            </div>
          </ActionGroup>
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
