import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { ProjectPieChart } from "../../components/charts/ProjectPieChart";
import { format, startOfWeek } from "date-fns";
import { WeekPicker } from "../../components/WeekPicker";
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_400Regular_Italic,
  useFonts,
} from "@expo-google-fonts/libre-baskerville";

/**
 * Reports Screen Component
 * Displays analytics data including project breakdowns and deep work/rest metrics
 */
export default function ReportsScreen() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_400Regular_Italic,
  });

  // State for week selection and picker visibility
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [weekPickerVisible, setWeekPickerVisible] = useState(false);

  // Format the week display for the header
  const getWeekDisplay = () => {
    const start = startOfWeek(selectedWeek);
    return `Week of ${format(start, "MMM d")}`;
  };

  // Show loading state while fonts are loading
  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-[#FAF9F6] items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4">Loading fonts...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#FAF9F6]">
      {/* Header Section */}
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

      {/* Project Chart Section */}
      <View className="p-4">
        <ProjectPieChart selectedWeek={selectedWeek} />
      </View>

      {/* Week Picker Modal */}
      <WeekPicker
        visible={weekPickerVisible}
        onClose={() => setWeekPickerVisible(false)}
        selectedDate={selectedWeek}
        onSelectWeek={(date: Date) => {
          setSelectedWeek(date);
          setWeekPickerVisible(false);
        }}
      />
    </ScrollView>
  );
}
