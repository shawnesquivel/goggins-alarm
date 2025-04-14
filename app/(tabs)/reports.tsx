import { View, Text, ScrollView, Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import { usePomodoro } from "@/contexts/AlarmContext";
import { useProjects } from "@/contexts/ProjectContext";
import { PomodoroSession } from "@/types/alarm";
import { ProjectPieChart } from "../../components/charts/ProjectPieChart";
import { format, startOfWeek } from "date-fns";
import { WeekPicker } from "../../components/WeekPicker";
import { AnalyticsService } from "@/services/AnalyticsService";
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_400Regular_Italic,
  useFonts,
} from "@expo-google-fonts/libre-baskerville";

export default function ReportsScreen() {
  const [fontsLoaded] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_400Regular_Italic,
  });

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
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [weeklyStats, setWeeklyStats] = useState({
    deepWorkSessions: 3,
    deepWorkTime: "56:00",
    deepRestSessions: 1,
    deepRestTime: "10:00",
  });
  const [weekPickerVisible, setWeekPickerVisible] = useState(false);

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

      // Fetch and log project time stats
      const projectTimeStats = await AnalyticsService.getProjectTimeStats(
        selectedPeriod
      );
      console.log("Raw Project Time Stats:", projectTimeStats);
      console.log("Number of projects found:", projectTimeStats.length);
      projectTimeStats.forEach((stat) => {
        console.log(
          `Project: ${stat.name} (${stat.projectId}) - ${stat.totalMinutes} minutes`
        );
      });
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format the week display
  const getWeekDisplay = () => {
    const start = startOfWeek(selectedWeek);
    return `Week of ${format(start, "MMM d")}`;
  };

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-[#FAF9F6]">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#FAF9F6]">
      <View className="p-4 bg-[#FAF9F6]">
        <Text className="text-base font-medium text-[#000] tracking-wider mb-4">
          WEEK AT A GLANCE
        </Text>
        <Pressable
          className="flex-row items-center"
          onPress={() => setWeekPickerVisible(true)}
        >
          <Text
            className="text-4xl text-black"
            style={{ fontFamily: "LibreBaskerville_400Regular_Italic" }}
          >
            {getWeekDisplay()}
          </Text>
          <Text className="text-base ml-2 text-[#333]">▼</Text>
        </Pressable>
      </View>

      <View className="p-4">
        <ProjectPieChart />
      </View>

      <WeekPicker
        visible={weekPickerVisible}
        onClose={() => setWeekPickerVisible(false)}
        selectedDate={selectedWeek}
        onSelectWeek={(date: Date) => {
          setSelectedWeek(date);
          loadData();
        }}
      />
    </ScrollView>
  );
}
