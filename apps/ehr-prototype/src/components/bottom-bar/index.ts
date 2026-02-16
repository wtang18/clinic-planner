/**
 * Bottom Bar Components
 *
 * Shared primitives and module components for the bottom bar system.
 */

// Shared Primitives
export { DragHandle, default as DragHandleDefault } from './DragHandle';
export type { DragHandleProps } from './DragHandle';

export { MiniAnchor, default as MiniAnchorDefault } from './MiniAnchor';
export type { MiniAnchorProps, BadgeType } from './MiniAnchor';

export {
  ControlsBar,
  ControlsBarButton,
  ControlsBarStatus,
  default as ControlsBarDefault,
} from './ControlsBar';
export type {
  ControlsBarProps,
  ControlsBarButtonProps,
  ControlsBarStatusProps,
} from './ControlsBar';

// Transcription Module
export {
  WaveformIndicator,
  StatusBadge,
  AvatarWithBadge,
  PATIENT_COLORS,
  TranscriptionDrawer,
  TranscriptionModule,
} from './transcription';
export type {
  WaveformIndicatorProps,
  StatusBadgeProps,
  BadgeStatus,
  AvatarWithBadgeProps,
  TranscriptionDrawerProps,
  TranscriptionModuleProps,
} from './transcription';

// AI Module
export { AISurfaceModule } from './ai';
export type { AISurfaceModuleProps } from './ai';

// Orchestrator
export { BottomBarContainer, default as BottomBarContainerDefault } from './BottomBarContainer';
export type { BottomBarContainerProps } from './BottomBarContainer';

export { BottomBarSystem, default as BottomBarSystemDefault } from './BottomBarProvider';
export type { BottomBarSystemProps } from './BottomBarProvider';
