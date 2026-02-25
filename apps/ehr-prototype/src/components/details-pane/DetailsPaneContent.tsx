/**
 * DetailsPaneContent Component
 *
 * Routes to category-specific detail forms (edit mode) or renders
 * a textarea for narrative categories, or read-only display for others.
 */

import React from 'react';
import type { ChartItem } from '../../types/chart-items';
import { RxDetailForm } from '../omni-add/form/RxDetailForm';
import { LabDetailForm } from '../omni-add/form/LabDetailForm';
import { DxDetailForm } from '../omni-add/form/DxDetailForm';
import { ImagingDetailForm } from '../omni-add/form/ImagingDetailForm';
import { ProcedureDetailForm } from '../omni-add/form/ProcedureDetailForm';
import { AllergyDetailForm } from '../omni-add/form/AllergyDetailForm';
import { ReferralDetailForm } from '../omni-add/form/ReferralDetailForm';
import { VitalsDetailForm } from '../omni-add/form/VitalsDetailForm';
import { InstructionEditor } from './InstructionEditor';
import { colors, spaceAround, spaceBetween, typography, borderRadius } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface DetailsPaneContentProps {
  item: ChartItem;
  onUpdate: (changes: Partial<ChartItem>) => void;
}

// ============================================================================
// Narrative categories (use textarea editor)
// ============================================================================

const NARRATIVE_CATEGORIES = new Set([
  'chief-complaint', 'hpi', 'ros', 'physical-exam', 'plan', 'note',
]);

// ============================================================================
// Component
// ============================================================================

export const DetailsPaneContent: React.FC<DetailsPaneContentProps> = ({ item, onUpdate }) => {
  // Structured categories get their category-specific form
  switch (item.category) {
    case 'medication':
      return (
        <RxDetailForm
          initialData={item as unknown as Partial<ChartItem>}
          onSubmit={(changes) => onUpdate(changes)}
          onCancel={() => {}} // No-op: pane close handles cancel
          mode="edit"
        />
      );

    case 'lab':
      return (
        <LabDetailForm
          initialData={item as unknown as Partial<ChartItem>}
          onSubmit={(changes) => onUpdate(changes)}
          onCancel={() => {}}
          mode="edit"
        />
      );

    case 'diagnosis':
      return (
        <DxDetailForm
          initialData={item as unknown as Partial<ChartItem>}
          onSubmit={(changes) => onUpdate(changes)}
          onCancel={() => {}}
          mode="edit"
        />
      );

    case 'imaging':
      return (
        <ImagingDetailForm
          initialData={item as unknown as Partial<ChartItem>}
          onSubmit={(changes) => onUpdate(changes)}
          onCancel={() => {}}
          mode="edit"
        />
      );

    case 'procedure':
      return (
        <ProcedureDetailForm
          initialData={item as unknown as Partial<ChartItem>}
          onSubmit={(changes) => onUpdate(changes)}
          onCancel={() => {}}
          mode="edit"
        />
      );

    case 'allergy':
      return (
        <AllergyDetailForm
          initialData={item as unknown as Partial<ChartItem>}
          onSubmit={(changes) => onUpdate(changes)}
          onCancel={() => {}}
          mode="edit"
        />
      );

    case 'referral':
      return (
        <ReferralDetailForm
          initialData={item as unknown as Partial<ChartItem>}
          onSubmit={(changes) => onUpdate(changes)}
          onCancel={() => {}}
          mode="edit"
        />
      );

    case 'vitals':
      return (
        <VitalsDetailForm
          initialData={item as unknown as Partial<ChartItem>}
          onSubmit={(changes) => onUpdate(changes)}
          onCancel={() => {}}
          mode="edit"
        />
      );

    case 'instruction':
      return <InstructionEditor item={item} onUpdate={onUpdate} />;

    default:
      if (NARRATIVE_CATEGORIES.has(item.category)) {
        return <NarrativeEditor item={item} onUpdate={onUpdate} />;
      }
      return <ReadOnlyDisplay item={item} />;
  }
};

DetailsPaneContent.displayName = 'DetailsPaneContent';

// ============================================================================
// Narrative Editor (textarea for CC, HPI, ROS, etc.)
// ============================================================================

const NarrativeEditor: React.FC<{
  item: ChartItem;
  onUpdate: (changes: Partial<ChartItem>) => void;
}> = ({ item, onUpdate }) => {
  const [text, setText] = React.useState(item.displayText);
  const [dirty, setDirty] = React.useState(false);

  // Sync when item changes externally
  React.useEffect(() => {
    setText(item.displayText);
    setDirty(false);
  }, [item.id, item.displayText]);

  const handleSave = () => {
    if (text !== item.displayText) {
      onUpdate({ displayText: text });
      setDirty(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.related }}>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setDirty(true);
        }}
        style={{
          width: '100%',
          minHeight: 120,
          padding: spaceAround.compact,
          fontSize: 14,
          fontFamily: typography.fontFamily.sans,
          color: colors.fg.neutral.primary,
          backgroundColor: colors.bg.neutral.min,
          border: `1px solid ${colors.border.neutral.low}`,
          borderRadius: borderRadius.sm,
          resize: 'vertical',
          outline: 'none',
        }}
      />
      {dirty && (
        <button
          onClick={handleSave}
          style={{
            alignSelf: 'flex-end',
            padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
            fontSize: 13,
            fontWeight: typography.fontWeight.medium,
            color: colors.fg.neutral.inversePrimary,
            backgroundColor: colors.bg.accent.medium,
            border: 'none',
            borderRadius: borderRadius.sm,
            cursor: 'pointer',
          }}
        >
          Save Changes
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Read-Only Display (fallback for unsupported categories)
// ============================================================================

const ReadOnlyDisplay: React.FC<{ item: ChartItem }> = ({ item }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spaceBetween.repeating }}>
      <div>
        <span style={{
          fontSize: 12,
          color: colors.fg.neutral.spotReadable,
          fontWeight: typography.fontWeight.medium,
        }}>
          Content
        </span>
        <p style={{
          fontSize: 14,
          color: colors.fg.neutral.primary,
          margin: `${spaceAround.tight}px 0 0 0`,
        }}>
          {item.displayText}
        </p>
      </div>
      {item.displaySubtext && (
        <div>
          <span style={{
            fontSize: 12,
            color: colors.fg.neutral.spotReadable,
            fontWeight: typography.fontWeight.medium,
          }}>
            Details
          </span>
          <p style={{
            fontSize: 14,
            color: colors.fg.neutral.primary,
            margin: `${spaceAround.tight}px 0 0 0`,
          }}>
            {item.displaySubtext}
          </p>
        </div>
      )}
    </div>
  );
};
