/**
 * OmniAddBarV2 — Unified Omni-Input Orchestrator
 *
 * Replaces the dual-mode OmniAddBar with a single unified input.
 * Wires together OmniInput + DetailArea + recognition pipeline.
 *
 * Touch and keyboard are first-class on the same surface:
 * - Tap category pills or type a prefix ("rx:") to commit a category
 * - Tap item pills or type an item name to commit an item
 * - Suggestion cards with [Add][Edit] at every depth
 *
 * Coexists alongside old OmniAddBar during Phase 1 (opt-in via CaptureView).
 */

import React, { useReducer, useCallback, useEffect, useMemo, useRef } from 'react';
import type { ChartItem, ItemCategory, ItemIntent } from '../../types/chart-items';
import type { QuickPickItem } from '../../data/mock-quick-picks';
import {
  omniInputReducer,
  OMNI_INPUT_INITIAL,
  getDepth,
  getActiveCategory,
  getActiveVariant,
  makeCategoryPill,
  makeItemPill,
} from './omni-input-machine';
import { recognize, parseNLParams, type RecognizedAmbiguous } from '../../services/input-recognizer';
import { CATEGORIES } from './omni-add-machine';
import { OmniInput } from './OmniInput';
import { DetailArea } from './DetailArea';
import { NarrativeInput } from './NarrativeInput';
import { VitalsInput } from './VitalsInput';
import type { VitalsData } from './VitalsInput';
import { Card } from '../primitives/Card';
import { useOmniSectionNav } from './useOmniSectionNav';
import { spaceAround, spaceBetween } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface OmniAddBarV2Props {
  /** Called when an item is added */
  onItemAdd: (item: Partial<ChartItem>) => void;
  /** Called when undo is requested */
  onUndo?: (itemId: string) => void;
  /** Whether the bar is disabled */
  disabled?: boolean;
  /** Pre-select a category on mount (for scoped add from ReviewView) */
  initialCategory?: ItemCategory;
}

// ============================================================================
// Component
// ============================================================================

export const OmniAddBarV2: React.FC<OmniAddBarV2Props> = ({
  onItemAdd,
  onUndo,
  disabled = false,
  initialCategory,
}) => {
  const { containerRef, handleKeyDown: handleSectionNav } = useOmniSectionNav();
  const [state, dispatch] = useReducer(omniInputReducer, OMNI_INPUT_INITIAL);
  const depth = getDepth(state);
  const category = getActiveCategory(state);
  const variant = getActiveVariant(state);
  const activeIntent: ItemIntent | undefined = state.pills.find(p => p.type === 'category')?.intent;

  // Track the selected QuickPickItem for depth 2 suggestion card
  const [selectedPickItem, setSelectedPickItem] = React.useState<QuickPickItem | null>(null);

  // NL-parsed field overrides (e.g., "500mg TID" → { dosage: '500mg', frequency: 'TID' })
  const [nlOverrides, setNlOverrides] = React.useState<Record<string, string> | null>(null);

  // Ref for edit-mode add handler (set by DetailArea when in edit mode)
  const keyboardAddRef = useRef<(() => void) | null>(null);

  // Pre-select category on mount
  useEffect(() => {
    if (initialCategory) {
      dispatch({ type: 'INSERT_PILL', pill: makeCategoryPill(initialCategory) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Recognition pipeline: process text input ──

  const recognition = useMemo(() => {
    if (!state.text || depth > 0) return null;
    return recognize(state.text);
  }, [state.text, depth]);

  // Auto-commit prefix-detected categories
  useEffect(() => {
    if (recognition?.kind === 'prefix') {
      dispatch({ type: 'INSERT_PILL', pill: makeCategoryPill(recognition.category, recognition.intent) });
      if (recognition.query) {
        dispatch({ type: 'SET_TEXT', text: recognition.query });
      }
    }
  }, [recognition]);

  // Ambiguous groups for the detail area
  const ambiguousGroups = useMemo(() => {
    if (recognition?.kind === 'ambiguous') {
      return (recognition as RecognizedAmbiguous).groups;
    }
    return undefined;
  }, [recognition]);

  // ── Keyboard shortcut: Cmd+Z for undo ──

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && state.undoStack.length > 0) {
        e.preventDefault();
        const lastId = state.undoStack[state.undoStack.length - 1];
        dispatch({ type: 'UNDO' });
        onUndo?.(lastId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.undoStack, onUndo]);

  // ── Keyboard shortcut: / to focus omni-input from anywhere ──

  useEffect(() => {
    const handleSlashFocus = (e: KeyboardEvent) => {
      if (e.key !== '/') return;
      const el = document.activeElement;
      const isInInput = el instanceof HTMLInputElement
        || el instanceof HTMLTextAreaElement
        || (el as HTMLElement)?.isContentEditable;
      if (isInInput) return;

      e.preventDefault();
      containerRef.current
        ?.querySelector<HTMLInputElement>('[data-testid="omni-input-field"]')
        ?.focus();
    };
    window.addEventListener('keydown', handleSlashFocus);
    return () => window.removeEventListener('keydown', handleSlashFocus);
  }, []);

  // ── Handlers ──

  const handleTextChange = useCallback((text: string) => {
    dispatch({ type: 'SET_TEXT', text });
  }, []);

  const handleBackspace = useCallback(() => {
    dispatch({ type: 'DELETE_PILL' });
    setSelectedPickItem(null);
    setNlOverrides(null);
  }, []);

  const handlePillClick = useCallback((index: number) => {
    dispatch({ type: 'TRUNCATE_TO_PILL', index });
    setSelectedPickItem(null);
    setNlOverrides(null);
  }, []);

  const handleClear = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
    setSelectedPickItem(null);
    setNlOverrides(null);
  }, []);

  const handleSpace = useCallback(() => {
    // Try recognition result first
    if (recognition?.kind === 'auto-category') {
      const parsedOverrides = parseNLParams(recognition.category, state.text);
      dispatch({ type: 'INSERT_PILL', pill: makeCategoryPill(recognition.category) });
      if (recognition.bestMatch) {
        // Strong match: commit category + item in one action (jump to depth 2)
        // Uses setTimeout to dispatch after category pill is committed (same as handleItemSelect)
        const match = recognition.bestMatch;
        setTimeout(() => {
          dispatch({ type: 'INSERT_PILL', pill: makeItemPill(match.chipLabel, match.category) });
          setSelectedPickItem(match);
          setNlOverrides(parsedOverrides);
        }, 0);
      } else {
        // No strong match: carry the typed text forward so user sees filtered results at depth 1
        dispatch({ type: 'SET_TEXT', text: state.text.trim() });
      }
      return;
    }
    // Try matching typed text against category labels/prefixes
    const typed = state.text.trim().toLowerCase();
    const match = CATEGORIES.find(
      c => c.label.toLowerCase() === typed
        || c.category === typed
        || c.prefix?.replace(':', '') === typed,
    );
    if (match) {
      dispatch({ type: 'INSERT_PILL', pill: makeCategoryPill(match.category) });
    }
  }, [recognition, state.text]);

  const handleCategorySelect = useCallback((cat: ItemCategory) => {
    dispatch({ type: 'INSERT_PILL', pill: makeCategoryPill(cat) });
  }, []);

  const handleItemSelect = useCallback((item: QuickPickItem) => {
    if (depth === 0) {
      // From ambiguous results: commit category + item in one action
      dispatch({ type: 'INSERT_PILL', pill: makeCategoryPill(item.category) });
      // Need to dispatch item pill in next tick after category is committed
      setTimeout(() => {
        dispatch({ type: 'INSERT_PILL', pill: makeItemPill(item.chipLabel, item.category) });
        setSelectedPickItem(item);
      }, 0);
    } else {
      dispatch({ type: 'INSERT_PILL', pill: makeItemPill(item.chipLabel, item.category) });
      setSelectedPickItem(item);
    }
  }, [depth]);

  /** Build a Partial<ChartItem> from a QuickPickItem with nested data */
  const buildItemFromPick = useCallback((item: QuickPickItem): Partial<ChartItem> => {
    return {
      category: item.category,
      displayText: item.label,
      data: item.data,
      ...(activeIntent ? { intent: activeIntent } : {}),
    } as Partial<ChartItem>;
  }, [activeIntent]);

  const handleItemAdd = useCallback((item: QuickPickItem) => {
    onItemAdd(buildItemFromPick(item));
    const itemId = `item-${Date.now()}`;
    dispatch({ type: 'ITEM_ADDED', itemId });
    setSelectedPickItem(null);
    setNlOverrides(null);
  }, [onItemAdd, buildItemFromPick]);

  const handleItemEdit = useCallback((item: QuickPickItem) => {
    // Fallback for categories without field defs: same as selecting (opens depth 2)
    if (depth < 2) {
      handleItemSelect(item);
    }
  }, [depth, handleItemSelect]);

  /** Add with custom field data from field row editing */
  const handleItemAddWithFields = useCallback((item: QuickPickItem, data: Record<string, unknown>) => {
    onItemAdd({
      category: item.category,
      displayText: item.label,
      data,
      ...(activeIntent ? { intent: activeIntent } : {}),
    } as Partial<ChartItem>);
    const itemId = `item-${Date.now()}`;
    dispatch({ type: 'ITEM_ADDED', itemId });
    setSelectedPickItem(null);
    setNlOverrides(null);
  }, [onItemAdd, activeIntent]);

  const handleNarrativeSubmit = useCallback((text: string) => {
    onItemAdd({
      category: category!,
      displayText: text,
      data: {
        text,
        format: 'plain',
      },
    } as Partial<ChartItem>);
    const itemId = `item-${Date.now()}`;
    dispatch({ type: 'ITEM_ADDED', itemId });
  }, [category, onItemAdd]);

  const handleVitalsSubmit = useCallback((vitalsData: VitalsData) => {
    const parts: string[] = [];
    if (vitalsData.systolicBP && vitalsData.diastolicBP) parts.push(`BP ${vitalsData.systolicBP}/${vitalsData.diastolicBP}`);
    if (vitalsData.heartRate) parts.push(`HR ${vitalsData.heartRate}`);
    if (vitalsData.temperature) parts.push(`Temp ${vitalsData.temperature}\u00B0F`);
    if (vitalsData.spO2) parts.push(`SpO2 ${vitalsData.spO2}%`);
    if (vitalsData.respiratoryRate) parts.push(`RR ${vitalsData.respiratoryRate}`);
    onItemAdd({
      category: 'vitals',
      displayText: parts.join(' \u00B7 ') || 'Vitals',
      data: {
        measurements: [],
        capturedAt: new Date(),
        ...vitalsData,
      },
    } as Partial<ChartItem>);
    const itemId = `item-${Date.now()}`;
    dispatch({ type: 'ITEM_ADDED', itemId });
  }, [onItemAdd]);

  // ── Container keydown: section nav + ⌘↩ to add ──

  const handleContainerKeyDown = useCallback((e: React.KeyboardEvent) => {
    handleSectionNav(e);

    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && depth >= 2 && selectedPickItem) {
      e.preventDefault();
      if (keyboardAddRef.current) {
        keyboardAddRef.current();
      } else {
        handleItemAdd(selectedPickItem);
      }
    }
  }, [handleSectionNav, depth, selectedPickItem, handleItemAdd]);

  const handleToggleBatch = useCallback(() => {
    dispatch({ type: 'TOGGLE_BATCH' });
  }, []);

  const handleNavigateBack = useCallback(() => {
    dispatch({ type: 'DELETE_PILL' });
    setSelectedPickItem(null);
  }, []);

  // ── Render ──

  const showNarrative = depth === 1 && variant === 'narrative';
  const showVitals = depth === 1 && variant === 'data-entry';

  return (
    <div ref={containerRef} onKeyDown={handleContainerKeyDown} data-testid="omni-add-bar-v2">
      <Card variant="outlined" padding="none">
        <div style={styles.content}>
          {/* Omni Input */}
          <OmniInput
            pills={state.pills}
            text={state.text}
            onTextChange={handleTextChange}
            onBackspace={handleBackspace}
            onPillClick={handlePillClick}
            onClear={handleClear}
            onSpace={handleSpace}
            disabled={disabled}
          />

          {/* Detail Area */}
          {!showNarrative && !showVitals && (
            <DetailArea
              depth={depth}
              category={category}
              intent={activeIntent}
              text={state.text}
              selectedItem={selectedPickItem}
              ambiguousGroups={ambiguousGroups}
              nlOverrides={nlOverrides}
              onCategorySelect={handleCategorySelect}
              onItemSelect={handleItemSelect}
              onItemAdd={handleItemAdd}
              onItemEdit={handleItemEdit}
              onItemAddWithFields={handleItemAddWithFields}
              keyboardAddRef={keyboardAddRef}
            />
          )}

          {/* Narrative input (depth 1, narrative variant) */}
          {showNarrative && (
            <NarrativeInput
              category={category!}
              onSubmit={handleNarrativeSubmit}
              onCancel={handleNavigateBack}
            />
          )}

          {/* Vitals input (depth 1, data-entry variant) */}
          {showVitals && (
            <VitalsInput
              onSubmit={handleVitalsSubmit}
              onCancel={handleNavigateBack}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

OmniAddBarV2.displayName = 'OmniAddBarV2';

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: spaceBetween.related,
    padding: spaceAround.default,
  },
};
