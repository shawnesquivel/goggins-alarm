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
import { usePomodoro } from "@/contexts/AlarmContext";
import OnboardingScreen from "./OnboardingScreen";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";
import ProjectModal from "@/components/shared/modals/ProjectModal";
import { Project } from "@/types/project";

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
  const [showProjectModal, setShowProjectModal] = useState(true);
  const [hasProjects, setHasProjects] = useState(projects.length > 0);

  useEffect(() => {
    setHasProjects(projects.length > 0);
  }, [projects]);

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (projectData.name?.trim()) {
      addProject({
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Project);
      setShowProjectModal(false);
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
              onPress={() => setShowProjectModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Another Project</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Project Modal */}
      <ProjectModal
        visible={showProjectModal}
        onClose={() => {
          if (projects.length > 0) {
            setShowProjectModal(false);
          }
        }}
        onSave={handleSaveProject}
        mode="add"
      />
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
});
