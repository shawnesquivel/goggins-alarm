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
    customDuration?: number,
    customBreakDuration?: number
  ) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: (
    rating?: number,
    notes?: string,
    transitionToBreak?: boolean,
    breakActivities?: string[]
  ) => void;
  startBreakSession: () => void;
  cancelSession: () => void;

  // Tags
  tags: Tag[];
  addTag: (tag: Omit<Tag, "id">) => void;
  deleteTag: (id: string) => void;

  // Settings
  settings: TimerSettings;
  updateSettings: (settings: TimerSettings) => void;

  // Analytics
  getSessionHistory: () => Promise<PomodoroSession[]>;
  getTotalFocusTime: (period: "day" | "week" | "month") => Promise<number>;
  getProjectStats: (
    projectId: string
  ) => Promise<{ totalSessions: number; totalMinutes: number }>;
}

// Default settings
const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  breakDuration: 5,
  soundEnabled: true,
  notificationsEnabled: true,
};

// Default tags
const DEFAULT_TAGS: Tag[] = [
  { id: "1", name: "Coding", color: "#4A90E2" },
  { id: "2", name: "Planning", color: "#7ED321" },
  { id: "3", name: "Marketing", color: "#F5A623" },
  { id: "4", name: "Meeting", color: "#D0021B" },
  { id: "5", name: "Education", color: "#9013FE" },
  { id: "6", name: "Design", color: "#50E3C2" },
  { id: "7", name: "Sales", color: "#BD10E0" },
];

const PomodoroContext = createContext<PomodoroContextType | undefined>(
  undefined
);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  // State
  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS);
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
        // Load tags
        const savedTags = await AsyncStorage.getItem(STORAGE_KEYS.TAGS);
        if (savedTags) {
          setTags(JSON.parse(savedTags));
        } else {
          // Save default tags if none exist
          await AsyncStorage.setItem(
            STORAGE_KEYS.TAGS,
            JSON.stringify(DEFAULT_TAGS)
          );
        }

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

          // Only restore if session is recent (within last hour)
          const lastSessionTime = new Date(session.startTime).getTime();
          const oneHourAgo = Date.now() - 60 * 60 * 1000;

          if (lastSessionTime > oneHourAgo && !session.isCompleted) {
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
          playTimerCompleteSound();
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

  // Sound functions
  const playTimerCompleteSound = async () => {
    try {
      console.log("⚠️ SOUND: Playing timer complete sound");
      console.log("⚠️ Current isOvertime state:", isOvertime);
      // const { sound } = await Audio.Sound.createAsync(
      //   require("@/assets/sounds/timer-complete.mp3")
      // );
      // soundRef.current = sound;
      // await sound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Session management
  const startFocusSession = async (
    taskDescription: string,
    projectId: string,
    tags: string[],
    customDuration?: number,
    customBreakDuration?: number
  ) => {
    console.log("AlarmContext: Starting focus session", {
      taskDescription,
      projectId,
      customDuration,
      customBreakDuration,
    });

    // Reset all session state
    isOvertimeRef.current = false;
    setIsOvertime(false);
    setNextBreakDuration(null);

    // Create new session with either custom duration or default from settings
    const duration =
      customDuration !== undefined ? customDuration : settings.focusDuration;

    // Store custom break duration for next break if provided
    if (customBreakDuration !== undefined) {
      setNextBreakDuration(customBreakDuration);
    }

    const newSession: PomodoroSession = {
      id: uuidv4(),
      taskDescription,
      projectId,
      startTime: new Date(),
      duration: duration,
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

      console.log("AlarmContext: Created session in DB", newSession.id);

      // Create work period
      await SessionService.createPeriod({
        session_id: newSession.id,
        type: "work",
        planned_duration_minutes: duration,
        started_at: new Date().toISOString(),
      });

      console.log("AlarmContext: Created work period in DB");
    } catch (error) {
      console.error(
        "AlarmContext: Error creating session/period in DB:",
        error
      );
      // Continue anyway - we want UI to work even if DB fails
    }

    setCurrentSession(newSession);
    // Convert minutes to seconds (handle fractional minutes for short sessions)
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

  const completeSession = async (
    rating?: number,
    notes?: string,
    transitionToBreak: boolean = false,
    breakActivities?: string[]
  ) => {
    console.log("AlarmContext: Completing session", {
      sessionId: currentSession?.id,
      rating,
      notesLength: notes?.length || 0,
      transitionToBreak,
      breakActivities,
    });

    if (!currentSession) return;

    stopTimer();

    // Get the current period from SessionService
    const currentPeriod = await SessionService.getCurrentPeriod();

    if (currentPeriod) {
      console.log("AlarmContext: Found current period", currentPeriod.id);

      // Calculate actual duration including overtime
      const startTime = new Date(currentSession.startTime);
      const endTime = new Date();
      const actualSeconds = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );
      const plannedSeconds = currentSession.duration * 60;

      console.log("AlarmContext: Duration calculation", {
        planned: plannedSeconds,
        actual: actualSeconds,
        overtime: actualSeconds - plannedSeconds,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isOvertime: isOvertimeRef.current,
      });

      // Complete the period with different fields based on session type
      const periodUpdate = {
        actual_duration_minutes: actualSeconds / 60,
        ended_at: endTime.toISOString(),
        completed: true,
      };

      if (currentSession.type === "focus") {
        // For focus sessions, include rating and notes
        Object.assign(periodUpdate, {
          quality_rating: rating || null,
          user_notes: notes || null,
        });
      } else if (currentSession.type === "break") {
        // For break sessions, include activities
        Object.assign(periodUpdate, {
          rest_activities_selected: breakActivities || null,
        });
      }

      await SessionService.updatePeriod(currentPeriod.id, periodUpdate);

      // Update session
      await SessionService.updateSession(currentSession.id, {
        status: "completed",
        completed: true,
        user_notes: notes || null,
      });

      console.log("AlarmContext: Updated session status to completed");

      // Force sync to Supabase
      await SessionService.syncToSupabase();
    } else {
      console.warn(
        "AlarmContext: No current period found when completing session"
      );
    }

    // Store the current session data before clearing it
    const completedSession = currentSession;

    // UI state updates
    setCurrentSession(null);
    setTimerStatus(TimerStatus.IDLE);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);

    // Clear current period in SessionService
    await SessionService.setCurrentPeriod(null);

    // If we're transitioning to a break session, start it now
    if (transitionToBreak) {
      console.log("AlarmContext: Transitioning to break session");
      await startBreakSession();
    }
  };

  const startBreakSession = async () => {
    if (currentSession && currentSession.type === "break") return;

    // Reset all session state
    isOvertimeRef.current = false;
    setIsOvertime(false);
    setNextBreakDuration(null);

    // Clear any existing period/session first to avoid duplicates
    await SessionService.setCurrentPeriod(null);

    // Use custom break duration if set, otherwise use from settings
    const breakDuration =
      nextBreakDuration !== null ? nextBreakDuration : settings.breakDuration;

    // Create new break session
    const newSession: PomodoroSession = {
      id: uuidv4(),
      taskDescription: "Break",
      projectId: currentSession?.projectId || "break",
      startTime: new Date(),
      duration: breakDuration,
      isCompleted: false,
      tags: [],
      type: "break",
    };

    try {
      // Create new break session in DB or update existing session
      // For simplicity in MVP, we'll create a new session for breaks too
      await SessionService.createSession({
        id: newSession.id,
        task: "Break",
        project_id: newSession.projectId,
        status: "in_progress",
      });

      console.log("AlarmContext: Created break session in DB", newSession.id);

      // Create rest period
      await SessionService.createPeriod({
        session_id: newSession.id,
        type: "rest",
        planned_duration_minutes: breakDuration,
        started_at: new Date().toISOString(),
      });

      console.log("AlarmContext: Created rest period in DB");
    } catch (error) {
      console.error("AlarmContext: Error creating break session in DB:", error);
    }

    setCurrentSession(newSession);
    setRemainingSeconds(breakDuration * 60);
    setTimerStatus(TimerStatus.RUNNING);

    // Save current session
    AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_SESSION,
      JSON.stringify(newSession)
    );

    // Start timer
    startTimer();
  };

  // Tag management
  const addTag = async (tagData: Omit<Tag, "id">) => {
    const newTag: Tag = {
      ...tagData,
      id: Date.now().toString(),
    };

    const updatedTags = [...tags, newTag];
    setTags(updatedTags);

    // Save to storage
    await AsyncStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(updatedTags));
  };

  const deleteTag = async (id: string) => {
    const updatedTags = tags.filter((tag) => tag.id !== id);
    setTags(updatedTags);

    // Save to storage
    await AsyncStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(updatedTags));
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

  // Add a function to handle cancellation, which we should update
  const handleCancelSession = async () => {
    console.log("AlarmContext: Cancelling session", currentSession?.id);

    if (!currentSession) return;

    try {
      // Get the current period
      const currentPeriod = await SessionService.getCurrentPeriod();

      if (currentPeriod) {
        // Calculate actual duration up to now
        const startTime = new Date(currentSession.startTime);
        const endTime = new Date();
        const actualSeconds = Math.floor(
          (endTime.getTime() - startTime.getTime()) / 1000
        );

        // Update period as incomplete
        await SessionService.updatePeriod(currentPeriod.id, {
          actual_duration_minutes: actualSeconds / 60, // Convert back to minutes for storage
          ended_at: new Date().toISOString(),
          completed: false,
        });

        console.log("AlarmContext: Updated period for cancelled session");

        // Update session as cancelled
        await SessionService.updateSession(currentSession.id, {
          status: "cancelled",
          cancelled_reason: "User cancelled",
          completed: false,
        });

        console.log("AlarmContext: Updated session as cancelled");

        // Force sync
        await SessionService.syncToSupabase();
      }
    } catch (error) {
      console.error("AlarmContext: Error cancelling session in DB:", error);
    }

    // Continue with existing UI state updates
    stopTimer();
    setCurrentSession(null);
    setTimerStatus(TimerStatus.IDLE);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);

    // Clear current period in SessionService
    await SessionService.setCurrentPeriod(null);
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
        completeSession,
        startBreakSession,
        cancelSession: handleCancelSession,

        // Tags
        tags,
        addTag,
        deleteTag,

        // Settings
        settings,
        updateSettings,

        // Analytics
        getSessionHistory,
        getTotalFocusTime,
        getProjectStats,
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
