/**
 * Audit logging middleware
 *
 * Logs every action with timestamp, user, and context for compliance.
 */

import type { EncounterAction } from '../actions/types';
import type { Middleware } from '../store/types';

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: EncounterAction;
  actionType: string;
  userId: string | null;
  userName: string | null;
  encounterId: string | null;
  patientId: string | null;
}

/**
 * Audit logger function type
 */
export type AuditLogger = (entry: AuditLogEntry) => void;

/**
 * Default audit logger (console)
 */
export const consoleAuditLogger: AuditLogger = (entry) => {
  console.log('[AUDIT]', entry.actionType, {
    timestamp: entry.timestamp.toISOString(),
    userId: entry.userId,
    encounterId: entry.encounterId,
  });
};

let auditIdCounter = 0;

/**
 * Create audit logging middleware
 */
export const createAuditMiddleware = (logger: AuditLogger): Middleware => {
  return (store) => (next) => (action) => {
    const state = store.getState();

    // Create audit log entry
    const entry: AuditLogEntry = {
      id: `audit-${++auditIdCounter}-${Date.now()}`,
      timestamp: new Date(),
      action,
      actionType: action.type,
      userId: state.session.currentUser?.id ?? null,
      userName: state.session.currentUser?.name ?? null,
      encounterId: state.context.encounter?.id ?? null,
      patientId: state.context.patient?.id ?? null,
    };

    // Log the action
    logger(entry);

    // Pass to next middleware
    return next(action);
  };
};
