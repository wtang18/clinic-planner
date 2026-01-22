/**
 * Home Screen
 * Shows the responsive demo content
 */

import React from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Import design system tokens
import {
  colorBgNeutralBase,
  colorBgNeutralSubtle,
  colorFgNeutralPrimary,
  colorFgNeutralSecondary,
  dimensionSpaceAroundMd,
  dimensionSpaceAroundLg,
  dimensionSpaceBetweenRelatedSm,
  dimensionRadiusMd,
} from '../../../src/design-system/tokens/build/react-native/tokens';
import { elevation } from '../../../src/design-system/tokens/build/react-native/elevation';

// Import responsive utilities
import { useDeviceType, useAdaptiveLayout, BREAKPOINTS } from '../utils/responsive';

export default function HomeScreen() {
  const device = useDeviceType();
  const layout = useAdaptiveLayout();

  // Debug: Get raw dimensions
  const screen = Dimensions.get('screen');
  const window = Dimensions.get('window');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="auto" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>✅ React Native Sample App</Text>
          <Text style={styles.subtitle}>Design System Integration Demo</Text>
        </View>

        {/* Debug Info Card */}
        <View style={[styles.card, { backgroundColor: '#fff3cd' }]}>
          <Text style={styles.cardTitle}>🐛 Debug Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Platform:</Text>
            <Text style={styles.value}>{Platform.OS}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Screen Size:</Text>
            <Text style={styles.value}>{Math.round(screen.width)} × {Math.round(screen.height)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Window Size:</Text>
            <Text style={styles.value}>{Math.round(window.width)} × {Math.round(window.height)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Hook Width:</Text>
            <Text style={styles.value}>{Math.round(device.width)}px</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Device Type:</Text>
            <Text style={styles.value}>{device.type}</Text>
          </View>
        </View>

        {/* Device Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Device Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Device Type:</Text>
            <Text style={styles.value}>{device.type}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Width:</Text>
            <Text style={styles.value}>{Math.round(device.width)}px</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Height:</Text>
            <Text style={styles.value}>{Math.round(device.height)}px</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Orientation:</Text>
            <Text style={styles.value}>
              {device.isPortrait ? 'Portrait' : 'Landscape'}
            </Text>
          </View>

          <View style={styles.badges}>
            {device.isPhone && <View style={styles.badge}><Text style={styles.badgeText}>Phone</Text></View>}
            {device.isTablet && <View style={styles.badge}><Text style={styles.badgeText}>Tablet</Text></View>}
            {device.isTabletLarge && <View style={styles.badge}><Text style={styles.badgeText}>Large Tablet</Text></View>}
          </View>
        </View>

        {/* Layout Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Adaptive Layout</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Layout Size:</Text>
            <Text style={styles.value}>{layout.size}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Grid Columns:</Text>
            <Text style={styles.value}>{layout.columns}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Navigation:</Text>
            <Text style={styles.value}>
              {layout.useDrawerNav ? 'Drawer (iPad)' : 'Stack+Tabs (iPhone)'}
            </Text>
          </View>

          {layout.isProbablySplitView && (
            <View style={[styles.badge, styles.warningBadge]}>
              <Text style={styles.badgeText}>⚠️ Probably Split View</Text>
            </View>
          )}
        </View>

        {/* Breakpoints Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Breakpoints</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Compact:</Text>
            <Text style={styles.value}>&lt; {BREAKPOINTS.COMPACT}px</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>&lt; {BREAKPOINTS.PHONE}px</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Tablet:</Text>
            <Text style={styles.value}>&lt; {BREAKPOINTS.TABLET}px</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Large Tablet:</Text>
            <Text style={styles.value}>{BREAKPOINTS.TABLET_LARGE}px+</Text>
          </View>
        </View>

        {/* Adaptive Grid Demo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Adaptive Grid Demo</Text>
          <Text style={styles.description}>
            This grid changes from 1 → 2 → 3 columns based on window width.
            Try iPad Split View to see it adapt!
          </Text>

          <View style={styles.gridContainer}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View
                key={item}
                style={[
                  styles.gridItem,
                  {
                    width: layout.columns === 1
                      ? '100%'
                      : layout.columns === 2
                      ? `${(100 - 2) / 2}%`  // 2% gap between items
                      : `${(100 - 4) / 3}%`, // 4% gap between items
                  },
                ]}
              >
                <Text style={styles.gridItemText}>Item {item}</Text>
                <Text style={styles.gridItemSubtext}>
                  {layout.columns} {layout.columns === 1 ? 'column' : 'columns'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>
          Try iPad Split View (⌘+Ctrl+Left/Right) or rotate device to see adaptive behavior
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorBgNeutralSubtle,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: dimensionSpaceAroundMd.number,
  },
  header: {
    marginBottom: dimensionSpaceAroundLg.number,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colorFgNeutralPrimary,
    marginBottom: dimensionSpaceBetweenRelatedSm.number,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colorFgNeutralSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colorBgNeutralBase,
    borderRadius: dimensionRadiusMd.number,
    padding: dimensionSpaceAroundMd.number,
    marginBottom: dimensionSpaceAroundMd.number,
    ...elevation.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colorFgNeutralPrimary,
    marginBottom: dimensionSpaceAroundMd.number,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: dimensionSpaceBetweenRelatedSm.number,
  },
  label: {
    fontSize: 14,
    color: colorFgNeutralSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colorFgNeutralPrimary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dimensionSpaceBetweenRelatedSm.number,
    marginTop: dimensionSpaceBetweenRelatedSm.number,
  },
  badge: {
    backgroundColor: colorBgNeutralSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  warningBadge: {
    backgroundColor: '#fff3cd',
    marginTop: dimensionSpaceBetweenRelatedSm.number,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colorFgNeutralPrimary,
  },
  description: {
    fontSize: 14,
    color: colorFgNeutralSecondary,
    lineHeight: 20,
    marginBottom: dimensionSpaceAroundMd.number,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dimensionSpaceBetweenRelatedSm.number,
  },
  gridItem: {
    backgroundColor: colorBgNeutralSubtle,
    borderRadius: dimensionRadiusMd.number,
    padding: dimensionSpaceAroundMd.number,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.sm,
  },
  gridItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colorFgNeutralPrimary,
    marginBottom: dimensionSpaceBetweenRelatedSm.number,
  },
  gridItemSubtext: {
    fontSize: 12,
    color: colorFgNeutralSecondary,
  },
  footer: {
    fontSize: 12,
    color: colorFgNeutralSecondary,
    textAlign: 'center',
    marginTop: dimensionSpaceAroundLg.number,
    fontStyle: 'italic',
  },
});
