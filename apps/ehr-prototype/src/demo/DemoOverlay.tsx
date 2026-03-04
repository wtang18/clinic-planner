/**
 * DemoOverlay Component
 *
 * React Native overlay for demo mode with playback controls,
 * progress indication, and annotation display.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Square } from 'lucide-react';
import type { DemoController, DemoState } from './DemoController';
import { colors, spaceAround, spaceBetween, borderRadius, typography } from '../styles/foundations';

// ============================================================================
// Types
// ============================================================================

interface DemoOverlayProps {
  controller: DemoController;
}

// ============================================================================
// Component
// ============================================================================

export const DemoOverlay: React.FC<DemoOverlayProps> = ({ controller }) => {
  const [state, setState] = useState<DemoState>(controller.getState());
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    return controller.subscribe(setState);
  }, [controller]);

  if (!state.isActive && !state.currentScenarioId) {
    return null;
  }

  const progress =
    state.totalEvents > 0 ? (state.eventIndex / state.totalEvents) * 100 : 0;

  const currentAnnotation = state.annotations.find(
    (a) => a.showAt === state.eventIndex - 1
  );

  const handleSpeedCycle = () => {
    const speeds = [0.5, 1, 1.5, 2, 3];
    const currentIdx = speeds.indexOf(state.speed);
    const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % speeds.length : 0;
    controller.setSpeed(speeds[nextIdx]);
  };

  return (
    <View style={overlayStyles.container} testID="demo-overlay">
      {/* Progress bar */}
      <View style={overlayStyles.progressTrack}>
        <View
          style={[
            overlayStyles.progressBar,
            { width: `${progress}%` as unknown as number },
          ]}
        />
      </View>

      {isExpanded && (
        <View style={overlayStyles.controls}>
          {/* Event counter */}
          <Text style={overlayStyles.eventCount}>
            {state.eventIndex} / {state.totalEvents}
          </Text>

          {/* Playback controls */}
          <View style={overlayStyles.playback}>
            <Pressable
              onPress={() => controller.stepBackward()}
              style={({ pressed }) => [
                overlayStyles.controlBtn,
                pressed && overlayStyles.controlBtnPressed,
              ]}
              disabled={state.eventIndex === 0}
              testID="demo-step-back"
            >
              <SkipBack size={16} color={colors.fg.neutral.primary} />
            </Pressable>

            {state.isPaused || !state.isActive ? (
              <Pressable
                onPress={() =>
                  state.isActive ? controller.resume() : controller.start()
                }
                style={({ pressed }) => [
                  overlayStyles.controlBtn,
                  overlayStyles.playBtn,
                  pressed && overlayStyles.playBtnPressed,
                ]}
                testID="demo-play"
              >
                <Play size={20} color={colors.fg.neutral.inversePrimary} />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => controller.pause()}
                style={({ pressed }) => [
                  overlayStyles.controlBtn,
                  overlayStyles.playBtn,
                  pressed && overlayStyles.playBtnPressed,
                ]}
                testID="demo-pause"
              >
                <Pause size={20} color={colors.fg.neutral.inversePrimary} />
              </Pressable>
            )}

            <Pressable
              onPress={() => controller.stepForward()}
              style={({ pressed }) => [
                overlayStyles.controlBtn,
                pressed && overlayStyles.controlBtnPressed,
              ]}
              disabled={state.eventIndex >= state.totalEvents}
              testID="demo-step-forward"
            >
              <SkipForward size={16} color={colors.fg.neutral.primary} />
            </Pressable>

            <Pressable
              onPress={() => controller.stop()}
              style={({ pressed }) => [
                overlayStyles.controlBtn,
                pressed && overlayStyles.controlBtnPressed,
              ]}
              testID="demo-stop"
            >
              <Square size={16} color={colors.fg.neutral.primary} />
            </Pressable>
          </View>

          {/* Speed control */}
          <Pressable
            onPress={handleSpeedCycle}
            style={({ pressed }) => [
              overlayStyles.speedBtn,
              pressed && overlayStyles.speedBtnPressed,
            ]}
            testID="demo-speed"
          >
            <Text style={overlayStyles.speedText}>{state.speed}x</Text>
          </Pressable>
        </View>
      )}

      {/* Current annotation */}
      {currentAnnotation && (
        <View style={overlayStyles.annotation}>
          <Text style={overlayStyles.annotationText}>
            {currentAnnotation.text}
          </Text>
        </View>
      )}

      {/* Collapse toggle */}
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={overlayStyles.toggleBtn}
        testID="demo-toggle"
      >
        <Text style={overlayStyles.toggleText}>{isExpanded ? '−' : '+'}</Text>
      </Pressable>
    </View>
  );
};

DemoOverlay.displayName = 'DemoOverlay';

// ============================================================================
// Styles
// ============================================================================

const overlayStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg.neutral.base,
    borderTopWidth: 1,
    borderTopColor: colors.border.neutral.subtle,
    paddingHorizontal: spaceAround.default,
    paddingVertical: spaceAround.compact,
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: 2,
    marginBottom: spaceAround.compact,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.bg.accent.high,
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventCount: {
    fontSize: 12,
    color: colors.fg.neutral.secondary,
    fontWeight: typography.fontWeight.medium as '500',
  },
  playback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceBetween.repeating,
  },
  controlBtn: {
    padding: spaceAround.tight,
    borderRadius: borderRadius.sm,
  },
  controlBtnPressed: {
    opacity: 0.7,
  },
  playBtn: {
    backgroundColor: colors.bg.accent.high,
    padding: spaceAround.compact,
    borderRadius: borderRadius.full,
  },
  playBtnPressed: {
    opacity: 0.8,
  },
  speedBtn: {
    paddingHorizontal: spaceAround.compact,
    paddingVertical: spaceAround.nudge4,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
  },
  speedBtnPressed: {
    opacity: 0.7,
  },
  speedText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium as '500',
    color: colors.fg.neutral.secondary,
  },
  annotation: {
    marginTop: spaceAround.compact,
    paddingVertical: spaceAround.tight,
    paddingHorizontal: spaceAround.compact,
    backgroundColor: colors.bg.neutral.subtle,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  annotationText: {
    fontSize: 13,
    color: colors.fg.neutral.secondary,
    textAlign: 'center',
  },
  toggleBtn: {
    position: 'absolute',
    top: -20,
    right: spaceAround.default,
    width: 24,
    height: 20,
    backgroundColor: colors.bg.neutral.base,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border.neutral.subtle,
  },
  toggleText: {
    fontSize: 14,
    color: colors.fg.neutral.secondary,
    fontWeight: typography.fontWeight.bold as '700',
  },
});
