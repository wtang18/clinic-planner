/**
 * SuggestionCard Component
 *
 * Expanded suggestion with full details and actions.
 */

import React from 'react';
import { Mic, Sparkles, Heart, ClipboardList, Check, Pencil, X } from 'lucide-react';
import type { Suggestion, SuggestionContent } from '../../types/suggestions';
import type { ChartItem } from '../../types/chart-items';
import { colors, spaceAround, spaceBetween, borderRadius, typography, shadows, transitions } from '../../styles/foundations';
import { getConfidenceColor, getConfidenceLabel, getCategoryColor } from '../../styles/utils';
import { formatTimeAgo } from '../../utils/formatTimeAgo';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { ActionGroup } from '../primitives/ActionGroup';

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

const getSourceIcon = (source: Suggestion['source'], size = 20): React.ReactNode => {
  switch (source) {
    case 'transcription':
      return <Mic size={size} />;
    case 'ai-analysis':
      return <Sparkles size={size} />;
    case 'care-gap':
      return <Heart size={size} />;
    case 'cds':
      return <ClipboardList size={size} />;
    default:
      return <Sparkles size={size} />;
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
    padding: spaceAround.compact,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.sm,
    fontSize: 14,
    lineHeight: '20px',
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
            gap: spaceBetween.repeating,
            marginBottom: spaceAround.tight,
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
            <div style={{ color: colors.fg.neutral.primary, fontWeight: typography.fontWeight.medium }}>
              {template.displayText}
            </div>
          )}
          {template.displaySubtext && (
            <div style={{ color: colors.fg.neutral.secondary, marginTop: spaceAround.nudge4 }}>
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
            fontSize: 12,
            color: colors.fg.neutral.spotReadable,
            marginBottom: spaceAround.tight,
          }}>
            Suggested diagnoses to link:
          </div>
          {content.suggestedDx.map((dx, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${spaceAround.nudge4}px 0`,
              borderBottom: index < content.suggestedDx.length - 1 ? `1px solid ${colors.border.neutral.low}` : 'none',
            }}>
              <span style={{ color: colors.fg.neutral.primary }}>
                {dx.description} <span style={{ color: colors.fg.neutral.spotReadable }}>({dx.icdCode})</span>
              </span>
              <span style={{
                fontSize: 12,
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
            fontSize: 12,
            color: colors.fg.neutral.spotReadable,
            marginBottom: spaceAround.tight,
          }}>
            Suggested correction for <strong>{content.field}</strong>:
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spaceBetween.repeating,
          }}>
            <span style={{
              textDecoration: 'line-through',
              color: colors.fg.neutral.disabled,
            }}>
              {String(content.currentValue)}
            </span>
            <span style={{ color: colors.fg.neutral.disabled }}>→</span>
            <span style={{
              color: colors.fg.positive.secondary,
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
          <Badge variant="warning" size="sm" style={{ marginBottom: spaceAround.tight }}>
            Care Gap Action
          </Badge>
          {content.actionTemplate.displayText && (
            <div style={{ color: colors.fg.neutral.primary }}>
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
    gap: spaceBetween.related,
    padding: spaceAround.default,
    backgroundColor: colors.bg.neutral.base,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spaceBetween.relatedCompact,
  };

  const headerLeftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  };

  const sourceIconStyle: React.CSSProperties = {
    display: 'flex',
    color: colors.fg.neutral.secondary,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.primary,
    margin: 0,
  };

  const subtextStyle: React.CSSProperties = {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    marginTop: spaceAround.nudge4,
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
  };

  const confidenceStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.coupled,
  };

  const reasoningStyle: React.CSSProperties = {
    padding: spaceAround.compact,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.sm,
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.secondary,
    fontStyle: 'italic',
  };

  const transcriptStyle: React.CSSProperties = {
    padding: spaceAround.compact,
    backgroundColor: colors.bg.positive.subtle,
    borderRadius: borderRadius.sm,
    fontSize: 14,
    color: colors.fg.neutral.secondary,
    fontFamily: typography.fontFamily.mono,
  };


  const dismissOptionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.repeating,
    marginTop: spaceAround.tight,
    padding: spaceAround.tight,
    backgroundColor: colors.bg.neutral.min,
    borderRadius: borderRadius.sm,
  };

  const dismissReasons = [
    { value: 'incorrect', label: 'Incorrect' },
    { value: 'not-relevant', label: 'Not relevant' },
    { value: 'already-done', label: 'Already addressed' },
  ];

  return (
    <Card variant="outlined" padding="none" data-testid={`suggestion-card-${suggestion.id}`}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <div style={headerLeftStyle}>
              <span style={sourceIconStyle}>
                {getSourceIcon(suggestion.source, 20)}
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
              fontSize: 12,
              color: colors.fg.neutral.spotReadable,
              marginBottom: spaceAround.nudge4,
              display: 'flex',
              alignItems: 'center',
              gap: spaceBetween.coupled,
            }}>
              <Mic size={12} />
              From transcript:
            </div>
            "{transcriptExcerpt}"
          </div>
        )}

        {/* Actions */}
        <ActionGroup layout="space-between" style={{ paddingTop: spaceAround.compact }}>
          <ActionGroup>
            <Button
              data-testid="card-accept-btn"
              variant="primary"
              size="sm"
              leftIcon={<Check size={14} />}
              onClick={onAccept}
            >
              Accept
            </Button>
            <Button
              data-testid="card-modify-btn"
              variant="secondary"
              size="sm"
              leftIcon={<Pencil size={14} />}
              onClick={() => onAcceptWithChanges({})}
            >
              Accept with changes
            </Button>
          </ActionGroup>
          <Button
            data-testid="card-dismiss-btn"
            variant="ghost"
            size="sm"
            onClick={() => setShowDismissOptions(!showDismissOptions)}
          >
            Dismiss
          </Button>
        </ActionGroup>

        {/* Dismiss options */}
        {showDismissOptions && (
          <div style={dismissOptionsStyle}>
            <span style={{ fontSize: 12, color: colors.fg.neutral.spotReadable }}>
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

SuggestionCard.displayName = 'SuggestionCard';
