/**
 * Transcription Module Containers
 *
 * 3-container architecture for the Transcription Module:
 * - AvatarContainer: Identity (avatar + patient name)
 * - ContentContainer: Display (waveform, transcript, status)
 * - ControlsContainer: Actions (timer + buttons)
 */

export { AvatarContainer } from './AvatarContainer';
export type { AvatarContainerProps } from './AvatarContainer';

export { ContentContainer } from './ContentContainer';
export type { ContentContainerProps } from './ContentContainer';

export { ControlsContainer } from './ControlsContainer';
export type { ControlsContainerProps } from './ControlsContainer';
