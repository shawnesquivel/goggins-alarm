import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import OnboardingScreen from "./OnboardingScreen";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";

interface ProjectSetupScreenProps {
  screen: OnboardingScreenType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
}

export default function ProjectSetupScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: ProjectSetupScreenProps) {
  const { addProject } = usePomodoro();
  const [projectName, setProjectName] = useState("");
  const [projectGoal, setProjectGoal] = useState("");
  const [selectedColor, setSelectedColor] = useState("#4A90E2");
  const [showForm, setShowForm] = useState(false);

  const colorOptions = [
    "#4A90E2", // Blue
    "#7ED321", // Green
    "#F5A623", // Orange
    "#D0021B", // Red
    "#9013FE", // Purple
    "#50E3C2", // Teal
    "#BD10E0", // Pink
    "#000000", // Black
  ];

  const handleCreateProject = () => {
    if (projectName.trim()) {
      Keyboard.dismiss();
      addProject({
        name: projectName.trim(),
        goal: projectGoal.trim() || undefined,
        color: selectedColor,
      });

      setProjectName("");
      setProjectGoal("");
      setShowForm(false);
      onNext();
    }
  };

  return (
    <OnboardingScreen
      screen={screen}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={onNext}
      onBack={onBack}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {!showForm ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyText}>
                No categories yet. Add your first category
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowForm(true)}
              >
                <Text style={styles.addButtonText}>+ Add Project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>ADD A PROJECT</Text>

              <Text style={styles.inputLabel}>Project Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Project name"
                value={projectName}
                onChangeText={setProjectName}
                placeholderTextColor="#999"
                returnKeyType="next"
              />

              <Text style={styles.inputLabel}>Project Goal</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Describe your big goal for this project"
                value={projectGoal}
                onChangeText={setProjectGoal}
                multiline
                placeholderTextColor="#999"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
              />

              {/* Keyboard dismiss button */}
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={Keyboard.dismiss}
              >
                <Text style={styles.dismissButtonText}>Done</Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Project Color</Text>
              <View style={styles.colorContainer}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleCreateProject}
              >
                <Text style={styles.saveButtonText}>SAVE PROJECT</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 20,
    textAlign: "center",
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addButtonText: {
    fontSize: 18,
    color: "#4A90E2",
    fontWeight: "500",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    justifyContent: "center",
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 8,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#000",
  },
  saveButton: {
    backgroundColor: "#000",
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dismissButton: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 16,
  },
  dismissButtonText: {
    fontSize: 14,
    color: "#555",
  },
});
