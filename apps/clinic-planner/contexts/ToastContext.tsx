'use client';
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Toast, type ToastProps } from '@/design-system/components/Toast';
import type { IconName } from '@carbon-health/design-icons';

/**
 * Toast options for customizing toast behavior and content
 */
export interface ToastOptions {
  /** Subtext content */
  subtext?: string;
  /** Whether to show subtext */
  showSubtext?: boolean;
  /** CTA button label */
  ctaLabel?: string;
  /** CTA button click handler */
  onCtaClick?: () => void;
  /** Whether to show CTA button */
  showCta?: boolean;
  /** Whether to show close button */
  showClose?: boolean;
  /** Auto-dismiss after 5 seconds (default: true) */
  autoDismiss?: boolean;
}

/**
 * Internal toast item structure
 */
interface ToastItem {
  id: string;
  type: ToastProps['type'];
  title: string;
  customIcon?: IconName;
  options?: ToastOptions;
}

/**
 * Toast context methods
 */
interface ToastContextType {
  toast: {
    /** Show positive (success) toast */
    positive: (title: string, options?: ToastOptions) => void;
    /** Show alert (error) toast */
    alert: (title: string, options?: ToastOptions) => void;
    /** Show attention (warning) toast */
    attention: (title: string, options?: ToastOptions) => void;
    /** Show info toast */
    info: (title: string, options?: ToastOptions) => void;
    /** Show custom icon toast */
    icon: (title: string, iconName: IconName, options?: ToastOptions) => void;
    /** Show toast with no icon */
    custom: (title: string, options?: ToastOptions) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook to access toast functionality
 *
 * @example
 * const { toast } = useToast();
 *
 * toast.positive('Event created successfully!');
 * toast.alert('Failed to save', { subtext: 'Please try again' });
 * toast.info('New feature available', {
 *   showCta: true,
 *   ctaLabel: 'Learn More',
 *   onCtaClick: () => router.push('/features')
 * });
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Toast Provider component
 *
 * Manages toast queue and displays toasts one at a time.
 * Toasts appear at bottom-right corner with slide-up animation.
 *
 * @example
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const idCounterRef = useRef(0);

  // Track when component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate unique ID for each toast
  const generateId = useCallback(() => {
    idCounterRef.current += 1;
    return `toast-${idCounterRef.current}-${Date.now()}`;
  }, []);

  // Add toast to queue
  const addToast = useCallback(
    (type: ToastProps['type'], title: string, customIcon?: IconName, options?: ToastOptions) => {
      // Validate: if autoDismiss is false, showClose must be true
      if (options?.autoDismiss === false && options?.showClose === false) {
        console.warn('Toast: autoDismiss=false requires showClose=true. Setting showClose to true.');
        options = { ...options, showClose: true };
      }

      const newToast: ToastItem = {
        id: generateId(),
        type,
        title,
        customIcon,
        options,
      };

      setQueue((prev) => [...prev, newToast]);
    },
    [generateId]
  );

  // Remove current toast and show next in queue
  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Start exit animation
    setIsExiting(true);

    // After exit animation completes, clear current toast and show next
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      setCurrentToast(null);
    }, 300); // Match animation duration
  }, []);

  // Handle close button click
  const handleClose = useCallback(() => {
    dismissToast();
  }, [dismissToast]);

  // Process queue: show next toast when current is dismissed
  useEffect(() => {
    if (!currentToast && queue.length > 0) {
      const [nextToast, ...rest] = queue;
      setQueue(rest);
      setCurrentToast(nextToast);

      // Trigger enter animation
      setTimeout(() => {
        setIsVisible(true);
      }, 10);

      // Set up auto-dismiss timer if enabled
      const autoDismiss = nextToast.options?.autoDismiss ?? true;
      if (autoDismiss) {
        timerRef.current = setTimeout(() => {
          // Clear timer ref first
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }

          // Start exit animation
          setIsExiting(true);

          // After exit animation completes, clear current toast and show next
          setTimeout(() => {
            setIsVisible(false);
            setIsExiting(false);
            setCurrentToast(null);
          }, 300);
        }, 5000);
      }
    }
  }, [currentToast, queue]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Toast methods
  const toast = {
    positive: useCallback(
      (title: string, options?: ToastOptions) => {
        addToast('positive', title, undefined, options);
      },
      [addToast]
    ),
    alert: useCallback(
      (title: string, options?: ToastOptions) => {
        addToast('alert', title, undefined, options);
      },
      [addToast]
    ),
    attention: useCallback(
      (title: string, options?: ToastOptions) => {
        addToast('attention', title, undefined, options);
      },
      [addToast]
    ),
    info: useCallback(
      (title: string, options?: ToastOptions) => {
        addToast('info', title, undefined, options);
      },
      [addToast]
    ),
    icon: useCallback(
      (title: string, iconName: IconName, options?: ToastOptions) => {
        addToast('icon', title, iconName, options);
      },
      [addToast]
    ),
    custom: useCallback(
      (title: string, options?: ToastOptions) => {
        addToast('no-icon', title, undefined, options);
      },
      [addToast]
    ),
  };

  const toastElement = currentToast && mounted ? (
    <div
      className="fixed transition-all duration-300 ease-out flex justify-end px-6"
      style={{
        bottom: '24px',
        right: '0',
        left: '0',
        zIndex: 9999,
        transform: isExiting
          ? 'translateY(calc(100% + 24px))'
          : isVisible
          ? 'translateY(0)'
          : 'translateY(calc(100% + 24px))',
        opacity: isExiting ? 0 : isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <Toast
        type={currentToast.type}
        title={currentToast.title}
        customIcon={currentToast.customIcon}
        showSubtext={currentToast.options?.showSubtext}
        subtext={currentToast.options?.subtext}
        showCta={currentToast.options?.showCta}
        ctaLabel={currentToast.options?.ctaLabel}
        onCtaClick={currentToast.options?.onCtaClick}
        showClose={currentToast.options?.showClose ?? true}
        autoDismiss={currentToast.options?.autoDismiss ?? true}
        onClose={handleClose}
      />
    </div>
  ) : null;

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Render toast in a portal directly to document.body to avoid any parent overflow/clipping issues */}
      {mounted && toastElement && createPortal(toastElement, document.body)}
    </ToastContext.Provider>
  );
}
