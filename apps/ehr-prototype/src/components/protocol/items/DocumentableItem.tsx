/**
 * DocumentableItem Component
 *
 * Renders protocol documentable items: checkbox + label.
 * States: default, addressed-auto ("Detected"), addressed-manual, skipped.
 */

import React from 'react';
import { colors, spaceBetween } from '../../../styles/foundations';
import { itemStyles } from '../protocol.styles';
import type { ProtocolItemDef, ProtocolItemState } from '../../../types/protocol';

export interface DocumentableItemProps {
  item: ProtocolItemDef;
  state: ProtocolItemState;
  onToggle?: (itemId: string) => void;
  testID?: string;
}

export const DocumentableItem: React.FC<DocumentableItemProps> = ({
  item,
  state,
  onToggle,
  testID,
}) => {
  const isAddressed = state.status === 'addressed';
  const isSkipped = state.status === 'skipped';
  const isAutoDetected = isAddressed && state.addressedBy?.type !== 'manual';

  return (
    <div style={itemStyles.row} data-testid={testID}>
      <button
        style={{
          ...itemStyles.checkbox,
          ...(isAddressed ? itemStyles.checkboxChecked : {}),
        }}
        onClick={() => onToggle?.(item.id)}
        aria-label={`Mark ${item.label} as documented`}
      >
        {isAddressed && <span style={{ fontSize: 10, lineHeight: 1 }}>✓</span>}
      </button>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spaceBetween.coupled }}>
        <span style={{
          ...itemStyles.label,
          ...(isAddressed ? itemStyles.labelAddressed : {}),
          ...(isSkipped ? itemStyles.labelSkipped : {}),
        }}>
          {item.label}
          {isAutoDetected && (
            <span style={{
              marginLeft: 6,
              fontSize: 11,
              color: colors.fg.positive.primary,
              fontStyle: 'normal',
              textDecoration: 'none',
            }}>
              Detected
            </span>
          )}
        </span>
        {item.description && !isAddressed && (
          <span style={itemStyles.description}>{item.description}</span>
        )}
      </div>
    </div>
  );
};

DocumentableItem.displayName = 'DocumentableItem';
