/**
 * Style Dictionary Configuration - Large Viewport Typography
 *
 * Generates responsive typography tokens for larger screens (desktop)
 * Uses @media query to apply tokens only on viewports > 768px
 */

module.exports = {
  source: [
    'src/design-system/tokens/sd-input/primitives-typography.json',
    'src/design-system/tokens/sd-input/semantic-typography-large-viewport.json'
  ],

  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/design-system/tokens/build/',
      files: [
        {
          destination: 'semantic-typography-large.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic-typography-large-viewport'),
          options: { outputReferences: true }
        }
      ]
    }
  }
};
