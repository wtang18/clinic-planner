import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { colors, spaceBetween, typography } from '../../styles/foundations';

export interface AbnormalFlagProps {
  flag?: 'normal' | 'low' | 'high' | 'critical';
  value: string | number;
  unit?: string;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const AbnormalFlag: React.FC<AbnormalFlagProps> = ({
  flag = 'normal',
  value,
  unit,
  size = 'md',
  style,
}) => {
  const isAbnormal = flag && flag !== 'normal';
  const isCritical = flag === 'critical';
  const isHigh = flag === 'high' || flag === 'critical';
  const isLow = flag === 'low';

  const flagColor = isCritical
    ? colors.fg.alert.secondary
    : isAbnormal
    ? colors.fg.attention.secondary
    : colors.fg.neutral.secondary;

  const iconSize = size === 'sm' ? 12 : 14;
  const fontSize = size === 'sm' ? 12 : 14;

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    ...style,
  };

  const valueStyle: React.CSSProperties = {
    fontSize,
    fontWeight: isAbnormal ? typography.fontWeight.medium : typography.fontWeight.regular,
    color: flagColor,
  };

  return (
    <span style={containerStyle}>
      {isAbnormal && (
        <span style={{ display: 'flex', color: flagColor }}>
          {isHigh ? <ArrowUp size={iconSize} /> : isLow ? <ArrowDown size={iconSize} /> : null}
        </span>
      )}
      <span style={valueStyle}>{value}</span>
      {unit && <span style={{ fontSize: fontSize - 2, color: colors.fg.neutral.spotReadable }}>{unit}</span>}
    </span>
  );
};

AbnormalFlag.displayName = 'AbnormalFlag';
