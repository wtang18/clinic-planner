/**
 * Style Dictionary Configuration - Dark Theme (Pro Base)
 *
 * Generates dark theme color tokens (decorative + semantic)
 * for the Pro product family base.
 */

module.exports = {
  source: [
    'sd-input/primitives/color-ramp.json',
    'sd-input/decorative/color-on-dark.json',
    'sd-input/bases/pro/semantic-color-dark.json'
  ],

  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [
        {
          destination: 'decorative-dark.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('decorative/color-on-dark'),
          options: {
            outputReferences: true,
            selector: '[data-theme="dark"]'
          }
        },
        {
          destination: 'semantic-color-dark.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('bases/pro/semantic-color-dark'),
          options: {
            outputReferences: true,
            selector: '[data-theme="dark"]'
          }
        }
      ]
    }
  }
};
