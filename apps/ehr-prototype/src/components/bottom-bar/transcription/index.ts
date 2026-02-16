/**
 * Transcription Module Components
 *
 * All components for the transcription module of the bottom bar system.
 *
 * Architecture:
 * - TranscriptionModule: Main component with 3-container architecture
 * - Containers: AvatarContainer, ContentContainer, ControlsContainer
 * - Support: WaveformIndicator, StatusBadge, AvatarWithBadge
 */

// Support components
export { WaveformIndicator, default as WaveformIndicatorDefault } from './WaveformIndicator';
export type { WaveformIndicatorProps } from './WaveformIndicator';

export { StatusBadge, default as StatusBadgeDefault } from './StatusBadge';
export type { StatusBadgeProps, BadgeStatus } from './StatusBadge';

export { AvatarWithBadge, PATIENT_COLORS, default as AvatarWithBadgeDefault } from './AvatarWithBadge';
export type { AvatarWithBadgeProps } from './AvatarWithBadge';

export { RecordingStatusGroup, default as RecordingStatusGroupDefault } from './RecordingStatusGroup';
export type { RecordingStatusGroupProps } from './RecordingStatusGroup';

// 3-Container Architecture
export { AvatarContainer } from './containers';
export type { AvatarContainerProps } from './containers';

export { ContentContainer } from './containers';
export type { ContentContainerProps } from './containers';

export { ControlsContainer } from './containers';
export type { ControlsContainerProps } from './containers';

// Main module
export { TranscriptionModule, default as TranscriptionModuleDefault } from './TranscriptionModule';
export type { TranscriptionModuleProps } from './TranscriptionModule';

// Drawer (separate tier)
export { TranscriptionDrawer, default as TranscriptionDrawerDefault } from './TranscriptionDrawer';
export type { TranscriptionDrawerProps } from './TranscriptionDrawer';

