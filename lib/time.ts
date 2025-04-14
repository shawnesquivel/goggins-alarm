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
