import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import AlarmList from "@/components/AlarmList";
import CurrentTime from "@/components/CurrentTime";
import { Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import AlarmModal from "@/components/AlarmModal";
import { useState } from "react";

export default function AlarmScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Goggins Motivational Display */}
      <CurrentTime />
      {/* Separator */}
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      {/* Alarm List Section */}
      <View className="flex-1 w-full">
        <View className="flex-row justify-between items-center px-4 py-2">
          <Text className="text-[#ffffff] text-xl font-bold">Alarms</Text>
          <Pressable onPress={() => setIsModalVisible(true)}>
            <FontAwesome name="plus" size={24} color="#ffffff" />
          </Pressable>
        </View>
        <AlarmList />
      </View>
      {/* Alarm Modal */}
      <AlarmModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
  },
});
