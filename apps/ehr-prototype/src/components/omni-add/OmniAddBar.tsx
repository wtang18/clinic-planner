/**
 * OmniAddBar Component
 *
 * Primary input mechanism for adding chart items during encounters.
 * Rebuilt to use the tree-based OmniAdd state machine with dual input modes:
 *
 * - Touch mode: progressive disclosure through CategorySelector → QuickPickChips → detail/search
 * - Keyboard mode: CommandPalette with type-to-search, prefix shortcuts, single-key shortcuts
 *
 * State management: `useReducer(omniAddReducer, INITIAL_STATE)` — all navigation,
 * breadcrumbs, batch mode, and undo are driven by the state machine.
 */

import React from 'react';
import { Keyboard, Hand, Repeat, Undo2 } from 'lucide-react';
import type { ChartItem, ItemCategory } from '../../types/chart-items';
import type { QuickPickItem } from '../../data/mock-quick-picks';
import { getQuickPicks, searchCategory } from '../../data/mock-quick-picks';
import {
  omniAddReducer,
  INITIAL_STATE,
  getCategoryMeta,
  type OmniAddState,
  type SelectedItem,
} from './omni-add-machine';
import { colors, spaceAround, spaceBetween, borderRadius, typography, transitions } from '../../styles/foundations';
import { Card } from '../primitives/Card';
import { CategorySelector } from './CategorySelector';
import { QuickPickChips } from './QuickPickChips';
import { QuickAddInput } from './QuickAddInput';
import { ItemDetailForm } from './ItemDetailForm';
import { RxDetailForm } from './form/RxDetailForm';
import { LabDetailForm } from './form/LabDetailForm';
import { DxDetailForm } from './form/DxDetailForm';
import { ImagingDetailForm } from './form/ImagingDetailForm';
import { ProcedureDetailForm } from './form/ProcedureDetailForm';
import { AllergyDetailForm } from './form/AllergyDetailForm';
import { ReferralDetailForm } from './form/ReferralDetailForm';
import { NarrativeInput } from './NarrativeInput';
import { VitalsInput } from './VitalsInput';
import type { VitalsData } from './VitalsInput';
import { OmniAddBreadcrumb } from './OmniAddBreadcrumb';
import { CommandPalette } from './CommandPalette';

// ============================================================================
// Types
// ============================================================================

export interface OmniAddBarProps {
  /** Called when an item is added */
  onItemAdd: (item: Partial<ChartItem>) => void;
  /** Called when undo is requested (parent removes last item) */
  onUndo?: (itemId: string) => void;
  /** Whether the bar is disabled */
  disabled?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Helpers
// ============================================================================

/** Convert a QuickPickItem to the SelectedItem shape used by the state machine */
function toSelectedItem(pick: QuickPickItem): SelectedItem {
  return { id: pick.id, label: pick.label, data: pick.data };
}

/** Build a Partial<ChartItem> from machine state for the onItemAdd callback */
function buildChartItem(
  state: OmniAddState,
  extra?: Record<string, unknown>,
): Partial<ChartItem> {
  return {
    category: state.category!,
    displayText: state.selectedItem?.label || '',
    ...state.selectedItem?.data,
    ...extra,
  } as Partial<ChartItem>;
}

// ============================================================================
// Component
// ============================================================================

export const OmniAddBar: React.FC<OmniAddBarProps> = ({
  onItemAdd,
  onUndo,
  disabled = false,
  style,
}) => {
  const [state, dispatch] = React.useReducer(omniAddReducer, INITIAL_STATE);

  // ── Keyboard shortcuts (Cmd+Z for undo, global when at root) ──

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+Z for undo
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

  // ── Handlers ──

  const handleCategorySelect = (category: ItemCategory) => {
    dispatch({ type: 'SELECT_CATEGORY', category });
  };

  const handleQuickPickSelect = (pick: QuickPickItem) => {
    dispatch({ type: 'SELECT_QUICK_PICK', item: toSelectedItem(pick) });
  };

  const handleSearchResultSelect = (pick: QuickPickItem) => {
    dispatch({ type: 'SELECT_SEARCH_RESULT', item: toSelectedItem(pick) });
  };

  const handleDetailSubmit = (item: Partial<ChartItem>) => {
    dispatch({ type: 'SUBMIT_DETAIL' });
    // Merge machine state data with form data; cast needed because ChartItem is a discriminated union
    const merged = { ...buildChartItem(state), ...item } as Partial<ChartItem>;
    onItemAdd(merged);
    const itemId = `item-${Date.now()}`;
    dispatch({ type: 'ITEM_ADDED', itemId });
  };

  const handleNarrativeSubmit = (text: string) => {
    dispatch({ type: 'SUBMIT_TEXT', text });
    onItemAdd({
      category: state.category!,
      displayText: text,
    });
    const itemId = `item-${Date.now()}`;
    dispatch({ type: 'ITEM_ADDED', itemId });
  };

  const handleVitalsSubmit = (data: VitalsData) => {
    dispatch({ type: 'SUBMIT_DATA_ENTRY' });
    // Format vitals for display
    const parts: string[] = [];
    if (data.systolicBP && data.diastolicBP) parts.push(`BP ${data.systolicBP}/${data.diastolicBP}`);
    if (data.heartRate) parts.push(`HR ${data.heartRate}`);
    if (data.temperature) parts.push(`Temp ${data.temperature}\u00B0F`);
    if (data.spO2) parts.push(`SpO2 ${data.spO2}%`);
    if (data.respiratoryRate) parts.push(`RR ${data.respiratoryRate}`);
    onItemAdd({
      category: 'vitals',
      displayText: parts.join(' \u00B7 ') || 'Vitals',
      ...data,
    } as Partial<ChartItem>);
    const itemId = `item-${Date.now()}`;
    dispatch({ type: 'ITEM_ADDED', itemId });
  };

  const handleBreadcrumbNavigate = (index: number) => {
    dispatch({ type: 'NAVIGATE_TO_BREADCRUMB', index });
  };

  const handleBack = () => {
    dispatch({ type: 'NAVIGATE_BACK' });
  };

  const handleSearchOpen = () => {
    dispatch({ type: 'OPEN_SEARCH' });
  };

  const handleToggleInputMode = () => {
    dispatch({
      type: 'SET_INPUT_MODE',
      mode: state.inputMode === 'touch' ? 'keyboard' : 'touch',
    });
  };

  const handleToggleBatchMode = () => {
    dispatch({ type: 'TOGGLE_BATCH_MODE' });
  };

  // ── Render step-specific content ──

  const renderStepContent = () => {
    // Keyboard mode at root or category level
    if (state.inputMode === 'keyboard' && (state.step === 'root' || state.step === 'quick-pick' || state.step === 'search')) {
      return (
        <CommandPalette
          category={state.category}
          onSelectItem={(pick) => {
            if (state.category) {
              handleSearchResultSelect(pick);
            } else {
              // From root — select category first, then the item
              dispatch({ type: 'SELECT_CATEGORY', category: pick.category });
              // Need a slight delay for state to update, then select the item
              setTimeout(() => {
                dispatch({ type: 'SELECT_QUICK_PICK', item: toSelectedItem(pick) });
              }, 0);
            }
          }}
          onSelectCategory={handleCategorySelect}
          onSubmitText={handleNarrativeSubmit}
          onEscape={handleBack}
          isNarrative={state.variant === 'narrative'}
        />
      );
    }

    switch (state.step) {
      case 'root':
        return (
          <CategorySelector
            onSelect={handleCategorySelect}
            moreExpanded={state.moreExpanded}
            onToggleMore={() => dispatch({ type: 'TOGGLE_MORE' })}
            disabled={disabled}
          />
        );

      case 'quick-pick':
        return (
          <QuickPickChips
            items={getQuickPicks(state.category!)}
            onSelect={handleQuickPickSelect}
            onOpenSearch={handleSearchOpen}
            categoryLabel={getCategoryMeta(state.category!).label}
            disabled={disabled}
          />
        );

      case 'search':
        return (
          <QuickAddInput
            category={state.category!}
            onSelect={(template) => {
              // Convert old QuickAddInput template to our flow
              dispatch({
                type: 'SELECT_SEARCH_RESULT',
                item: {
                  id: `search-${Date.now()}`,
                  label: template.displayText || '',
                  data: template as Record<string, unknown>,
                },
              });
            }}
            onCancel={handleBack}
          />
        );

      case 'detail': {
        const detailData = {
          displayText: state.selectedItem?.label,
          category: state.category!,
          ...state.selectedItem?.data,
        } as Partial<ChartItem>;

        // Route to category-specific form for Rx, Lab, Dx; generic fallback for others
        switch (state.category) {
          case 'medication':
            return <RxDetailForm initialData={detailData} onSubmit={handleDetailSubmit} onCancel={handleBack} />;
          case 'lab':
            return <LabDetailForm initialData={detailData} onSubmit={handleDetailSubmit} onCancel={handleBack} />;
          case 'diagnosis':
            return <DxDetailForm initialData={detailData} onSubmit={handleDetailSubmit} onCancel={handleBack} />;
          case 'imaging':
            return <ImagingDetailForm initialData={detailData} onSubmit={handleDetailSubmit} onCancel={handleBack} />;
          case 'procedure':
            return <ProcedureDetailForm initialData={detailData} onSubmit={handleDetailSubmit} onCancel={handleBack} />;
          case 'allergy':
            return <AllergyDetailForm initialData={detailData} onSubmit={handleDetailSubmit} onCancel={handleBack} />;
          case 'referral':
            return <ReferralDetailForm initialData={detailData} onSubmit={handleDetailSubmit} onCancel={handleBack} />;
          default:
            return (
              <ItemDetailForm
                category={state.category!}
                initialData={detailData}
                onSubmit={handleDetailSubmit}
                onCancel={handleBack}
              />
            );
        }
      }

      case 'text-input':
        return (
          <NarrativeInput
            category={state.category!}
            onSubmit={handleNarrativeSubmit}
            onCancel={handleBack}
          />
        );

      case 'data-entry':
        return (
          <VitalsInput
            onSubmit={handleVitalsSubmit}
            onCancel={handleBack}
          />
        );

      case 'adding':
        return null; // Transient — will immediately transition via ITEM_ADDED

      default:
        return null;
    }
  };

  // ── Styles ──

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    ...style,
  };

  const contentStyle: React.CSSProperties = {
    padding: spaceAround.default,
  };

  const toolbarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spaceAround.compact,
  };

  const toolbarLeftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    flex: 1,
    minWidth: 0,
  };

  const toolbarRightStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  };

  const iconButtonStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    backgroundColor: isActive ? colors.bg.neutral.subtle : 'transparent',
    border: `1px solid ${isActive ? colors.border.neutral.medium : 'transparent'}`,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
    color: isActive ? colors.fg.neutral.primary : colors.fg.neutral.spotReadable,
  });

  const batchBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    padding: `2px ${spaceAround.nudge6}px`,
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.accent.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: borderRadius.full,
  };

  return (
    <div style={containerStyle} data-testid="omni-add-bar">
      <Card variant="elevated" padding="none" data-testid="omni-add-expanded">
        <div style={contentStyle}>
          {/* Toolbar: breadcrumb + mode toggles */}
          <div style={toolbarStyle}>
            <div style={toolbarLeftStyle}>
              <OmniAddBreadcrumb
                segments={state.breadcrumbs}
                onNavigate={handleBreadcrumbNavigate}
              />
              {state.batchMode && (
                <span style={batchBadgeStyle}>
                  <Repeat size={10} />
                  Batch
                </span>
              )}
            </div>

            <div style={toolbarRightStyle}>
              {/* Undo button */}
              {state.undoStack.length > 0 && (
                <button
                  type="button"
                  style={iconButtonStyle(false)}
                  onClick={() => {
                    const lastId = state.undoStack[state.undoStack.length - 1];
                    dispatch({ type: 'UNDO' });
                    onUndo?.(lastId);
                  }}
                  title="Undo last add (Cmd+Z)"
                  data-testid="omni-add-undo"
                >
                  <Undo2 size={14} />
                </button>
              )}

              {/* Batch mode toggle (visible when in a category) */}
              {state.category && (
                <button
                  type="button"
                  style={iconButtonStyle(state.batchMode)}
                  onClick={handleToggleBatchMode}
                  title={state.batchMode ? 'Exit batch mode' : 'Enable batch mode (stay in category after add)'}
                  data-testid="omni-add-batch-toggle"
                >
                  <Repeat size={14} />
                </button>
              )}

              {/* Input mode toggle */}
              <button
                type="button"
                style={iconButtonStyle(false)}
                onClick={handleToggleInputMode}
                title={state.inputMode === 'touch' ? 'Switch to keyboard mode' : 'Switch to touch mode'}
                data-testid="omni-add-mode-toggle"
              >
                {state.inputMode === 'touch' ? <Keyboard size={14} /> : <Hand size={14} />}
              </button>
            </div>
          </div>

          {/* Step content */}
          {renderStepContent()}
        </div>
      </Card>
    </div>
  );
};

OmniAddBar.displayName = 'OmniAddBar';
