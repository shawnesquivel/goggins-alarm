import { Modal, Text, View, TouchableOpacity, TextInput } from "react-native";
import { CancelFlowStep } from "@/constants/CancelFlowStep";
import { usePomodoro } from "@/contexts/AlarmContext";
import { formatTimeSummary } from "@/lib/time";
import FontAwesome from "@expo/vector-icons/build/FontAwesome";

interface SessionCompleteModalProps {
  setCancelFlowStep: (step: CancelFlowStep) => void;
  isTaskComplete: boolean;
  deepWorkTime: number;
  deepRestTime: number;
  isNoteExpanded: boolean;
  sessionNotes: string;
  setSessionNotes: (notes: string) => void;
  handleFinalizeSession: () => void;
  setIsNoteExpanded: (expanded: boolean) => void;
}

const SessionCompleteModal = ({
  setCancelFlowStep,
  isTaskComplete,
  deepWorkTime,
  deepRestTime,
  isNoteExpanded,
  sessionNotes,
  setSessionNotes,
  handleFinalizeSession,
  setIsNoteExpanded,
}: SessionCompleteModalProps) => {
  const { currentSession } = usePomodoro();
  return (
    <Modal
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
              {currentSession?.taskDescription}
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
};

export default SessionCompleteModal;
