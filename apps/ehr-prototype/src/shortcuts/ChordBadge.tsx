/**
 * ChordBadge Component
 *
 * Small pill that appears during chord-pending state (e.g., shows "G →"
 * while waiting for the follower key). Subscribes to ShortcutManager events.
 * Positioned to the left of the help hub button.
 */

import React, { useState, useEffect, useRef } from 'react';
import { shortcutManager } from './ShortcutManager';
import { colors, transitions, LAYOUT, GLASS_BUTTON_HEIGHT } from '../styles/foundations';

export const ChordBadge: React.FC = () => {
  const [leader, setLeader] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState(false);
  const placeholderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = shortcutManager.subscribe((event) => {
      if (event.type === 'chord-start') {
        setLeader(event.leader ?? null);
        // Clear placeholder when a new chord starts
        setPlaceholder(false);
        if (placeholderTimeout.current) clearTimeout(placeholderTimeout.current);
      } else if (event.type === 'chord-complete' || event.type === 'chord-cancel') {
        setLeader(null);
      }
    });
    return unsub;
  }, []);

  // Hide when a right-side SlideDrawer is open
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    const handler = (e: Event) => {
      setDrawerOpen((e as CustomEvent).detail.open);
    };
    document.addEventListener('slide-drawer-change', handler);
    return () => document.removeEventListener('slide-drawer-change', handler);
  }, []);

  // Listen for placeholder chord fires (unimplemented destinations)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      setPlaceholder(true);
      if (placeholderTimeout.current) clearTimeout(placeholderTimeout.current);
      placeholderTimeout.current = setTimeout(() => setPlaceholder(false), 1500);
    };
    window.addEventListener('ehr:chord-placeholder', handler);
    return () => {
      window.removeEventListener('ehr:chord-placeholder', handler);
      if (placeholderTimeout.current) clearTimeout(placeholderTimeout.current);
    };
  }, []);

  const visible = leader !== null || placeholder;

  const style: React.CSSProperties = {
    position: 'fixed',
    bottom: `calc(${LAYOUT.floatingInset}px + var(--legend-panel-height, 0px))`,
    right: LAYOUT.floatingInset + GLASS_BUTTON_HEIGHT + 8, // inset + button + spacing
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    color: colors.fg.neutral.primary,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    letterSpacing: 0.5,
    opacity: visible && !drawerOpen ? 1 : 0,
    transform: drawerOpen ? 'translateY(60px)' : 'translateY(0)',
    pointerEvents: 'none',
    transition: `opacity ${transitions.fast}, bottom 200ms ease, transform 200ms ease`,
    zIndex: 250,
  };

  const placeholderStyle: React.CSSProperties = {
    ...style,
    color: colors.fg.neutral.spotReadable,
  };

  return (
    <div style={placeholder ? placeholderStyle : style} aria-hidden="true" data-testid="chord-badge">
      {leader ? `${leader.toUpperCase()} →` : placeholder ? 'Coming soon' : ''}
    </div>
  );
};

ChordBadge.displayName = 'ChordBadge';
