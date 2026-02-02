/**
 * CaptureView Styles
 *
 * Styles for the capture view screen.
 */

import { colors, spaceAround, spaceBetween, borderRadius, shadows, typography } from '../../styles/foundations';

// ============================================================================
// Styles
// ============================================================================

export const captureViewStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: colors.bg.neutral.min,
  } as React.CSSProperties,

  headerContainer: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  modeSelectorContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: `${spaceAround.tight}px ${spaceAround.default}px`,
    backgroundColor: colors.bg.neutral.base,
    borderBottom: `1px solid ${colors.border.neutral.low}`,
  } as React.CSSProperties,

  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  } as React.CSSProperties,

  chartItemsList: {
    flex: 1,
    overflowY: 'auto',
    padding: spaceAround.default,
    paddingBottom: '160px', // Space for OmniAdd + Minibar
  } as React.CSSProperties,

  contentWrapper: {
    maxWidth: 800,
    width: '100%',
    margin: '0 auto',
  } as React.CSSProperties,

  chartItemsEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '300px',
    color: colors.fg.neutral.spotReadable,
  } as React.CSSProperties,

  emptyIcon: {
    width: '64px',
    height: '64px',
    marginBottom: spaceAround.default,
    color: colors.border.neutral.medium,
  } as React.CSSProperties,

  emptyTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.secondary,
    marginBottom: spaceAround.tight,
  } as React.CSSProperties,

  emptyDescription: {
    fontSize: 14,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    textAlign: 'center',
    maxWidth: '320px',
  } as React.CSSProperties,

  chartItemCard: {
    marginBottom: spaceAround.compact,
  } as React.CSSProperties,

  omniAddContainer: {
    position: 'fixed',
    bottom: '64px', // Above minibar
    left: 0,
    right: 0,
    padding: spaceAround.default,
    backgroundColor: colors.bg.neutral.base,
    borderTop: `1px solid ${colors.border.neutral.low}`,
    boxShadow: shadows.md,
  } as React.CSSProperties,

  paletteOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 100,
  } as React.CSSProperties,

  paletteContainer: {
    width: '100%',
    maxWidth: '600px',
    maxHeight: '70vh',
    backgroundColor: colors.bg.neutral.base,
    borderRadius: `${borderRadius.md}px ${borderRadius.md}px 0 0`,
    boxShadow: shadows.xl,
    overflow: 'hidden',
  } as React.CSSProperties,

  taskPaneOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 100,
  } as React.CSSProperties,

  taskPaneContainer: {
    width: '400px',
    maxWidth: '90vw',
    height: '100%',
    backgroundColor: colors.bg.neutral.base,
    boxShadow: shadows.xl,
    overflow: 'auto',
  } as React.CSSProperties,

  timestampDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: spaceBetween.relatedCompact,
    margin: `${spaceAround.default}px 0`,
  } as React.CSSProperties,

  timestampLine: {
    flex: 1,
    height: '1px',
    backgroundColor: colors.border.neutral.low,
  } as React.CSSProperties,

  timestampText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    color: colors.fg.neutral.spotReadable,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as React.CSSProperties,
};

// ============================================================================
// Dynamic Styles
// ============================================================================

export function getItemAnimationStyle(isNew: boolean): React.CSSProperties {
  if (!isNew) return {};

  return {
    animation: 'slideInFromBottom 0.3s ease-out',
  };
}

export function getOverlayAnimationStyle(isOpen: boolean): React.CSSProperties {
  return {
    opacity: isOpen ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out',
    pointerEvents: isOpen ? 'auto' : 'none',
  } as React.CSSProperties;
}

// ============================================================================
// Keyframe Animations (to be injected)
// ============================================================================

export const captureViewAnimations = `
  @keyframes slideInFromBottom {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
