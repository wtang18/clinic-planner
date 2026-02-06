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

// 4. Ensure we don't have duplicate React instances by blocking other paths
config.resolver.blockList = [
  // Block react from other workspaces
  /apps\/(?!ehr-prototype).*\/node_modules\/react\//,
  /apps\/(?!ehr-prototype).*\/node_modules\/react-dom\//,
];

module.exports = config;
