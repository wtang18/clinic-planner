import React from 'react';
import { spaceBetween, spaceAround } from '../../styles/foundations';

export interface ActionGroupProps {
  children: React.ReactNode;
  layout?: 'start' | 'end' | 'space-between';
  gap?: number;
  style?: React.CSSProperties;
}

export const ActionGroup: React.FC<ActionGroupProps> = ({
  children,
  layout = 'start',
  gap,
  style,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: gap ?? spaceBetween.repeating,
    justifyContent: layout === 'space-between' ? 'space-between' : layout === 'end' ? 'flex-end' : 'flex-start',
    ...style,
  };

  return <div style={containerStyle}>{children}</div>;
};

ActionGroup.displayName = 'ActionGroup';
