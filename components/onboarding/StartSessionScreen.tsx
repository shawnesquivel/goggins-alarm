import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import OnboardingScreen from "./OnboardingScreen";
import {
  OnboardingScreen as OnboardingScreenType,
  useOnboarding,
} from "@/contexts/OnboardingContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { ProjectService } from "@/services/ProjectService";
import { Project } from "@/types/project";

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
  const router = useRouter();
  const { startFocusSession } = usePomodoro();
  const { completeOnboarding } = useOnboarding();
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [sessionDuration, setSessionDuration] = useState(25); // Default duration
  const [isListening, setIsListening] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load projects from ProjectService
  useEffect(() => {
    const loadProjects = async () => {
      const localProjects = await ProjectService.getLocalProjects();
      setProjects(localProjects);
    };
    loadProjects();
  }, []);

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
        // Mark onboarding as complete first
        await completeOnboarding();
        console.log("[StartSessionScreen] Onboarding marked as complete");

        // Close the modal
        setShowModal(false);

        // Explicitly navigate to tabs screen with a longer delay
        // to ensure state updates have time to complete
        setTimeout(() => {
          console.log("[StartSessionScreen] Navigating to tabs screen");
          try {
            router.replace("/(tabs)");
          } catch (navError) {
            console.error("[StartSessionScreen] Navigation failed:", navError);
            // Fallback navigation attempt
            setTimeout(() => {
              console.log(
                "[StartSessionScreen] Attempting fallback navigation"
              );
              router.push("/(tabs)");
            }, 500);
          }
        }, 1000);
      } catch (error) {
        console.error("[StartSessionScreen] Session start error:", error);
        setIsNavigating(false);

        // Try to navigate anyway as a fallback
        setTimeout(() => {
          console.log("[StartSessionScreen] Fallback navigation after error");
          router.replace("/");
        }, 1000);
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
    const project = projects.find((p: Project) => p.id === id);
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
      <View className="flex-1 items-center justify-center my-5">
        <Text className="text-3xl font-bold text-center mb-12">
          Begin with intention.
        </Text>

        <TouchableOpacity
          className="items-center"
          onPress={startVoiceRecognition}
        >
          <View className="w-20 h-20 rounded-full bg-black justify-center items-center mb-3">
            <FontAwesome name="microphone" size={30} color="#fff" />
          </View>
          <Text className="text-base font-bold">SET INTENTION</Text>
        </TouchableOpacity>

        {/* Full-screen Modal */}
        <Modal visible={showModal} transparent={true} animationType="fade">
          <View className="flex-1 bg-white/95">
            <View className="flex-1 p-5">
              {isListening ? (
                <View className="flex-row justify-between items-center py-4 border-b border-gray-200">
                  <Text className="text-lg font-medium">LISTENING...</Text>
                  <TouchableOpacity
                    onPress={closeModal}
                    className="w-8 h-8 rounded-full bg-gray-200 justify-center items-center"
                  >
                    <Text className="text-base font-bold">X</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-1 pt-16 px-5">
                  <View className="mb-8">
                    <Text className="text-lg text-gray-700 mb-1">
                      I am working on
                    </Text>
                    <Text className="text-2xl font-bold border-b border-gray-300 pb-2 mt-1">
                      {taskDescription || "task"}
                    </Text>
                  </View>

                  <View className="mb-8">
                    <Text className="text-lg text-gray-700 mb-1">for</Text>
                    <Text className="text-2xl font-bold border-b border-gray-300 pb-2 mt-1">
                      {getProjectName(selectedProjectId) || "project"}
                    </Text>
                  </View>

                  <View className="mb-8">
                    <Text className="text-lg text-gray-700 mb-1">for</Text>
                    <Text className="text-2xl font-bold border-b border-gray-300 pb-2 mt-1">
                      {sessionDuration} minutes.
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="bg-black rounded px-4 py-3.5 items-center mt-12"
                    onPress={handleStartSession}
                  >
                    <Text className="text-white text-base font-bold">
                      FINISH SETUP
                    </Text>
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
