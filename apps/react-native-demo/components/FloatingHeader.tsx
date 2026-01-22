/**
 * Floating Header Component
 * iOS 18-style floating header with blur effect
 * Adapts to different screen types (month, quarter, year)
 *
 * OPTIMIZATION: Uses NavigationContext for screen-specific handlers
 * This allows the header to stay mounted (persistent) while only handlers change
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useNavigation } from '@react-navigation/native';

import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';
import { dimensionSpaceAroundDefault } from '../../../src/design-system/tokens/build/react-native/tokens';
import { useNavigationHandlers } from '../contexts/NavigationContext';

export interface FloatingHeaderProps {
  /** Current view type */
  currentView: 'month' | 'quarter' | 'year';

  /** Should show drawer navigation (iPad) */
  useDrawerNav: boolean;
}

/**
 * FloatingHeader Component
 *
 * Persistent floating header with navigation controls.
 * Wrapped in React.memo to prevent re-renders when props haven't changed.
 *
 * OPTIMIZATION:
 * - Uses NavigationContext to get screen-specific handlers
 * - Stays mounted during navigation (persistent)
 * - Only re-renders when currentView changes, not when handlers change
 * - This creates the illusion of persistence (no visual flicker)
 */
export const FloatingHeader = React.memo(function FloatingHeader({
  currentView,
  useDrawerNav,
}: FloatingHeaderProps) {
  const navigation = useNavigation();
  const { handlers } = useNavigationHandlers();

  // View switcher handler
  const handleViewChange = (newView: string) => {
    if (newView === 'month') {
      navigation.navigate('Month' as never);
    } else if (newView === 'quarter') {
      navigation.navigate('Quarter' as never);
    } else if (newView === 'year') {
      navigation.navigate('Year' as never);
    }
  };

  // If no handlers set yet (during initial mount), don't render buttons
  if (!handlers) {
    return null;
  }
  return (
    <View style={styles.floatingHeader}>
      {/* Blurred background with gradient fade - masked separately */}
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <LinearGradient
            colors={['black', 'transparent']}
            locations={[0, 0.7]}
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <BlurView
          intensity={100}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
        {/* Strong white overlay to obscure scrolling content */}
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.95)', 'rgba(255,255,255,0)']}
          locations={[0, 0.5, 1.0]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </MaskedView>

      {/* Content layer - always fully visible (not masked) */}
      <SafeAreaView edges={['top']} style={styles.floatingHeaderSafeArea}>
        <View style={styles.floatingHeaderContent}>
          {/* Single row: Centered segmented control (tablet only) + right-aligned nav buttons */}
          <View style={styles.floatingHeaderRow}>
            {/* Spacer for centering (only when segmented control is visible) */}
            {useDrawerNav && <View style={styles.navButtonsLeft} />}

            {/* Centered view switcher - same width as web - ONLY on tablet (drawer nav) */}
            {useDrawerNav && (
              <SegmentedControl
                options={[
                  { value: 'month', label: 'Month' },
                  { value: 'quarter', label: 'Quarter' },
                  { value: 'year', label: 'Year' },
                ]}
                value={currentView}
                onChange={handleViewChange}
                accessibilityLabel="Select calendar view"
                style={styles.viewSwitcher}
              />
            )}

            {/* Nav buttons on the right */}
            <View style={[
              styles.floatingHeaderButtons,
              !useDrawerNav && styles.floatingHeaderButtonsMobileOnly,
            ]}>
              <Button
                type="transparent"
                size="medium"
                iconOnly
                iconL="arrow-left"
                onPress={handlers.onPrevious}
                accessibilityLabel={handlers.previousLabel}
              />
              <Button
                type="transparent"
                size="medium"
                iconOnly
                iconL="arrow-right"
                onPress={handlers.onNext}
                accessibilityLabel={handlers.nextLabel}
              />
              <Button
                type="transparent"
                size="medium"
                label="Today"
                onPress={handlers.onToday}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
});

FloatingHeader.displayName = 'FloatingHeader';

const styles = StyleSheet.create({
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 120, // Fixed height for gradient mask to work properly
  },
  floatingHeaderSafeArea: {
    backgroundColor: 'transparent',
  },
  floatingHeaderContent: {
    paddingHorizontal: dimensionSpaceAroundDefault.number,
    paddingVertical: 8,
  },
  floatingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  navButtonsLeft: {
    flex: 1,
  },
  viewSwitcher: {
    width: 320, // Same as web (lg:w-[320px])
  },
  floatingHeaderButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  floatingHeaderButtonsMobileOnly: {
    // On mobile (no segmented control at top), keep buttons right-aligned
    justifyContent: 'flex-end',
  },
});
