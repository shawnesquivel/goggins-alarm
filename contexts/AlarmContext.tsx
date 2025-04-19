import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PomodoroSession,
  TimerSettings,
  Tag,
  TimerStatus,
} from "@/types/alarm";
import { Audio } from "expo-av";
import { SessionService } from "@/services/SessionService";
import { v4 as uuidv4 } from "uuid";

// Keys for AsyncStorage
const STORAGE_KEYS = {
  PROJECTS: "pomodoro_projects",
  SESSIONS: "pomodoro_sessions",
  TAGS: "pomodoro_tags",
  SETTINGS: "pomodoro_settings",
  CURRENT_SESSION: "pomodoro_current_session",
};

interface PomodoroContextType {
  // Timer state
  timerStatus: TimerStatus;
  currentSession: PomodoroSession | null;
  remainingSeconds: number;
  isOvertime: boolean;

  // Session management
  startFocusSession: (
    taskDescription: string,
    projectId: string,
    tags: string[],
    duration: number,
    customBreakDuration?: number
  ) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  startBreakSession: () => void;
  finishSession: (taskCompleted: boolean) => Promise<void>;

  // Settings
  settings: TimerSettings;
  updateSettings: (settings: TimerSettings) => void;

  // Analytics
  getSessionHistory: () => Promise<PomodoroSession[]>;
  getTotalFocusTime: (period: "day" | "week" | "month") => Promise<number>;
  getProjectStats: (
    projectId: string
  ) => Promise<{ totalSessions: number; totalMinutes: number }>;

  // New more specific functions
  completeWorkPeriod: (
    rating?: number,
    notes?: string,
    startBreak?: boolean
  ) => Promise<void>;
  completeRestPeriod: (
    activities?: string[],
    startNewWork?: boolean
  ) => Promise<void>;
}

// Default settings
const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  breakDuration: 5,
  soundEnabled: true,
  notificationsEnabled: true,
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(
  undefined
);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  // State
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(
    null
  );
  const [timerStatus, setTimerStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isOvertime, setIsOvertime] = useState<boolean>(false);
  const [nextBreakDuration, setNextBreakDuration] = useState<number | null>(
    null
  );

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isOvertimeRef = useRef(false);

  // Load saved data when component mounts
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load settings
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        } else {
          // Save default settings if none exist
          await AsyncStorage.setItem(
            STORAGE_KEYS.SETTINGS,
            JSON.stringify(DEFAULT_SETTINGS)
          );
        }

        // Load current session if exists
        const savedSession = await AsyncStorage.getItem(
          STORAGE_KEYS.CURRENT_SESSION
        );
        if (savedSession) {
          const session = JSON.parse(savedSession);

          // Add additional check for cancelled status
          if (session.status === "cancelled") {
            console.log("Found cancelled session, removing from storage");
            await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
            return;
          }

          // Only restore if session is recent (within last hour)
          const lastSessionTime = new Date(session.startTime).getTime();
          const oneHourAgo = Date.now() - 60 * 60 * 1000;

          if (lastSessionTime > oneHourAgo && !session.isCompleted) {
            // Additional verification with SessionService
            const dbSession = await SessionService.getSession(session.id);
            if (dbSession && dbSession.status === "cancelled") {
              console.log("Session was cancelled in DB, not restoring");
              await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
              return;
            }

            setCurrentSession(session);

            // Calculate remaining time
            const elapsedSeconds = Math.floor(
              (Date.now() - lastSessionTime) / 1000
            );
            const durationInSeconds = session.duration * 60;
            const remaining = Math.max(0, durationInSeconds - elapsedSeconds);

            setRemainingSeconds(remaining);

            if (remaining > 0) {
              setTimerStatus(TimerStatus.PAUSED); // Resume option for interrupted sessions
            } else {
              setTimerStatus(TimerStatus.COMPLETED);
            }
          }
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    };

    loadSavedData();

    // Cleanup function for timer and sound
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isOvertime && timerStatus === TimerStatus.RUNNING) {
      if (remainingSeconds <= 0) {
        setRemainingSeconds(1);
      }
    }
  }, [isOvertime]);

  // Timer functions
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      console.log("Timer cleared, creating new interval");
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 0 && !isOvertimeRef.current) {
          isOvertimeRef.current = true;
          setIsOvertime(true);
          console.log("Timer completed, entering overtime mode");
          return 1;
        } else if (isOvertimeRef.current) {
          return prev + 1;
        } else {
          return prev - 1;
        }
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const pauseSession = () => {
    console.log("AlarmContext: Pausing session");
    stopTimer();
    setTimerStatus(TimerStatus.PAUSED);

    // Note: For MVP, we're not recording pauses in the database
    // Future enhancement could be to track pause times
  };

  const resumeSession = () => {
    console.log("AlarmContext: Resuming session");
    setTimerStatus(TimerStatus.RUNNING);
    startTimer();

    // Note: For MVP, we're not recording resumes in the database
    // Future enhancement could be to track pause durations
  };
  // Session management
  const startFocusSession = async (
    taskDescription: string,
    projectId: string,
    tags: string[],
    duration: number,
    customBreakDuration?: number
  ) => {
    // Reset all session state
    isOvertimeRef.current = false;
    setIsOvertime(false);
    setNextBreakDuration(null);

    // Store custom break duration for next break if provided
    if (customBreakDuration !== undefined) {
      setNextBreakDuration(customBreakDuration);
    }

    const newSession: PomodoroSession = {
      id: uuidv4(),
      taskDescription,
      projectId,
      startTime: new Date(),
      duration,
      isCompleted: false,
      tags,
      type: "focus",
    };

    try {
      // Create session in database
      await SessionService.createSession({
        id: newSession.id,
        task: taskDescription,
        project_id: projectId,
        status: "in_progress",
      });

      // Create work period
      await SessionService.createPeriod({
        session_id: newSession.id,
        type: "work",
        planned_duration_minutes: duration,
        started_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        "AlarmContext: Error creating session/period in DB:",
        error
      );
      // Continue anyway - we want UI to work even if DB fails
    }

    setCurrentSession(newSession);
    setRemainingSeconds(Math.round(duration * 60));
    setTimerStatus(TimerStatus.RUNNING);

    // Save current session to local AsyncStorage (UI state)
    await AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_SESSION,
      JSON.stringify(newSession)
    );

    // Start timer
    startTimer();
  };

  const completeWorkPeriod = async (
    rating?: number,
    notes?: string,
    startBreak: boolean = false
  ) => {
    if (!currentSession || currentSession.type !== "focus") return;

    stopTimer();
    const currentPeriod = await SessionService.getCurrentPeriod();
    if (!currentPeriod) {
      console.warn("No current period found for work completion");
      return;
    }

    // Calculate duration
    const startTime = new Date(currentSession.startTime);
    const endTime = new Date();
    const actualSeconds = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    // Update work period
    await SessionService.updatePeriod(
      currentPeriod.id,
      {
        actual_duration_minutes: actualSeconds / 60,
        ended_at: endTime.toISOString(),
        quality_rating: rating || null,
      },
      !startBreak
    );

    // Only complete session if not transitioning to break
    if (!startBreak) {
      await SessionService.updateSession(currentSession.id, {
        status: "completed",
        user_notes: notes || null,
      });

      // Clean up UI state
      setCurrentSession(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }

    // UI state update
    setTimerStatus(TimerStatus.IDLE);

    // Only clear current period if not transitioning to break
    if (!startBreak) {
      await SessionService.setCurrentPeriod(null);
    }

    // Force sync to Supabase
    await SessionService.syncToSupabase();

    // Start break if requested
    if (startBreak) {
      await startBreakSession();
    }
  };

  const completeRestPeriod = async (
    activities?: string[],
    startNewWork: boolean = false
  ) => {
    if (!currentSession || currentSession.type !== "break") return;

    stopTimer();
    const currentPeriod = await SessionService.getCurrentPeriod();
    if (!currentPeriod) {
      console.warn("No current period found for rest completion");
      return;
    }

    // Calculate duration
    const startTime = new Date(currentSession.startTime);
    const endTime = new Date();
    const actualSeconds = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    // Update rest period
    await SessionService.updatePeriod(
      currentPeriod.id,
      {
        actual_duration_minutes: actualSeconds / 60,
        ended_at: endTime.toISOString(),
        rest_activities_selected: activities || null,
      },
      startNewWork
    );

    // Force sync to Supabase
    await SessionService.syncToSupabase();

    // Save current session info before transitioning
    const sessionId = currentSession.id;
    const projectId = currentSession.projectId;

    // Get the task description from the database session record
    const dbSession = await SessionService.getSession(sessionId);
    const taskDescription = dbSession?.task || "Couldn't Find Task Description"; // TODO: Remove for production

    // Clear the current period to prepare for the next one
    await SessionService.setCurrentPeriod(null);

    // If startNewWork is true, immediately start the next work period
    if (startNewWork) {
      await startNextWorkPeriod(sessionId, projectId, taskDescription);
    }
  };

  const startBreakSession = async () => {
    const currentPeriod = await SessionService.getCurrentPeriod();
    if (
      currentPeriod &&
      currentPeriod.type === "rest" &&
      currentSession?.id === currentPeriod.session_id
    ) {
      console.log("[AlarmContext]: Rest period already exists, skipping");
      return;
    }

    if (currentSession && currentSession.type === "break") return;

    // Reset state
    isOvertimeRef.current = false;
    setIsOvertime(false);
    setNextBreakDuration(null);

    // Clear any existing period first to avoid duplicates
    await SessionService.setCurrentPeriod(null);

    // Use custom break duration if set, otherwise use from settings
    const breakDuration =
      nextBreakDuration !== null ? nextBreakDuration : settings.breakDuration;

    // Use existing session ID if available
    const sessionId = currentSession?.id || uuidv4();

    // Create a representation of break period for UI state - preserve original task description
    const newSession: PomodoroSession = {
      id: sessionId, // Reuse session ID
      taskDescription: currentSession?.taskDescription || "", // Preserve original task description
      projectId: currentSession?.projectId || "break",
      startTime: new Date(),
      duration: breakDuration,
      isCompleted: false,
      tags: [],
      type: "break",
    };

    try {
      await SessionService.createPeriod({
        session_id: sessionId,
        type: "rest",
        planned_duration_minutes: breakDuration,
        started_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error creating break period:", error);
    }

    // Update UI state
    setCurrentSession(newSession);
    setRemainingSeconds(breakDuration * 60);
    setTimerStatus(TimerStatus.RUNNING);

    // Save current session state
    AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_SESSION,
      JSON.stringify(newSession)
    );

    // Auto start timer
    startTimer();
  };

  // Settings management
  const updateSettings = async (newSettings: TimerSettings) => {
    setSettings(newSettings);

    // Save to storage
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(newSettings)
    );
  };

  // Analytics functions
  const getSessionHistory = async (): Promise<PomodoroSession[]> => {
    const savedSessions = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
    return savedSessions ? JSON.parse(savedSessions) : [];
  };

  const getTotalFocusTime = async (
    period: "day" | "week" | "month"
  ): Promise<number> => {
    const sessions = await getSessionHistory();

    // Filter by time period and focus sessions only
    const now = new Date();
    let cutoffDate = new Date();

    switch (period) {
      case "day":
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case "week":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
    }

    const relevantSessions = sessions.filter(
      (session) =>
        session.type === "focus" &&
        session.isCompleted &&
        new Date(session.endTime!) >= cutoffDate
    );

    // Calculate total minutes
    return relevantSessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime!);
      const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
      return total + minutes;
    }, 0);
  };

  const getProjectStats = async (
    projectId: string
  ): Promise<{ totalSessions: number; totalMinutes: number }> => {
    const sessions = await getSessionHistory();

    const projectSessions = sessions.filter(
      (session) =>
        session.projectId === projectId &&
        session.type === "focus" &&
        session.isCompleted
    );

    const totalMinutes = projectSessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime!);
      const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
      return total + minutes;
    }, 0);

    return {
      totalSessions: projectSessions.length,
      totalMinutes,
    };
  };

  const finishSession = async (taskCompleted?: boolean) => {
    console.log(
      `AlarmContext: Finishing session ${currentSession?.id}, task_completed: ${taskCompleted}`
    );

    if (!currentSession) return;

    // Stop timer
    stopTimer();

    // Get current session ID before clearing state
    const sessionId = currentSession.id;

    try {
      // IMPORTANT: Update the local session object in AsyncStorage directly
      // This ensures even with a fast refresh, the app won't restart the timer
      const modifiedSession = {
        ...currentSession,
        isCompleted: true, // Mark as completed in UI state (this is different from task_completed)
        status: "completed", // Set correct status based on whether task was completed
      };
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_SESSION,
        JSON.stringify(modifiedSession)
      );

      // Use the new method to complete the session with the correct status
      await SessionService.completeSession(sessionId, taskCompleted || false);

      // Update UI state
      setCurrentSession(null);
      setTimerStatus(TimerStatus.IDLE);
      setIsOvertime(false);
      isOvertimeRef.current = false;

      console.info("❗ [AlarmContext.finishSession] Cleaned up UI");
    } catch (error) {
      console.error("Error finishing session:", error);
    }
  };

  // New function to start the next work period in the same session
  const startNextWorkPeriod = async (
    sessionId: string,
    projectId: string,
    taskDescription: string,
    customDuration?: number
  ) => {
    console.log(
      "AlarmContext: Starting next work period in session",
      sessionId
    );

    // Reset overtime state
    isOvertimeRef.current = false;
    setIsOvertime(false);

    // Use default focus duration if none specified
    const duration =
      customDuration !== undefined ? customDuration : settings.focusDuration;

    // Create a work session with the same session ID
    const workSession: PomodoroSession = {
      id: sessionId, // Reuse the same session ID
      taskDescription,
      projectId,
      startTime: new Date(),
      duration: duration,
      isCompleted: false,
      tags: [],
      type: "focus",
    };

    try {
      // Update the session status back to in_progress if needed
      await SessionService.updateSession(sessionId, {
        status: "in_progress",
      });

      // Create a new work period linked to the same session
      await SessionService.createPeriod({
        session_id: sessionId,
        type: "work",
        planned_duration_minutes: duration,
        started_at: new Date().toISOString(),
      });

      console.log(
        "AlarmContext: Created new work period in session",
        sessionId
      );
    } catch (error) {
      console.error("Error starting next work period:", error);
      // Continue anyway - we want UI to work even if DB fails
    }

    // Update UI state
    setCurrentSession(workSession);
    setRemainingSeconds(Math.round(duration * 60));
    setTimerStatus(TimerStatus.RUNNING);

    // Save current session to AsyncStorage
    await AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_SESSION,
      JSON.stringify(workSession)
    );

    // Auto start timer
    startTimer();
  };

  return (
    <PomodoroContext.Provider
      value={{
        // Timer state
        timerStatus,
        currentSession,
        remainingSeconds,
        isOvertime,

        // Session management
        startFocusSession,
        pauseSession,
        resumeSession,
        startBreakSession,
        finishSession,

        // Settings
        settings,
        updateSettings,

        // Analytics
        getSessionHistory,
        getTotalFocusTime,
        getProjectStats,

        // New more specific functions
        completeWorkPeriod,
        completeRestPeriod,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
};
