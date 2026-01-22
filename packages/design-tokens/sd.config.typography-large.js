/**
 * Style Dictionary Configuration - Large Viewport Typography (Pro Base)
 *
 * Generates responsive typography tokens for larger screens (desktop)
 * Uses @media query to apply tokens only on viewports > 768px
 */

module.exports = {
  source: [
    'sd-input/primitives/typography.json',
    'sd-input/bases/pro/semantic-typography-large.json'
  ],

  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [
        {
          destination: 'semantic-typography-large.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('bases/pro/semantic-typography-large'),
          options: { outputReferences: true }
        }
      ]
    }
  }
};
