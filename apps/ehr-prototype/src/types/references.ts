/**
 * Reference types for external entities
 */

import type { Address } from './common';

/** Facility reference (clinic, hospital, lab, imaging center) */
export interface FacilityReference {
  id: string;
  name: string;
  type?: 'clinic' | 'hospital' | 'lab' | 'imaging-center';
  address?: Address;
  phone?: string;
  fax?: string;
}

/** Provider reference */
export interface ProviderReference {
  id: string;
  name: string;
  specialty?: string;
  npi?: string; // National Provider Identifier
  facility?: FacilityReference;
}

/** Pharmacy reference */
export interface PharmacyReference {
  id: string;
  name: string;
  ncpdpId?: string; // National pharmacy ID
  address?: Address;
  phone?: string;
  fax?: string;
}

/** Lab vendor reference */
export interface LabVendorReference {
  id: string;
  name: string; // "Quest", "LabCorp"
  accountNumber?: string;
}
