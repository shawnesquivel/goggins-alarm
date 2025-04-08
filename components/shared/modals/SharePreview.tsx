import React from "react";
import { View, Text } from "react-native";
import { Logo } from "../Logo";
import { format, isValid } from "date-fns";

interface SharePreviewProps {
  userName: string;
  deepWorkTime: string;
  date: string;
  isDarkMode: boolean;
}

export const SharePreview: React.FC<SharePreviewProps> = ({
  userName,
  deepWorkTime,
  date,
  isDarkMode,
}) => {
  const parsedDate = new Date(date);
  const formattedDate = isValid(parsedDate)
    ? format(parsedDate, "EEE, MMM d")
    : format(new Date(), "EEE, MMM d");

  const backgroundColor = isDarkMode ? "bg-[#1B1B1B]" : "bg-[#F3F1EC]";
  const textColor = isDarkMode ? "text-[#E4E2DD]" : "text-[#000000]";

  return (
    <View className={`${backgroundColor} w-full aspect-[3/2] rounded-3xl p-6`}>
      <View className="flex-1 justify-between">
        <View>
          <Text className={`${textColor} text-sm font-medium uppercase mb-1`}>
            {userName}'s Deep Work Tracked
          </Text>
          <Text
            className={`${textColor} text-xl font-serif italic`}
            style={{
              fontFamily: "LibreBaskerville_400Regular_Italic",
              lineHeight: 32,
            }}
          >
            {formattedDate}
          </Text>
        </View>

        <View className="items-center mb-6">
          <Text className={`${textColor} text-6xl font-serif`}>
            {deepWorkTime}
          </Text>
        </View>

        <View className="absolute top-2 right-2">
          <Logo isDarkMode={isDarkMode} />
        </View>
      </View>
    </View>
  );
};
