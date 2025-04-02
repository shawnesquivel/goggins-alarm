import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import OnboardingScreen from "./OnboardingScreen";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface StartSessionScreenProps {
  screen: OnboardingScreenType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
}

export default function StartSessionScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: StartSessionScreenProps) {
  const { projects, startFocusSession } = usePomodoro();
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [sessionDuration, setSessionDuration] = useState(60); // 1 hour default
  const [isListening, setIsListening] = useState(false);

  // Initialize with first project if available
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  const handleStartSession = () => {
    if (taskDescription && selectedProjectId) {
      startFocusSession(taskDescription, selectedProjectId, []);
      onNext();
    }
  };

  // Mock voice recognition with a preset task
  const startVoiceRecognition = () => {
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

  return (
    <OnboardingScreen
      screen={screen}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={onNext}
      onBack={onBack}
    >
      <View style={styles.container}>
        <Text style={styles.promptText}>Start by saying...</Text>

        <View style={styles.exampleContainer}>
          <Text style={styles.exampleText}>
            "I am working on the landing page for Project X for 1 hour."
          </Text>
          <Text style={styles.explanationText}>
            By saying it out loud, you've started a promise to yourself.
          </Text>
          <Text style={styles.motivationText}>Don't let yourself down.</Text>
        </View>

        {isListening ? (
          <View style={styles.listeningContainer}>
            <Text style={styles.listeningText}>LISTENING...</Text>
          </View>
        ) : taskDescription ? (
          <View style={styles.voiceResultContainer}>
            <View style={styles.voiceResultContent}>
              <Text style={styles.intentionPrompt}>I am working on</Text>
              <Text style={styles.intentionTask}>{taskDescription}</Text>
              <Text style={styles.intentionPrompt}>for</Text>
              <Text style={styles.intentionProject}>
                {getProjectName(selectedProjectId)}
              </Text>
              <Text style={styles.intentionPrompt}>for</Text>
              <Text style={styles.intentionTime}>
                {sessionDuration} minutes
              </Text>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartSession}
            >
              <Text style={styles.startButtonText}>START SESSION</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.micButton}
            onPress={startVoiceRecognition}
          >
            <View style={styles.micIconContainer}>
              <FontAwesome name="microphone" size={30} color="#fff" />
            </View>
            <Text style={styles.micButtonText}>SET INTENTION</Text>
          </TouchableOpacity>
        )}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  promptText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 16,
  },
  exampleContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  exampleText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  explanationText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "underline",
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
  listeningContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  listeningText: {
    fontSize: 18,
    color: "#666",
  },
  voiceResultContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  voiceResultContent: {
    marginBottom: 30,
  },
  intentionPrompt: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  intentionTask: {
    fontSize: 20,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 4,
    marginBottom: 16,
  },
  intentionProject: {
    fontSize: 20,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 4,
    marginBottom: 16,
  },
  intentionTime: {
    fontSize: 20,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 4,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: "#000",
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
