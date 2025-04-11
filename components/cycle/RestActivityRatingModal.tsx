import { View, Text, TouchableOpacity, Modal } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";

interface RestActivityRatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectActivity: (activity: string) => void;
  selectedActivity: string | null;
  sessionLabel?: string;
  isCancelFlow?: boolean;
  currentSession?: {
    projectId: string;
  };
  getProjectName?: (id: string) => string;
}

// Create a new component for rest activity rating
export const RestActivityRatingModal: React.FC<
  RestActivityRatingModalProps
> = ({
  visible,
  onClose,
  onSelectActivity,
  selectedActivity,
  sessionLabel = "REST SESSION", // Default label
  isCancelFlow = false,
  currentSession,
  getProjectName,
}) => {
  const restActivities = [
    { id: "MOVEMENT", icon: "arrow-right" as const },
    { id: "REFUEL", icon: "coffee" as const },
    { id: "SOCIALIZING", icon: "users" as const },
    { id: "MINDFULNESS", icon: "heart" as const },
    { id: "SOCIAL MEDIA", icon: "mobile" as const },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
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

          {currentSession && getProjectName && (
            <>
              <Text className="text-sm text-gray-600 text-center mb-1">
                YOUR {sessionLabel} ON:
              </Text>
              <Text className="text-base text-center mb-6">
                {getProjectName(currentSession.projectId)}
              </Text>
            </>
          )}

          {restActivities.map(({ id, icon }) => (
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
