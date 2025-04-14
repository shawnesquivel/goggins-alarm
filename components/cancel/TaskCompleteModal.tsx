import { View, TouchableOpacity, Modal, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { usePomodoro } from "@/contexts/AlarmContext";
import { CancelFlowStep } from "@/constants/CancelFlowStep";

interface TaskCompleteModalProps {
  setCancelFlowStep: (step: CancelFlowStep) => void;
  handleTaskComplete: () => void;
  handleTaskIncomplete: () => void;
}

const TaskCompleteModal = ({
  setCancelFlowStep,
  handleTaskComplete,
  handleTaskIncomplete,
}: TaskCompleteModalProps) => {
  const { currentSession } = usePomodoro();
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
};

export default TaskCompleteModal;
