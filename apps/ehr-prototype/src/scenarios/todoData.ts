/**
 * Mock To-Do Data
 *
 * Sample data for To-Do categories, filters, and items.
 * Patient references use consistent MRNs from patientData.ts registry.
 */

import { TODO_PATIENTS } from './patientData';

// ============================================================================
// Types
// ============================================================================

export interface ToDoFilter {
  id: string;
  label: string;
  count: number;
}

export interface ToDoCategory {
  id: string;
  label: string;
  icon: string;
  defaultFilterId: string;
  filters: ToDoFilter[];
}

export interface ToDoItem {
  id: string;
  categoryId: string;
  filterId: string;
  title: string;
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    mrn: string;
  };
  owner?: string;
  dueDate?: string;
  createdDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'normal' | 'urgent' | 'stat';
}

// ============================================================================
// Category Definitions
// ============================================================================

export const TODO_CATEGORIES: ToDoCategory[] = [
  {
    id: 'tasks',
    label: 'Tasks',
    icon: 'CheckSquare',
    defaultFilterId: 'my-pending',
    filters: [
      { id: 'my-pending', label: 'My Pending', count: 4 },
      { id: 'chart-review', label: 'Chart Review', count: 1 },
      { id: 'chart-sign-off', label: 'Chart Sign-Off', count: 3 }, // +1 for Lauren Svendsen
      { id: 'review-results', label: 'Review Results', count: 1 },
      { id: 'rx-requests', label: 'Rx Requests', count: 1 },
      { id: 'follow-ups', label: 'Follow-Ups', count: 1 },
      { id: 'all-tasks', label: 'All Tasks', count: 11 },
    ],
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: 'Inbox',
    defaultFilterId: 'unsorted',
    filters: [
      { id: 'unsorted', label: 'Unsorted', count: 6 },
      { id: 'all-faxes', label: 'All Faxes', count: 8 },
    ],
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'MessageSquare',
    defaultFilterId: 'my-pending',
    filters: [
      { id: 'my-pending', label: 'My Pending', count: 6 },
      { id: 'all-messages', label: 'All Messages', count: 8 },
    ],
  },
  {
    id: 'care',
    label: 'Care Adherence',
    icon: 'Heart',
    defaultFilterId: 'my-pending',
    filters: [
      { id: 'my-pending', label: 'My Pending', count: 5 }, // +1 for Robert Martinez
      { id: 'all-care', label: 'All Care', count: 7 },
    ],
  },
];

// ============================================================================
// Mock Items
// ============================================================================

export const MOCK_TASKS: ToDoItem[] = [
  {
    id: 'task-1',
    categoryId: 'tasks',
    filterId: 'my-pending',
    title: 'Call Patient: Questions About Today\'s Visit',
    patient: TODO_PATIENTS.danteP,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-24',
    createdDate: '2024-09-20',
    status: 'pending',
  },
  {
    id: 'task-2',
    categoryId: 'tasks',
    filterId: 'my-pending',
    title: 'Call Patient: Discuss Lab Results',
    patient: TODO_PATIENTS.barbaraK,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-18',
    createdDate: '2024-09-15',
    status: 'pending',
    priority: 'urgent',
  },
  {
    id: 'task-3',
    categoryId: 'tasks',
    filterId: 'my-pending',
    title: 'Schedule Follow-Up Appointment',
    patient: TODO_PATIENTS.helenW,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-25',
    createdDate: '2024-09-21',
    status: 'pending',
  },
  {
    id: 'task-4',
    categoryId: 'tasks',
    filterId: 'my-pending',
    title: 'Review Prior Authorization Status',
    patient: TODO_PATIENTS.ivanT,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-24',
    createdDate: '2024-09-22',
    status: 'pending',
  },
  {
    id: 'task-5',
    categoryId: 'tasks',
    filterId: 'rx-requests',
    title: 'Change Rx: Metformin dosage adjustment',
    patient: TODO_PATIENTS.carlosE,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-24',
    createdDate: '2024-09-20',
    status: 'pending',
  },
  {
    id: 'task-6',
    categoryId: 'tasks',
    filterId: 'chart-sign-off',
    title: 'Sign Off Chart: PR1',
    patient: TODO_PATIENTS.dianaL,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-24',
    createdDate: '2024-09-20',
    status: 'pending',
  },
  {
    id: 'task-7',
    categoryId: 'tasks',
    filterId: 'chart-sign-off',
    title: 'Sign Off Chart: Annual Physical',
    patient: TODO_PATIENTS.edwardM,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-24',
    createdDate: '2024-09-19',
    status: 'pending',
  },
  {
    id: 'task-8',
    categoryId: 'tasks',
    filterId: 'chart-review',
    title: 'Review Chart: New Patient Intake',
    patient: TODO_PATIENTS.juliaS,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-25',
    createdDate: '2024-09-22',
    status: 'pending',
  },
  {
    id: 'task-9',
    categoryId: 'tasks',
    filterId: 'follow-ups',
    title: 'Follow-Up: Blood Pressure Monitoring',
    patient: TODO_PATIENTS.barbaraK,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-30',
    createdDate: '2024-09-15',
    status: 'pending',
  },
  {
    id: 'task-10',
    categoryId: 'tasks',
    filterId: 'review-results',
    title: 'Review Results: CBC Panel',
    patient: TODO_PATIENTS.kevinR,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-23',
    createdDate: '2024-09-22',
    status: 'pending',
    priority: 'stat',
  },
  // Scenario patients - Lauren Svendsen chart sign-off
  {
    id: 'task-11',
    categoryId: 'tasks',
    filterId: 'chart-sign-off',
    title: 'Sign Off Chart: UC Cough Visit',
    patient: TODO_PATIENTS.laurenS,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-24',
    createdDate: '2024-09-23',
    status: 'pending',
  },
];

// Empty patient for unlinked faxes
const UNLINKED_PATIENT = { id: '', name: '', age: 0, gender: '', mrn: '' };

export const MOCK_FAXES: ToDoItem[] = [
  {
    id: 'fax-1',
    categoryId: 'inbox',
    filterId: 'unsorted',
    title: 'Billing Statement',
    patient: TODO_PATIENTS.danteP,
    createdDate: '2024-09-20',
    status: 'pending',
  },
  {
    id: 'fax-2',
    categoryId: 'inbox',
    filterId: 'unsorted',
    title: 'MRI Results - Lumbar Spine',
    patient: TODO_PATIENTS.danteP,
    createdDate: '2024-09-20',
    status: 'pending',
  },
  {
    id: 'fax-3',
    categoryId: 'inbox',
    filterId: 'unsorted',
    title: 'Medical Record Request',
    patient: UNLINKED_PATIENT,
    createdDate: '2024-09-20',
    status: 'pending',
  },
  {
    id: 'fax-4',
    categoryId: 'inbox',
    filterId: 'unsorted',
    title: 'Referral Note - Cardiology',
    patient: UNLINKED_PATIENT,
    createdDate: '2024-09-20',
    status: 'pending',
    priority: 'urgent',
  },
  {
    id: 'fax-5',
    categoryId: 'inbox',
    filterId: 'unsorted',
    title: 'Prior Auth Approval',
    patient: TODO_PATIENTS.ivanT,
    createdDate: '2024-09-21',
    status: 'pending',
  },
  {
    id: 'fax-6',
    categoryId: 'inbox',
    filterId: 'unsorted',
    title: 'Lab Results - Lipid Panel',
    patient: TODO_PATIENTS.edwardM,
    createdDate: '2024-09-21',
    status: 'pending',
  },
  {
    id: 'fax-7',
    categoryId: 'inbox',
    filterId: 'all-faxes',
    title: 'Specialist Consult Note',
    patient: TODO_PATIENTS.dianaL,
    createdDate: '2024-09-19',
    status: 'completed',
  },
  {
    id: 'fax-8',
    categoryId: 'inbox',
    filterId: 'all-faxes',
    title: 'Insurance Pre-Auth Request',
    patient: TODO_PATIENTS.barbaraK,
    createdDate: '2024-09-18',
    status: 'completed',
  },
];

export const MOCK_MESSAGES: ToDoItem[] = [
  {
    id: 'msg-1',
    categoryId: 'messages',
    filterId: 'my-pending',
    title: 'Cold and flu symptoms – Urgent',
    patient: TODO_PATIENTS.adamR,
    createdDate: '2024-09-20T15:30:00',
    status: 'pending',
    priority: 'urgent',
  },
  {
    id: 'msg-2',
    categoryId: 'messages',
    filterId: 'my-pending',
    title: 'Question about medication side effects',
    patient: TODO_PATIENTS.barbaraK,
    createdDate: '2024-09-20T14:15:00',
    status: 'pending',
  },
  {
    id: 'msg-3',
    categoryId: 'messages',
    filterId: 'my-pending',
    title: 'Prescription Refill Request',
    patient: TODO_PATIENTS.carlosE,
    createdDate: '2024-09-20T12:00:00',
    status: 'pending',
  },
  {
    id: 'msg-4',
    categoryId: 'messages',
    filterId: 'my-pending',
    title: 'Test results inquiry',
    patient: TODO_PATIENTS.helenW,
    createdDate: '2024-09-20T10:30:00',
    status: 'pending',
  },
  {
    id: 'msg-5',
    categoryId: 'messages',
    filterId: 'my-pending',
    title: 'Appointment reschedule request',
    patient: TODO_PATIENTS.juliaS,
    createdDate: '2024-09-20T09:00:00',
    status: 'pending',
  },
  {
    id: 'msg-6',
    categoryId: 'messages',
    filterId: 'my-pending',
    title: 'Insurance coverage question',
    patient: TODO_PATIENTS.ivanT,
    createdDate: '2024-09-19T16:45:00',
    status: 'pending',
  },
  {
    id: 'msg-7',
    categoryId: 'messages',
    filterId: 'all-messages',
    title: 'Thank you for the visit',
    patient: TODO_PATIENTS.danteP,
    createdDate: '2024-09-18T14:00:00',
    status: 'completed',
  },
  {
    id: 'msg-8',
    categoryId: 'messages',
    filterId: 'all-messages',
    title: 'Follow-up question answered',
    patient: TODO_PATIENTS.edwardM,
    createdDate: '2024-09-17T11:30:00',
    status: 'completed',
  },
];

export const MOCK_CARE: ToDoItem[] = [
  {
    id: 'care-1',
    categoryId: 'care',
    filterId: 'my-pending',
    title: 'Follow-Up Visit: Post-Procedure',
    patient: TODO_PATIENTS.adamR,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-24',
    createdDate: '2024-09-20',
    status: 'pending',
  },
  {
    id: 'care-2',
    categoryId: 'care',
    filterId: 'my-pending',
    title: 'Imaging: CT Scan Scheduled',
    patient: TODO_PATIENTS.barbaraK,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-24',
    createdDate: '2024-09-20',
    status: 'pending',
    priority: 'urgent',
  },
  {
    id: 'care-3',
    categoryId: 'care',
    filterId: 'my-pending',
    title: 'Imaging: X-Ray Results Received',
    patient: TODO_PATIENTS.dianaL,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-24',
    createdDate: '2024-09-20',
    status: 'pending',
    priority: 'stat',
  },
  {
    id: 'care-4',
    categoryId: 'care',
    filterId: 'my-pending',
    title: 'Referral: Cardiology Consult',
    patient: TODO_PATIENTS.helenW,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-26',
    createdDate: '2024-09-21',
    status: 'pending',
  },
  {
    id: 'care-5',
    categoryId: 'care',
    filterId: 'all-care',
    title: 'Lab: A1C Due',
    patient: TODO_PATIENTS.carlosE,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-10-01',
    createdDate: '2024-09-15',
    status: 'pending',
  },
  {
    id: 'care-6',
    categoryId: 'care',
    filterId: 'all-care',
    title: 'Wellness: Annual Physical Due',
    patient: TODO_PATIENTS.kevinR,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-10-15',
    createdDate: '2024-09-10',
    status: 'pending',
  },
  // Scenario patient - Robert Martinez care adherence
  {
    id: 'care-7',
    categoryId: 'care',
    filterId: 'my-pending',
    title: 'Lab: A1C Follow-up Due',
    patient: TODO_PATIENTS.robertM,
    owner: 'Paige Anderson, PA-C',
    dueDate: '2024-09-28',
    createdDate: '2024-09-15',
    status: 'pending',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the badge count for a category (default filter count)
 */
export function getCategoryBadgeCount(categoryId: string): number {
  const category = TODO_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return 0;

  const defaultFilter = category.filters.find((f) => f.id === category.defaultFilterId);
  return defaultFilter?.count ?? 0;
}

/**
 * Get total pending count across all categories
 */
export function getTotalPendingCount(): number {
  return TODO_CATEGORIES.reduce((total, category) => {
    return total + getCategoryBadgeCount(category.id);
  }, 0);
}

/**
 * Get all items for a category
 */
export function getItemsByCategory(categoryId: string): ToDoItem[] {
  switch (categoryId) {
    case 'tasks':
      return MOCK_TASKS;
    case 'inbox':
      return MOCK_FAXES;
    case 'messages':
      return MOCK_MESSAGES;
    case 'care':
      return MOCK_CARE;
    default:
      return [];
  }
}

/**
 * Get items for a specific filter
 */
export function getItemsByFilter(categoryId: string, filterId: string): ToDoItem[] {
  const items = getItemsByCategory(categoryId);

  // "All" filters return everything
  if (filterId.startsWith('all')) {
    return items;
  }

  return items.filter((item) => item.filterId === filterId);
}

/**
 * Get category by ID
 */
export function getCategoryById(categoryId: string): ToDoCategory | undefined {
  return TODO_CATEGORIES.find((c) => c.id === categoryId);
}

/**
 * Get filter by ID within a category
 */
export function getFilterById(categoryId: string, filterId: string): ToDoFilter | undefined {
  const category = getCategoryById(categoryId);
  return category?.filters.find((f) => f.id === filterId);
}
