/**
 * Glass Effect Tokens
 *
 * Translucent/glassmorphic styles for interactive elements and floating surfaces.
 * These allow background surfaces to bleed through subtly, creating visual integration.
 */

// Standardized button dimensions for floating nav controls
export const GLASS_BUTTON_HEIGHT = 44;
export const GLASS_BUTTON_RADIUS = 22; // Half of height for perfect circle

export const glass = {
  // Floating layer - higher elevation glassmorphic panels (menu pane, nav row)
  floating: {
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
  },
  floatingPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  // Interactive elements
  secondary: {
    backgroundColor: 'rgba(128, 128, 128, 0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
  },
  secondaryHover: {
    backgroundColor: 'rgba(128, 128, 128, 0.14)',
    border: '1px solid rgba(0, 0, 0, 0.09)',
  },
  ghost: {
    backgroundColor: 'rgba(128, 128, 128, 0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  ghostHover: {
    backgroundColor: 'rgba(128, 128, 128, 0.10)',
  },
  // 44px glassmorphic button styling
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
  },
  buttonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(0, 0, 0, 0.12)',
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    border: '1px solid rgba(0, 0, 0, 0.15)',
  },
  // Dark glass variant for AI surfaces - more translucent for background bleed
  glassDark: {
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  glassDarkHover: {
    backgroundColor: 'rgba(20, 20, 20, 0.90)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
} as const;

export type GlassVariant = keyof typeof glass;
