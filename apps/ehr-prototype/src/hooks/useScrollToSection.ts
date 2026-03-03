/**
 * useScrollToSection Hook
 *
 * Consumed by ProcessCanvas and ReviewCanvas to scroll to a target section
 * after the rail navigation hub triggers a mode switch. Reads scrollTarget
 * from NavigationContext and scrolls to the matching data-section-id element.
 */

import { useEffect } from 'react';
import { useNavigation } from '../navigation/NavigationContext';

export function useScrollToSection(): void {
  const { scrollTarget, clearScrollTarget } = useNavigation();

  useEffect(() => {
    if (!scrollTarget) return;

    // Wait one frame for the target view to render
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector(
        `[data-section-id="${scrollTarget.sectionId}"]`
      );
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      clearScrollTarget();
    });

    return () => cancelAnimationFrame(raf);
  }, [scrollTarget, clearScrollTarget]);
}
