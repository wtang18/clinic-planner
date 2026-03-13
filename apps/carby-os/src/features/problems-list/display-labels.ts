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

/** Drawer header title by category */
export const DRAWER_TITLE: Record<ProblemCategory, string> = {
  'condition': 'Condition Details',
  'encounter-dx': 'Encounter Diagnosis Details',
  'sdoh': 'Social Determinant Details',
  'health-concern': 'Patient Concern Details',
}

/** Category-aware label for confirming as inactive/resolved */
export const CONFIRM_INACTIVE_LABEL: Record<ProblemCategory, string> = {
  'condition': 'Confirm Inactive',
  'encounter-dx': 'Confirm Inactive',
  'sdoh': 'Confirm Resolved',
  'health-concern': 'Confirm Resolved',
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

/** Format activity event description for the activity log */
export function formatEventDescription(type: ProblemItem['history'][number]['type']): string {
  switch (type) {
    case 'reported': return 'Reported'
    case 'imported': return 'Imported'
    case 'screening-detected': return 'Detected via screening'
    case 'confirmed': return 'Confirmed'
    case 'confirmed-active': return 'Confirmed active'
    case 'confirmed-inactive': return 'Confirmed inactive'
    case 'confirmed-resolved': return 'Confirmed resolved'
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
    case 'dates-updated': return 'Dates updated'
    case 'event-edited': return 'Event date corrected'
    case 'note-added': return 'Note added'
    case 'removed': return 'Removed from problem list'
    case 'provider-added': return 'Added'
  }
}
