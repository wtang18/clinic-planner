import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

const ehrTheme = create({
  base: 'light',
  brandTitle: 'EHR Component Library',
  brandUrl: '/',
  colorPrimary: '#6366F1',
  colorSecondary: '#4F46E5',
  appBg: '#F9FAFB',
  appContentBg: '#FFFFFF',
  appBorderColor: '#E5E7EB',
  appBorderRadius: 8,
  fontBase: '"Inter", system-ui, -apple-system, sans-serif',
  fontCode: '"Fira Code", monospace',
  textColor: '#111827',
  textInverseColor: '#FFFFFF',
  barTextColor: '#6B7280',
  barSelectedColor: '#4F46E5',
  barBg: '#FFFFFF',
});

addons.setConfig({
  theme: ehrTheme,
  sidebar: {
    showRoots: true,
  },
});
