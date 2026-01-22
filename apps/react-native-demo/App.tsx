/**
 * Main App Entry Point
 */

import React from 'react';
import RootNavigator from './navigation/RootNavigator';

// Toggle between Storybook and App
const ENABLE_STORYBOOK = true;

function App() {
  if (ENABLE_STORYBOOK) {
    const StorybookUIRoot = require('./.rnstorybook').default;
    return <StorybookUIRoot />;
  }

  return <RootNavigator />;
}

export default App;
