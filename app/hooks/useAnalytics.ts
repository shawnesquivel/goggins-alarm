import { useState, useEffect } from "react";
import { AnalyticsService } from "@/services/AnalyticsService";

interface AnalyticsData {
  totalDeepWork: string;
  deepWorkSessions: number;
  deepWorkMinutes: number;
  deepRestSessions: number;
  deepRestMinutes: number;
  goalProgressPercentage: number;
}

const initialAnalytics: AnalyticsData = {
  totalDeepWork: "0:00:00",
  deepWorkSessions: 0,
  deepWorkMinutes: 0,
  deepRestSessions: 0,
  deepRestMinutes: 0,
  goalProgressPercentage: 0,
};

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalytics);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  const loadAnalytics = async () => {
    setIsAnalyticsLoading(true);
    try {
      const stats = await AnalyticsService.getTodayStats();
      setAnalytics(stats);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setAnalytics(initialAnalytics);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsAnalyticsLoading(true);
    try {
      await AnalyticsService.forceRefresh();
      await loadAnalytics();
    } catch (error) {
      console.error("Failed to refresh analytics:", error);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return {
    analytics,
    isAnalyticsLoading,
    loadAnalytics,
    handleRefresh,
  };
}
