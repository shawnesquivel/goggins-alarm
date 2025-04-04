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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

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
  const { session } = useAuth();

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
  const FullScreenTimer = () => (
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
        <Text style={styles.fullScreenTimer}>
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

  // Function to display user info for debugging
  const renderAuthDebug = () => {
    if (!session) {
      return (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Status: Not authenticated</Text>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.debugButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>Status: Authenticated ✓</Text>
        <Text style={styles.debugText}>User: {session.user.email}</Text>
        <Text style={styles.debugText}>
          ID: {session.user.id.substring(0, 8)}...
        </Text>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
        >
          <Text style={styles.debugButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return isFullScreen ? (
    <FullScreenTimer />
  ) : (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Auth Debug Panel (only in development mode) */}
      {__DEV__ && renderAuthDebug()}

      {/* Timer Display */}
      <View style={styles.timerSection}>
        {currentSession ? (
          <>
            <Text style={styles.taskText}>
              {currentSession.taskDescription}
            </Text>
            <Text style={styles.timerText}>
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
      <Modal
        visible={showRatingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How was your focus session?</Text>

            <View style={styles.ratingContainer}>
              <TouchableOpacity
                style={styles.ratingButton}
                onPress={() => handleCompleteSession("happy")}
              >
                <FontAwesome name="smile-o" size={32} color="#4CAF50" />
                <Text style={styles.ratingText}>Productive</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ratingButton}
                onPress={() => handleCompleteSession("sad")}
              >
                <FontAwesome name="frown-o" size={32} color="#F44336" />
                <Text style={styles.ratingText}>Distracted</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.notesLabel}>Session Notes (optional):</Text>
            <TextInput
              style={styles.notesInput}
              multiline={true}
              value={sessionNotes}
              onChangeText={setSessionNotes}
              placeholder="What did you accomplish? What could be improved?"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleCompleteSession()}
            >
              <Text style={styles.submitButtonText}>Skip Rating</Text>
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
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.confirmationModal]}>
            <Text style={styles.modalTitle}>Cancel Session?</Text>
            <Text style={styles.confirmationText}>
              Are you sure you want to cancel your current focus session?
            </Text>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowCancelConfirmation(false)}
              >
                <Text style={styles.confirmButtonText}>No, Keep Going</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmCancelButton]}
                onPress={confirmCancelSession}
              >
                <Text style={styles.confirmButtonText}>Yes, Cancel</Text>
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
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: 20,
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
  modalContainer: {
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
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  ratingButton: {
    alignItems: "center",
    padding: 10,
  },
  ratingText: {
    fontSize: 16,
    color: "#666",
  },
  notesLabel: {
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
  submitButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  submitButtonText: {
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
  debugContainer: {
    padding: 10,
    margin: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  debugText: {
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 4,
  },
  debugButton: {
    marginTop: 8,
    backgroundColor: "#ff6b6b",
    padding: 6,
    borderRadius: 4,
    alignItems: "center",
  },
  debugButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  confirmationModal: {
    padding: 20,
  },
  confirmationText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  confirmationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f1f1f1",
  },
  confirmCancelButton: {
    backgroundColor: "#FF3B30",
  },
  confirmButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
});
