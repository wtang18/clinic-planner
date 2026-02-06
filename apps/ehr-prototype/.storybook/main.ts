import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: true,
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          'react-native': 'react-native-web',
          'react-native-svg': path.resolve(__dirname, '../../../node_modules/react-native-svg/src/ReactNativeSVG.web.ts'),
          '@design-system/icons': path.resolve(__dirname, '../../../packages/design-icons'),
          '@': path.resolve(__dirname, '../src'),
        },
        extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
      },
      define: {
        __DEV__: true,
        'process.env.NODE_ENV': JSON.stringify('development'),
      },
      optimizeDeps: {
        include: ['react-native-web', 'react-native-svg'],
        exclude: ['@storybook/nextjs-vite', 'sb-original/image-context'],
        esbuildOptions: {
          resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
          loader: {
            '.js': 'jsx',
          },
          external: ['sb-original/image-context'],
        },
      },
    });
  },
};

export default config;
