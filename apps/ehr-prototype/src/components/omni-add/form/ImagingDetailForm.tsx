/**
 * ImagingDetailForm — Imaging Order Detail Form
 *
 * Category-specific form for imaging orders. Pre-populates study type, body part,
 * and indication from quick-pick data. Allows priority, facility, and auth configuration.
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

export interface ImagingDetailFormProps {
  initialData: Partial<ChartItem>;
  onSubmit: (item: Partial<ChartItem>) => void;
  onCancel: () => void;
  /** 'create' for OmniAdd flow, 'edit' for DetailsPane editing */
  mode?: 'create' | 'edit';
}

// ============================================================================
// Option sets
// ============================================================================

const PRIORITY_OPTIONS: ChipOption[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'stat', label: 'STAT' },
];

// ============================================================================
// Component
// ============================================================================

export const ImagingDetailForm: React.FC<ImagingDetailFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
}) => {
  const data = (initialData as Record<string, unknown>) || {};

  // ── Form state from quick-pick smart defaults ──
  const [priority, setPriority] = React.useState<string>(String(data.priority || 'routine'));
  const [indication, setIndication] = React.useState<string>(String(data.indication || ''));
  const [facility, setFacility] = React.useState<string>(String(data.facility || ''));
  const [requiresAuth, setRequiresAuth] = React.useState<boolean>(Boolean(data.requiresAuth));
  const [instructions, setInstructions] = React.useState<string>('');

  const studyType = String(data.studyType || '');
  const bodyPart = String(data.bodyPart || data.displayText || '');

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      priority,
      indication: indication || undefined,
      facility: facility ? { id: `fac-${Date.now()}`, name: facility } : undefined,
      requiresAuth,
      specialInstructions: instructions || undefined,
    } as unknown as Partial<ChartItem>);
  };

  return (
    <form style={styles.container} onSubmit={handleSubmit} data-testid="imaging-detail-form">
      {/* Header */}
      <div style={styles.header}>
        <p style={styles.itemName}>{studyType} — {bodyPart}</p>
      </div>

      {/* Fields */}
      <div style={styles.fieldsGrid}>
        {/* Priority */}
        <div style={styles.fullWidth}>
          <FieldRow label="Priority" required>
            <ChipSelect
              value={priority}
              options={PRIORITY_OPTIONS}
              onSelect={setPriority}
            />
          </FieldRow>
        </div>

        {/* Indication */}
        <div style={styles.fullWidth}>
          <FieldRow label="Clinical Indication" required>
            <Input
              value={indication}
              onChange={e => setIndication(e.target.value)}
              placeholder="Reason for study..."
              size="sm"
              data-testid="field-indication"
            />
          </FieldRow>
        </div>

        {/* Facility */}
        <div style={styles.fullWidth}>
          <FieldRow label="Facility" hint="Leave blank for in-house">
            <Input
              value={facility}
              onChange={e => setFacility(e.target.value)}
              placeholder="In-House"
              size="sm"
              data-testid="field-facility"
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

        {/* Special Instructions */}
        <div style={styles.fullWidth}>
          <FieldRow label="Special Instructions">
            <Input
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Optional instructions..."
              size="sm"
              data-testid="field-instructions"
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
          {mode === 'edit' ? 'Save Changes' : 'Add Imaging'}
        </Button>
      </div>
    </form>
  );
};

ImagingDetailForm.displayName = 'ImagingDetailForm';

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
