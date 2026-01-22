#!/usr/bin/env node

/**
 * Figma to Style Dictionary Parser
 *
 * Converts design-tokens-variables-full.json (Figma export) into
 * Style Dictionary compatible JSON format.
 *
 * Usage: node scripts/parse-figma-tokens.js
 */

const fs = require('fs');
const path = require('path');

const FIGMA_JSON = path.join(__dirname, '../src/design-system/tokens/design-tokens-variables-full.json');
const OUTPUT_DIR = path.join(__dirname, '../src/design-system/tokens/sd-input');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('📖 Reading Figma tokens...');
const figmaData = JSON.parse(fs.readFileSync(FIGMA_JSON, 'utf8'));

// Helper: Convert Figma color to hex
function colorToHex(color) {
  if (!color || typeof color !== 'object') return color;

  const r = Math.round((color.r || 0) * 255).toString(16).padStart(2, '0');
  const g = Math.round((color.g || 0) * 255).toString(16).padStart(2, '0');
  const b = Math.round((color.b || 0) * 255).toString(16).padStart(2, '0');
  const hex = `#${r}${g}${b}`;

  if (color.a !== undefined && color.a < 1) {
    const a = Math.round(color.a * 255).toString(16).padStart(2, '0');
    return `${hex}${a}`;
  }

  return hex;
}

// Helper: Resolve variable alias
function resolveAlias(aliasId, allVariables) {
  for (const collection of figmaData.collections) {
    const variable = collection.variables.find(v => v.id === aliasId);
    if (variable) {
      // Return reference in SD format
      return `{${variable.name.replace(/\//g, '.')}}`;
    }
  }
  return `/* UNRESOLVED: ${aliasId} */`;
}

// Helper: Map font weight strings to numeric values
function mapFontWeight(value) {
  const weightMap = {
    'Thin': '100',
    'Extra Light': '200',
    'Light': '300',
    'Regular': '400',
    'Medium': '500',
    'Semi Bold': '600',
    'Bold': '700',
    'Extra Bold': '800',
    'Black': '900'
  };
  return weightMap[value] || value;
}

// Helper: Format value based on type
function formatValue(value, resolvedType, variableName) {
  if (!value) return null;

  // Handle aliases
  if (value.type === 'VARIABLE_ALIAS') {
    return resolveAlias(value.id);
  }

  // Handle direct values
  switch (resolvedType) {
    case 'COLOR':
      return colorToHex(value);
    case 'FLOAT':
      return `${value}px`;  // Add px for dimensions
    case 'STRING':
      // Convert font weight names to numeric values
      if (variableName && variableName.includes('font-weight')) {
        return mapFontWeight(value);
      }
      return value;
    default:
      return value;
  }
}

// Helper: Get Style Dictionary token type
function getSDType(resolvedType) {
  switch (resolvedType) {
    case 'COLOR':
      return 'color';
    case 'FLOAT':
      return 'dimension';
    case 'STRING':
      return 'string';
    default:
      return 'other';
  }
}

// Process each collection
const outputFiles = {};

figmaData.collections.forEach(collection => {
  console.log(`\n📦 Processing: ${collection.name}`);

  collection.modes.forEach(mode => {
    const modeId = mode.modeId;
    const modeName = mode.name.toLowerCase().replace(/\s+/g, '-');

    // Determine output file name
    let fileName = collection.name.toLowerCase().replace(/[:\s]+/g, '-');
    if (collection.modes.length > 1 && modeName !== 'mode-1' && modeName !== 'value') {
      fileName += `-${modeName}`;
    }
    fileName += '.json';

    if (!outputFiles[fileName]) {
      outputFiles[fileName] = {};
    }

    const tokens = outputFiles[fileName];

    // Process variables
    collection.variables.forEach(variable => {
      const value = variable.valuesByMode[modeId];
      if (!value) return;

      const tokenPath = variable.name.split('/');
      let current = tokens;

      // Build nested structure
      tokenPath.forEach((segment, index) => {
        if (index === tokenPath.length - 1) {
          // Last segment - set token
          current[segment] = {
            value: formatValue(value, variable.resolvedType, variable.name),
            type: getSDType(variable.resolvedType),
          };

          if (variable.description) {
            current[segment].comment = variable.description;
          }
        } else {
          // Intermediate segment
          if (!current[segment]) {
            current[segment] = {};
          }
          current = current[segment];
        }
      });
    });
  });
});

// Add missing primitives that are referenced but not in Figma
// (Figma might have these as implicit values)
if (outputFiles['primitives-dimensions.json']) {
  const dims = outputFiles['primitives-dimensions.json'];
  if (dims.dimension && dims.dimension.space && !dims.dimension.space['0']) {
    dims.dimension.space['0'] = {
      value: '0px',
      type: 'dimension',
      comment: 'Auto-added: referenced by semantic tokens'
    };
  }
}

if (outputFiles['primitives-typography.json']) {
  const typo = outputFiles['primitives-typography.json'];
  if (!typo['font-letter-spacing']) {
    typo['font-letter-spacing'] = {};
  }
  if (!typo['font-letter-spacing']['400']) {
    typo['font-letter-spacing']['400'] = {
      value: '0px',
      type: 'dimension',
      comment: 'Auto-added: normal letter spacing'
    };
  }
}

// Write output files
console.log('\n📝 Writing Style Dictionary input files...\n');
Object.entries(outputFiles).forEach(([fileName, content]) => {
  const filePath = path.join(OUTPUT_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  console.log(`   ✅ ${fileName}`);
});

console.log('\n✨ Figma tokens parsed successfully!\n');
console.log('💡 Next step: npm run tokens:build\n');
