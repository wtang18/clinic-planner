#!/usr/bin/env node

/**
 * Generate Core Text Style Utilities from Figma Export
 *
 * Reads: figma-export/typography-core-figma-export.json
 * Outputs: dist/text-styles-core.css
 *
 * Strategy:
 * - Core styles use NON-expressive tokens (e.g., text-font-family-display, not display-expressive)
 * - Compose from existing typography tokens
 * - No responsive sizing (core is static across viewports)
 */

const fs = require('fs');
const path = require('path');

// Paths
const INPUT_FILE = path.join(__dirname, '../figma-export/typography-core-figma-export.json');
const OUTPUT_FILE = path.join(__dirname, '../dist/text-styles-core.css');

// Read Figma export
const figmaData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
const textStyles = figmaData.styles.textStyles;

console.log(`📖 Read ${textStyles.length} text styles from Figma export`);

/**
 * Map Figma text style to token references
 *
 * Core mapping logic:
 * - Display → text-font-family-display (NOT display-expressive)
 * - Heading → text-font-family-heading
 * - Body → text-font-family-body
 * - Label → text-font-family-label
 * - Eyebrow → text-font-family-eyebrow
 */
function mapStyleToTokens(style) {
  const { name, token, fontSize, lineHeight, fontWeight, letterSpacing, textTransform } = style;

  // Parse the category from the name (e.g., "Display/Sm Regular" → "display")
  const categoryMatch = name.match(/^([^/]+)\//);
  if (!categoryMatch) {
    console.warn(`⚠️  Could not parse category from: ${name}`);
    return null;
  }

  const category = categoryMatch[1].toLowerCase(); // "display", "heading", "body", etc.

  // Parse size and weight from token (e.g., "display-sm-regular" → size: "sm", weight: "regular")
  const tokenParts = token.split('-');
  const size = tokenParts[1]; // "sm", "md", "lg", "xl", "2xl", etc.
  const weight = tokenParts[2]; // "regular", "medium", "bold"

  // Build token references
  const tokens = {
    fontFamily: `var(--text-font-family-${category})`,
    fontSize: `var(--text-font-size-${category}-${size})`,
    lineHeight: `var(--text-line-height-${category}-${size})`,
    fontWeight: `var(--text-font-weight-${category === 'display' ? 'display' : category}-${weight})`,
    letterSpacing: `var(--text-letter-spacing-${category})`,
  };

  // Handle text-transform if present (eyebrow styles)
  const properties = { ...tokens };
  if (textTransform === 'upper') {
    properties.textTransform = 'uppercase';
  }

  return {
    className: `.text-${token}`,
    properties,
    comment: name,
  };
}

// Generate CSS
const cssHeader = `/**
 * Core Text Style Utilities
 *
 * Auto-generated from Figma text styles export.
 * DO NOT EDIT DIRECTLY - regenerate with: npm run text-styles:generate
 *
 * Usage:
 *   <h1 className="text-heading-xl-bold text-fg-neutral-primary">
 *     Page Title
 *   </h1>
 *
 * Font: Inter (product UI)
 * Responsive: No (static sizing across all viewports)
 * Count: ${textStyles.length} styles
 */

`;

let cssContent = cssHeader;

// Group by category for better organization
const categories = ['Display', 'Heading', 'Body', 'Label', 'Eyebrow'];

categories.forEach(category => {
  const stylesInCategory = textStyles.filter(s => s.name.startsWith(category));

  if (stylesInCategory.length === 0) return;

  cssContent += `/* ${category} Styles (${stylesInCategory.length}) */\n\n`;

  stylesInCategory.forEach(style => {
    const mapped = mapStyleToTokens(style);
    if (!mapped) return;

    const { className, properties, comment } = mapped;

    cssContent += `/* ${comment} */\n`;
    cssContent += `${className} {\n`;

    Object.entries(properties).forEach(([prop, value]) => {
      // Convert camelCase to kebab-case
      const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssContent += `  ${cssProp}: ${value};\n`;
    });

    cssContent += `}\n\n`;
  });
});

// Write output
fs.writeFileSync(OUTPUT_FILE, cssContent, 'utf8');

console.log(`✅ Generated ${OUTPUT_FILE}`);
console.log(`📦 ${textStyles.length} text style utilities created`);
console.log('\n📋 Categories:');
categories.forEach(cat => {
  const count = textStyles.filter(s => s.name.startsWith(cat)).length;
  if (count > 0) {
    console.log(`   ${cat}: ${count} styles`);
  }
});
