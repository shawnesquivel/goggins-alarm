import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
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

const { height } = Dimensions.get("window");

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
      setName(project.name || "");
      setGoal(project.goal || "");
      setSelectedColor(project.color || colors[0]);
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
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "transparent",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: height * 0.9, // 90% of screen height max
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
              ADD A PROJECT
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20, color: "#000" }}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View>
            {/* Project Name */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  marginBottom: 8,
                  color: "#000",
                }}
              >
                Project Name
              </Text>
              <TextInput
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#E5E5E5",
                  fontSize: 16,
                  color: "#000",
                }}
                placeholder="Project name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>

            {/* Project Goal */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  marginBottom: 8,
                  color: "#000",
                }}
              >
                Project Goal
              </Text>
              <TextInput
                style={{
                  width: "100%",
                  height: 96,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#E5E5E5",
                  fontSize: 16,
                  color: "#000",
                  textAlignVertical: "top",
                }}
                placeholder="Describe your big goal for this project"
                value={goal}
                onChangeText={setGoal}
                multiline
                placeholderTextColor="#999"
              />
            </View>

            {/* Color Selection */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  marginBottom: 8,
                  color: "#000",
                }}
              >
                Project Color
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? 2 : 0,
                      borderColor: "#000",
                    }}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            style={{
              width: "100%",
              backgroundColor: name.trim() ? "#000" : "#999",
              paddingVertical: 16,
              borderRadius: 8,
            }}
            disabled={!name.trim()}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              SAVE PROJECT
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
