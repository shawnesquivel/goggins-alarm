import { usePomodoro } from "@/contexts/AlarmContext";
import { Text, View, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import useAnalytics from "@/app/hooks/useAnalytics";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ProgressCircle from "./ProgressCircle";

const Overview = () => {
  const { currentSession } = usePomodoro();
  const { analytics, isAnalyticsLoading, handleRefresh } = useAnalytics();

  // If running a timer, hide Overview
  if (currentSession) return null;

  return (
    <View className="w-full bg-white rounded-lg mb-4">
      <View className="px-4 py-3">
        <Text className="text-sm text-gray-600 mb-1">WELCOME BACK SHAY,</Text>
        <Text className="text-2xl font-medium mb-4">
          {format(new Date(), "EEE, MMM d")}
        </Text>

        <View className="flex-row justify-between mb-4">
          <Text className="text-sm font-medium">OVERVIEW</Text>
          <Text className="text-sm text-gray-400">TASKS</Text>
        </View>

        <View className="items-center mb-6">
          {/* Use the extracted ProgressCircle component */}
          <ProgressCircle
            percentage={analytics.goalProgressPercentage}
            deepWorkMinutes={analytics.deepWorkMinutes}
            isLoading={isAnalyticsLoading}
          />
          <Text className="text-sm text-gray-600 mt-4">TOTAL DEEP WORK</Text>
          <Text className="text-2xl">
            {isAnalyticsLoading ? "..." : analytics.totalDeepWork}
          </Text>
        </View>
        <View className="flex-row justify-end mb-4">
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isAnalyticsLoading}
            className="p-2"
          >
            <FontAwesome
              name="refresh"
              size={16}
              color="#808080"
              style={{
                transform: [{ rotate: isAnalyticsLoading ? "45deg" : "0deg" }],
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Column Headers */}
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-600 flex-1">TODAY'S SUMMARY</Text>
          <View className="flex-row w-24 justify-end">
            <Text className="text-sm text-gray-600 w-12 text-center">QTY</Text>
            <Text className="text-sm text-gray-600 w-12 text-center">MIN</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-base flex-1">
            Deep <Text className="italic">Work</Text>
          </Text>
          <View className="flex-row w-24 justify-end">
            <Text className="text-base w-12 text-center">
              {isAnalyticsLoading ? "..." : analytics.deepWorkSessions}
            </Text>
            <Text className="text-base w-12 text-center">
              {isAnalyticsLoading ? "..." : analytics.deepWorkMinutes}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-base flex-1">
            Deep <Text className="italic">Rest</Text>
          </Text>
          <View className="flex-row w-24 justify-end">
            <Text className="text-base w-12 text-center">
              {isAnalyticsLoading ? "..." : analytics.deepRestSessions}
            </Text>
            <Text className="text-base w-12 text-center">
              {isAnalyticsLoading ? "..." : analytics.deepRestMinutes}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Overview;
