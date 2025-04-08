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
  completeSession: (rating?: "happy" | "sad", notes?: string) => void;
  startBreakSession: () => void;

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
  autoStartBreak: true,
  autoStartNextFocus: false,
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

  // Add this after your other useEffects
  useEffect(() => {
    console.log(`⚠️ isOvertime STATE CHANGED to: ${isOvertime}`);

    // When overtime state changes, let's make sure the timer updates properly
    if (isOvertime && timerStatus === TimerStatus.RUNNING) {
      console.log(
        "Overtime state changed while timer running, checking timer state"
      );
      if (remainingSeconds <= 0) {
        console.log(
          "Remaining seconds is <= 0, setting to 1 for overtime start"
        );
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
        console.log(
          `Timer tick - Previous seconds: ${prev}, isOvertime ref: ${isOvertimeRef.current}, state: ${isOvertime}`
        );

        if (prev <= 0 && !isOvertimeRef.current) {
          playTimerCompleteSound();

          isOvertimeRef.current = true;
          setIsOvertime(true);

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
    // Create new session with either custom duration or default from settings
    const duration =
      customDuration !== undefined ? customDuration : settings.focusDuration;

    // Store custom break duration for next break if provided
    if (customBreakDuration !== undefined) {
      setNextBreakDuration(customBreakDuration);
    } else {
      setNextBreakDuration(null);
    }

    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      taskDescription,
      projectId,
      startTime: new Date(),
      duration: duration,
      isCompleted: false,
      tags,
      type: "focus",
    };

    setCurrentSession(newSession);
    // Convert minutes to seconds (handle fractional minutes for short sessions)
    setRemainingSeconds(Math.round(duration * 60));
    setTimerStatus(TimerStatus.RUNNING);

    // Save current session
    await AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_SESSION,
      JSON.stringify(newSession)
    );

    // Start timer
    startTimer();
  };

  const pauseSession = () => {
    stopTimer();
    setTimerStatus(TimerStatus.PAUSED);
  };

  const resumeSession = () => {
    setTimerStatus(TimerStatus.RUNNING);
    startTimer();
  };

  const completeSession = async (rating?: "happy" | "sad", notes?: string) => {
    if (!currentSession) return;

    stopTimer();

    // Reset overtime state
    isOvertimeRef.current = false;
    setIsOvertime(false);

    // Update session with completion data
    const completedSession = {
      ...currentSession,
      endTime: new Date(),
      isCompleted: true,
      rating,
      notes,
    };

    // Clear current session
    setCurrentSession(null);
    setTimerStatus(TimerStatus.IDLE);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);

    // Save completed session to history
    const savedSessions = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions = savedSessions ? JSON.parse(savedSessions) : [];
    sessions.push(completedSession);
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    // Auto-start break if setting enabled
    if (settings.autoStartBreak) {
      startBreakSession();
    }
  };

  const startBreakSession = () => {
    if (currentSession && currentSession.type === "break") return;

    // Use custom break duration if set, otherwise use from settings
    const breakDuration =
      nextBreakDuration !== null ? nextBreakDuration : settings.breakDuration;

    // Create new break session
    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      taskDescription: "Break",
      projectId: "break",
      startTime: new Date(),
      duration: breakDuration,
      isCompleted: false,
      tags: [],
      type: "break",
    };

    // Reset custom break duration after using it
    setNextBreakDuration(null);

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
