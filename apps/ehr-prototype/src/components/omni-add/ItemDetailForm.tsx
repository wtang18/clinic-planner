/**
 * ItemDetailForm Component
 *
 * Category-specific form for entering item details.
 */

import React from 'react';
import type { ChartItem, ItemCategory } from '../../types/chart-items';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
import { getCategoryColor } from '../../styles/utils';
import { Input } from '../primitives/Input';
import { Button } from '../primitives/Button';

// ============================================================================
// Types
// ============================================================================

export interface ItemDetailFormProps {
  /** The category of item */
  category: ItemCategory;
  /** Initial data for the form */
  initialData: Partial<ChartItem>;
  /** Called when form is submitted */
  onSubmit: (item: Partial<ChartItem>) => void;
  /** Called when cancelled */
  onCancel: () => void;
  /** Whether to apply smart defaults */
  smartDefaults?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Form field configurations by category
// ============================================================================

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
}

const FORM_FIELDS: Partial<Record<ItemCategory, FormField[]>> = {
  medication: [
    { name: 'dosage', label: 'Dosage', type: 'text', placeholder: '10 mg', required: true },
    {
      name: 'route',
      label: 'Route',
      type: 'select',
      options: [
        { value: 'PO', label: 'PO (by mouth)' },
        { value: 'IM', label: 'IM (intramuscular)' },
        { value: 'IV', label: 'IV (intravenous)' },
        { value: 'SC', label: 'SC (subcutaneous)' },
        { value: 'topical', label: 'Topical' },
        { value: 'inhaled', label: 'Inhaled' },
        { value: 'rectal', label: 'Rectal' },
        { value: 'ophthalmic', label: 'Ophthalmic' },
      ],
      defaultValue: 'PO',
    },
    {
      name: 'frequency',
      label: 'Frequency',
      type: 'select',
      options: [
        { value: 'daily', label: 'Daily' },
        { value: 'BID', label: 'BID (twice daily)' },
        { value: 'TID', label: 'TID (three times daily)' },
        { value: 'QID', label: 'QID (four times daily)' },
        { value: 'QHS', label: 'QHS (at bedtime)' },
        { value: 'PRN', label: 'PRN (as needed)' },
        { value: 'weekly', label: 'Weekly' },
      ],
      defaultValue: 'daily',
    },
    { name: 'quantity', label: 'Quantity', type: 'number', placeholder: '30', defaultValue: 30 },
    { name: 'refills', label: 'Refills', type: 'number', placeholder: '0', defaultValue: 0 },
  ],
  lab: [
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'routine', label: 'Routine' },
        { value: 'urgent', label: 'Urgent' },
        { value: 'stat', label: 'STAT' },
      ],
      defaultValue: 'routine',
    },
    {
      name: 'collectionType',
      label: 'Collection',
      type: 'select',
      options: [
        { value: 'in-house', label: 'In-house' },
        { value: 'send-out', label: 'Send out' },
      ],
      defaultValue: 'in-house',
    },
    { name: 'labVendor', label: 'Lab Vendor', type: 'text', placeholder: 'Quest, LabCorp...' },
  ],
  diagnosis: [
    { name: 'icdCode', label: 'ICD-10 Code', type: 'text', placeholder: 'I10', required: true },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'encounter', label: 'Encounter' },
        { value: 'chronic', label: 'Chronic' },
        { value: 'historical', label: 'Historical' },
      ],
      defaultValue: 'encounter',
    },
    {
      name: 'ranking',
      label: 'Ranking',
      type: 'select',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
      ],
    },
  ],
  imaging: [
    {
      name: 'studyType',
      label: 'Study Type',
      type: 'select',
      options: [
        { value: 'X-ray', label: 'X-ray' },
        { value: 'CT', label: 'CT' },
        { value: 'MRI', label: 'MRI' },
        { value: 'Ultrasound', label: 'Ultrasound' },
        { value: 'PET', label: 'PET' },
      ],
      required: true,
    },
    { name: 'bodyPart', label: 'Body Part', type: 'text', placeholder: 'Chest, Abdomen...', required: true },
    { name: 'indication', label: 'Indication', type: 'text', placeholder: 'Clinical indication...' },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'routine', label: 'Routine' },
        { value: 'urgent', label: 'Urgent' },
        { value: 'stat', label: 'STAT' },
      ],
      defaultValue: 'routine',
    },
  ],
  procedure: [
    { name: 'cptCode', label: 'CPT Code', type: 'text', placeholder: 'Optional' },
    { name: 'indication', label: 'Indication', type: 'text', placeholder: 'Reason for procedure...' },
  ],
};

// ============================================================================
// Component
// ============================================================================

export const ItemDetailForm: React.FC<ItemDetailFormProps> = ({
  category,
  initialData,
  onSubmit,
  onCancel,
  smartDefaults = true,
  style,
}) => {
  const fields = FORM_FIELDS[category] || [];
  const categoryColors = getCategoryColor(category);

  // Initialize form state with defaults
  const [formData, setFormData] = React.useState<Record<string, string | number>>(() => {
    const initial: Record<string, string | number> = {};
    fields.forEach(field => {
      if (smartDefaults && field.defaultValue !== undefined) {
        initial[field.name] = field.defaultValue;
      }
    });
    return initial;
  });

  const handleChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      ...formData,
    });
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    paddingBottom: spacing[3],
    borderBottom: `1px solid ${colors.neutral[200]}`,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm[0],
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[900],
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
  };

  const fieldsContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: spacing[3],
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
  };

  const labelStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs[0],
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
  };

  const selectStyle: React.CSSProperties = {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.sm[0],
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: radii.md,
    backgroundColor: colors.neutral[0],
    color: colors.neutral[900],
    cursor: 'pointer',
    transition: `border-color ${transitions.fast}`,
    outline: 'none',
    width: '100%',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spacing[2],
    paddingTop: spacing[3],
    borderTop: `1px solid ${colors.neutral[200]}`,
  };

  // If no fields for this category, show simplified form
  if (fields.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: radii.full,
              backgroundColor: categoryColors.icon,
            }}
          />
          <p style={titleStyle}>{initialData.displayText}</p>
        </div>
        <p style={{ fontSize: typography.fontSize.sm[0], color: colors.neutral[600] }}>
          No additional details required for this item type.
        </p>
        <div style={actionsStyle}>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => onSubmit(initialData)}>
            Add Item
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form style={containerStyle} onSubmit={handleSubmit}>
      {/* Header */}
      <div style={headerStyle}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: radii.full,
            backgroundColor: categoryColors.icon,
          }}
        />
        <div>
          <p style={titleStyle}>{initialData.displayText}</p>
          <span style={subtitleStyle}>{getCategoryLabel(category)}</span>
        </div>
      </div>

      {/* Fields */}
      <div style={fieldsContainerStyle}>
        {fields.map(field => (
          <div key={field.name} style={fieldStyle}>
            <label style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: colors.status.error }}> *</span>}
            </label>
            {field.type === 'select' ? (
              <select
                style={selectStyle}
                value={String(formData[field.name] || '')}
                onChange={e => handleChange(field.name, e.target.value)}
                required={field.required}
              >
                <option value="">Select...</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type={field.type}
                value={String(formData[field.name] || '')}
                onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={field.placeholder}
                size="sm"
              />
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={actionsStyle}>
        <Button variant="ghost" size="sm" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit">
          Add Item
        </Button>
      </div>
    </form>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function getCategoryLabel(category: ItemCategory): string {
  const labels: Record<ItemCategory, string> = {
    'chief-complaint': 'Chief Complaint',
    'hpi': 'HPI',
    'ros': 'Review of Systems',
    'physical-exam': 'Physical Exam',
    'vitals': 'Vitals',
    'medication': 'Medication',
    'allergy': 'Allergy',
    'lab': 'Lab Order',
    'imaging': 'Imaging Order',
    'procedure': 'Procedure',
    'diagnosis': 'Diagnosis',
    'plan': 'Plan',
    'instruction': 'Instruction',
    'note': 'Note',
    'referral': 'Referral',
  };
  return labels[category] || category;
}

ItemDetailForm.displayName = 'ItemDetailForm';
