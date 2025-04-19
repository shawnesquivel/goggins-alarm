import { format } from "date-fns";

/**
 * Formats minutes into a time summary string
 * @param minutes - Number of minutes to format
 * @returns Formatted string in the format "0:SS", "MM:SS", or "H:MM" depending on duration
 */
export const formatTimeSummary = (minutes: number): string => {
  if (minutes < 1) {
    // Less than 1 minute - show as 0:SS
    const seconds = Math.floor(minutes * 60);
    return `0:${seconds.toString().padStart(2, "0")}`;
  } else if (minutes < 60) {
    // Between 1 and 60 minutes - show as MM:SS
    const mins = Math.floor(minutes);
    const seconds = Math.floor((minutes - mins) * 60);
    return `${mins}:${seconds.toString().padStart(2, "0")}`;
  } else {
    // More than 60 minutes - show as H:MM
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }
};

/**
 * Formats seconds into a time display string with optional overtime indicator
 * @param seconds - Number of seconds to format
 * @param isOvertime - Whether to show overtime indicator
 * @returns Formatted string in the format "MM:SS" with optional "+" prefix
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

/**
 * Formats a date string to display only the time in 12-hour format
 * @param dateString - Date string to format
 * @returns Formatted time string in lowercase (e.g. "2:30 pm")
 */
export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "h:mm a").toLowerCase();
};
