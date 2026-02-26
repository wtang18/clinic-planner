# Phase 3: UI Components — Claude Code Prompts

This document contains Claude Code prompts for building the UI component layer. All prompts are designed for **auto-accept mode** (`--dangerously-skip-permissions`).

---

## Safety Notes for Auto-Accept

✅ **Safe operations in this phase:**
- Creating new files in `/src/components/`
- Creating new files in `/src/hooks/`
- Creating CSS/style files
- Installing UI-related npm packages

⚠️ **Review after completion:**
- Accessibility attributes
- Color contrast ratios
- Responsive breakpoints
- Animation timing

---

## Overview

| Chunk | Description | Dependencies | Est. Files |
|-------|-------------|--------------|------------|
| 3.1 | Design Tokens & Theme | None | 3 |
| 3.2 | Base UI Primitives | 3.1 | 8 |
| 3.3 | Chart Item Cards | 3.1, 3.2 | 6 |
| 3.4 | Suggestion Components | 3.1, 3.2 | 4 |
| 3.5 | Task Components | 3.1, 3.2 | 4 |
| 3.6 | OmniAdd Bar | 3.1-3.4 | 5 |
| 3.7 | Minibar & Palette | 3.1, 3.2 | 4 |
| 3.8 | Care Gap Components | 3.1, 3.2 | 4 |
| 3.9 | Layout Components | 3.1, 3.2 | 5 |
| 3.10 | Custom Hooks | Phase 1, Phase 2 | 6 |

---

## Chunk 3.1: Design Tokens & Theme

### Prompt

```
Create the design token system and theme for the EHR UI.

## Requirements

Create the following NEW files:

### 1. `/src/styles/tokens.ts`

Define all design tokens:

```typescript
export const colors = {
  // Brand
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  
  // Semantic - Status
  status: {
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },
  
  // Semantic - Clinical
  clinical: {
    medication: '#8B5CF6',      // Purple
    medicationLight: '#EDE9FE',
    lab: '#06B6D4',             // Cyan
    labLight: '#CFFAFE',
    diagnosis: '#F97316',       // Orange
    diagnosisLight: '#FFEDD5',
    vital: '#EC4899',           // Pink
    vitalLight: '#FCE7F3',
    imaging: '#14B8A6',         // Teal
    imagingLight: '#CCFBF1',
    procedure: '#64748B',       // Slate
    procedureLight: '#F1F5F9',
  },
  
  // Neutral
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // AI indicators
  ai: {
    suggestion: '#A855F7',
    suggestionLight: '#F3E8FF',
    generated: '#8B5CF6',
    confidence: {
      high: '#10B981',
      medium: '#F59E0B',
      low: '#EF4444',
    },
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
} as const;

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Menlo, monospace',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

export const radii = {
  none: '0',
  sm: '0.25rem',
  base: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const;

export const transitions = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
} as const;
```

### 2. `/src/styles/theme.ts`

Create theme context and provider:

```typescript
import { colors, spacing, typography, shadows, radii, transitions } from './tokens';

export interface Theme {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  radii: typeof radii;
  transitions: typeof transitions;
}

export const lightTheme: Theme = {
  colors,
  spacing,
  typography,
  shadows,
  radii,
  transitions,
};

// React context
export const ThemeContext = React.createContext<Theme>(lightTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={lightTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => React.useContext(ThemeContext);
```

### 3. `/src/styles/utils.ts`

Create styling utilities:

```typescript
// Get color for item category
export function getCategoryColor(category: ItemCategory): { bg: string; text: string; border: string }

// Get status indicator color
export function getStatusColor(status: ItemStatus): string

// Get confidence color
export function getConfidenceColor(confidence: number): string

// Get priority indicator
export function getPriorityStyles(priority: Priority): { color: string; icon: string }

// Responsive helpers
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export function mediaQuery(breakpoint: keyof typeof breakpoints): string
```

## Guidelines
- Use CSS custom properties for runtime theming
- All colors should meet WCAG AA contrast requirements
- Include semantic color mappings for clinical context
- Export TypeScript types for all tokens
```

---

## Chunk 3.2: Base UI Primitives

### Prompt

```
Create base UI primitive components for the EHR system.

## Requirements

Create the following NEW files:

### 1. `/src/components/primitives/Button.tsx`

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps>
```

### 2. `/src/components/primitives/Badge.tsx`

```typescript
interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'ai';
  size: 'sm' | 'md';
  dot?: boolean;              // Show dot indicator
  count?: number;             // Show count badge
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps>
```

### 3. `/src/components/primitives/Tag.tsx`

For clinical tags (status, source, alert, etc.):

```typescript
interface TagProps {
  type: TagType;
  label: string;
  color?: string;
  removable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps>
```

### 4. `/src/components/primitives/Input.tsx`

```typescript
interface InputProps {
  type: 'text' | 'number' | 'search' | 'password';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps>
```

### 5. `/src/components/primitives/Card.tsx`

```typescript
interface CardProps {
  variant: 'default' | 'outlined' | 'elevated';
  padding: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;      // Hover/click states
  selected?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps>
```

### 6. `/src/components/primitives/IconButton.tsx`

```typescript
interface IconButtonProps {
  icon: React.ReactNode;
  label: string;              // For accessibility
  variant: 'default' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export const IconButton: React.FC<IconButtonProps>
```

### 7. `/src/components/primitives/Spinner.tsx`

```typescript
interface SpinnerProps {
  size: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps>
```

### 8. `/src/components/primitives/index.ts`

Export all primitives.

## Guidelines
- All interactive elements must have proper focus states
- Include aria-labels and roles for accessibility
- Use forwardRef for form elements
- Support keyboard navigation
- Use theme tokens for all styling
```

---

## Chunk 3.3: Chart Item Cards

### Prompt

```
Create chart item card components for displaying clinical data.

## Requirements

Create the following NEW files:

### 1. `/src/components/chart-items/ChartItemCard.tsx`

Base card component that renders any chart item:

```typescript
interface ChartItemCardProps {
  item: ChartItem;
  variant: 'compact' | 'expanded';
  selected?: boolean;
  showActions?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ChartItemCard: React.FC<ChartItemCardProps>
```

Should:
- Render category-specific icon and color
- Display tags (status, source, alerts)
- Show AI indicator if AI-generated
- Support compact (list) and expanded (detail) views

### 2. `/src/components/chart-items/MedicationCard.tsx`

Specialized card for medications:

```typescript
interface MedicationCardProps {
  medication: MedicationItem;
  variant: 'compact' | 'expanded';
  onPrescribe?: () => void;
  onEdit?: () => void;
}

export const MedicationCard: React.FC<MedicationCardProps>
```

Display: Drug name, dosage, frequency, route, status, controlled indicator

### 3. `/src/components/chart-items/LabCard.tsx`

Specialized card for labs:

```typescript
interface LabCardProps {
  lab: LabItem;
  variant: 'compact' | 'expanded';
  onViewResults?: () => void;
}

export const LabCard: React.FC<LabCardProps>
```

Display: Test name, status, results with flags (OOR highlighting), vendor

### 4. `/src/components/chart-items/DiagnosisCard.tsx`

Specialized card for diagnoses:

```typescript
interface DiagnosisCardProps {
  diagnosis: DiagnosisItem;
  variant: 'compact' | 'expanded';
  linkedItems?: ChartItem[];   // Items linked to this Dx
}

export const DiagnosisCard: React.FC<DiagnosisCardProps>
```

Display: Description, ICD code, type (encounter/chronic), linked items count

### 5. `/src/components/chart-items/VitalsCard.tsx`

Specialized card for vitals:

```typescript
interface VitalsCardProps {
  vitals: VitalsItem;
  variant: 'compact' | 'expanded';
  showTrends?: boolean;
}

export const VitalsCard: React.FC<VitalsCardProps>
```

Display: All vital measurements, flags for abnormal values

### 6. `/src/components/chart-items/index.ts`

Export all chart item components.

## Guidelines
- Cards should be consistent height in compact mode
- Use category colors from design tokens
- Highlight AI-generated content with subtle indicator
- Support touch targets for mobile
- Results with flags should be prominently highlighted
```

---

## Chunk 3.4: Suggestion Components

### Prompt

```
Create suggestion UI components for AI-generated suggestions.

## Requirements

Create the following NEW files:

### 1. `/src/components/suggestions/SuggestionChip.tsx`

Compact suggestion displayed in OmniAdd area:

```typescript
interface SuggestionChipProps {
  suggestion: Suggestion;
  onAccept: () => void;
  onDismiss: () => void;
  onModify?: () => void;
}

export const SuggestionChip: React.FC<SuggestionChipProps>
```

Display:
- Suggestion text (truncated if needed)
- Confidence indicator (color-coded)
- Source icon (transcription, AI, care-gap)
- Accept/dismiss actions
- Expiration indicator (fade as TTL approaches)

### 2. `/src/components/suggestions/SuggestionCard.tsx`

Expanded suggestion with full details:

```typescript
interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept: () => void;
  onAcceptWithChanges: (changes: Partial<ChartItem>) => void;
  onDismiss: (reason?: string) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps>
```

Display:
- Full suggestion content
- Reasoning (if available)
- Source transcript excerpt (if from transcription)
- Confidence score with explanation
- Actions: Accept, Accept with changes, Dismiss

### 3. `/src/components/suggestions/SuggestionList.tsx`

List container for multiple suggestions:

```typescript
interface SuggestionListProps {
  suggestions: Suggestion[];
  maxVisible?: number;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  onClearAll?: () => void;
}

export const SuggestionList: React.FC<SuggestionListProps>
```

Features:
- Animated entrance/exit
- "N more" indicator when exceeds maxVisible
- Empty state when no suggestions

### 4. `/src/components/suggestions/index.ts`

Export all suggestion components.

## Guidelines
- Suggestions should feel ephemeral (not permanent)
- Use AI color tokens for styling
- Animate opacity based on TTL remaining
- Support keyboard navigation for accept/dismiss
- Show clear source attribution
```

---

## Chunk 3.5: Task Components

### Prompt

```
Create task UI components for background task management.

## Requirements

Create the following NEW files:

### 1. `/src/components/tasks/TaskCard.tsx`

Individual task display:

```typescript
interface TaskCardProps {
  task: BackgroundTask;
  onApprove?: () => void;
  onReject?: (reason?: string) => void;
  onRetry?: () => void;
  onCancel?: () => void;
}

export const TaskCard: React.FC<TaskCardProps>
```

Display:
- Task title and type icon
- Status badge
- Progress bar (if processing)
- Result preview (if completed)
- Error message (if failed)
- Contextual actions based on status

### 2. `/src/components/tasks/TaskList.tsx`

Grouped task list:

```typescript
interface TaskListProps {
  tasks: BackgroundTask[];
  groupBy: 'status' | 'type' | 'none';
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onBatchApprove?: (ids: string[]) => void;
}

export const TaskList: React.FC<TaskListProps>
```

Features:
- Collapsible groups
- Batch actions header
- Empty state per group
- Count badges per group

### 3. `/src/components/tasks/TaskPane.tsx`

Full task pane panel:

```typescript
interface TaskPaneProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskPane: React.FC<TaskPaneProps>
```

Sections:
- Ready to Send (with "Send All" button)
- Needs Review (requires individual action)
- Processing (with progress indicators)
- Completed (collapsible, with "Hide" option)

### 4. `/src/components/tasks/index.ts`

Export all task components.

## Guidelines
- Task pane should slide in from right
- Use status colors consistently
- Show time elapsed for processing tasks
- Enable keyboard shortcuts for batch actions
- Provide clear visual hierarchy of urgency
```

---

## Chunk 3.6: OmniAdd Bar

### Prompt

```
Create the OmniAdd bar component - the primary input mechanism during charting.

## Requirements

Create the following NEW files:

### 1. `/src/components/omni-add/OmniAddBar.tsx`

Main OmniAdd component:

```typescript
interface OmniAddBarProps {
  onItemAdd: (item: Partial<ChartItem>) => void;
  activeSuggestions: Suggestion[];
  onSuggestionAccept: (id: string) => void;
  onSuggestionDismiss: (id: string) => void;
  recentItems?: ChartItem[];    // For quick re-add
}

export const OmniAddBar: React.FC<OmniAddBarProps>
```

States:
1. Collapsed: Just the "+ Add" button
2. Category selection: Show category buttons
3. Search/input: Text input with autocomplete
4. Detail entry: Category-specific form fields

### 2. `/src/components/omni-add/CategorySelector.tsx`

Category button row:

```typescript
interface CategorySelectorProps {
  onSelect: (category: ItemCategory) => void;
  recentCategories?: ItemCategory[];
  disabled?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps>
```

Categories to show:
- Rx (medication)
- Lab
- Dx (diagnosis)
- Imaging
- Procedure
- Other (expands to full list)

### 3. `/src/components/omni-add/QuickAddInput.tsx`

Searchable input with autocomplete:

```typescript
interface QuickAddInputProps {
  category: ItemCategory;
  onSelect: (template: Partial<ChartItem>) => void;
  onCancel: () => void;
  placeholder?: string;
}

export const QuickAddInput: React.FC<QuickAddInputProps>
```

Features:
- Debounced search
- Keyboard navigation
- Recent selections
- Category-specific suggestions

### 4. `/src/components/omni-add/ItemDetailForm.tsx`

Detail entry form for selected item:

```typescript
interface ItemDetailFormProps {
  category: ItemCategory;
  initialData: Partial<ChartItem>;
  onSubmit: (item: Partial<ChartItem>) => void;
  onCancel: () => void;
  smartDefaults?: boolean;
}

export const ItemDetailForm: React.FC<ItemDetailFormProps>
```

Forms by category:
- Medication: dosage, route, frequency, quantity, refills
- Lab: priority, vendor, collection type
- Diagnosis: ICD code picker, type
- Imaging: study type, body part, indication

### 5. `/src/components/omni-add/index.ts`

Export all OmniAdd components.

## Guidelines
- OmniAdd should always be visible during capture mode
- Progressive disclosure: don't overwhelm with options
- Support both mouse and keyboard workflows
- Show suggestions inline when relevant
- Smart defaults based on common patterns
```

---

## Chunk 3.7: Minibar & Palette

### Prompt

```
Create the Minibar and Palette components for AI interaction.

## Requirements

Create the following NEW files:

### 1. `/src/components/ai-ui/Minibar.tsx`

Persistent status indicator:

```typescript
interface MinibarProps {
  transcriptionStatus: TranscriptionStatus;
  pendingReviewCount: number;
  alertCount: number;
  syncStatus: SyncStatus;
  onTranscriptionToggle: () => void;
  onOpenPalette: () => void;
  onOpenTaskPane: () => void;
}

export const Minibar: React.FC<MinibarProps>
```

Display (left to right):
- Transcription toggle (mic icon with status)
- Pending review badge
- Alert badge (if any)
- Sync status indicator
- Expand to palette button

### 2. `/src/components/ai-ui/Palette.tsx`

Expanded AI interaction panel:

```typescript
interface PaletteProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  suggestions: Suggestion[];
  onAlertAcknowledge: (id: string) => void;
  onSuggestionAccept: (id: string) => void;
  onSuggestionDismiss: (id: string) => void;
}

export const Palette: React.FC<PaletteProps>
```

Sections:
- Alerts (if any) - shown first
- Active suggestions
- Quick actions (generate note, check interactions)

### 3. `/src/components/ai-ui/AlertCard.tsx`

Alert display component:

```typescript
interface AlertCardProps {
  alert: Alert;
  onAcknowledge: () => void;
  onAction: (actionId: string) => void;
}

export const AlertCard: React.FC<AlertCardProps>
```

Display:
- Severity icon and color
- Title and message
- Action buttons
- Timestamp

### 4. `/src/components/ai-ui/index.ts`

Export all AI UI components.

## Guidelines
- Minibar should be fixed position, always visible
- Palette should slide up from minibar
- Critical alerts should auto-open palette
- Use consistent badge styling
- Support "do not disturb" mode
```

---

## Chunk 3.8: Care Gap Components

### Prompt

```
Create care gap UI components.

## Requirements

Create the following NEW files:

### 1. `/src/components/care-gaps/CareGapCard.tsx`

Individual care gap display:

```typescript
interface CareGapCardProps {
  gap: CareGapInstance;
  onAction: (action: ClosureAction) => void;
  onExclude: (reason: CareGapExclusionReason) => void;
}

export const CareGapCard: React.FC<CareGapCardProps>
```

Display:
- Gap name and category
- Priority indicator (color-coded)
- Due date / overdue status
- Action button
- Exclude menu (with reasons)

### 2. `/src/components/care-gaps/CareGapList.tsx`

Care gap list for patient overview:

```typescript
interface CareGapListProps {
  gaps: CareGapInstance[];
  groupBy: 'category' | 'priority' | 'status';
  onAction: (gapId: string, action: ClosureAction) => void;
  onExclude: (gapId: string, reason: CareGapExclusionReason) => void;
}

export const CareGapList: React.FC<CareGapListProps>
```

Features:
- Grouped display with counts
- Sort by due date within groups
- Show addressed/pending indicators

### 3. `/src/components/care-gaps/CareGapSummary.tsx`

Compact summary for header area:

```typescript
interface CareGapSummaryProps {
  gaps: CareGapInstance[];
  onClick: () => void;        // Opens full list
}

export const CareGapSummary: React.FC<CareGapSummaryProps>
```

Display:
- "X open gaps" badge
- Priority breakdown (red/yellow/green dots)
- Clickable to expand

### 4. `/src/components/care-gaps/index.ts`

Export all care gap components.

## Guidelines
- Use consistent priority colors (red=critical, yellow=important, green=routine)
- Overdue gaps should be prominently highlighted
- Exclusion should require confirmation
- Show clear path to closure (action button)
```

---

## Chunk 3.9: Layout Components

### Prompt

```
Create layout components for the main views.

## Requirements

Create the following NEW files:

### 1. `/src/components/layout/AppShell.tsx`

Main application shell:

```typescript
interface AppShellProps {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  main: React.ReactNode;
  footer?: React.ReactNode;
  minibar?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps>
```

### 2. `/src/components/layout/PatientHeader.tsx`

Patient context header:

```typescript
interface PatientHeaderProps {
  patient: PatientContext;
  encounter: EncounterMeta;
  careGapCount?: number;
  onPatientClick?: () => void;
}

export const PatientHeader: React.FC<PatientHeaderProps>
```

Display:
- Patient name, age, gender
- MRN
- Encounter type and status
- Care gap indicator
- Allergies alert strip

### 3. `/src/components/layout/ModeSelector.tsx`

Mode switching control:

```typescript
interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps>
```

Modes: Capture | Process | Review (segmented control)

### 4. `/src/components/layout/SplitPane.tsx`

Resizable split pane:

```typescript
interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number;      // 0-100 percentage
  minLeft?: number;
  minRight?: number;
  collapsible?: 'left' | 'right' | 'both';
}

export const SplitPane: React.FC<SplitPaneProps>
```

### 5. `/src/components/layout/index.ts`

Export all layout components.

## Guidelines
- AppShell should be responsive
- PatientHeader should be sticky
- Mode selector should show confirmation for unsaved changes
- SplitPane should persist size preference
```

---

## Chunk 3.10: Custom Hooks

### Prompt

```
Create custom React hooks for state and service integration.

## Requirements

Create the following NEW files:

### 1. `/src/hooks/useEncounterState.ts`

Main state hook:

```typescript
export function useEncounterState(): {
  state: EncounterState;
  dispatch: (action: EncounterAction) => void;
}

export function useSelector<T>(selector: (state: EncounterState) => T): T
```

### 2. `/src/hooks/useChartItems.ts`

Chart item hooks:

```typescript
export function useChartItems(): ChartItem[]
export function useChartItem(id: string): ChartItem | undefined
export function useItemsByCategory(category: ItemCategory): ChartItem[]
export function useItemActions(): {
  addItem: (item: Partial<ChartItem>, source: ItemSource) => void;
  updateItem: (id: string, changes: Partial<ChartItem>) => void;
  confirmItem: (id: string) => void;
  cancelItem: (id: string) => void;
}
```

### 3. `/src/hooks/useSuggestions.ts`

Suggestion hooks:

```typescript
export function useActiveSuggestions(): Suggestion[]
export function useSuggestionActions(): {
  acceptSuggestion: (id: string) => void;
  acceptWithChanges: (id: string, changes: Partial<ChartItem>) => void;
  dismissSuggestion: (id: string, reason?: string) => void;
}
```

### 4. `/src/hooks/useTasks.ts`

Task hooks:

```typescript
export function useTasks(): BackgroundTask[]
export function useTasksByStatus(status: TaskStatus): BackgroundTask[]
export function useTaskActions(): {
  approveTask: (id: string) => void;
  rejectTask: (id: string, reason?: string) => void;
  batchApprove: (ids: string[]) => void;
}
```

### 5. `/src/hooks/useCareGaps.ts`

Care gap hooks:

```typescript
export function useCareGaps(): CareGapInstance[]
export function useOpenCareGaps(): CareGapInstance[]
export function useCareGapActions(): {
  addressGap: (gapId: string, itemId: string) => void;
  excludeGap: (gapId: string, reason: CareGapExclusionReason) => void;
}
```

### 6. `/src/hooks/index.ts`

Export all hooks.

## Guidelines
- Hooks should use the store from context
- Include proper TypeScript types
- Memoize selectors where appropriate
- Hooks should be composable
```

---

## Execution Order

Run these prompts in sequence:

1. **3.1 Design Tokens** → Foundation for all styling
2. **3.2 Base Primitives** → Building blocks
3. **3.3 Chart Item Cards** → Core display components
4. **3.4 Suggestions** → AI interaction
5. **3.5 Tasks** → Background task UI
6. **3.6 OmniAdd** → Primary input
7. **3.7 Minibar & Palette** → AI status/interaction
8. **3.8 Care Gaps** → Quality measures
9. **3.9 Layout** → Page structure
10. **3.10 Hooks** → State integration

---

## Verification Checklist

After completing Phase 3:

- [ ] All components compile without TypeScript errors
- [ ] Design tokens are applied consistently
- [ ] Components render in isolation (Storybook-ready)
- [ ] Accessibility: focus states, aria labels present
- [ ] Responsive: components work at different sizes
- [ ] Hooks integrate with store correctly
- [ ] Category colors are distinct and accessible

---

## Related Documents

- [Component Library](./ui/COMPONENT_LIBRARY.md) — Design specifications
- [Design Tokens](./ui/DESIGN_TOKENS.md) — Token reference
- [Interaction Patterns](./ui/INTERACTION_PATTERNS.md) — UX patterns
