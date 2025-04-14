import { Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface OvertimeInfoProps {
  duration: number; // in minutes
  remainingSeconds: number;
}

const formatElapsedTime = (
  duration: number,
  remainingSeconds: number
): string => {
  // Convert duration to total seconds
  const totalSeconds = Math.floor(duration * 60) + remainingSeconds;

  // Calculate hours, minutes, seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format based on duration
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const OvertimeInfo = ({ duration, remainingSeconds }: OvertimeInfoProps) => {
  return (
    <View className="mb-8">
      <Text className="text-sm font-medium text-black mb-1 flex-row items-center">
        <FontAwesome name="check" size={12} color="#000" /> YOU HIT YOUR GOAL OF{" "}
        {duration?.toString()} MIN
      </Text>
      <Text className="text-sm text-gray-600">
        TOTAL TIME ELAPSED: {formatElapsedTime(duration, remainingSeconds)}
      </Text>
    </View>
  );
};

export default OvertimeInfo;
