import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "expo-router";
import StartSessionModal from "@/components/shared/modals/StartSessionModal";
import {
  useFonts,
  LibreCaslonText_400Regular,
} from "@expo-google-fonts/libre-caslon-text";
import { useAuth } from "@/contexts/AuthContext";
import SessionDebugPanel from "@/components/debug/SessionDebugPanel";
import { format } from "date-fns";
import { ExportModal } from "@/components/shared/modals/ExportModal";
import { HeaderRight } from "@/components/shared/HeaderRight";
import { SessionService } from "@/services/SessionService";
import useAnalytics from "@/app/hooks/useAnalytics";
import Overview from "@/components/cycle/Overview";
import AuthDebugPanel from "@/components/debug/AuthDebugPanel";
import EndEarlyModal from "@/components/cancel/EndEarlyModal";
import { CancelFlowStep } from "@/constants/CancelFlowStep";
import { formatTimeDisplay, formatDurationForExport } from "@/lib/time";
import WorkToRestBtn from "@/components/cycle/WorkToRestBtn";
import RestToWorkBtn from "@/components/cycle/RestToWorkBtn";
import EndCycleEarlyBtn from "@/components/cycle/EndCycleEarlyBtn";
import { RestActivityRatingModal } from "@/components/shared/modals/RestActivityRatingModal";
import FocusRatingModal from "@/components/shared/modals/FocusRatingModal";
import OvertimeInfo from "@/components/cycle/OvertimeInfo";

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
            {currentSession?.taskDescription || ""}
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
              {formatTimeDisplay(remainingSeconds, isOvertime)}
            </Text>
          </View>

          {/* Overtime info */}
          {isOvertime && (
            <OvertimeInfo
              duration={currentSession?.duration || 0}
              remainingSeconds={remainingSeconds}
            />
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
              {currentSession.taskDescription || ""}
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
                {formatTimeDisplay(remainingSeconds, isOvertime)}
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
              <OvertimeInfo
                duration={currentSession?.duration || 0}
                remainingSeconds={remainingSeconds}
              />
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

      {/* Rating Modals for normal flow */}
      {showRatingModal && (
        <FocusRatingModal
          onClose={() => setShowRatingModal(false)}
          onSubmitRating={handleSubmitWithRating}
          starRating={starRating}
          mode="normal"
        />
      )}

      {showBreakRatingModal && (
        <RestActivityRatingModal
          onClose={() => setShowBreakRatingModal(false)}
          onSelectActivity={submitRestPeriodWithActivity}
          selectedActivity={selectedRestActivity}
          mode="normal"
        />
      )}

      {/* End Early Modal */}
      <EndEarlyModal
        setCancelFlowStep={setCancelFlowStep}
        step={cancelFlowStep}
        isTaskComplete={isTaskComplete}
        handleTaskComplete={handleTaskComplete}
        handleTaskIncomplete={handleTaskIncomplete}
        handleStartReflection={handleStartReflection}
        handleCancelFlowFocusRating={handleCancelFlowFocusRating}
        handleCancelFlowRestRating={handleCancelFlowRestRating}
        handleFinalizeSession={handleFinalizeSession}
        setIsNoteExpanded={setIsNoteExpanded}
        setSessionNotes={setSessionNotes}
        toggleReason={toggleReason}
        starRating={starRating}
        selectedRestActivity={selectedRestActivity}
        deepWorkTime={deepWorkTime}
        deepRestTime={deepRestTime}
        isNoteExpanded={isNoteExpanded}
        sessionNotes={sessionNotes}
      />

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          userName={session?.user?.email?.split("@")[0] || "User"}
          durationInMinutes={currentSession?.duration || 0}
        />
      )}
    </ScrollView>
  );
}
