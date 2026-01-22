/**
 * SuggestionCard Component
 *
 * Expanded suggestion with full details and actions.
 */

import React from 'react';
import type { Suggestion, SuggestionContent } from '../../types/suggestions';
import type { ChartItem } from '../../types/chart-items';
import { colors, spacing, typography, radii, shadows, transitions } from '../../styles/tokens';
import { getConfidenceColor, getConfidenceLabel, getCategoryColor } from '../../styles/utils';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';

// ============================================================================
// Types
// ============================================================================

export interface SuggestionCardProps {
  /** The suggestion to display */
  suggestion: Suggestion;
  /** Called when accepted */
  onAccept: () => void;
  /** Called when accepted with changes */
  onAcceptWithChanges: (changes: Partial<ChartItem>) => void;
  /** Called when dismissed */
  onDismiss: (reason?: string) => void;
  /** Whether to show the transcript excerpt */
  showTranscript?: boolean;
  /** The source transcript text (if available) */
  transcriptExcerpt?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ============================================================================
// Icons
// ============================================================================

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

const CheckIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const EditIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const XIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
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

const getSourceLabel = (source: Suggestion['source']): string => {
  switch (source) {
    case 'transcription':
      return 'From transcription';
    case 'ai-analysis':
      return 'AI Analysis';
    case 'care-gap':
      return 'Care Gap';
    case 'cds':
      return 'Clinical Decision Support';
    case 'import':
      return 'Imported';
    default:
      return 'AI Suggestion';
  }
};

// ============================================================================
// Helper Components
// ============================================================================

const ContentPreview: React.FC<{ content: SuggestionContent }> = ({ content }) => {
  const previewStyle: React.CSSProperties = {
    padding: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
    fontSize: typography.fontSize.sm[0],
    lineHeight: typography.fontSize.sm[1].lineHeight,
  };

  switch (content.type) {
    case 'new-item': {
      const categoryColors = getCategoryColor(content.category);
      const template = content.itemTemplate;
      return (
        <div style={previewStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            marginBottom: spacing[2],
          }}>
            <Badge
              variant="default"
              size="sm"
              style={{ backgroundColor: categoryColors.lightBg, color: categoryColors.text }}
            >
              {content.category}
            </Badge>
          </div>
          {template.displayText && (
            <div style={{ color: colors.neutral[900], fontWeight: typography.fontWeight.medium }}>
              {template.displayText}
            </div>
          )}
          {template.displaySubtext && (
            <div style={{ color: colors.neutral[600], marginTop: spacing[1] }}>
              {template.displaySubtext}
            </div>
          )}
        </div>
      );
    }
    case 'dx-link':
      return (
        <div style={previewStyle}>
          <div style={{
            fontSize: typography.fontSize.xs[0],
            color: colors.neutral[500],
            marginBottom: spacing[2],
          }}>
            Suggested diagnoses to link:
          </div>
          {content.suggestedDx.map((dx, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${spacing[1]} 0`,
              borderBottom: index < content.suggestedDx.length - 1 ? `1px solid ${colors.neutral[200]}` : 'none',
            }}>
              <span style={{ color: colors.neutral[900] }}>
                {dx.description} <span style={{ color: colors.neutral[500] }}>({dx.icdCode})</span>
              </span>
              <span style={{
                fontSize: typography.fontSize.xs[0],
                color: getConfidenceColor(dx.confidence),
              }}>
                {Math.round(dx.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      );
    case 'correction':
      return (
        <div style={previewStyle}>
          <div style={{
            fontSize: typography.fontSize.xs[0],
            color: colors.neutral[500],
            marginBottom: spacing[2],
          }}>
            Suggested correction for <strong>{content.field}</strong>:
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}>
            <span style={{
              textDecoration: 'line-through',
              color: colors.neutral[400],
            }}>
              {String(content.currentValue)}
            </span>
            <span style={{ color: colors.neutral[400] }}>→</span>
            <span style={{
              color: colors.status.success,
              fontWeight: typography.fontWeight.medium,
            }}>
              {String(content.suggestedValue)}
            </span>
          </div>
        </div>
      );
    case 'care-gap-action':
      return (
        <div style={previewStyle}>
          <Badge variant="warning" size="sm" style={{ marginBottom: spacing[2] }}>
            Care Gap Action
          </Badge>
          {content.actionTemplate.displayText && (
            <div style={{ color: colors.neutral[900] }}>
              {content.actionTemplate.displayText}
            </div>
          )}
        </div>
      );
    default:
      return null;
  }
};

// ============================================================================
// Component
// ============================================================================

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onAccept,
  onAcceptWithChanges,
  onDismiss,
  showTranscript = true,
  transcriptExcerpt,
  style,
}) => {
  const [showDismissOptions, setShowDismissOptions] = React.useState(false);

  const confidenceColor = getConfidenceColor(suggestion.confidence);
  const confidenceLabel = getConfidenceLabel(suggestion.confidence);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
    padding: spacing[4],
    borderLeft: `3px solid ${colors.ai.suggestion}`,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  };

  const headerLeftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const sourceIconStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    display: 'flex',
    color: colors.ai.suggestion,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.base[0],
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[900],
    margin: 0,
  };

  const subtextStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm[0],
    color: colors.neutral[600],
    marginTop: spacing[1],
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    fontSize: typography.fontSize.xs[0],
    color: colors.neutral[500],
  };

  const confidenceStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
  };

  const confidenceDotStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: radii.full,
    backgroundColor: confidenceColor,
  };

  const reasoningStyle: React.CSSProperties = {
    padding: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
    fontSize: typography.fontSize.sm[0],
    color: colors.neutral[600],
    fontStyle: 'italic',
    borderLeft: `2px solid ${colors.neutral[300]}`,
  };

  const transcriptStyle: React.CSSProperties = {
    padding: spacing[3],
    backgroundColor: colors.ai.suggestionLight,
    borderRadius: radii.md,
    fontSize: typography.fontSize.sm[0],
    color: colors.neutral[700],
    fontFamily: typography.fontFamily.mono,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    paddingTop: spacing[3],
    borderTop: `1px solid ${colors.neutral[200]}`,
  };

  const dismissOptionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
    padding: spacing[2],
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
  };

  const dismissReasons = [
    { value: 'incorrect', label: 'Incorrect' },
    { value: 'not-relevant', label: 'Not relevant' },
    { value: 'already-done', label: 'Already addressed' },
  ];

  return (
    <Card variant="outlined" padding="none">
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <div style={headerLeftStyle}>
              <span style={sourceIconStyle}>
                {getSourceIcon(suggestion.source)}
              </span>
              <p style={titleStyle}>{suggestion.displayText}</p>
            </div>
            {suggestion.displaySubtext && (
              <p style={subtextStyle}>{suggestion.displaySubtext}</p>
            )}
          </div>
          <Badge variant="ai" size="sm">AI Suggestion</Badge>
        </div>

        {/* Meta info */}
        <div style={metaStyle}>
          <span>{getSourceLabel(suggestion.source)}</span>
          <span style={confidenceStyle}>
            <span style={confidenceDotStyle} />
            {confidenceLabel} ({Math.round(suggestion.confidence * 100)}%)
          </span>
          <span>{formatTimeAgo(suggestion.createdAt)}</span>
        </div>

        {/* Content preview */}
        <ContentPreview content={suggestion.content} />

        {/* Reasoning */}
        {suggestion.reasoning && (
          <div style={reasoningStyle}>
            <strong style={{ fontStyle: 'normal' }}>Reasoning:</strong> {suggestion.reasoning}
          </div>
        )}

        {/* Transcript excerpt */}
        {showTranscript && transcriptExcerpt && (
          <div style={transcriptStyle}>
            <div style={{
              fontSize: typography.fontSize.xs[0],
              color: colors.neutral[500],
              marginBottom: spacing[1],
              display: 'flex',
              alignItems: 'center',
              gap: spacing[1],
            }}>
              <span style={{ width: '12px', height: '12px', display: 'flex' }}><MicIcon /></span>
              From transcript:
            </div>
            "{transcriptExcerpt}"
          </div>
        )}

        {/* Actions */}
        <div style={actionsStyle}>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckIcon />}
            onClick={onAccept}
          >
            Accept
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<EditIcon />}
            onClick={() => onAcceptWithChanges({})}
          >
            Accept with changes
          </Button>
          <div style={{ flex: 1 }} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDismissOptions(!showDismissOptions)}
          >
            Dismiss
          </Button>
        </div>

        {/* Dismiss options */}
        {showDismissOptions && (
          <div style={dismissOptionsStyle}>
            <span style={{ fontSize: typography.fontSize.xs[0], color: colors.neutral[500] }}>
              Reason:
            </span>
            {dismissReasons.map((reason) => (
              <Button
                key={reason.value}
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(reason.value)}
              >
                {reason.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss()}
            >
              Skip
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function formatTimeAgo(date: Date): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

SuggestionCard.displayName = 'SuggestionCard';
