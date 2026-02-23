/**
 * useFieldEditor — Reusable field editing state machine
 *
 * What: Manages the browse/edit state for field-row-based editing.
 * Why: Extracted from DetailArea.tsx so that AI suggestion editing
 *   (SuggestionEditPanel) can reuse the same field selection, pre-fill,
 *   and data-building logic without duplicating it.
 * When to reuse: Any surface that needs FieldRow-based editing with
 *   CategoryFieldDef configs (OmniAdd depth-2, AI suggestion edit, etc.)
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ItemCategory, ItemIntent } from '../types/chart-items';
import type { QuickPickItem } from '../data/mock-quick-picks';
import type { FieldConfig, CategoryFieldDef } from '../components/omni-add/fields';
import { getFieldDef } from '../components/omni-add/fields';

// ============================================================================
// Types
// ============================================================================

export interface UseFieldEditorOptions {
  category: ItemCategory | null;
  /** The item being edited — QuickPickItem for OmniAdd, mapped Suggestion for AI */
  item: QuickPickItem | null;
  /** NL overrides from text parsing */
  nlOverrides?: Record<string, string> | null;
  /**
   * When true, automatically enters edit mode with defaults when item changes,
   * instead of resetting to browse mode. Use this for panels that are always
   * in edit mode (e.g., SuggestionEditPanel).
   */
  autoEnterEditMode?: boolean;
  /** Intent override for selecting intent-specific field defs (e.g., 'report' for reported meds) */
  intent?: ItemIntent;
}

export interface UseFieldEditorResult {
  editMode: boolean;
  fieldSelections: Record<string, string>;
  fieldConfigs: FieldConfig[];
  fieldDefaults: Record<string, string>;
  fieldDef: CategoryFieldDef | undefined;
  /** Enter edit mode, optionally with pre-filled defaults */
  enterEditMode: (defaults?: Record<string, string>) => void;
  /** Clear edit mode and reset selections */
  clearEditMode: () => void;
  /** Update a single field — auto-enters edit mode on first tap */
  handleFieldChange: (key: string, value: string) => void;
  /** Build chart item data from current selections. Returns null if no fieldDef. */
  buildData: () => Record<string, unknown> | null;
}

// ============================================================================
// Hook
// ============================================================================

export function useFieldEditor({
  category,
  item,
  nlOverrides,
  autoEnterEditMode = false,
  intent,
}: UseFieldEditorOptions): UseFieldEditorResult {
  const [editMode, setEditMode] = useState(false);
  const [fieldSelections, setFieldSelections] = useState<Record<string, string>>({});

  // Get field definition for current category (intent-aware)
  const fieldDef = useMemo(
    () => (category ? getFieldDef(category, intent) : undefined),
    [category, intent],
  );

  // Item-change effect: either auto-enter edit mode or reset
  useEffect(() => {
    if (autoEnterEditMode && item && fieldDef) {
      setEditMode(true);
      setFieldSelections(fieldDef.getDefaults(item));
    } else {
      setEditMode(false);
      setFieldSelections({});
    }
  }, [item, autoEnterEditMode, fieldDef]);

  // Pre-fill fields from NL overrides (fires after reset in same render cycle)
  useEffect(() => {
    if (nlOverrides && item && fieldDef) {
      const defaults = fieldDef.getDefaults(item);
      setEditMode(true);
      setFieldSelections({ ...defaults, ...nlOverrides });
    }
  }, [nlOverrides, item, fieldDef]);

  // Field configs and defaults for the current item
  const fieldConfigs = useMemo(
    () => (fieldDef && item ? fieldDef.getFields(item) : []),
    [fieldDef, item],
  );

  const fieldDefaults = useMemo(
    () => (fieldDef && item ? fieldDef.getDefaults(item) : {}),
    [fieldDef, item],
  );

  // Enter edit mode with optional pre-filled defaults
  const enterEditMode = useCallback((defaults?: Record<string, string>) => {
    if (fieldDef && item) {
      setEditMode(true);
      setFieldSelections(defaults ?? fieldDef.getDefaults(item));
    }
  }, [fieldDef, item]);

  // Clear edit mode
  const clearEditMode = useCallback(() => {
    setEditMode(false);
    setFieldSelections({});
  }, []);

  // Handle field selection change — auto-enter edit mode on first tap
  const handleFieldChange = useCallback((key: string, value: string) => {
    setEditMode(prev => {
      if (!prev) {
        // First tap: only set the tapped field — leave others empty
        setFieldSelections({ [key]: value });
      } else {
        setFieldSelections(s => ({ ...s, [key]: value }));
      }
      return true;
    });
  }, []);

  // Build chart item data from current selections
  const buildData = useCallback((): Record<string, unknown> | null => {
    if (!item || !fieldDef) return null;
    return fieldDef.buildData(fieldSelections, item);
  }, [item, fieldDef, fieldSelections]);

  return {
    editMode,
    fieldSelections,
    fieldConfigs,
    fieldDefaults,
    fieldDef,
    enterEditMode,
    clearEditMode,
    handleFieldChange,
    buildData,
  };
}
