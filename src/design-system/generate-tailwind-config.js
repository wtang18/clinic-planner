#!/usr/bin/env node

const {
  resolveVariable,
  getVariableByName,
  getAvailableCollections,
  findVariablesByPattern,
  variableMap,
  collectionMap
} = require('./tokens/figma-variables-resolver.js');

// Helper function to normalize Figma variable names to Tailwind format
function normalizeVariableName(name) {
  return name
    .toLowerCase()
    .replace(/[\s\-\.\/]/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to convert RGB to hex
function rgbToHex(rgb) {
  if (typeof rgb === 'string') return rgb;
  if (rgb && typeof rgb === 'object' && rgb.r !== undefined) {
    const r = Math.round(rgb.r * 255);
    const g = Math.round(rgb.g * 255);
    const b = Math.round(rgb.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return rgb;
}

// Extract and organize color tokens
function extractColors() {
  const colors = {};

  // Find all color variables
  const colorVariables = [];
  for (const variable of variableMap.values()) {
    if (variable.resolvedType === 'COLOR') {
      colorVariables.push(variable);
    }
  }

  // Group colors by category
  const colorCategories = {
    'gray': {},
    'cream': {},
    'blue': {},
    'green': {},
    'yellow': {},
    'red': {},
    'purple': {},
    'saturated-red': {},
    'brand': {},
    'bg': {},
    'fg': {},
    'utility': {},
    'white': null,
    'black': null
  };

  colorVariables.forEach(variable => {
    const name = variable.name.toLowerCase();
    const resolvedValue = resolveVariable(variable.id);
    const hexValue = rgbToHex(resolvedValue);

    // Skip null/undefined values
    if (!resolvedValue || resolvedValue === 'null') return;

    // Categorize colors based on name patterns
    if (name.includes('gray') || name.includes('grey')) {
      const match = name.match(/(\d+)/);
      if (match) {
        colorCategories.gray[match[1]] = hexValue;
      }
    } else if (name.includes('cream')) {
      const match = name.match(/(\d+)/);
      if (match) {
        colorCategories.cream[match[1]] = hexValue;
      }
    } else if (name.includes('blue')) {
      const match = name.match(/(\d+)/);
      if (match) {
        if (!colorCategories.blue) colorCategories.blue = {};
        colorCategories.blue[match[1]] = hexValue;
      }
    } else if (name.includes('green')) {
      const match = name.match(/(\d+)/);
      if (match) {
        if (!colorCategories.green) colorCategories.green = {};
        colorCategories.green[match[1]] = hexValue;
      }
    } else if (name.includes('yellow')) {
      const match = name.match(/(\d+)/);
      if (match) {
        if (!colorCategories.yellow) colorCategories.yellow = {};
        colorCategories.yellow[match[1]] = hexValue;
      }
    } else if (name.includes('red') && !name.includes('saturated')) {
      const match = name.match(/(\d+)/);
      if (match) {
        if (!colorCategories.red) colorCategories.red = {};
        colorCategories.red[match[1]] = hexValue;
      }
    } else if (name.includes('purple')) {
      const match = name.match(/(\d+)/);
      if (match) {
        if (!colorCategories.purple) colorCategories.purple = {};
        colorCategories.purple[match[1]] = hexValue;
      }
    } else if (name.includes('saturated') && name.includes('red')) {
      const match = name.match(/(\d+)/);
      if (match) {
        if (!colorCategories['saturated-red']) colorCategories['saturated-red'] = {};
        colorCategories['saturated-red'][match[1]] = hexValue;
      }
    } else if (name.includes('brand') || name.includes('logo') || name.includes('carby')) {
      const normalizedName = normalizeVariableName(name.replace(/^(brand-?|logo-?)/, ''));
      if (!colorCategories.brand) colorCategories.brand = {};
      colorCategories.brand[normalizedName] = hexValue;
    } else if (name.includes('bg/') || name.includes('background')) {
      const parts = name.split('/').slice(1); // Remove 'bg'
      if (parts.length >= 2) {
        const category = parts[0];
        const variant = parts[1];
        if (!colorCategories.bg) colorCategories.bg = {};
        if (!colorCategories.bg[category]) colorCategories.bg[category] = {};
        colorCategories.bg[category][variant.replace(/-/g, '-')] = hexValue;
      }
    } else if (name.includes('fg/') || name.includes('foreground')) {
      const parts = name.split('/').slice(1); // Remove 'fg'
      if (parts.length >= 2) {
        const category = parts[0];
        const variant = parts[1];
        if (!colorCategories.fg) colorCategories.fg = {};
        if (!colorCategories.fg[category]) colorCategories.fg[category] = {};
        colorCategories.fg[category][variant.replace(/-/g, '-')] = hexValue;
      }
    } else if (name === 'white') {
      colors.white = hexValue;
    } else if (name === 'black') {
      colors.black = hexValue;
    } else {
      // Utility or other colors
      const normalizedName = normalizeVariableName(name);
      if (!colorCategories.utility) colorCategories.utility = {};
      colorCategories.utility[normalizedName] = hexValue;
    }
  });

  // Convert arrays to objects and merge into colors
  Object.keys(colorCategories).forEach(category => {
    if (colorCategories[category] && Object.keys(colorCategories[category]).length > 0) {
      colors[category] = colorCategories[category];
    }
  });

  return colors;
}

// Extract typography tokens
function extractTypography() {
  const typography = {
    fontFamily: {
      'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif']
    },
    fontSize: {},
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeight: {}
  };

  // Find typography variables
  for (const variable of variableMap.values()) {
    const name = variable.name.toLowerCase();
    const resolvedValue = resolveVariable(variable.id);

    if (variable.resolvedType === 'STRING' && name.includes('font')) {
      // Handle font family
      if (name.includes('family')) {
        const fontName = normalizeVariableName(name.replace(/font-?family-?/, ''));
        if (!typography.fontFamily[fontName]) {
          typography.fontFamily[fontName] = [resolvedValue];
        }
      }
    } else if (variable.resolvedType === 'FLOAT' && (name.includes('font') || name.includes('text') || name.includes('size'))) {
      // Handle font sizes
      const sizeValue = `${resolvedValue}px`;

      if (name.includes('heading')) {
        const sizeName = name.match(/(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl)/)?.[1] || 'base';
        typography.fontSize[`heading-${sizeName}`] = [sizeValue, { lineHeight: `${Math.round(resolvedValue * 1.4)}px`, fontWeight: '600' }];
      } else if (name.includes('display')) {
        const sizeName = name.match(/(sm|md|lg|xl|2xl)/)?.[1] || 'base';
        typography.fontSize[`display-${sizeName}`] = [sizeValue, { lineHeight: `${Math.round(resolvedValue * 1.33)}px`, fontWeight: '600' }];
      } else if (name.includes('body') || name.includes('text')) {
        const sizeName = name.match(/(2xs|xs|sm|base|lg|xl)/)?.[1] || 'base';
        const weight = name.includes('bold') ? '600' : '400';
        typography.fontSize[sizeName] = [sizeValue, { lineHeight: `${Math.round(resolvedValue * 1.5)}px`, fontWeight: weight }];
        if (name.includes('bold')) {
          typography.fontSize[`${sizeName}-bold`] = [sizeValue, { lineHeight: `${Math.round(resolvedValue * 1.5)}px`, fontWeight: '600' }];
        }
      }
    } else if (variable.resolvedType === 'FLOAT' && name.includes('line-height')) {
      const lineHeightValue = `${resolvedValue}px`;
      const heightName = normalizeVariableName(name.replace(/line-?height-?/, ''));
      typography.lineHeight[heightName] = lineHeightValue;
    }
  }

  return typography;
}

// Extract spacing tokens
function extractSpacing() {
  const spacing = {};

  for (const variable of variableMap.values()) {
    const name = variable.name.toLowerCase();
    const resolvedValue = resolveVariable(variable.id);

    if (variable.resolvedType === 'FLOAT' && (name.includes('spacing') || name.includes('gap') || name.includes('margin') || name.includes('padding'))) {
      const spacingValue = `${resolvedValue}px`;
      const spacingName = normalizeVariableName(name.replace(/(spacing-?|gap-?|margin-?|padding-?)/, ''));

      // Map common spacing values to Tailwind scale
      if (resolvedValue % 4 === 0) {
        const scale = resolvedValue / 4;
        spacing[scale.toString()] = spacingValue;
      } else {
        spacing[spacingName] = spacingValue;
      }
    }
  }

  return spacing;
}

// Extract border radius tokens
function extractBorderRadius() {
  const borderRadius = {
    'none': '0',
    'sm': '2px',
    DEFAULT: '4px',
    'md': '6px',
    'lg': '8px',
    'xl': '12px',
    '2xl': '16px',
    '3xl': '24px',
    'full': '9999px'
  };

  for (const variable of variableMap.values()) {
    const name = variable.name.toLowerCase();
    const resolvedValue = resolveVariable(variable.id);

    if (variable.resolvedType === 'FLOAT' && (name.includes('radius') || name.includes('corner'))) {
      const radiusValue = `${resolvedValue}px`;
      const radiusName = normalizeVariableName(name.replace(/(radius-?|corner-?)/, ''));
      borderRadius[radiusName] = radiusValue;
    }
  }

  return borderRadius;
}

// Generate the complete Tailwind config
function generateTailwindConfig() {
  console.log('🎨 Extracting Figma design tokens...');

  const colors = extractColors();
  const typography = extractTypography();
  const spacing = extractSpacing();
  const borderRadius = extractBorderRadius();

  console.log(`📊 Extracted ${Object.keys(colors).length} color categories`);
  console.log(`🔤 Extracted ${Object.keys(typography.fontSize).length} font sizes`);
  console.log(`📏 Extracted ${Object.keys(spacing).length} spacing tokens`);

  const config = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors,
        ...typography,
        spacing,
        borderRadius,
        boxShadow: {
          'xs': '0px 1px 2px rgba(0, 0, 0, 0.05)',
          'sm': '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          DEFAULT: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'md': '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
          'lg': '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
          'xl': '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
          '2xl': '0px 35px 60px -15px rgba(0, 0, 0, 0.3)',
          'inner': 'inset 0px 2px 4px rgba(0, 0, 0, 0.06)',
          'none': 'none'
        }
      }
    },
    plugins: []
  };

  return config;
}

// Format the config as a proper JavaScript module
function formatConfigFile(config) {
  const header = `/** @type {import('tailwindcss').Config} */

/**
 * Tailwind Configuration Generated from Figma Design Tokens
 * Generated on: ${new Date().toISOString()}
 *
 * This configuration was automatically generated from Figma design tokens
 * using the figma-variables-resolver.js utility. All variable aliases
 * have been resolved to their final values.
 *
 * Token Categories:
 * - Colors (Core scales, Semantic tokens, Brand colors)
 * - Typography (Font sizes, weights, line heights)
 * - Spacing (Margin, padding, gap values)
 * - Border radius (Corner radius values)
 * - Box shadows (Elevation system)
 */

module.exports = `;

  return header + JSON.stringify(config, null, 2);
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Tailwind config generation...');

    const collections = getAvailableCollections();
    console.log('📁 Available collections:', Object.keys(collections));

    const config = generateTailwindConfig();
    const configFile = formatConfigFile(config);

    console.log('✅ Tailwind config generated successfully!');
    console.log('📝 Writing to src/design-system/tailwind.config.js...');

    // Write to file
    const fs = require('fs').promises;
    const path = require('path');

    const outputPath = path.join(__dirname, 'tailwind.config.js');
    await fs.writeFile(outputPath, configFile, 'utf8');

    console.log('🎉 Done! Tailwind config saved to:', outputPath);

  } catch (error) {
    console.error('❌ Error generating Tailwind config:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { generateTailwindConfig, formatConfigFile };