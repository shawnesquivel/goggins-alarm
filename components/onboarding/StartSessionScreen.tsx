import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import OnboardingScreen from "./OnboardingScreen";
import {
  OnboardingScreen as OnboardingScreenType,
  useOnboarding,
} from "@/contexts/OnboardingContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";

interface StartSessionScreenProps {
  screen: OnboardingScreenType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
}

const { width, height } = Dimensions.get("window");

export default function StartSessionScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: StartSessionScreenProps) {
  const router = useRouter();
  const { projects, startFocusSession } = usePomodoro();
  const { completeOnboarding } = useOnboarding();
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [sessionDuration, setSessionDuration] = useState(25); // Default duration
  const [isListening, setIsListening] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Initialize with first project if available
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  const handleStartSession = async () => {
    if (taskDescription && selectedProjectId && !isNavigating) {
      setIsNavigating(true);
      try {
        // Start the focus session
        startFocusSession(taskDescription, selectedProjectId, []);

        // Mark onboarding as complete
        await completeOnboarding();

        // Close the modal
        setShowModal(false);

        // Explicitly navigate to tabs screen
        setTimeout(() => {
          console.log("[StartSessionScreen] Navigating to tabs screen");
          router.replace("/(tabs)");
        }, 300);
      } catch (error) {
        console.error("[StartSessionScreen] Navigation error:", error);
        setIsNavigating(false);
      }
    }
  };

  // Mock voice recognition with a preset task
  const startVoiceRecognition = () => {
    setShowModal(true);
    setIsListening(true);

    // Simulate voice processing after 2 seconds
    setTimeout(() => {
      setTaskDescription("Working on the landing page for Project X");
      setIsListening(false);
    }, 2000);
  };

  // Get project name by ID
  const getProjectName = (id: string): string => {
    const project = projects.find((p) => p.id === id);
    return project ? project.name : "Select Project";
  };

  const closeModal = () => {
    setShowModal(false);
    setIsListening(false);
  };

  return (
    <OnboardingScreen
      screen={screen}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.container}>
        <Text style={styles.titleText}>Begin with intention.</Text>

        <TouchableOpacity
          style={styles.micButton}
          onPress={startVoiceRecognition}
        >
          <View style={styles.micIconContainer}>
            <FontAwesome name="microphone" size={30} color="#fff" />
          </View>
          <Text style={styles.micButtonText}>SET INTENTION</Text>
        </TouchableOpacity>

        {/* Full-screen Modal */}
        <Modal visible={showModal} transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {isListening ? (
                <View style={styles.listeningHeader}>
                  <Text style={styles.listeningText}>LISTENING...</Text>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.intentionForm}>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>I am working on</Text>
                    <Text style={styles.formValue}>
                      {taskDescription || "task"}
                    </Text>
                  </View>

                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>for</Text>
                    <Text style={styles.formValue}>
                      {getProjectName(selectedProjectId) || "project"}
                    </Text>
                  </View>

                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>for</Text>
                    <Text style={styles.formValue}>
                      {sessionDuration} minutes
                    </Text>
                    <Text style={styles.formEndPeriod}>.</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleStartSession}
                  >
                    <Text style={styles.startButtonText}>START SESSION</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 50,
  },
  micButton: {
    alignItems: "center",
  },
  micIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  micButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  listeningHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listeningText: {
    fontSize: 18,
    fontWeight: "500",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  intentionForm: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  formRow: {
    marginBottom: 30,
  },
  formLabel: {
    fontSize: 18,
    color: "#333",
    marginBottom: 5,
  },
  formValue: {
    fontSize: 24,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 8,
    marginTop: 5,
  },
  formEndPeriod: {
    fontSize: 24,
    fontWeight: "bold",
  },
  startButton: {
    backgroundColor: "#000",
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 50,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
