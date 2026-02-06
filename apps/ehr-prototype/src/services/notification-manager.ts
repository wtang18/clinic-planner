/**
 * Notification Manager
 *
 * Centralized notification management for the application.
 * Handles showing, dismissing, and managing notification lifecycle.
 */

import type { Notification } from '../state/types';

// ============================================================================
// Types
// ============================================================================

export interface NotificationManager {
  /** Show a single notification */
  show(notification: Notification): void;
  /** Show multiple notifications */
  showMany(notifications: Notification[]): void;
  /** Dismiss a notification by ID */
  dismiss(id: string): void;
  /** Dismiss all notifications */
  dismissAll(): void;
  /** Subscribe to new notifications */
  onNotification(handler: NotificationHandler): () => void;
  /** Subscribe to notification dismissals */
  onDismiss(handler: DismissHandler): () => void;
  /** Get all active (non-dismissed) notifications */
  getActive(): Notification[];
  /** Get notification by ID */
  get(id: string): Notification | undefined;
}

export type NotificationHandler = (notification: Notification) => void;
export type DismissHandler = (id: string) => void;

export interface NotificationManagerConfig {
  /** Default auto-dismiss timeout in ms (0 = no auto-dismiss) */
  defaultTimeout?: number;
  /** Maximum number of visible notifications */
  maxVisible?: number;
  /** Whether to queue notifications beyond maxVisible */
  enableQueue?: boolean;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Create a notification manager instance
 */
export function createNotificationManager(
  config: NotificationManagerConfig = {}
): NotificationManager {
  const {
    defaultTimeout = 5000,
    maxVisible = 5,
    enableQueue = true,
  } = config;

  // Active notifications
  const notifications = new Map<string, Notification>();

  // Queued notifications (waiting to be shown)
  const queue: Notification[] = [];

  // Timeout handles for auto-dismiss
  const timeouts = new Map<string, NodeJS.Timeout>();

  // Listeners
  const notificationListeners = new Set<NotificationHandler>();
  const dismissListeners = new Set<DismissHandler>();

  // Process queue - show queued notifications when space available
  function processQueue(): void {
    while (queue.length > 0 && notifications.size < maxVisible) {
      const next = queue.shift();
      if (next) {
        showInternal(next);
      }
    }
  }

  // Internal show function
  function showInternal(notification: Notification): void {
    notifications.set(notification.id, notification);

    // Notify listeners
    for (const listener of notificationListeners) {
      try {
        listener(notification);
      } catch (error) {
        console.error('[NotificationManager] Listener error:', error);
      }
    }

    // Set up auto-dismiss if not persistent
    if (!notification.persistent) {
      const timeout = notification.expiresAt
        ? notification.expiresAt.getTime() - Date.now()
        : defaultTimeout;

      if (timeout > 0) {
        const handle = setTimeout(() => {
          dismiss(notification.id);
        }, timeout);
        timeouts.set(notification.id, handle);
      }
    }
  }

  // Public show function
  function show(notification: Notification): void {
    // Check if we should queue
    if (enableQueue && notifications.size >= maxVisible) {
      queue.push(notification);
      return;
    }

    showInternal(notification);
  }

  // Show multiple
  function showMany(newNotifications: Notification[]): void {
    for (const notification of newNotifications) {
      show(notification);
    }
  }

  // Dismiss
  function dismiss(id: string): void {
    const notification = notifications.get(id);
    if (!notification) return;

    // Clear timeout if exists
    const timeout = timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeouts.delete(id);
    }

    // Remove from active
    notifications.delete(id);

    // Notify listeners
    for (const listener of dismissListeners) {
      try {
        listener(id);
      } catch (error) {
        console.error('[NotificationManager] Dismiss listener error:', error);
      }
    }

    // Process queue
    processQueue();
  }

  // Dismiss all
  function dismissAll(): void {
    const ids = Array.from(notifications.keys());
    for (const id of ids) {
      dismiss(id);
    }
    queue.length = 0;
  }

  // Subscribe to notifications
  function onNotification(handler: NotificationHandler): () => void {
    notificationListeners.add(handler);
    return () => {
      notificationListeners.delete(handler);
    };
  }

  // Subscribe to dismissals
  function onDismiss(handler: DismissHandler): () => void {
    dismissListeners.add(handler);
    return () => {
      dismissListeners.delete(handler);
    };
  }

  // Get active notifications
  function getActive(): Notification[] {
    return Array.from(notifications.values());
  }

  // Get single notification
  function get(id: string): Notification | undefined {
    return notifications.get(id);
  }

  return {
    show,
    showMany,
    dismiss,
    dismissAll,
    onNotification,
    onDismiss,
    getActive,
    get,
  };
}

// ============================================================================
// Singleton instance (optional)
// ============================================================================

let defaultManager: NotificationManager | null = null;

/**
 * Get the default notification manager instance
 */
export function getNotificationManager(): NotificationManager {
  if (!defaultManager) {
    defaultManager = createNotificationManager();
  }
  return defaultManager;
}

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Create a notification object with defaults
 */
export function createNotification(
  type: Notification['type'],
  message: string,
  options: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'createdAt'>> = {}
): Notification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    message,
    createdAt: new Date(),
    dismissable: options.dismissable ?? true,
    ...options,
  };
}

/**
 * Create a success notification
 */
export function successNotification(
  message: string,
  options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'createdAt'>>
): Notification {
  return createNotification('success', message, options);
}

/**
 * Create an error notification
 */
export function errorNotification(
  message: string,
  options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'createdAt'>>
): Notification {
  return createNotification('error', message, { persistent: true, ...options });
}

/**
 * Create a warning notification
 */
export function warningNotification(
  message: string,
  options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'createdAt'>>
): Notification {
  return createNotification('warning', message, options);
}

/**
 * Create an info notification
 */
export function infoNotification(
  message: string,
  options?: Partial<Omit<Notification, 'id' | 'type' | 'message' | 'createdAt'>>
): Notification {
  return createNotification('info', message, options);
}
