import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import { usePomodoro } from "@/contexts/AlarmContext";
import { useProjects } from "@/contexts/ProjectContext";
import { PomodoroSession } from "@/types/alarm";

export default function ReportsScreen() {
  const { getSessionHistory, getTotalFocusTime, getProjectStats } =
    usePomodoro();
  const { projects } = useProjects();
  const [sessionHistory, setSessionHistory] = useState<PomodoroSession[]>([]);
  const [totalToday, setTotalToday] = useState(0);
  const [totalWeek, setTotalWeek] = useState(0);
  const [totalMonth, setTotalMonth] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month"
  >("day");
  const [projectStats, setProjectStats] = useState<
    Record<string, { totalSessions: number; totalMinutes: number }>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load session history
      const sessions = await getSessionHistory();
      setSessionHistory(sessions);

      // Get period totals
      const dayTotal = await getTotalFocusTime("day");
      const weekTotal = await getTotalFocusTime("week");
      const monthTotal = await getTotalFocusTime("month");

      setTotalToday(dayTotal);
      setTotalWeek(weekTotal);
      setTotalMonth(monthTotal);

      // Get stats for each project
      const stats: Record<
        string,
        { totalSessions: number; totalMinutes: number }
      > = {};

      if (projects && projects.length > 0) {
        for (const project of projects) {
          const projectStat = await getProjectStats(project.id);
          stats[project.id] = projectStat;
        }
      }

      setProjectStats(stats);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getProjectName = (projectId: string): string => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  const getPeriodTotal = () => {
    switch (selectedPeriod) {
      case "day":
        return totalToday;
      case "week":
        return totalWeek;
      case "month":
        return totalMonth;
      default:
        return 0;
    }
  };

  // Filter sessions based on selected period
  const getFilteredSessions = (): PomodoroSession[] => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (selectedPeriod) {
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

    return sessionHistory
      .filter(
        (session) =>
          session.type === "focus" &&
          session.isCompleted &&
          new Date(session.startTime) >= cutoffDate
      )
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <Pressable
            style={[
              styles.periodButton,
              selectedPeriod === "day" && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod("day")}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "day" && styles.selectedPeriodText,
              ]}
            >
              Day
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.periodButton,
              selectedPeriod === "week" && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod("week")}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "week" && styles.selectedPeriodText,
              ]}
            >
              Week
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.periodButton,
              selectedPeriod === "month" && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod("month")}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === "month" && styles.selectedPeriodText,
              ]}
            >
              Month
            </Text>
          </Pressable>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Total Focus Time -{" "}
            {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
          </Text>
          <Text style={styles.summaryValue}>
            {formatTime(getPeriodTotal())}
          </Text>
        </View>

        {/* Projects Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Breakdown</Text>
          {projects.length === 0 ? (
            <Text style={styles.emptyText}>No projects created yet</Text>
          ) : (
            projects.map((project) => {
              const stats = projectStats[project.id] || {
                totalSessions: 0,
                totalMinutes: 0,
              };
              return (
                <View
                  key={project.id}
                  style={[
                    styles.projectRow,
                    { borderLeftColor: project.color || "#4A90E2" },
                  ]}
                >
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View style={styles.projectStats}>
                    <Text style={styles.sessionCount}>
                      {stats.totalSessions} sessions
                    </Text>
                    <Text style={styles.timeTotal}>
                      {formatTime(stats.totalMinutes)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {getFilteredSessions().length === 0 ? (
            <Text style={styles.emptyText}>No sessions in this period</Text>
          ) : (
            getFilteredSessions()
              .slice(0, 10)
              .map((session) => (
                <View key={session.id} style={styles.sessionItem}>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionProject}>
                      {getProjectName(session.projectId)}
                    </Text>
                    <Text style={styles.sessionDate}>
                      {new Date(session.startTime).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.sessionDescription}>
                    {session.taskDescription}
                  </Text>
                  <View style={styles.sessionFooter}>
                    <Text style={styles.sessionDuration}>
                      {formatTime(
                        session.endTime
                          ? (new Date(session.endTime).getTime() -
                              new Date(session.startTime).getTime()) /
                              (1000 * 60)
                          : session.duration
                      )}
                    </Text>
                    {session.rating && (
                      <Text style={styles.sessionRating}>
                        {session.rating >= 3 ? "😊" : "😞"}
                      </Text>
                    )}
                  </View>
                </View>
              ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  periodSelector: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  selectedPeriod: {
    backgroundColor: "#4A90E2",
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  selectedPeriodText: {
    color: "#fff",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginVertical: 16,
  },
  projectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    borderLeftWidth: 4,
    paddingLeft: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "500",
  },
  projectStats: {
    alignItems: "flex-end",
  },
  sessionCount: {
    fontSize: 14,
    color: "#666",
  },
  timeTotal: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  sessionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sessionProject: {
    fontSize: 16,
    fontWeight: "500",
  },
  sessionDate: {
    fontSize: 12,
    color: "#999",
  },
  sessionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  sessionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: "500",
  },
  sessionRating: {
    fontSize: 16,
  },
});
