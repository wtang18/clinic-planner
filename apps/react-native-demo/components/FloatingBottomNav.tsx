/**
 * Floating Bottom Navigation
 * iOS 18-style floating segmented control at the bottom of the screen
 * Replaces traditional bottom tab bar for mobile views
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';

import { SegmentedControl } from './SegmentedControl';
import { dimensionSpaceAroundDefault } from '../../../src/design-system/tokens/build/react-native/tokens';

export interface FloatingBottomNavProps {
  /** Currently active view */
  currentView: 'month' | 'quarter' | 'year';
}

/**
 * FloatingBottomNav Component
 *
 * iOS 18-style floating navigation using a segmented control
 * positioned at the bottom of the screen with gradient fade effect.
 *
 * GRADIENT SPECS:
 * - Opacity 0.75 starts at 50% from bottom
 * - Fades to opacity 0 at top edge
 * - Creates smooth transition for content underneath
 *
 * OPTIMIZATION:
 * - Wrapped in React.memo to prevent re-renders when currentView hasn't changed
 * - Only re-renders when navigation actually occurs
 *
 * @example
 * <FloatingBottomNav currentView="month" />
 */
export const FloatingBottomNav = React.memo(function FloatingBottomNav({ currentView }: FloatingBottomNavProps) {
  const navigation = useNavigation();

  const handleViewChange = (newView: string) => {
    if (newView === 'month') {
      navigation.navigate('Month' as never);
    } else if (newView === 'quarter') {
      navigation.navigate('Quarter' as never);
    } else if (newView === 'year') {
      navigation.navigate('Year' as never);
    }
  };

  return (
    <View style={styles.floatingNavContainer}>
      {/* Gradient background with blur - fades from bottom to top */}
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <LinearGradient
            colors={['rgba(0,0,0,0.75)', 'transparent']}
            locations={[0.5, 1.0]} // Opacity 0.75 at 50% from bottom, 0 at top
            start={{ x: 0, y: 1 }} // Start from bottom
            end={{ x: 0, y: 0 }}   // End at top
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <BlurView
          intensity={100}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
        {/* Semi-transparent overlay */}
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0)']}
          locations={[0.5, 1.0]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </MaskedView>

      {/* Content layer - segmented control with safe area */}
      <SafeAreaView edges={['bottom']} style={styles.contentContainer}>
        <View style={styles.segmentedControlWrapper}>
          <SegmentedControl
            size="large"
            options={[
              { value: 'month', label: 'Month' },
              { value: 'quarter', label: 'Quarter' },
              { value: 'year', label: 'Year' },
            ]}
            value={currentView}
            onChange={handleViewChange}
            accessibilityLabel="Select calendar view"
          />
        </View>
      </SafeAreaView>
    </View>
  );
});

FloatingBottomNav.displayName = 'FloatingBottomNav';

const styles = StyleSheet.create({
  floatingNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    minHeight: 100, // Ensure enough height for gradient fade
  },
  contentContainer: {
    backgroundColor: 'transparent',
  },
  segmentedControlWrapper: {
    paddingHorizontal: dimensionSpaceAroundDefault.number,
    paddingVertical: dimensionSpaceAroundDefault.number,
    alignItems: 'center',
  },
});
