/**
 * Settings Screen
 * Placeholder for settings
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import design system tokens
import {
  colorBgNeutralSubtle,
  colorFgNeutralPrimary,
  colorFgNeutralSecondary,
  dimensionSpaceAroundMd,
  dimensionSpaceAroundLg,
} from '../../../src/design-system/tokens/build/react-native/tokens';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        Settings screen placeholder
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorBgNeutralSubtle,
    padding: dimensionSpaceAroundMd.number,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colorFgNeutralPrimary,
    marginBottom: dimensionSpaceAroundLg.number,
  },
  subtitle: {
    fontSize: 14,
    color: colorFgNeutralSecondary,
    textAlign: 'center',
  },
});
