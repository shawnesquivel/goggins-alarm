import { Modal, View, Text, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { usePomodoro } from "@/contexts/AlarmContext";
import {
  CancelFlowStep,
  distractionReasonIcons,
} from "@/constants/CancelFlowStep";

interface ReflectModalProps {
  setCancelFlowStep: (step: CancelFlowStep) => void;
  isTaskComplete: boolean;
  toggleReason: (reason: string) => void;
}

const ReflectModal = ({
  setCancelFlowStep,
  isTaskComplete,
  toggleReason,
}: ReflectModalProps) => {
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
          <Text className="text-4xl text-center mb-2">Take a moment</Text>
          <Text className="text-4xl italic text-center mb-12">to reflect:</Text>

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
          {distractionReasonIcons.map((reason) => (
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
};

export default ReflectModal;
