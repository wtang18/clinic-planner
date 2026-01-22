#!/usr/bin/env node

/**
 * Script to replace hardcoded hex colors in SVG files with currentColor
 * This ensures icons inherit text color from their parent elements
 *
 * Run: node fix-svg-colors.js
 */

const fs = require('fs');
const path = require('path');

const SMALL_ICONS_DIR = path.join(__dirname, '../icons/small');
const MEDIUM_ICONS_DIR = path.join(__dirname, '../icons/medium');

function fixSvgColors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Replace fill="#hexcolor" with fill="currentColor"
    // Match fill="#" followed by 3 or 6 hex digits
    const fillRegex = /fill="#[0-9A-Fa-f]{3,6}"/g;
    if (fillRegex.test(content)) {
      content = content.replace(fillRegex, 'fill="currentColor"');
      modified = true;
    }

    // Replace stroke="#hexcolor" with stroke="currentColor"
    const strokeRegex = /stroke="#[0-9A-Fa-f]{3,6}"/g;
    if (strokeRegex.test(content)) {
      content = content.replace(strokeRegex, 'stroke="currentColor"');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processSvgFiles(dir) {
  const files = fs.readdirSync(dir);
  let modifiedCount = 0;

  for (const file of files) {
    if (file.endsWith('.svg')) {
      const filePath = path.join(dir, file);
      if (fixSvgColors(filePath)) {
        modifiedCount++;
      }
    }
  }

  return modifiedCount;
}

// Process all icons
console.log('🔧 Fixing SVG colors to use currentColor...\n');

const smallModified = processSvgFiles(SMALL_ICONS_DIR);
console.log(`✅ Small icons: ${smallModified} files modified`);

const mediumModified = processSvgFiles(MEDIUM_ICONS_DIR);
console.log(`✅ Medium icons: ${mediumModified} files modified`);

console.log(`\n🎉 Total: ${smallModified + mediumModified} SVG files updated`);
console.log('   All icons now use currentColor and will inherit text color from parent elements.');
