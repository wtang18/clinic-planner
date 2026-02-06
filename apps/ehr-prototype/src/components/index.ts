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
export { AdaptiveLayout, useLayoutState } from './layout/AdaptiveLayout';
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
export { AIDrawer } from './layout/AIDrawer';
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

export { CategorySelector } from './omni-add/CategorySelector';
export { ItemDetailForm } from './omni-add/ItemDetailForm';
export { OmniAddBar } from './omni-add/OmniAddBar';
export { QuickAddInput } from './omni-add/QuickAddInput';

// ============================================================================
// AI UI
// ============================================================================

export { AlertCard } from './ai-ui/AlertCard';
export { Minibar } from './ai-ui/Minibar';
export { Palette } from './ai-ui/Palette';
export { AIDrawerContent } from './ai-ui/AIDrawerContent';
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
