import React, { useState, useEffect } from "react";
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
  const { projects, addProject } = usePomodoro();
  const [projectName, setProjectName] = useState("");
  const [projectGoal, setProjectGoal] = useState("");
  const [selectedColor, setSelectedColor] = useState("#4A90E2");
  const [showForm, setShowForm] = useState(true);
  const [hasProjects, setHasProjects] = useState(projects.length > 0);

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

  useEffect(() => {
    setHasProjects(projects.length > 0);
  }, [projects]);

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
    }
  };

  return (
    <OnboardingScreen
      screen={screen}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={onNext}
      onBack={onBack}
      disableNext={!hasProjects}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.containerAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showForm ? (
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
                placeholder="e.g. I want to achieve [X Goal] by Dec 31, 2026"
                value={projectGoal}
                onChangeText={setProjectGoal}
                multiline
                placeholderTextColor="#999"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={Keyboard.dismiss}
              />

              <Text style={styles.inputLabel}>Project Color</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.colorScrollView}
              >
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
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !projectName.trim() && styles.disabledButton,
                ]}
                onPress={handleCreateProject}
                disabled={!projectName.trim()}
              >
                <Text style={styles.saveButtonText}>SAVE PROJECT</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.projectListContainer}>
              <Text style={styles.listTitle}>Your Focus Areas</Text>
              {projects.map((project) => (
                <View key={project.id} style={styles.projectItem}>
                  <View
                    style={[
                      styles.projectColorDot,
                      { backgroundColor: project.color || "#ccc" },
                    ]}
                  />
                  <Text style={styles.projectNameText}>{project.name}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setSelectedColor("#4A90E2");
                  setShowForm(true);
                }}
              >
                <Text style={styles.addButtonText}>+ Add Another Project</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  containerAvoidingView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 30,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  projectListContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  projectItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  projectColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  projectNameText: {
    fontSize: 16,
    color: "#333",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 20,
    textAlign: "center",
  },
  addButton: {
    marginTop: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 25,
    marginHorizontal: 10,
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
    marginBottom: 15,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
    marginBottom: 25,
  },
  colorScrollView: {
    marginBottom: 25,
    maxHeight: 50,
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 6,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: "#000",
  },
  saveButton: {
    backgroundColor: "#000",
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#999",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
