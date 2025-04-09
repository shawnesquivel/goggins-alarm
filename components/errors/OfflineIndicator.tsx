import { MaterialIcons } from "@expo/vector-icons";
import { View, Text } from "react-native";

export const OfflineIndicator = () => (
  <View className="bg-gray-100/90 py-1 flex flex-row items-center justify-center">
    <MaterialIcons
      name="cloud-off"
      size={12}
      color="#4B5563"
      className="mr-1"
    />
    <Text className="text-gray-600 text-xs">
      Offline - Changes will sync when online
    </Text>
  </View>
);
