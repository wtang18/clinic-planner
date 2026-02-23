/**
 * SuggestionEditPanel — Edit suggestion fields before accepting.
 *
 * Self-contained panel that renders FieldRows for editing a suggestion's fields
 * before accepting it. Used by both the AI palette and the AI drawer.
 *
 * Layout:
 *   Header: [Category badge] Item label
 *   FieldRows (with theme support)
 *   Instructions preview
 *   Footer: [Cancel] [Add with changes]
 */

import React, { useMemo, useState } from 'react';
import type { Suggestion } from '../../types/suggestions';
import type { ItemIntent } from '../../types/chart-items';
import { suggestionToEditableItem, getCategoryBadge } from '../../utils/suggestion-helpers';
import { isNarrativeCategory } from '../../services/ai/entity-extraction/suggestion-validators';
import { useFieldEditor } from '../../hooks/useFieldEditor';
import { FieldRow } from '../omni-add/FieldRow';
import { generateSig, calculateQuantity } from '../omni-add/form/rx-helpers';
import { buildItemSummary } from '../../utils/suggestion-helpers';
import { Button } from '../primitives/Button';
import {
  colors,
  spaceAround,
  spaceBetween,
  borderRadius,
  typography,
} from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface SuggestionEditPanelProps {
  suggestion: Suggestion;
  theme?: 'light' | 'dark';
  onAccept: (suggestionId: string, data: Record<string, unknown>) => void;
  onCancel: () => void;
}

// ============================================================================
// Instructions line builder (mirrors DetailArea logic)
// ============================================================================

function buildEditInstructionsLine(
  category: string,
  label: string,
  data: Record<string, unknown>,
  fieldSelections: Record<string, string>,
): string {
  if (category === 'medication') {
    const dosage = fieldSelections.dosage || '';
    const route = fieldSelections.route || '';
    const frequency = fieldSelections.frequency || '';
    const duration = fieldSelections.duration || '';
    const sig = generateSig(dosage, route, frequency);
    const qty = calculateQuantity(frequency, duration);
    const refills = Number(fieldSelections.refills ?? data.refills) || 0;
    const parts: string[] = [];
    if (data.reportedBy) {
      parts.push('Reported by patient');
    }
    if (sig) parts.push(`Sig: ${sig}`);
    const meta: string[] = [];
    if (qty !== null) meta.push(`Qty: ${qty}`);
    meta.push(`Refills: ${refills}`);
    if (duration) meta.push(`Duration: ${duration}`);
    if (meta.length > 0) parts.push(meta.join(' \u00B7 '));
    return parts.join('\n');
  }

  // Non-Rx: overlay selections onto item data and summarize
  const merged: import('../../data/mock-quick-picks').QuickPickItem = {
    id: 'preview',
    label,
    chipLabel: label,
    category: category as any,
    data: { ...data, ...fieldSelections },
  };
  return buildItemSummary(merged);
}

// ============================================================================
// Component
// ============================================================================

export const SuggestionEditPanel: React.FC<SuggestionEditPanelProps> = ({
  suggestion,
  theme = 'light',
  onAccept,
  onCancel,
}) => {
  const isDark = theme === 'dark';
  const editableItem = useMemo(() => suggestionToEditableItem(suggestion), [suggestion]);

  // Extract intent from suggestion template
  const intent: ItemIntent | undefined = suggestion.content.type === 'new-item'
    ? suggestion.content.itemTemplate?.intent as ItemIntent | undefined
    : undefined;

  const {
    fieldSelections,
    fieldConfigs,
    clearEditMode,
    handleFieldChange,
    buildData,
  } = useFieldEditor({
    category: editableItem?.category ?? null,
    item: editableItem,
    autoEnterEditMode: true,
    intent,
  });

  const category = editableItem?.category;
  const badge = category ? getCategoryBadge(category, intent) : null;
  const label = suggestion.actionLabel || suggestion.displayText;

  // Live instructions preview
  const instructionsLine = useMemo(() => {
    if (!editableItem || !category) return '';
    return buildEditInstructionsLine(category, label, editableItem.data, fieldSelections);
  }, [editableItem, category, label, fieldSelections]);

  const handleAdd = () => {
    const data = buildData();
    if (data) {
      onAccept(suggestion.id, data);
    }
  };

  // Narrative categories (hpi, plan, instruction) use textarea editing
  if (editableItem && category && isNarrativeCategory(category)) {
    return (
      <NarrativeEditPanel
        suggestion={suggestion}
        editableItem={editableItem}
        category={category}
        badge={badge}
        label={label}
        isDark={isDark}
        theme={theme}
        onAccept={onAccept}
        onCancel={onCancel}
      />
    );
  }

  if (!editableItem || fieldConfigs.length === 0) {
    // No editable fields — shouldn't normally happen but handle gracefully
    return null;
  }

  return (
    <div style={containerStyle(isDark)} data-testid="suggestion-edit-panel">
      {/* Header */}
      <div style={headerStyle(isDark)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.coupled, flex: 1, minWidth: 0 }}>
          {badge && <span style={badgeStyle(isDark)}>{badge}</span>}
          <span style={labelStyle(isDark)}>{label}</span>
        </div>
      </div>

      {/* Field rows */}
      <div style={fieldRowsStyle}>
        {fieldConfigs.map((config) => (
          <FieldRow
            key={config.key}
            label={config.label}
            options={config.options}
            selected={fieldSelections[config.key] ?? null}
            onSelect={(value) => handleFieldChange(config.key, value)}
            allowOther={config.allowOther}
            theme={theme}
          />
        ))}
      </div>

      {/* Instructions preview */}
      {instructionsLine && (
        <div style={instructionsStyle(isDark)}>
          {instructionsLine.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div style={footerStyle}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearEditMode();
            onCancel();
          }}
          style={{ color: isDark ? 'rgba(255,255,255,0.6)' : colors.fg.neutral.spotReadable }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          shape="rect"
          onClick={handleAdd}
          data-testid="suggestion-edit-add-btn"
        >
          Add with changes
        </Button>
      </div>
    </div>
  );
};

SuggestionEditPanel.displayName = 'SuggestionEditPanel';

// ============================================================================
// Narrative Edit Sub-Panel
// ============================================================================

interface NarrativeEditPanelProps {
  suggestion: Suggestion;
  editableItem: import('../../data/mock-quick-picks').QuickPickItem;
  category: string;
  badge: string | null;
  label: string;
  isDark: boolean;
  theme: 'light' | 'dark';
  onAccept: (suggestionId: string, data: Record<string, unknown>) => void;
  onCancel: () => void;
}

const NarrativeEditPanel: React.FC<NarrativeEditPanelProps> = ({
  suggestion,
  editableItem,
  badge,
  label,
  isDark,
  onAccept,
  onCancel,
}) => {
  const initialText = String(editableItem.data.text ?? '');
  const [text, setText] = useState(initialText);

  const handleAdd = () => {
    onAccept(suggestion.id, { text, format: 'plain' });
  };

  return (
    <div style={containerStyle(isDark)} data-testid="suggestion-edit-panel">
      {/* Header */}
      <div style={headerStyle(isDark)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spaceBetween.coupled, flex: 1, minWidth: 0 }}>
          {badge && <span style={badgeStyle(isDark)}>{badge}</span>}
          <span style={labelStyle(isDark)}>{label}</span>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={textareaStyle(isDark)}
        rows={6}
        data-testid="narrative-edit-textarea"
      />

      {/* Footer actions */}
      <div style={footerStyle}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          style={{ color: isDark ? 'rgba(255,255,255,0.6)' : colors.fg.neutral.spotReadable }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          shape="rect"
          onClick={handleAdd}
          data-testid="suggestion-edit-add-btn"
        >
          Add with changes
        </Button>
      </div>
    </div>
  );
};

NarrativeEditPanel.displayName = 'NarrativeEditPanel';

// ============================================================================
// Styles
// ============================================================================

const containerStyle = (isDark: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spaceBetween.related,
});

const headerStyle = (isDark: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: spaceBetween.repeating,
  paddingBottom: spaceAround.tight,
  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : colors.border.neutral.low}`,
});

const badgeStyle = (isDark: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `2px ${spaceAround.nudge6}px`,
  fontSize: 10,
  fontFamily: typography.fontFamily.sans,
  fontWeight: typography.fontWeight.semibold,
  color: isDark ? 'rgba(255,255,255,0.7)' : colors.fg.accent.primary,
  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : colors.bg.accent.subtle,
  borderRadius: borderRadius.xs,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.5,
  flexShrink: 0,
});

const labelStyle = (isDark: boolean): React.CSSProperties => ({
  fontSize: 14,
  fontFamily: typography.fontFamily.sans,
  fontWeight: typography.fontWeight.medium,
  color: isDark ? colors.fg.neutral.inversePrimary : colors.fg.neutral.primary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const fieldRowsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: spaceBetween.relatedCompact,
  padding: `${spaceAround.compact}px 0`,
};

const instructionsStyle = (isDark: boolean): React.CSSProperties => ({
  fontSize: 13,
  fontFamily: typography.fontFamily.sans,
  color: isDark ? 'rgba(255,255,255,0.5)' : colors.fg.neutral.spotReadable,
  lineHeight: '18px',
  padding: `${spaceAround.tight}px 0`,
});

const textareaStyle = (isDark: boolean): React.CSSProperties => ({
  width: '100%',
  minHeight: 100,
  padding: spaceAround.compact,
  fontSize: 13,
  fontFamily: typography.fontFamily.sans,
  lineHeight: '20px',
  color: isDark ? colors.fg.neutral.inversePrimary : colors.fg.neutral.primary,
  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.bg.neutral.low,
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : colors.border.neutral.low}`,
  borderRadius: borderRadius.sm,
  resize: 'vertical' as const,
  outline: 'none',
  boxSizing: 'border-box' as const,
});

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: spaceBetween.repeating,
  paddingTop: spaceAround.tight,
};
