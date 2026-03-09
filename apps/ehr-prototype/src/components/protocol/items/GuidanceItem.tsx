/**
 * GuidanceItem Component
 *
 * Renders protocol guidance items: info icon + italic prompt.
 * Includes a checkbox for clinician acknowledgment.
 */

import React from 'react';
import { Info } from 'lucide-react';
import { colors, spaceBetween } from '../../../styles/foundations';
import { itemStyles } from '../protocol.styles';
import type { ProtocolItemDef, ProtocolItemState } from '../../../types/protocol';

export interface GuidanceItemProps {
  item: ProtocolItemDef;
  state: ProtocolItemState;
  onAcknowledge?: (itemId: string) => void;
  testID?: string;
}

export const GuidanceItem: React.FC<GuidanceItemProps> = ({
  item,
  state,
  onAcknowledge,
  testID,
}) => {
  if (item.itemType.type !== 'guidance') return null;
  const isAcknowledged = state.status === 'addressed';

  return (
    <div style={itemStyles.row} data-testid={testID}>
      <button
        style={{
          ...itemStyles.checkbox,
          ...(isAcknowledged ? itemStyles.checkboxChecked : {}),
        }}
        onClick={() => onAcknowledge?.(item.id)}
        aria-label={`Acknowledge ${item.label}`}
      >
        {isAcknowledged && <span style={{ fontSize: 10, lineHeight: 1 }}>✓</span>}
      </button>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spaceBetween.coupled }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spaceBetween.coupled,
        }}>
          <Info size={13} color={colors.fg.neutral.spotReadable} style={{ flexShrink: 0 }} />
          <span style={{
            ...itemStyles.label,
            fontWeight: 500,
            ...(isAcknowledged ? itemStyles.labelAddressed : {}),
          }}>
            {item.label}
          </span>
        </div>
        <span style={{
          fontSize: 12,
          fontStyle: 'italic',
          color: colors.fg.neutral.spotReadable,
          lineHeight: 1.4,
        }}>
          {item.itemType.prompt}
        </span>
      </div>
    </div>
  );
};

GuidanceItem.displayName = 'GuidanceItem';
