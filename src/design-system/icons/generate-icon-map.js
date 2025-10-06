/**
 * Generate icon map with static imports for Next.js compatibility
 *
 * This script reads all SVG files from small/ and medium/ directories
 * and generates a TypeScript file with static imports.
 *
 * Run: node src/design-system/icons/generate-icon-map.js
 */

const fs = require('fs');
const path = require('path');

const SMALL_DIR = path.join(__dirname, 'small');
const MEDIUM_DIR = path.join(__dirname, 'medium');
const OUTPUT_FILE = path.join(__dirname, 'icon-map.ts');

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
 * Generate the icon map file
 */
function generateIconMap() {
  const smallFiles = getSvgFiles(SMALL_DIR);
  const mediumFiles = getSvgFiles(MEDIUM_DIR);

  const imports = [];
  const smallMap = [];
  const mediumMap = [];

  // Generate imports and map entries for small icons
  smallFiles.forEach((file, index) => {
    const varName = `SmallIcon${index}`;
    const importPath = `./small/${file}`;
    imports.push(`import ${varName} from '${importPath}?raw';`);
    smallMap.push(`  './${file}': ${varName},`);
  });

  // Generate imports and map entries for medium icons
  mediumFiles.forEach((file, index) => {
    const varName = `MediumIcon${index}`;
    const importPath = `./medium/${file}`;
    imports.push(`import ${varName} from '${importPath}?raw';`);
    mediumMap.push(`  './${file}': ${varName},`);
  });

  const content = `/**
 * Auto-generated icon map with static imports
 * DO NOT EDIT MANUALLY - Run 'npm run generate-icon-map' to regenerate
 *
 * Generated on: ${new Date().toISOString()}
 * Small icons: ${smallFiles.length}
 * Medium icons: ${mediumFiles.length}
 */

${imports.join('\n')}

export const smallIconMap: Record<string, string> = {
${smallMap.join('\n')}
};

export const mediumIconMap: Record<string, string> = {
${mediumMap.join('\n')}
};
`;

  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`✅ Generated ${OUTPUT_FILE}`);
  console.log(`   Small icons: ${smallFiles.length}`);
  console.log(`   Medium icons: ${mediumFiles.length}`);
}

try {
  generateIconMap();
} catch (error) {
  console.error('❌ Error generating icon map:', error);
  process.exit(1);
}
