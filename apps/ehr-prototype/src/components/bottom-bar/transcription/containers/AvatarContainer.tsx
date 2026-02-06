/**
 * AvatarContainer Component
 *
 * Identity container for the Transcription Module.
 * Displays avatar + patient name, with visibility based on tier and status.
 *
 * Content by Tier:
 * - Micro: Avatar (32px) + status badge only
 * - Bar: Avatar + Patient Name (name hides when recording/paused/processing/error)
 * - Palette: Avatar + Patient Name + Encounter label (full row)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  colors,
  typography,
  spaceBetween,
  spaceAround,
} from '../../../../styles/foundations';
import { AvatarWithBadge, PATIENT_COLORS } from '../AvatarWithBadge';
import type { BadgeStatus } from '../StatusBadge';
import type { TierState, TranscriptionSession, RecordingStatus } from '../../../../state/bottomBar/types';

// ============================================================================
// Types
// ============================================================================

export interface AvatarContainerProps {
  /** Current display tier */
  tier: TierState;
  /** Session data (or null if no session) */
  session: TranscriptionSession | null;
  /** Animation phase from parent - used for crossfade timing during transitions */
  animationPhase?: string;
  /** Patient's assigned color */
  patientColor?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// ============================================================================
// Constants
// ============================================================================

const AVATAR_SIZE = 32;
const BAR_HEIGHT = 48;

// ============================================================================
// Helpers
// ============================================================================

/** Map RecordingStatus to BadgeStatus */
function toBadgeStatus(status: RecordingStatus): BadgeStatus {
  if (status === 'complete') return 'idle';
  return status as BadgeStatus;
}

/** Determine if patient name should be visible */
function shouldShowName(tier: TierState, status: RecordingStatus): boolean {
  // Always show in palette
  if (tier === 'palette') return true;
  // Never show in micro
  if (tier === 'mini') return false;
  // In bar: only show when idle
  return status === 'idle' || status === 'complete';
}

// ============================================================================
// Child Animation Variants
// ============================================================================

const nameVariants = {
  hidden: { opacity: 0, width: 0, marginLeft: 0 },
  visible: { opacity: 1, width: 'auto', marginLeft: spaceBetween.related },
  exit: { opacity: 0, width: 0, marginLeft: 0 },
};

const encounterVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.6 },
};

// ============================================================================
// Component
// ============================================================================

export const AvatarContainer: React.FC<AvatarContainerProps> = ({
  tier,
  session,
  animationPhase,
  patientColor = PATIENT_COLORS.blue,
  style,
  testID,
}) => {
  const status = session?.status ?? 'idle';
  const showEncounter = false;  // Disabled - just show name for now
  const isMicro = tier === 'mini';
  const isPalette = tier === 'palette';

  // Show badge for paused/error states in bar mode only
  // Palette mode shows status in the timer/controls area instead
  const showBadge = !isPalette && (status === 'paused' || status === 'error');

  // Name crossfade: hide during transitions to avoid visual collision
  // In palette mode, name visible only in idle-palette state (not transitioning)
  // In bar mode, name follows the original shouldShowName logic
  const isTransitioning = animationPhase && (
    animationPhase.includes('expanding') ||
    animationPhase.includes('collapsing')
  );
  const baseShowName = shouldShowName(tier, status);
  // For palette, additionally hide during transitions
  const showNameWithCrossfade = isPalette
    ? baseShowName && !isTransitioning
    : baseShowName;

  // Container styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    height: BAR_HEIGHT,
    // Micro: centered in 48px pill, Bar/Palette: left-aligned with padding
    // Palette uses compact padding (12px) for tighter avatar row
    // Bar uses tight left padding (8px) but reduced right padding (4px) to bring waveform closer
    padding: isMicro
      ? `0 ${(BAR_HEIGHT - AVATAR_SIZE) / 2}px`
      : isPalette
        ? `0 ${spaceAround.compact}px`
        : `0 4px 0 ${spaceAround.tight}px`,
    overflow: 'hidden',
    flexShrink: 0,
    // Reduce bottom margin in palette to bring content closer (8px reduction)
    marginBottom: isPalette ? -spaceBetween.repeating : undefined,
    ...style,
  };

  // Text styles
  const nameStyle: React.CSSProperties = {
    fontSize: 13,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    color: colors.fg.neutral.inversePrimary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const encounterStyle: React.CSSProperties = {
    fontSize: 12,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.regular,
    color: colors.fg.neutral.inversePrimary,
    opacity: 0.6,
    whiteSpace: 'nowrap',
    marginLeft: spaceBetween.coupled,
  };

  return (
    <div
      style={containerStyle}
      data-testid={testID}
    >
      {/* Avatar with status badge (badge hidden in palette, static in bar) */}
      <AvatarWithBadge
        initials={session?.patient.initials ?? 'PT'}
        color={patientColor}
        status={toBadgeStatus(status)}
        size={AVATAR_SIZE}
        showBadge={showBadge}
        badgeAnimate={false}  // Bar tier badge is static (waveform already indicates recording)
        testID={testID ? `${testID}-avatar` : undefined}
      />

      {/* Patient name - animates in/out based on state and crossfades during transitions */}
      <AnimatePresence mode="wait">
        {showNameWithCrossfade && (
          <motion.span
            key="patient-name"
            variants={nameVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15 }}
            style={nameStyle}
          >
            {session?.patient.name ?? 'Patient'}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Encounter label - only in palette */}
      <AnimatePresence>
        {showEncounter && (
          <motion.span
            key="encounter-label"
            variants={encounterVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.15 }}
            style={encounterStyle}
          >
            {/* TODO: Add encounter label from session when available */}
            {session?.encounterId ? `Encounter ${session.encounterId.slice(0, 8)}` : ''}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

AvatarContainer.displayName = 'AvatarContainer';

export default AvatarContainer;
