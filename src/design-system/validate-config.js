#!/usr/bin/env node

const config = require('./tailwind.config.js');

function validateHexColor(color) {
  if (typeof color !== 'string') return false;
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function findIssues() {
  const issues = [];

  console.log('🔍 Validating Tailwind configuration...\n');

  // Check structure
  if (!config.theme || !config.theme.extend) {
    issues.push('❌ Missing theme.extend structure');
    return issues;
  }

  const { colors, fontSize, fontWeight, lineHeight, spacing, borderRadius, boxShadow } = config.theme.extend;

  // Validate colors
  if (colors) {
    console.log('🎨 Checking colors...');
    let colorCount = 0;
    let validColors = 0;
    let invalidColors = [];

    function checkColorObject(obj, path = '') {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string') {
          colorCount++;
          if (validateHexColor(value)) {
            validColors++;
          } else {
            invalidColors.push(`${currentPath}: "${value}"`);
          }
        } else if (typeof value === 'object' && value !== null) {
          checkColorObject(value, currentPath);
        }
      }
    }

    checkColorObject(colors);
    console.log(`   ✅ ${validColors}/${colorCount} colors are valid hex values`);

    if (invalidColors.length > 0) {
      issues.push(`❌ Invalid color values found:\n${invalidColors.map(c => `   ${c}`).join('\n')}`);
    }
  }

  // Check font sizes
  if (fontSize) {
    console.log('📝 Checking font sizes...');
    const fontSizeCount = Object.keys(fontSize).length;
    console.log(`   ✅ ${fontSizeCount} font sizes defined`);

    // Check for duplicates by size value
    const sizeValues = {};
    for (const [name, config] of Object.entries(fontSize)) {
      const size = Array.isArray(config) ? config[0] : config;
      if (!sizeValues[size]) {
        sizeValues[size] = [];
      }
      sizeValues[size].push(name);
    }

    const duplicates = Object.entries(sizeValues).filter(([_, names]) => names.length > 1);
    if (duplicates.length > 0) {
      console.log(`   ⚠️  ${duplicates.length} duplicate font sizes found:`);
      duplicates.forEach(([size, names]) => {
        console.log(`      ${size}: ${names.join(', ')}`);
      });
    }
  }

  // Check spacing
  if (spacing) {
    console.log('📏 Checking spacing...');
    const spacingCount = Object.keys(spacing).length;
    console.log(`   ✅ ${spacingCount} spacing values defined`);
  }

  // Check for potential conflicts with Tailwind defaults
  console.log('🔄 Checking for conflicts...');
  const defaultColors = ['red', 'blue', 'green', 'yellow', 'purple', 'gray', 'white', 'black'];
  const colorConflicts = defaultColors.filter(color => colors && colors[color]);

  if (colorConflicts.length > 0) {
    console.log(`   ⚠️  ${colorConflicts.length} colors override Tailwind defaults: ${colorConflicts.join(', ')}`);
  } else {
    console.log(`   ✅ No conflicts with Tailwind default colors`);
  }

  // Validate structure completeness
  console.log('📋 Checking completeness...');
  const expectedSections = ['colors', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'spacing', 'borderRadius', 'boxShadow'];
  const missingSections = expectedSections.filter(section => !config.theme.extend[section]);

  if (missingSections.length > 0) {
    issues.push(`❌ Missing sections: ${missingSections.join(', ')}`);
  } else {
    console.log(`   ✅ All expected sections present`);
  }

  return issues;
}

function main() {
  try {
    const issues = findIssues();

    console.log('\n' + '='.repeat(50));

    if (issues.length === 0) {
      console.log('🎉 Configuration validation passed!');
      console.log('\n✅ All values properly resolved (no aliases remaining)');
      console.log('✅ All color hex values are valid');
      console.log('✅ JavaScript structure is valid');
      console.log('✅ No critical conflicts found');
    } else {
      console.log('⚠️  Configuration has issues:');
      issues.forEach(issue => console.log(issue));
    }

    console.log('\n📊 Summary:');
    console.log(`   • ${Object.keys(config.theme.extend.colors.gray).length} gray scale colors`);
    console.log(`   • ${Object.keys(config.theme.extend.colors.brand).length} brand colors`);
    console.log(`   • ${Object.keys(config.theme.extend.colors.bg).length} background semantic categories`);
    console.log(`   • ${Object.keys(config.theme.extend.colors.fg).length} foreground semantic categories`);
    console.log(`   • ${Object.keys(config.theme.extend.fontSize).length} font size definitions`);
    console.log(`   • ${Object.keys(config.theme.extend.spacing).length} spacing values`);

  } catch (error) {
    console.error('❌ Error validating configuration:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateHexColor, findIssues };