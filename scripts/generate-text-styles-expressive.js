#!/usr/bin/env node

/**
 * Generate Expressive Text Style Utilities from Figma Export
 *
 * Reads: src/design-system/figma-export/typography-expressive-figma-export.json
 * Outputs: src/design-system/tokens/build/text-styles-expressive.css
 *
 * Strategy:
 * - Expressive styles use -expressive token variants (e.g., text-font-family-display-expressive)
 * - Strip "XX→YY" numbers from token names (e.g., "display-sm-regular-24-40" → "display-sm-regular")
 * - Add .text-expressive- prefix to class names for clarity
 * - Compose from existing typography tokens
 * - Responsive sizing handled via media queries in tokens
 */

const fs = require('fs');
const path = require('path');

// Paths
const INPUT_FILE = path.join(__dirname, '../src/design-system/figma-export/typography-expressive-figma-export.json');
const OUTPUT_FILE = path.join(__dirname, '../src/design-system/tokens/build/text-styles-expressive.css');

// Read Figma export
const figmaData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
const textStyles = figmaData.styles.textStyles;

console.log(`📖 Read ${textStyles.length} text styles from Figma export`);

/**
 * Map Figma text style to token references
 *
 * Expressive mapping logic:
 * - Display → text-font-family-display-expressive
 * - Heading → text-font-family-heading-expressive
 * - Body → text-font-family-body (no expressive variant for body)
 * - Label → text-font-family-label (no expressive variant for label)
 * - Eyebrow → text-font-family-eyebrow-expressive
 */
function mapStyleToTokens(style) {
  const { name, token, fontSize, lineHeight, fontWeight, letterSpacing, textTransform } = style;

  // Parse the category from the name (e.g., "Display/Sm Regular 24→40" → "display")
  const categoryMatch = name.match(/^([^/]+)\//);
  if (!categoryMatch) {
    console.warn(`⚠️  Could not parse category from: ${name}`);
    return null;
  }

  const category = categoryMatch[1].toLowerCase(); // "display", "heading", "body", etc.

  // Strip the "XX→YY" numbers from token (e.g., "display-sm-regular-24-40" → "display-sm-regular")
  const cleanToken = token.replace(/-\d+-\d+$/, '');

  // Parse size and weight from cleaned token (e.g., "display-sm-regular" → size: "sm", weight: "regular")
  const tokenParts = cleanToken.split('-');
  const size = tokenParts[1]; // "sm", "md", "lg", "xl", "2xl", etc.
  const weight = tokenParts[2]; // "regular", "medium", "bold"

  // Determine if this category has an -expressive variant
  // Display, Heading, and Eyebrow have expressive variants
  // Body and Label do not (they use the same font as core)
  const hasExpressiveVariant = ['display', 'heading', 'eyebrow'].includes(category);
  const fontFamilySuffix = hasExpressiveVariant ? '-expressive' : '';

  // Build token references
  const tokens = {
    fontFamily: `var(--text-font-family-${category}${fontFamilySuffix})`,
    fontSize: `var(--text-font-size-${category}${fontFamilySuffix}-${size})`,
    lineHeight: `var(--text-line-height-${category}${fontFamilySuffix}-${size})`,
    fontWeight: `var(--text-font-weight-${category === 'display' ? 'display' : category}-${weight})`,
    letterSpacing: `var(--text-letter-spacing-${category}${fontFamilySuffix})`,
  };

  // Handle text-transform if present (eyebrow styles)
  const properties = { ...tokens };
  if (textTransform === 'upper') {
    properties.textTransform = 'uppercase';
  }

  return {
    className: `.text-expressive-${cleanToken}`,
    properties,
    comment: name,
  };
}

// Generate CSS
const cssHeader = `/**
 * Expressive Text Style Utilities
 *
 * Auto-generated from Figma text styles export.
 * DO NOT EDIT DIRECTLY - regenerate with: npm run text-styles:generate
 *
 * Usage:
 *   <h1 className="text-expressive-display-xl-bold text-fg-neutral-primary">
 *     Hero Title
 *   </h1>
 *
 * Font: Campton (marketing/customer-facing)
 * Responsive: Yes (scales at 768px breakpoint via media queries in tokens)
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
