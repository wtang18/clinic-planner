import './global.css';
import { registerRootComponent } from 'expo';

// Check if STORYBOOK is enabled via Expo public environment variable
// EXPO_PUBLIC_ prefix makes it available to Metro bundler
const isStorybook = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

let AppEntryPoint;

if (isStorybook) {
  // Load Storybook UI
  console.log('Loading Storybook...');
  AppEntryPoint = require('./.rnstorybook').default;
} else {
  // Load regular app
  console.log('Loading App...');
  AppEntryPoint = require('./App').default;
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(AppEntryPoint);
