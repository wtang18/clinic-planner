/**
 * ChordBadge Component
 *
 * Small pill that appears during chord-pending state (e.g., shows "G →"
 * while waiting for the follower key). Subscribes to ShortcutManager events.
 * Positioned to the left of the help hub button.
 */

import React, { useState, useEffect } from 'react';
import { shortcutManager } from './ShortcutManager';
import { colors, transitions } from '../styles/foundations';

export const ChordBadge: React.FC = () => {
  const [leader, setLeader] = useState<string | null>(null);

  useEffect(() => {
    const unsub = shortcutManager.subscribe((event) => {
      if (event.type === 'chord-start') {
        setLeader(event.leader ?? null);
      } else if (event.type === 'chord-complete' || event.type === 'chord-cancel') {
        setLeader(null);
      }
    });
    return unsub;
  }, []);

  const visible = leader !== null;

  const style: React.CSSProperties = {
    position: 'fixed',
    bottom: 'calc(16px + var(--legend-panel-height, 0px))',
    right: 68, // 16px gap + 44px button + 8px spacing
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
    opacity: visible ? 1 : 0,
    pointerEvents: 'none',
    transition: `opacity ${transitions.fast}, bottom 200ms ease`,
    zIndex: 250,
  };

  return (
    <div style={style} aria-hidden="true" data-testid="chord-badge">
      {leader ? `${leader.toUpperCase()} →` : ''}
    </div>
  );
};

ChordBadge.displayName = 'ChordBadge';
