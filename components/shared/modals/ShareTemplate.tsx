// components/shared/ShareTemplate.tsx
import React from "react";
import { View, Text } from "react-native";
import { Logo } from "../Logo";
import { format, isValid } from "date-fns";

interface ShareTemplateProps {
  userName: string;
  deepWorkTime: string;
  date: string;
  isDarkMode: boolean;
}

export const ShareTemplate: React.FC<ShareTemplateProps> = ({
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
    <View className={`${backgroundColor} w-[600px] h-[400px] rounded-3xl p-12`}>
      <View className="flex-1 justify-between">
        <View>
          <Text className={`${textColor} text-2xl font-medium uppercase mb-2`}>
            {userName}'s Deep Work Tracked
          </Text>
          <Text
            className={`${textColor} text-5xl mt-2`}
            style={{
              fontFamily: "LibreBaskerville_400Regular_Italic",
              lineHeight: 65,
            }}
          >
            {formattedDate}
          </Text>
        </View>

        <View className="items-center mb-10">
          <Text
            className={`${textColor} text-9xl`}
            style={{
              fontFamily: "LibreCaslonText_400Regular",
              lineHeight: 140,
            }}
          >
            {deepWorkTime}
          </Text>
        </View>

        <View className="absolute top-4 right-4">
          <Logo isDarkMode={isDarkMode} size={42} />
        </View>
      </View>
    </View>
  );
};
