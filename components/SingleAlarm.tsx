import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Button } from "react-native";
import { Alarm } from "@/types/alarm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAlarms } from "@/contexts/AlarmContext";
import { FontAwesome } from "@expo/vector-icons";

interface SingleAlarmProps {
  alarm: Alarm;
  onPress: () => void;
  onToggle: () => void;
  onTriggerAlarm?: () => void;
}

const TestComponents = ({
  onTriggerAlarm,
  resetPhotoStatus,
  storageContents,
}: {
  onTriggerAlarm: () => void;
  resetPhotoStatus: () => void;
  storageContents: string;
}) => {
  return (
    <View className="mt-4 px-4 gap-2">
      <Text className="text-white text-lg">Test Components</Text>
      <Button title="Test Full Alarm" onPress={onTriggerAlarm} />
      <View>
        <Button
          title="Reset Photo Status"
          onPress={resetPhotoStatus}
          color="#ff4444"
        />
      </View>
      <View className="mt-4 p-4 bg-gray-800 rounded-xl">
        <Text className="text-gray-400">AsyncStorage Contents:</Text>
        <Text className="text-white mt-2">{storageContents}</Text>
      </View>
    </View>
  );
};

export default function SingleAlarm({
  alarm,
  onPress,
  onToggle,
  onTriggerAlarm,
}: SingleAlarmProps) {
  const { setLastShoePhotoDate } = useAlarms();
  const [storageContents, setStorageContents] = useState<string>("");

  const checkStorage = async () => {
    try {
      const lastPhotoDate = await AsyncStorage.getItem("lastShoePhotoDate");
      setStorageContents(
        `Last Photo Date: ${
          lastPhotoDate ? new Date(lastPhotoDate).toLocaleString() : "None"
        }`
      );
    } catch (error) {
      setStorageContents("Error reading storage");
    }
  };

  const resetPhotoStatus = async () => {
    try {
      await AsyncStorage.removeItem("lastShoePhotoDate");
      setLastShoePhotoDate(null);
      await checkStorage();
    } catch (error) {
      console.error("Error resetting photo status:", error);
    }
  };

  useEffect(() => {
    checkStorage();
    const interval = setInterval(checkStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="w-full">
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between p-4 bg-[#1C1C1E] rounded-xl"
      >
        <Text className="text-[#ffffff] text-2xl">
          {alarm.time.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </Text>
        <FontAwesome name="pencil" size={20} color="#666" />
      </Pressable>
      {/* 
      <TestComponents
        onTriggerAlarm={onTriggerAlarm}
        resetPhotoStatus={resetPhotoStatus}
        storageContents={storageContents}
      /> */}
    </View>
  );
}
