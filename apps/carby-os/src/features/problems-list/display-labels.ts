import type { ProblemCategory, ProblemItem } from './types'

/** Category-aware label for soft-closing an item
 * - Conditions/Encounter-Dx → "Mark Inactive" (sets clinicalStatus: 'inactive')
 * - SDOH/Health-Concerns → "Mark Resolved" (sets clinicalStatus: 'resolved')
 */
export const SOFT_CLOSE_LABEL: Record<ProblemCategory, string> = {
  'condition': 'Mark Inactive',
  'encounter-dx': 'Mark Inactive',
  'sdoh': 'Mark Resolved',
  'health-concern': 'Mark Resolved',
}

/** Category-aware label for reactivating from inactive/resolved state */
export const ACTIVATE_FROM_INACTIVE_LABEL: Record<ProblemCategory, string> = {
  'condition': 'Mark Active',
  'encounter-dx': 'Mark Active',
  'sdoh': 'Reopen',
  'health-concern': 'Reopen',
}

/** Category-aware label for activating from confirmed transitional state */
export const ACTIVATE_FROM_CONFIRMED_LABEL: Record<ProblemCategory, string> = {
  'condition': 'Mark Active',
  'encounter-dx': 'Mark Active',
  'sdoh': 'Mark Active',
  'health-concern': 'Mark Active',
}

/** Drawer header title by category */
export const DRAWER_TITLE: Record<ProblemCategory, string> = {
  'condition': 'Condition Details',
  'encounter-dx': 'Encounter Diagnosis Details',
  'sdoh': 'Social Determinant Details',
  'health-concern': 'Patient Concern Details',
}

/** Edit mode title by category */
export const EDIT_TITLE: Record<ProblemCategory, string> = {
  'condition': 'Edit Condition',
  'encounter-dx': 'Edit Encounter Diagnosis',
  'sdoh': 'Edit Social Determinant',
  'health-concern': 'Edit Patient Concern',
}

/**
 * Source pill label logic per DESIGN-SPEC §5.4
 *
 * The label changes based on the item's current state to reflect
 * the most clinically relevant context for the provider.
 */
export function getSourcePillLabel(item: ProblemItem): string {
  if (item.verificationStatus === 'excluded') {
    return item.source === 'screened' ? 'Screened' : 'Reported'
  }
  // Use display status for the source pill label
  if (item.clinicalStatus === 'resolved' || item.clinicalStatus === 'inactive') {
    return getDisplayStatus(item)
  }
  if (item.clinicalStatus === 'recurrence') return 'Recurrence'
  if (item.clinicalStatus === 'active' && item.verificationStatus === 'confirmed') return 'Onset'
  if (item.verificationStatus === 'confirmed') return 'Diagnosed'
  return item.source === 'screened' ? 'Screened' : 'Reported'
}

/**
 * Category-aware display status.
 * - Conditions/Encounter-Dx: "resolved" displays as "Inactive"
 * - SDOH/Health-Concerns: "inactive" displays as "Resolved"
 */
export function getDisplayStatus(item: ProblemItem): string {
  const cat = item.category
  if ((cat === 'condition' || cat === 'encounter-dx') && item.clinicalStatus === 'resolved') {
    return 'Inactive'
  }
  if ((cat === 'sdoh' || cat === 'health-concern') && item.clinicalStatus === 'inactive') {
    return 'Resolved'
  }
  return capitalizeFirst(item.clinicalStatus)
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Determine if a confirmed+active item is in the "transitional" state.
 * Transitional = the item was just confirmed but hasn't had an explicit
 * clinical status action (marked-active, marked-inactive, etc.) yet.
 */
export function isConfirmedTransitional(item: ProblemItem): boolean {
  if (item.verificationStatus !== 'confirmed' || item.clinicalStatus !== 'active') return false
  for (const evt of item.history) {
    if (evt.type === 'confirmed') return true
    if (
      evt.type === 'marked-active' ||
      evt.type === 'marked-inactive' ||
      evt.type === 'marked-resolved' ||
      evt.type === 'marked-addressed' ||
      evt.type === 'reopened' ||
      evt.type === 'recurrence'
    ) {
      return false
    }
  }
  return false
}

/** Format activity event description for the activity log */
export function formatEventDescription(type: ProblemItem['history'][number]['type']): string {
  switch (type) {
    case 'reported': return 'Reported'
    case 'imported': return 'Imported'
    case 'screening-detected': return 'Detected via screening'
    case 'confirmed': return 'Confirmed'
    case 'excluded': return 'Excluded'
    case 'undo-excluded': return 'Exclusion undone'
    case 'undo-confirmed': return 'Confirmation undone'
    case 'marked-active': return 'Marked active'
    case 'marked-inactive': return 'Marked inactive'
    case 'marked-resolved': return 'Marked resolved'
    case 'marked-addressed': return 'Marked addressed'
    case 'recurrence': return 'Recurrence noted'
    case 'reopened': return 'Reopened'
    case 'undo-marked-active': return 'Mark active undone'
    case 'undo-marked-inactive': return 'Mark inactive undone'
    case 'undo-marked-resolved': return 'Mark resolved undone'
    case 'undo-marked-addressed': return 'Mark addressed undone'
    case 'undo-reopened': return 'Reopen undone'
    case 'undo-recurrence': return 'Recurrence undone'
    case 'edited': return 'Edited'
    case 'event-edited': return 'Event date corrected'
    case 'note-added': return 'Note added'
    case 'removed': return 'Removed from problem list'
  }
}
