/**
 * Left Pane Components
 *
 * Multi-view left pane system with Menu, AI Drawer, and Transcript Drawer views.
 */

export { LeftPaneContainer } from './LeftPaneContainer';
export type { LeftPaneContainerProps } from './LeftPaneContainer';

export { PaneHeader } from './PaneHeader';
export type { PaneHeaderProps } from './PaneHeader';

export { PaneContent } from './PaneContent';
export type { PaneContentProps } from './PaneContent';

// AI Drawer components
export {
  AIDrawerView,
  AIContextHeader,
  SuggestionsSection,
  ConversationHistory,
  AIDrawerFooter,
  QuickActionsRow,
  AIDrawerInput,
} from './AIDrawer';
export type {
  AIDrawerViewProps,
  AIContextHeaderProps,
  ContextScope,
  SuggestionsSectionProps,
  ConversationHistoryProps,
  ConversationMessage,
  MessageType,
  AIDrawerFooterProps,
  QuickActionsRowProps,
  AIDrawerInputProps,
} from './AIDrawer';

// Transcription Drawer components
export {
  TranscriptionDrawerView,
  TranscriptionContextHeader,
  ViewIndicatorPill,
  TranscriptContent,
  TranscriptionControlsFooter,
} from './TranscriptionDrawer';
export type {
  TranscriptionDrawerViewProps,
  TranscriptionContextHeaderProps,
  ViewIndicatorPillProps,
  TranscriptContentProps,
  TranscriptSegment,
  SpeakerRole,
  TranscriptionControlsFooterProps,
} from './TranscriptionDrawer';
