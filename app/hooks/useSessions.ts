import { useState, useEffect, useCallback } from "react";
import { AnalyticsService } from "@/services/AnalyticsService";
import { Session, SessionSection } from "@/types/session";
import { groupSessionsByDate } from "@/lib/sessions";

export default function useSessions(limit: number = 20) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionSections, setSessionSections] = useState<SessionSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await AnalyticsService.getRecentSessions(limit);

      // Ensure project colors are set properly
      const processedData = data.map((session) => {
        // If project exists but color is missing, set a default color
        if (session.project && !session.project.color) {
          console.log(
            `[useSessions] Session ${session.id} has project but missing color, using default`
          );
          return {
            ...session,
            project: {
              ...session.project,
              color: "#808080", // Default gray color
            },
          };
        }
        return session;
      });

      setSessions(processedData);

      // Group sessions by date
      const grouped = groupSessionsByDate(processedData);
      setSessionSections(grouped);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await AnalyticsService.forceRefresh();
      await fetchSessions();
    } catch (err) {
      console.error("Error refreshing sessions:", err);
      setError("Failed to refresh sessions");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    sessionSections,
    isLoading,
    isRefreshing,
    error,
    refetch: fetchSessions,
    refresh: handleRefresh,
  };
}
