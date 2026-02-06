import React from 'react';
import { colors, spaceBetween, typography } from '../../styles/foundations';

export interface MetadataItem {
  label?: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export interface MetadataRowProps {
  items: MetadataItem[];
  separator?: 'dot' | 'pipe' | 'space';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

const separatorChars: Record<string, string> = {
  dot: ' \u00b7 ',
  pipe: ' | ',
  space: '  ',
};

export const MetadataRow: React.FC<MetadataRowProps> = ({
  items,
  separator = 'space',
  size = 'sm',
  style,
}) => {
  const fontSize = size === 'sm' ? 12 : 14;
  const filteredItems = items.filter(item => item.value != null && item.value !== '');

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    fontSize,
    color: colors.fg.neutral.spotReadable,
    flexWrap: 'wrap',
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    color: colors.fg.neutral.disabled,
    fontWeight: typography.fontWeight.medium,
  };

  return (
    <div style={containerStyle}>
      {filteredItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && separator !== 'space' && (
            <span style={{ color: colors.fg.neutral.disabled }}>{separatorChars[separator]}</span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: spaceBetween.coupled }}>
            {item.icon && <span style={{ display: 'flex' }}>{item.icon}</span>}
            {item.label && <span style={labelStyle}>{item.label}:</span>}
            <span>{item.value}</span>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

MetadataRow.displayName = 'MetadataRow';
