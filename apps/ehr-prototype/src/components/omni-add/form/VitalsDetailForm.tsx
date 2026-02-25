/**
 * VitalsDetailForm — Vitals Detail Form for DetailsPane
 *
 * Category-specific form for editing existing vitals ChartItems.
 * Layout matches VitalsInput (9 fields in 3x3 grid + imperial/metric toggle).
 * Pre-populates from VitalsItem.data.measurements + oxygenDelivery.
 *
 * Uses the shared Input primitive with suffix prop for inline units.
 */

import React, { useState, useCallback } from 'react';
import type { ChartItem, VitalMeasurement, VitalType, OxygenDelivery } from '../../../types/chart-items';
import type { UnitSystem } from '../../../types/vitals';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../../styles/foundations';
import { Button } from '../../primitives/Button';
import { Input } from '../../primitives/Input';
import { SegmentedControl, type Segment } from '../../primitives/SegmentedControl';
import {
  fToC,
  cToF,
  lbsToKg,
  kgToLbs,
} from '../../../utils/vitals-conversion';

// ============================================================================
// Types
// ============================================================================

export interface VitalsDetailFormProps {
  initialData: Partial<ChartItem>;
  onSubmit: (item: Partial<ChartItem>) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

interface FormState {
  systolic: string;
  diastolic: string;
  pulse: string;
  respRate: string;
  spo2: string;
  oxyOn: OxygenDelivery;
  temp: string;
  height: string;
  weight: string;
}

// ============================================================================
// Constants
// ============================================================================

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

// ============================================================================
// Helpers
// ============================================================================

function getMeasurementValue(measurements: VitalMeasurement[], type: VitalType): string {
  const m = measurements.find(x => x.type === type);
  return m ? String(m.value) : '';
}

function getMeasurementUnit(measurements: VitalMeasurement[], type: VitalType): string {
  const m = measurements.find(x => x.type === type);
  return m?.unit || '';
}

function detectUnitSystem(measurements: VitalMeasurement[]): UnitSystem {
  const tempUnit = getMeasurementUnit(measurements, 'temp');
  if (tempUnit === '\u00B0C') return 'metric';
  const weightUnit = getMeasurementUnit(measurements, 'weight');
  if (weightUnit === 'kg') return 'metric';
  return 'imperial';
}

// ============================================================================
// Component
// ============================================================================

export const VitalsDetailForm: React.FC<VitalsDetailFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'edit',
}) => {
  const data = (initialData as any)?.data || {};
  const measurements: VitalMeasurement[] = data.measurements || [];

  const initialUnitSystem = detectUnitSystem(measurements);

  const [form, setForm] = useState<FormState>({
    systolic: getMeasurementValue(measurements, 'bp-systolic'),
    diastolic: getMeasurementValue(measurements, 'bp-diastolic'),
    pulse: getMeasurementValue(measurements, 'pulse'),
    respRate: getMeasurementValue(measurements, 'resp'),
    spo2: getMeasurementValue(measurements, 'spo2'),
    oxyOn: (data.oxygenDelivery as OxygenDelivery) || 'none',
    temp: getMeasurementValue(measurements, 'temp'),
    height: getMeasurementValue(measurements, 'height'),
    weight: getMeasurementValue(measurements, 'weight'),
  });
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialUnitSystem);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleUnitToggle = useCallback((newSystem: UnitSystem) => {
    if (newSystem === unitSystem) return;

    setForm(prev => {
      const next = { ...prev };

      const tempVal = parseFloat(prev.temp);
      if (!isNaN(tempVal)) {
        next.temp = String(newSystem === 'metric' ? fToC(tempVal) : cToF(tempVal));
      }

      const weightVal = parseFloat(prev.weight);
      if (!isNaN(weightVal)) {
        next.weight = String(newSystem === 'metric' ? lbsToKg(weightVal) : kgToLbs(weightVal));
      }

      const heightVal = parseFloat(prev.height);
      if (!isNaN(heightVal)) {
        next.height = newSystem === 'metric'
          ? String(Math.round(heightVal * 2.54 * 10) / 10)
          : String(Math.round(heightVal / 2.54 * 10) / 10);
      }

      return next;
    });

    setUnitSystem(newSystem);
  }, [unitSystem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fieldMap: { key: keyof FormState; type: VitalType; imperialUnit: string; metricUnit?: string }[] = [
      { key: 'systolic', type: 'bp-systolic', imperialUnit: 'mmHg' },
      { key: 'diastolic', type: 'bp-diastolic', imperialUnit: 'mmHg' },
      { key: 'pulse', type: 'pulse', imperialUnit: 'bpm' },
      { key: 'respRate', type: 'resp', imperialUnit: '/min' },
      { key: 'spo2', type: 'spo2', imperialUnit: '%' },
      { key: 'temp', type: 'temp', imperialUnit: '\u00B0F', metricUnit: '\u00B0C' },
      { key: 'height', type: 'height', imperialUnit: 'in', metricUnit: 'cm' },
      { key: 'weight', type: 'weight', imperialUnit: 'lbs', metricUnit: 'kg' },
    ];

    const newMeasurements: VitalMeasurement[] = [];
    for (const { key, type, imperialUnit, metricUnit } of fieldMap) {
      const val = parseFloat(form[key]);
      if (!isNaN(val)) {
        const unit = (unitSystem === 'metric' && metricUnit) ? metricUnit : imperialUnit;
        const existing = measurements.find(m => m.type === type);
        newMeasurements.push({ type, value: val, unit, flag: existing?.flag });
      }
    }

    // Build display text
    const parts: string[] = [];
    const sys = parseFloat(form.systolic);
    const dia = parseFloat(form.diastolic);
    if (!isNaN(sys) && !isNaN(dia)) parts.push(`BP ${sys}/${dia}`);
    const hr = parseFloat(form.pulse);
    if (!isNaN(hr)) parts.push(`HR ${hr}`);
    const temp = parseFloat(form.temp);
    if (!isNaN(temp)) parts.push(`Temp ${temp}${unitSystem === 'metric' ? '\u00B0C' : '\u00B0F'}`);
    const spo2 = parseFloat(form.spo2);
    if (!isNaN(spo2)) parts.push(`SpO\u2082 ${spo2}%`);
    const rr = parseFloat(form.respRate);
    if (!isNaN(rr)) parts.push(`RR ${rr}`);

    onSubmit({
      ...initialData,
      displayText: parts.join(' \u00B7 ') || 'Vitals',
      data: {
        ...data,
        measurements: newMeasurements,
        oxygenDelivery: form.oxyOn !== 'none' ? form.oxyOn : undefined,
      },
    } as unknown as Partial<ChartItem>);
  };

  const capturedAt = data.capturedAt instanceof Date
    ? data.capturedAt
    : data.capturedAt ? new Date(data.capturedAt) : null;

  return (
    <form style={styles.container} onSubmit={handleSubmit} data-testid="vitals-detail-form">
      {/* Header */}
      <div style={styles.header}>
        <p style={styles.itemName}>Vitals</p>
        {capturedAt && (
          <span style={styles.timestamp}>
            {capturedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Row 1: BP + Pulse */}
      <div style={styles.grid}>
        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>Systolic</label>
          <Input type="number" size="sm" value={form.systolic} onChange={e => handleChange('systolic', e.target.value)} suffix="mmHg" placeholder={'\u2014'} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>Diastolic</label>
          <Input type="number" size="sm" value={form.diastolic} onChange={e => handleChange('diastolic', e.target.value)} suffix="mmHg" placeholder={'\u2014'} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>Pulse</label>
          <Input type="number" size="sm" value={form.pulse} onChange={e => handleChange('pulse', e.target.value)} suffix="bpm" placeholder={'\u2014'} />
        </div>
      </div>

      {/* Row 2: Resp Rate + O2 Sat + Oxy On */}
      <div style={styles.grid}>
        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>Resp. Rate</label>
          <Input type="number" size="sm" value={form.respRate} onChange={e => handleChange('respRate', e.target.value)} suffix="/min" placeholder={'\u2014'} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>O{'\u2082'} Sat</label>
          <Input type="number" size="sm" value={form.spo2} onChange={e => handleChange('spo2', e.target.value)} suffix="%" placeholder={'\u2014'} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>Oxy On</label>
          <select
            style={styles.selectInput}
            value={form.oxyOn}
            onChange={(e) => handleChange('oxyOn', e.target.value)}
          >
            {OXY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Temperature + Height + Weight */}
      <div style={styles.grid}>
        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>Temperature</label>
          <Input type="number" size="sm" value={form.temp} onChange={e => handleChange('temp', e.target.value)} suffix={unitSystem === 'imperial' ? '\u00B0F' : '\u00B0C'} placeholder={'\u2014'} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>Height</label>
          <Input type="number" size="sm" value={form.height} onChange={e => handleChange('height', e.target.value)} suffix={unitSystem === 'imperial' ? 'in' : 'cm'} placeholder={'\u2014'} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>Weight</label>
          <Input type="number" size="sm" value={form.weight} onChange={e => handleChange('weight', e.target.value)} suffix={unitSystem === 'imperial' ? 'lbs' : 'kg'} placeholder={'\u2014'} />
        </div>
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
          <Button variant="ghost" size="sm" onClick={onCancel} type="button">
            {mode === 'edit' ? 'Discard' : 'Cancel'}
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {mode === 'edit' ? 'Save Changes' : 'Add Vitals'}
          </Button>
        </div>
      </div>
    </form>
  );
};

VitalsDetailForm.displayName = 'VitalsDetailForm';

// ============================================================================
// Styles — matches PlaceholderSections patterns
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
    justifyContent: 'space-between',
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
  timestamp: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
    fontFamily: typography.fontFamily.sans,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: spaceBetween.related,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
  },
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
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spaceAround.compact,
  },
  actions: {
    display: 'flex',
    gap: spaceBetween.repeating,
  },
};
