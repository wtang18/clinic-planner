/**
 * DxDetailForm — Diagnosis Detail Form
 *
 * Category-specific form for diagnoses. Displays ICD-10 code prominently,
 * lets the provider set designation, onset, and clinical status.
 */

import React from 'react';
import type { ChartItem } from '../../../types/chart-items';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../../styles/foundations';
import { Button } from '../../primitives/Button';
import { ChipSelect } from './ChipSelect';
import type { ChipOption } from './ChipSelect';
import { FieldRow } from './FieldRow';

// ============================================================================
// Types
// ============================================================================

export interface DxDetailFormProps {
  initialData: Partial<ChartItem>;
  onSubmit: (item: Partial<ChartItem>) => void;
  onCancel: () => void;
  /** 'create' for OmniAdd flow, 'edit' for DetailsPane editing */
  mode?: 'create' | 'edit';
}

// ============================================================================
// Option sets
// ============================================================================

const DESIGNATION_OPTIONS: ChipOption[] = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
];

const ONSET_OPTIONS: ChipOption[] = [
  { value: 'new', label: 'New' },
  { value: 'existing', label: 'Existing' },
];

const CLINICAL_STATUS_OPTIONS: ChipOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'inactive', label: 'Inactive' },
];

const TYPE_OPTIONS: ChipOption[] = [
  { value: 'encounter', label: 'Encounter' },
  { value: 'chronic', label: 'Chronic' },
  { value: 'historical', label: 'Historical' },
];

// ============================================================================
// Component
// ============================================================================

export const DxDetailForm: React.FC<DxDetailFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
}) => {
  const data = (initialData as Record<string, unknown>) || {};

  // ── Form state from smart defaults ──
  const [ranking, setRanking] = React.useState<string>(String(data.ranking || 'primary'));
  const [onset, setOnset] = React.useState<string>('new');
  const [clinicalStatus, setClinicalStatus] = React.useState<string>(String(data.clinicalStatus || 'active'));
  const [type, setType] = React.useState<string>(String(data.type || 'encounter'));

  const description = String(data.description || data.displayText || '');
  const icdCode = String(data.icdCode || '');

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      ranking,
      clinicalStatus,
      type,
      onsetDate: onset === 'new' ? new Date() : undefined,
    } as unknown as Partial<ChartItem>);
  };

  // ── Styles ──
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: spaceBetween.repeating,
    paddingBottom: spaceAround.compact,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    fontFamily: typography.fontFamily.sans,
    margin: 0,
  };

  const icdBadgeStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.information.spotReadable,
    backgroundColor: colors.bg.information.subtle,
    padding: `2px ${spaceAround.tight}px`,
    borderRadius: borderRadius.xs,
    fontFamily: typography.fontFamily.mono,
  };

  const fieldsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: spaceBetween.relatedCompact,
  };

  const fullWidthStyle: React.CSSProperties = {
    gridColumn: '1 / -1',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spaceBetween.repeating,
    paddingTop: spaceAround.compact,
  };

  return (
    <form style={containerStyle} onSubmit={handleSubmit} data-testid="dx-detail-form">
      {/* Header: Diagnosis + ICD code */}
      <div style={headerStyle}>
        <p style={descriptionStyle}>{description}</p>
        {icdCode && <span style={icdBadgeStyle}>{icdCode}</span>}
      </div>

      {/* Fields */}
      <div style={fieldsGridStyle}>
        {/* Designation */}
        <div style={fullWidthStyle}>
          <FieldRow label="Designation" required>
            <ChipSelect
              value={ranking}
              options={DESIGNATION_OPTIONS}
              onSelect={setRanking}
            />
          </FieldRow>
        </div>

        {/* Type */}
        <div style={fullWidthStyle}>
          <FieldRow label="Type">
            <ChipSelect
              value={type}
              options={TYPE_OPTIONS}
              onSelect={setType}
            />
          </FieldRow>
        </div>

        {/* Onset */}
        <div style={fullWidthStyle}>
          <FieldRow label="Onset" hint={onset === 'new' ? 'Onset date set to today' : 'Pre-existing condition'}>
            <ChipSelect
              value={onset}
              options={ONSET_OPTIONS}
              onSelect={setOnset}
            />
          </FieldRow>
        </div>

        {/* Clinical Status */}
        <div style={fullWidthStyle}>
          <FieldRow label="Clinical Status" required>
            <ChipSelect
              value={clinicalStatus}
              options={CLINICAL_STATUS_OPTIONS}
              onSelect={setClinicalStatus}
            />
          </FieldRow>
        </div>
      </div>

      {/* Actions */}
      <div style={actionsStyle}>
        <Button variant="ghost" size="sm" onClick={onCancel} type="button" data-testid="item-form-cancel">
          {mode === 'edit' ? 'Discard' : 'Cancel'}
        </Button>
        <Button variant="primary" size="sm" type="submit" data-testid="add-item-btn">
          {mode === 'edit' ? 'Save Changes' : 'Add Dx'}
        </Button>
      </div>
    </form>
  );
};

DxDetailForm.displayName = 'DxDetailForm';
