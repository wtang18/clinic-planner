/**
 * useOmniSectionNav — Container-level ArrowUp/Down section navigation
 *
 * What: Intercepts ArrowUp/Down at the OmniAddBarV2 container level to jump
 *   between logical "sections" (OmniInput, category pills, field rows,
 *   suggestion cards, edit actions). ArrowLeft/Right are left to individual
 *   components for within-row cycling.
 *
 * Why: Tab hits every focusable element sequentially. Arrow keys provide a
 *   faster way to jump between logical groups. Each section is marked with a
 *   `data-omni-section` attribute in the DOM.
 *
 * When to reuse: Any container that needs grouped arrow-key navigation
 *   across multiple sub-sections.
 */

import { useRef, useCallback } from 'react';

export function useOmniSectionNav() {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    const container = containerRef.current;
    if (!container) return;

    const activeEl = document.activeElement as HTMLElement | null;
    if (!activeEl || !container.contains(activeEl)) return;

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>('[data-omni-section]'),
    );
    const currentSection = activeEl.closest('[data-omni-section]') as HTMLElement | null;
    const idx = currentSection ? sections.indexOf(currentSection) : -1;
    if (idx === -1) return;

    const nextIdx = e.key === 'ArrowDown'
      ? Math.min(idx + 1, sections.length - 1)
      : Math.max(idx - 1, 0);
    if (nextIdx === idx) return;

    e.preventDefault();
    const target = sections[nextIdx];

    // OmniInput section: focus the actual <input>
    const inputField = target.querySelector<HTMLElement>('[data-testid="omni-input-field"]');
    if (inputField) {
      inputField.focus();
      return;
    }

    // Prefer the roving-tabindex active element (tabIndex={0})
    const rovingActive = target.querySelector<HTMLElement>('[tabindex="0"]');
    if (rovingActive) {
      rovingActive.focus();
      return;
    }
    // Fallback: first focusable element within the section
    const first = target.querySelector<HTMLElement>(
      'button:not([disabled]), input:not([disabled])',
    );
    if (first) first.focus();
  }, []);

  return { containerRef, handleKeyDown };
}
