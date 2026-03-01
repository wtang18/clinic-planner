/**
 * TypingDots Component
 *
 * Animated bouncing dots indicating AI generation in progress.
 * Uses inline <style> tag for keyframe injection (same pattern as Spinner.tsx).
 */

import React from 'react';
import { colors } from '../../styles/foundations';

export interface TypingDotsProps {
  /** Dot color. Defaults to fg.neutral.disabled */
  color?: string;
  /** Dot size in px. Default: 4 */
  dotSize?: number;
}

export const TypingDots: React.FC<TypingDotsProps> = ({
  color = colors.fg.neutral.disabled,
  dotSize = 4,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      verticalAlign: 'middle',
    }}
    aria-label="Generating"
    role="status"
  >
    <style>
      {`
        @keyframes typingDotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}
    </style>
    {[0, 1, 2].map(i => (
      <span
        key={i}
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          animation: `typingDotBounce 1s ease-in-out infinite`,
          animationDelay: `${i * 150}ms`,
        }}
      />
    ))}
  </span>
);

TypingDots.displayName = 'TypingDots';
