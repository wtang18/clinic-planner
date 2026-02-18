/**
 * InstructionEditor — Instruction Item Editor for DetailsPane
 *
 * Combines a text editor (same as NarrativeEditor) with structured metadata fields
 * for instruction type, follow-up, and delivery options. Used in DetailsPane for
 * editing instruction items — OmniAdd creation still uses NarrativeInput for the
 * text content, with structured fields added here during editing.
 */

import React from 'react';
import type { ChartItem } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../../styles/foundations';
import { ChipSelect } from '../omni-add/form/ChipSelect';
import type { ChipOption } from '../omni-add/form/ChipSelect';
import { FieldRow } from '../omni-add/form/FieldRow';
import { ToggleSwitch } from '../omni-add/form/ToggleSwitch';
import { Input } from '../primitives/Input';

// ============================================================================
// Types
// ============================================================================

export interface InstructionEditorProps {
  item: ChartItem;
  onUpdate: (changes: Partial<ChartItem>) => void;
}

// ============================================================================
// Option sets
// ============================================================================

const INSTRUCTION_TYPE_OPTIONS: ChipOption[] = [
  { value: 'discharge', label: 'Discharge' },
  { value: 'follow-up', label: 'Follow-Up' },
  { value: 'medication', label: 'Medication' },
  { value: 'activity', label: 'Activity' },
  { value: 'diet', label: 'Diet' },
  { value: 'warning', label: 'Warning' },
];

// ============================================================================
// Component
// ============================================================================

export const InstructionEditor: React.FC<InstructionEditorProps> = ({ item, onUpdate }) => {
  const data = (item as unknown as Record<string, unknown>).data as Record<string, unknown> | undefined;

  const [text, setText] = React.useState(String(data?.text || item.displayText || ''));
  const [instructionType, setInstructionType] = React.useState<string>(
    String(data?.instructionType || 'follow-up')
  );
  const [followUpInterval, setFollowUpInterval] = React.useState<string>(
    String(data?.followUpInterval || '')
  );
  const [followUpProvider, setFollowUpProvider] = React.useState<string>(
    String(data?.followUpProvider || '')
  );
  const [printable, setPrintable] = React.useState<boolean>(
    data?.printable !== undefined ? Boolean(data.printable) : true
  );
  const [requiresAcknowledgment, setRequiresAcknowledgment] = React.useState<boolean>(
    Boolean(data?.requiresAcknowledgment)
  );
  const [dirty, setDirty] = React.useState(false);

  // Sync when item changes externally
  React.useEffect(() => {
    setText(String(data?.text || item.displayText || ''));
    setInstructionType(String(data?.instructionType || 'follow-up'));
    setFollowUpInterval(String(data?.followUpInterval || ''));
    setFollowUpProvider(String(data?.followUpProvider || ''));
    setPrintable(data?.printable !== undefined ? Boolean(data.printable) : true);
    setRequiresAcknowledgment(Boolean(data?.requiresAcknowledgment));
    setDirty(false);
  }, [item.id]);

  const markDirty = () => setDirty(true);

  const handleSave = () => {
    onUpdate({
      displayText: text,
      text,
      instructionType,
      followUpInterval: followUpInterval || undefined,
      followUpProvider: followUpProvider || undefined,
      printable,
      requiresAcknowledgment,
    } as unknown as Partial<ChartItem>);
    setDirty(false);
  };

  return (
    <div style={styles.container} data-testid="instruction-editor">
      {/* Text editor */}
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          markDirty();
        }}
        style={styles.textarea}
        placeholder="Patient instructions..."
        data-testid="instruction-text"
      />

      {/* Structured metadata */}
      <div style={styles.metaSection}>
        <div style={styles.metaLabel}>Instruction Details</div>

        <div style={styles.fieldsGrid}>
          <div style={styles.fullWidth}>
            <FieldRow label="Type">
              <ChipSelect
                value={instructionType}
                options={INSTRUCTION_TYPE_OPTIONS}
                onSelect={(v) => { setInstructionType(v); markDirty(); }}
              />
            </FieldRow>
          </div>

          <FieldRow label="Follow-Up Interval">
            <Input
              value={followUpInterval}
              onChange={e => { setFollowUpInterval(e.target.value); markDirty(); }}
              placeholder="e.g., 2 weeks"
              size="sm"
              data-testid="field-follow-up-interval"
            />
          </FieldRow>

          <FieldRow label="Follow-Up Provider">
            <Input
              value={followUpProvider}
              onChange={e => { setFollowUpProvider(e.target.value); markDirty(); }}
              placeholder="Provider name..."
              size="sm"
              data-testid="field-follow-up-provider"
            />
          </FieldRow>

          <FieldRow label="Printable">
            <ToggleSwitch
              checked={printable}
              onChange={(v) => { setPrintable(v); markDirty(); }}
            />
          </FieldRow>

          <FieldRow label="Requires Acknowledgment">
            <ToggleSwitch
              checked={requiresAcknowledgment}
              onChange={(v) => { setRequiresAcknowledgment(v); markDirty(); }}
            />
          </FieldRow>
        </div>
      </div>

      {/* Save button */}
      {dirty && (
        <button
          onClick={handleSave}
          style={styles.saveButton}
          data-testid="instruction-save"
        >
          Save Changes
        </button>
      )}
    </div>
  );
};

InstructionEditor.displayName = 'InstructionEditor';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  },
  textarea: {
    width: '100%',
    minHeight: 100,
    padding: spaceAround.compact,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    backgroundColor: colors.bg.neutral.min,
    border: `1px solid ${colors.border.neutral.low}`,
    borderRadius: borderRadius.sm,
    resize: 'vertical',
    outline: 'none',
    lineHeight: 1.5,
  },
  metaSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedCompact,
    paddingTop: spaceAround.tight,
    borderTop: `1px solid ${colors.border.neutral.low}`,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.semibold,
    color: colors.fg.neutral.spotReadable,
    fontFamily: typography.fontFamily.sans,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: spaceBetween.relatedCompact,
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  saveButton: {
    alignSelf: 'flex-end',
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    fontSize: 13,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.inversePrimary,
    backgroundColor: colors.bg.accent.medium,
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
  },
};
