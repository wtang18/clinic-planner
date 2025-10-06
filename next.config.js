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
      fileLoaderRule.exclude = /\/icons\/(small|medium)\//;
    }

    // Handle icon SVGs as raw strings
    config.module.rules.push({
      test: /\.svg$/,
      include: /\/icons\/(small|medium)\//,
      type: 'asset/source', // Use webpack 5's built-in instead of raw-loader
    });

    return config;
  },
}

module.exports = nextConfig;
