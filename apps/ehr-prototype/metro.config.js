const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the monorepo root
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Force resolving react and react-native from this package's node_modules
// This fixes the "multiple copies of React" error in monorepos
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-native-web': path.resolve(projectRoot, 'node_modules/react-native-web'),
};

// 4. Add "react-native" condition for web platform resolution
// Zustand's ESM build (esm/vanilla.mjs) uses import.meta.env which Hermes
// doesn't support. The "react-native" export condition resolves to the CJS
// build instead, avoiding the "Cannot use import.meta outside a module" error.
config.resolver.unstable_conditionsByPlatform = {
  ...config.resolver.unstable_conditionsByPlatform,
  web: [
    'react-native',
    ...(config.resolver.unstable_conditionsByPlatform?.web ?? []),
  ],
};

// 5. Ensure we don't have duplicate React instances by blocking other paths
config.resolver.blockList = [
  // Block react from other workspaces
  /apps\/(?!ehr-prototype).*\/node_modules\/react\//,
  /apps\/(?!ehr-prototype).*\/node_modules\/react-dom\//,
];

module.exports = config;
