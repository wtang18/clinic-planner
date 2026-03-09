/**
 * ProtocolView Component
 *
 * Top-level container for an active care protocol in the reference pane.
 * Reads the active protocol from encounter state and renders:
 * Header → Cards → (future: Addenda)
 *
 * Action callbacks:
 * - [+] orderable → materializeChartItem + ITEM_ADDED + PROTOCOL_ITEM_ADDRESSED
 * - Checkbox (documentable/guidance) → PROTOCOL_ITEM_ADDRESSED
 * - Skip → PROTOCOL_ITEM_SKIPPED
 * - Dismiss → PROTOCOL_DISMISSED (stays on Protocols tab showing empty state)
 */

import React from 'react';
import { useEncounterState, useDispatch } from '../../hooks/useEncounterState';
import { selectActiveProtocol, selectSeverityScore } from '../../state/selectors/protocol';
import { materializeChartItem } from '../../utils/chart-item-factory';
import { ProtocolHeader } from './ProtocolHeader';
import { ProtocolCard } from './ProtocolCard';
import { spaceBetween } from '../../styles/foundations';
import type { ActiveProtocolState, ProtocolItemDef } from '../../types/protocol';
import type { ChartItem, ItemCategory } from '../../types/chart-items';
import type { EncounterAction } from '../../state/actions/types';

// ============================================================================
// Types
// ============================================================================

export interface ProtocolViewProps {
  testID?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/** Get overall completion across all cards. */
function getOverallCompletion(
  protocol: ActiveProtocolState
): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const card of protocol.templateSnapshot.cards) {
    for (const item of card.items) {
      if (item.itemType.type === 'advisory') continue;
      total++;
      const state = protocol.itemStates[item.id];
      if (state && (state.status === 'addressed' || state.status === 'skipped')) {
        done++;
      }
    }
  }
  return { done, total };
}

/** Find a protocol item def by ID across all cards. */
function findItemDef(
  protocol: ActiveProtocolState,
  itemId: string
): ProtocolItemDef | undefined {
  for (const card of protocol.templateSnapshot.cards) {
    const item = card.items.find(i => i.id === itemId);
    if (item) return item;
  }
  return undefined;
}

/** Build a display text for a chart item from orderable data. */
function buildDisplayText(itemDef: ProtocolItemDef): string {
  return itemDef.label;
}

// ============================================================================
// Component
// ============================================================================

export const ProtocolView: React.FC<ProtocolViewProps> = ({ testID }) => {
  const encounterState = useEncounterState();
  const dispatch = useDispatch();
  const protocol = selectActiveProtocol(encounterState);

  if (!protocol) return null;

  const completion = getOverallCompletion(protocol);
  const severityData = selectSeverityScore(encounterState, protocol.id);
  const sortedCards = [...protocol.templateSnapshot.cards].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  // ── Card toggle ──
  const handleCardToggle = (cardId: string, expanded: boolean) => {
    dispatch({
      type: 'PROTOCOL_CARD_TOGGLED',
      payload: { protocolId: protocol.id, cardId, expanded },
    });
  };

  // ── Dismiss protocol ──
  const handleDismiss = (protocolId: string) => {
    dispatch({ type: 'PROTOCOL_DISMISSED', payload: { protocolId } });
  };

  // ── Path override ──
  const handlePathOverride = (pathId: string) => {
    dispatch({
      type: 'PROTOCOL_PATH_OVERRIDDEN',
      payload: { protocolId: protocol.id, pathId },
    });
  };

  // ── [+] Add orderable item to chart ──
  const handleItemAdd = (itemId: string) => {
    const itemDef = findItemDef(protocol, itemId);
    if (!itemDef || itemDef.itemType.type !== 'orderable') return;

    const chartItem = materializeChartItem(
      {
        category: itemDef.itemType.chartCategory as ItemCategory,
        displayText: buildDisplayText(itemDef),
        data: itemDef.itemType.defaultData,
        protocolRef: `${protocol.templateId}:${itemId}`,
      } as Partial<ChartItem>,
      {
        source: { type: 'protocol' },
        status: 'draft',
      }
    );

    dispatch({ type: 'ITEM_ADDED', payload: { item: chartItem } } as EncounterAction);
    // Cross-surface handler will auto-dispatch PROTOCOL_ITEM_ADDRESSED
  };

  // ── Skip item ──
  const handleItemSkip = (itemId: string) => {
    dispatch({
      type: 'PROTOCOL_ITEM_SKIPPED',
      payload: { protocolId: protocol.id, itemId },
    });
  };

  // ── Toggle documentable checkbox ──
  const handleItemToggle = (itemId: string) => {
    const currentState = protocol.itemStates[itemId];
    if (currentState?.status === 'addressed') {
      // Untoggle — reset to pending (no dedicated action, so skip for now)
      return;
    }
    dispatch({
      type: 'PROTOCOL_ITEM_ADDRESSED',
      payload: {
        protocolId: protocol.id,
        itemId,
        addressedBy: { type: 'manual' },
      },
    });
  };

  // ── Acknowledge guidance ──
  const handleItemAcknowledge = (itemId: string) => {
    const currentState = protocol.itemStates[itemId];
    if (currentState?.status === 'addressed') return;
    dispatch({
      type: 'PROTOCOL_ITEM_ADDRESSED',
      payload: {
        protocolId: protocol.id,
        itemId,
        addressedBy: { type: 'manual' },
      },
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spaceBetween.repeating,
      }}
      data-testid={testID}
    >
      <ProtocolHeader
        protocol={protocol}
        completion={completion}
        severityData={severityData}
        onDismiss={handleDismiss}
        onPathOverride={handlePathOverride}
        testID={testID ? `${testID}-header` : undefined}
      />

      {sortedCards.map(card => (
        <ProtocolCard
          key={card.id}
          card={card}
          cardState={protocol.cardStates[card.id] ?? { expanded: false, manuallyToggled: false }}
          itemStates={protocol.itemStates}
          onToggle={handleCardToggle}
          onItemAdd={handleItemAdd}
          onItemSkip={handleItemSkip}
          onItemToggle={handleItemToggle}
          onItemAcknowledge={handleItemAcknowledge}
          testID={testID ? `${testID}-card-${card.id}` : undefined}
        />
      ))}
    </div>
  );
};

ProtocolView.displayName = 'ProtocolView';
