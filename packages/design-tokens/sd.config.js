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
 */

module.exports = {
  source: [
    'src/design-system/tokens/sd-input/primitives-color-ramp.json',
    'src/design-system/tokens/sd-input/primitives-typography.json',
    'src/design-system/tokens/sd-input/primitives-dimensions.json',
    'src/design-system/tokens/sd-input/primitives-elevation.json',
    'src/design-system/tokens/sd-input/decorative-color-on-light.json',
    'src/design-system/tokens/sd-input/semantic-color-on-light.json',
    'src/design-system/tokens/sd-input/semantic-dimensions.json',
    'src/design-system/tokens/sd-input/semantic-elevation.json',
    'src/design-system/tokens/sd-input/semantic-typography-small-viewport.json'
  ],

  platforms: {
    // ========================================================================
    // WEB - CSS Custom Properties (Theme-Independent)
    // ========================================================================
    'css-base': {
      transformGroup: 'css',
      buildPath: 'src/design-system/tokens/build/',
      files: [
        {
          destination: 'primitives-color.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('primitives-color-ramp'),
          options: { outputReferences: true }
        },
        {
          destination: 'primitives-typography.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('primitives-typography'),
          options: { outputReferences: true }
        },
        {
          destination: 'primitives-dimensions.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('primitives-dimensions'),
          options: { outputReferences: true }
        },
        {
          destination: 'primitives-elevation.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('primitives-elevation'),
          options: { outputReferences: true }
        },
        {
          destination: 'semantic-dimensions.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic-dimensions'),
          options: { outputReferences: true }
        },
        {
          destination: 'semantic-elevation.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic-elevation'),
          options: { outputReferences: true }
        },
        {
          destination: 'semantic-typography-small.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic-typography-small-viewport'),
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
      buildPath: 'src/design-system/tokens/build/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
          // Exclude decorative/semantic from other themes to only include base + light
          filter: (token) => !token.filePath.includes('on-dark'),
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
      buildPath: 'src/design-system/tokens/build/',
      files: [
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
          filter: (token) => !token.filePath.includes('on-dark')
        }
      ]
    }
  }
};
