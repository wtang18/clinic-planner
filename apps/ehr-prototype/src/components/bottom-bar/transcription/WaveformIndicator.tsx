/**
 * WaveformIndicator Component
 *
 * Animated waveform bars indicating recording activity.
 * Used in the transcription bar to show active recording state.
 */

import React from 'react';
import { colors, borderRadius } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface WaveformIndicatorProps {
  /** Whether the waveform is animating (recording active) */
  isAnimating: boolean;
  /** Number of bars */
  barCount?: 3 | 5 | 7;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color for the bars */
  color?: string;
  /** Custom styles for the container */
  style?: React.CSSProperties;
}

// ============================================================================
// Constants
// ============================================================================

const SIZE_CONFIG: Record<'sm' | 'md' | 'lg', { barWidth: number; barHeight: number; gap: number }> = {
  sm: { barWidth: 2, barHeight: 10, gap: 2 },  // 10×10 object (3 bars × 2px + 2 gaps × 2px)
  md: { barWidth: 3, barHeight: 16, gap: 2 },
  lg: { barWidth: 4, barHeight: 24, gap: 3 },
};

// Animation delays for symmetry (center bar animates first)
const DELAYS_3 = [0, 100, 0]; // ms
const DELAYS_5 = [50, 0, 100, 0, 50];
const DELAYS_7 = [100, 50, 0, 150, 0, 50, 100];

// ============================================================================
// Component
// ============================================================================

export const WaveformIndicator: React.FC<WaveformIndicatorProps> = ({
  isAnimating,
  barCount = 3,
  size = 'md',
  color,
  style,
}) => {
  const config = SIZE_CONFIG[size];
  // Use recording accent (red) when animating, muted white when paused
  const barColor = color || (isAnimating
    ? colors.fg.alert.secondary  // Red when recording
    : 'rgba(255, 255, 255, 0.4)');  // Muted when paused

  const getDelays = () => {
    switch (barCount) {
      case 3:
        return DELAYS_3;
      case 5:
        return DELAYS_5;
      case 7:
        return DELAYS_7;
      default:
        return DELAYS_3;
    }
  };

  const delays = getDelays();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: config.gap,
    height: config.barHeight,
    ...style,
  };

  const getBarStyle = (index: number): React.CSSProperties => ({
    width: config.barWidth,
    height: config.barHeight,
    backgroundColor: barColor,
    borderRadius: config.barWidth / 2,
    transform: 'scaleY(0.3)',
    opacity: 0.85,
    animation: isAnimating
      ? `waveformBar 0.8s ease-in-out infinite`
      : 'none',
    animationDelay: `${delays[index] || 0}ms`,
  });

  return (
    <>
      <div style={containerStyle}>
        {Array.from({ length: barCount }).map((_, i) => (
          <div key={i} style={getBarStyle(i)} />
        ))}
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes waveformBar {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </>
  );
};

WaveformIndicator.displayName = 'WaveformIndicator';

export default WaveformIndicator;
