/**
 * TranscriptionDrawerView Component
 *
 * The full transcription drawer view for the left pane.
 * Contains context header, view indicator pill, transcript content, and controls footer.
 *
 * @see TRANSCRIPTION_DRAWER.md for full specification
 */

import React, { useState, useCallback } from 'react';
import { TranscriptionContextHeader } from './TranscriptionContextHeader';
import { ViewIndicatorPill } from './ViewIndicatorPill';
import { TranscriptContent, type TranscriptSegment } from './TranscriptContent';
import { TranscriptionControlsFooter } from './TranscriptionControlsFooter';
import type { RecordingStatus } from '../../../state/bottomBar/types';
import { colors } from '../../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface TranscriptionDrawerViewProps {
  /** Patient name */
  patientName: string;
  /** Patient initials */
  patientInitials: string;
  /** Encounter label */
  encounterLabel?: string;
  /** Current recording status */
  status: RecordingStatus;
  /** Recording duration in seconds */
  duration?: number;
  /** Transcript segments */
  segments?: TranscriptSegment[];
  /** Whether to show low-confidence indicators */
  showLowConfidence?: boolean;
  /** Called to start recording */
  onStart?: () => void;
  /** Called to pause recording */
  onPause?: () => void;
  /** Called to resume recording */
  onResume?: () => void;
  /** Called to stop/finalize recording */
  onStop?: () => void;
  /** Called to discard recording */
  onDiscard?: () => void;
  /** Called to retry after error */
  onRetry?: () => void;
  /** Called to open settings */
  onOpenSettings?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export const TranscriptionDrawerView: React.FC<TranscriptionDrawerViewProps> = ({
  patientName,
  patientInitials,
  encounterLabel,
  status,
  duration = 0,
  segments = [],
  showLowConfidence = false,
  onStart,
  onPause,
  onResume,
  onStop,
  onDiscard,
  onRetry,
  onOpenSettings,
  style,
  testID,
}) => {
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [scrollToBottomFn, setScrollToBottomFn] = useState<(() => void) | null>(null);

  const isRecording = status === 'recording';
  const hasSegments = segments.length > 0;

  // Handle scroll position changes from TranscriptContent
  const handleScrollChange = useCallback((isAtBottom: boolean) => {
    setIsScrolledUp(!isAtBottom);
  }, []);

  // Handle [↓ Latest] button click
  const handleScrollToLatest = useCallback(() => {
    // In a real implementation, we'd have a ref to TranscriptContent
    // For now, we trigger the scroll via state change
    setIsScrolledUp(false);
  }, []);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.bg.neutral.base,
    ...style,
  };

  // Floating elements zone (header + pill)
  const floatingZoneStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    flexShrink: 0,
  };

  // Scroll content area
  const scrollAreaStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    // Negative margin to allow content to scroll behind floating elements
    marginTop: -60, // Approximate height of header + pill
    paddingTop: 60,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Floating zone: Context header + View indicator pill */}
      <div style={floatingZoneStyle}>
        <TranscriptionContextHeader
          patientName={patientName}
          patientInitials={patientInitials}
          encounterLabel={encounterLabel}
          onOpenSettings={onOpenSettings}
        />
        <ViewIndicatorPill
          status={status}
          isScrolledUp={isScrolledUp}
          onScrollToLatest={handleScrollToLatest}
        />
      </div>

      {/* Scroll content area */}
      <TranscriptContent
        segments={segments}
        isRecording={isRecording}
        onScrollChange={handleScrollChange}
        showLowConfidence={showLowConfidence}
        topPadding={0}
        style={{ flex: 1 }}
      />

      {/* Controls footer */}
      <div style={{ flexShrink: 0 }}>
        <TranscriptionControlsFooter
          status={status}
          duration={duration}
          hasSegments={hasSegments}
          onStart={onStart}
          onPause={onPause}
          onResume={onResume}
          onStop={onStop}
          onDiscard={onDiscard}
          onRetry={onRetry}
          onSettings={onOpenSettings}
        />
      </div>
    </div>
  );
};

TranscriptionDrawerView.displayName = 'TranscriptionDrawerView';
