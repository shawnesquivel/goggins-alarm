import { View, Text, TouchableOpacity, Modal } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { restActivitiesIcons } from "@/constants/CancelFlowStep";

interface RestActivityRatingModalProps {
  onClose: () => void;
  onSelectActivity: (activity: string) => void;
  selectedActivity: string | null;
  mode: "normal" | "cancel";
}

export const RestActivityRatingModal: React.FC<
  RestActivityRatingModalProps
> = ({ onClose, onSelectActivity, selectedActivity, mode }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl p-6 w-[90%] max-w-[400px]">
          <Text className="text-2xl font-medium text-center mb-1">
            What did you do
          </Text>
          <Text className="text-2xl font-medium italic text-center mb-4">
            for Deep Rest
          </Text>

          <Text className="text-sm text-gray-600 text-center mb-2">
            {mode === "normal"
              ? "Choose activity to start next Deep Work"
              : "Choose activity to end session"}
          </Text>

          {restActivitiesIcons.map(({ id, icon }) => (
            <TouchableOpacity
              key={id}
              className={`py-3 px-4 mb-3 rounded-md ${
                selectedActivity === id
                  ? "bg-gray-200 border border-gray-300"
                  : "bg-gray-100"
              } flex-row justify-between items-center`}
              onPress={() => onSelectActivity(id)}
            >
              <View className="flex-row items-center">
                <FontAwesome
                  name={icon}
                  size={16}
                  color="#555"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-base text-gray-800">{id}</Text>
              </View>
              {selectedActivity === id && (
                <FontAwesome name="check" size={16} color="#666" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};
