import { useRouter } from "expo-router";
import { View } from "react-native";
import { TouchableOpacity, Text } from "react-native";
import Logout from "../auth/Logout";
import { useAuth } from "@/contexts/AuthContext";

const AuthDebugPanel = () => {
  const { session } = useAuth();
  const router = useRouter();

  if (!__DEV__) return null;

  if (!session) {
    return (
      <View className="p-2.5 m-2.5 bg-gray-100 rounded border border-gray-300">
        <TouchableOpacity
          className="mt-2 bg-red-400 p-1.5 rounded items-center"
          onPress={() => router.push("/login")}
        >
          <Text className="text-white text-xs font-bold">
            Not Logged In: Go to Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return <Logout />;
  }
};

export default AuthDebugPanel;
