import { TouchableOpacity, Text } from "react-native";

interface RestToWorkBtnProps {
  type: "focus" | "break";
  isOvertime: boolean;
  setShowBreakRatingModal: (show: boolean) => void;
}

const RestToWorkBtn = ({
  type,
  isOvertime,
  setShowBreakRatingModal,
}: RestToWorkBtnProps) => {
  if (type !== "break") return null;

  return (
    <TouchableOpacity
      className="bg-black py-5 px-6 rounded-md items-center w-full mb-4"
      onPress={() => {
        setShowBreakRatingModal(true);
      }}
    >
      <Text className="text-white text-base font-bold">
        {isOvertime ? "START DEEP WORK" : "FINISH REST EARLY"}
      </Text>
    </TouchableOpacity>
  );
};

export default RestToWorkBtn;
