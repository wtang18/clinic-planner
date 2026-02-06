/**
 * Debounce & Throttle Utilities
 *
 * Functions and hooks for rate-limiting event handlers.
 */

import { useRef, useCallback, useEffect, useState } from 'react';

// ============================================================================
// Debounce
// ============================================================================

/**
 * Creates a debounced function that delays execution until after
 * the specified delay has passed since the last call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Creates a debounced function with a leading edge option.
 */
export function debounceLeading<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId === null) {
      fn(...args);
    }
    clearTimeout(timeoutId as ReturnType<typeof setTimeout>);
    timeoutId = setTimeout(() => {
      timeoutId = null;
    }, delay);
  };
}

// ============================================================================
// Throttle
// ============================================================================

/**
 * Creates a throttled function that only executes once per limit interval.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Creates a throttled function that also executes on the trailing edge.
 */
export function throttleWithTrailing<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

// ============================================================================
// React Hooks
// ============================================================================

/**
 * Hook that returns a debounced version of the callback.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Hook that returns a debounced value.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that returns a throttled version of the callback.
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const inThrottleRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        callbackRef.current(...args);
        inThrottleRef.current = true;
        setTimeout(() => {
          inThrottleRef.current = false;
        }, limit);
      }
    },
    [limit]
  );
}

// ============================================================================
// RAF-based Throttle
// ============================================================================

/**
 * Creates a throttled function using requestAnimationFrame.
 * Ideal for scroll/resize handlers and animations.
 */
export function rafThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return (...args: Parameters<T>) => {
    if (rafId !== null) return;

    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  };
}

/**
 * Hook that returns a RAF-throttled callback.
 */
export function useRafThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    if (rafIdRef.current !== null) return;

    rafIdRef.current = requestAnimationFrame(() => {
      callbackRef.current(...args);
      rafIdRef.current = null;
    });
  }, []);
}

// ============================================================================
// Cancelable Debounce
// ============================================================================

interface CancelableDebounce<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

/**
 * Creates a cancelable debounced function.
 */
export function debounceCancelable<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): CancelableDebounce<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debounced;
}
