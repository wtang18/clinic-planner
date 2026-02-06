/**
 * TourOverlay Component
 *
 * Modal overlay for guided tours with tooltips positioned relative
 * to target elements.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  LayoutRectangle,
} from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { tourSystem, TourState } from './TourSystem';
import { useTourTargets } from './TourTargetRegistry';
import {
  colors,
  spaceAround,
  spaceBetween,
  borderRadius,
  typography,
  elevation,
} from '../styles/foundations';

// ============================================================================
// Component
// ============================================================================

export const TourOverlay: React.FC = () => {
  const [state, setState] = useState<TourState>(tourSystem.getState());
  const { measureTarget } = useTourTargets();
  const [targetRect, setTargetRect] = useState<LayoutRectangle | null>(null);

  useEffect(() => {
    return tourSystem.subscribe(setState);
  }, []);

  useEffect(() => {
    if (state.isRunning && state.activeTour) {
      const step = state.activeTour.steps[state.currentStep];
      measureTarget(step.targetTestId).then((rect) => {
        setTargetRect(rect);
      });
    } else {
      setTargetRect(null);
    }
  }, [state.isRunning, state.currentStep, state.activeTour, measureTarget]);

  if (!state.isRunning || !state.activeTour) return null;

  const step = state.activeTour.steps[state.currentStep];
  const totalSteps = state.activeTour.steps.length;

  return (
    <Modal transparent visible={state.isRunning} animationType="fade">
      {/* Backdrop */}
      <View style={tourStyles.backdrop}>
        {/* Tooltip */}
        <View
          style={[
            tourStyles.tooltip,
            getTooltipPosition(step.position, targetRect),
          ]}
          testID="tour-tooltip"
        >
          <View style={tourStyles.tooltipHeader}>
            <Text style={tourStyles.tooltipTitle}>{step.title}</Text>
            <Pressable
              onPress={() => tourSystem.skipTour()}
              style={({ pressed }) => [
                tourStyles.closeBtn,
                pressed && tourStyles.closeBtnPressed,
              ]}
              testID="tour-close"
            >
              <X size={16} color={colors.fg.neutral.secondary} />
            </Pressable>
          </View>

          <Text style={tourStyles.tooltipContent}>{step.content}</Text>

          <View style={tourStyles.tooltipFooter}>
            <Text style={tourStyles.stepIndicator}>
              {state.currentStep + 1} of {totalSteps}
            </Text>

            <View style={tourStyles.tooltipActions}>
              {state.currentStep > 0 && (
                <Pressable
                  onPress={() => tourSystem.previousStep()}
                  style={({ pressed }) => [
                    tourStyles.navBtn,
                    pressed && tourStyles.navBtnPressed,
                  ]}
                  testID="tour-back"
                >
                  <ChevronLeft size={16} color={colors.fg.accent.primary} />
                  <Text style={tourStyles.navBtnText}>Back</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => tourSystem.nextStep()}
                style={({ pressed }) => [
                  tourStyles.navBtn,
                  tourStyles.nextBtn,
                  pressed && tourStyles.nextBtnPressed,
                ]}
                testID="tour-next"
              >
                <Text style={tourStyles.nextBtnText}>
                  {state.currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                </Text>
                {state.currentStep < totalSteps - 1 && (
                  <ChevronRight
                    size={16}
                    color={colors.fg.neutral.inversePrimary}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

TourOverlay.displayName = 'TourOverlay';

// ============================================================================
// Position Helpers
// ============================================================================

function getTooltipPosition(
  position: string,
  targetRect: LayoutRectangle | null
): Record<string, unknown> {
  if (!targetRect) {
    // Center in screen when no target
    return { alignSelf: 'center', marginTop: '40%' };
  }

  const gap = 16;
  switch (position) {
    case 'top':
      return {
        position: 'absolute',
        bottom: undefined,
        top: Math.max(24, targetRect.y - 200 - gap),
        left: 24,
        right: 24,
      };
    case 'bottom':
      return {
        position: 'absolute',
        top: targetRect.y + targetRect.height + gap,
        left: 24,
        right: 24,
      };
    case 'left':
      return {
        position: 'absolute',
        top: targetRect.y,
        right: targetRect.x + gap,
        maxWidth: targetRect.x - 48,
      };
    case 'right':
      return {
        position: 'absolute',
        top: targetRect.y,
        left: targetRect.x + targetRect.width + gap,
      };
    default:
      return { alignSelf: 'center', marginTop: '40%' };
  }
}

// ============================================================================
// Styles
// ============================================================================

const tourStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  tooltip: {
    backgroundColor: colors.bg.neutral.base,
    borderRadius: borderRadius.lg,
    padding: spaceAround.default,
    marginHorizontal: 24,
    ...elevation.lg,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spaceAround.compact,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.semibold as '600',
    color: colors.fg.neutral.primary,
  },
  closeBtn: {
    padding: spaceAround.nudge4,
    borderRadius: borderRadius.sm,
  },
  closeBtnPressed: {
    opacity: 0.7,
  },
  tooltipContent: {
    fontSize: 14,
    color: colors.fg.neutral.secondary,
    lineHeight: 22,
    marginBottom: spaceAround.default,
  },
  tooltipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 12,
    color: colors.fg.neutral.spotReadable,
  },
  tooltipActions: {
    flexDirection: 'row',
    gap: spaceBetween.repeating,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spaceAround.tight,
    paddingHorizontal: spaceAround.compact,
    borderRadius: borderRadius.sm,
  },
  navBtnPressed: {
    opacity: 0.7,
  },
  navBtnText: {
    fontSize: 14,
    color: colors.fg.accent.primary,
    fontWeight: typography.fontWeight.medium as '500',
  },
  nextBtn: {
    backgroundColor: colors.bg.accent.high,
    paddingHorizontal: spaceAround.default,
  },
  nextBtnPressed: {
    opacity: 0.8,
  },
  nextBtnText: {
    fontSize: 14,
    color: colors.fg.neutral.inversePrimary,
    fontWeight: typography.fontWeight.medium as '500',
  },
});
