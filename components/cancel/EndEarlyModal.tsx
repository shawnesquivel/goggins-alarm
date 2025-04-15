import TaskCompleteModal from "./TaskCompleteModal";
import { CancelFlowStep } from "@/constants/CancelFlowStep";
import ConfirmModal from "./ConfirmModal";
import ReflectModal from "./ReflectModal";
import FocusRatingModal from "@/components/shared/modals/FocusRatingModal";
import { RestActivityRatingModal } from "@/components/shared/modals/RestActivityRatingModal";
import SessionCompleteModal from "./SessionCompleteModal";

interface EndEarlyModalProps {
  // Flow Control
  setCancelFlowStep: (step: CancelFlowStep) => void;
  step: CancelFlowStep;

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
        <FocusRatingModal
          onClose={() => setCancelFlowStep(CancelFlowStep.NONE)}
          onSubmitRating={handleCancelFlowFocusRating}
          starRating={starRating}
          mode="cancel"
        />
      );

    case CancelFlowStep.RATE_REST:
      return (
        <RestActivityRatingModal
          onClose={() => setCancelFlowStep(CancelFlowStep.NONE)}
          onSelectActivity={handleCancelFlowRestRating}
          selectedActivity={selectedRestActivity}
          mode="cancel"
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
