/**
 * VitalsInput Component
 *
 * Structured data entry grid for vitals via OmniAdd.
 * Matches VitalsSection field set (3x3 grid):
 * - Row 1: Systolic / Diastolic / Pulse
 * - Row 2: Resp Rate / O2 Sat / Oxy On (dropdown)
 * - Row 3: Temperature / Height / Weight
 * - Imperial/metric toggle
 *
 * Uses the shared Input primitive with suffix prop for inline units.
 */

import React, { useState, useCallback } from 'react';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../styles/foundations';
import { Button } from '../primitives/Button';
import { Input } from '../primitives/Input';
import { SegmentedControl, type Segment } from '../primitives/SegmentedControl';
import type { UnitSystem } from '../../types/vitals';
import type { OxygenDelivery } from '../../types/chart-items';
import {
  fToC,
  cToF,
  lbsToKg,
  kgToLbs,
} from '../../utils/vitals-conversion';

export interface VitalsData {
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  temperatureUnit?: string;
  respiratoryRate?: number;
  spO2?: number;
  weight?: number;
  weightUnit?: string;
  height?: number;
  heightUnit?: string;
  oxyOn?: OxygenDelivery;
}

export interface VitalsInputProps {
  onSubmit: (data: VitalsData) => void;
  onCancel: () => void;
  initialData?: VitalsData;
}

interface VitalFieldDef {
  key: keyof VitalsData;
  label: string;
  imperialUnit: string;
  metricUnit?: string;
  min: number;
  max: number;
  step: number;
}

// Row 1: BP + Pulse
const ROW1_FIELDS: VitalFieldDef[] = [
  { key: 'systolicBP', label: 'Systolic', imperialUnit: 'mmHg', min: 50, max: 300, step: 1 },
  { key: 'diastolicBP', label: 'Diastolic', imperialUnit: 'mmHg', min: 30, max: 200, step: 1 },
  { key: 'heartRate', label: 'Pulse', imperialUnit: 'bpm', min: 20, max: 250, step: 1 },
];

// Row 2: Resp + SpO2 (oxyOn is a dropdown, handled separately)
const ROW2_FIELDS: VitalFieldDef[] = [
  { key: 'respiratoryRate', label: 'Resp. Rate', imperialUnit: '/min', min: 4, max: 60, step: 1 },
  { key: 'spO2', label: 'O\u2082 Sat', imperialUnit: '%', min: 50, max: 100, step: 1 },
];

// Row 3: Temp + Height + Weight
const ROW3_FIELDS: VitalFieldDef[] = [
  { key: 'temperature', label: 'Temperature', imperialUnit: '\u00B0F', metricUnit: '\u00B0C', min: 90, max: 110, step: 0.1 },
  { key: 'height', label: 'Height', imperialUnit: 'in', metricUnit: 'cm', min: 10, max: 300, step: 0.5 },
  { key: 'weight', label: 'Weight', imperialUnit: 'lbs', metricUnit: 'kg', min: 1, max: 1000, step: 0.1 },
];

const OXY_OPTIONS: { value: OxygenDelivery; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'nasal-cannula', label: 'Nasal Cannula' },
  { value: 'face-mask', label: 'Face Mask' },
  { value: 'non-rebreather', label: 'Non-Rebreather' },
  { value: 'ventilator', label: 'Ventilator' },
];

const unitSegments: Segment<UnitSystem>[] = [
  { key: 'imperial', label: 'Imperial' },
  { key: 'metric', label: 'Metric' },
];

function getUnit(field: VitalFieldDef, unitSystem: UnitSystem): string {
  if (unitSystem === 'metric' && field.metricUnit) return field.metricUnit;
  return field.imperialUnit;
}

export const VitalsInput: React.FC<VitalsInputProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
}) => {
  const [data, setData] = useState<VitalsData>({ oxyOn: 'none', ...initialData });
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');

  const handleNumericChange = (key: keyof VitalsData, rawValue: string) => {
    const value = rawValue === '' ? undefined : Number(rawValue);
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleUnitToggle = useCallback((newSystem: UnitSystem) => {
    if (newSystem === unitSystem) return;

    setData(prev => {
      const next = { ...prev };

      if (next.temperature !== undefined) {
        next.temperature = newSystem === 'metric' ? fToC(next.temperature) : cToF(next.temperature);
      }
      if (next.weight !== undefined) {
        next.weight = newSystem === 'metric' ? lbsToKg(next.weight) : kgToLbs(next.weight);
      }
      if (next.height !== undefined) {
        next.height = newSystem === 'metric'
          ? Math.round(next.height * 2.54 * 10) / 10
          : Math.round(next.height / 2.54 * 10) / 10;
      }

      return next;
    });

    setUnitSystem(newSystem);
  }, [unitSystem]);

  const handleSubmit = () => {
    const allFields = [...ROW1_FIELDS, ...ROW2_FIELDS, ...ROW3_FIELDS];
    const hasData = allFields.some(f => data[f.key] !== undefined);
    if (hasData) {
      onSubmit({
        ...data,
        temperatureUnit: unitSystem === 'metric' ? '\u00B0C' : '\u00B0F',
        weightUnit: unitSystem === 'metric' ? 'kg' : 'lbs',
        heightUnit: unitSystem === 'metric' ? 'cm' : 'in',
      });
    }
  };

  const allFields = [...ROW1_FIELDS, ...ROW2_FIELDS, ...ROW3_FIELDS];
  const hasData = allFields.some(f => data[f.key] !== undefined);

  const renderField = (field: VitalFieldDef) => (
    <div key={field.key} style={styles.formGroup}>
      <label style={styles.fieldLabel}>{field.label}</label>
      <Input
        type="number"
        size="sm"
        value={data[field.key] ?? ''}
        onChange={(e) => handleNumericChange(field.key, e.target.value)}
        min={field.min}
        max={field.max}
        step={field.step}
        suffix={getUnit(field, unitSystem)}
        placeholder={'\u2014'}
        data-testid={`vital-${field.key}`}
      />
    </div>
  );

  return (
    <div style={styles.container} data-testid="vitals-input">
      {/* Row 1: Systolic / Diastolic / Pulse */}
      <div style={styles.grid}>
        {ROW1_FIELDS.map(renderField)}
      </div>

      {/* Row 2: Resp Rate / O2 Sat / Oxy On */}
      <div style={styles.grid}>
        {ROW2_FIELDS.map(renderField)}
        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>Oxy On</label>
          <select
            style={styles.selectInput}
            value={data.oxyOn || 'none'}
            onChange={(e) => setData(prev => ({ ...prev, oxyOn: e.target.value as OxygenDelivery }))}
            data-testid="vital-oxyOn"
          >
            {OXY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Temperature / Height / Weight */}
      <div style={styles.grid}>
        {ROW3_FIELDS.map(renderField)}
      </div>

      {/* Unit toggle + Actions */}
      <div style={styles.footer}>
        <SegmentedControl<UnitSystem>
          segments={unitSegments}
          value={unitSystem}
          onChange={handleUnitToggle}
          variant="inline"
          size="sm"
        />
        <div style={styles.actions}>
          <Button variant="ghost" size="sm" onClick={onCancel} data-testid="vitals-cancel">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!hasData}
            data-testid="vitals-submit"
          >
            Add Vitals
          </Button>
        </div>
      </div>
    </div>
  );
};

VitalsInput.displayName = 'VitalsInput';

// ============================================================================
// Styles — reuses PlaceholderSections patterns via foundation tokens
// ============================================================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spaceBetween.related,
  } as React.CSSProperties,

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  } as React.CSSProperties,

  fieldLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  } as React.CSSProperties,

  selectInput: {
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    border: `1px solid ${colors.border.neutral.medium}`,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.bg.neutral.base,
    color: colors.fg.neutral.primary,
    width: '100%',
    boxSizing: 'border-box',
    height: '32px',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 32,
  } as React.CSSProperties,

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spaceAround.tight,
  } as React.CSSProperties,

  actions: {
    display: 'flex',
    gap: spaceBetween.repeating,
  } as React.CSSProperties,
};
