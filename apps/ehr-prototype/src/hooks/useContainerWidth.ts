/**
 * useContainerWidth Hook
 *
 * Measures an element's width via ResizeObserver and returns it reactively.
 * Uses a callback ref so the observer re-attaches whenever the DOM node
 * mounts or unmounts (e.g. conditional rendering).
 *
 * Web-only — returns 0 on non-web platforms.
 */

import { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * Returns `[width, callbackRef]`.
 *
 * Attach `callbackRef` to the element you want to measure.
 * `width` updates reactively via ResizeObserver.
 *
 * Unlike a useRef + useEffect approach, the callback ref fires every time
 * the DOM node attaches or detaches, so the observer always tracks the
 * correct element — even through conditional render cycles.
 */
export function useContainerWidth(): [number, React.RefCallback<HTMLElement>] {
  const [width, setWidth] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  const callbackRef = useCallback((node: HTMLElement | null) => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node || Platform.OS !== 'web' || typeof ResizeObserver === 'undefined') {
      return;
    }

    // Synchronous initial measurement
    setWidth(node.getBoundingClientRect().width);

    // Observe future size changes
    const observer = new ResizeObserver(([entry]) => {
      if (entry.borderBoxSize?.[0]) {
        setWidth(entry.borderBoxSize[0].inlineSize);
      } else {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  return [width, callbackRef];
}
