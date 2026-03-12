# Inline Date Editing for Problems List Detail Drawer

## Goal

Replace the separate edit mode drawer with inline date fields in the summary card, reducing clicks and screens for providers correcting onset/abatement dates.

## Context

Providers move fast and want to avoid unnecessary clicks. The current flow requires: tap pencil icon → edit drawer opens → find date field → type value → Save (3-4 actions). Dates should be directly editable where they're displayed.

## Design

### Layout

A date row sits directly below the pill row in the summary card (no divider):

- **Active / Recurrence / Unconfirmed / Transitional / Excluded items**: Show "Onset" input only
- **Inactive / Resolved items**: Show "Onset" + end date input side-by-side
  - End date label is category-aware: "Inactive since" (conditions/encounter-dx) or "Resolved" (SDOH/health-concerns)

Each date field uses the design system `Input` component with `calendar-small` icon right-aligned.

### Source Date Pill

The source date pill (e.g., "Onset 01/08/20") is **removed from the detail drawer** since the date input fields now serve that purpose. The source pill is **kept on problem list cards** as a compact summary.

### Interaction

- Tap the input or calendar icon → hybrid date picker popover anchored to the field
  - Top: text input pre-filled with current date value (MM/DD/YY format), directly typeable
  - Bottom: mini calendar showing current month with arrow navigation
- **Auto-apply**: selecting a calendar day or pressing Enter in the text input immediately saves
- Click outside or Escape dismisses without change
- Each change creates an `'edited'` history event via existing `editItem` flow (auditable, reversible)

### Date Labels

Following FHIR Condition resource naming:
- **"Onset"** — universal across all categories (maps to `onsetDateTime`)
- **"Inactive since" / "Resolved"** — category-aware end date (maps to `abatementDateTime`)

### What's Removed

- **ProblemEditMode.tsx** — entire file deleted (no more edit drawer)
- **Pencil icon** — removed from summary card header
- **`onEditClick` / `isEditing` state** — removed from ProblemsListView orchestration
- **Notes field** — deferred (not in scope)
- **Description editing** — removed; health concerns will use SNOMED picker (not free text)

### What Stays

- Kebab menu with status actions, undo, remove
- Action buttons (Confirm/Exclude, Mark Active/Inactive, etc.)
- History log with delete/undo-delete
- Source date pill on list cards (not in drawer)

## Prototype Scope

- No date validation (accept any MM/DD/YY string, same as current)
- Calendar picker is functional enough to demo the interaction, not production-grade
- No time component, dates only
