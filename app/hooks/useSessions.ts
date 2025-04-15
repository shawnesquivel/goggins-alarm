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
      setSessions(data);

      // Group sessions by date
      const grouped = groupSessionsByDate(data);
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
