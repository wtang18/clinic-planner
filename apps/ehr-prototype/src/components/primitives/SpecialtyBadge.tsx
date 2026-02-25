/**
 * SpecialtyBadge Component
 *
 * Neutral micro badge displaying a specialty abbreviation (e.g., "UC", "PC").
 * All specialties use the same neutral style — no color differentiation.
 */

import React from 'react';
import type { Specialty } from '../../types/encounter';
import { getSpecialtyAbbrev } from '../../utils/specialty';
import { colors, typography, borderRadius } from '../../styles/foundations';

// ============================================================================
// Types
// ============================================================================

export interface SpecialtyBadgeProps {
  specialty: Specialty;
  size?: 'sm' | 'xs';
}

// ============================================================================
// Component
// ============================================================================

export const SpecialtyBadge: React.FC<SpecialtyBadgeProps> = ({ specialty, size = 'sm' }) => {
  const abbrev = getSpecialtyAbbrev(specialty);
  const isXs = size === 'xs';

  return (
    <span style={{
      fontSize: isXs ? 9 : 10,
      fontWeight: 600,
      fontFamily: typography.fontFamily.sans,
      backgroundColor: colors.bg.neutral.subtle,
      color: colors.fg.neutral.secondary,
      borderRadius: borderRadius.xs,
      padding: isXs ? '0 3px' : '0 4px',
      lineHeight: isXs ? '14px' : '16px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap',
    }}>
      {abbrev}
    </span>
  );
};

SpecialtyBadge.displayName = 'SpecialtyBadge';
