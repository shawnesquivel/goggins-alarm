import { CancelFlowStep } from "@/constants/CancelFlowStep";
import { usePomodoro } from "@/contexts/AlarmContext";
import { Modal, View, Text, TouchableOpacity } from "react-native";

interface ConfirmModalProps {
  setCancelFlowStep: (step: CancelFlowStep) => void;
  handleStartReflection: () => void;
}

const ConfirmModal = ({
  setCancelFlowStep,
  handleStartReflection,
}: ConfirmModalProps) => {
  const { currentSession } = usePomodoro();
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
          <Text className="text-4xl italic text-center mb-12">early?</Text>

          <Text className="text-base uppercase text-center mb-2">
            INTENTION TO FINISH:
          </Text>
          <Text className="text-xl text-center mb-10">
            {currentSession?.taskDescription}
          </Text>

          <Text className="text-lg text-center mb-8">
            This task isn't finished. Once you end it, you won't be able to
            resume or undo it.
          </Text>

          <Text className="text-lg text-center mb-12">
            Choose what feels right: stay focused, or reflect and close with
            intention.
          </Text>

          <TouchableOpacity
            className="bg-white py-5 rounded-2xl items-center mb-4"
            onPress={() => setCancelFlowStep(CancelFlowStep.NONE)}
          >
            <Text className="text-black text-lg font-medium">GO BACK</Text>
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
};

export default ConfirmModal;
