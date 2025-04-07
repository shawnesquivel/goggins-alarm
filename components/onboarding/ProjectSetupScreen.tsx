import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import OnboardingScreen from "./OnboardingScreen";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";
import ProjectList from "./ProjectList";
import { Project } from "@/types/project";
import { useProjects } from "@/contexts/ProjectContext";

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
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const [hasProjects, setHasProjects] = useState(projects.length > 0);

  useEffect(() => {
    setHasProjects(projects.length > 0);
  }, [projects]);

  const handleAddProject = (name: string, goal: string, color: string) => {
    addProject({
      name,
      goal,
      color,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Project);
  };

  const handleUpdateProject = (
    id: string,
    name: string,
    goal: string,
    color: string
  ) => {
    updateProject({
      id,
      name,
      goal,
      color,
      updatedAt: new Date(),
    } as Project);
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
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
          <View style={styles.projectListContainer}>
            <ProjectList />
          </View>
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
});
