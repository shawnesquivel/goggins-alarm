import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { TimerStatus } from "@/types/alarm";

export default function TimerScreen() {
  const router = useRouter();
  // REMOVED: Onboarding context usage moved to _layout
  // const { isOnboarding } = useOnboarding();
  // const [isLoading, setIsLoading] = useState(true);
  // const hasNavigated = useRef(false);

  // REMOVED: triggerOnboarding function
  // const triggerOnboarding = () => { ... };

  // REMOVED: useEffect for onboarding check
  // useEffect(() => {
  //   console.log("[TimerScreen] Mount useEffect: Triggering onboarding check.");
  //   if (isOnboarding && !hasNavigated.current) {
  //     ...
  //   } else {
  //     setIsLoading(false);
  //   }
  // }, []);

  // Get context data
  const {
    timerStatus,
    remainingSeconds,
    currentSession,
    startFocusSession,
    pauseSession,
    resumeSession,
    completeSession,
    startBreakSession,
    settings,
    projects,
    tags,
  } = usePomodoro();

  // Local state
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Initialize with first project if available
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  // Format remaining time as mm:ss
  const formatTimeDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start a new focus session
  const handleStartFocus = () => {
    if (!taskDescription || !selectedProjectId) return;

    startFocusSession(taskDescription, selectedProjectId, selectedTags);
  };

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
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
    setTaskDescription("");
    setSelectedTags([]);
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

  // Main screen UI
  console.log("[TimerScreen] Rendering main UI.");
  return isFullScreen ? (
    <FullScreenTimer />
  ) : (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Session Setup Section (when no active session) */}
      {timerStatus === TimerStatus.IDLE && (
        <View style={styles.setupSection}>
          <Text style={styles.sectionTitle}>New Focus Session</Text>

          <Text style={styles.inputLabel}>What are you working on?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe your task..."
            value={taskDescription}
            onChangeText={setTaskDescription}
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Project</Text>
          <View style={styles.projectSelector}>
            {projects.length === 0 ? (
              <Text style={styles.noProjectsText}>
                No projects available. Create one in the Projects tab.
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.projectChip,
                      selectedProjectId === project.id &&
                        styles.selectedProjectChip,
                      { borderColor: project.color || "#4A90E2" },
                    ]}
                    onPress={() => setSelectedProjectId(project.id)}
                  >
                    <Text
                      style={[
                        styles.projectChipText,
                        selectedProjectId === project.id &&
                          styles.selectedProjectChipText,
                      ]}
                    >
                      {project.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <Text style={styles.inputLabel}>Tags</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagChip,
                  selectedTags.includes(tag.id) && styles.selectedTagChip,
                  {
                    backgroundColor: selectedTags.includes(tag.id)
                      ? tag.color
                      : "transparent",
                  },
                ]}
                onPress={() => toggleTag(tag.id)}
              >
                <Text
                  style={[
                    styles.tagChipText,
                    selectedTags.includes(tag.id) && styles.selectedTagChipText,
                  ]}
                >
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.durationSection}>
            <Text style={styles.durationLabel}>
              Focus Duration: {settings.focusDuration} minutes
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.startButton,
              (!taskDescription || !selectedProjectId) && styles.disabledButton,
            ]}
            onPress={handleStartFocus}
            disabled={!taskDescription || !selectedProjectId}
          >
            <Text style={styles.startButtonText}>Start Focus Session</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Active Timer Section */}
      {timerStatus !== TimerStatus.IDLE && (
        <View style={styles.timerSection}>
          <View style={styles.timerHeader}>
            <Text style={styles.timerType}>
              {currentSession?.type === "focus" ? "FOCUS" : "BREAK"}
            </Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSession}
            >
              <FontAwesome name="times" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.timeDisplay}>
            {formatTimeDisplay(remainingSeconds)}
          </Text>

          {currentSession?.type === "focus" && (
            <>
              <Text style={styles.sessionTask}>
                {currentSession.taskDescription}
              </Text>
              <Text style={styles.sessionProject}>
                {getProjectName(currentSession.projectId)}
              </Text>
              {getProjectGoal(currentSession.projectId) && (
                <Text style={styles.sessionGoal}>
                  Goal: {getProjectGoal(currentSession.projectId)}
                </Text>
              )}
            </>
          )}

          <View style={styles.timerControls}>
            <TouchableOpacity
              style={styles.timerButton}
              onPress={handleTimerControls}
            >
              <Text style={styles.timerButtonText}>{getButtonText()}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fullScreenToggle}
              onPress={() => setIsFullScreen(true)}
            >
              <FontAwesome name="expand" size={24} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {timerStatus === TimerStatus.COMPLETED &&
            currentSession?.type === "focus" && (
              <TouchableOpacity
                style={styles.startBreakButton}
                onPress={startBreakSession}
              >
                <Text style={styles.startBreakButtonText}>
                  Start {settings.breakDuration} Min Break
                </Text>
              </TouchableOpacity>
            )}

          {timerStatus === TimerStatus.COMPLETED &&
            currentSession?.type === "break" && (
              <TouchableOpacity
                style={styles.startFocusButton}
                onPress={() => handleCompleteSession()}
              >
                <Text style={styles.startFocusButtonText}>
                  Start New Focus Session
                </Text>
              </TouchableOpacity>
            )}
        </View>
      )}

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

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  contentContainer: {
    padding: 20,
  },
  setupSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#555",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  projectSelector: {
    marginBottom: 16,
  },
  projectChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 10,
  },
  selectedProjectChip: {
    backgroundColor: "#f0f8ff",
  },
  projectChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedProjectChipText: {
    color: "#4A90E2",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagChip: {
    borderColor: "transparent",
  },
  tagChipText: {
    fontSize: 14,
  },
  selectedTagChipText: {
    color: "#fff",
  },
  noProjectsText: {
    color: "#999",
    fontStyle: "italic",
    marginBottom: 16,
  },
  durationSection: {
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#b3d1f5",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Timer section styles
  timerSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timerType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  cancelButton: {
    padding: 8,
  },
  timeDisplay: {
    fontSize: 72,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 20,
  },
  sessionTask: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  sessionProject: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  sessionGoal: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 24,
  },
  timerControls: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  timerButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 16,
  },
  timerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  fullScreenToggle: {
    padding: 10,
  },
  startBreakButton: {
    backgroundColor: "#9013FE",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 8,
  },
  startBreakButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  startFocusButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 8,
  },
  startFocusButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Full screen styles
  fullScreenContainer: {
    position: "absolute",
    width: width,
    height: height,
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

  // Modal styles
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
});
