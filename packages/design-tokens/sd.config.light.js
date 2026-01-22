/**
 * Style Dictionary Configuration - Light Theme (Pro Base)
 *
 * Generates light theme color tokens (decorative + semantic)
 * for the Pro product family base.
 */

module.exports = {
  source: [
    'sd-input/primitives/color-ramp.json',
    'sd-input/decorative/color-on-light.json',
    'sd-input/bases/pro/semantic-color-light.json'
  ],

  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [
        {
          destination: 'decorative-light.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('decorative/color-on-light'),
          options: {
            outputReferences: true,
            selector: ':root'
          }
        },
        {
          destination: 'semantic-color-light.css',
          format: 'css/variables',
          filter: (token) => token.filePath.includes('bases/pro/semantic-color-light'),
          options: {
            outputReferences: true,
            selector: ':root'
          }
        }
      ]
    }
  }
};
