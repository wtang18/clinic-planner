/**
 * TranscriptionDrawerView Component
 *
 * The full transcription drawer view for the left pane.
 * Contains context header, view indicator pill, transcript content, and controls footer.
 *
 * @see TRANSCRIPTION_DRAWER.md for full specification
 */

import React, { useState, useCallback, useRef } from 'react';
import { TranscriptionContextHeader } from './TranscriptionContextHeader';
import { ViewIndicatorPill } from './ViewIndicatorPill';
import { TranscriptContent, type TranscriptSegment, type TranscriptContentRef } from './TranscriptContent';
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
  const transcriptRef = useRef<TranscriptContentRef>(null);

  const isRecording = status === 'recording';
  const hasSegments = segments.length > 0;

  // Handle scroll position changes from TranscriptContent
  const handleScrollChange = useCallback((isAtBottom: boolean) => {
    setIsScrolledUp(!isAtBottom);
  }, []);

  // Handle [↓ Latest] button click — scrolls transcript to bottom
  const handleScrollToLatest = useCallback(() => {
    transcriptRef.current?.scrollToBottom();
  }, []);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.bg.neutral.base,
    ...style,
  };

  return (
    <div style={containerStyle} data-testid={testID}>
      {/* Context header — fixed at top */}
      <div style={{ flexShrink: 0 }}>
        <TranscriptionContextHeader
          patientName={patientName}
          patientInitials={patientInitials}
          encounterLabel={encounterLabel}
          onOpenSettings={onOpenSettings}
        />
      </div>

      {/* Content area with floating pill overlay */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Floating status pill — glassy overlay, content scrolls behind */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <ViewIndicatorPill
            status={status}
            isScrolledUp={isScrolledUp}
            onScrollToLatest={handleScrollToLatest}
            style={{ pointerEvents: 'auto' }}
          />
        </div>

        {/* Transcript scrollable content */}
        <TranscriptContent
          ref={transcriptRef}
          segments={segments}
          isRecording={isRecording}
          onScrollChange={handleScrollChange}
          showLowConfidence={showLowConfidence}
          topPadding={36}
          style={{ flex: 1 }}
        />
      </div>

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
