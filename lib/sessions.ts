import { format } from "date-fns";
import { isYesterday } from "date-fns";
import { isToday } from "date-fns";
import { Session, SessionSection } from "@/types/session";
import FontAwesome from "@expo/vector-icons/FontAwesome";

// Group sessions by date (Today, Yesterday, and other dates)
export const groupSessionsByDate = (sessions: Session[]): SessionSection[] => {
  const sections: Record<string, Session[]> = {};

  sessions.forEach((session) => {
    const date = new Date(session.created_at);
    let dateKey;

    if (isToday(date)) {
      dateKey = "Today";
    } else if (isYesterday(date)) {
      dateKey = "Yesterday";
    } else {
      dateKey = format(date, "MMMM d, yyyy");
    }

    if (!sections[dateKey]) {
      sections[dateKey] = [];
    }

    sections[dateKey].push(session);
  });

  // Convert to array of section objects
  return Object.keys(sections).map((key) => ({
    title: key,
    data: sections[key],
  }));
};

export interface IconInfo {
  name: string;
  color: string;
  size: number;
}

export const getCompletionIcon = (
  status: string,
  projectColor: string | undefined
): IconInfo => {
  const color = projectColor || getStatusColor(status);

  switch (status) {
    case "completed":
      return { name: "check-circle", size: 18, color };
    case "cancelled":
      return { name: "times-circle", size: 18, color: "#F44336" };
    default:
      return { name: "circle-thin", size: 18, color: color || "#BBBBBB" };
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "#4CAF50";
    case "cancelled":
      return "#F44336";
    default:
      return "#BBBBBB";
  }
};

// Format time for display
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return !isNaN(date.getTime())
    ? format(date, "h:mm a").toLowerCase()
    : "unknown time";
};
