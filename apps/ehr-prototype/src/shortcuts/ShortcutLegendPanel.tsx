/**
 * ShortcutLegendPanel Component
 *
 * Bottom-docked, Figma-style legend panel with grouped columns.
 * Features:
 * - 3 tabs: Navigate / Panes / Encounter
 * - Grouped columns with uppercase headers
 * - Highlight-on-fire: rows flash when their shortcut is pressed
 * - "Tried" tracking with checkmarks
 * - Push-up behavior via CSS custom property
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import { Check } from 'lucide-react';
import { shortcutManager } from './ShortcutManager';
import { buildLegendEntries } from './legendData';
import { getTriedShortcuts, markShortcutTried } from './shortcutProgress';
import {
  colors,
  spaceAround,
  borderRadius,
  glass,
  zIndex as zIndexTokens,
  transitions,
  typography,
} from '../styles/foundations';
import type { LegendTab } from './ShortcutManager';
import type { LegendEntry } from './legendData';

// ============================================================================
// Constants
// ============================================================================

const PANEL_HEIGHT = 220;
const TABS: { id: LegendTab; label: string }[] = [
  { id: 'navigate', label: 'Navigate' },
  { id: 'panes', label: 'Panes' },
  { id: 'charting', label: 'Encounter' },
];

// ============================================================================
// Types
// ============================================================================

interface ShortcutLegendPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const ShortcutLegendPanel: React.FC<ShortcutLegendPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegendTab>('navigate');
  const [triedSet, setTriedSet] = useState<Set<string>>(getTriedShortcuts);
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMac =
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const entries = useMemo(() => buildLegendEntries(isMac), [isMac, isOpen]);

  const tabEntries = useMemo(
    () => entries.filter((e) => e.tab === activeTab),
    [entries, activeTab],
  );

  // Group entries by their group label, preserving order
  const groupedEntries = useMemo(() => {
    const groups: { label: string; entries: LegendEntry[] }[] = [];
    const seen = new Map<string, number>();

    for (const entry of tabEntries) {
      const idx = seen.get(entry.group);
      if (idx !== undefined) {
        groups[idx].entries.push(entry);
      } else {
        seen.set(entry.group, groups.length);
        groups.push({ label: entry.group, entries: [entry] });
      }
    }

    return groups;
  }, [tabEntries]);

  // Subscribe to shortcut events for highlight-on-fire + tried tracking
  useEffect(() => {
    if (!isOpen) return;

    const unsub = shortcutManager.subscribe((event) => {
      const id = event.shortcutId;
      if (!id) return;
      if (event.type !== 'fired' && event.type !== 'chord-complete') return;

      // Mark as tried — also mark consolidated nav-workspace for workspace chords
      const triedId = id.startsWith('nav-workspace-') ? 'nav-workspace' : id;
      markShortcutTried(triedId);
      setTriedSet((prev) => {
        if (prev.has(triedId)) return prev;
        const next = new Set(prev);
        next.add(triedId);
        return next;
      });

      // Flash the row
      setFlashId(triedId);
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
      flashTimeout.current = setTimeout(() => setFlashId(null), 800);
    });

    return () => {
      unsub();
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, [isOpen]);

  // Set CSS custom property for push-up behavior
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(
      '--legend-panel-height',
      isOpen ? `${PANEL_HEIGHT}px` : '0px',
    );
    return () => {
      document.documentElement.style.setProperty('--legend-panel-height', '0px');
    };
  }, [isOpen]);

  // Close on Escape (capture phase — checked before other Escape handlers)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={panelStyle} data-testid="shortcut-legend-panel">
      {/* Tab bar */}
      <div style={headerStyle}>
        <div style={tabBarStyle}>
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* Grouped columns */}
      <div style={columnsContainerStyle}>
        {groupedEntries.map((group) => (
          <div key={group.label} style={columnStyle}>
            <div style={groupHeaderStyle}>{group.label.toUpperCase()}</div>
            {group.entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                tried={triedSet.has(entry.id)}
                flashing={flashId === entry.id}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

ShortcutLegendPanel.displayName = 'ShortcutLegendPanel';

// ============================================================================
// Sub-components
// ============================================================================

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => {
  const style: React.CSSProperties = {
    padding: '4px 12px',
    border: 'none',
    borderRadius: borderRadius.sm,
    backgroundColor: active ? colors.bg.neutral.subtle : 'transparent',
    color: active ? colors.fg.neutral.primary : colors.fg.neutral.spotReadable,
    fontSize: 12,
    fontWeight: active
      ? (typography.fontWeight.semibold as React.CSSProperties['fontWeight'])
      : (typography.fontWeight.medium as React.CSSProperties['fontWeight']),
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    cursor: 'pointer',
    transition: `background-color ${transitions.fast}`,
  };
  return (
    <button type="button" style={style} onClick={onClick}>
      {label}
    </button>
  );
};

const EntryRow: React.FC<{
  entry: LegendEntry;
  tried: boolean;
  flashing: boolean;
}> = ({ entry, tried, flashing }) => {
  const rowStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
    backgroundColor: flashing ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
    borderRadius: borderRadius.xs,
    transition: `background-color 200ms ease`,
  };

  const checkStyle: React.CSSProperties = {
    position: 'absolute',
    left: -14,
    top: '50%',
    transform: 'translateY(-50%)',
  };

  const descStyle: React.CSSProperties = {
    fontSize: 13,
    color: tried ? colors.fg.neutral.primary : colors.fg.neutral.secondary,
  };

  const badgeStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.fg.neutral.spotReadable,
    backgroundColor: colors.bg.neutral.subtle,
    padding: '1px 6px',
    borderRadius: borderRadius.xs,
    whiteSpace: 'nowrap',
  };

  return (
    <div style={rowStyle}>
      {tried && (
        <span style={checkStyle}>
          <Check size={10} color={colors.fg.positive.primary} strokeWidth={3} />
        </span>
      )}
      <span style={descStyle}>{entry.description}</span>
      <span style={badgeStyle}>{entry.displayKey}</span>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: PANEL_HEIGHT,
  ...glass.floatingPanel,
  borderRadius: 0,
  borderTop: `1px solid ${colors.border.neutral.low}`,
  borderBottom: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  zIndex: zIndexTokens.popover,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: `${spaceAround.tight}px ${spaceAround.default}px`,
  flexShrink: 0,
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
};

const columnsContainerStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: `${spaceAround.tight}px ${spaceAround.default}px ${spaceAround.compact}px`,
  display: 'flex',
  justifyContent: 'center',
  gap: 52,
};

const columnStyle: React.CSSProperties = {
  minWidth: 260,
  display: 'flex',
  flexDirection: 'column',
};

const groupHeaderStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: typography.fontWeight.semibold as React.CSSProperties['fontWeight'],
  color: colors.fg.neutral.spotReadable,
  letterSpacing: 0.5,
  marginBottom: 4,
};
