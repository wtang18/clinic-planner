/**
 * VitalsInput Component
 *
 * Structured data entry grid for vitals (typically MA-entered during rooming).
 * Fields: BP, HR, Temp, RR, SpO2, Weight, Height, BMI (auto), Pain Scale.
 */

import React from 'react';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { Button } from '../primitives/Button';

export interface VitalsData {
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  spO2?: number;
  weight?: number;
  height?: number;
  painScale?: number;
}

export interface VitalsInputProps {
  onSubmit: (data: VitalsData) => void;
  onCancel: () => void;
  initialData?: VitalsData;
}

interface VitalField {
  key: keyof VitalsData;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  normalMin?: number;
  normalMax?: number;
}

const VITAL_FIELDS: VitalField[] = [
  { key: 'systolicBP', label: 'Systolic', unit: 'mmHg', min: 50, max: 300, step: 1, normalMin: 90, normalMax: 140 },
  { key: 'diastolicBP', label: 'Diastolic', unit: 'mmHg', min: 30, max: 200, step: 1, normalMin: 60, normalMax: 90 },
  { key: 'heartRate', label: 'HR', unit: 'bpm', min: 20, max: 250, step: 1, normalMin: 60, normalMax: 100 },
  { key: 'temperature', label: 'Temp', unit: '\u00B0F', min: 90, max: 110, step: 0.1, normalMin: 97.0, normalMax: 99.5 },
  { key: 'respiratoryRate', label: 'RR', unit: '/min', min: 4, max: 60, step: 1, normalMin: 12, normalMax: 20 },
  { key: 'spO2', label: 'SpO2', unit: '%', min: 50, max: 100, step: 1, normalMin: 95, normalMax: 100 },
  { key: 'weight', label: 'Weight', unit: 'lbs', min: 1, max: 1000, step: 0.1 },
  { key: 'height', label: 'Height', unit: 'in', min: 10, max: 100, step: 0.5 },
  { key: 'painScale', label: 'Pain', unit: '/10', min: 0, max: 10, step: 1 },
];

function computeBMI(weight?: number, height?: number): string | null {
  if (!weight || !height || height === 0) return null;
  // weight in lbs, height in inches → BMI = (weight / height^2) * 703
  const bmi = (weight / (height * height)) * 703;
  return bmi.toFixed(1);
}

function isOutOfRange(field: VitalField, value: number): boolean {
  if (field.normalMin === undefined || field.normalMax === undefined) return false;
  return value < field.normalMin || value > field.normalMax;
}

export const VitalsInput: React.FC<VitalsInputProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
}) => {
  const [data, setData] = React.useState<VitalsData>(initialData);

  const handleChange = (key: keyof VitalsData, rawValue: string) => {
    const value = rawValue === '' ? undefined : Number(rawValue);
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // Need at least one vital entered
    const hasData = Object.values(data).some(v => v !== undefined);
    if (hasData) {
      onSubmit(data);
    }
  };

  const bmi = computeBMI(data.weight, data.height);
  const hasData = Object.values(data).some(v => v !== undefined);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spaceBetween.relatedCompact,
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  };

  const inputStyle = (field: VitalField, value?: number): React.CSSProperties => ({
    width: '100%',
    padding: `${spaceAround.tight}px ${spaceAround.tight}px`,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: value !== undefined && isOutOfRange(field, value)
      ? colors.fg.alert.secondary
      : colors.fg.neutral.primary,
    backgroundColor: colors.bg.neutral.base,
    border: `1px solid ${
      value !== undefined && isOutOfRange(field, value)
        ? colors.fg.alert.secondary
        : colors.border.neutral.medium
    }`,
    borderRadius: borderRadius.sm,
    outline: 'none',
    transition: `border-color ${transitions.fast}`,
    textAlign: 'right',
  });

  const unitStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.disabled,
    minWidth: 30,
  };

  const bmiStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.sm,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spaceBetween.repeating,
    paddingTop: spaceAround.tight,
  };

  return (
    <div style={containerStyle} data-testid="vitals-input">
      <div style={gridStyle}>
        {VITAL_FIELDS.map((field) => (
          <div key={field.key} style={fieldStyle}>
            <label style={labelStyle}>{field.label}</label>
            <div style={inputContainerStyle}>
              <input
                type="number"
                style={inputStyle(field, data[field.key])}
                value={data[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder="\u2014"
                data-testid={`vital-${field.key}`}
              />
              <span style={unitStyle}>{field.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {bmi && (
        <div style={bmiStyle} data-testid="vitals-bmi">
          <span style={{ fontWeight: typography.fontWeight.medium }}>BMI:</span>
          <span>{bmi} kg/m\u00B2</span>
        </div>
      )}

      <div style={actionsStyle}>
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
  );
};

VitalsInput.displayName = 'VitalsInput';
