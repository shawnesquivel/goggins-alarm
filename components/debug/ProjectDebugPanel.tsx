import { View, TouchableOpacity, Text } from "react-native";
import { ProjectService } from "@/services/ProjectService";

interface ProjectDebugPanelProps {
  pendingOps: any[];
  errorCount: number;
  clearPendingOperations: () => void;
}

const ProjectDebugPanel = ({
  pendingOps,
  errorCount,
  clearPendingOperations,
}: ProjectDebugPanelProps) => {
  return (
    <View className="mt-96 p-3 bg-gray-100 rounded-md border border-gray-300">
      <Text className="text-sm font-bold mb-2">Project Debug Panel</Text>
      <Text className="text-xs mb-1">
        Pending Ops: {pendingOps.length} ({errorCount} potential duplicates)
      </Text>
      {pendingOps.slice(0, 3).map((op, i) => (
        <Text key={i} className="text-xs text-gray-600 mb-1">
          {op.type}: {op.data?.name || op.data?.id || "unknown"}
        </Text>
      ))}
      {pendingOps.length > 3 && (
        <Text className="text-xs text-gray-600 mb-2">
          ...and {pendingOps.length - 3} more
        </Text>
      )}
      <TouchableOpacity
        className="bg-red-500 py-2 rounded-md items-center mt-2"
        onPress={clearPendingOperations}
      >
        <Text className="text-white font-medium text-sm">
          Clear All Pending Operations
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-black py-2 px-4 rounded-md mt-2 w-full"
        onPress={async () => {
          await ProjectService.syncProjects();
          // Force a refresh of the projects list
          const projects = await ProjectService.getLocalProjects();
          console.log("Forced sync complete, projects:", projects);
        }}
      >
        <Text className="text-white text-center">
          DEV: Force Sync to Remote DB
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProjectDebugPanel;
