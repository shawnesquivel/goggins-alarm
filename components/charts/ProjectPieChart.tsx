// components/charts/ProjectPieChart.tsx
import React from "react";
import { View, Text, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import {
  LibreCaslonText_400Regular,
  LibreCaslonText_700Bold,
  useFonts,
} from "@expo-google-fonts/libre-caslon-text";

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

  const data = [
    {
      name: "Deep Work Timer",
      population: 480, // 8 hours
      color: "#FF6B6B", // Soft coral red
      legendFontColor: "#333",
    },
    {
      name: "Blog Writing",
      population: 180, // 3 hours
      color: "#4ECDC4", // Mint
      legendFontColor: "#333",
    },
    {
      name: "Open Source",
      population: 120, // 2 hours
      color: "#45B7D1", // Ocean blue
      legendFontColor: "#333",
    },
    {
      name: "Learning",
      population: 60, // 1 hour
      color: "#96CEB4", // Sage green
      legendFontColor: "#333",
    },
    {
      name: "Quick Task",
      population: 15, // 15 mins
      color: "#EEE8A9", // Soft yellow
      legendFontColor: "#333",
    },
    {
      name: "Client Meeting",
      population: 90, // 1.5 hours
      color: "#9D94B3", // Muted purple
      legendFontColor: "#333",
    },
    {
      name: "Code Review",
      population: 45, // 45 mins
      color: "#F7D794", // Peach
      legendFontColor: "#333",
    },
    {
      name: "Documentation",
      population: 150, // 2.5 hours
      color: "#786FA6", // Dusty purple
      legendFontColor: "#333",
    },
    {
      name: "Research",
      population: 240, // 4 hours
      color: "#88B04B", // Greenery
      legendFontColor: "#333",
    },
    {
      name: "Planning",
      population: 30, // 30 mins
      color: "#FFAAA5", // Soft pink
      legendFontColor: "#333",
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const renderLegend = () => {
    const midpoint = Math.ceil(data.length / 2);
    const leftColumn = data.slice(0, midpoint);
    const rightColumn = data.slice(midpoint);

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
  const totalMinutes = data.reduce((acc, item) => acc + item.population, 0);

  if (!fontsLoaded) {
    return (
      <View className="items-center justify-center bg-[#FAF9F6] rounded-lg p-4">
        <Text>Loading fonts...</Text>
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
            data={data}
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
              3
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
              56:00
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
              1
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
              10:00
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
