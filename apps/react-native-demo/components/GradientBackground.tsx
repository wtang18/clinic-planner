/**
 * GradientBackground Component
 *
 * Persistent gradient background for calendar views.
 * Wrapped in React.memo to prevent unnecessary re-renders.
 *
 * OPTIMIZATION:
 * - No props = never needs to re-render
 * - Renders once and stays alive at navigator level
 * - Positioned absolutely to cover entire screen
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * GradientBackground - Memoized gradient that renders once
 *
 * This component has no props and will never re-render after initial mount.
 * Perfect for persistent background that spans all calendar views.
 */
export const GradientBackground = React.memo(
  () => {
    return (
      <LinearGradient
        colors={['rgb(221, 207, 235)', 'rgb(240, 206, 183)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    );
  },
  () => true // Always return true = never re-render (no props to compare)
);

GradientBackground.displayName = 'GradientBackground';
