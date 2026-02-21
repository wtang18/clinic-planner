/**
 * Components Module Exports
 *
 * Central export point for all UI components.
 */

// ============================================================================
// Error Boundary
// ============================================================================

export { ErrorBoundary } from './ErrorBoundary';

// ============================================================================
// Primitives
// ============================================================================

export { Button } from './primitives/Button';
export { Badge } from './primitives/Badge';
export { Card } from './primitives/Card';
export { CardIconContainer } from './primitives/CardIconContainer';
export { EmptyState } from './primitives/EmptyState';
export { IconButton } from './primitives/IconButton';
export { Input } from './primitives/Input';
export { Pill } from './primitives/Pill';
export { SectionTitle } from './primitives/SectionTitle';
export { Spinner } from './primitives/Spinner';
export { Tag } from './primitives/Tag';
export { CollapsibleGroup } from './primitives/CollapsibleGroup';
export { StatusBadge } from './primitives/StatusBadge';

// ============================================================================
// Layout
// ============================================================================

// Legacy (to be deprecated)
export { AppShell } from './layout/AppShell';
export { PatientHeader } from './layout/PatientHeader';
export { SplitPane } from './layout/SplitPane';

// New Adaptive Layout System
export { AdaptiveLayout } from './layout/AdaptiveLayout';
export { CollapsiblePane } from './layout/CollapsiblePane';
export { FloatingToggleButton } from './layout/FloatingToggleButton';
export { UnifiedHeaderRow } from './layout/UnifiedHeaderRow';
export { MenuPane } from './layout/MenuPane';
export { MenuSection } from './layout/MenuSection';
export { MenuNavItem } from './layout/MenuNavItem';
export { PatientWorkspaceItem } from './layout/PatientWorkspaceItem';
export { PatientOverviewPane } from './layout/PatientOverviewPane';
export { PatientIdentityHeader } from './layout/PatientIdentityHeader';
export { OverviewSection } from './layout/OverviewSection';
export { CanvasPane } from './layout/CanvasPane';
export { FloatingHeader } from './layout/FloatingHeader';
export { EncounterContextBar } from './layout/EncounterContextBar';
export { MobileSheet } from './layout/MobileSheet';
export { ModeSelector } from './layout/ModeSelector';

// ============================================================================
// Chart Items
// ============================================================================

export { ChartItemCard } from './chart-items/ChartItemCard';
export { DiagnosisCard } from './chart-items/DiagnosisCard';
export { LabCard } from './chart-items/LabCard';
export { MedicationCard } from './chart-items/MedicationCard';
export { VitalsCard } from './chart-items/VitalsCard';

// ============================================================================
// Suggestions
// ============================================================================

export { SuggestionCard } from './suggestions/SuggestionCard';
export { SuggestionChip } from './suggestions/SuggestionChip';
export { SuggestionList } from './suggestions/SuggestionList';

// ============================================================================
// Tasks
// ============================================================================

export { TaskCard } from './tasks/TaskCard';
export { TaskList } from './tasks/TaskList';
export { TaskPane } from './tasks/TaskPane';

// ============================================================================
// Omni Add
// ============================================================================

export { OmniAddBarV2 as OmniAddBar } from './omni-add/OmniAddBarV2';

// ============================================================================
// AI UI
// ============================================================================

export { AlertCard } from './ai-ui/AlertCard';
export { PatientIndicator } from './ai-ui/PatientIndicator';
export { TranscriptionPill } from './ai-ui/TranscriptionPill';
export { AIMinibar } from './ai-ui/AIMinibar';
export { AIPalette } from './ai-ui/AIPalette';
export type { AIMinibarContent, AIMinibarContentType, ToDoContextContent } from './ai-ui/AIMinibar';

// ============================================================================
// Care Gaps
// ============================================================================

export { CareGapCard } from './care-gaps/CareGapCard';
export { CareGapList } from './care-gaps/CareGapList';
export { CareGapSummary } from './care-gaps/CareGapSummary';

// ============================================================================
// Overview Sections
// ============================================================================

export { AllergiesSection } from './overview/AllergiesSection';
export { MedicationsSection } from './overview/MedicationsSection';
export { ProblemsSection } from './overview/ProblemsSection';
export { VitalsSection } from './overview/VitalsSection';

// ============================================================================
// Left Pane System
// ============================================================================

export {
  LeftPaneContainer,
  PaneHeader,
  PaneContent,
  AIDrawerView,
  AIContextHeader,
  SuggestionsSection,
  ConversationHistory,
  AIDrawerFooter,
  QuickActionsRow,
  AIDrawerInput,
  TranscriptionDrawerView,
  TranscriptionContextHeader,
  ViewIndicatorPill,
  TranscriptContent,
  TranscriptionControlsFooter,
} from './LeftPane';
export type {
  LeftPaneContainerProps,
  PaneHeaderProps,
  PaneContentProps,
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
  TranscriptionDrawerViewProps,
  TranscriptionContextHeaderProps,
  ViewIndicatorPillProps,
  TranscriptContentProps,
  TranscriptSegment,
  SpeakerRole,
  TranscriptionControlsFooterProps,
} from './LeftPane';
