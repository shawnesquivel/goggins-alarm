import { usePomodoro } from "@/contexts/AlarmContext";
import { Text, View, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { useState } from "react";
import OverviewTab from "./OverviewTab";
import TasksTab from "./TasksTab";

const HomeScreen = () => {
  const { currentSession } = usePomodoro();
  const [activeTab, setActiveTab] = useState<"overview" | "tasks">("overview");

  // If running a timer, hide HomeScreen
  if (currentSession) return null;

  return (
    <View className="w-full bg-white rounded-lg mb-4">
      <View className="px-4 py-3">
        <Text className="text-sm text-gray-600 mb-1">WELCOME BACK SHAY,</Text>
        <Text className="text-2xl font-medium mb-4">
          {format(new Date(), "EEE, MMM d")}
        </Text>

        {/* Tab Navigation */}
        <View className="flex-row justify-between mb-4 border-b border-gray-200">
          <TouchableOpacity
            className={`flex-1 py-2 items-center ${
              activeTab === "overview" ? "border-b-2 border-black" : ""
            }`}
            onPress={() => setActiveTab("overview")}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === "overview" ? "text-black" : "text-gray-400"
              }`}
            >
              OVERVIEW
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-2 items-center ${
              activeTab === "tasks" ? "border-b-2 border-black" : ""
            }`}
            onPress={() => setActiveTab("tasks")}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === "tasks" ? "text-black" : "text-gray-400"
              }`}
            >
              TASKS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "overview" ? <OverviewTab /> : <TasksTab />}
      </View>
    </View>
  );
};

export default HomeScreen;
