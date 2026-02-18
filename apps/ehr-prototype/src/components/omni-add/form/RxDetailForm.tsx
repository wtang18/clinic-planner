/**
 * RxDetailForm — Medication Detail Form
 *
 * Category-specific form for prescriptions. Pre-populates all fields from
 * quick-pick data, auto-generates sig and quantity, and lets the provider
 * override any field before adding.
 */

import React from 'react';
import type { ChartItem } from '../../../types/chart-items';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../../styles/foundations';
import { Button } from '../../primitives/Button';
import { Input } from '../../primitives/Input';
import { ChipSelect } from './ChipSelect';
import type { ChipOption } from './ChipSelect';
import { FieldRow } from './FieldRow';
import { ToggleSwitch } from './ToggleSwitch';
import { generateSig, calculateQuantity } from './rx-helpers';

// ============================================================================
// Types
// ============================================================================

export interface RxDetailFormProps {
  initialData: Partial<ChartItem>;
  onSubmit: (item: Partial<ChartItem>) => void;
  onCancel: () => void;
  /** 'create' for OmniAdd flow, 'edit' for DetailsPane editing */
  mode?: 'create' | 'edit';
}

// ============================================================================
// Option sets
// ============================================================================

const ROUTE_OPTIONS: ChipOption[] = [
  { value: 'PO', label: 'PO' },
  { value: 'IM', label: 'IM' },
  { value: 'IV', label: 'IV' },
  { value: 'SC', label: 'SC' },
  { value: 'topical', label: 'Topical' },
  { value: 'Inhalation', label: 'Inhaled' },
  { value: 'intranasal', label: 'Nasal' },
  { value: 'rectal', label: 'Rectal' },
];

const FREQUENCY_OPTIONS: ChipOption[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'BID', label: 'BID' },
  { value: 'TID', label: 'TID' },
  { value: 'QID', label: 'QID' },
  { value: 'Q4-6H PRN', label: 'Q4-6H PRN' },
  { value: 'TID PRN', label: 'TID PRN' },
  { value: 'QHS', label: 'QHS' },
  { value: 'PRN', label: 'PRN' },
];

const DURATION_OPTIONS: ChipOption[] = [
  { value: '5 days', label: '5 days' },
  { value: '7 days', label: '7 days' },
  { value: '10 days', label: '10 days' },
  { value: '14 days', label: '14 days' },
  { value: '30 days', label: '30 days' },
  { value: '90 days', label: '90 days' },
];

// ============================================================================
// Component
// ============================================================================

export const RxDetailForm: React.FC<RxDetailFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
}) => {
  const data = (initialData as Record<string, unknown>) || {};

  // ── Form state initialized from quick-pick smart defaults ──
  const [dosage, setDosage] = React.useState<string>(String(data.dosage || ''));
  const [route, setRoute] = React.useState<string>(String(data.route || 'PO'));
  const [frequency, setFrequency] = React.useState<string>(String(data.frequency || 'daily'));
  const [duration, setDuration] = React.useState<string>(String(data.duration || '7 days'));
  const [sig, setSig] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState<number>(Number(data.quantity) || 0);
  const [quantityOverride, setQuantityOverride] = React.useState(false);
  const [sigOverride, setSigOverride] = React.useState(false);
  const [refills, setRefills] = React.useState<number>(Number(data.refills) || 0);
  const [daw, setDaw] = React.useState<boolean>(false);

  const drugName = String(data.drugName || data.displayText || '');

  // ── Auto-calculate sig when inputs change (unless manually overridden) ──
  React.useEffect(() => {
    if (!sigOverride) {
      setSig(generateSig(dosage, route, frequency));
    }
  }, [dosage, route, frequency, sigOverride]);

  // ── Auto-calculate quantity when inputs change (unless manually overridden) ──
  React.useEffect(() => {
    if (!quantityOverride) {
      const calc = calculateQuantity(frequency, duration);
      if (calc !== null) setQuantity(calc);
    }
  }, [frequency, duration, quantityOverride]);

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fields are spread at top level to match OmniAddBar's buildChartItem pattern;
    // useCaptureView.handleItemAdd picks them up and maps into category-specific data.
    onSubmit({
      ...initialData,
      dosage,
      route,
      frequency,
      duration,
      sig,
      quantity,
      refills,
      daw,
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

  const drugNameStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    fontFamily: typography.fontFamily.sans,
    margin: 0,
  };

  const dosageTagStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    backgroundColor: colors.bg.accent.subtle,
    padding: `2px ${spaceAround.nudge6}px`,
    borderRadius: borderRadius.xs,
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

  const autoHintStyle: React.CSSProperties = {
    fontSize: 11,
    color: colors.fg.neutral.spotReadable,
    fontStyle: 'italic',
  };

  const numberInputRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  };

  const stepperBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    fontSize: 16,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
    backgroundColor: colors.bg.neutral.subtle,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.xs,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
  };

  return (
    <form style={containerStyle} onSubmit={handleSubmit} data-testid="rx-detail-form">
      {/* Header: Drug name */}
      <div style={headerStyle}>
        <p style={drugNameStyle}>{drugName}</p>
        {dosage && <span style={dosageTagStyle}>{dosage}</span>}
      </div>

      {/* Fields */}
      <div style={fieldsGridStyle}>
        {/* Dosage */}
        <FieldRow label="Dosage" required>
          <Input
            value={dosage}
            onChange={e => setDosage(e.target.value)}
            placeholder="e.g. 100mg"
            size="sm"
            data-testid="field-dosage"
          />
        </FieldRow>

        {/* Route */}
        <FieldRow label="Route" required>
          <ChipSelect
            value={route}
            options={ROUTE_OPTIONS}
            onSelect={setRoute}
          />
        </FieldRow>

        {/* Frequency */}
        <div style={fullWidthStyle}>
          <FieldRow label="Frequency" required>
            <ChipSelect
              value={frequency}
              options={FREQUENCY_OPTIONS}
              onSelect={setFrequency}
              allowCustom
              customPlaceholder="e.g. Q12H"
            />
          </FieldRow>
        </div>

        {/* Duration */}
        <div style={fullWidthStyle}>
          <FieldRow label="Duration">
            <ChipSelect
              value={duration}
              options={DURATION_OPTIONS}
              onSelect={setDuration}
              allowCustom
              customPlaceholder="e.g. 21 days"
            />
          </FieldRow>
        </div>

        {/* Sig (auto-generated, editable) */}
        <div style={fullWidthStyle}>
          <FieldRow
            label="Sig (Instructions)"
            hint={sigOverride ? undefined : 'Auto-generated from dosage, route, and frequency'}
          >
            <Input
              value={sig}
              onChange={e => {
                setSigOverride(true);
                setSig(e.target.value);
              }}
              placeholder="Instructions..."
              size="sm"
              data-testid="field-sig"
            />
            {!sigOverride && sig && (
              <span style={autoHintStyle}>auto</span>
            )}
          </FieldRow>
        </div>

        {/* Quantity (auto-calculated, editable) */}
        <FieldRow
          label="Quantity"
          hint={quantityOverride ? undefined : 'Auto-calculated from frequency and duration'}
        >
          <div style={numberInputRowStyle}>
            <Input
              type="number"
              value={String(quantity)}
              onChange={e => {
                setQuantityOverride(true);
                setQuantity(Number(e.target.value));
              }}
              size="sm"
              style={{ width: 80 }}
              data-testid="field-quantity"
            />
            {!quantityOverride && (
              <span style={autoHintStyle}>auto</span>
            )}
          </div>
        </FieldRow>

        {/* Refills (stepper) */}
        <FieldRow label="Refills">
          <div style={numberInputRowStyle}>
            <button
              type="button"
              style={stepperBtnStyle}
              onClick={() => setRefills(Math.max(0, refills - 1))}
              disabled={refills <= 0}
              data-testid="refills-minus"
            >
              &minus;
            </button>
            <span style={{
              fontSize: 14,
              fontWeight: typography.fontWeight.medium,
              color: colors.fg.neutral.primary,
              minWidth: 20,
              textAlign: 'center',
            }}>
              {refills}
            </span>
            <button
              type="button"
              style={stepperBtnStyle}
              onClick={() => setRefills(Math.min(12, refills + 1))}
              disabled={refills >= 12}
              data-testid="refills-plus"
            >
              +
            </button>
          </div>
        </FieldRow>

        {/* DAW toggle */}
        <FieldRow label="Dispense As Written" hint="Brand name only — no generic substitution">
          <ToggleSwitch
            checked={daw}
            onChange={setDaw}
          />
        </FieldRow>
      </div>

      {/* Actions */}
      <div style={actionsStyle}>
        <Button variant="ghost" size="sm" onClick={onCancel} type="button" data-testid="item-form-cancel">
          {mode === 'edit' ? 'Discard' : 'Cancel'}
        </Button>
        <Button variant="primary" size="sm" type="submit" data-testid="add-item-btn">
          {mode === 'edit' ? 'Save Changes' : 'Add Rx'}
        </Button>
      </div>
    </form>
  );
};

RxDetailForm.displayName = 'RxDetailForm';
