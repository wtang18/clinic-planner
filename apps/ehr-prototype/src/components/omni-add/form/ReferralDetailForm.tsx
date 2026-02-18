/**
 * ReferralDetailForm — Referral Detail Form
 *
 * Category-specific form for referrals. Pre-populates specialty, reason, and urgency
 * from quick-pick data. Allows provider/facility and auth configuration.
 */

import React from 'react';
import type { ChartItem } from '../../../types/chart-items';
import { colors, spaceAround, spaceBetween, typography } from '../../../styles/foundations';
import { Button } from '../../primitives/Button';
import { Input } from '../../primitives/Input';
import { ChipSelect } from './ChipSelect';
import type { ChipOption } from './ChipSelect';
import { FieldRow } from './FieldRow';
import { ToggleSwitch } from './ToggleSwitch';

// ============================================================================
// Types
// ============================================================================

export interface ReferralDetailFormProps {
  initialData: Partial<ChartItem>;
  onSubmit: (item: Partial<ChartItem>) => void;
  onCancel: () => void;
  /** 'create' for OmniAdd flow, 'edit' for DetailsPane editing */
  mode?: 'create' | 'edit';
}

// ============================================================================
// Option sets
// ============================================================================

const URGENCY_OPTIONS: ChipOption[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergent', label: 'Emergent' },
];

// ============================================================================
// Component
// ============================================================================

export const ReferralDetailForm: React.FC<ReferralDetailFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
}) => {
  const data = (initialData as Record<string, unknown>) || {};

  // ── Form state from quick-pick smart defaults ──
  const [reason, setReason] = React.useState<string>(String(data.reason || ''));
  const [urgency, setUrgency] = React.useState<string>(String(data.urgency || 'routine'));
  const [referToProvider, setReferToProvider] = React.useState<string>('');
  const [referToFacility, setReferToFacility] = React.useState<string>('');
  const [requiresAuth, setRequiresAuth] = React.useState<boolean>(Boolean(data.requiresAuth));

  const specialty = String(data.specialty || data.displayText || '');

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      reason: reason || undefined,
      urgency,
      referToProvider: referToProvider ? { id: `prov-${Date.now()}`, name: referToProvider } : undefined,
      referToFacility: referToFacility ? { id: `fac-${Date.now()}`, name: referToFacility } : undefined,
      requiresAuth,
    } as unknown as Partial<ChartItem>);
  };

  return (
    <form style={styles.container} onSubmit={handleSubmit} data-testid="referral-detail-form">
      {/* Header */}
      <div style={styles.header}>
        <p style={styles.itemName}>{specialty} Referral</p>
      </div>

      {/* Fields */}
      <div style={styles.fieldsGrid}>
        {/* Reason */}
        <div style={styles.fullWidth}>
          <FieldRow label="Reason" required>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason for referral..."
              size="sm"
              data-testid="field-reason"
            />
          </FieldRow>
        </div>

        {/* Urgency */}
        <div style={styles.fullWidth}>
          <FieldRow label="Urgency" required>
            <ChipSelect
              value={urgency}
              options={URGENCY_OPTIONS}
              onSelect={setUrgency}
            />
          </FieldRow>
        </div>

        {/* Refer To Provider */}
        <div style={styles.fullWidth}>
          <FieldRow label="Refer To Provider">
            <Input
              value={referToProvider}
              onChange={e => setReferToProvider(e.target.value)}
              placeholder="Provider name..."
              size="sm"
              data-testid="field-refer-provider"
            />
          </FieldRow>
        </div>

        {/* Refer To Facility */}
        <div style={styles.fullWidth}>
          <FieldRow label="Refer To Facility">
            <Input
              value={referToFacility}
              onChange={e => setReferToFacility(e.target.value)}
              placeholder="Facility name..."
              size="sm"
              data-testid="field-refer-facility"
            />
          </FieldRow>
        </div>

        {/* Requires Auth */}
        <FieldRow label="Prior Authorization Required">
          <ToggleSwitch
            checked={requiresAuth}
            onChange={setRequiresAuth}
          />
        </FieldRow>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onCancel} type="button" data-testid="item-form-cancel">
          {mode === 'edit' ? 'Discard' : 'Cancel'}
        </Button>
        <Button variant="primary" size="sm" type="submit" data-testid="add-item-btn">
          {mode === 'edit' ? 'Save Changes' : 'Add Referral'}
        </Button>
      </div>
    </form>
  );
};

ReferralDetailForm.displayName = 'ReferralDetailForm';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: spaceBetween.repeating,
    paddingBottom: spaceAround.compact,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  },
  itemName: {
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    fontFamily: typography.fontFamily.sans,
    margin: 0,
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: spaceBetween.relatedCompact,
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spaceBetween.repeating,
    paddingTop: spaceAround.compact,
  },
};
