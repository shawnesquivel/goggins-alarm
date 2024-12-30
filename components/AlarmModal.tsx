import React, { useState, useEffect } from "react";
import { Modal, View, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Text } from "./Themed";
import { FontAwesome } from "@expo/vector-icons";

interface AlarmModalProps {
  visible: boolean;
  onClose: () => void;
  alarm: { time: Date; enabled: boolean } | null;
  onSave: (time: Date) => void;
}

export default function AlarmModal({
  visible,
  onClose,
  alarm,
  onSave,
}: AlarmModalProps) {
  const [selectedTime, setSelectedTime] = useState(new Date());

  useEffect(() => {
    if (alarm?.time) {
      setSelectedTime(alarm.time);
    }
  }, [alarm]);

  const handleSave = () => {
    onSave(selectedTime);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/80">
        <View className="bg-gray-800 w-11/12 rounded-3xl overflow-hidden">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
            <Pressable
              onPress={onClose}
              className="bg-gray-700 p-2 rounded-full"
            >
              <FontAwesome name="close" size={24} color="#fff" />
            </Pressable>
            <Text className="text-xl font-bold">Set Alarm</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Time Picker */}
          <View className="p-6">
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={false}
              onChange={(event, date) => date && setSelectedTime(date)}
              display="spinner"
              themeVariant="dark"
            />
          </View>

          {/* Save Button */}
          <Pressable onPress={handleSave} className="bg-gray-700 p-4 w-full">
            <Text className="text-center text-white font-bold text-lg">
              Save
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
