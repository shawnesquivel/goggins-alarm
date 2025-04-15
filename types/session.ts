// types/sessionTypes.ts

import { Database } from "./database.types";

// Direct types from database schema
export type DbSession = Database["public"]["Tables"]["sessions"]["Row"];
export type DbSessionInsert =
  Database["public"]["Tables"]["sessions"]["Insert"];
export type DbSessionUpdate =
  Database["public"]["Tables"]["sessions"]["Update"];

export type DbPeriod = Database["public"]["Tables"]["periods"]["Row"];
export type DbPeriodInsert = Database["public"]["Tables"]["periods"]["Insert"];
export type DbPeriodUpdate = Database["public"]["Tables"]["periods"]["Update"];

// Session status type
export type SessionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "cancelled";

// Period type
export type PeriodType = "work" | "rest";

// Pending operations for offline-first functionality
export type SessionOperationType =
  | "insert_session"
  | "update_session"
  | "insert_period"
  | "update_period";

export interface SessionPendingOperation {
  id: string;
  type: SessionOperationType;
  data: DbSessionInsert | DbSessionUpdate | DbPeriodInsert | DbPeriodUpdate;
  timestamp: number;
}

// Local storage keys
export const SESSION_STORAGE_KEYS = {
  SESSIONS: "offline_sessions",
  PERIODS: "offline_periods",
  CURRENT_SESSION: "current_session",
  CURRENT_PERIOD: "current_period",
  PENDING_OPS: "pending_session_operations",
};

// Interface for SessionService
export interface SessionServiceInterface {
  // Session operations
  createSession(sessionData: DbSessionInsert): Promise<DbSession>;
  updateSession(
    sessionId: string,
    sessionData: DbSessionUpdate
  ): Promise<DbSession>;
  getSession(sessionId: string): Promise<DbSession | null>;
  getSessions(): Promise<DbSession[]>;

  // Period operations
  createPeriod(periodData: DbPeriodInsert): Promise<DbPeriod>;
  updatePeriod(
    periodId: string,
    periodData: DbPeriodUpdate,
    skipTotals: boolean
  ): Promise<DbPeriod>;
  getPeriod(periodId: string): Promise<DbPeriod | null>;
  getSessionPeriods(sessionId: string): Promise<DbPeriod[]>;
  getLocalPeriods(): Promise<DbPeriod[]>;

  // Current session/period management
  getCurrentSession(): Promise<DbSession | null>;
  getCurrentPeriod(): Promise<DbPeriod | null>;
  setCurrentSession(session: DbSession | null): Promise<void>;
  setCurrentPeriod(period: DbPeriod | null): Promise<void>;

  // Sync operations
  syncToSupabase(force?: boolean): Promise<boolean>;
  getPendingOperations(): Promise<SessionPendingOperation[]>;
  addPendingOperation(
    operation: Omit<SessionPendingOperation, "id">
  ): Promise<void>;
  removePendingOperation(operationId: string): Promise<void>;

  // Helper methods
  calculateSessionTotals(sessionId: string): Promise<{
    total_deep_work_minutes: number;
    total_deep_rest_minutes: number;
  }>;
  cleanupInProgressPeriods(
    sessionId: string,
    periodType: string
  ): Promise<void>;

  completeSessionLifecycle(sessionId: string): Promise<boolean>;
  setupBackgroundSync(intervalMinutes?: number): Promise<void>;
}

export interface SessionSection {
  title: string;
  data: Session[];
}

export interface Session {
  id: string;
  task: string;
  total_deep_work_minutes: number;
  created_at: string;
  status: string;
  project_id: string | null;
  project?: {
    name: string;
    color: string;
  };
}
