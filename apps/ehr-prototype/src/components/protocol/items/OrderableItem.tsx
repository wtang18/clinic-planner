/**
 * OrderableItem Component
 *
 * Renders protocol orderable items with [+] button to add to chart.
 * States: default, addressed, skipped, not-applicable.
 * Action callbacks are stubs in CP4 — wired in CP5.
 */

import React from 'react';
import { Plus, Check, Minus } from 'lucide-react';
import { colors, spaceBetween } from '../../../styles/foundations';
import { itemStyles } from '../protocol.styles';
import type { ProtocolItemDef, ProtocolItemState } from '../../../types/protocol';

export interface OrderableItemProps {
  item: ProtocolItemDef;
  state: ProtocolItemState;
  /** Whether the item is inactive (condition not met, shown dimmed). */
  inactive?: boolean;
  onAdd?: (itemId: string) => void;
  onSkip?: (itemId: string) => void;
  testID?: string;
}

export const OrderableItem: React.FC<OrderableItemProps> = ({
  item,
  state,
  inactive = false,
  onAdd,
  onSkip,
  testID,
}) => {
  const isAddressed = state.status === 'addressed';
  const isSkipped = state.status === 'skipped';
  const isNA = state.status === 'not-applicable';
  const isDone = isAddressed || isSkipped || isNA;

  return (
    <div
      style={{
        ...itemStyles.row,
        opacity: inactive ? 0.5 : 1,
      }}
      data-testid={testID}
    >
      {/* Action button: [+] for pending, checkmark for addressed, dash for skipped/NA */}
      {!isDone ? (
        <button
          style={itemStyles.addButton}
          onClick={() => !inactive && onAdd?.(item.id)}
          disabled={inactive}
          aria-label={`Add ${item.label}`}
        >
          <Plus size={14} />
        </button>
      ) : isAddressed ? (
        <span style={{
          ...itemStyles.addButton,
          border: 'none',
          color: colors.fg.positive.primary,
          cursor: 'default',
        }}>
          <Check size={14} />
        </span>
      ) : (
        <span style={{
          ...itemStyles.addButton,
          border: 'none',
          color: colors.fg.neutral.spotReadable,
          cursor: 'default',
        }}>
          <Minus size={14} />
        </span>
      )}

      {/* Label + description */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spaceBetween.coupled }}>
        <span style={{
          ...itemStyles.label,
          fontWeight: 500,
          ...(isAddressed ? itemStyles.labelAddressed : {}),
          ...(isSkipped ? itemStyles.labelSkipped : {}),
        }}>
          {item.label}
        </span>
        {item.description && !isDone && (
          <span style={itemStyles.description}>{item.description}</span>
        )}
        {inactive && !isDone && (
          <span style={{
            fontSize: 11,
            color: colors.fg.neutral.spotReadable,
            fontStyle: 'italic',
          }}>
            Condition not met
          </span>
        )}
      </div>
    </div>
  );
};

OrderableItem.displayName = 'OrderableItem';
