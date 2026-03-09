/**
 * ProtocolCard Component
 *
 * Collapsible card containing protocol items grouped by clinical stage.
 * Collapsed: stage label + key signal + completion count.
 * Expanded: header + rendered items.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { colors, spaceBetween, typography } from '../../styles/foundations';
import { cardStyles, completionBadgeStyle } from './protocol.styles';
import { ProtocolItemRenderer } from './ProtocolItemRenderer';
import type {
  ProtocolCardDef,
  ProtocolItemDef,
  ProtocolCardState,
  ProtocolItemState,
} from '../../types/protocol';

// ============================================================================
// Types
// ============================================================================

export interface ProtocolCardProps {
  card: ProtocolCardDef;
  cardState: ProtocolCardState;
  itemStates: Record<string, ProtocolItemState>;
  onToggle?: (cardId: string, expanded: boolean) => void;
  onItemAdd?: (itemId: string) => void;
  onItemSkip?: (itemId: string) => void;
  onItemToggle?: (itemId: string) => void;
  onItemAcknowledge?: (itemId: string) => void;
  testID?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/** Count addressed + skipped items in a card. */
function getCompletionCount(
  items: ProtocolItemDef[],
  itemStates: Record<string, ProtocolItemState>
): { done: number; total: number } {
  // Only count actionable items (not advisories)
  const actionable = items.filter(i => i.itemType.type !== 'advisory');
  const done = actionable.filter(i => {
    const s = itemStates[i.id];
    return s && (s.status === 'addressed' || s.status === 'skipped');
  }).length;
  return { done, total: actionable.length };
}

/** Get key signal for collapsed card display. */
function getKeySignal(
  items: ProtocolItemDef[],
  itemStates: Record<string, ProtocolItemState>
): string | null {
  // Priority: critical advisory > warning advisory > first pending orderable
  const criticalAdvisory = items.find(
    i => i.itemType.type === 'advisory' && i.itemType.severity === 'critical'
  );
  if (criticalAdvisory) return criticalAdvisory.label;

  const warningAdvisory = items.find(
    i => i.itemType.type === 'advisory' && i.itemType.severity === 'warning'
  );
  if (warningAdvisory) return warningAdvisory.label;

  const pendingOrderable = items.find(i => {
    const s = itemStates[i.id];
    return i.itemType.type === 'orderable' && s?.status === 'pending';
  });
  if (pendingOrderable) return pendingOrderable.label;

  return null;
}

// ============================================================================
// Component
// ============================================================================

export const ProtocolCard: React.FC<ProtocolCardProps> = ({
  card,
  cardState,
  itemStates,
  onToggle,
  onItemAdd,
  onItemSkip,
  onItemToggle,
  onItemAcknowledge,
  testID,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { done, total } = getCompletionCount(card.items, itemStates);
  const isComplete = total > 0 && done === total;
  const expanded = cardState.expanded;

  const handleHeaderClick = () => {
    onToggle?.(card.id, !expanded);
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle?.(card.id, !expanded);
    }
  };

  const keySignal = !expanded ? getKeySignal(card.items, itemStates) : null;

  // Sort items by sortOrder
  const sortedItems = [...card.items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div style={cardStyles.container} data-testid={testID}>
      {/* Card header */}
      <div
        style={{
          ...cardStyles.header,
          alignItems: 'flex-start',
          backgroundColor: isHovered ? colors.bg.neutral.subtle : 'transparent',
        }}
        onClick={handleHeaderClick}
        onKeyDown={handleHeaderKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        {/* Title row + optional collapsed key signal below */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spaceBetween.repeating }}>
          {/* First row: label + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.relatedCompact }}>
            <span style={{
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: -0.5,
              fontFamily: typography.fontFamily.sans,
              fontWeight: typography.fontWeight.semibold,
              color: isComplete ? colors.fg.positive.primary : colors.fg.neutral.primary,
            }}>
              {card.label}
            </span>
            {total > 0 && (
              <span style={{
                ...completionBadgeStyle,
                color: isComplete ? colors.fg.positive.primary : colors.fg.neutral.spotReadable,
              }}>
                {done}/{total}
              </span>
            )}
          </div>
          {/* Collapsed key signal — same alignment as title */}
          {keySignal && (
            <div style={{
              fontSize: 12,
              color: colors.fg.neutral.spotReadable,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {keySignal}
            </div>
          )}
        </div>

        {/* Chevron — trailing, pinned to first row via 20px lineHeight match */}
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 20,
          color: colors.fg.neutral.spotReadable,
          flexShrink: 0,
        }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div style={cardStyles.body}>
          {sortedItems.map(item => {
            const state = itemStates[item.id] ?? { status: 'pending' };

            // Handle conditionBehavior: 'hide' items with conditions would be hidden
            // (condition evaluation deferred to CP6 — for now, show all items)
            const inactive = item.conditionBehavior === 'show-inactive' && !!item.condition;

            return (
              <ProtocolItemRenderer
                key={item.id}
                item={item}
                state={state}
                inactive={inactive}
                onAdd={onItemAdd}
                onSkip={onItemSkip}
                onToggle={onItemToggle}
                onAcknowledge={onItemAcknowledge}
                testID={testID ? `${testID}-item-${item.id}` : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

ProtocolCard.displayName = 'ProtocolCard';
