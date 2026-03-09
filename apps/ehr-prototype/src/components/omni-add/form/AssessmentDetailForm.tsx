/**
 * AssessmentDetailForm — Assessment Detail Form
 *
 * Category-specific form for scored clinical measures (e.g., pain scale, PHQ-9, ROM).
 * Shows: assessment type (read-only), score input with scale, method selection,
 * optional body region and notes.
 */

import React from 'react';
import type { ChartItem, AssessmentItem } from '../../../types/chart-items';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../../styles/foundations';
import { Button } from '../../primitives/Button';
import { Input } from '../../primitives/Input';
import { ChipSelect } from './ChipSelect';
import type { ChipOption } from './ChipSelect';
import { FieldRow } from './FieldRow';

// ============================================================================
// Types
// ============================================================================

export interface AssessmentDetailFormProps {
  initialData: Partial<ChartItem>;
  onSubmit: (item: Partial<ChartItem>) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

// ============================================================================
// Options
// ============================================================================

const METHOD_OPTIONS: ChipOption[] = [
  { value: 'patient-reported', label: 'Patient Reported' },
  { value: 'provider-assessed', label: 'Provider Assessed' },
  { value: 'calculated', label: 'Calculated' },
];

// ============================================================================
// Component
// ============================================================================

export const AssessmentDetailForm: React.FC<AssessmentDetailFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
}) => {
  const data = (initialData as AssessmentItem)?.data ?? {} as AssessmentItem['data'];

  const [value, setValue] = React.useState(data.value != null ? String(data.value) : '');
  const [method, setMethod] = React.useState(data.method || 'patient-reported');
  const [bodyRegion, setBodyRegion] = React.useState(data.bodyRegion || '');
  const [notes, setNotes] = React.useState(data.notes || '');

  const scale = data.scale ?? { min: 0, max: 10 };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = value ? Number(value) : null;

    onSubmit({
      ...initialData,
      displayText: data.label || initialData.displayText || 'Assessment',
      displaySubtext: numValue != null
        ? `${numValue}/${scale.max} (${method})`
        : `Pending (${method})`,
      data: {
        ...data,
        value: numValue,
        method: method as AssessmentItem['data']['method'],
        bodyRegion: bodyRegion || undefined,
        notes: notes || undefined,
      },
    } as Partial<ChartItem>);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.related }}>
      {/* Assessment type (read-only) */}
      <FieldRow label="Assessment Type">
        <div style={{
          fontSize: 14,
          color: colors.fg.neutral.primary,
          fontWeight: typography.fontWeight.medium,
        }}>
          {data.label || data.assessmentType || 'Assessment'}
        </div>
      </FieldRow>

      {/* Score input */}
      <FieldRow label={`Score (${scale.min}–${scale.max})`} required>
        <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.repeating }}>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="number"
            placeholder={`${scale.min}–${scale.max}`}
            style={{ width: 80 }}
          />
          <span style={{
            fontSize: 12,
            color: colors.fg.neutral.spotReadable,
          }}>
            / {scale.max}
          </span>
        </div>
      </FieldRow>

      {/* Method */}
      <FieldRow label="Method">
        <ChipSelect
          value={method}
          options={METHOD_OPTIONS}
          onSelect={(v) => setMethod(v as AssessmentItem['data']['method'])}
        />
      </FieldRow>

      {/* Body region (if applicable) */}
      {(data.bodyRegion !== undefined || bodyRegion) && (
        <FieldRow label="Body Region">
          <Input
            value={bodyRegion}
            onChange={(e) => setBodyRegion(e.target.value)}
            placeholder="e.g., lumbar spine"
          />
        </FieldRow>
      )}

      {/* Notes */}
      <FieldRow label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
          style={{
            width: '100%',
            minHeight: 60,
            padding: spaceAround.tight,
            fontSize: 13,
            fontFamily: typography.fontFamily.sans,
            color: colors.fg.neutral.primary,
            backgroundColor: colors.bg.neutral.min,
            border: `1px solid ${colors.border.neutral.low}`,
            borderRadius: borderRadius.sm,
            resize: 'vertical',
            outline: 'none',
          }}
        />
      </FieldRow>

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: spaceBetween.repeating,
        marginTop: spaceAround.tight,
      }}>
        <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
          {mode === 'edit' ? 'Discard' : 'Cancel'}
        </Button>
        <Button variant="primary" size="sm" type="submit">
          {mode === 'edit' ? 'Save' : 'Add'}
        </Button>
      </div>
    </form>
  );
};

AssessmentDetailForm.displayName = 'AssessmentDetailForm';
