/**
 * ProcedureDetailForm — Procedure Detail Form
 *
 * Category-specific form for procedures. Pre-populates name, CPT code, and
 * indication from quick-pick data. Conditionally shows technique/findings/complications
 * when status is 'completed'.
 */

import React from 'react';
import type { ChartItem } from '../../../types/chart-items';
import { colors, spaceAround, spaceBetween, typography } from '../../../styles/foundations';
import { Button } from '../../primitives/Button';
import { Input } from '../../primitives/Input';
import { ChipSelect } from './ChipSelect';
import type { ChipOption } from './ChipSelect';
import { FieldRow } from './FieldRow';

// ============================================================================
// Types
// ============================================================================

export interface ProcedureDetailFormProps {
  initialData: Partial<ChartItem>;
  onSubmit: (item: Partial<ChartItem>) => void;
  onCancel: () => void;
  /** 'create' for OmniAdd flow, 'edit' for DetailsPane editing */
  mode?: 'create' | 'edit';
}

// ============================================================================
// Option sets
// ============================================================================

const STATUS_OPTIONS: ChipOption[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ============================================================================
// Component
// ============================================================================

export const ProcedureDetailForm: React.FC<ProcedureDetailFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
}) => {
  const data = ((initialData as any)?.data as Record<string, unknown>) || {};

  // ── Form state from quick-pick smart defaults ──
  const [indication, setIndication] = React.useState<string>(String(data.indication || ''));
  const [procedureStatus, setProcedureStatus] = React.useState<string>(String(data.procedureStatus || 'planned'));
  const [technique, setTechnique] = React.useState<string>(String(data.technique || ''));
  const [findings, setFindings] = React.useState<string>(String(data.findings || ''));
  const [complications, setComplications] = React.useState<string>(String(data.complications || ''));

  const procedureName = String(data.procedureName || initialData?.displayText || '');
  const cptCode = data.cptCode ? String(data.cptCode) : undefined;

  const showCompletedFields = procedureStatus === 'completed';

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      data: {
        ...(initialData as any)?.data,
        procedureName,
        cptCode,
        indication: indication || undefined,
        procedureStatus,
        technique: showCompletedFields && technique ? technique : undefined,
        findings: showCompletedFields && findings ? findings : undefined,
        complications: showCompletedFields && complications ? complications : undefined,
      },
    } as unknown as Partial<ChartItem>);
  };

  return (
    <form style={styles.container} onSubmit={handleSubmit} data-testid="procedure-detail-form">
      {/* Header */}
      <div style={styles.header}>
        <p style={styles.itemName}>{procedureName}</p>
        {cptCode && <span style={styles.codeStyle}>CPT: {cptCode}</span>}
      </div>

      {/* Fields */}
      <div style={styles.fieldsGrid}>
        {/* Indication */}
        <div style={styles.fullWidth}>
          <FieldRow label="Indication" required>
            <Input
              value={indication}
              onChange={e => setIndication(e.target.value)}
              placeholder="Reason for procedure..."
              size="sm"
              data-testid="field-indication"
            />
          </FieldRow>
        </div>

        {/* Status */}
        <div style={styles.fullWidth}>
          <FieldRow label="Status" required>
            <ChipSelect
              value={procedureStatus}
              options={STATUS_OPTIONS}
              onSelect={setProcedureStatus}
            />
          </FieldRow>
        </div>

        {/* Completed-only fields */}
        {showCompletedFields && (
          <>
            <div style={styles.fullWidth}>
              <FieldRow label="Technique">
                <Input
                  value={technique}
                  onChange={e => setTechnique(e.target.value)}
                  placeholder="Describe technique used..."
                  size="sm"
                  data-testid="field-technique"
                />
              </FieldRow>
            </div>

            <div style={styles.fullWidth}>
              <FieldRow label="Findings">
                <Input
                  value={findings}
                  onChange={e => setFindings(e.target.value)}
                  placeholder="Procedure findings..."
                  size="sm"
                  data-testid="field-findings"
                />
              </FieldRow>
            </div>

            <div style={styles.fullWidth}>
              <FieldRow label="Complications">
                <Input
                  value={complications}
                  onChange={e => setComplications(e.target.value)}
                  placeholder="None, or describe..."
                  size="sm"
                  data-testid="field-complications"
                />
              </FieldRow>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onCancel} type="button" data-testid="item-form-cancel">
          {mode === 'edit' ? 'Discard' : 'Cancel'}
        </Button>
        <Button variant="primary" size="sm" type="submit" data-testid="add-item-btn">
          {mode === 'edit' ? 'Save Changes' : 'Add Procedure'}
        </Button>
      </div>
    </form>
  );
};

ProcedureDetailForm.displayName = 'ProcedureDetailForm';

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
  codeStyle: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    fontFamily: typography.fontFamily.mono,
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
