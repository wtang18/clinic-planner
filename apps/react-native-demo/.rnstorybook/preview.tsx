import type { Preview } from '@storybook/react';
import React from 'react';
import { View, Platform, useColorScheme } from 'react-native';
import { ThemeProvider } from '../theme';

// Load Inter font for web
if (Platform.OS === 'web') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

/**
 * Theme-aware wrapper that follows system theme
 * For manual theme testing, use: Theme System > Theme Demo > Interactive Demo
 */
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#1a1a1a' : '#ffffff';

  return (
    <ThemeProvider>
      <View style={{ backgroundColor, minHeight: '100%', padding: 16 }}>
        {children}
      </View>
    </ThemeProvider>
  );
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeWrapper>
        <Story />
      </ThemeWrapper>
    ),
  ],
};

export default preview;
