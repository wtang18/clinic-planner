/**
 * AdvisoryItem Component
 *
 * Renders protocol advisory items with severity-based background tint.
 * Advisories are informational — no user actions (no checkbox, no [+]).
 */

import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius } from '../../../styles/foundations';
import { advisorySeverityStyles } from '../protocol.styles';
import type { ProtocolItemDef } from '../../../types/protocol';

export interface AdvisoryItemProps {
  item: ProtocolItemDef;
  testID?: string;
}

const severityIcons: Record<string, React.ReactNode> = {
  info: <Info size={14} color={colors.fg.neutral.spotReadable} />,
  warning: <AlertTriangle size={14} color={colors.fg.attention.primary} />,
  critical: <AlertCircle size={14} color={colors.fg.alert.primary} />,
};

export const AdvisoryItem: React.FC<AdvisoryItemProps> = ({ item, testID }) => {
  if (item.itemType.type !== 'advisory') return null;
  const severity = item.itemType.severity;
  const severityStyle = advisorySeverityStyles[severity] ?? advisorySeverityStyles.info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: spaceBetween.repeating,
        padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
        borderRadius: borderRadius.xs,
        ...severityStyle,
      }}
      data-testid={testID}
    >
      <span style={{ flexShrink: 0, marginTop: 1 }}>
        {severityIcons[severity] ?? severityIcons.info}
      </span>
      <span style={{ fontSize: 12, lineHeight: 1.4, color: colors.fg.neutral.primary }}>
        {item.label}
      </span>
    </div>
  );
};

AdvisoryItem.displayName = 'AdvisoryItem';
