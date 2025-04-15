import { usePomodoro } from "@/contexts/AlarmContext";
import { FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, Modal } from "react-native";

interface FocusRatingModalProps {
  onClose: () => void;
  onSubmitRating: (rating: number) => void;
  starRating: number | null;
  mode: "normal" | "cancel";
}

const FocusRatingModal = ({
  onClose,
  onSubmitRating,
  starRating,
  mode,
}: FocusRatingModalProps) => {
  const { currentSession } = usePomodoro();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white justify-center items-center">
        <View className="w-full max-w-[400px] px-8">
          {/* Back arrow in top left corner */}
          <View className="absolute left-4 top-4">
            <TouchableOpacity onPress={onClose} className="p-2">
              <FontAwesome name="chevron-left" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <Text className="text-4xl text-center mb-1">Rate your</Text>
          <Text className="text-4xl italic text-center mb-8">Deep Work</Text>

          <Text className="text-sm uppercase text-center mb-2">TASK:</Text>
          <Text className="text-lg text-center mb-12">
            {currentSession?.taskDescription || ""}
          </Text>

          {/* Star Rating */}
          <View className="flex-row justify-center mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => onSubmitRating(star)}
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
            {mode === "normal"
              ? "Rate to continue to Deep Rest"
              : "Rate to end session"}
          </Text>

          {/* Time Elapsed */}
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
  );
};

export default FocusRatingModal;
