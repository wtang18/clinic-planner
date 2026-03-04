/**
 * CaptureView Screen Exports
 *
 * CaptureView has been decomposed — this barrel maintains backward compatibility.
 * The original CaptureView component is now a re-export of AppShell.
 * useCaptureView and styles remain in this directory as they're used by
 * EncounterProvider and EncounterWorkspace.
 */

export { CaptureView } from './CaptureView';
export { useCaptureView } from './useCaptureView';
export type { UseCaptureViewResult } from './useCaptureView';
export { captureViewStyles, captureViewAnimations } from './CaptureView.styles';
