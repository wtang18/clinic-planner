/**
 * DetailArea — Depth-adaptive container
 *
 * Renders different content based on the current depth (pill count):
 * - Depth 0 (root): CategoryPills — pick a category
 * - Depth 1 (category): ItemPills + SuggestionCards — pick an item
 * - Depth 2 (item): FieldRows + SuggestionCard (browse/edit mode)
 *
 * Depth 2 browse/edit pattern:
 *   Browse: field rows unselected + suggestion card with [Edit][Add]
 *   Edit:   field rows pre-selected + [Clear][Add] action bar
 *
 * For narrative/vitals categories, depth 1 shows the appropriate input
 * instead of item pills (handled by parent OmniAddBarV2).
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { ItemCategory } from '../../types/chart-items';
import type { QuickPickItem } from '../../data/mock-quick-picks';
import { getQuickPicks } from '../../data/mock-quick-picks';
import { getCategoryVariant } from './omni-add-machine';
import { CategoryPills } from './CategoryPills';
import { ItemPills } from './ItemPills';
import { SuggestionCard, buildSummary } from './SuggestionCard';
import { FieldRow } from './FieldRow';
import { getFieldDef } from './fields';
import { generateSig, calculateQuantity } from './form/rx-helpers';
import { searchInCategory } from '../../services/input-recognizer';
import { Button } from '../primitives/Button';
import { spaceBetween, spaceAround, typography, colors } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface DetailAreaProps {
  depth: number;
  category: ItemCategory | null;
  text: string;
  /** The selected QuickPickItem at depth 2 */
  selectedItem: QuickPickItem | null;
  /** Grouped results from ambiguity grouping */
  ambiguousGroups?: { category: ItemCategory; label: string; items: QuickPickItem[] }[];
  onCategorySelect: (category: ItemCategory) => void;
  onItemSelect: (item: QuickPickItem) => void;
  /** Quick-add: accepts item with defaults */
  onItemAdd: (item: QuickPickItem) => void;
  /** Edit: opens field editing at depth 2 */
  onItemEdit: (item: QuickPickItem) => void;
  /** Add with custom field data (from field row editing) */
  onItemAddWithFields?: (item: QuickPickItem, data: Record<string, unknown>) => void;
  /** For narrative categories */
  onNarrativeSubmit?: (text: string) => void;
  /** For vitals */
  onVitalsSubmit?: (data: any) => void;
  onCancel?: () => void;
  /** NL-parsed field overrides to pre-fill on auto-categorization */
  nlOverrides?: Record<string, string> | null;
  /** Ref for keyboard add handler (⌘↩) — set by DetailArea when in edit mode */
  keyboardAddRef?: React.MutableRefObject<(() => void) | null>;
}

// ============================================================================
// Instructions line builder
// ============================================================================

function buildInstructionsLine(
  category: ItemCategory,
  selectedItem: QuickPickItem,
  fieldSelections: Record<string, string>,
): string {
  if (category === 'medication') {
    const dosage = fieldSelections.dosage || '';
    const route = fieldSelections.route || '';
    const frequency = fieldSelections.frequency || '';
    const duration = fieldSelections.duration || '';
    const sig = generateSig(dosage, route, frequency);
    const qty = calculateQuantity(frequency, duration);
    const refills = Number(fieldSelections.refills ?? selectedItem.data.refills) || 0;
    const parts: string[] = [];
    if (sig) parts.push(`Sig: ${sig}`);
    const meta: string[] = [];
    if (qty !== null) meta.push(`Qty: ${qty}`);
    meta.push(`Refills: ${refills}`);
    if (duration) meta.push(`Duration: ${duration}`);
    if (meta.length > 0) parts.push(meta.join(' \u00B7 '));
    return parts.join('\n');
  }

  // Non-Rx: overlay fieldSelections onto item.data and use buildSummary
  const merged: QuickPickItem = {
    ...selectedItem,
    data: { ...selectedItem.data, ...fieldSelections },
  };
  return buildSummary(merged);
}

// ============================================================================
// Component
// ============================================================================

export const DetailArea: React.FC<DetailAreaProps> = ({
  depth,
  category,
  text,
  selectedItem,
  ambiguousGroups,
  onCategorySelect,
  onItemSelect,
  onItemAdd,
  onItemEdit,
  onItemAddWithFields,
  nlOverrides,
  keyboardAddRef,
}) => {
  // ── Depth 2 browse/edit state ──
  const [editMode, setEditMode] = useState(false);
  const [fieldSelections, setFieldSelections] = useState<Record<string, string>>({});

  // Reset edit mode when selected item changes
  React.useEffect(() => {
    setEditMode(false);
    setFieldSelections({});
  }, [selectedItem]);

  // Get field definition for current category
  const fieldDef = useMemo(
    () => (category ? getFieldDef(category) : undefined),
    [category],
  );

  // Pre-fill fields from NL overrides (fires after reset effect in same render cycle)
  React.useEffect(() => {
    if (nlOverrides && selectedItem && fieldDef) {
      const defaults = fieldDef.getDefaults(selectedItem);
      setEditMode(true);
      setFieldSelections({ ...defaults, ...nlOverrides });
    }
  }, [nlOverrides, selectedItem, fieldDef]);

  // Get field configs and defaults for selected item
  const fieldConfigs = useMemo(
    () => (fieldDef && selectedItem ? fieldDef.getFields(selectedItem) : []),
    [fieldDef, selectedItem],
  );

  const fieldDefaults = useMemo(
    () => (fieldDef && selectedItem ? fieldDef.getDefaults(selectedItem) : {}),
    [fieldDef, selectedItem],
  );

  // Handle [Edit] on suggestion card → enter edit mode with pre-selected defaults
  const handleEditClick = useCallback((item: QuickPickItem) => {
    if (fieldDef) {
      setEditMode(true);
      setFieldSelections(fieldDef.getDefaults(item));
    } else {
      // No field config for this category — delegate to parent
      onItemEdit(item);
    }
  }, [fieldDef, onItemEdit]);

  // Handle [Clear] → reset to browse mode
  const handleClear = useCallback(() => {
    setEditMode(false);
    setFieldSelections({});
  }, []);

  // Handle field selection change — auto-enter edit mode on first tap
  const handleFieldChange = useCallback((key: string, value: string) => {
    setEditMode(prev => {
      if (!prev) {
        // First tap: only set the tapped field — leave others empty until user taps them
        setFieldSelections({ [key]: value });
      } else {
        setFieldSelections(s => ({ ...s, [key]: value }));
      }
      return true;
    });
  }, []);

  // Live instructions line for edit mode
  const instructionsLine = useMemo(() => {
    if (!editMode || !selectedItem || !category) return '';
    return buildInstructionsLine(category, selectedItem, fieldSelections);
  }, [editMode, selectedItem, category, fieldSelections]);

  // Handle [Add] from edit mode → build data from selections
  const handleEditAdd = useCallback(() => {
    if (!selectedItem || !fieldDef) return;
    const data = fieldDef.buildData(fieldSelections, selectedItem);
    onItemAddWithFields?.(selectedItem, data);
  }, [selectedItem, fieldDef, fieldSelections, onItemAddWithFields]);

  // Register edit-mode add handler for ⌘↩ shortcut
  useEffect(() => {
    if (keyboardAddRef) {
      keyboardAddRef.current = editMode ? handleEditAdd : null;
    }
    return () => { if (keyboardAddRef) keyboardAddRef.current = null; };
  }, [editMode, handleEditAdd, keyboardAddRef]);

  // ── Depth 0: Root — show category pills ──

  if (depth === 0) {
    if (ambiguousGroups && ambiguousGroups.length > 0) {
      return (
        <div style={styles.container} data-testid="detail-area-ambiguous">
          {ambiguousGroups.map((group) => (
            <div key={group.category} style={styles.group}>
              <span style={styles.groupLabel}>{group.label}</span>
              <ItemPills
                items={group.items}
                onSelect={onItemSelect}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={styles.container} data-testid="detail-area-root">
        <CategoryPills onSelect={onCategorySelect} />
      </div>
    );
  }

  // ── Depth 1: Category committed — show item pills ──

  if (depth === 1 && category) {
    const variant = getCategoryVariant(category);

    // Narrative/data-entry at depth 1: handled by parent (OmniAddBarV2)
    if (variant !== 'structured') {
      return null;
    }

    const items = text.length >= 1
      ? searchInCategory(category, text)
      : getQuickPicks(category);

    return (
      <div style={styles.container} data-testid="detail-area-category">
        <ItemPills items={items} onSelect={onItemSelect} />
        {!text && items.slice(0, 3).map((item) => (
          <SuggestionCard
            key={item.id}
            item={item}
            onAdd={onItemAdd}
            onEdit={handleEditClick}
          />
        ))}
      </div>
    );
  }

  // ── Depth 2: Item committed — field rows + suggestion card ──

  if (depth === 2 && selectedItem) {
    const hasFields = fieldConfigs.length > 0;

    return (
      <div style={styles.container} data-testid="detail-area-item">
        {/* Field rows */}
        {hasFields && (
          <div style={styles.fieldRows} data-testid="detail-area-fields">
            {fieldConfigs.map((config) => (
              <FieldRow
                key={config.key}
                label={config.label}
                options={config.options}
                selected={editMode ? (fieldSelections[config.key] ?? null) : null}
                onSelect={(value) => handleFieldChange(config.key, value)}
                allowOther={config.allowOther}
              />
            ))}
          </div>
        )}

        {/* Browse mode: suggestion card with [Edit][Add] */}
        {!editMode && (
          <SuggestionCard
            item={selectedItem}
            onAdd={onItemAdd}
            onEdit={handleEditClick}
            showShortcutHint
          />
        )}

        {/* Edit mode: instructions line + [Clear][Add] action bar */}
        {editMode && instructionsLine && (
          <div style={styles.instructionsLine} data-testid="instructions-line">
            {instructionsLine.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}
        {editMode && (
          <div style={styles.editActions} data-testid="detail-area-edit-actions" data-omni-section>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              data-testid="field-clear-btn"
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleEditAdd}
              data-testid="field-add-btn"
            >
              Add <span style={{ opacity: 0.7, marginLeft: 4, fontSize: 11 }}>⌘↩</span>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

DetailArea.displayName = 'DetailArea';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.coupled,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  fieldRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.relatedCompact,
    padding: `${spaceAround.compact}px 0`,
  },
  instructionsLine: {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    lineHeight: '20px',
    padding: `${spaceAround.compact}px 0`,
  },
  editActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spaceBetween.repeating,
    paddingTop: spaceAround.compact,
  },
};
