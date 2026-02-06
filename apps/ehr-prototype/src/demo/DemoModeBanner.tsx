/**
 * DemoModeBanner Component
 *
 * Banner displayed at the top of the app when in demo mode.
 * Shows active preset name and provides reset/exit controls.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { X, RotateCcw } from 'lucide-react';
import type { DemoPreset } from './presets';
import {
  colors,
  spaceAround,
  spaceBetween,
  borderRadius,
  typography,
} from '../styles/foundations';

// ============================================================================
// Types
// ============================================================================

interface DemoModeBannerProps {
  preset: DemoPreset;
  onExit: () => void;
  onReset: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  preset,
  onExit,
  onReset,
}) => {
  return (
    <View style={bannerStyles.container} testID="demo-mode-banner">
      <View style={bannerStyles.info}>
        <View style={bannerStyles.label}>
          <Text style={bannerStyles.labelText}>Demo</Text>
        </View>
        <Text style={bannerStyles.name}>{preset.name}</Text>
        <Text style={bannerStyles.duration}>{preset.duration}</Text>
      </View>

      <View style={bannerStyles.actions}>
        <Pressable
          onPress={onReset}
          style={({ pressed }) => [
            bannerStyles.actionBtn,
            pressed && bannerStyles.actionBtnPressed,
          ]}
          testID="demo-reset-btn"
        >
          <RotateCcw size={14} color="rgba(255,255,255,0.9)" />
          <Text style={bannerStyles.actionText}>Reset</Text>
        </Pressable>
        <View style={bannerStyles.divider} />
        <Pressable
          onPress={onExit}
          style={({ pressed }) => [
            bannerStyles.actionBtn,
            pressed && bannerStyles.actionBtnPressed,
          ]}
          testID="demo-exit-btn"
        >
          <X size={14} color="rgba(255,255,255,0.9)" />
          <Text style={bannerStyles.actionText}>Exit</Text>
        </Pressable>
      </View>
    </View>
  );
};

DemoModeBanner.displayName = 'DemoModeBanner';

// ============================================================================
// Styles
// ============================================================================

const bannerStyles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: colors.bg.accent.high,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spaceAround.default,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  label: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.xs,
  },
  labelText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.fg.neutral.inversePrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 13,
    color: colors.fg.neutral.inversePrimary,
    fontWeight: typography.fontWeight.medium as '500',
  },
  duration: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.xs,
  },
  actionBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: typography.fontWeight.medium as '500',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
