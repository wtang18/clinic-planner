import type { Preview } from '@storybook/react';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeProvider } from '../src/styles/theme';

// Load Inter font from Google Fonts CDN
if (typeof document !== 'undefined') {
  const linkId = 'inter-font-link';
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    minHeight: '100%',
    // @ts-expect-error fontFamily works in RNW
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F9FAFB' },
        { name: 'white', value: '#FFFFFF' },
        { name: 'dark', value: '#1F2937' },
      ],
    },
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={styles.container}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
};

export default preview;
