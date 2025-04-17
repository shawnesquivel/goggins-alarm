import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import {
  DbSession,
  DbSessionInsert,
  DbSessionUpdate,
  DbPeriod,
  DbPeriodInsert,
  DbPeriodUpdate,
  SessionPendingOperation,
  SESSION_STORAGE_KEYS,
  SessionServiceInterface,
} from "@/types/session";

export const SessionService: SessionServiceInterface = {
  /**
   * Creates a new session in local storage and queues it for syncing to Supabase.
   * Offline-first: Saves to local storage immediately and queues for later sync.
   */
  async createSession(sessionData: DbSessionInsert): Promise<DbSession> {
    // Generate ID if not provided
    const session: DbSession = {
      ...sessionData,
      id: sessionData.id || uuidv4(),
      created_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
      status: sessionData.status || "in_progress",
      total_deep_work_minutes: 0,
      total_deep_rest_minutes: 0,
      completed: false,
    } as DbSession;

    // Save locally first
    const sessions = await this.getSessions();
    sessions.push(session);
    await AsyncStorage.setItem(
      SESSION_STORAGE_KEYS.SESSIONS,
      JSON.stringify(sessions)
    );

    // Save as current session
    await this.setCurrentSession(session);

    // Queue for syncing
    await this.addPendingOperation({
      type: "insert_session",
      data: session,
      timestamp: Date.now(),
    });

    return session;
  },

  /**
   * Updates an existing session in local storage and queues changes for syncing to Supabase.
   * Offline-first: Updates local storage immediately and queues for later sync.
   */
  async updateSession(
    sessionId: string,
    sessionData: DbSessionUpdate
  ): Promise<DbSession> {
    // Get existing session
    const session = await this.getSession(sessionId);
    if (!session) {
      console.warn(`Session not found: ${sessionId}`);
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Update session data
    const updatedSession: DbSession = {
      ...session,
      ...sessionData,
      last_updated_at: new Date().toISOString(),
    };

    // Update in local storage
    const sessions = await this.getSessions();
    const updatedSessions = sessions.map((s) =>
      s.id === sessionId ? updatedSession : s
    );
    await AsyncStorage.setItem(
      SESSION_STORAGE_KEYS.SESSIONS,
      JSON.stringify(updatedSessions)
    );

    // If this is the current session, update it
    const currentSession = await this.getCurrentSession();
    if (currentSession?.id === sessionId) {
      await this.setCurrentSession(updatedSession);
    }

    // Queue for syncing
    const pendingOp: SessionPendingOperation = {
      type: "update_session",
      id: session.id,
      data: {
        id: sessionId,
        ...sessionData,
        last_updated_at: updatedSession.last_updated_at,
      },
      timestamp: Date.now(),
    };
    await this.addPendingOperation(pendingOp);

    return updatedSession;
  },

  /**
   * Retrieves a single session from local storage.
   * Local-only: Does not interact with Supabase.
   */
  async getSession(sessionId: string): Promise<DbSession | null> {
    const sessions = await this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    return session || null;
  },

  /**
   * Retrieves all sessions from local storage.
   * Local-only: Does not interact with Supabase.
   */
  async getSessions(): Promise<DbSession[]> {
    try {
      const storedSessions = await AsyncStorage.getItem(
        SESSION_STORAGE_KEYS.SESSIONS
      );
      const sessions = storedSessions ? JSON.parse(storedSessions) : [];
      return sessions;
    } catch (error) {
      console.error("Error loading sessions from local storage:", error);
      return [];
    }
  },

  /**
   * Creates a new period in local storage and queues it for syncing to Supabase.
   * Offline-first: Saves to local storage immediately and queues for later sync.
   */
  async createPeriod(periodData: DbPeriodInsert): Promise<DbPeriod> {
    if (periodData.session_id) {
      await this.cleanupInProgressPeriods(
        periodData.session_id,
        periodData.type
      );
    }

    const id = periodData.id || uuidv4();
    const now = new Date().toISOString();

    const period: DbPeriod = {
      ...periodData,
      id,
      created_at: now,
      last_updated_at: now,
      actual_duration_minutes: null,
      ended_at: null,
      quality_rating: null,
      rest_activities_selected: null,
    } as DbPeriod;

    // Save locally
    const periods = await this.getLocalPeriods();
    periods.push(period);
    await AsyncStorage.setItem(
      SESSION_STORAGE_KEYS.PERIODS,
      JSON.stringify(periods)
    );

    // Set as current period
    await this.setCurrentPeriod(period);

    // Add to sync queue
    await this.addPendingOperation({
      type: "insert_period",
      data: period,
      timestamp: Date.now(),
    });

    return period;
  },

  /**
   * Updates an existing period in local storage and queues changes for syncing to Supabase.
   * Offline-first: Updates local storage immediately and queues for later sync.
   */
  async updatePeriod(
    periodId: string,
    periodData: DbPeriodUpdate,
    skipTotals: boolean = false
  ): Promise<DbPeriod> {
    // Get existing period
    const period = await this.getPeriod(periodId);
    if (!period) {
      console.warn(`Period not found: ${periodId}`);
      throw new Error(`Period not found: ${periodId}`);
    }

    // Set work_time_completed for work periods with actual duration
    if (
      period.type === "work" &&
      periodData.actual_duration_minutes !== undefined &&
      periodData.actual_duration_minutes !== null
    ) {
      periodData.work_time_completed =
        periodData.actual_duration_minutes >= period.planned_duration_minutes;
    }

    // Update period data
    const updatedPeriod: DbPeriod = {
      ...period,
      ...periodData,
      last_updated_at: new Date().toISOString(),
      rest_activities_selected: periodData.rest_activities_selected || null,
    };

    // Update in local storage
    const periods = await this.getLocalPeriods();
    const updatedPeriods = periods.map((p) =>
      p.id === periodId ? updatedPeriod : p
    );
    await AsyncStorage.setItem(
      SESSION_STORAGE_KEYS.PERIODS,
      JSON.stringify(updatedPeriods)
    );

    // If this is the current period, update it
    const currentPeriod = await this.getCurrentPeriod();
    if (currentPeriod?.id === periodId) {
      await this.setCurrentPeriod(updatedPeriod);
    }

    // Queue for syncing
    await this.addPendingOperation({
      type: "update_period",
      data: {
        id: periodId,
        ...periodData,
        work_time_completed: updatedPeriod.work_time_completed,
        last_updated_at: updatedPeriod.last_updated_at,
        rest_activities_selected: periodData.rest_activities_selected || null,
      },
      timestamp: Date.now(),
    });

    // Calculate session totals if period is completed and skipTotals is false
    if (
      !skipTotals &&
      updatedPeriod.actual_duration_minutes != undefined &&
      updatedPeriod.session_id
    ) {
      await this.calculateSessionTotals(updatedPeriod.session_id);
    }

    return updatedPeriod;
  },

  /**
   * Retrieves a single period from local storage.
   * Local-only: Does not interact with Supabase.
   */
  async getPeriod(periodId: string): Promise<DbPeriod | null> {
    const periods = await this.getLocalPeriods();
    const period = periods.find((p) => p.id === periodId);

    return period || null;
  },

  /**
   * Retrieves all periods for a specific session from local storage.
   * Local-only: Does not interact with Supabase.
   */
  async getSessionPeriods(sessionId: string): Promise<DbPeriod[]> {
    const periods = await this.getLocalPeriods();
    const sessionPeriods = periods.filter((p) => p.session_id === sessionId);

    return sessionPeriods;
  },

  /**
   * Retrieves all periods from local storage.
   * Local-only: Does not interact with Supabase.
   */
  async getLocalPeriods(): Promise<DbPeriod[]> {
    try {
      const storedPeriods = await AsyncStorage.getItem(
        SESSION_STORAGE_KEYS.PERIODS
      );
      return storedPeriods ? JSON.parse(storedPeriods) : [];
    } catch (error) {
      console.error("Error loading periods from local storage:", error);
      return [];
    }
  },

  /**
   * Cleans up any in-progress periods by marking them as complete.
   * Offline-first: Updates local storage and queues changes for sync.
   */
  async cleanupInProgressPeriods(
    sessionId: string,
    periodType: string
  ): Promise<void> {
    const periods = await this.getLocalPeriods();
    let updated = false;

    // Find all in-progress periods for this session that match the type
    for (const period of periods) {
      if (
        period.session_id === sessionId &&
        period.type === periodType &&
        !period.ended_at
      ) {
        period.ended_at = new Date().toISOString();
        period.actual_duration_minutes = period.planned_duration_minutes;
        period.last_updated_at = new Date().toISOString();

        // Queue for sync
        await this.addPendingOperation({
          type: "update_period",
          data: {
            id: period.id,
            completed: true,
            ended_at: period.ended_at,
            actual_duration_minutes: period.actual_duration_minutes,
            last_updated_at: period.last_updated_at,
          },
          timestamp: Date.now(),
        });

        updated = true;
      }
    }

    if (updated) {
      await AsyncStorage.setItem(
        SESSION_STORAGE_KEYS.PERIODS,
        JSON.stringify(periods)
      );
    }
  },

  /**
   * Gets the current active session from local storage.
   * Local-only: Does not interact with Supabase.
   */
  async getCurrentSession(): Promise<DbSession | null> {
    try {
      const currentSession = await AsyncStorage.getItem(
        SESSION_STORAGE_KEYS.CURRENT_SESSION
      );
      return currentSession ? JSON.parse(currentSession) : null;
    } catch (error) {
      console.error("Error loading current session from local storage:", error);
      return null;
    }
  },

  /**
   * Gets the current active period from local storage.
   * Local-only: Does not interact with Supabase.
   */
  async getCurrentPeriod(): Promise<DbPeriod | null> {
    try {
      const currentPeriod = await AsyncStorage.getItem(
        SESSION_STORAGE_KEYS.CURRENT_PERIOD
      );
      return currentPeriod ? JSON.parse(currentPeriod) : null;
    } catch (error) {
      console.error("Error loading current period from local storage:", error);
      return null;
    }
  },

  /**
   * Sets the current active session in local storage.
   * Local-only: Does not interact with Supabase.
   */
  async setCurrentSession(session: DbSession | null): Promise<void> {
    if (session) {
      await AsyncStorage.setItem(
        SESSION_STORAGE_KEYS.CURRENT_SESSION,
        JSON.stringify(session)
      );
    } else {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_SESSION);
    }
  },

  /**
   * Sets the current active period in local storage.
   * Local-only: Does not interact with Supabase.
   */
  async setCurrentPeriod(period: DbPeriod | null): Promise<void> {
    if (period) {
      await AsyncStorage.setItem(
        SESSION_STORAGE_KEYS.CURRENT_PERIOD,
        JSON.stringify(period)
      );
    } else {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_PERIOD);
    }
  },

  /**
   * Syncs all pending operations to Supabase.
   * Database operation: Directly interacts with Supabase to sync local changes.
   */
  async syncToSupabase(force: boolean = false): Promise<boolean> {
    try {
      const pendingOps = await this.getPendingOperations();

      if (pendingOps.length === 0 && !force) {
        return true;
      }

      // Get authenticated user
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        console.warn("No authenticated user, aborting sync");
        return false;
      }

      // Process each operation
      for (const op of pendingOps) {
        try {
          if (op.type === "insert_session") {
            const sessionData = op.data as DbSessionInsert;
            const sessionWithUser = {
              ...sessionData,
              user_id: user.id,
            };

            const { error } = await supabase
              .from("sessions")
              .insert(sessionWithUser);

            if (error) {
              console.error("Error inserting session:", error);
              continue;
            }
          } else if (op.type === "update_session") {
            const sessionData = op.data as DbSessionUpdate;
            const { error } = await supabase
              .from("sessions")
              .update(sessionData)
              .eq("id", sessionData.id);

            if (error) {
              console.error("Error updating session:", error);
              continue;
            }
          } else if (op.type === "insert_period") {
            const periodData = op.data as DbPeriodInsert;
            const { error } = await supabase.from("periods").insert(periodData);

            if (error) {
              console.error(
                "Error inserting period:",
                { periodData },
                { error }
              );
              continue;
            }
          } else if (op.type === "update_period") {
            const periodData = op.data as DbPeriodUpdate;
            const { error } = await supabase
              .from("periods")
              .update(periodData)
              .eq("id", periodData.id);

            if (error) {
              console.error("Error updating period:", error);
              continue;
            }
          }

          // Operation succeeded, remove from pending operations
          await this.removePendingOperation(op.id);
        } catch (error) {
          console.error(`Error processing operation ${op.type}:`, error);
        }
      }

      // Check if all operations were processed
      const remainingOps = await this.getPendingOperations();
      if (remainingOps.length > 0) {
        console.warn(
          `Sync incomplete. ${remainingOps.length} operations remaining`
        );
      }

      return remainingOps.length === 0;
    } catch (error) {
      console.error("Error syncing to Supabase:", error);
      return false;
    }
  },

  /**
   * Gets all pending operations from local storage.
   * Local-only: Does not interact with Supabase.
   */
  async getPendingOperations(): Promise<SessionPendingOperation[]> {
    try {
      const pendingOps = await AsyncStorage.getItem(
        SESSION_STORAGE_KEYS.PENDING_OPS
      );
      return pendingOps ? JSON.parse(pendingOps) : [];
    } catch (error) {
      console.error(
        "Error loading pending operations from local storage:",
        error
      );
      return [];
    }
  },

  /**
   * Adds a new operation to the pending operations queue in local storage.
   * Local-only: Does not interact with Supabase.
   */
  async addPendingOperation(
    operation: Omit<SessionPendingOperation, "id">
  ): Promise<void> {
    try {
      const pendingOps = await this.getPendingOperations();
      pendingOps.push({
        ...operation,
        id: uuidv4(),
      });
      await AsyncStorage.setItem(
        SESSION_STORAGE_KEYS.PENDING_OPS,
        JSON.stringify(pendingOps)
      );
    } catch (error) {
      console.error("Error adding pending operation:", error);
    }
  },

  /**
   * Removes a completed operation from the pending operations queue in local storage.
   * Local-only: Does not interact with Supabase.
   */
  async removePendingOperation(operationId: string): Promise<void> {
    try {
      const pendingOps = await this.getPendingOperations();
      const updatedOps = pendingOps.filter((op) => op.id !== operationId);
      await AsyncStorage.setItem(
        SESSION_STORAGE_KEYS.PENDING_OPS,
        JSON.stringify(updatedOps)
      );
    } catch (error) {
      console.error("Error removing pending operation:", error);
    }
  },

  /**
   * Calculates and updates total work/rest minutes for a session.
   * Offline-first: Updates local storage and queues changes for sync.
   */
  async calculateSessionTotals(sessionId: string): Promise<{
    total_deep_work_minutes: number;
    total_deep_rest_minutes: number;
  }> {
    const sessionPeriods = await this.getSessionPeriods(sessionId);
    const completedPeriods = sessionPeriods.filter((p) => p.ended_at !== null);

    let totalWorkSeconds = 0;
    let totalRestSeconds = 0;

    for (const period of completedPeriods) {
      if (!period.actual_duration_minutes) continue;

      const periodSeconds = period.actual_duration_minutes * 60;
      if (period.type === "work") {
        totalWorkSeconds += periodSeconds;
      } else if (period.type === "rest") {
        totalRestSeconds += periodSeconds;
      }
    }

    // Convert back to minutes for storage
    const totalWorkMinutes = totalWorkSeconds / 60;
    const totalRestMinutes = totalRestSeconds / 60;

    // Update session with new totals
    await this.updateSession(sessionId, {
      total_deep_work_minutes: totalWorkMinutes,
      total_deep_rest_minutes: totalRestMinutes,
    });

    return {
      total_deep_work_minutes: totalWorkMinutes,
      total_deep_rest_minutes: totalRestMinutes,
    };
  },

  /**
   * Completes a session lifecycle by syncing to Supabase and clearing local state.
   * Database operation: Attempts to sync with Supabase before clearing local state.
   */
  async completeSessionLifecycle(sessionId: string): Promise<boolean> {
    try {
      // First try to sync data to Supabase
      const syncSuccessful = await this.syncToSupabase(true);

      if (!syncSuccessful) {
        console.warn(
          "Sync to Supabase failed during session completion, operations queued for later sync"
        );
      }

      // Clear session state regardless of sync result
      await this.setCurrentSession(null);
      await this.setCurrentPeriod(null);
      await AsyncStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_SESSION);
      await AsyncStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_PERIOD);

      return syncSuccessful;
    } catch (error) {
      console.error("Error in completeSessionLifecycle:", error);
      return false;
    }
  },

  /**
   * Sets up periodic background syncing to Supabase.
   * Database operation: Periodically attempts to sync pending operations to Supabase.
   */
  async setupBackgroundSync(intervalMinutes: number = 5): Promise<void> {
    setInterval(async () => {
      try {
        const pendingOps = await this.getPendingOperations();
        if (pendingOps.length > 0) {
          console.log(
            `Attempting background sync of ${pendingOps.length} operations`
          );
          await this.syncToSupabase();
        }
      } catch (error) {
        console.error("Background sync error:", error);
      }
    }, intervalMinutes * 60 * 1000);
  },
};
