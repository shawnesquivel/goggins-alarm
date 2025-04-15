import {
  View,
  Text,
  ActivityIndicator,
  SectionList,
  RefreshControl,
} from "react-native";
import { renderIcon } from "@/lib/iconUtils";
import { getCompletionIcon, formatTime } from "@/lib/sessions";
import useSessions from "@/app/hooks/useSessions";

const TasksTab = () => {
  const { sessionSections, isLoading, error, refresh, isRefreshing } =
    useSessions(20);

  if (isLoading && !isRefreshing) {
    return (
      <View className="items-center justify-center py-8">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center py-8">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row justify-between mb-4">
        <Text className="text-sm text-gray-600">INTENTIONS COMPLETED</Text>
        <Text className="text-sm text-gray-600">MIN</Text>
      </View>

      {sessionSections.length === 0 ? (
        <View className="items-center justify-center py-8">
          <Text className="text-center py-6 text-gray-500 italic">
            You haven't logged any Deep Work sessions yet.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sessionSections}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title } }) => (
            <View className="py-2 mt-2 mb-1">
              <Text className="text-sm font-medium text-gray-700">{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View className="flex-row justify-between py-3 border-b border-gray-100">
              <View className="flex-row flex-1 mr-4 items-center">
                <View className="mr-2">
                  {renderIcon(
                    getCompletionIcon(item.status, item.project?.color)
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base" numberOfLines={2}>
                    {item.task}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {item.project?.name || "No Project"} •{" "}
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
              <Text className="text-base text-right min-w-[30px]">
                {Math.round(item.total_deep_work_minutes)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default TasksTab;
