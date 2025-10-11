/**
 * Post-process typography CSS files to wrap them in media queries
 *
 * This script wraps:
 * - semantic-typography-small.css in @media (max-width: 768px)
 * - semantic-typography-large.css in @media (min-width: 769px)
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../src/design-system/tokens/build');

// Files to wrap in media queries
const files = [
  {
    filename: 'semantic-typography-small.css',
    mediaQuery: '@media (max-width: 768px)'
  },
  {
    filename: 'semantic-typography-large.css',
    mediaQuery: '@media (min-width: 769px)'
  }
];

files.forEach(({ filename, mediaQuery }) => {
  const filePath = path.join(buildDir, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${filename} not found, skipping...`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Check if already wrapped in media query
  if (content.includes(mediaQuery)) {
    console.log(`✓ ${filename} already wrapped in media query`);
    return;
  }

  // Extract the header comment and the CSS content
  const headerMatch = content.match(/^(\/\*\*[\s\S]*?\*\/\n\n)/);
  const header = headerMatch ? headerMatch[1] : '';
  const cssContent = content.replace(header, '').trim();

  // Wrap in media query
  const wrappedContent = `${header}${mediaQuery} {
  ${cssContent.split('\n').map(line => line ? `  ${line}` : '').join('\n')}
}
`;

  fs.writeFileSync(filePath, wrappedContent);
  console.log(`✅ ${filename} wrapped in ${mediaQuery}`);
});

console.log('\n✨ Typography media queries applied successfully!');
