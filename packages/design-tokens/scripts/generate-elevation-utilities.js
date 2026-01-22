#!/usr/bin/env node

/**
 * Generate Elevation Utility Classes
 *
 * Reads semantic elevation tokens and generates CSS utility classes
 * that bundle multiple box-shadow layers into single classes.
 *
 * Output: dist/elevation-utilities.css
 *
 * Strategy:
 * - Each elevation level (xs, sm, md, lg, xl, 2xl, inner) becomes a utility class
 * - Multi-layer shadows are combined into a single box-shadow property
 * - Classes follow naming: .elevation-{level}
 */

const fs = require('fs');
const path = require('path');

// Paths
const INPUT_FILE = path.join(__dirname, '../sd-input/semantic-elevation.json');
const OUTPUT_FILE = path.join(__dirname, '../dist/elevation-utilities.css');

// Read semantic elevation tokens
const elevationData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
const elevations = elevationData.elevation;

console.log(`📖 Reading elevation tokens...`);

/**
 * Build CSS box-shadow value from elevation tokens
 *
 * @param {string} level - Elevation level (xs, sm, md, lg, xl, 2xl, inner)
 * @param {object} layers - Layer definitions
 * @returns {object} - {shadowValue, comment}
 */
function buildBoxShadow(level, layers) {
  const shadowParts = [];
  const layerKeys = Object.keys(layers).filter(key => key.startsWith('layer-'));

  layerKeys.forEach(layerKey => {
    const layer = layers[layerKey];

    // Build shadow parts: x y blur spread color
    const parts = [
      layer.inset ? layer.inset.value : '',  // Handle inset for inner shadows
      `var(--elevation-${level}-${layerKey}-x)`,
      `var(--elevation-${level}-${layerKey}-y)`,
      `var(--elevation-${level}-${layerKey}-blur)`,
      `var(--elevation-${level}-${layerKey}-spread)`,
      `var(--elevation-${level}-${layerKey}-color)`
    ].filter(Boolean).join(' ');

    shadowParts.push(parts);
  });

  return {
    shadowValue: shadowParts.join(', '),
    comment: layers.comment || `${level.toUpperCase()} elevation`
  };
}

// Generate CSS
const cssHeader = `/**
 * Elevation Utility Classes
 *
 * Auto-generated from semantic elevation tokens.
 * DO NOT EDIT DIRECTLY - regenerate with: npm run elevation:generate
 *
 * Usage:
 *   <div className="elevation-md">Card with medium elevation</div>
 *   <button className="elevation-sm hover:elevation-md">Interactive card</button>
 *
 * Elevation Scale:
 * - elevation-xs: Extra small - Barely visible, subtle depth
 * - elevation-sm: Small - Subtle card shadow, hover states
 * - elevation-md: Medium - Default card shadow (recommended for most cards)
 * - elevation-lg: Large - Elevated cards, sticky headers, dropdowns
 * - elevation-xl: Extra large - Popovers, floating menus
 * - elevation-2xl: 2XL - Modals, dialogs, maximum elevation
 * - elevation-inner: Inner shadow - Pressed states, inset elements
 * - elevation-none: Remove shadow
 */

`;

let cssContent = cssHeader;

// Generate each elevation utility
const levels = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'inner'];

levels.forEach(level => {
  const layers = elevations[level];
  if (!layers) {
    console.warn(`⚠️  No layers found for elevation level: ${level}`);
    return;
  }

  const { shadowValue, comment } = buildBoxShadow(level, layers);

  cssContent += `/* ${comment} */\n`;
  cssContent += `.elevation-${level} {\n`;
  cssContent += `  box-shadow: ${shadowValue};\n`;
  cssContent += `}\n\n`;
});

// Add elevation-none utility
cssContent += `/* Remove all shadows */\n`;
cssContent += `.elevation-none {\n`;
cssContent += `  box-shadow: none;\n`;
cssContent += `}\n`;

// Write output
fs.writeFileSync(OUTPUT_FILE, cssContent, 'utf8');

console.log(`✅ Generated ${OUTPUT_FILE}`);
console.log(`📦 ${levels.length + 1} elevation utilities created`);
console.log('\n📋 Elevation levels:');
levels.forEach(level => {
  const layers = elevations[level];
  const layerCount = Object.keys(layers).filter(k => k.startsWith('layer-')).length;
  console.log(`   .elevation-${level} (${layerCount} ${layerCount === 1 ? 'layer' : 'layers'})`);
});
console.log(`   .elevation-none`);
