// components/charts/ProjectPieChart.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import {
  LibreCaslonText_400Regular,
  LibreCaslonText_700Bold,
  useFonts,
} from "@expo-google-fonts/libre-caslon-text";
import { AnalyticsService } from "@/services/AnalyticsService";

// Add this helper function to format total time
const formatTotalTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.floor((totalMinutes % 1) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

export const ProjectPieChart = () => {
  const [fontsLoaded] = useFonts({
    LibreCaslonText: LibreCaslonText_400Regular,
    "LibreCaslonText-Bold": LibreCaslonText_700Bold,
  });

  const [projectData, setProjectData] = useState<
    {
      name: string;
      population: number;
      color: string;
      legendFontColor: string;
    }[]
  >([]);

  const [restStats, setRestStats] = useState<{
    totalSessions: number;
    totalMinutes: number;
  }>({ totalSessions: 0, totalMinutes: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const [projectStats, restData] = await Promise.all([
        AnalyticsService.getProjectTimeStats(),
        AnalyticsService.getRestStats(),
      ]);

      // Transform stats into the format PieChart expects
      const formattedData = projectStats.map((project) => ({
        name: project.name,
        population: Math.round(project.totalMinutes), // Round to avoid floating point issues
        color: project.color || "#73AEA4", // Use project color or fallback
        legendFontColor: "#333",
      }));

      console.log("Formatted pie chart data:", formattedData);
      console.log("Rest stats:", restData);

      setProjectData(formattedData);
      setRestStats(restData);
    };

    fetchData();
  }, []);

  // Center the chart
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const renderLegend = () => {
    if (!projectData.length) return null;

    const midpoint = Math.ceil(projectData.length / 2);
    const leftColumn = projectData.slice(0, midpoint);
    const rightColumn = projectData.slice(midpoint);

    return (
      <View className="flex-row mt-4 px-4 mb-8">
        {/* Left Column */}
        <View className="flex-1 pr-2">
          {leftColumn.map((item, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <View
                className="w-6 h-6 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <View className="flex-1">
                <Text
                  className="text-sm text-[#333]"
                  style={{ fontFamily: "Figtree_400Regular" }}
                >
                  {item.name}
                </Text>
                <Text
                  className="text-xs text-[#666]"
                  style={{ fontFamily: "Figtree_400Regular" }}
                >
                  {Math.floor(item.population / 60)}h {item.population % 60}m
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Right Column */}
        <View className="flex-1 pl-2">
          {rightColumn.map((item, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <View
                className="w-6 h-6 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <View className="flex-1">
                <Text
                  className="text-sm text-[#333]"
                  style={{ fontFamily: "Figtree_400Regular" }}
                >
                  {item.name}
                </Text>
                <Text
                  className="text-xs text-[#666]"
                  style={{ fontFamily: "Figtree_400Regular" }}
                >
                  {Math.floor(item.population / 60)}h {item.population % 60}m
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Calculate total time from data
  const totalMinutes = projectData.reduce(
    (acc, item) => acc + item.population,
    0
  );

  if (!fontsLoaded) {
    return (
      <View className="items-center justify-center bg-[#FAF9F6] rounded-lg p-4">
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  if (projectData.length === 0) {
    return (
      <View className="items-center justify-center bg-[#FAF9F6] rounded-lg p-4">
        <Text>No project data available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 flex flex-col justify-between bg-[#FAF9F6]">
      {/* Chart Section */}
      <View>
        <Text
          className="text-base font-medium text-[#333] mb-2"
          style={{ fontFamily: "Figtree_500Medium" }}
        >
          PROJECT BREAKDOWN
        </Text>

        {/* Center the chart */}
        <View className="items-center justify-center">
          <PieChart
            data={projectData}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="0"
            absolute={false}
            hasLegend={false}
            center={[Dimensions.get("window").width / 4, 0]}
          />
        </View>

        {/* Total Deep Work Time Display */}
        <View className="items-center mt-4 mb-8">
          <Text
            className="text-sm uppercase tracking-wider text-[#333]"
            style={{ fontFamily: "Figtree_500Medium" }}
          >
            TOTAL DEEP WORK
          </Text>
          <Text
            className="text-2xl mt-2"
            style={{ fontFamily: "LibreCaslonText" }}
          >
            {formatTotalTime(totalMinutes)}
          </Text>
        </View>

        {renderLegend()}
      </View>

      {/* Stats Section */}
      <View className="w-full border-t border-[#E5E5E5] bg-[#FAF9F6] pt-8 pb-4">
        <View className="flex-row justify-around">
          <View className="items-center flex-1">
            <Text
              className="text-4xl text-black mb-1"
              style={{ fontFamily: "LibreCaslonText" }}
            >
              {projectData.length}
            </Text>
            <Text
              className="text-sm text-[#333] text-center mb-4 uppercase"
              style={{ fontFamily: "Figtree_500Medium" }}
            >
              DEEP WORK{"\n"}SESSIONS
            </Text>
            <Text
              className="text-3xl text-black mb-1"
              style={{ fontFamily: "LibreCaslonText" }}
            >
              {formatTotalTime(totalMinutes)}
            </Text>
            <Text
              className="text-sm text-[#333] text-center uppercase"
              style={{ fontFamily: "Figtree_500Medium" }}
            >
              DEEP WORK{"\n"}TIME ELAPSED
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text
              className="text-4xl text-black mb-1"
              style={{ fontFamily: "LibreCaslonText" }}
            >
              {restStats.totalSessions}
            </Text>
            <Text
              className="text-sm text-[#333] text-center mb-4 uppercase"
              style={{ fontFamily: "Figtree_500Medium" }}
            >
              DEEP REST{"\n"}SESSIONS
            </Text>
            <Text
              className="text-3xl text-black mb-1"
              style={{ fontFamily: "LibreCaslonText" }}
            >
              {formatTotalTime(restStats.totalMinutes)}
            </Text>
            <Text
              className="text-sm text-[#333] text-center uppercase"
              style={{ fontFamily: "Figtree_500Medium" }}
            >
              DEEP REST{"\n"}TIME ELAPSED
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
