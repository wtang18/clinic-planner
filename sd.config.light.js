/**
 * Style Dictionary Configuration - Light Theme
 *
 * Generates light theme color tokens (decorative + semantic)
 */

module.exports = {
  source: [
    'src/design-system/tokens/sd-input/primitives-color-ramp.json',
    'src/design-system/tokens/sd-input/decorative-color-on-light.json',
    'src/design-system/tokens/sd-input/semantic-color-on-light.json'
  ],

  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'src/design-system/tokens/build/',
      files: [
        {
          destination: 'decorative-light.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('decorative-color-on-light'),
          options: {
            outputReferences: true,
            selector: ':root, [data-theme="light"]'
          }
        },
        {
          destination: 'semantic-color-light.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('semantic-color-on-light'),
          options: {
            outputReferences: true,
            selector: ':root, [data-theme="light"]'
          }
        }
      ]
    }
  }
};
