/**
 * SelectDropdown Component
 *
 * A selection control that shows the current value on a compact trigger button
 * and opens a menu to change it. Supports description subtitles and right-aligned
 * badges per item with a selected indicator.
 *
 * Different from DropdownMenu (action menu) — this is a value-selection control.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { colors, typography, spaceAround, borderRadius, transitions, glass } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface SelectDropdownItem<T extends string> {
  key: T;
  label: string;
  description?: string;
  badge?: React.ReactNode;
}

export interface SelectDropdownProps<T extends string> {
  value: T;
  items: SelectDropdownItem<T>[];
  onChange: (key: T) => void;
  /** Render function for trigger label. Receives the selected item. Default: item.label + chevron */
  renderTrigger?: (selectedItem: SelectDropdownItem<T>) => React.ReactNode;
  position?: 'bottom-left' | 'bottom-right';
  minWidth?: number;
  testID?: string;
}

// ============================================================================
// Component
// ============================================================================

export function SelectDropdown<T extends string>({
  value,
  items,
  onChange,
  renderTrigger,
  position = 'bottom-left',
  minWidth = 180,
  testID,
}: SelectDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click-outside dismiss
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const selectedItem = items.find((i) => i.key === value) ?? items[0];

  const handleSelect = useCallback((key: T) => {
    onChange(key);
    setOpen(false);
  }, [onChange]);

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
    whiteSpace: 'nowrap',
  };

  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-left': { top: '100%', left: 0 },
    'bottom-right': { top: '100%', right: 0 },
  };

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    ...positionStyles[position],
    marginTop: 4,
    minWidth,
    ...glass.floatingPanel,
    borderRadius: borderRadius.sm,
    zIndex: 20,
    overflow: 'hidden',
    padding: '4px 0',
  };

  return (
    <div ref={containerRef} style={containerStyle} data-testid={testID}>
      <button
        style={triggerStyle}
        onClick={() => setOpen(!open)}
        data-testid={testID ? `${testID}-trigger` : undefined}
      >
        {renderTrigger ? renderTrigger(selectedItem) : (
          <>
            {selectedItem.label}
            <ChevronDown size={12} />
          </>
        )}
        {!renderTrigger && null}
      </button>

      {open && (
        <div style={menuStyle} data-testid={testID ? `${testID}-menu` : undefined}>
          {items.map((item) => (
            <SelectDropdownRow
              key={item.key}
              item={item}
              selected={item.key === value}
              onSelect={() => handleSelect(item.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Row Sub-component
// ============================================================================

function SelectDropdownRow<T extends string>({
  item,
  selected,
  onSelect,
}: {
  item: SelectDropdownItem<T>;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
    cursor: 'pointer',
    background: hovered ? colors.bg.neutral.subtle : 'transparent',
    transition: `background ${transitions.fast}`,
  };

  const dotStyle: React.CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: selected ? colors.bg.accent.medium : 'transparent',
    flexShrink: 0,
    marginTop: 5,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: selected ? typography.fontWeight.semibold : typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
  };

  const descStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    marginTop: 1,
  };

  const badgeStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    flexShrink: 0,
    marginTop: 1,
  };

  return (
    <div
      style={rowStyle}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={dotStyle} />
      <div style={contentStyle}>
        <div style={labelStyle}>{item.label}</div>
        {item.description && <div style={descStyle}>{item.description}</div>}
      </div>
      {item.badge != null && <div style={badgeStyle}>{item.badge}</div>}
    </div>
  );
}

SelectDropdown.displayName = 'SelectDropdown';
