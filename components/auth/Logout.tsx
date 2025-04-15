import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

const Logout = () => {
  const { session } = useAuth();
  if (!session) return null;
  return (
    <View className="p-2.5 m-2.5 bg-gray-100 rounded border border-gray-300">
      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center space-x-2">
          <Text className="text-xs font-mono">
            User: {session.user.email} ({session.user.id.substring(0, 8)})
          </Text>
        </View>
        <TouchableOpacity
          className="bg-red-400 px-3 py-1 rounded"
          onPress={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
        >
          <Text className="text-white text-xs font-bold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Logout;
