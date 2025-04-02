import React from "react";
import { Modal, View, TouchableOpacity } from "react-native";
import { Text } from "@/components/Themed";

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title = "Delete Project",
  message = "Are you sure you want to delete this project? This action cannot be undone.",
}: DeleteConfirmationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/80">
        <View className="bg-white w-11/12 max-w-md rounded-2xl overflow-hidden">
          {/* Header */}
          <View className="p-6">
            <Text className="text-2xl font-bold text-center mb-4">{title}</Text>
            <Text className="text-base text-gray-600 text-center">
              {message}
            </Text>
          </View>

          {/* Actions */}
          <View className="flex-row border-t border-gray-200">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 p-4 border-r border-gray-200"
            >
              <Text className="text-center text-gray-600 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 p-4 bg-red-500"
            >
              <Text className="text-center text-white font-medium">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
