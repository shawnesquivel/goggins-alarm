import React, { useState, useEffect } from "react";
import { Text, View, Alert, Pressable, Linking } from "react-native";
import { getMotivationalMessage } from "@/utils/getMotivationalMessage";

export default function CurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showFullMessage, setShowFullMessage] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every minute instead of every second

    return () => clearInterval(timer);
  }, []);

  const message = getMotivationalMessage(currentTime);
  const isQuote = typeof message !== "string";

  const displayText = isQuote ? message.text : message;
  const truncatedText =
    displayText.length > 200 && !showFullMessage
      ? displayText.substring(0, 200) + "..."
      : displayText;

  return (
    <View className="items-center justify-center p-4">
      <Text className="text-[#ffffff] text-6xl">
        {currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <View className="items-center mt-2">
        <Pressable onPress={() => setShowFullMessage(!showFullMessage)}>
          <Text className="text-[#ffffff] italic text-sm">{truncatedText}</Text>
        </Pressable>
      </View>
    </View>
  );
}
