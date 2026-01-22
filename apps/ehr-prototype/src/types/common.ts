/**
 * Common types used throughout the EHR system
 */

/** User reference for audit trails and display */
export interface UserReference {
  id: string;
  name: string;
  role?: Role;
}

/** Clinical roles in the system */
export type Role =
  | 'provider'   // MD, DO, PA, NP
  | 'nurse'      // RN, LPN
  | 'ma'         // Medical Assistant
  | 'scribe'
  | 'tech'       // Lab tech, X-ray tech
  | 'admin'
  | 'billing';

/** Priority levels */
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

/** Sync status for optimistic updates */
export type SyncStatus = 'local' | 'syncing' | 'synced' | 'error';

/** Physical address */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

/** Base interface for timestamped records */
export interface Timestamped {
  createdAt: Date;
  modifiedAt: Date;
}

/** Base interface for auditable records (extends Timestamped) */
export interface Auditable extends Timestamped {
  createdBy: UserReference;
  modifiedBy: UserReference;
}

/** Verification status for reported data */
export type VerificationStatus = 'unverified' | 'verified' | 'discrepancy';

/** Clinical status for diagnoses and conditions */
export type ClinicalStatus = 'active' | 'resolved' | 'inactive';

/** Flag types for lab results */
export type ResultFlag = 'normal' | 'low' | 'high' | 'critical';

/** Utility type for partial nested updates */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
