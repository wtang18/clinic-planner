/**
 * Style Dictionary Configuration - Dark Theme
 *
 * Generates dark theme color tokens (decorative + semantic)
 */

module.exports = {
  source: [
    'src/design-system/tokens/sd-input/primitives-color-ramp.json',
    'src/design-system/tokens/sd-input/decorative-color-on-dark.json',
    'src/design-system/tokens/sd-input/semantic-color-on-dark.json'
  ],

  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/design-system/tokens/build/',
      files: [
        {
          destination: 'decorative-dark.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('decorative-color-on-dark'),
          options: {
            outputReferences: true,
            selector: '[data-theme="dark"]'
          }
        },
        {
          destination: 'semantic-color-dark.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic-color-on-dark'),
          options: {
            outputReferences: true,
            selector: '[data-theme="dark"]'
          }
        }
      ]
    }
  }
};
