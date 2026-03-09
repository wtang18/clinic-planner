/**
 * ProtocolItemRenderer
 *
 * Switches on item type to render the correct item component.
 * Handles conditional visibility (conditionBehavior) and inactive state.
 */

import React from 'react';
import type { ProtocolItemDef, ProtocolItemState } from '../../types/protocol';
import { OrderableItem } from './items/OrderableItem';
import { DocumentableItem } from './items/DocumentableItem';
import { GuidanceItem } from './items/GuidanceItem';
import { AdvisoryItem } from './items/AdvisoryItem';

export interface ProtocolItemRendererProps {
  item: ProtocolItemDef;
  state: ProtocolItemState;
  /** Whether the item's condition is not met (for conditionBehavior: 'show-inactive'). */
  inactive?: boolean;
  onAdd?: (itemId: string) => void;
  onSkip?: (itemId: string) => void;
  onToggle?: (itemId: string) => void;
  onAcknowledge?: (itemId: string) => void;
  testID?: string;
}

export const ProtocolItemRenderer: React.FC<ProtocolItemRendererProps> = ({
  item,
  state,
  inactive,
  onAdd,
  onSkip,
  onToggle,
  onAcknowledge,
  testID,
}) => {
  switch (item.itemType.type) {
    case 'orderable':
      return (
        <OrderableItem
          item={item}
          state={state}
          inactive={inactive}
          onAdd={onAdd}
          onSkip={onSkip}
          testID={testID}
        />
      );
    case 'documentable':
      return (
        <DocumentableItem
          item={item}
          state={state}
          onToggle={onToggle}
          testID={testID}
        />
      );
    case 'guidance':
      return (
        <GuidanceItem
          item={item}
          state={state}
          onAcknowledge={onAcknowledge}
          testID={testID}
        />
      );
    case 'advisory':
      return (
        <AdvisoryItem
          item={item}
          testID={testID}
        />
      );
    default:
      return null;
  }
};

ProtocolItemRenderer.displayName = 'ProtocolItemRenderer';
