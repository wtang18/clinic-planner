/**
 * LabDetailForm — Lab Order Detail Form
 *
 * Category-specific form for lab orders. Pre-populates priority and collection
 * type from quick-pick data. Conditionally shows reference lab when send-out
 * is selected.
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

export interface LabDetailFormProps {
  initialData: Partial<ChartItem>;
  onSubmit: (item: Partial<ChartItem>) => void;
  onCancel: () => void;
}

// ============================================================================
// Option sets
// ============================================================================

const PRIORITY_OPTIONS: ChipOption[] = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'stat', label: 'STAT' },
];

const COLLECTION_OPTIONS: ChipOption[] = [
  { value: 'in-house', label: 'In-House' },
  { value: 'send-out', label: 'Send Out' },
];

const LAB_VENDOR_OPTIONS: ChipOption[] = [
  { value: 'Quest', label: 'Quest' },
  { value: 'LabCorp', label: 'LabCorp' },
  { value: 'Sonic', label: 'Sonic' },
];

// ============================================================================
// Component
// ============================================================================

export const LabDetailForm: React.FC<LabDetailFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const data = (initialData as Record<string, unknown>) || {};

  // ── Form state from quick-pick smart defaults ──
  const [priority, setPriority] = React.useState<string>(String(data.priority || 'routine'));
  const [collectionType, setCollectionType] = React.useState<string>(String(data.collectionType || 'in-house'));
  const [labVendor, setLabVendor] = React.useState<string>(String(data.labVendor || ''));
  const [fastingRequired, setFastingRequired] = React.useState<boolean>(Boolean(data.fastingRequired));
  const [specialInstructions, setSpecialInstructions] = React.useState<string>(String(data.specialInstructions || ''));

  const testName = String(data.testName || data.displayText || '');
  const testCode = data.testCode ? String(data.testCode) : undefined;
  const panelName = data.panelName ? String(data.panelName) : undefined;

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      priority,
      collectionType,
      labVendor: collectionType === 'send-out' ? labVendor : undefined,
      fastingRequired,
      specialInstructions: specialInstructions || undefined,
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

  const testNameStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.primary,
    fontFamily: typography.fontFamily.sans,
    margin: 0,
  };

  const testCodeStyle: React.CSSProperties = {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
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
    <form style={containerStyle} onSubmit={handleSubmit} data-testid="lab-detail-form">
      {/* Header */}
      <div style={headerStyle}>
        <p style={testNameStyle}>{testName}</p>
        {panelName && <span style={testCodeStyle}>{panelName}</span>}
        {testCode && <span style={testCodeStyle}>LOINC: {testCode}</span>}
      </div>

      {/* Fields */}
      <div style={fieldsGridStyle}>
        {/* Priority */}
        <div style={fullWidthStyle}>
          <FieldRow label="Priority" required>
            <ChipSelect
              value={priority}
              options={PRIORITY_OPTIONS}
              onSelect={setPriority}
            />
          </FieldRow>
        </div>

        {/* Collection Type */}
        <div style={fullWidthStyle}>
          <FieldRow label="Collection" required>
            <ChipSelect
              value={collectionType}
              options={COLLECTION_OPTIONS}
              onSelect={setCollectionType}
            />
          </FieldRow>
        </div>

        {/* Reference Lab (conditional: only when send-out) */}
        {collectionType === 'send-out' && (
          <div style={fullWidthStyle}>
            <FieldRow label="Reference Lab" required>
              <ChipSelect
                value={labVendor}
                options={LAB_VENDOR_OPTIONS}
                onSelect={setLabVendor}
                allowCustom
                customPlaceholder="Lab name..."
              />
            </FieldRow>
          </div>
        )}

        {/* Fasting Required */}
        <FieldRow label="Fasting Required">
          <ToggleSwitch
            checked={fastingRequired}
            onChange={setFastingRequired}
          />
        </FieldRow>

        {/* Special Instructions */}
        <div style={fullWidthStyle}>
          <FieldRow label="Special Instructions" hint="e.g. 'Collect in AM', 'No aspirin 7 days prior'">
            <Input
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder="Optional instructions..."
              size="sm"
              data-testid="field-special-instructions"
            />
          </FieldRow>
        </div>
      </div>

      {/* Actions */}
      <div style={actionsStyle}>
        <Button variant="ghost" size="sm" onClick={onCancel} type="button" data-testid="item-form-cancel">
          Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" data-testid="add-item-btn">
          Add Lab
        </Button>
      </div>
    </form>
  );
};

LabDetailForm.displayName = 'LabDetailForm';
