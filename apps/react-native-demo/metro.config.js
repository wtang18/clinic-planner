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

// Add platform-specific extensions for React Native (.rn.ts files take priority)
config.resolver.sourceExts = ['rn.ts', 'rn.tsx', ...(config.resolver.sourceExts || [])];

// Force single React instance for monorepo compatibility.
// Root node_modules has React 19.2.3 (hoisted for other workspaces),
// but this app requires 19.1.0 (Expo SDK 54). Without this, Storybook
// loads a different React than the app, breaking hooks.
const localNodeModules = path.resolve(projectRoot, 'node_modules');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const packageName = moduleName.startsWith('@')
    ? moduleName.split('/').slice(0, 2).join('/')
    : moduleName.split('/')[0];

  if (packageName === 'react' || packageName === 'react-dom') {
    // Return a concrete file path so Metro can't resolve from root node_modules.
    // The nodeModulesPaths context override wasn't sufficient — withStorybook's
    // resolver wrapper can bypass it. Direct resolution is deterministic.
    const filePath = require.resolve(moduleName, { paths: [localNodeModules] });
    return { type: 'sourceFile', filePath };
  }

  return context.resolveRequest(context, moduleName, platform);
};

// Wrap with NativeWind for Tailwind CSS support
const nativeWindConfig = withNativeWind(config, { input: './global.css' });

// Wrap with Storybook enhancer
const withStorybook = require('@storybook/react-native/metro/withStorybook');
module.exports = withStorybook(nativeWindConfig);
