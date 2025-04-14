import TaskCompleteModal from "./TaskCompleteModal";
import { CancelFlowStep } from "@/constants/CancelFlowStep";
import ConfirmModal from "./ConfirmModal";
import ReflectModal from "./ReflectModal";
import RateFocusModal from "./RateFocusModal";
import { RestActivityRatingModal } from "./RestActivityRatingModal";
import SessionCompleteModal from "./SessionCompleteModal";

interface EndEarlyModalProps {
  // Flow Control
  setCancelFlowStep: (step: CancelFlowStep) => void;
  step: CancelFlowStep;
  showBreakRatingModal: boolean;
  setShowBreakRatingModal: (show: boolean) => void;

  // Task State
  isTaskComplete: boolean;
  starRating: number | null;
  selectedRestActivity: string | null;

  // Session Data
  deepWorkTime: number;
  deepRestTime: number;
  isNoteExpanded: boolean;
  sessionNotes: string;

  // Handlers - Task Flow
  handleTaskComplete: () => void;
  handleTaskIncomplete: () => void;
  handleStartReflection: () => void;

  // Handlers - Rating
  handleCancelFlowFocusRating: (rating: number) => Promise<void>;
  handleCancelFlowRestRating: (activity: string) => Promise<void>;

  // Handlers - Session
  handleFinalizeSession: () => Promise<void>;
  setIsNoteExpanded: (expanded: boolean) => void;
  setSessionNotes: (notes: string) => void;
  toggleReason: (reason: string) => void;
}

const EndEarlyModal = ({
  setCancelFlowStep,
  step,
  isTaskComplete,
  handleTaskComplete,
  handleTaskIncomplete,
  handleStartReflection,
  handleCancelFlowFocusRating,
  handleCancelFlowRestRating,
  handleFinalizeSession,
  setIsNoteExpanded,
  setSessionNotes,
  toggleReason,
  starRating,
  selectedRestActivity,
  deepWorkTime,
  deepRestTime,
  isNoteExpanded,
  sessionNotes,
  showBreakRatingModal,
  setShowBreakRatingModal,
}: EndEarlyModalProps) => {
  switch (step) {
    case CancelFlowStep.TASK_COMPLETE:
      return (
        <TaskCompleteModal
          setCancelFlowStep={setCancelFlowStep}
          handleTaskComplete={handleTaskComplete}
          handleTaskIncomplete={handleTaskIncomplete}
        />
      );

    case CancelFlowStep.CONFIRM:
      return (
        <ConfirmModal
          setCancelFlowStep={setCancelFlowStep}
          handleStartReflection={handleStartReflection}
        />
      );

    case CancelFlowStep.REFLECT:
      return (
        <ReflectModal
          setCancelFlowStep={setCancelFlowStep}
          toggleReason={toggleReason}
          isTaskComplete={isTaskComplete}
        />
      );

    case CancelFlowStep.RATE_FOCUS:
      return (
        <RateFocusModal
          setCancelFlowStep={setCancelFlowStep}
          handleCancelFlowFocusRating={handleCancelFlowFocusRating}
          starRating={starRating}
        />
      );

    case CancelFlowStep.RATE_REST:
      return (
        <RestActivityRatingModal
          visible={showBreakRatingModal}
          onClose={() => setShowBreakRatingModal(false)}
          onSelectActivity={handleCancelFlowRestRating}
          selectedActivity={selectedRestActivity}
          sessionLabel="REST SESSION"
        />
      );

    case CancelFlowStep.SESSION_COMPLETE:
      return (
        <SessionCompleteModal
          setCancelFlowStep={setCancelFlowStep}
          handleFinalizeSession={handleFinalizeSession}
          isTaskComplete={isTaskComplete}
          deepWorkTime={deepWorkTime}
          deepRestTime={deepRestTime}
          isNoteExpanded={isNoteExpanded}
          sessionNotes={sessionNotes}
          setSessionNotes={setSessionNotes}
          setIsNoteExpanded={setIsNoteExpanded}
        />
      );

    default:
      return null;
  }
};

export default EndEarlyModal;
