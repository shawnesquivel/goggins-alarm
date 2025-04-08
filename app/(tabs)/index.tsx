import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter, useNavigation } from "expo-router";
import { TimerStatus } from "@/types/alarm";
import StartSessionModal from "@/components/shared/modals/StartSessionModal";
import {
  useFonts,
  LibreCaslonText_400Regular,
} from "@expo-google-fonts/libre-caslon-text";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useProjects } from "@/contexts/ProjectContext";
import SessionDebugPanel from "@/components/debug/SessionDebugPanel";
import { format } from "date-fns";
import { ExportModal } from "@/components/shared/modals/ExportModal";
import { HeaderRight } from "@/components/shared/HeaderRight";

export default function TimerScreen() {
  const router = useRouter();
  const navigation = useNavigation();
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
    cancelSession,
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
  const [starRating, setStarRating] = useState<number>(0);
  const [selectedRestActivities, setSelectedRestActivities] = useState<
    string[]
  >([]);
  const [selectedBreakActivities, setSelectedBreakActivities] = useState<
    string[]
  >([]);
  const [showExportModal, setShowExportModal] = useState(false);

  // Add export ref
  const exportRef = useRef({
    showExportModal: () => setShowExportModal(true),
    getSessionData: () => ({
      userName: session?.user?.email?.split("@")[0] || "User",
      duration: currentSession?.duration || 0,
    }),
  });

  // Update navigation options when the ref changes
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight onExport={() => exportRef.current.showExportModal()} />
      ),
    });
  }, [navigation]);

  // Format remaining time as mm:ss
  const formatTimeDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
    return `${isOvertime ? "+" : ""}${timeString}`;
  };

  // Handle session completion and rating
  const handleCompleteSession = () => {
    completeSession(starRating, sessionNotes, true, selectedBreakActivities);
    setShowRatingModal(false);
    setSessionNotes("");
    setStarRating(0);
  };

  // Toggle selected activity
  const toggleRestActivity = (activity: string) => {
    if (selectedRestActivities.includes(activity)) {
      setSelectedRestActivities(
        selectedRestActivities.filter((a) => a !== activity)
      );
    } else {
      setSelectedRestActivities([...selectedRestActivities, activity]);
    }
  };

  // Updated handler for break session completion
  const handleCompleteBreakSession = () => {
    completeSession(
      undefined, // No rating for breaks
      undefined, // No notes needed since we have activities
      false, // Don't transition to break
      selectedRestActivities // Pass the selected activities
    );
    setShowBreakRatingModal(false);
    setSelectedRestActivities([]);
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
    cancelSession(); // Use cancelSession instead of completeSession
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
      <View className="absolute w-full h-full bg-[#f5f5f0] z-50 justify-center items-center">
        <View className="w-[90%] items-center justify-center p-5">
          <View className="absolute top-10 right-5 z-10">
            <TouchableOpacity
              className="p-2.5"
              onPress={() => setIsFullScreen(false)}
            >
              <FontAwesome name="times" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <Text className="text-3xl font-bold italic mb-2 text-center">
            Deep {currentSession?.type === "focus" ? "Work" : "Rest"}
          </Text>

          <Text className="text-sm text-gray-600 text-center uppercase mb-1">
            {currentSession?.type === "focus" ? "WORKING ON:" : "RESTING FROM:"}
          </Text>
          <Text className="text-base mb-6 text-center">
            {currentSession?.taskDescription !== "Break"
              ? currentSession?.taskDescription
              : getProjectName(currentSession?.projectId || "")}
          </Text>

          {/* Timer in white box */}
          <View
            className={`bg-white rounded-md p-8 mb-6 shadow-md w-[80%] items-center ${
              isOvertime ? "bg-gray-100" : "bg-white"
            }`}
          >
            <Text
              className={`text-[80px] font-bold ${
                isOvertime ? "text-black" : "text-black"
              }`}
              style={{ fontFamily: "LibreCaslonText_400Regular" }}
            >
              {formatTimeDisplay(remainingSeconds)}
            </Text>
          </View>

          {/* Overtime info */}
          {isOvertime && (
            <>
              <Text className="text-sm font-medium text-black mb-1 flex-row items-center">
                <FontAwesome name="check" size={12} color="#000" /> YOU HIT YOUR
                GOAL OF {currentSession?.duration} MIN
              </Text>
              <Text className="text-sm text-gray-600 mb-4">
                TIME ELAPSED: {Math.floor(currentSession?.duration || 0)}:
                {(((currentSession?.duration || 0) % 1) * 60)
                  .toFixed(0)
                  .padStart(2, "0")}
              </Text>
            </>
          )}

          {/* Action Buttons */}
          <TouchableOpacity
            className="bg-black py-4 px-6 rounded-md items-center w-full mb-3"
            onPress={() => {
              if (currentSession?.type === "focus") {
                setShowRatingModal(true);
              } else {
                setShowBreakRatingModal(true);
              }
            }}
          >
            <Text className="text-white text-base font-bold">
              {currentSession?.type === "focus"
                ? isOvertime
                  ? "TAKE A DEEP REST"
                  : "END DEEP WORK EARLY"
                : "START DEEP WORK"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 px-6 rounded-md items-center w-full"
            onPress={handleCancelSession}
          >
            <Text className="text-black text-base">END WORK SESSION</Text>
          </TouchableOpacity>

          {/* Add Export Button */}
          <TouchableOpacity
            className="py-3 px-6 rounded-md items-center w-full border border-gray-200"
            onPress={() => setShowExportModal(true)}
          >
            <Text className="text-black text-base">SHARE DEEP WORK</Text>
          </TouchableOpacity>
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

  const renderSessionDebug = () => {
    if (!__DEV__) return null;
    return <SessionDebugPanel />;
  // Add this helper function near your other utility functions
  const formatDurationForExport = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
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

      {/* Session Debug Panel (only in development mode) */}
      {__DEV__ && renderSessionDebug()}

      {/* Timer Display */}
      <View className="items-center py-10">
        {currentSession ? (
          <>
            <Text className="text-2xl font-bold italic mb-2 text-center">
              Deep {currentSession.type === "focus" ? "Work" : "Rest"}
            </Text>

            <Text className="text-sm text-gray-600 text-center uppercase mb-1">
              {currentSession.type === "focus"
                ? "WORKING ON:"
                : "RESTING FROM:"}
            </Text>
            <Text className="text-base mb-6 text-center">
              {currentSession.taskDescription !== "Break"
                ? currentSession.taskDescription
                : getProjectName(currentSession.projectId)}
            </Text>

            {/* Timer in white box */}
            <View
              className={`bg-white rounded-md p-6 mb-6 shadow-md w-[65%] items-center ${
                isOvertime ? "bg-gray-100" : "bg-white"
              }`}
            >
              <Text
                className={`text-[60px] font-bold ${
                  isOvertime ? "text-black" : "text-black"
                }`}
                style={{ fontFamily: "LibreCaslonText_400Regular" }}
              >
                {formatTimeDisplay(remainingSeconds)}
              </Text>

              {/* Full Screen Button */}
              <TouchableOpacity
                className="absolute top-2 right-2 p-2"
                onPress={() => setIsFullScreen(true)}
              >
                <FontAwesome name="expand" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Overtime info */}
            {isOvertime && (
              <>
                <Text className="text-sm font-medium text-black mb-1 flex-row items-center">
                  <FontAwesome name="check" size={12} color="#000" /> YOU HIT
                  YOUR GOAL OF {currentSession.duration} MIN
                </Text>
                <Text className="text-sm text-gray-600 mb-4">
                  TIME ELAPSED: {Math.floor(currentSession.duration)}:
                  {((currentSession.duration % 1) * 60)
                    .toFixed(0)
                    .padStart(2, "0")}
                  {remainingSeconds > 0 ? `:${remainingSeconds}` : ""}
                </Text>
              </>
            )}

            {/* Action Buttons */}
            <TouchableOpacity
              className="bg-black py-4 px-6 rounded-md items-center w-full mb-3"
              onPress={() => {
                if (currentSession?.type === "focus") {
                  setShowRatingModal(true);
                } else {
                  setShowBreakRatingModal(true);
                }
              }}
            >
              <Text className="text-white text-base font-bold">
                {currentSession?.type === "focus"
                  ? isOvertime
                    ? "TAKE A DEEP REST"
                    : "END DEEP WORK EARLY"
                  : "START DEEP WORK"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-3 px-6 rounded-md items-center w-full mb-3"
              onPress={handleCancelSession}
            >
              <Text className="text-black text-base">END WORK SESSION</Text>
            </TouchableOpacity>

            {/* Add Export Button */}
            <TouchableOpacity
              className="py-3 px-6 rounded-md items-center w-full border border-gray-200"
              onPress={() => setShowExportModal(true)}
            >
              <Text className="text-black text-base">SHARE DEEP WORK</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="items-center w-full">
            <TouchableOpacity
              className="bg-black py-4 px-6 rounded-md items-center w-full mb-3"
              onPress={() => setShowStartModal(true)}
            >
              <Text className="text-white text-base font-bold">
                START DEEP WORK
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Start Session Modal */}
      <StartSessionModal
        visible={showStartModal}
        onClose={() => setShowStartModal(false)}
      />

      {/* Rating Modal with stars */}
      <Modal
        visible={showRatingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-xl p-6 w-[90%] max-w-[400px]">
            <Text className="text-2xl font-medium mb-2 text-center">
              Rate your
            </Text>
            <Text className="text-2xl font-bold mb-6 text-center italic">
              Deep Work
            </Text>

            {currentSession && (
              <Text className="text-sm text-gray-600 text-center mb-2">
                YOUR 1ST WORK SESSION ON:
              </Text>
            )}
            <Text className="text-lg mb-8 text-center">
              {currentSession?.taskDescription || "Creating a landing page"}
            </Text>

            {/* Star Rating */}
            <View className="flex-row justify-center mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setStarRating(star)}
                  className="mx-2"
                >
                  <FontAwesome
                    name={starRating >= star ? "star" : "star-o"}
                    size={36}
                    color={starRating >= star ? "#FFD700" : "#CCCCCC"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm text-gray-500 text-center mb-8">
              TIME ELAPSED:{" "}
              {currentSession
                ? Math.round(
                    (new Date().getTime() -
                      new Date(currentSession.startTime).getTime()) /
                      60000
                  )
                : 0}{" "}
              min
            </Text>

            <TouchableOpacity
              className="bg-black py-4 rounded-lg items-center mb-3"
              onPress={() => {
                handleCompleteSession();
                startBreakSession();
              }}
            >
              <Text className="text-white text-base font-medium">
                START DEEP REST
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-3 rounded-lg items-center"
              onPress={() => {
                handleCompleteSession();
              }}
            >
              <Text className="text-gray-800 text-base">END WORK SESSION</Text>
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
            <Text className="text-2xl font-medium text-center mb-1">
              What did you do
            </Text>
            <Text className="text-2xl font-medium italic text-center mb-6">
              for Deep Rest
            </Text>

            {currentSession && (
              <>
                <Text className="text-sm text-gray-600 text-center mb-1">
                  YOUR 1ST REST SESSION ON:
                </Text>
                <Text className="text-base text-center mb-6">
                  {getProjectName(currentSession.projectId)}
                </Text>
              </>
            )}

            {/* Activity selection buttons */}
            {[
              "SOMETHING ACTIVE",
              "REFUELLED",
              "SOMETHING MINDFUL",
              "DOOM SCROLLED",
            ].map((activity) => (
              <TouchableOpacity
                key={activity}
                className={`py-3 px-4 mb-3 rounded-md ${
                  selectedRestActivities.includes(activity)
                    ? "bg-gray-200 border border-gray-300"
                    : "bg-gray-100"
                } flex-row justify-between items-center`}
                onPress={() => toggleRestActivity(activity)}
              >
                <Text className="text-base text-gray-800">{activity}</Text>
                {selectedRestActivities.includes(activity) && (
                  <FontAwesome name="check" size={16} color="#666" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="bg-black py-4 rounded-lg items-center mt-4 mb-3"
              onPress={() => {
                handleCompleteBreakSession();
                // Start another focus session
                setShowStartModal(true);
              }}
            >
              <Text className="text-white text-base font-medium">
                START DEEP WORK
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-3 rounded-lg items-center"
              onPress={() => {
                handleCompleteBreakSession();
              }}
            >
              <Text className="text-gray-800 text-base">END WORK SESSION</Text>
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

      {/* Export Modal */}
      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        userName={session?.user?.email?.split("@")[0] || "User"}
        deepWorkTime={formatDurationForExport(
          Math.floor(currentSession?.duration || 0) * 60
        )}
        date={format(new Date(), "EEE, MMM d")}
      />
    </ScrollView>
  );
}
