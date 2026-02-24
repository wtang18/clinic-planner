/**
 * VitalsSection Component
 *
 * Enhanced vitals triage input with structured fields, inline unit suffixes,
 * and imperial/metric toggle. Auto-computes BMI from height + weight.
 *
 * Layout: 3-column grid matching reference design.
 * - Row 1: Systolic / Diastolic / Pulse
 * - Row 2: Resp Rate / O₂ Sat / Oxy On
 * - Row 3: Temperature / Height / Weight
 * - BMI: read-only computed field
 * - Toggle: imperial/metric SegmentedControl
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SegmentedControl, type Segment } from '../../../components/primitives/SegmentedControl';
import { formGroup, fieldLabel, textInput, selectInput, fieldRow, sectionNote } from './PlaceholderSections';
import { colors, spaceBetween, typography, borderRadius } from '../../../styles/foundations';
import type { UnitSystem } from '../../../types/vitals';
import {
  fToC,
  cToF,
  lbsToKg,
  kgToLbs,
  ftInToCm,
  cmToFtIn,
  computeBMI,
  computeBMIImperial,
} from '../../../utils/vitals-conversion';

// ============================================================================
// UnitInput — local helper
// ============================================================================

interface UnitInputProps {
  value: string;
  onChange: (value: string) => void;
  unit: string;
  readOnly?: boolean;
  width?: number | string;
  type?: string;
}

const UnitInput: React.FC<UnitInputProps> = ({ value, onChange, unit, readOnly, width, type = 'text' }) => (
  <div style={{
    position: 'relative',
    width: width || '100%',
    display: 'inline-flex',
  }}>
    <input
      type={type}
      style={{
        ...textInput,
        width: '100%',
        paddingRight: unit.length * 8 + 16,
        backgroundColor: readOnly ? colors.bg.neutral.subtle : textInput.backgroundColor,
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
    />
    <span style={{
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 12,
      fontFamily: typography.fontFamily.sans,
      color: colors.fg.neutral.spotReadable,
      pointerEvents: 'none',
      userSelect: 'none',
    }}>
      {unit}
    </span>
  </div>
);

// ============================================================================
// VitalsSection
// ============================================================================

const unitSegments: Segment<UnitSystem>[] = [
  { key: 'imperial', label: 'Imperial' },
  { key: 'metric', label: 'Metric' },
];

export const VitalsSection: React.FC = () => {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');

  // Vital field values (always stored in current unit system)
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [pulse, setPulse] = useState('72');
  const [respRate, setRespRate] = useState('16');
  const [spo2, setSpo2] = useState('98');
  const [oxyOn, setOxyOn] = useState('none');
  const [temp, setTemp] = useState('98.6');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('6');
  const [heightCm, setHeightCm] = useState('167.6');
  const [weight, setWeight] = useState('145');
  const [bmi, setBmi] = useState('23.4');

  // Auto-compute BMI on height/weight change
  useEffect(() => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      setBmi('--');
      return;
    }

    let result: number | null = null;
    if (unitSystem === 'imperial') {
      const ft = parseInt(heightFt) || 0;
      const inches = parseInt(heightIn) || 0;
      result = computeBMIImperial(w, ft, inches);
    } else {
      const cm = parseFloat(heightCm);
      if (!isNaN(cm)) {
        result = computeBMI(w, cm);
      }
    }
    setBmi(result !== null ? String(result) : '--');
  }, [weight, heightFt, heightIn, heightCm, unitSystem]);

  // Handle unit system toggle — convert existing values
  const handleUnitToggle = useCallback((newSystem: UnitSystem) => {
    if (newSystem === unitSystem) return;

    // Convert temperature
    const tempVal = parseFloat(temp);
    if (!isNaN(tempVal)) {
      setTemp(String(newSystem === 'metric' ? fToC(tempVal) : cToF(tempVal)));
    }

    // Convert weight
    const weightVal = parseFloat(weight);
    if (!isNaN(weightVal)) {
      setWeight(String(newSystem === 'metric' ? lbsToKg(weightVal) : kgToLbs(weightVal)));
    }

    // Convert height
    if (newSystem === 'metric') {
      const ft = parseInt(heightFt) || 0;
      const inches = parseInt(heightIn) || 0;
      setHeightCm(String(ftInToCm(ft, inches)));
    } else {
      const cm = parseFloat(heightCm);
      if (!isNaN(cm)) {
        const { ft, in: inches } = cmToFtIn(cm);
        setHeightFt(String(ft));
        setHeightIn(String(inches));
      }
    }

    setUnitSystem(newSystem);
  }, [unitSystem, temp, weight, heightFt, heightIn, heightCm]);

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: spaceBetween.related,
  };

  return (
    <div>
      {/* Row 1: BP + Pulse */}
      <div style={gridStyles}>
        <div style={formGroup}>
          <label style={fieldLabel}>Systolic</label>
          <UnitInput value={systolic} onChange={setSystolic} unit="mmHg" />
        </div>
        <div style={formGroup}>
          <label style={fieldLabel}>Diastolic</label>
          <UnitInput value={diastolic} onChange={setDiastolic} unit="mmHg" />
        </div>
        <div style={formGroup}>
          <label style={fieldLabel}>Pulse</label>
          <UnitInput value={pulse} onChange={setPulse} unit="bpm" />
        </div>
      </div>

      {/* Row 2: Resp Rate + O₂ Sat + Oxy On */}
      <div style={gridStyles}>
        <div style={formGroup}>
          <label style={fieldLabel}>Resp. Rate</label>
          <UnitInput value={respRate} onChange={setRespRate} unit="/min" />
        </div>
        <div style={formGroup}>
          <label style={fieldLabel}>O₂ Sat</label>
          <UnitInput value={spo2} onChange={setSpo2} unit="%" />
        </div>
        <div style={formGroup}>
          <label style={fieldLabel}>Oxy On</label>
          <select
            style={selectInput}
            value={oxyOn}
            onChange={(e) => setOxyOn(e.target.value)}
          >
            <option value="none">None</option>
            <option value="nasal-cannula">Nasal Cannula</option>
            <option value="face-mask">Face Mask</option>
            <option value="non-rebreather">Non-Rebreather</option>
            <option value="ventilator">Ventilator</option>
          </select>
        </div>
      </div>

      {/* Row 3: Temperature + Height + Weight */}
      <div style={gridStyles}>
        <div style={formGroup}>
          <label style={fieldLabel}>Temperature</label>
          <UnitInput
            value={temp}
            onChange={setTemp}
            unit={unitSystem === 'imperial' ? '°F' : '°C'}
          />
        </div>
        <div style={formGroup}>
          <label style={fieldLabel}>Height</label>
          {unitSystem === 'imperial' ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <UnitInput value={heightFt} onChange={setHeightFt} unit="ft" width="50%" />
              <UnitInput value={heightIn} onChange={setHeightIn} unit="in" width="50%" />
            </div>
          ) : (
            <UnitInput value={heightCm} onChange={setHeightCm} unit="cm" />
          )}
        </div>
        <div style={formGroup}>
          <label style={fieldLabel}>Weight</label>
          <UnitInput
            value={weight}
            onChange={setWeight}
            unit={unitSystem === 'imperial' ? 'lbs' : 'kg'}
          />
        </div>
      </div>

      {/* BMI + Unit Toggle */}
      <div style={fieldRow}>
        <div style={formGroup}>
          <label style={fieldLabel}>BMI</label>
          <UnitInput value={bmi} onChange={() => {}} unit="" readOnly />
        </div>
        <div style={{
          ...formGroup,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
        }}>
          <SegmentedControl<UnitSystem>
            segments={unitSegments}
            value={unitSystem}
            onChange={handleUnitToggle}
            variant="inline"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};

VitalsSection.displayName = 'VitalsSection';
