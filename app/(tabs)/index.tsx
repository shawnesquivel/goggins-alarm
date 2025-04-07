import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { TimerStatus } from "@/types/alarm";
import StartSessionModal from "@/components/shared/modals/StartSessionModal";
import {
  useFonts,
  LibreCaslonText_400Regular,
} from "@expo-google-fonts/libre-caslon-text";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useProjects } from "@/contexts/ProjectContext";

export default function TimerScreen() {
  const router = useRouter();
  const {
    timerStatus,
    remainingSeconds,
    currentSession,
    pauseSession,
    resumeSession,
    completeSession,
    startBreakSession,
    settings,
    isOvertime,
  } = usePomodoro();
  const { session } = useAuth();
  const { projects } = useProjects();

  const [fontsLoaded] = useFonts({
    LibreCaslonText_400Regular,
  });

  // Local state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showBreakRatingModal, setShowBreakRatingModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Format remaining time as mm:ss
  const formatTimeDisplay = (seconds: number): string => {
    console.log(
      `Formatting time - seconds: ${seconds}, isOvertime: ${isOvertime}`
    );
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
    console.log(`Formatted time: ${isOvertime ? "+" : ""}${timeString}`);
    return `${isOvertime ? "+" : ""}${timeString}`;
  };

  // Handle session completion and rating
  const handleCompleteSession = (rating?: "happy" | "sad") => {
    completeSession(rating, sessionNotes);
    setShowRatingModal(false);
    setSessionNotes("");
  };

  // Add a handler for break session completion
  const handleCompleteBreakSession = (rating?: "happy" | "sad") => {
    completeSession(rating, sessionNotes);
    setShowBreakRatingModal(false);
    setSessionNotes("");
  };

  // Handle timer controls
  const handleTimerControls = () => {
    // If in overtime mode and running, complete the session instead of pausing
    if (isOvertime && timerStatus === TimerStatus.RUNNING) {
      if (currentSession?.type === "break") {
        setShowBreakRatingModal(true);
      } else {
        setShowRatingModal(true);
      }
      return;
    }

    switch (timerStatus) {
      case TimerStatus.RUNNING:
        pauseSession();
        break;
      case TimerStatus.PAUSED:
        resumeSession();
        break;
      case TimerStatus.COMPLETED:
        if (currentSession?.type === "break") {
          setShowBreakRatingModal(true);
        } else {
          setShowRatingModal(true);
        }
        break;
      default:
        setShowStartModal(true);
        break;
    }
  };

  // Handle canceling the current session
  const handleCancelSession = () => {
    setShowCancelConfirmation(true);
  };

  // Confirm cancellation and reset the session
  const confirmCancelSession = () => {
    completeSession(); // Complete the session without rating
    setShowCancelConfirmation(false);
  };

  // Get appropriate button text based on timer status
  const getButtonText = (): string => {
    // If in overtime mode, always show "Complete" instead of "Pause"
    if (isOvertime && timerStatus === TimerStatus.RUNNING) {
      return "Complete";
    }

    switch (timerStatus) {
      case TimerStatus.RUNNING:
        return "Pause";
      case TimerStatus.PAUSED:
        return "Resume";
      case TimerStatus.COMPLETED:
        return "Complete";
      default:
        return "Start Focus";
    }
  };

  // Get project name by ID
  const getProjectName = (id: string): string => {
    const project = projects.find((p) => p.id === id);
    return project ? project.name : "Select Project";
  };

  // Get project goal by ID
  const getProjectGoal = (id: string): string | undefined => {
    const project = projects.find((p) => p.id === id);
    return project?.goal;
  };

  // Full screen timer component
  const FullScreenTimer = () => {
    if (!fontsLoaded) return null;
    return (
      <View className="absolute w-full h-full bg-black z-50 justify-center items-center">
        <View className="w-full items-center justify-center p-5">
          <View className="absolute top-10 right-5 z-10">
            <TouchableOpacity className="p-2.5" onPress={handleCancelSession}>
              <FontAwesome name="times" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text className="text-xl font-medium text-white text-center mb-5">
            {currentSession?.taskDescription}
          </Text>
          <Text
            className="text-[96px] font-bold text-white tracking-wider mb-5"
            style={{ fontFamily: "LibreCaslonText_400Regular" }}
          >
            {formatTimeDisplay(remainingSeconds)}
          </Text>
          {currentSession?.type === "focus" && (
            <>
              <Text className="text-lg text-gray-300 mb-2.5">
                {getProjectName(currentSession.projectId)}
              </Text>
              {getProjectGoal(currentSession.projectId) && (
                <Text className="text-base text-gray-400 italic mb-10">
                  Goal: {getProjectGoal(currentSession.projectId)}
                </Text>
              )}
            </>
          )}

          <View className="items-center">
            <TouchableOpacity
              className="bg-blue-500 px-8 py-4 rounded-lg mb-4 min-w-[200px] items-center"
              onPress={handleTimerControls}
            >
              <Text className="text-white text-lg font-bold">
                {getButtonText()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/20 px-8 py-4 rounded-lg min-w-[200px] items-center"
              onPress={() => setIsFullScreen(false)}
            >
              <Text className="text-white text-lg font-bold">
                Exit Full Screen
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) return null;

  // Function to display user info for debugging
  const renderAuthDebug = () => {
    if (!session) {
      return (
        <View className="p-2.5 m-2.5 bg-gray-100 rounded border border-gray-300">
          <Text className="text-xs font-mono mb-1">
            Status: Not authenticated
          </Text>
          <TouchableOpacity
            className="mt-2 bg-red-400 p-1.5 rounded items-center"
            onPress={() => router.push("/login")}
          >
            <Text className="text-white text-xs font-bold">Go to Login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="p-2.5 m-2.5 bg-gray-100 rounded border border-gray-300">
        <Text className="text-xs font-mono mb-1">Status: Authenticated ✓</Text>
        <Text className="text-xs font-mono mb-1">
          User: {session.user.email}
        </Text>
        <Text className="text-xs font-mono mb-1">
          ID: {session.user.id.substring(0, 8)}...
        </Text>
        <TouchableOpacity
          className="mt-2 bg-red-400 p-1.5 rounded items-center"
          onPress={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
        >
          <Text className="text-white text-xs font-bold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return isFullScreen ? (
    <FullScreenTimer />
  ) : (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Auth Debug Panel (only in development mode) */}
      {__DEV__ && renderAuthDebug()}

      {/* Timer Display */}
      <View className="items-center py-10">
        {currentSession ? (
          <>
            <Text className="text-lg mb-5 text-center">
              {currentSession.taskDescription}
            </Text>
            <Text
              className={`text-[72px] font-bold mb-2 ${
                isOvertime ? "text-red-500" : ""
              }`}
              style={{ fontFamily: "LibreCaslonText_400Regular" }}
            >
              {formatTimeDisplay(remainingSeconds)}
            </Text>

            {isOvertime && (
              <Text className="text-base text-red-500 mb-3">
                You hit your goal of {currentSession.duration} min
              </Text>
            )}

            <Text className="text-base text-gray-500 mb-8">
              {getProjectName(currentSession.projectId)}
            </Text>

            <View className="w-full gap-3">
              <TouchableOpacity
                className="bg-blue-500 py-3 px-6 rounded-lg items-center"
                onPress={handleTimerControls}
              >
                <Text className="text-white text-base font-bold">
                  {getButtonText()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-500 py-3 px-6 rounded-lg items-center"
                onPress={() => setIsFullScreen(true)}
              >
                <Text className="text-white text-base font-bold">
                  Full Screen
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-500 py-3 px-6 rounded-lg items-center"
                onPress={handleCancelSession}
              >
                <Text className="text-white text-base font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            className="bg-blue-500 py-4 px-8 rounded-lg"
            onPress={() => setShowStartModal(true)}
          >
            <Text className="text-white text-lg font-bold">
              Start Focus Session
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Start Session Modal */}
      <StartSessionModal
        visible={showStartModal}
        onClose={() => setShowStartModal(false)}
      />

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-xl p-6 w-[90%] max-w-[400px]">
            <Text className="text-xl font-bold mb-4 text-center">
              How was your focus session?
            </Text>

            <View className="flex-row justify-around mb-6">
              <TouchableOpacity
                className="items-center p-2.5"
                onPress={() => handleCompleteSession("happy")}
              >
                <FontAwesome name="smile-o" size={32} color="#4CAF50" />
                <Text className="text-base text-gray-600">Productive</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center p-2.5"
                onPress={() => handleCompleteSession("sad")}
              >
                <FontAwesome name="frown-o" size={32} color="#F44336" />
                <Text className="text-base text-gray-600">Distracted</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-base text-gray-800 mb-2">
              Session Notes (optional):
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base h-[100px] mb-4"
              multiline={true}
              value={sessionNotes}
              onChangeText={setSessionNotes}
              placeholder="What did you accomplish? What could be improved?"
              textAlignVertical="top"
            />

            <TouchableOpacity
              className="py-2.5 items-center"
              onPress={() => handleCompleteSession()}
            >
              <Text className="text-gray-500 text-base">Skip Rating</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Break Rating Modal */}
      <Modal
        visible={showBreakRatingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBreakRatingModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-xl p-6 w-[90%] max-w-[400px]">
            <Text className="text-xl font-bold mb-4 text-center">
              How was your rest session?
            </Text>

            <View className="flex-row justify-around mb-6">
              <TouchableOpacity
                className="items-center p-2.5"
                onPress={() => handleCompleteBreakSession("happy")}
              >
                <FontAwesome name="smile-o" size={32} color="#4CAF50" />
                <Text className="text-base text-gray-600">Refreshed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center p-2.5"
                onPress={() => handleCompleteBreakSession("sad")}
              >
                <FontAwesome name="frown-o" size={32} color="#F44336" />
                <Text className="text-base text-gray-600">Still Tired</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-base text-gray-800 mb-2">
              What did you do on your break? (optional)
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base h-[100px] mb-4"
              multiline={true}
              value={sessionNotes}
              onChangeText={setSessionNotes}
              placeholder="Something active? Refuelled? Something mindful? Doom scrolled?"
              textAlignVertical="top"
            />

            <TouchableOpacity
              className="py-2.5 items-center"
              onPress={() => handleCompleteBreakSession()}
            >
              <Text className="text-gray-500 text-base">Skip Rating</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelConfirmation}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCancelConfirmation(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-xl p-5 w-[90%] max-w-[400px]">
            <Text className="text-xl font-bold mb-4 text-center">
              Cancel Session?
            </Text>
            <Text className="text-base text-gray-600 mb-6 text-center">
              Are you sure you want to cancel your current focus session?
            </Text>

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg items-center mx-2 bg-gray-100"
                onPress={() => setShowCancelConfirmation(false)}
              >
                <Text className="text-gray-800 text-base font-medium">
                  No, Keep Going
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 rounded-lg items-center mx-2 bg-red-500"
                onPress={confirmCancelSession}
              >
                <Text className="text-white text-base font-medium">
                  Yes, Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
