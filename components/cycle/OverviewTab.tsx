import { Text, View, TouchableOpacity } from "react-native";
import useAnalytics from "@/app/hooks/useAnalytics";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ProgressCircle from "./ProgressCircle";
import { useEffect } from "react";

/**
 * Overview Tab on HomeScreen component
 */
const OverviewTab = () => {
  const { analytics, isAnalyticsLoading, handleRefresh } = useAnalytics();

  return (
    <View>
      <View className="items-center mb-6">
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
          onPress={() => {
            handleRefresh();
          }}
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
            {isAnalyticsLoading
              ? "..."
              : Number(analytics.deepWorkMinutes).toFixed(1)}
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
            {isAnalyticsLoading
              ? "..."
              : Number(analytics.deepRestMinutes).toFixed(1)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OverviewTab;
