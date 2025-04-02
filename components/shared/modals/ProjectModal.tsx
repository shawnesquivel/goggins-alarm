import React, { useState, useEffect } from "react";
import { Modal, View, TextInput, TouchableOpacity } from "react-native";
import { Text } from "@/components/Themed";
import type { Project } from "../../../types/project";

interface ProjectModalProps {
  visible: boolean;
  onClose: () => void;
  project?: Project;
  onSave: (project: Partial<Project>) => void;
  mode: "add" | "edit";
}

const colors = [
  "#FF9C01", // Orange (Secondary)
  "#4A90E2", // Blue
  "#50E3C2", // Teal
  "#FF5A5F", // Red
  "#7B61FF", // Purple
  "#00C853", // Green
];

export default function ProjectModal({
  visible,
  onClose,
  project,
  onSave,
  mode,
}: ProjectModalProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setGoal(project.goal);
      setSelectedColor(project.color);
    } else {
      // Reset form for new projects
      setName("");
      setGoal("");
      setSelectedColor(colors[0]);
    }
  }, [project]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      goal: goal.trim(),
      color: selectedColor,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/80">
        <View className="bg-white w-11/12 max-w-md rounded-2xl overflow-hidden">
          {/* Header */}
          <View className="p-6 border-b border-gray-200">
            <Text className="text-2xl font-bold text-center">
              {mode === "add" ? "Add Project" : "Edit Project"}
            </Text>
          </View>

          {/* Form */}
          <View className="p-6">
            {/* Project Name */}
            <View className="mb-6">
              <Text className="text-sm font-medium mb-2 text-gray-700">
                Project Name
              </Text>
              <TextInput
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base"
                placeholder="Enter project name"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Project Goal */}
            <View className="mb-6">
              <Text className="text-sm font-medium mb-2 text-gray-700">
                Project Goal
              </Text>
              <TextInput
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base"
                placeholder="Enter project goal"
                value={goal}
                onChangeText={setGoal}
                multiline
              />
            </View>

            {/* Color Selection */}
            <View className="mb-6">
              <Text className="text-sm font-medium mb-2 text-gray-700">
                Color
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
                      selectedColor === color
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>
            </View>
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
              onPress={handleSave}
              className="flex-1 p-4 bg-black"
              disabled={!name.trim()}
            >
              <Text className="text-center text-white font-medium">
                {mode === "add" ? "Add Project" : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
