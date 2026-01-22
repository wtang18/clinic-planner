/**
 * Encounter and visit types
 */

import type { UserReference } from './common';
import type { FacilityReference } from './references';

/** Encounter metadata */
export interface EncounterMeta {
  id: string;
  status: EncounterStatus;
  type: EncounterType;
  
  // Timing
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  signedAt?: Date;
  signedBy?: UserReference;
  
  // Location
  facility?: FacilityReference;
  room?: string;
  
  // Billing
  appointmentId?: string;
  billingStatus?: BillingStatus;
}

/** Encounter status progression */
export type EncounterStatus =
  | 'scheduled'
  | 'checked-in'
  | 'in-progress'
  | 'complete'
  | 'signed'
  | 'amended'
  | 'cancelled';

/** Types of clinical encounters */
export type EncounterType =
  | 'office-visit'
  | 'urgent-care'
  | 'telehealth'
  | 'annual-wellness'
  | 'follow-up'
  | 'procedure'
  | 'consult';

/** Billing status */
export type BillingStatus = 'pending' | 'coded' | 'submitted' | 'paid';

/** Visit-specific metadata */
export interface VisitMeta {
  chiefComplaint?: string;
  visitReason?: string;
  scheduledDuration?: number; // minutes
  actualDuration?: number;
  serviceType?: string; // "Self Pay", "Insurance", etc.
}
