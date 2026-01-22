/**
 * SuggestionChip Component
 *
 * Compact suggestion displayed in the OmniAdd area.
 */

import React from 'react';
import type { Suggestion } from '../../types/suggestions';
import { colors, spacing, typography, radii, transitions } from '../../styles/tokens';
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

const CheckIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const XIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MicIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const AIIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const HeartIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const getSourceIcon = (source: Suggestion['source']): React.ReactNode => {
  switch (source) {
    case 'transcription':
      return <MicIcon />;
    case 'ai-analysis':
      return <AIIcon />;
    case 'care-gap':
      return <HeartIcon />;
    case 'cds':
      return <ClipboardIcon />;
    default:
      return <AIIcon />;
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
    gap: spacing[2],
    padding: `${spacing[1.5]} ${spacing[3]}`,
    backgroundColor: colors.ai.suggestionLight,
    borderRadius: radii.full,
    border: `1px solid ${colors.ai.suggestion}40`,
    transition: `all ${transitions.fast}`,
    opacity,
    cursor: 'pointer',
    ...(isHovered && {
      backgroundColor: `${colors.ai.suggestion}20`,
      boxShadow: `0 0 0 2px ${colors.ai.suggestion}30`,
    }),
    ...style,
  };

  const sourceIconStyle: React.CSSProperties = {
    width: '14px',
    height: '14px',
    display: 'flex',
    color: colors.ai.suggestion,
    flexShrink: 0,
  };

  const textStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm[0],
    lineHeight: typography.fontSize.sm[1].lineHeight,
    color: colors.neutral[700],
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const confidenceIndicatorStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: radii.full,
    backgroundColor: confidenceColor,
    flexShrink: 0,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    marginLeft: spacing[1],
  };

  return (
    <div
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

      {/* Confidence indicator */}
      <span
        style={confidenceIndicatorStyle}
        title={`${Math.round(suggestion.confidence * 100)}% confidence`}
      />

      {/* Text */}
      <span style={textStyle}>{suggestion.displayText}</span>

      {/* Actions */}
      <div style={actionsStyle}>
        <IconButton
          icon={<CheckIcon />}
          label="Accept suggestion"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAccept();
          }}
          style={{ color: colors.status.success }}
        />
        <IconButton
          icon={<XIcon />}
          label="Dismiss suggestion"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={{ color: colors.neutral[500] }}
        />
      </div>
    </div>
  );
};

SuggestionChip.displayName = 'SuggestionChip';
