import { TouchableOpacity, Text, GestureResponderEvent } from "react-native";

interface EndCycleEarlyBtnProps {
  cancelSession: (event: GestureResponderEvent) => void;
}

const EndCycleEarlyBtn = ({ cancelSession }: EndCycleEarlyBtnProps) => {
  return (
    <TouchableOpacity
      className="py-4 px-6 rounded-md items-center w-full mb-3"
      onPress={cancelSession}
    >
      <Text className="text-black text-base">END CYCLE (Cancel Session)</Text>
    </TouchableOpacity>
  );
};

export default EndCycleEarlyBtn;
