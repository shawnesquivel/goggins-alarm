import { useState, useEffect } from "react";
import { AnalyticsService } from "@/services/AnalyticsService";

interface ProjectData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
}

interface RestStats {
  totalSessions: number;
  totalMinutes: number;
}

export function useProjectStats(
  timeframe: "day" | "week" | "month" = "week",
  selectedDate?: Date
) {
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [restStats, setRestStats] = useState<RestStats>({
    totalSessions: 0,
    totalMinutes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Format total time
  const formatTotalTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.floor((totalMinutes % 1) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // Calculate total minutes from project data
  const getTotalMinutes = () => {
    return projectData.reduce((acc, item) => acc + item.population, 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [projectStats, restData] = await Promise.all([
          AnalyticsService.getProjectTimeStats(timeframe, selectedDate),
          AnalyticsService.getRestStats(timeframe, selectedDate),
        ]);

        // Transform stats into the format PieChart expects
        const formattedData = projectStats.map((project) => ({
          name: project.name,
          population: project.totalMinutes, // Preserve decimal precision
          color: project.color || "#73AEA4", // Use project color or fallback
          legendFontColor: "#333",
        }));

        setProjectData(formattedData);
        setRestStats(restData);
        setError(null);
      } catch (err) {
        console.error("[useProjectStats] Error fetching data:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        // Keep the previous data if we have an error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeframe, selectedDate]); // Re-fetch when timeframe or selectedDate changes

  return {
    projectData,
    restStats,
    isLoading,
    error,
    totalMinutes: getTotalMinutes(),
    formattedTotalTime: formatTotalTime(getTotalMinutes()),
    formattedRestTime: formatTotalTime(restStats.totalMinutes),
  };
}
