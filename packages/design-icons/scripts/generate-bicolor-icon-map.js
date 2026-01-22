/**
 * Generate bicolor icon map with static imports for Next.js compatibility
 *
 * This script reads all SVG files from bicolor/small/ and bicolor/medium/ directories
 * and generates a TypeScript file with static imports.
 *
 * Run: npm run generate-bicolor-icon-map
 * Or:  node src/design-system/icons/generate-bicolor-icon-map.js
 *
 * Documentation: See src/design-system/icons/README.md
 */

const fs = require('fs');
const path = require('path');

const SMALL_DIR = path.join(__dirname, 'bicolor/small');
const MEDIUM_DIR = path.join(__dirname, 'bicolor/medium');
const OUTPUT_FILE = path.join(__dirname, '../bicolor-icon-map.ts');

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
 * Generate the bicolor icon map file
 */
function generateBicolorIconMap() {
  const smallFiles = getSvgFiles(SMALL_DIR);
  const mediumFiles = getSvgFiles(MEDIUM_DIR);

  const imports = [];
  const smallMap = [];
  const mediumMap = [];

  // Generate imports and map entries for small bicolor icons
  smallFiles.forEach((file, index) => {
    const varName = `SmallBicolorIcon${index}`;
    const importPath = `./bicolor/small/${file}`;
    imports.push(`import ${varName} from '${importPath}?raw';`);
    smallMap.push(`  './${file}': ${varName},`);
  });

  // Generate imports and map entries for medium bicolor icons
  mediumFiles.forEach((file, index) => {
    const varName = `MediumBicolorIcon${index}`;
    const importPath = `./bicolor/medium/${file}`;
    imports.push(`import ${varName} from '${importPath}?raw';`);
    mediumMap.push(`  './${file}': ${varName},`);
  });

  const content = `/**
 * Auto-generated bicolor icon map with static imports
 * DO NOT EDIT MANUALLY - Run 'npm run generate-bicolor-icon-map' to regenerate
 *
 * Generated on: ${new Date().toISOString()}
 * Small bicolor icons: ${smallFiles.length}
 * Medium bicolor icons: ${mediumFiles.length}
 */

${imports.join('\n')}

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
  generateBicolorIconMap();
} catch (error) {
  console.error('❌ Error generating bicolor icon map:', error);
  process.exit(1);
}
