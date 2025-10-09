/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    // Exclude icon SVGs from the default Next.js SVG rule
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\/icons\/(small|medium|bicolor)\//;
    }

    // Handle icon SVGs as raw strings
    config.module.rules.push({
      test: /\.svg$/,
      include: /\/icons\/(small|medium|bicolor)\//,
      type: 'asset/source', // Use webpack 5's built-in instead of raw-loader
    });

    // Exclude Storybook files from production build
    config.module.rules.push({
      test: /\.stories\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader'
    });

    return config;
  },
}

module.exports = nextConfig;
