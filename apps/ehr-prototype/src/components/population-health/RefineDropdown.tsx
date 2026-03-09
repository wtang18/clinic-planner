/**
 * RefineDropdown Component
 *
 * Batch selection refinement panel for PrioritiesView.
 * Provides quick selections (all REVIEW, all stale) and filter toggles
 * (risk tier, status) to update the checked set in batch mode.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Filter } from 'lucide-react';
import { colors, typography, spaceAround, borderRadius, transitions, glass } from '../../styles/foundations';
import type { PriorityItem } from '../../types/population-health';

// ============================================================================
// Types
// ============================================================================

interface RefineDropdownProps {
  items: PriorityItem[];
  checkedIds: Set<string>;
  onCheckedChange: (ids: Set<string>) => void;
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

type QuickSelection = 'review' | 'stale' | null;
type RiskFilter = 'high' | 'rising' | 'stable' | null;

// ============================================================================
// Component
// ============================================================================

export const RefineDropdown: React.FC<RefineDropdownProps> = ({
  items,
  checkedIds,
  onCheckedChange,
  open,
  onClose,
  onOpen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [quickSelection, setQuickSelection] = useState<QuickSelection>(null);
  const [riskFilter, setRiskFilter] = useState<RiskFilter>(null);
  const [staleOnly, setStaleOnly] = useState(false);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  // Click-outside dismiss
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Apply quick selection
  const applyQuickSelection = useCallback((selection: QuickSelection) => {
    setQuickSelection(selection);
    setRiskFilter(null);
    setStaleOnly(false);
    setFlaggedOnly(false);

    let matching: PriorityItem[];
    if (selection === 'review') {
      matching = items.filter((i) => i.badge === 'REVIEW');
    } else if (selection === 'stale') {
      matching = items.filter((i) => i.isStale);
    } else {
      matching = [];
    }
    onCheckedChange(new Set(matching.map((i) => i.id)));
  }, [items, onCheckedChange]);

  // Apply risk filter
  const applyRiskFilter = useCallback((filter: RiskFilter) => {
    setQuickSelection(null);
    setRiskFilter(filter);

    let filtered = items;
    if (filter) {
      filtered = filtered.filter((i) => i.riskTier === filter);
    }
    if (staleOnly) {
      filtered = filtered.filter((i) => i.isStale);
    }
    onCheckedChange(new Set(filtered.map((i) => i.id)));
  }, [items, staleOnly, onCheckedChange]);

  // Apply status toggle
  const applyStaleToggle = useCallback(() => {
    const newStale = !staleOnly;
    setStaleOnly(newStale);
    setQuickSelection(null);

    let filtered = items;
    if (riskFilter) {
      filtered = filtered.filter((i) => i.riskTier === riskFilter);
    }
    if (newStale) {
      filtered = filtered.filter((i) => i.isStale);
    }
    onCheckedChange(new Set(filtered.map((i) => i.id)));
  }, [items, staleOnly, riskFilter, onCheckedChange]);

  // Compute match count for preview
  const computeMatchCount = useCallback((): number => {
    return checkedIds.size;
  }, [checkedIds]);

  // ---- Styles ----

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };

  const triggerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 28,
    padding: '0 10px',
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    cursor: 'pointer',
    borderRadius: borderRadius.full,
    ...glass.secondary,
    transition: `background ${transitions.fast}`,
  };

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    minWidth: 240,
    ...glass.floatingPanel,
    borderRadius: borderRadius.sm,
    zIndex: 20,
    padding: `${spaceAround.tight}px 0`,
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px 4px`,
  };

  const radioRowStyle = (selected: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: `6px ${spaceAround.compact}px`,
    cursor: 'pointer',
    background: selected ? colors.bg.accent.low : 'transparent',
    transition: `background ${transitions.fast}`,
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  });

  const chipRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 6,
    padding: `6px ${spaceAround.compact}px`,
    flexWrap: 'wrap',
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    padding: '0 10px',
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: active ? colors.fg.accent.primary : colors.fg.neutral.secondary,
    borderRadius: borderRadius.full,
    border: `1px solid ${active ? colors.bg.accent.medium : colors.border.neutral.low}`,
    background: active ? colors.bg.accent.low : 'transparent',
    cursor: 'pointer',
    transition: `all ${transitions.fast}`,
  });

  const dotStyle = (selected: boolean): React.CSSProperties => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: selected ? colors.bg.accent.medium : colors.border.neutral.medium,
    flexShrink: 0,
  });

  const countPreviewStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    padding: `6px ${spaceAround.compact}px 4px`,
    borderTop: `1px solid ${colors.border.neutral.low}`,
    marginTop: 4,
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <button
        style={triggerStyle}
        onClick={() => open ? onClose() : onOpen()}
        data-testid="refine-trigger"
      >
        <Filter size={12} /> Refine
      </button>

      {open && (
        <div style={menuStyle} data-testid="refine-menu">
          {/* Quick selections */}
          <div style={sectionLabelStyle}>Quick selections</div>
          <div
            style={radioRowStyle(quickSelection === 'review')}
            onClick={() => applyQuickSelection('review')}
          >
            <div style={dotStyle(quickSelection === 'review')} />
            All REVIEW items
          </div>
          <div
            style={radioRowStyle(quickSelection === 'stale')}
            onClick={() => applyQuickSelection('stale')}
          >
            <div style={dotStyle(quickSelection === 'stale')} />
            All stale (overdue)
          </div>

          {/* Risk tier */}
          <div style={sectionLabelStyle}>Risk tier</div>
          <div style={chipRowStyle}>
            {(['high', 'rising', 'stable'] as const).map((tier) => (
              <button
                key={tier}
                style={chipStyle(riskFilter === tier)}
                onClick={() => applyRiskFilter(riskFilter === tier ? null : tier)}
              >
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </button>
            ))}
          </div>

          {/* Status */}
          <div style={sectionLabelStyle}>Status</div>
          <div style={chipRowStyle}>
            <button
              style={chipStyle(staleOnly)}
              onClick={applyStaleToggle}
            >
              Stale only
            </button>
          </div>

          {/* Count preview */}
          <div style={countPreviewStyle}>
            {computeMatchCount()} items selected
          </div>
        </div>
      )}
    </div>
  );
};

RefineDropdown.displayName = 'RefineDropdown';
