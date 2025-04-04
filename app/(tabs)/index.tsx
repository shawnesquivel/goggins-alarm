import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
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
    projects,
  } = usePomodoro();

  const [fontsLoaded] = useFonts({
    LibreCaslonText_400Regular,
  });

  // Local state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Format remaining time as mm:ss
  const formatTimeDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle session completion and rating
  const handleCompleteSession = (rating?: "happy" | "sad") => {
    completeSession(rating, sessionNotes);
    setShowRatingModal(false);
    setSessionNotes("");
  };

  // Handle timer controls
  const handleTimerControls = () => {
    switch (timerStatus) {
      case TimerStatus.RUNNING:
        pauseSession();
        break;
      case TimerStatus.PAUSED:
        resumeSession();
        break;
      case TimerStatus.COMPLETED:
        setShowRatingModal(true);
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
      <View style={styles.fullScreenContainer}>
        <View style={styles.fullScreenContent}>
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity
              style={styles.fullScreenCancelButton}
              onPress={handleCancelSession}
            >
              <FontAwesome name="times" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.fullScreenTask}>
            {currentSession?.taskDescription}
          </Text>
          <Text
            style={[
              styles.fullScreenTimer,
              { fontFamily: "LibreCaslonText_400Regular" },
            ]}
          >
            {formatTimeDisplay(remainingSeconds)}
          </Text>
          {currentSession?.type === "focus" && (
            <>
              <Text style={styles.fullScreenProject}>
                {getProjectName(currentSession.projectId)}
              </Text>
              {getProjectGoal(currentSession.projectId) && (
                <Text style={styles.fullScreenGoal}>
                  Goal: {getProjectGoal(currentSession.projectId)}
                </Text>
              )}
            </>
          )}

          <View style={styles.fullScreenControls}>
            <TouchableOpacity
              style={styles.fullScreenButton}
              onPress={handleTimerControls}
            >
              <Text style={styles.fullScreenButtonText}>{getButtonText()}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fullScreenButton, styles.exitButton]}
              onPress={() => setIsFullScreen(false)}
            >
              <Text style={styles.fullScreenButtonText}>Exit Full Screen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) return null;

  return isFullScreen ? (
    <FullScreenTimer />
  ) : (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Timer Display */}
      <View style={styles.timerSection}>
        {currentSession ? (
          <>
            <Text style={styles.taskText}>
              {currentSession.taskDescription}
            </Text>
            <Text
              style={[
                styles.timerText,
                { fontFamily: "LibreCaslonText_400Regular" },
              ]}
            >
              {formatTimeDisplay(remainingSeconds)}
            </Text>
            <Text style={styles.projectText}>
              {getProjectName(currentSession.projectId)}
            </Text>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleTimerControls}
              >
                <Text style={styles.controlButtonText}>{getButtonText()}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.secondaryButton]}
                onPress={() => setIsFullScreen(true)}
              >
                <Text style={styles.controlButtonText}>Full Screen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.dangerButton]}
                onPress={handleCancelSession}
              >
                <Text style={styles.controlButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setShowStartModal(true)}
          >
            <Text style={styles.startButtonText}>Start Focus Session</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Start Session Modal */}
      <StartSessionModal
        visible={showStartModal}
        onClose={() => setShowStartModal(false)}
      />

      {/* Rating Modal */}
      <Modal visible={showRatingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How was your focus session?</Text>

            <View style={styles.ratingsContainer}>
              <TouchableOpacity
                style={styles.ratingButton}
                onPress={() => handleCompleteSession("happy")}
              >
                <Text style={styles.ratingEmoji}>😊</Text>
                <Text style={styles.ratingText}>Productive</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ratingButton}
                onPress={() => handleCompleteSession("sad")}
              >
                <Text style={styles.ratingEmoji}>😞</Text>
                <Text style={styles.ratingText}>Could be better</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add session notes..."
              value={sessionNotes}
              onChangeText={setSessionNotes}
              multiline
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => handleCompleteSession()}
            >
              <Text style={styles.skipButtonText}>Skip Rating</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal visible={showCancelConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Session?</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to cancel the current session? Your progress
              will not be saved.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowCancelConfirmation(false)}
              >
                <Text style={styles.cancelModalButtonText}>
                  Continue Session
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={confirmCancelSession}
              >
                <Text style={styles.confirmModalButtonText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  contentContainer: {
    padding: 16,
  },
  timerSection: {
    alignItems: "center",
    paddingVertical: 40,
  },
  taskText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  timerText: {
    fontSize: 72,
    fontWeight: "bold",
    marginBottom: 20,
  },
  projectText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  controlsContainer: {
    width: "100%",
    gap: 12,
  },
  controlButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#666",
  },
  dangerButton: {
    backgroundColor: "#FF3B30",
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  startButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelModalButton: {
    backgroundColor: "#f1f1f1",
  },
  confirmModalButton: {
    backgroundColor: "#FF3B30",
  },
  cancelModalButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  ratingsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  ratingButton: {
    alignItems: "center",
    padding: 10,
  },
  ratingEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    color: "#666",
  },
  inputLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  skipButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#999",
    fontSize: 16,
  },
  fullScreenContainer: {
    position: "absolute",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: "#000",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  fullScreenHeader: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  fullScreenCancelButton: {
    padding: 10,
  },
  fullScreenTask: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  fullScreenTimer: {
    fontSize: 96,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
    marginBottom: 20,
  },
  fullScreenProject: {
    fontSize: 18,
    color: "#aaa",
    marginBottom: 10,
  },
  fullScreenGoal: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 40,
  },
  fullScreenControls: {
    alignItems: "center",
  },
  fullScreenButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 200,
    alignItems: "center",
  },
  fullScreenButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  exitButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
