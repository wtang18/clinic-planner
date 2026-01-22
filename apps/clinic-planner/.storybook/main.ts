import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {}
  },
  docs: {
    autodocs: true,
  },
  viteFinal: async (config) => {
    // Ensure ?raw imports work correctly in Storybook
    // The ?raw suffix should make Vite return the file content as a string
    // This is a built-in Vite feature, but we need to ensure it's not being overridden

    // Make sure svg files are not treated as assets when using ?raw
    if (config.assetsInclude) {
      // Remove SVG from assetsInclude if it's there
      if (Array.isArray(config.assetsInclude)) {
        config.assetsInclude = config.assetsInclude.filter(
          (pattern) => !pattern.toString().includes('svg')
        );
      }
    }

    return config;
  },
};

export default config;
