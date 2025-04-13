import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "expo-router";
import StartSessionModal from "@/components/shared/modals/StartSessionModal";
import {
  useFonts,
  LibreCaslonText_400Regular,
} from "@expo-google-fonts/libre-caslon-text";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";
import SessionDebugPanel from "@/components/debug/SessionDebugPanel";
import { format } from "date-fns";
import { ExportModal } from "@/components/shared/modals/ExportModal";
import { HeaderRight } from "@/components/shared/HeaderRight";
import { SessionService } from "@/services/SessionService";
import useAnalytics from "@/app/hooks/useAnalytics";
import { RestActivityRatingModal } from "@/components/cycle/RestActivityRatingModal";
import { SESSION_STORAGE_KEYS } from "@/types/session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WorkToRestBtn from "@/components/cycle/WorkToRestBtn";
import RestToWorkBtn from "@/components/cycle/RestToWorkBtn";
import EndCycleEarlyBtn from "@/components/cycle/EndCycleEarlybtn";
import Overview from "@/components/cycle/Overview";
import AuthDebugPanel from "@/components/debug/AuthDebugPanel";

export default function TimerScreen() {
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
  const [error, setError] = useState("");
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
  const [deepWorkTime, setDeepWorkTime] = useState(0);
  const [deepRestTime, setDeepRestTime] = useState(0);
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);

  // Add near other state declarations
  enum CancelFlowStep {
    NONE,
    TASK_COMPLETE, // Did you finish your task?
    RATE_FOCUS, // For deep work rating
    RATE_REST, // For deep rest rating
    CONFIRM,
    REFLECT,
    SESSION_COMPLETE,
  }

  const [cancelFlowStep, setCancelFlowStep] = useState<CancelFlowStep>(
    CancelFlowStep.NONE
  );
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const { analytics, isAnalyticsLoading, handleRefresh } = useAnalytics();

  // Add effect to calculate session times when reaching SESSION_COMPLETE step
  useEffect(() => {
    const calculateTimes = async () => {
      if (
        currentSession &&
        cancelFlowStep === CancelFlowStep.SESSION_COMPLETE
      ) {
        try {
          // Use existing SessionService method to get totals
          const totals = await SessionService.calculateSessionTotals(
            currentSession.id
          );
          setDeepWorkTime(totals.total_deep_work_minutes);
          setDeepRestTime(totals.total_deep_rest_minutes);
        } catch (error) {
          console.error("Error calculating session totals:", error);
          setDeepWorkTime(0);
          setDeepRestTime(0);
        }
      }
    };

    calculateTimes();
  }, [cancelFlowStep, currentSession?.id]);

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
      console.log(
        "Updating period from handleSubmitWorkPeriodReflectionWithRating"
      );
      await SessionService.updatePeriod(
        currentPeriod.id,
        {
          actual_duration_minutes: actualSeconds / 60,
          ended_at: new Date().toISOString(),
          quality_rating: rating,
          user_notes: sessionNotes || null,
        },
        true
      );

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

  // Modified rest period submission for normal flow - will auto-start next work
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
      console.log("Updating period from submitRestPeriodWithActivity");
      await SessionService.updatePeriod(
        currentPeriod.id,
        {
          actual_duration_minutes: actualSeconds / 60,
          ended_at: new Date().toISOString(),
          rest_activities_selected: activityArray, // Single element array
        },
        true
      );

      // Close modal and clean up state
      setShowBreakRatingModal(false);
      setSelectedRestActivity(null);

      // Complete rest period and CONTINUE to next work period
      // Normal flow - always start next work period
      completeRestPeriod(activityArray, true);
    } catch (error) {
      console.error("Error updating session for rest reflection:", error);
      // Clean up UI state even if DB update fails
      setShowBreakRatingModal(false);
      setSelectedRestActivity(null);
    }
  };

  // UPDATED function for cancel flow - will NOT auto-start next work period
  const handleCancelFlowRestRating = async (activity: string) => {
    if (!currentSession) return;

    // Capture current value to avoid race conditions
    setSelectedRestActivity(activity);

    try {
      // Get the current period and session
      const currentPeriod = await SessionService.getCurrentPeriod();
      const dbSession = await SessionService.getSession(currentSession.id);

      if (currentPeriod && dbSession) {
        // Calculate actual duration
        const startTime = new Date(currentSession.startTime);
        const endTime = new Date();
        const actualSeconds = Math.floor(
          (endTime.getTime() - startTime.getTime()) / 1000
        );

        // Keep as array with single element to match DB schema
        const activityArray = [activity];

        // Update period with duration and activity
        console.log("Updating period from handleCancelFlowRestRating");
        await SessionService.updatePeriod(
          currentPeriod.id,
          {
            actual_duration_minutes: actualSeconds / 60,
            ended_at: new Date().toISOString(),
            rest_activities_selected: activityArray,
          },
          true
        );

        // For the cancel flow, we DO NOT call completeRestPeriod with startNewWork=true
        // Instead we just handle the UI update without starting a new work period
        await completeRestPeriod(activityArray, false);
      }
    } catch (error) {
      console.error("Error updating rest period for cancel flow:", error);
    }

    // Move to reflection step
    setCancelFlowStep(CancelFlowStep.REFLECT);
  };

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

  // // Update to accept direct parameter
  // const handleSubmitReflection = async (selectedReason?: string) => {
  //   if (!currentSession) return;

  //   // Capture current state values to avoid race conditions
  //   const currentRating = starRating;
  //   const currentActivity = selectedRestActivity;
  //   const currentTaskComplete = isTaskComplete;

  //   // Use directly passed reason if provided, otherwise use state
  //   const currentReasons = selectedReason
  //     ? [selectedReason]
  //     : [...selectedReasons];

  //   try {
  //     // Get the current period and session from DB to check latest state
  //     const currentPeriod = await SessionService.getCurrentPeriod();
  //     const dbSession = await SessionService.getSession(currentSession.id);

  //     // Check if session is already completed or cancelled
  //     if (!currentPeriod || !dbSession) {
  //       console.log("Session or period not found, already cleaned up");
  //       setCancelFlowStep(CancelFlowStep.NONE);
  //       setSelectedReasons([]);
  //       setStarRating(null);
  //       setSelectedRestActivity(null);
  //       return;
  //     }

  //     if (
  //       dbSession.status === "completed" ||
  //       dbSession.status === "cancelled"
  //     ) {
  //       console.log("Session already", dbSession.status);
  //       setCancelFlowStep(CancelFlowStep.NONE);
  //       setSelectedReasons([]);
  //       setStarRating(null);
  //       setSelectedRestActivity(null);
  //       return;
  //     }

  //     // Calculate actual duration up to now
  //     const startTime = new Date(currentSession.startTime);
  //     const endTime = new Date();
  //     const actualSeconds = Math.floor(
  //       (endTime.getTime() - startTime.getTime()) / 1000
  //     );

  //     // Update period with reflection data - use captured values
  //     await SessionService.updatePeriod(currentPeriod.id, {
  //       actual_duration_minutes: actualSeconds / 60,
  //       ended_at: new Date().toISOString(),
  //       // Use the appropriate rating based on session type
  //       quality_rating: currentSession.type === "focus" ? currentRating : null,
  //       rest_activities_selected:
  //         currentSession.type === "break" && currentActivity
  //           ? [currentActivity]
  //           : null,
  //       work_time_completed: currentTaskComplete,
  //     });

  //     // Update session with reflection data - use captured values
  //     await SessionService.updateSession(currentSession.id, {
  //       status: currentTaskComplete ? "completed" : "cancelled",
  //       completed: currentTaskComplete,
  //       distraction_reasons_selected:
  //         currentReasons.length > 0 ? currentReasons : null,
  //       // Ignore: Future - will allow user to add notes.
  //       cancelled_reason_details: null,
  //     });

  //     // Force sync to Supabase
  //     await SessionService.syncToSupabase();

  //     // Clear all state
  //     setCancelFlowStep(CancelFlowStep.NONE);
  //     setSelectedReasons([]);
  //     setStarRating(null);
  //     setSelectedRestActivity(null);
  //   } catch (error) {
  //     console.error("Error updating session with reflection:", error);
  //     // Clean up UI state even if DB update fails
  //     setCancelFlowStep(CancelFlowStep.NONE);
  //     setSelectedReasons([]);
  //     setStarRating(null);
  //     setSelectedRestActivity(null);
  //   }
  // };

  // const handleSkipSessionReflection = async () => {
  //   if (!currentSession) return;

  //   // Capture current state for task completion
  //   const currentTaskComplete = isTaskComplete;

  //   try {
  //     // Get the current period and session from DB to check latest state
  //     const currentPeriod = await SessionService.getCurrentPeriod();
  //     const dbSession = await SessionService.getSession(currentSession.id);

  //     // Check if session is already completed or cancelled
  //     if (!currentPeriod || !dbSession) {
  //       console.log("Session or period not found, already cleaned up");
  //       setCancelFlowStep(CancelFlowStep.NONE);
  //       setSelectedReasons([]);
  //       setStarRating(null);
  //       setSelectedRestActivity(null);
  //       return;
  //     }

  //     if (
  //       dbSession.status === "completed" ||
  //       dbSession.status === "cancelled"
  //     ) {
  //       console.log("Session already", dbSession.status);
  //       setCancelFlowStep(CancelFlowStep.NONE);
  //       setSelectedReasons([]);
  //       setStarRating(null);
  //       setSelectedRestActivity(null);
  //       return;
  //     }

  //     // Calculate actual duration up to now
  //     const startTime = new Date(currentSession.startTime);
  //     const endTime = new Date();
  //     const actualSeconds = Math.floor(
  //       (endTime.getTime() - startTime.getTime()) / 1000
  //     );

  //     // Clear selected reasons before updating
  //     setSelectedReasons([]);

  //     // Update period with null reflection data
  //     await SessionService.updatePeriod(currentPeriod.id, {
  //       actual_duration_minutes: actualSeconds / 60,
  //       ended_at: new Date().toISOString(),
  //       work_time_completed: currentTaskComplete,
  //     });

  //     // Update session with null reflection data
  //     await SessionService.updateSession(currentSession.id, {
  //       status: currentTaskComplete ? "completed" : "cancelled",
  //       completed: currentTaskComplete,
  //       cancelled_reason_details: "Skipped reflection",
  //       distraction_reasons_selected: null,
  //     });

  //     // Force sync to Supabase
  //     await SessionService.syncToSupabase();

  //     // Call the context's cancelSession to clean up UI state
  //     cancelSession();

  //     // Clear all state
  //     setCancelFlowStep(CancelFlowStep.NONE);
  //     setStarRating(null);
  //     setSelectedRestActivity(null);
  //   } catch (error) {
  //     console.error("Error updating session for skip reflection:", error);
  //     // Clean up UI state even if DB update fails
  //     setCancelFlowStep(CancelFlowStep.NONE);
  //     setSelectedReasons([]);
  //     setStarRating(null);
  //     setSelectedRestActivity(null);
  //   }
  // };

  const toggleReason = async (reason: string) => {
    // Set the selected reason for UI feedback
    setSelectedReasons([reason]);

    // If NONE is selected, handle like skip
    if (reason === "NONE") {
      // Instead of skipping directly to home, go to session complete
      setCancelFlowStep(CancelFlowStep.SESSION_COMPLETE);
      return;
    }

    // For other reasons, go to session complete screen
    setCancelFlowStep(CancelFlowStep.SESSION_COMPLETE);
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
            <View className="flex-1 bg-white justify-center">
              {/* Back button in top left */}
              <View className="absolute left-6 top-12 z-10">
                <TouchableOpacity
                  onPress={() => setCancelFlowStep(CancelFlowStep.NONE)}
                  className="p-2"
                >
                  <FontAwesome name="chevron-left" size={20} color="#000" />
                </TouchableOpacity>
              </View>

              <View className="flex-1 justify-center items-center px-6">
                {/* Simplified header with larger text */}
                <Text className="text-4xl font-medium mb-1">
                  Task <Text className="italic">complete?</Text>
                </Text>

                {/* Only show task description if needed */}
                {currentSession?.taskDescription && (
                  <Text className="text-lg text-center mb-12 max-w-[300px]">
                    {currentSession.taskDescription}
                  </Text>
                )}

                {/* Action buttons with improved styling */}
                <View className="w-full max-w-[350px]">
                  <TouchableOpacity
                    className="bg-black py-4 rounded-md items-center mb-4"
                    onPress={handleTaskComplete}
                  >
                    <Text className="text-white text-base font-medium">
                      YES, I FINISHED MY TASK
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="border border-gray-300 bg-white py-4 rounded-md items-center"
                    onPress={handleTaskIncomplete}
                  >
                    <Text className="text-black text-base font-medium">
                      NO, END CYCLE EARLY
                    </Text>
                  </TouchableOpacity>
                </View>
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
          <RestActivityRatingModal
            visible={true}
            onClose={() => setCancelFlowStep(CancelFlowStep.NONE)}
            onSelectActivity={handleCancelFlowRestRating}
            selectedActivity={selectedRestActivity}
            sessionLabel="REST SESSION"
            isCancelFlow={true}
          />
        );

      case CancelFlowStep.SESSION_COMPLETE:
        return (
          <Modal
            visible={true}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setCancelFlowStep(CancelFlowStep.NONE)}
          >
            <View className="flex-1 bg-white justify-center items-center px-6">
              <View className="w-full max-w-[400px]">
                {/* Header */}
                <Text className="text-3xl text-center font-medium mb-1">
                  You <Text className="italic">locked in</Text>
                </Text>

                {/* Conditional text based on task completion */}
                <Text className="text-center mb-8">
                  {isTaskComplete
                    ? "Well done is better than well said."
                    : "You showed up despite the distractions."}
                </Text>

                {/* Task Summary Box */}
                <View className="bg-gray-200 rounded-xl p-6 mb-8">
                  <Text className="uppercase text-center mb-2 text-xs font-semibold">
                    TASK:
                  </Text>
                  <Text className="text-xl text-center mb-6">
                    {currentSession?.taskDescription ||
                      getProjectName(currentSession?.projectId || "")}
                  </Text>

                  {/* Checkmark if task was completed */}
                  {isTaskComplete && (
                    <View className="absolute top-4 right-4">
                      <View className="bg-yellow-300 rounded-full p-1">
                        <FontAwesome name="check" size={16} color="#000" />
                      </View>
                    </View>
                  )}

                  <View className="flex-row justify-between">
                    <View className="items-center">
                      <Text className="text-3xl font-medium">
                        {formatTimeSummary(deepWorkTime)}
                      </Text>
                      <Text className="text-xs uppercase text-center">
                        DEEP WORK{"\n"}TIME ELAPSED
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-3xl font-medium">
                        {formatTimeSummary(deepRestTime)}
                      </Text>
                      <Text className="text-xs uppercase text-center">
                        DEEP REST{"\n"}TIME ELAPSED
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Conditional notes input */}
                {isNoteExpanded ? (
                  <View className="mb-8">
                    <TextInput
                      className="border border-gray-300 p-4 rounded-lg bg-white"
                      placeholder="Add your reflection note here..."
                      value={sessionNotes}
                      onChangeText={setSessionNotes}
                      multiline
                      numberOfLines={3}
                      maxLength={200}
                      textAlignVertical="top"
                      style={{ minHeight: 80 }}
                      autoFocus={true}
                    />
                    <View className="flex-row justify-end mt-1">
                      <Text className="text-xs text-gray-500">
                        {sessionNotes.length}/200 characters
                      </Text>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="border border-gray-300 py-3 rounded-lg mb-8 bg-white"
                    onPress={() => setIsNoteExpanded(true)}
                  >
                    <Text className="text-center">ADD NOTE...</Text>
                  </TouchableOpacity>
                )}

                {/* Complete Session Button */}
                <TouchableOpacity
                  className="bg-black py-4 rounded-lg"
                  onPress={handleFinalizeSession}
                >
                  <Text className="text-white text-center font-medium">
                    COMPLETE SESSION
                  </Text>
                </TouchableOpacity>
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
            {currentSession?.taskDescription ||
              getProjectName(currentSession?.projectId || "")}
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

  const forceCompleteReset = async () => {
    try {
      console.log("Force Complete Reset");
      // 1. Clear all UI state
      setShowRatingModal(false);
      setShowBreakRatingModal(false);
      setCancelFlowStep(CancelFlowStep.NONE);
      setSelectedReasons([]);
      setStarRating(null);
      setSelectedRestActivity(null);
      setSessionNotes("");
      setIsNoteExpanded(false);
      setIsFullScreen(false);
      setShowStartModal(false);
      setIsCompleteSessionScreen(false);
      setShowExportModal(false);
      setIsTaskComplete(false);
      setDeepWorkTime(0);
      setDeepRestTime(0);

      // 2. Clear AsyncStorage session data
      await AsyncStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_SESSION);
      await AsyncStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_PERIOD);

      // 3. Reset session service state
      await SessionService.setCurrentPeriod(null);
      await SessionService.setCurrentSession(null);

      // 4. Force context reset
      if (cancelSession) {
        await cancelSession();
      }

      // 5. Force refresh analytics
      handleRefresh();

      console.log("❗ forceCompleteReset: Finished");
    } catch (error) {
      console.error("Error during force reset:", error);
      alert("Reset failed: " + error);
    }
  };

  // Helper function for formatting duration in export
  const formatDurationForExport = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleCancelFlowFocusRating = async (rating: number) => {
    if (!currentSession) return;

    // Capture current value to avoid race conditions
    setStarRating(rating);

    try {
      // Get the current period and session
      const currentPeriod = await SessionService.getCurrentPeriod();
      const dbSession = await SessionService.getSession(currentSession.id);

      if (currentPeriod && dbSession) {
        // Calculate actual duration
        const startTime = new Date(currentSession.startTime);
        const endTime = new Date();
        const actualSeconds = Math.floor(
          (endTime.getTime() - startTime.getTime()) / 1000
        );

        // Update period with duration and rating
        console.log("Updating period from handleCancelFlowFocusRating");
        await SessionService.updatePeriod(
          currentPeriod.id,
          {
            actual_duration_minutes: actualSeconds / 60,
            ended_at: new Date().toISOString(),
            quality_rating: rating,
          },
          true
        );
      }
    } catch (error) {
      console.error("Error updating period for cancel flow:", error);
    }

    // Move to reflection step
    setCancelFlowStep(CancelFlowStep.REFLECT);
  };

  // Define the formatTimeSummary function before renderCancelFlow
  const formatTimeSummary = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.floor(minutes)}:00`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours}:${mins.toString().padStart(2, "0")}`;
    }
  };

  // New unified function that replaces both handleSubmitReflection and handleFinalizeSession
  const completeSessionWithReflection = async (options: {
    sessionId: string;
    isTaskComplete: boolean;
    reasons: string[];
    notes?: string;
    rating?: number | null;
    activity?: string | null;
  }) => {
    if (!currentSession) return;

    try {
      // Get the current period and session from DB to check latest state
      const currentPeriod = await SessionService.getCurrentPeriod();
      const dbSession = await SessionService.getSession(options.sessionId);

      // Early return conditions - just log and let finally block handle cleanup
      if (!currentPeriod || !dbSession) {
        console.log("Session or period not found, already cleaned up");
        return;
      }

      if (
        dbSession.status === "completed" ||
        dbSession.status === "cancelled"
      ) {
        console.log("Session already", dbSession.status);
        return;
      }

      // Calculate actual duration up to now
      const startTime = new Date(currentSession.startTime);
      const endTime = new Date();
      const actualSeconds = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );

      // Update period with reflection data
      console.log("Updating period from completeSessionWithReflection");
      await SessionService.updatePeriod(
        currentPeriod.id,
        {
          actual_duration_minutes: actualSeconds / 60,
          ended_at: new Date().toISOString(),
          quality_rating: options.rating || null,
          rest_activities_selected: options.activity
            ? [options.activity]
            : null,
          work_time_completed: options.isTaskComplete,
          user_notes: options.notes || null,
        },
        true
      );

      // Calculate session totals
      const totals = await SessionService.calculateSessionTotals(
        options.sessionId
      );

      // Update session with reflection data and totals
      await SessionService.updateSession(options.sessionId, {
        status: options.isTaskComplete ? "completed" : "cancelled",
        completed: options.isTaskComplete,
        distraction_reasons_selected:
          options.reasons.length > 0 ? options.reasons : null,
        user_notes: options.notes || null,
        total_deep_work_minutes: totals.total_deep_work_minutes,
        total_deep_rest_minutes: totals.total_deep_rest_minutes,
      });

      // Force sync to Supabase
      await SessionService.syncToSupabase();

      // Call the context's cancelSession to clean up UI state
      try {
        await cancelSession();
      } catch (error) {
        console.error("Error cancelling session:", error);
        setError(`Error cancelling session ${error}`);
      }
    } catch (error) {
      console.error("Error completing session with reflection:", error);
    } finally {
      // Always clean up ALL UI state, regardless of success or failure path
      setCancelFlowStep(CancelFlowStep.NONE);
      setSelectedReasons([]);
      setStarRating(null);
      setSelectedRestActivity(null);
      setSessionNotes("");
      setIsNoteExpanded(false);
      setShowRatingModal(false);
      setShowBreakRatingModal(false);
    }
  };

  // Update handleFinalizeSession to use the new SessionService method
  const handleFinalizeSession = async () => {
    if (!currentSession) {
      setCancelFlowStep(CancelFlowStep.NONE);
      return;
    }

    try {
      // First, handle the session completion with reflection in the database
      await completeSessionWithReflection({
        sessionId: currentSession.id,
        isTaskComplete,
        reasons: selectedReasons,
        notes: sessionNotes,
        rating: starRating,
        activity: selectedRestActivity,
      });

      // Then use the new SessionService method to ensure proper cleanup
      await SessionService.completeSessionLifecycle(currentSession.id);

      // Call context's cancelSession to update UI state
      await cancelSession();
    } catch (error) {
      console.error("Error during session finalization:", error);

      // Even if there's an error, attempt to clean up UI state
      setCancelFlowStep(CancelFlowStep.NONE);
      setSelectedReasons([]);
      setStarRating(null);
      setSelectedRestActivity(null);
      setSessionNotes("");
      setIsNoteExpanded(false);
      setShowRatingModal(false);
      setShowBreakRatingModal(false);
    }
  };

  return isFullScreen ? (
    <>
      {error && <Text className="text-red-500">{error}</Text>}
      <FullScreenTimer />
    </>
  ) : (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 20 }}
    >
      <AuthDebugPanel />
      <SessionDebugPanel />

      {/* Debug State */}
      {__DEV__ && (
        <View className="flex-row justify-center">
          <TouchableOpacity
            className="bg-red-600 p-3 rounded-md w-48 m-4"
            onPress={forceCompleteReset}
          >
            <Text className="text-white font-bold text-center">
              Reset State / Storage
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Overview />

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

            {/* Cycle between work and rest depending on the session type */}
            <WorkToRestBtn
              type={currentSession?.type}
              isOvertime={isOvertime}
              setShowRatingModal={setShowRatingModal}
            />

            <RestToWorkBtn
              type={currentSession?.type}
              isOvertime={isOvertime}
              setShowBreakRatingModal={setShowBreakRatingModal}
            />

            <EndCycleEarlyBtn cancelSession={handleCancelSession} />

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

      <RestActivityRatingModal
        visible={showBreakRatingModal}
        onClose={() => setShowBreakRatingModal(false)}
        onSelectActivity={submitRestPeriodWithActivity}
        selectedActivity={selectedRestActivity}
        sessionLabel="REST SESSION"
      />
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
