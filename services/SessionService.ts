// services/SessionService.ts
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
  // Session operations
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

  async updateSession(
    sessionId: string,
    sessionData: DbSessionUpdate
  ): Promise<DbSession> {
    // Get existing session
    const session = await this.getSession(sessionId);
    if (!session) {
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
    await this.addPendingOperation({
      type: "update_session",
      data: {
        id: sessionId,
        ...sessionData,
        last_updated_at: updatedSession.last_updated_at,
      },
      timestamp: Date.now(),
    });

    return updatedSession;
  },

  async getSession(sessionId: string): Promise<DbSession | null> {
    const sessions = await this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    return session || null;
  },

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

  // Period operations
  async createPeriod(periodData: DbPeriodInsert): Promise<DbPeriod> {
    console.log("SessionService: Creating period", periodData);

    // First, clean up any existing in-progress periods for this session
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
      distraction_reasons_selected: null,
      rest_activities_selected: null,
      user_notes: null,
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

  async updatePeriod(
    periodId: string,
    periodData: DbPeriodUpdate
  ): Promise<DbPeriod> {
    console.log("SessionService: Updating period", periodId, periodData);

    // Get existing period
    const period = await this.getPeriod(periodId);
    if (!period) {
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

      console.log(
        "SessionService: Setting work_time_completed =",
        periodData.work_time_completed,
        `(${periodData.actual_duration_minutes} >= ${period.planned_duration_minutes})`
      );
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

    // Calculate session totals if period is completed
    if (
      updatedPeriod.actual_duration_minutes != undefined &&
      updatedPeriod.session_id
    ) {
      await this.calculateSessionTotals(updatedPeriod.session_id);
    }

    return updatedPeriod;
  },

  async getPeriod(periodId: string): Promise<DbPeriod | null> {
    const periods = await this.getLocalPeriods();
    const period = periods.find((p) => p.id === periodId);

    return period || null;
  },

  async getSessionPeriods(sessionId: string): Promise<DbPeriod[]> {
    const periods = await this.getLocalPeriods();
    const sessionPeriods = periods.filter((p) => p.session_id === sessionId);

    return sessionPeriods;
  },

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

  // Helper function to clean up in-progress periods
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

  // Current session/period management
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

  // Sync operations
  async syncToSupabase(force: boolean = false): Promise<boolean> {
    console.log("SessionService: Syncing to Supabase, force=", force);

    try {
      const pendingOps = await this.getPendingOperations();

      if (pendingOps.length === 0 && !force) {
        console.log("SessionService: No pending operations to sync");
        return true;
      }

      // Get authenticated user
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        console.log("SessionService: No authenticated user, aborting sync");
        return false;
      }

      // Process each operation
      for (const op of pendingOps) {
        try {
          if (op.type === "insert_session") {
            const sessionData = op.data as DbSessionInsert;

            // Add user_id
            const sessionWithUser = {
              ...sessionData,
              user_id: user.id,
            };

            console.log(
              "SessionService: Inserting session to Supabase",
              sessionWithUser.id
            );

            const { error } = await supabase
              .from("sessions")
              .insert(sessionWithUser);

            if (error) {
              console.error("Error inserting session:", error);
              continue;
            }
          } else if (op.type === "update_session") {
            const sessionData = op.data as DbSessionUpdate;

            console.log(
              "SessionService: Updating session in Supabase",
              sessionData.id
            );

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

            console.log(
              "SessionService: Inserting period to Supabase",
              periodData.id
            );

            const { error } = await supabase.from("periods").insert(periodData);

            if (error) {
              console.error("Error inserting period:", error);
              continue;
            }
          } else if (op.type === "update_period") {
            const periodData = op.data as DbPeriodUpdate;

            console.log(
              "SessionService: Updating period in Supabase",
              periodData.id
            );

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

      console.log(
        `SessionService: Sync completed. Remaining operations: ${remainingOps.length}`
      );

      return remainingOps.length === 0;
    } catch (error) {
      console.error("Error syncing to Supabase:", error);
      return false;
    }
  },

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

  // Helper methods
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
        console.log(
          `SessionService: Adding work period: ${
            period.id
          }, duration: ${periodSeconds}s (${
            period.actual_duration_minutes
          }min), new total: ${totalWorkSeconds}s (${totalWorkSeconds / 60}min)`
        );
      } else if (period.type === "rest") {
        totalRestSeconds += periodSeconds;
        console.log(
          `SessionService: Adding rest period: ${
            period.id
          }, duration: ${periodSeconds}s (${
            period.actual_duration_minutes
          }min), new total: ${totalRestSeconds}s (${totalRestSeconds / 60}min)`
        );
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

    console.log(
      `SessionService: FINAL TOTALS for Session ${sessionId} - Deep Work: ${totalWorkSeconds}s (${totalWorkMinutes}min), Deep Rest: ${totalRestSeconds}s (${totalRestMinutes}min)`
    );

    return {
      total_deep_work_minutes: totalWorkMinutes,
      total_deep_rest_minutes: totalRestMinutes,
    };
  },
};
