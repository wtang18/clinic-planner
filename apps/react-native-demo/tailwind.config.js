/**
 * Tailwind CSS configuration for React Native (NativeWind)
 *
 * Uses auto-generated theme from design tokens.
 * Run `npm run tokens:build:tailwind` from project root to regenerate.
 */

const generatedTheme = require('./tailwind-theme.generated');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './.storybook/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      ...generatedTheme,
      // Manual overrides if needed (these take precedence over generated)
    },
  },
  plugins: [],
};
