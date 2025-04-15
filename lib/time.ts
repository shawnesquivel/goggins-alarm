import { format } from "date-fns";

export const formatTimeSummary = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.floor(minutes)}:00`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }
};

/**
 *
 * @param seconds
 *  // Format remaining time as mm:ss
 * @returns
 */
export const formatTimeDisplay = (
  seconds: number,
  isOvertime: boolean
): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeString = `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
  return `${isOvertime ? "+" : ""}${timeString}`;
};

/**
 * Formats duration for sharing/export in hours and minutes
 * @param seconds - Total number of seconds
 * @returns Formatted duration string (e.g. "2h 30m")
 */
export const formatDurationForExport = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

// Format time only for the session list items
export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "h:mm a").toLowerCase();
};
