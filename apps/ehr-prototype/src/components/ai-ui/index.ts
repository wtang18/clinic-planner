/**
 * AI UI Components
 *
 * Components for AI status indication and interaction.
 */

// Legacy components
export { Minibar, type MinibarProps } from './Minibar';
export { Palette, type PaletteProps } from './Palette';
export { AlertCard, type AlertCardProps } from './AlertCard';

// New tri-state AI components (Phase 2+)
export { TranscriptionPill, type TranscriptionPillProps, type TranscriptionPillState } from './TranscriptionPill';
export {
  AIMinibar,
  type AIMinibarProps,
  type AIMinibarContent,
  type AIMinibarContentType,
  type ToDoContextContent,
  type SuggestionContent,
  type CareGapContent,
  type ErrorContent,
  type LoadingContent,
  type RecordingCompleteContent,
  type IdleContent,
  type ActionPill,
} from './AIMinibar';
export { AIPalette, type AIPaletteProps } from './AIPalette';
export {
  AIControlSurface,
  type AIControlSurfaceProps,
  type AIControlMode,
} from './AIControlSurface';
export { PatientIndicator, type PatientIndicatorProps } from './PatientIndicator';
