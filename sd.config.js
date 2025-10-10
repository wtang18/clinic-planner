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
  source: ['src/design-system/tokens/sd-input/**/*.json'],

  platforms: {
    // ========================================================================
    // WEB - CSS Custom Properties
    // ========================================================================
    css: {
      transformGroup: 'css',
      buildPath: 'src/design-system/tokens/build/',
      files: [
        // Primitives
        {
          destination: 'primitives-color.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('primitives-color-ramp'),
          options: {
            outputReferences: true,
          }
        },
        {
          destination: 'primitives-typography.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('primitives-typography'),
          options: {
            outputReferences: true,
          }
        },
        {
          destination: 'primitives-dimensions.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('primitives-dimensions'),
          options: {
            outputReferences: true,
          }
        },

        // Decorative
        {
          destination: 'decorative-light.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('decorative') && token.filePath.includes('on-light'),
          options: {
            outputReferences: true,
            selector: ':root, [data-theme="light"]'
          }
        },
        {
          destination: 'decorative-dark.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('decorative') && token.filePath.includes('on-dark'),
          options: {
            outputReferences: true,
            selector: '[data-theme="dark"]'
          }
        },

        // Semantic
        {
          destination: 'semantic-light.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic') && token.filePath.includes('on-light'),
          options: {
            outputReferences: true,
            selector: ':root, [data-theme="light"]'
          }
        },
        {
          destination: 'semantic-dark.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic') && token.filePath.includes('on-dark'),
          options: {
            outputReferences: true,
            selector: '[data-theme="dark"]'
          }
        },

        // All tokens in one file (for import convenience)
        {
          destination: 'index.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          }
        }
      ]
    },

    // ========================================================================
    // REACT NATIVE - JavaScript Objects
    // ========================================================================
    js: {
      transformGroup: 'js',
      buildPath: 'src/design-system/tokens/build/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
          options: {
            outputReferences: false,  // RN needs actual values, not references
          }
        }
      ]
    },

    // ========================================================================
    // TYPESCRIPT - Type Definitions
    // ========================================================================
    ts: {
      transformGroup: 'js',
      buildPath: 'src/design-system/tokens/build/',
      files: [
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations'
        }
      ]
    }
  }
};
