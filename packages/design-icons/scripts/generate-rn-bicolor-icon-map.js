/**
 * Generate React Native bicolor icon map with inlined SVG strings
 *
 * This script reads all SVG files from bicolor/small/ and bicolor/medium/ directories
 * and generates a TypeScript file with SVG content inlined as strings.
 *
 * Unlike the web version (which uses Vite's ?raw import), this directly
 * embeds the SVG content for Metro bundler compatibility.
 *
 * Run: npm run icons:build:rn
 * Or:  node src/design-system/icons/generate-rn-bicolor-icon-map.js
 *
 * Documentation: See src/design-system/icons/README.md
 */

const fs = require('fs');
const path = require('path');

const SMALL_DIR = path.join(__dirname, 'bicolor/small');
const MEDIUM_DIR = path.join(__dirname, 'bicolor/medium');
const OUTPUT_FILE = path.join(__dirname, '../bicolor-icon-map.rn.ts');

/**
 * Get all SVG files from a directory
 */
function getSvgFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.svg'))
    .sort();
}

/**
 * Read SVG file content and escape for JavaScript string
 */
function readSvgContent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Escape backticks and backslashes for template literal
  return content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

/**
 * Generate the React Native bicolor icon map file
 */
function generateRnBicolorIconMap() {
  const smallFiles = getSvgFiles(SMALL_DIR);
  const mediumFiles = getSvgFiles(MEDIUM_DIR);

  const smallMap = [];
  const mediumMap = [];

  // Generate map entries for small bicolor icons with inlined SVG content
  smallFiles.forEach((file) => {
    const filePath = path.join(SMALL_DIR, file);
    const svgContent = readSvgContent(filePath);
    smallMap.push(`  './${file}': \`${svgContent}\`,`);
  });

  // Generate map entries for medium bicolor icons with inlined SVG content
  mediumFiles.forEach((file) => {
    const filePath = path.join(MEDIUM_DIR, file);
    const svgContent = readSvgContent(filePath);
    mediumMap.push(`  './${file}': \`${svgContent}\`,`);
  });

  const content = `/**
 * Auto-generated React Native bicolor icon map with inlined SVG strings
 * DO NOT EDIT MANUALLY - Run 'npm run icons:build:rn' to regenerate
 *
 * Generated on: ${new Date().toISOString()}
 * Small bicolor icons: ${smallFiles.length}
 * Medium bicolor icons: ${mediumFiles.length}
 *
 * This file is specific to React Native (Metro bundler) which doesn't support
 * Vite's ?raw import syntax. SVG content is inlined directly as strings.
 */

export const smallBicolorIconMap: Record<string, string> = {
${smallMap.join('\n')}
};

export const mediumBicolorIconMap: Record<string, string> = {
${mediumMap.join('\n')}
};
`;

  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`✅ Generated ${OUTPUT_FILE}`);
  console.log(`   Small bicolor icons: ${smallFiles.length}`);
  console.log(`   Medium bicolor icons: ${mediumFiles.length}`);
}

try {
  generateRnBicolorIconMap();
} catch (error) {
  console.error('❌ Error generating RN bicolor icon map:', error);
  process.exit(1);
}
