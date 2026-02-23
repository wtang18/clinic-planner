/**
 * Shared option sets for medication field definitions.
 *
 * Extracted from RxFields.ts so both RxFields (prescribing) and
 * ReportMedFields (patient-reported) can reuse the same options.
 */

import type { FieldOption } from '../FieldOptionPills';

export const ROUTE_OPTIONS: FieldOption[] = [
  { value: 'PO', label: 'PO' },
  { value: 'IM', label: 'IM' },
  { value: 'IV', label: 'IV' },
  { value: 'SC', label: 'SC' },
  { value: 'topical', label: 'Topical' },
  { value: 'Inhalation', label: 'Inhaled' },
  { value: 'intranasal', label: 'Nasal' },
  { value: 'rectal', label: 'Rectal' },
];

export const FREQUENCY_OPTIONS: FieldOption[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'BID', label: 'BID' },
  { value: 'TID', label: 'TID' },
  { value: 'QID', label: 'QID' },
  { value: 'Q4-6H PRN', label: 'Q4-6H PRN' },
  { value: 'TID PRN', label: 'TID PRN' },
  { value: 'QHS', label: 'QHS' },
  { value: 'PRN', label: 'PRN' },
];
