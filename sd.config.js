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
    'src/design-system/tokens/sd-input/decorative-color-on-light.json',
    'src/design-system/tokens/sd-input/decorative-color-on-dark.json',
    'src/design-system/tokens/sd-input/semantic-color-on-light.json',
    'src/design-system/tokens/sd-input/semantic-color-on-dark.json',
    'src/design-system/tokens/sd-input/semantic-dimensions.json',
    'src/design-system/tokens/sd-input/semantic-typography-small-viewport.json',
    'src/design-system/tokens/sd-input/semantic-typography-large-viewport.json'
  ],

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

        // Decorative Light
        {
          destination: 'decorative-light.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('decorative-color-on-light.json'),
          options: {
            outputReferences: true,
            selector: ':root, [data-theme="light"]'
          }
        },

        // Decorative Dark
        {
          destination: 'decorative-dark.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('decorative-color-on-dark.json'),
          options: {
            outputReferences: true,
            selector: '[data-theme="dark"]'
          }
        },

        // Semantic Light
        {
          destination: 'semantic-light.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic-color-on-light.json') || token.filePath.includes('semantic-dimensions.json'),
          options: {
            outputReferences: true,
            selector: ':root, [data-theme="light"]'
          }
        },

        // Semantic Dark
        {
          destination: 'semantic-dark.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic-color-on-dark.json'),
          options: {
            outputReferences: true,
            selector: '[data-theme="dark"]'
          }
        },

        // Responsive Typography Small
        {
          destination: 'typography-small.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic-typography-small-viewport.json'),
          options: {
            outputReferences: true,
            selector: '@media (max-width: 768px)'
          }
        },

        // Responsive Typography Large
        {
          destination: 'typography-large.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic-typography-large-viewport.json'),
          options: {
            outputReferences: true,
            selector: '@media (min-width: 769px)'
          }
        },

        //  Index file - manually create after build
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
