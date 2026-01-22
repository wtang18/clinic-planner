#!/usr/bin/env node

/**
 * Style Dictionary Configuration - React Native Multi-Theme
 *
 * Generates product-specific theme token files for React Native.
 * Each product gets a single file with both lightTokens and darkTokens.
 *
 * Output: dist/react-native/themes/
 *   - pro-tokens.ts        (Pro base)
 *   - pro-ehr-tokens.ts    (Pro + EHR teal accent)
 *   - pro-billing-tokens.ts (Pro + Billing purple accent)
 *   - consumer-tokens.ts   (Consumer base)
 *
 * Usage: npm run tokens:build:rn-themes
 */

const StyleDictionary = require('style-dictionary').default;

// =============================================================================
// HELPER: Create source arrays for different builds
// =============================================================================

const primitives = [
  'sd-input/primitives/color-ramp.json',
  'sd-input/primitives/color-ramp-extensions.json', // Teal, orange for product themes
  'sd-input/primitives/typography.json',
  'sd-input/primitives/typography-extensions.json', // Friendly fonts for Consumer
  'sd-input/primitives/dimensions.json',
  'sd-input/primitives/dimensions-extensions.json', // Consumer generous spacing
  'sd-input/primitives/elevation.json',
];

const proBaseLight = [
  ...primitives,
  'sd-input/decorative/color-on-light.json',
  'sd-input/bases/pro/semantic-color-light.json',
  'sd-input/bases/pro/semantic-dimensions.json',
  'sd-input/bases/pro/semantic-elevation.json',
  'sd-input/bases/pro/semantic-typography-small.json',
];

const proBaseDark = [
  ...primitives,
  'sd-input/decorative/color-on-dark.json',
  'sd-input/bases/pro/semantic-color-dark.json',
  'sd-input/bases/pro/semantic-dimensions.json',
  'sd-input/bases/pro/semantic-elevation.json',
  'sd-input/bases/pro/semantic-typography-small.json',
];

const consumerBaseLight = [
  ...primitives,
  'sd-input/decorative/color-on-light.json',
  'sd-input/bases/consumer/semantic-color-light.json',
  'sd-input/bases/consumer/semantic-dimensions.json',
  'sd-input/bases/consumer/semantic-elevation.json',
  'sd-input/bases/consumer/semantic-typography-small.json',
];

const consumerBaseDark = [
  ...primitives,
  'sd-input/decorative/color-on-dark.json',
  'sd-input/bases/consumer/semantic-color-dark.json',
  'sd-input/bases/consumer/semantic-dimensions.json',
  'sd-input/bases/consumer/semantic-elevation.json',
  'sd-input/bases/consumer/semantic-typography-small.json',
];

// Theme overrides (sparse - only accent colors)
const ehrOverride = 'sd-input/themes/pro/ehr/overrides.json';
const billingOverride = 'sd-input/themes/pro/billing/overrides.json';
const operationsOverride = 'sd-input/themes/pro/operations/overrides.json';
const patientAppOverride = 'sd-input/themes/pro/patient-app/overrides.json';

// =============================================================================
// CUSTOM FORMAT: React Native Theme Tokens Object
// =============================================================================

// Convert PascalCase token name to camelCase (e.g., ColorBgNeutralBase → colorBgNeutralBase)
const toCamelCase = (name) => {
  return name.charAt(0).toLowerCase() + name.slice(1);
};

// Custom format function
const themeObjectFormatter = ({ dictionary, options }) => {
  const objectName = options.objectName || 'tokens';

  // Build the tokens object
  const tokens = {};
  dictionary.allTokens.forEach((token) => {
    const name = toCamelCase(token.name);
    tokens[name] = token.value;
  });

  // Sort keys for consistent output
  const sortedKeys = Object.keys(tokens).sort();
  const lines = sortedKeys.map((key) => {
    const value = tokens[key];
    // Handle strings vs numbers
    const formattedValue = typeof value === 'string' ? `'${value}'` : value;
    return `  ${key}: ${formattedValue},`;
  });

  return `export const ${objectName} = {\n${lines.join('\n')}\n};\n`;
};

// =============================================================================
// BUILD CONFIGURATIONS
// =============================================================================

const buildPath = 'dist/react-native/themes/';

// Filter to only include semantic tokens (not primitives)
const semanticFilter = (token) => {
  return (
    token.filePath.includes('semantic-') ||
    token.filePath.includes('overrides')
  );
};

const builds = [
  // Pro Base
  { name: 'pro-light', source: proBaseLight, destination: '_pro-light.ts', objectName: 'lightTokens' },
  { name: 'pro-dark', source: proBaseDark, destination: '_pro-dark.ts', objectName: 'darkTokens' },

  // Pro + EHR (teal accent)
  { name: 'pro-ehr-light', source: [...proBaseLight, ehrOverride], destination: '_pro-ehr-light.ts', objectName: 'lightTokens' },
  { name: 'pro-ehr-dark', source: [...proBaseDark, ehrOverride], destination: '_pro-ehr-dark.ts', objectName: 'darkTokens' },

  // Pro + Billing (purple accent)
  { name: 'pro-billing-light', source: [...proBaseLight, billingOverride], destination: '_pro-billing-light.ts', objectName: 'lightTokens' },
  { name: 'pro-billing-dark', source: [...proBaseDark, billingOverride], destination: '_pro-billing-dark.ts', objectName: 'darkTokens' },

  // Pro + Operations (orange accent)
  { name: 'pro-operations-light', source: [...proBaseLight, operationsOverride], destination: '_pro-operations-light.ts', objectName: 'lightTokens' },
  { name: 'pro-operations-dark', source: [...proBaseDark, operationsOverride], destination: '_pro-operations-dark.ts', objectName: 'darkTokens' },

  // Pro + Patient App (green accent)
  { name: 'pro-patient-app-light', source: [...proBaseLight, patientAppOverride], destination: '_pro-patient-app-light.ts', objectName: 'lightTokens' },
  { name: 'pro-patient-app-dark', source: [...proBaseDark, patientAppOverride], destination: '_pro-patient-app-dark.ts', objectName: 'darkTokens' },

  // Consumer Base
  { name: 'consumer-light', source: consumerBaseLight, destination: '_consumer-light.ts', objectName: 'lightTokens' },
  { name: 'consumer-dark', source: consumerBaseDark, destination: '_consumer-dark.ts', objectName: 'darkTokens' },
];

// =============================================================================
// BUILD FUNCTION
// =============================================================================

async function buildAll() {
  console.log('\n🎨 Building React Native theme tokens...\n');

  for (const build of builds) {
    console.log(`  Building ${build.name}...`);

    // Create SD instance with custom format hook
    const sd = new StyleDictionary({
      source: build.source,
      hooks: {
        formats: {
          'typescript/theme-object': themeObjectFormatter,
        },
      },
      platforms: {
        'react-native': {
          transformGroup: 'js',
          buildPath: buildPath,
          files: [
            {
              destination: build.destination,
              format: 'typescript/theme-object',
              filter: semanticFilter,
              options: {
                objectName: build.objectName,
                outputReferences: false,
              },
            },
          ],
        },
      },
    });

    await sd.buildAllPlatforms();
  }

  console.log('\n✅ Individual theme builds complete!');
  console.log('📦 Combining into final theme files...\n');
}

// Run if called directly
buildAll().catch(console.error);
