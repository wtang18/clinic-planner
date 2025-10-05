#!/usr/bin/env node

/**
 * Script to generate TypeScript icon name types from SVG files
 * Run: node generate-icon-types.js
 */

const fs = require('fs');
const path = require('path');

const SMALL_ICONS_DIR = path.join(__dirname, 'small');
const MEDIUM_ICONS_DIR = path.join(__dirname, 'medium');
const OUTPUT_FILE = path.join(__dirname, 'icon-names.ts');

function getIconNames(dir, removeSuffix = '') {
  const files = fs.readdirSync(dir);
  return files
    .filter(file => file.endsWith('.svg'))
    .map(file => {
      let name = file.replace('.svg', '');
      if (removeSuffix && name.endsWith(removeSuffix)) {
        name = name.slice(0, -removeSuffix.length);
      }
      return name;
    })
    .sort();
}

// Get icon names from both directories
const smallIconNames = getIconNames(SMALL_ICONS_DIR, '-small');
const mediumIconNames = getIconNames(MEDIUM_ICONS_DIR);

// Combine and deduplicate
const allIconNames = [...new Set([...smallIconNames, ...mediumIconNames])].sort();

// Generate TypeScript file
const tsContent = `/**
 * Auto-generated icon name types
 * DO NOT EDIT MANUALLY - Run 'node generate-icon-types.js' to regenerate
 *
 * Generated on: ${new Date().toISOString()}
 * Total icons: ${allIconNames.length}
 * Small icons: ${smallIconNames.length}
 * Medium icons: ${mediumIconNames.length}
 */

export type IconName =
${allIconNames.map(name => `  | "${name}"`).join('\n')};

export const SMALL_ICON_NAMES: readonly IconName[] = [
${smallIconNames.map(name => `  "${name}",`).join('\n')}
] as const;

export const MEDIUM_ICON_NAMES: readonly IconName[] = [
${mediumIconNames.map(name => `  "${name}",`).join('\n')}
] as const;

export const ALL_ICON_NAMES: readonly IconName[] = [
${allIconNames.map(name => `  "${name}",`).join('\n')}
] as const;
`;

fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');

console.log(`✅ Generated icon types at: ${OUTPUT_FILE}`);
console.log(`📊 Total icons: ${allIconNames.length}`);
console.log(`   - Small icons: ${smallIconNames.length}`);
console.log(`   - Medium icons: ${mediumIconNames.length}`);
console.log(`   - Icons available in both sizes: ${smallIconNames.filter(name => mediumIconNames.includes(name)).length}`);
