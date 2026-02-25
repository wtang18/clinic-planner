/**
 * VitalsSection Component
 *
 * Enhanced vitals triage input with structured fields, inline unit suffixes,
 * and imperial/metric toggle.
 *
 * Layout: 3-column grid matching reference design.
 * - Row 1: Systolic / Diastolic / Pulse
 * - Row 2: Resp Rate / O₂ Sat / Oxy On
 * - Row 3: Temperature / Height / Weight
 * - Toggle: imperial/metric SegmentedControl
 */

import React, { useState, useCallback, useEffect } from 'react';
import { SegmentedControl, type Segment } from '../../../components/primitives/SegmentedControl';
import { Input } from '../../../components/primitives/Input';
import { formGroup, fieldLabel, selectInput } from './PlaceholderSections';
import { spaceBetween } from '../../../styles/foundations';
import type { UnitSystem } from '../../../types/vitals';
import {
  fToC,
  cToF,
  lbsToKg,
  kgToLbs,
  ftInToCm,
  cmToFtIn,
} from '../../../utils/vitals-conversion';

// ============================================================================
// VitalsSection
// ============================================================================

export interface VitalsSectionProps {
  /** Callback to expose the unit toggle for external placement (e.g., WorkflowSection footerLeft) */
  onFooterLeft?: (node: React.ReactNode) => void;
}

const unitSegments: Segment<UnitSystem>[] = [
  { key: 'imperial', label: 'Imperial' },
  { key: 'metric', label: 'Metric' },
];

export const VitalsSection: React.FC<VitalsSectionProps> = ({ onFooterLeft } = {}) => {
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

  // Push toggle to parent's footer slot when available
  useEffect(() => {
    if (onFooterLeft) {
      onFooterLeft(
        <SegmentedControl<UnitSystem>
          segments={unitSegments}
          value={unitSystem}
          onChange={handleUnitToggle}
          variant="inline"
          size="sm"
        />
      );
    }
  }, [onFooterLeft, unitSystem, handleUnitToggle]);

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
          <Input type="number" size="sm" value={systolic} onChange={e => setSystolic(e.target.value)} suffix="mmHg" />
        </div>
        <div style={formGroup}>
          <label style={fieldLabel}>Diastolic</label>
          <Input type="number" size="sm" value={diastolic} onChange={e => setDiastolic(e.target.value)} suffix="mmHg" />
        </div>
        <div style={formGroup}>
          <label style={fieldLabel}>Pulse</label>
          <Input type="number" size="sm" value={pulse} onChange={e => setPulse(e.target.value)} suffix="bpm" />
        </div>
      </div>

      {/* Row 2: Resp Rate + O₂ Sat + Oxy On */}
      <div style={gridStyles}>
        <div style={formGroup}>
          <label style={fieldLabel}>Resp. Rate</label>
          <Input type="number" size="sm" value={respRate} onChange={e => setRespRate(e.target.value)} suffix="/min" />
        </div>
        <div style={formGroup}>
          <label style={fieldLabel}>O₂ Sat</label>
          <Input type="number" size="sm" value={spo2} onChange={e => setSpo2(e.target.value)} suffix="%" />
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
          <Input type="number" size="sm" value={temp} onChange={e => setTemp(e.target.value)} suffix={unitSystem === 'imperial' ? '°F' : '°C'} />
        </div>
        <div style={formGroup}>
          <label style={fieldLabel}>Height</label>
          {unitSystem === 'imperial' ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ flex: 1 }}>
                <Input type="number" size="sm" value={heightFt} onChange={e => setHeightFt(e.target.value)} suffix="ft" />
              </div>
              <div style={{ flex: 1 }}>
                <Input type="number" size="sm" value={heightIn} onChange={e => setHeightIn(e.target.value)} suffix="in" />
              </div>
            </div>
          ) : (
            <Input type="number" size="sm" value={heightCm} onChange={e => setHeightCm(e.target.value)} suffix="cm" />
          )}
        </div>
        <div style={formGroup}>
          <label style={fieldLabel}>Weight</label>
          <Input type="number" size="sm" value={weight} onChange={e => setWeight(e.target.value)} suffix={unitSystem === 'imperial' ? 'lbs' : 'kg'} />
        </div>
      </div>

      {/* Unit Toggle — rendered inline when no parent slot is available */}
      {!onFooterLeft && (
        <div style={{ display: 'flex', marginTop: spaceBetween.related }}>
          <SegmentedControl<UnitSystem>
            segments={unitSegments}
            value={unitSystem}
            onChange={handleUnitToggle}
            variant="inline"
            size="sm"
          />
        </div>
      )}
    </div>
  );
};

VitalsSection.displayName = 'VitalsSection';
