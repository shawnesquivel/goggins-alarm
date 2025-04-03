import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Project } from "@/types/project";
import Svg, { Path } from "react-native-svg";

interface EditProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, goal: string, color: string) => void;
  onDelete: () => void;
  project: {
    name: string;
    goal: string;
    color: string;
  };
  mode?: "add" | "edit";
}

const colors = [
  "#EF8D8D", // Soft Red
  "#F5CD88", // Light Orange
  "#FAE395", // Soft Yellow
  "#BFE7AF", // Light Green
  "#84947E", // Sage Green
  "#73AEA4", // Teal
  "#C7E5E6", // Light Blue
  "#BBC1DD", // Soft Purple
  "#D9B4C7", // Light Pink
  "#FFBDD5", // Pink
];

const { height } = Dimensions.get("window");

const DeleteIcon = () => (
  <Svg width={18} height={20} viewBox="0 0 18 20" fill="none">
    <Path
      d="M7 16C7.26522 16 7.51957 15.8946 7.70711 15.7071C7.89464 15.5196 8 15.2652 8 15V9C8 8.73478 7.89464 8.48043 7.70711 8.29289C7.51957 8.10536 7.26522 8 7 8C6.73478 8 6.48043 8.10536 6.29289 8.29289C6.10536 8.48043 6 8.73478 6 9V15C6 15.2652 6.10536 15.5196 6.29289 15.7071C6.48043 15.8946 6.73478 16 7 16ZM17 4H13V3C13 2.20435 12.6839 1.44129 12.1213 0.87868C11.5587 0.316071 10.7956 0 10 0H8C7.20435 0 6.44129 0.316071 5.87868 0.87868C5.31607 1.44129 5 2.20435 5 3V4H1C0.734784 4 0.48043 4.10536 0.292893 4.29289C0.105357 4.48043 0 4.73478 0 5C0 5.26522 0.105357 5.51957 0.292893 5.70711C0.48043 5.89464 0.734784 6 1 6H2V17C2 17.7956 2.31607 18.5587 2.87868 19.1213C3.44129 19.6839 4.20435 20 5 20H13C13.7956 20 14.5587 19.6839 15.1213 19.1213C15.6839 18.5587 16 17.7956 16 17V6H17C17.2652 6 17.5196 5.89464 17.7071 5.70711C17.8946 5.51957 18 5.26522 18 5C18 4.73478 17.8946 4.48043 17.7071 4.29289C17.5196 4.10536 17.2652 4 17 4ZM7 3C7 2.73478 7.10536 2.48043 7.29289 2.29289C7.48043 2.10536 7.73478 2 8 2H10C10.2652 2 10.5196 2.10536 10.7071 2.29289C10.8946 2.48043 11 2.73478 11 3V4H7V3ZM14 17C14 17.2652 13.8946 17.5196 13.7071 17.7071C13.5196 17.8946 13.2652 18 13 18H5C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17V6H14V17ZM11 16C11.2652 16 11.5196 15.8946 11.7071 15.7071C11.8946 15.5196 12 15.2652 12 15V9C12 8.73478 11.8946 8.48043 11.7071 8.29289C11.5196 8.10536 11.2652 8 11 8C10.7348 8 10.4804 8.10536 10.2929 8.29289C10.1054 8.48043 10 8.73478 10 9V15C10 15.2652 10.1054 15.5196 10.2929 15.7071C10.4804 15.8946 10.7348 16 11 16Z"
      fill="#5D5D5D"
    />
  </Svg>
);

export default function EditProjectModal({
  visible,
  onClose,
  onSave,
  onDelete,
  project,
  mode = "edit",
}: EditProjectModalProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      // Reset animation values
      fadeAnim.setValue(0);
      slideAnim.setValue(height);

      // Fade in background and slide up modal
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          mass: 0.5,
          stiffness: 150,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    setName(project.name);
    setGoal(project.goal);
    setSelectedColor(project.color || colors[0]);
  }, [project]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), goal.trim(), selectedColor);
    handleClose();
  };

  const handleClose = () => {
    // Start closing animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Only call onClose after animation completes
      onClose();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Animated Background */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "black",
              opacity: fadeAnim,
            }}
          />

          {/* Animated Modal Content */}
          <Animated.View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              transform: [{ translateY: slideAnim }],
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
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 24,
                  position: "relative",
                }}
              >
                {mode === "edit" && (
                  <TouchableOpacity
                    onPress={onDelete}
                    style={{
                      position: "absolute",
                      left: -10,
                      top: -10,
                      width: 44,
                      height: 44,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <DeleteIcon />
                  </TouchableOpacity>
                )}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#000",
                  }}
                >
                  {mode === "add" ? "ADD PROJECT" : "EDIT PROJECT"}
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={{
                    width: 44,
                    height: 44,
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    right: -10,
                    top: -10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: "#000",
                    }}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form */}
              <ScrollView keyboardShouldPersistTaps="handled">
                <View>
                  {/* Project Name */}
                  <View style={{ marginBottom: 24 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
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
                        borderRadius: 2,
                        borderWidth: 1,
                        borderColor: "#DDDAD0",
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
                        fontWeight: "600",
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
                        borderRadius: 2,
                        borderWidth: 1,
                        borderColor: "#DDDAD0",
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
                  <View style={{ marginBottom: 24 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        marginBottom: 8,
                        color: "#000",
                      }}
                    >
                      Color
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        paddingVertical: 8,
                      }}
                    >
                      {colors.map((color) => (
                        <TouchableOpacity
                          key={color}
                          onPress={() => setSelectedColor(color)}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: color,
                            marginRight: 12,
                            borderWidth: selectedColor === color ? 2 : 0,
                            borderColor: "#000",
                          }}
                        />
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </ScrollView>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  backgroundColor: "#000",
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: "center",
                  marginTop: 24,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {mode === "add" ? "Add Project" : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
