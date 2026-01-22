/**
 * Spinner Component
 *
 * Loading indicator.
 */

import React from 'react';
import { colors } from '../../styles/tokens';

// ============================================================================
// Types
// ============================================================================

export interface SpinnerProps {
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Color */
  color?: string;
}

// ============================================================================
// Sizes
// ============================================================================

const sizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

// ============================================================================
// Component
// ============================================================================

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = colors.primary[600],
}) => {
  const dimension = sizes[size];

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: 'spin 1s linear infinite',
      }}
      aria-label="Loading"
      role="status"
    >
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="60"
        strokeDashoffset="20"
        opacity="0.25"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="60"
        strokeDashoffset="45"
      />
    </svg>
  );
};
