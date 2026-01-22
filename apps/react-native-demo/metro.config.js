const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the parent directory to the watch folders
const projectRoot = __dirname;
const parentRoot = path.resolve(projectRoot, '../..');

config.watchFolders = [projectRoot, parentRoot];

// Allow Metro to resolve files from the parent directory
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(parentRoot, 'node_modules'),
];

// Add alias configuration for design system imports
config.resolver.extraNodeModules = {
  '@design-system': path.resolve(parentRoot, 'src/design-system'),
};

// Add platform-specific extensions for React Native (.rn.ts files take priority)
config.resolver.sourceExts = ['rn.ts', 'rn.tsx', ...(config.resolver.sourceExts || [])];

// Wrap with NativeWind for Tailwind CSS support
const nativeWindConfig = withNativeWind(config, { input: './global.css' });

// Wrap with Storybook enhancer
const withStorybook = require('@storybook/react-native/metro/withStorybook');
module.exports = withStorybook(nativeWindConfig);
