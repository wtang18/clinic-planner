/**
 * SuggestionChip Component
 *
 * Compact suggestion displayed in the OmniAdd area.
 */

import React from 'react';
import { Check, X, Mic, Sparkles, Heart, ClipboardList } from 'lucide-react';
import type { Suggestion } from '../../types/suggestions';
import { colors, spaceAround, spaceBetween, borderRadius, transitions, typography } from '../../styles/foundations';
import { getConfidenceColor } from '../../styles/utils';
import { IconButton } from '../primitives/IconButton';

// ============================================================================
// Types
// ============================================================================

export interface SuggestionChipProps {
  /** The suggestion to display */
  suggestion: Suggestion;
  /** Called when accepted */
  onAccept: () => void;
  /** Called when dismissed */
  onDismiss: () => void;
  /** Called when modify is clicked (optional) */
  onModify?: () => void;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

const getSourceIcon = (source: Suggestion['source']): React.ReactNode => {
  switch (source) {
    case 'transcription':
      return <Mic size={14} />;
    case 'ai-analysis':
      return <Sparkles size={14} />;
    case 'care-gap':
      return <Heart size={14} />;
    case 'cds':
      return <ClipboardList size={14} />;
    default:
      return <Sparkles size={14} />;
  }
};

// ============================================================================
// Component
// ============================================================================

export const SuggestionChip: React.FC<SuggestionChipProps> = ({
  suggestion,
  onAccept,
  onDismiss,
  onModify,
  style,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const confidenceColor = getConfidenceColor(suggestion.confidence);

  // Calculate opacity based on TTL (fade as expiration approaches)
  const getOpacity = (): number => {
    if (!suggestion.expiresAt) return 1;
    const now = new Date().getTime();
    const created = new Date(suggestion.createdAt).getTime();
    const expires = new Date(suggestion.expiresAt).getTime();
    const totalDuration = expires - created;
    const elapsed = now - created;
    const remaining = Math.max(0, 1 - elapsed / totalDuration);
    return Math.max(0.5, remaining);
  };

  const opacity = getOpacity();

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    padding: `${spaceAround.nudge6}px ${spaceAround.compact}px`,
    backgroundColor: 'rgba(128, 128, 128, 0.06)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: borderRadius.sm,
    border: '1px solid rgba(0, 0, 0, 0.04)',
    transition: `all ${transitions.fast}`,
    opacity,
    cursor: 'pointer',
    ...(isHovered && {
      backgroundColor: 'rgba(128, 128, 128, 0.12)',
    }),
    ...style,
  };

  const sourceIconStyle: React.CSSProperties = {
    display: 'flex',
    color: colors.fg.neutral.spotReadable,
    flexShrink: 0,
  };

  const textStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: '20px',
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
    marginLeft: spaceAround.nudge4,
  };

  return (
    <div
      data-testid={`suggestion-chip-${suggestion.id}`}
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onModify}
      role="button"
      tabIndex={0}
      aria-label={`Suggestion: ${suggestion.displayText}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onModify) onModify();
        if (e.key === 'a') onAccept();
        if (e.key === 'd' || e.key === 'Escape') onDismiss();
      }}
    >
      {/* Source icon */}
      <span style={sourceIconStyle}>
        {getSourceIcon(suggestion.source)}
      </span>

      {/* Text */}
      <span style={textStyle}>{suggestion.displayText}</span>

      {/* Actions */}
      <div style={actionsStyle}>
        <IconButton
          data-testid="chip-accept-btn"
          icon={<Check size={14} />}
          label="Accept suggestion"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAccept();
          }}
          style={{ color: colors.fg.positive.secondary }}
        />
        <IconButton
          data-testid="chip-dismiss-btn"
          icon={<X size={14} />}
          label="Dismiss suggestion"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={{ color: colors.fg.neutral.spotReadable }}
        />
      </div>
    </div>
  );
};

SuggestionChip.displayName = 'SuggestionChip';
