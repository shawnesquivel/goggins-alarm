import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter, useNavigation } from "expo-router";
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
import { SessionService } from "@/services/SessionService";

export default function TimerScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const {
    remainingSeconds,
    currentSession,
    completeWorkPeriod,
    completeRestPeriod,
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
  const [starRating, setStarRating] = useState<number | null>(null);
  const [selectedRestActivity, setSelectedRestActivity] = useState<
    string | null
  >(null);
  const [isCompleteSessionScreen, setIsCompleteSessionScreen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isTaskComplete, setIsTaskComplete] = useState(false);

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

  // First, create a new handler function that takes the rating as a parameter
  const handleSubmitWithRating = (rating: number) => {
    setStarRating(rating);
    // Pass the rating directly to avoid race condition
    handleSubmitWorkPeriodReflectionWithRating(rating);
  };

  // Modified submission function that takes the rating parameter
  const handleSubmitWorkPeriodReflectionWithRating = async (rating: number) => {
    if (!currentSession) return;

    try {
      // Get the current period and session from DB to check latest state
      const currentPeriod = await SessionService.getCurrentPeriod();
      const dbSession = await SessionService.getSession(currentSession.id);

      // Check if session is already completed or cancelled
      if (!currentPeriod || !dbSession) {
        console.log("Session or period not found, already cleaned up");
        setShowRatingModal(false);
        return;
      }

      if (
        dbSession.status === "completed" ||
        dbSession.status === "cancelled"
      ) {
        console.log("Session already", dbSession.status);
        setShowRatingModal(false);
        return;
      }

      // Calculate actual duration up to now
      const startTime = new Date(currentSession.startTime);
      const endTime = new Date();
      const actualSeconds = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );

      // Use the direct rating parameter instead of state
      await SessionService.updatePeriod(currentPeriod.id, {
        actual_duration_minutes: actualSeconds / 60,
        ended_at: new Date().toISOString(),
        quality_rating: rating,
        user_notes: sessionNotes || null,
      });

      // Close rating modal and clean up state
      setShowRatingModal(false);
      setStarRating(null);
      setSessionNotes("");

      // Start rest period as normal, passing the rating directly
      completeWorkPeriod(rating, sessionNotes, true);
    } catch (error) {
      console.error("Error updating session for work reflection:", error);
      // Clean up UI state even if DB update fails
      setShowRatingModal(false);
      setStarRating(null);
      setSessionNotes("");
    }
  };

  // Define a function that handles both selection and submission
  const handleRestActivitySubmit = (activity: string) => {
    // First set the selected activity (for UI feedback)
    setSelectedRestActivity(activity);

    // Then immediately submit with the directly passed activity
    submitRestPeriodWithActivity(activity);
  };

  const submitRestPeriodWithActivity = async (activity: string) => {
    if (!currentSession) return;

    try {
      // Get the current period and session from DB to check latest state
      const currentPeriod = await SessionService.getCurrentPeriod();
      const dbSession = await SessionService.getSession(currentSession.id);

      // Check if session is already completed or cancelled
      if (!currentPeriod || !dbSession) {
        console.log("Session or period not found, already cleaned up");
        setShowBreakRatingModal(false);
        return;
      }

      if (
        dbSession.status === "completed" ||
        dbSession.status === "cancelled"
      ) {
        console.log("Session already", dbSession.status);
        setShowBreakRatingModal(false);
        return;
      }

      // Calculate actual duration up to now
      const startTime = new Date(currentSession.startTime);
      const endTime = new Date();
      const actualSeconds = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );

      // Keep as array with single element to match DB schema
      const activityArray = [activity];

      // Update period with rest activity
      await SessionService.updatePeriod(currentPeriod.id, {
        actual_duration_minutes: actualSeconds / 60,
        ended_at: new Date().toISOString(),
        rest_activities_selected: activityArray, // Single element array
      });

      // Close modal and clean up state
      setShowBreakRatingModal(false);
      setSelectedRestActivity(null);

      // Complete rest period and continue to next work period
      // Note: This assumes we'll modify AlarmContext's completeRestPeriod
      // to automatically start the next work period
      completeRestPeriod(activityArray, true);
    } catch (error) {
      console.error("Error updating session for rest reflection:", error);
      // Clean up UI state even if DB update fails
      setShowBreakRatingModal(false);
      setSelectedRestActivity(null);
    }
  };

  // Add near other state declarations
  enum CancelFlowStep {
    NONE,
    TASK_COMPLETE,
    RATE_FOCUS, // For deep work rating
    RATE_REST, // For deep rest rating
    CONFIRM,
    REFLECT,
  }

  const [cancelFlowStep, setCancelFlowStep] = useState<CancelFlowStep>(
    CancelFlowStep.NONE
  );
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  // Update existing handler
  const handleCancelSession = () => {
    console.log("Starting cancel flow with task completion check");
    setCancelFlowStep(CancelFlowStep.TASK_COMPLETE);
  };

  // Add new handlers
  const handleStartReflection = () => {
    setIsTaskComplete(false);
    setCancelFlowStep(CancelFlowStep.REFLECT);
  };

  const handleTaskComplete = () => {
    setIsTaskComplete(true);
    // Route to appropriate rating screen based on session type
    setCancelFlowStep(
      currentSession?.type === "focus"
        ? CancelFlowStep.RATE_FOCUS
        : CancelFlowStep.RATE_REST
    );
  };

  const handleTaskIncomplete = () => {
    setIsTaskComplete(false);
    setCancelFlowStep(
      currentSession?.type === "focus"
        ? CancelFlowStep.RATE_FOCUS
        : CancelFlowStep.RATE_REST
    );
  };

  // Update to accept direct parameter
  const handleSubmitReflection = async (selectedReason?: string) => {
    if (!currentSession) return;

    // Capture current state values to avoid race conditions
    const currentRating = starRating;
    const currentActivity = selectedRestActivity;
    const currentTaskComplete = isTaskComplete;

    // Use directly passed reason if provided, otherwise use state
    const currentReasons = selectedReason
      ? [selectedReason]
      : [...selectedReasons];

    try {
      // Get the current period and session from DB to check latest state
      const currentPeriod = await SessionService.getCurrentPeriod();
      const dbSession = await SessionService.getSession(currentSession.id);

      // Check if session is already completed or cancelled
      if (!currentPeriod || !dbSession) {
        console.log("Session or period not found, already cleaned up");
        setCancelFlowStep(CancelFlowStep.NONE);
        setSelectedReasons([]);
        setStarRating(null);
        setSelectedRestActivity(null);
        return;
      }

      if (
        dbSession.status === "completed" ||
        dbSession.status === "cancelled"
      ) {
        console.log("Session already", dbSession.status);
        setCancelFlowStep(CancelFlowStep.NONE);
        setSelectedReasons([]);
        setStarRating(null);
        setSelectedRestActivity(null);
        return;
      }

      // Calculate actual duration up to now
      const startTime = new Date(currentSession.startTime);
      const endTime = new Date();
      const actualSeconds = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );

      // Update period with reflection data - use captured values
      await SessionService.updatePeriod(currentPeriod.id, {
        actual_duration_minutes: actualSeconds / 60,
        ended_at: new Date().toISOString(),
        // Use the appropriate rating based on session type
        quality_rating: currentSession.type === "focus" ? currentRating : null,
        rest_activities_selected:
          currentSession.type === "break" && currentActivity
            ? [currentActivity]
            : null,
        work_time_completed: currentTaskComplete,
      });

      // Update session with reflection data - use captured values
      await SessionService.updateSession(currentSession.id, {
        status: currentTaskComplete ? "completed" : "cancelled",
        completed: currentTaskComplete,
        distraction_reasons_selected:
          currentReasons.length > 0 ? currentReasons : null,
        // Ignore: Future - will allow user to add notes.
        cancelled_reason_details: null,
      });

      // Force sync to Supabase
      await SessionService.syncToSupabase();

      // Call the context's cancelSession to clean up UI state
      cancelSession();

      // Clear all state
      setCancelFlowStep(CancelFlowStep.NONE);
      setSelectedReasons([]);
      setStarRating(null);
      setSelectedRestActivity(null);
    } catch (error) {
      console.error("Error updating session with reflection:", error);
      // Clean up UI state even if DB update fails
      setCancelFlowStep(CancelFlowStep.NONE);
      setSelectedReasons([]);
      setStarRating(null);
      setSelectedRestActivity(null);
    }
  };

  const handleSkipSessionReflection = async () => {
    if (!currentSession) return;

    // Capture current state for task completion
    const currentTaskComplete = isTaskComplete;

    try {
      // Get the current period and session from DB to check latest state
      const currentPeriod = await SessionService.getCurrentPeriod();
      const dbSession = await SessionService.getSession(currentSession.id);

      // Check if session is already completed or cancelled
      if (!currentPeriod || !dbSession) {
        console.log("Session or period not found, already cleaned up");
        setCancelFlowStep(CancelFlowStep.NONE);
        setSelectedReasons([]);
        setStarRating(null);
        setSelectedRestActivity(null);
        return;
      }

      if (
        dbSession.status === "completed" ||
        dbSession.status === "cancelled"
      ) {
        console.log("Session already", dbSession.status);
        setCancelFlowStep(CancelFlowStep.NONE);
        setSelectedReasons([]);
        setStarRating(null);
        setSelectedRestActivity(null);
        return;
      }

      // Calculate actual duration up to now
      const startTime = new Date(currentSession.startTime);
      const endTime = new Date();
      const actualSeconds = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );

      // Clear selected reasons before updating
      setSelectedReasons([]);

      // Update period with null reflection data
      await SessionService.updatePeriod(currentPeriod.id, {
        actual_duration_minutes: actualSeconds / 60,
        ended_at: new Date().toISOString(),
        work_time_completed: currentTaskComplete,
      });

      // Update session with null reflection data
      await SessionService.updateSession(currentSession.id, {
        status: currentTaskComplete ? "completed" : "cancelled",
        completed: currentTaskComplete,
        cancelled_reason_details: "Skipped reflection",
        distraction_reasons_selected: null,
      });

      // Force sync to Supabase
      await SessionService.syncToSupabase();

      // Call the context's cancelSession to clean up UI state
      cancelSession();

      // Clear all state
      setCancelFlowStep(CancelFlowStep.NONE);
      setStarRating(null);
      setSelectedRestActivity(null);
    } catch (error) {
      console.error("Error updating session for skip reflection:", error);
      // Clean up UI state even if DB update fails
      setCancelFlowStep(CancelFlowStep.NONE);
      setSelectedReasons([]);
      setStarRating(null);
      setSelectedRestActivity(null);
    }
  };

  const toggleReason = (reason: string) => {
    // Set the selected reason for UI feedback
    setSelectedReasons([reason]);

    // If NONE is selected, handle like skip
    if (reason === "NONE") {
      handleSkipSessionReflection();
      return;
    }

    // For other reasons, submit directly with the selected reason
    handleSubmitReflection(reason);
  };

  // Replace showCancelConfirmation modal with this
  const renderCancelFlow = () => {
    switch (cancelFlowStep) {
      case CancelFlowStep.TASK_COMPLETE:
        return (
          <Modal
            visible={true}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setCancelFlowStep(CancelFlowStep.NONE)}
          >
            <View className="flex-1 bg-black/50 justify-center items-center">
              <View className="bg-[#C2C1BB] rounded-3xl p-8 w-[95%] max-w-[500px] mx-4">
                {/* Add Close Button */}
                <View className="absolute right-6 top-6 z-10">
                  <TouchableOpacity
                    onPress={() => setCancelFlowStep(CancelFlowStep.NONE)}
                    className="p-2"
                  >
                    <FontAwesome name="times" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <Text className="text-4xl text-center mb-2">Task</Text>
                <Text className="text-4xl italic text-center mb-12">
                  complete?
                </Text>

                <Text className="text-base uppercase text-center mb-2">
                  INTENTION TO FINISH:
                </Text>
                <Text className="text-xl text-center mb-10">
                  {currentSession?.taskDescription}
                </Text>

                <TouchableOpacity
                  className="bg-black py-5 rounded-2xl items-center mb-4"
                  onPress={handleTaskComplete}
                >
                  <Text className="text-white text-lg font-medium">
                    YES, I FINISHED MY TASK
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-white py-5 rounded-2xl items-center"
                  onPress={handleTaskIncomplete}
                >
                  <Text className="text-black text-lg font-medium">
                    NO, END CYCLE EARLY
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        );

      case CancelFlowStep.CONFIRM:
        return (
          <Modal
            visible={true}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setCancelFlowStep(CancelFlowStep.NONE)}
          >
            <View className="flex-1 bg-black/50 justify-center items-center">
              <View className="bg-[#C2C1BB] rounded-3xl p-8 w-[95%] max-w-[500px] mx-4">
                <Text className="text-4xl text-center mb-2">End session</Text>
                <Text className="text-4xl italic text-center mb-12">
                  early?
                </Text>

                <Text className="text-base uppercase text-center mb-2">
                  INTENTION TO FINISH:
                </Text>
                <Text className="text-xl text-center mb-10">
                  {currentSession?.taskDescription}
                </Text>

                <Text className="text-lg text-center mb-8">
                  This task isn't finished. Once you end it, you won't be able
                  to resume or undo it.
                </Text>

                <Text className="text-lg text-center mb-12">
                  Choose what feels right: stay focused, or reflect and close
                  with intention.
                </Text>

                <TouchableOpacity
                  className="bg-white py-5 rounded-2xl items-center mb-4"
                  onPress={() => setCancelFlowStep(CancelFlowStep.NONE)}
                >
                  <Text className="text-black text-lg font-medium">
                    GO BACK
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-black py-5 rounded-2xl items-center"
                  onPress={handleStartReflection}
                >
                  <Text className="text-white text-lg font-medium">
                    END SESSION AND REFLECT
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        );

      case CancelFlowStep.REFLECT:
        const reasonIcons = [
          {
            label: "SOCIAL MEDIA / PHONE",
            icon: "mobile" as const,
          },
          {
            label: "EXTERNAL DISTRACTIONS",
            icon: "volume-up" as const,
          },
          {
            label: "LOW ENERGY",
            icon: "battery-quarter" as const,
          },
          { label: "CHANGE IN PRIORITIES", icon: "exchange" as const },
          { label: "NONE", icon: "check" as const },
        ];

        return (
          <Modal
            visible={true}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setCancelFlowStep(CancelFlowStep.NONE)}
          >
            <View className="flex-1 bg-black/50 justify-center items-center">
              <View className="bg-[#C2C1BB] rounded-3xl p-8 w-[95%] max-w-[500px] mx-4">
                <Text className="text-4xl text-center mb-2">Take a moment</Text>
                <Text className="text-4xl italic text-center mb-12">
                  to reflect:
                </Text>

                <Text className="text-base uppercase text-center mb-2">
                  {isTaskComplete ? "COMPLETED TASK:" : "INCOMPLETE TASK:"}
                </Text>
                <Text className="text-xl text-center mb-10">
                  {currentSession?.taskDescription}
                </Text>

                <Text className="text-lg text-center mb-8">
                  {isTaskComplete
                    ? "You hit your goal. Anything distracting you?"
                    : "You fell short of your goal. Let's figure out why, so you can improve for next time."}
                </Text>

                {/* Reason Buttons with Icons */}
                {reasonIcons.map((reason) => (
                  <TouchableOpacity
                    key={reason.label}
                    className="bg-white py-5 px-6 rounded-3xl items-center mb-4 shadow-sm flex-row justify-between"
                    onPress={() => toggleReason(reason.label)}
                  >
                    <View className="flex-row items-center">
                      <FontAwesome
                        name={reason.icon}
                        size={20}
                        color="#555"
                        style={{ marginRight: 12 }}
                      />
                      <Text
                        className="text-black text-lg"
                        style={{ fontFamily: "System" }}
                      >
                        {reason.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>
        );

      case CancelFlowStep.RATE_FOCUS:
        return (
          <Modal
            visible={true}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setCancelFlowStep(CancelFlowStep.NONE)}
          >
            <View className="flex-1 bg-white justify-center items-center">
              <View className="w-full max-w-[400px] px-8">
                <Text className="text-4xl text-center mb-1">Rate your</Text>
                <Text className="text-4xl italic text-center mb-8">
                  Deep Work
                </Text>

                <Text className="text-sm uppercase text-center mb-2">
                  TASK:
                </Text>
                <Text className="text-lg text-center mb-12">
                  {currentSession?.taskDescription}
                </Text>

                {/* Star Rating */}
                <View className="flex-row justify-center mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleCancelFlowFocusRating(star)}
                      className="mx-2"
                    >
                      <FontAwesome
                        name={(starRating ?? 0) >= star ? "star" : "star-o"}
                        size={36}
                        color={
                          (starRating ?? 0) >= star ? "#FFD700" : "#CCCCCC"
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text className="text-sm text-gray-600 text-center uppercase mb-12">
                  Enter a rating.
                </Text>
              </View>
            </View>
          </Modal>
        );

      case CancelFlowStep.RATE_REST:
        return (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setCancelFlowStep(CancelFlowStep.NONE)}
          >
            <View className="flex-1 bg-black/50 justify-center items-center">
              <View className="bg-white rounded-xl p-6 w-[90%] max-w-[400px]">
                <Text className="text-2xl font-medium text-center mb-1">
                  What did you do
                </Text>
                <Text className="text-2xl font-medium italic text-center mb-4">
                  for Deep Rest
                </Text>

                {currentSession && (
                  <>
                    <Text className="text-sm text-gray-600 text-center mb-1">
                      YOUR REST SESSION ON:
                    </Text>
                    <Text className="text-base text-center mb-6">
                      {getProjectName(currentSession.projectId)}
                    </Text>
                  </>
                )}

                {/* Activity selection buttons */}
                {[
                  { label: "MOVEMENT", icon: "arrow-right" as const },
                  { label: "REFUEL", icon: "coffee" as const },
                  { label: "SOCIALIZING", icon: "users" as const },
                  { label: "MINDFULNESS", icon: "heart" as const },
                  { label: "SOCIAL MEDIA", icon: "mobile" as const },
                ].map(({ label, icon }) => (
                  <TouchableOpacity
                    key={label}
                    className={`py-3 px-4 mb-3 rounded-md ${
                      selectedRestActivity === label
                        ? "bg-gray-200 border border-gray-300"
                        : "bg-gray-100"
                    } flex-row justify-between items-center`}
                    onPress={() => handleCancelFlowRestRating(label)}
                  >
                    <View className="flex-row items-center">
                      <FontAwesome
                        name={icon}
                        size={16}
                        color="#555"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-base text-gray-800">{label}</Text>
                    </View>
                    {selectedRestActivity === label && (
                      <FontAwesome name="check" size={16} color="#666" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>
        );

      default:
        return null;
    }
  };

  // Get project name by ID
  const getProjectName = (id: string): string => {
    const project = projects.find((p) => p.id === id);
    return project ? project.name : "Select Project";
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
          <TouchableOpacity
            className="mt-2 bg-red-400 p-1.5 rounded items-center"
            onPress={() => router.push("/login")}
          >
            <Text className="text-white text-xs font-bold">
              Not Logged In: Go to Login
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View className="p-2.5 m-2.5 bg-gray-100 rounded border border-gray-300">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center space-x-2">
            <Text className="text-xs font-mono">
              User: {session.user.email} ({session.user.id.substring(0, 8)})
            </Text>
          </View>
          <TouchableOpacity
            className="bg-red-400 px-3 py-1 rounded"
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            }}
          >
            <Text className="text-white text-xs font-bold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSessionDebug = () => {
    if (!__DEV__) return null;
    return <SessionDebugPanel />;
  };

  // Helper function for formatting duration in export
  const formatDurationForExport = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleCancelFlowFocusRating = (rating: number) => {
    // Capture current value to avoid race conditions
    setStarRating(rating);
    // Move to reflection step
    setCancelFlowStep(CancelFlowStep.REFLECT);
  };

  const handleCancelFlowRestRating = (activity: string) => {
    // Capture current value to avoid race conditions
    setSelectedRestActivity(activity);
    // Move to reflection step
    setCancelFlowStep(CancelFlowStep.REFLECT);
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

      {/* Overview PlaceHolders */}
      {!currentSession && (
        <View className="w-full bg-white rounded-lg mb-4">
          <View className="px-4 py-3">
            <Text className="text-sm text-gray-600 mb-1">
              WELCOME BACK SHAY,
            </Text>
            <Text className="text-2xl font-medium mb-4">Wed, Apr 2</Text>

            <View className="flex-row justify-between mb-4">
              <Text className="text-sm font-medium">OVERVIEW</Text>
              <Text className="text-sm text-gray-400">TASKS</Text>
            </View>

            <View className="items-center mb-6">
              <View className="w-32 h-32 bg-gray-100 rounded-full mb-4" />
              <Text className="text-sm text-gray-600 mb-1">
                TOTAL DEEP WORK
              </Text>
              <Text className="text-2xl">35:00:43</Text>
            </View>

            <Text className="text-sm text-gray-600 mb-2">TODAY'S SUMMARY</Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-base">
                Deep <Text className="italic">Work</Text>
              </Text>
              <View className="flex-row">
                <Text className="text-base mr-4">2</Text>
                <Text className="text-base">180</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-base">
                Deep <Text className="italic">Rest</Text>
              </Text>
              <View className="flex-row">
                <Text className="text-base mr-4">2</Text>
                <Text className="text-base">180</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Home Page Timer Display */}
      <View className="items-center py-8">
        {currentSession ? (
          <>
            {/* Session Active */}
            <Text className="text-2xl font-bold italic mb-4 text-center">
              Deep {currentSession.type === "focus" ? "Work" : "Rest"}
            </Text>

            <Text className="text-xs text-gray-600 text-center uppercase mb-2">
              WORKING ON:
            </Text>
            <Text className="text-base mb-8 text-center">
              {currentSession.taskDescription !== "Break"
                ? currentSession.taskDescription
                : getProjectName(currentSession.projectId)}
            </Text>

            {/* Timer in white box */}
            <View
              className={`bg-white rounded-md p-4 mb-10 shadow-md w-[90%] items-center ${
                isOvertime ? "bg-gray-100" : "bg-white"
              }`}
            >
              <Text
                className={`text-[72px] font-bold ${
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
                <Text className="text-sm text-gray-600 mb-8">
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
              className="bg-black py-5 px-6 rounded-md items-center w-full mb-4"
              onPress={() => {
                if (currentSession?.type === "focus") {
                  setShowRatingModal(true);
                } else {
                  setShowBreakRatingModal(true);
                }
              }}
            >
              <Text className="text-white text-base font-bold">
                {currentSession?.type === "focus" && isOvertime
                  ? "START DEEP REST"
                  : currentSession?.type === "focus" &&
                    !isOvertime &&
                    "START DEEP REST EARLY"}
                {currentSession?.type === "break" && "CONTINUE DEEP WORK"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-4 px-6 rounded-md items-center w-full mb-3"
              onPress={handleCancelSession}
            >
              <Text className="text-black text-base">
                END CYCLE (Cancel Session)
              </Text>
            </TouchableOpacity>

            {/* Add Export Button */}
            {/* Future: Only show this if we are on Complete Session Modal */}
            {isCompleteSessionScreen && (
              <TouchableOpacity
                className="py-3 px-6 rounded-md items-center w-full border border-gray-200"
                onPress={() => setShowExportModal(true)}
              >
                <Text className="text-black text-base">SHARE DEEP WORK</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          // No sesssion active
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
        <View className="flex-1 bg-white justify-center items-center">
          <View className="w-full max-w-[400px] px-8">
            {/* Change to back arrow in top left corner */}
            <View className="absolute left-4 top-4">
              <TouchableOpacity
                onPress={() => setShowRatingModal(false)}
                className="p-2"
              >
                <FontAwesome name="chevron-left" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text className="text-4xl text-center mb-1">Rate your</Text>
            <Text className="text-4xl italic text-center mb-8">Deep Work</Text>

            <Text className="text-sm uppercase text-center mb-2">TASK:</Text>
            <Text className="text-lg text-center mb-12">
              {currentSession?.taskDescription}
            </Text>

            {/* Star Rating */}
            <View className="flex-row justify-center mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleSubmitWithRating(star)}
                  className="mx-2"
                >
                  <FontAwesome
                    name={(starRating ?? 0) >= star ? "star" : "star-o"}
                    size={36}
                    color={(starRating ?? 0) >= star ? "#FFD700" : "#CCCCCC"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm text-gray-600 text-center uppercase mb-12">
              TIME ELAPSED:{" "}
              {currentSession
                ? Math.round(
                    (new Date().getTime() -
                      new Date(currentSession.startTime).getTime()) /
                      60000
                  )
                : 0}
              :50
            </Text>
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
            <Text className="text-2xl font-medium italic text-center mb-4">
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
              { label: "MOVEMENT", icon: "arrow-right" as const },
              { label: "REFUEL", icon: "coffee" as const },
              { label: "SOCIALIZING", icon: "users" as const },
              { label: "MINDFULNESS", icon: "heart" as const },
              { label: "SOCIAL MEDIA", icon: "mobile" as const },
            ].map(({ label, icon }) => (
              <TouchableOpacity
                key={label}
                className={`py-3 px-4 mb-3 rounded-md ${
                  selectedRestActivity === label
                    ? "bg-gray-200 border border-gray-300"
                    : "bg-gray-100"
                } flex-row justify-between items-center`}
                onPress={() => handleRestActivitySubmit(label)}
              >
                <View className="flex-row items-center">
                  <FontAwesome
                    name={icon}
                    size={16}
                    color="#555"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-base text-gray-800">{label}</Text>
                </View>
                {selectedRestActivity === label && (
                  <FontAwesome name="check" size={16} color="#666" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Cancel Flow */}
      {renderCancelFlow()}

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
