/**
 * ProtocolSearch Component
 *
 * Search input with popover for selecting care protocol templates.
 * On selection, dispatches PROTOCOL_LOADED → PROTOCOL_ACTIVATED → PROTOCOL_TAB_ACTIVATED.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { colors, spaceAround, spaceBetween, borderRadius } from '../../styles/foundations';
import { getAllProtocols } from '../../mocks/protocols';
import { useDispatch } from '../../hooks/useEncounterState';
import { useCoordination } from '../../hooks/useCoordination';
import type { ProtocolTemplate, ActiveProtocolState, ProtocolCardState, ProtocolItemState } from '../../types/protocol';

// ============================================================================
// Types
// ============================================================================

export interface ProtocolSearchProps {
  testID?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/** Build an ActiveProtocolState from a template for initial load. */
function buildProtocolState(template: ProtocolTemplate): ActiveProtocolState {
  const cardStates: Record<string, ProtocolCardState> = {};
  const itemStates: Record<string, ProtocolItemState> = {};

  template.cards.forEach((card, index) => {
    cardStates[card.id] = {
      expanded: template.autoExpandFirstCard && index === 0,
      manuallyToggled: false,
    };
    card.items.forEach(item => {
      itemStates[item.id] = { status: 'pending' };
    });
  });

  return {
    id: `${template.id}-${Date.now()}`,
    templateId: template.id,
    templateSnapshot: template,
    status: 'available',
    activationSource: 'manual',
    activatedAt: null,
    isPrimary: true,
    severity: template.severityScoringModel ? { score: 0, selectedPathId: '', isManualOverride: false } : null,
    cardStates,
    itemStates,
  };
}

// ============================================================================
// Component
// ============================================================================

export const ProtocolSearch: React.FC<ProtocolSearchProps> = ({ testID }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { dispatch: coordDispatch } = useCoordination();

  const templates = getAllProtocols();
  const filtered = query.trim()
    ? templates.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
      )
    : templates;

  const handleSelect = (template: ProtocolTemplate) => {
    const protocolState = buildProtocolState(template);

    // 1. Load protocol into encounter state
    dispatch({ type: 'PROTOCOL_LOADED', payload: { protocol: protocolState } });
    // 2. Activate it
    dispatch({
      type: 'PROTOCOL_ACTIVATED',
      payload: { protocolId: protocolState.id, source: 'manual' },
    });
    // 3. Activate the protocol tab in coordination
    coordDispatch({ type: 'PROTOCOL_TAB_ACTIVATED' });

    setOpen(false);
    setQuery('');
  };

  // Close on outside click
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

  return (
    <div ref={containerRef} style={{ position: 'relative' }} data-testid={testID}>
      {/* Search input */}
      <div style={inputContainerStyle}>
        <Search size={14} color={colors.fg.neutral.spotReadable} style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search protocols…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          style={inputStyle}
          data-testid={testID ? `${testID}-input` : undefined}
        />
      </div>

      {/* Popover */}
      {open && (
        <div style={popoverStyle} data-testid={testID ? `${testID}-popover` : undefined}>
          {filtered.length === 0 ? (
            <div style={emptyStyle}>No matching protocols</div>
          ) : (
            filtered.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                style={optionStyle}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.bg.neutral.low;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: colors.fg.neutral.primary }}>
                  {template.name}
                </div>
                <div style={{ fontSize: 12, color: colors.fg.neutral.spotReadable, lineHeight: 1.3 }}>
                  {template.description}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

ProtocolSearch.displayName = 'ProtocolSearch';

// ============================================================================
// Styles
// ============================================================================

const inputContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: spaceBetween.coupled,
  padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
  borderRadius: borderRadius.sm,
  border: `1px solid ${colors.border.neutral.low}`,
  backgroundColor: colors.bg.neutral.min,
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  outline: 'none',
  fontSize: 13,
  color: colors.fg.neutral.primary,
  backgroundColor: 'transparent',
  fontFamily: 'inherit',
};

const popoverStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: 4,
  backgroundColor: colors.bg.neutral.min,
  border: `1px solid ${colors.border.neutral.low}`,
  borderRadius: borderRadius.sm,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  zIndex: 10,
  maxHeight: 240,
  overflowY: 'auto',
};

const optionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  width: '100%',
  padding: `${spaceAround.tight}px ${spaceAround.compact}px`,
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'inherit',
};

const emptyStyle: React.CSSProperties = {
  padding: `${spaceAround.compact}px`,
  fontSize: 13,
  color: colors.fg.neutral.spotReadable,
  textAlign: 'center',
};
