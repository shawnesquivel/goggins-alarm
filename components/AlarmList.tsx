import React from "react";
import { View, FlatList, Switch, Pressable } from "react-native";
import { Text } from "./Themed";
import { Alarm } from "@/types/alarm";
import { useAlarms } from "@/contexts/AlarmContext";

export default function AlarmList() {
  const { alarms, toggleAlarm } = useAlarms();

  const renderAlarm = ({ item }: { item: Alarm }) => {
    const formattedTime = item.time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const getRepeatText = (repeat: Alarm["repeat"]) => {
      const days = Object.entries(repeat)
        .filter(([_, enabled]) => enabled)
        .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));

      if (days.length === 0) return "Never";
      if (days.length === 7) return "Every Day";
      if (days.length === 5 && !repeat.saturday && !repeat.sunday)
        return "Weekdays";
      return days.join(", ");
    };

    return (
      <View className="flex-row items-center justify-between p-4 border-b border-[#333333]">
        <Pressable
          className="flex-1"
          onPress={() => console.log("Edit alarm", item.id)}
        >
          <Text className="text-[#ffffff] text-4xl">{formattedTime}</Text>
          {item.label && (
            <Text className="text-[#ffffff] opacity-60 mt-1">{item.label}</Text>
          )}
          <Text className="text-[#ffffff] opacity-60">
            {getRepeatText(item.repeat)}
          </Text>
        </Pressable>
        <Switch
          value={item.enabled}
          onValueChange={() => toggleAlarm(item.id)}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={alarms}
      renderItem={renderAlarm}
      keyExtractor={(item) => item.id}
    />
  );
}
