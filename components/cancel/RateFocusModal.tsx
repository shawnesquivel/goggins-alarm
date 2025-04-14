import { CancelFlowStep } from "@/constants/CancelFlowStep";
import { usePomodoro } from "@/contexts/AlarmContext";
import { Modal, Text, View, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface RateFocusModalProps {
  setCancelFlowStep: (step: CancelFlowStep) => void;
  handleCancelFlowFocusRating: (rating: number) => void;
  starRating: number | null;
}

const RateFocusModal = ({
  setCancelFlowStep,
  handleCancelFlowFocusRating,
  starRating,
}: RateFocusModalProps) => {
  const { currentSession } = usePomodoro();

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
                onPress={() => handleCancelFlowFocusRating(star)}
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
            Enter a rating.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default RateFocusModal;
