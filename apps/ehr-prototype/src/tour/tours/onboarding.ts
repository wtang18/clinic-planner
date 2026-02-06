/**
 * Onboarding Tours
 *
 * Guided tours for onboarding, feature discovery, and workflow training.
 */

import type { Tour } from '../TourSystem';

// ============================================================================
// Capture Mode Basics
// ============================================================================

export const CAPTURE_BASICS_TOUR: Tour = {
  id: 'capture-basics',
  name: 'Capture Mode Basics',
  description: 'Learn the fundamentals of capturing clinical data',
  category: 'onboarding',
  steps: [
    {
      id: 'welcome',
      targetTestId: 'capture-view',
      title: 'Welcome to Capture Mode',
      content:
        'This is where you document the patient encounter. Items appear chronologically as you add them.',
      position: 'bottom',
    },
    {
      id: 'patient-header',
      targetTestId: 'patient-header',
      title: 'Patient Information',
      content:
        'Patient demographics, allergies, and key clinical info are always visible here.',
      position: 'bottom',
    },
    {
      id: 'care-gaps',
      targetTestId: 'care-gap-indicator',
      title: 'Care Gaps',
      content:
        'This badge shows open care gaps. Tap to see what preventive care is due.',
      position: 'bottom',
    },
    {
      id: 'omni-add',
      targetTestId: 'omni-add-input',
      title: 'Add to Chart',
      content:
        'Tap here (or press "A" on web) to add any item to the chart. Start typing to search.',
      position: 'top',
    },
    {
      id: 'transcription',
      targetTestId: 'transcription-toggle',
      title: 'Voice Recording',
      content:
        'Tap to start ambient listening. AI will suggest items based on the conversation.',
      position: 'top',
    },
    {
      id: 'minibar',
      targetTestId: 'minibar',
      title: 'Status Bar',
      content:
        'See transcription status, pending tasks, alerts, and sync status at a glance.',
      position: 'top',
    },
    {
      id: 'mode-selector',
      targetTestId: 'mode-selector',
      title: 'Workflow Modes',
      content:
        'Switch between Capture (input), Process (review tasks), and Review (final check) modes.',
      position: 'bottom',
    },
  ],
};

// ============================================================================
// AI Features
// ============================================================================

export const AI_FEATURES_TOUR: Tour = {
  id: 'ai-features',
  name: 'AI-Powered Features',
  description: 'Discover how AI assists your workflow',
  category: 'feature',
  prerequisites: ['capture-basics'],
  steps: [
    {
      id: 'suggestions',
      targetTestId: 'suggestion-chip',
      title: 'AI Suggestions',
      content:
        'When transcription detects clinical entities, they appear as suggestion chips. Tap to accept or dismiss.',
      position: 'top',
      waitForTestId: 'suggestion-chip',
    },
    {
      id: 'tasks',
      targetTestId: 'minibar-tasks',
      title: 'Background Tasks',
      content:
        'AI runs tasks like diagnosis linking, drug interaction checks, and formulary lookups automatically.',
      position: 'top',
    },
    {
      id: 'palette',
      targetTestId: 'minibar-palette-btn',
      title: 'AI Palette',
      content:
        'Tap to open the palette for more suggestions and alerts.',
      position: 'top',
    },
  ],
};

// ============================================================================
// Task Management
// ============================================================================

export const TASK_WORKFLOW_TOUR: Tour = {
  id: 'task-workflow',
  name: 'Task Management',
  description: 'Learn to efficiently process pending tasks',
  category: 'workflow',
  prerequisites: ['capture-basics'],
  steps: [
    {
      id: 'task-pane',
      targetTestId: 'task-pane',
      title: 'Task Pane',
      content:
        'All AI-generated tasks are organized here by status. Review and approve before sending.',
      position: 'left',
    },
    {
      id: 'needs-review',
      targetTestId: 'task-section-needsReview',
      title: 'Needs Review',
      content:
        'These tasks require your decision. Tap to see details and approve or reject.',
      position: 'left',
    },
    {
      id: 'batch-send',
      targetTestId: 'batch-send-btn',
      title: 'Batch Operations',
      content:
        'Send all ready items to their destinations with one tap.',
      position: 'left',
    },
  ],
};

// ============================================================================
// Review Mode
// ============================================================================

export const REVIEW_MODE_TOUR: Tour = {
  id: 'review-mode',
  name: 'Review & Sign-Off',
  description: 'Final documentation review before sign-off',
  category: 'workflow',
  prerequisites: ['capture-basics'],
  steps: [
    {
      id: 'review-view',
      targetTestId: 'review-view',
      title: 'Review Mode',
      content:
        'This is where you perform final review of all documentation before signing off.',
      position: 'bottom',
    },
    {
      id: 'care-gap-summary',
      targetTestId: 'care-gap-summary',
      title: 'Care Gap Summary',
      content:
        'See which care gaps were addressed during this encounter.',
      position: 'top',
    },
    {
      id: 'sign-off',
      targetTestId: 'sign-off-section',
      title: 'Sign-Off',
      content:
        'Review blockers (if any) and sign off to complete the encounter.',
      position: 'top',
    },
  ],
};

// ============================================================================
// All Tours Export
// ============================================================================

export const ALL_TOURS = [
  CAPTURE_BASICS_TOUR,
  AI_FEATURES_TOUR,
  TASK_WORKFLOW_TOUR,
  REVIEW_MODE_TOUR,
];
