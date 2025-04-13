import { TouchableOpacity, Text } from "react-native";

interface WorkToRestBtnProps {
  type: "focus" | "break";
  isOvertime: boolean;
  setShowRatingModal: (show: boolean) => void;
}

const WorkToRestBtn = ({
  type,
  isOvertime,
  setShowRatingModal,
}: WorkToRestBtnProps) => {
  if (type !== "focus") return null;

  return (
    <TouchableOpacity
      className="bg-black py-5 px-6 rounded-md items-center w-full mb-4"
      onPress={() => {
        setShowRatingModal(true);
      }}
    >
      <Text className="text-white text-base font-bold">
        {isOvertime ? "START DEEP REST" : "START DEEP REST EARLY"}
      </Text>
    </TouchableOpacity>
  );
};

export default WorkToRestBtn;
