/**
 * Style Dictionary Configuration - Carbon Health Design System
 *
 * Reads parsed Figma tokens and generates:
 * - CSS custom properties (web)
 * - JavaScript objects (React Native)
 * - TypeScript definitions
 *
 * Prerequisites: npm run tokens:parse (converts Figma JSON)
 * Usage: npm run tokens:build
 *
 * New Structure (2025):
 * - primitives/     - Raw values (shared by all)
 * - decorative/     - Named color abstractions
 * - bases/pro/      - Pro product family semantics
 * - bases/consumer/ - Consumer product family semantics
 * - themes/pro/     - Sparse product overrides (EHR, Billing, etc.)
 */

module.exports = {
  source: [
    'sd-input/primitives/color-ramp.json',
    'sd-input/primitives/typography.json',
    'sd-input/primitives/dimensions.json',
    'sd-input/primitives/elevation.json',
    'sd-input/decorative/color-on-light.json',
    'sd-input/bases/pro/semantic-color-light.json',
    'sd-input/bases/pro/semantic-dimensions.json',
    'sd-input/bases/pro/semantic-elevation.json',
    'sd-input/bases/pro/semantic-typography-small.json'
  ],

  platforms: {
    // ========================================================================
    // WEB - CSS Custom Properties (Theme-Independent)
    // ========================================================================
    'css-base': {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [
        {
          destination: 'primitives-color.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('primitives/color-ramp'),
          options: { outputReferences: true }
        },
        {
          destination: 'primitives-typography.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('primitives/typography'),
          options: { outputReferences: true }
        },
        {
          destination: 'primitives-dimensions.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('primitives/dimensions'),
          options: { outputReferences: true }
        },
        {
          destination: 'primitives-elevation.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('primitives/elevation'),
          options: { outputReferences: true }
        },
        {
          destination: 'semantic-dimensions.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('bases/pro/semantic-dimensions'),
          options: { outputReferences: true }
        },
        {
          destination: 'semantic-elevation.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('bases/pro/semantic-elevation'),
          options: { outputReferences: true }
        },
        {
          destination: 'semantic-typography-small.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('bases/pro/semantic-typography-small'),
          options: { outputReferences: true }
        }
      ]
    },

    // ========================================================================
    // REACT NATIVE - JavaScript Objects
    // (Light theme tokens - RN will use separate theme provider for dark)
    // ========================================================================
    'rn-light': {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
          // Exclude dark theme tokens
          filter: (token) => !token.filePath.includes('dark'),
          options: {
            outputReferences: false  // RN needs actual values, not references
          }
        }
      ]
    },

    // ========================================================================
    // TYPESCRIPT - Type Definitions
    // (Light theme tokens - same as RN)
    // ========================================================================
    'ts-light': {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
          filter: (token) => !token.filePath.includes('dark')
        }
      ]
    }
  }
};
