/**
 * AllergyDetailForm — Allergy Detail Form
 *
 * Category-specific form for allergies. Pre-populates allergen, type, and severity
 * from quick-pick data. Handles NKDA as a special case with pre-filled confirmed status.
 */

import React from 'react';
import type { ChartItem } from '../../../types/chart-items';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../../styles/foundations';
import { Button } from '../../primitives/Button';
import { Input } from '../../primitives/Input';
import { ChipSelect } from './ChipSelect';
import type { ChipOption } from './ChipSelect';
import { FieldRow } from './FieldRow';

// ============================================================================
// Types
// ============================================================================

export interface AllergyDetailFormProps {
  initialData: Partial<ChartItem>;
  onSubmit: (item: Partial<ChartItem>) => void;
  onCancel: () => void;
  /** 'create' for OmniAdd flow, 'edit' for DetailsPane editing */
  mode?: 'create' | 'edit';
}

// ============================================================================
// Option sets
// ============================================================================

const TYPE_OPTIONS: ChipOption[] = [
  { value: 'drug', label: 'Drug' },
  { value: 'food', label: 'Food' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'other', label: 'Other' },
];

const SEVERITY_OPTIONS: ChipOption[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'unknown', label: 'Unknown' },
];

const REPORTED_BY_OPTIONS: ChipOption[] = [
  { value: 'patient', label: 'Patient' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'external-record', label: 'External Record' },
];

const VERIFICATION_OPTIONS: ChipOption[] = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'refuted', label: 'Refuted' },
];

// ============================================================================
// Severity badge color
// ============================================================================

const SEVERITY_COLORS: Record<string, string> = {
  severe: colors.fg.alert.secondary,
  moderate: colors.fg.alert.primary,
  mild: colors.fg.positive.primary,
  unknown: colors.fg.neutral.spotReadable,
};

// ============================================================================
// Component
// ============================================================================

export const AllergyDetailForm: React.FC<AllergyDetailFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
}) => {
  const data = (initialData as Record<string, unknown>) || {};

  // ── Form state from quick-pick smart defaults ──
  const [allergenType, setAllergenType] = React.useState<string>(String(data.allergenType || 'drug'));
  const [reaction, setReaction] = React.useState<string>(String(data.reaction || ''));
  const [severity, setSeverity] = React.useState<string>(String(data.severity || 'unknown'));
  const [reportedBy, setReportedBy] = React.useState<string>(String(data.reportedBy || 'patient'));
  const [verificationStatus, setVerificationStatus] = React.useState<string>(String(data.verificationStatus || 'unverified'));

  const allergen = String(data.allergen || data.displayText || '');
  const severityColor = SEVERITY_COLORS[severity] || SEVERITY_COLORS.unknown;

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      allergenType,
      reaction: reaction || undefined,
      severity,
      reportedBy,
      verificationStatus,
    } as unknown as Partial<ChartItem>);
  };

  return (
    <form style={styles.container} onSubmit={handleSubmit} data-testid="allergy-detail-form">
      {/* Header */}
      <div style={styles.header}>
        <p style={styles.itemName}>{allergen}</p>
        <span style={{
          ...styles.severityBadge,
          color: severityColor,
          borderColor: severityColor,
        }}>
          {severity}
        </span>
      </div>

      {/* Fields */}
      <div style={styles.fieldsGrid}>
        {/* Allergen Type */}
        <div style={styles.fullWidth}>
          <FieldRow label="Allergen Type" required>
            <ChipSelect
              value={allergenType}
              options={TYPE_OPTIONS}
              onSelect={setAllergenType}
            />
          </FieldRow>
        </div>

        {/* Reaction */}
        <div style={styles.fullWidth}>
          <FieldRow label="Reaction" hint="e.g., Rash, Hives, Anaphylaxis, GI upset">
            <Input
              value={reaction}
              onChange={e => setReaction(e.target.value)}
              placeholder="Describe reaction..."
              size="sm"
              data-testid="field-reaction"
            />
          </FieldRow>
        </div>

        {/* Severity */}
        <div style={styles.fullWidth}>
          <FieldRow label="Severity" required>
            <ChipSelect
              value={severity}
              options={SEVERITY_OPTIONS}
              onSelect={setSeverity}
            />
          </FieldRow>
        </div>

        {/* Reported By */}
        <div style={styles.fullWidth}>
          <FieldRow label="Reported By">
            <ChipSelect
              value={reportedBy}
              options={REPORTED_BY_OPTIONS}
              onSelect={setReportedBy}
            />
          </FieldRow>
        </div>

        {/* Verification Status */}
        <div style={styles.fullWidth}>
          <FieldRow label="Verification Status">
            <ChipSelect
              value={verificationStatus}
              options={VERIFICATION_OPTIONS}
              onSelect={setVerificationStatus}
            />
          </FieldRow>
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onCancel} type="button" data-testid="item-form-cancel">
          {mode === 'edit' ? 'Discard' : 'Cancel'}
        </Button>
        <Button variant="primary" size="sm" type="submit" data-testid="add-item-btn">
          {mode === 'edit' ? 'Save Changes' : 'Add Allergy'}
        </Button>
      </div>
    </form>
  );
};

AllergyDetailForm.displayName = 'AllergyDetailForm';

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
  severityBadge: {
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    padding: `1px 6px`,
    borderRadius: borderRadius.sm,
    border: '1px solid',
    textTransform: 'capitalize' as const,
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
