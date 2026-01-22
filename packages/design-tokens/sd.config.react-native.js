/**
 * Style Dictionary Configuration - React Native (Pro Base)
 *
 * Generates JavaScript/TypeScript token files for use in React Native apps.
 * Uses Pro base with light theme as default.
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
    'react-native': {
      transformGroup: 'react-native',
      buildPath: 'dist/react-native/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
          options: {
            outputReferences: false,  // RN needs resolved values
          },
        },
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
        },
        {
          destination: 'tokens.json',
          format: 'json/flat',
        },
      ],
    },
  },
};
