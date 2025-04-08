export interface PomodoroSession {
  id: string;
  taskDescription: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  isCompleted: boolean;
  rating?: number; // 1-5 star rating
  notes?: string;
  tags: string[];
  type: "focus" | "break";
}

export interface Project {
  id: string;
  name: string;
  goal?: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimerSettings {
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  soundEnabled?: boolean;
  notificationsEnabled?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export enum TimerStatus {
  IDLE = "idle",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
}
