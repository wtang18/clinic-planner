import React from 'react';
import { Badge } from './Badge';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

// Centralized status-to-variant mapping
const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  // Task statuses
  'queued': 'default',
  'processing': 'info',
  'pending-review': 'warning',
  'ready': 'success',
  'completed': 'success',
  'failed': 'error',
  'cancelled': 'default',
  // Chart item statuses
  'draft': 'default',
  'confirmed': 'success',
  'active': 'success',
  'pending': 'warning',
  'discontinued': 'default',
  'on-hold': 'warning',
  // Care gap statuses
  'open': 'warning',
  'closed': 'success',
  'excluded': 'default',
  // Generic
  'new': 'info',
  'in-progress': 'info',
  'resolved': 'success',
  'error': 'error',
};

export interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
  customMap?: Record<string, BadgeVariant>;
  style?: React.CSSProperties;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  customMap,
  style,
}) => {
  const map = customMap || STATUS_VARIANTS;
  const variant = map[status] || 'default';
  const displayLabel = label || formatStatusLabel(status);

  return (
    <Badge variant={variant} size={size} style={style}>
      {displayLabel}
    </Badge>
  );
};

function formatStatusLabel(status: string): string {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

StatusBadge.displayName = 'StatusBadge';
