/**
 * Style Dictionary configuration for React Native
 * Generates JavaScript/TypeScript token files for use in React Native apps
 */

module.exports = {
  source: ['src/design-system/tokens/sd-input/**/*.json'],
  platforms: {
    'react-native': {
      transformGroup: 'react-native',
      buildPath: 'src/design-system/tokens/build/react-native/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
          options: {
            outputReferences: true,
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
