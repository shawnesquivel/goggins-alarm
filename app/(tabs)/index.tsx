import { Pressable, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import CurrentTime from "@/components/CurrentTime";
import AlarmModal from "@/components/AlarmModal";
import { useState } from "react";
import SingleAlarm from "@/components/SingleAlarm";
import { useRouter } from "expo-router";
import { useAlarms } from "@/contexts/AlarmContext";
import AlarmTriggerModal from "@/components/AlarmTriggerModal";

export default function AlarmScreen() {
  const router = useRouter();
  const {
    alarms,
    updateAlarm,
    alarmSound,
    isAlarmTriggered,
    setIsAlarmTriggered,
    nextAlarmTime,
  } = useAlarms();

  const defaultAlarm = alarms[0];
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <CurrentTime />
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <View className="flex-1 w-full">
        <View className="px-4 py-2">
          <Text className="text-[#ffffff] text-xl font-bold">Your Alarm</Text>
          {nextAlarmTime && (
            <>
              <Text className="text-[#ff4444] mt-2">
                It's past your alarm time. Your next alarm is in{" "}
                {Math.ceil(
                  (nextAlarmTime.getTime() - new Date().getTime()) / 1000
                )}{" "}
                seconds.
              </Text>
              <Pressable
                onPress={() => router.push("/camera")}
                className="mt-2"
              >
                <Text className="text-[#ffffff] underline-offset-4 underline">
                  Turn off the alarm.
                </Text>
              </Pressable>
            </>
          )}
        </View>
        <SingleAlarm
          alarm={defaultAlarm}
          onPress={() => setIsModalVisible(true)}
        />
      </View>

      <AlarmModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        alarm={defaultAlarm}
        onSave={(time) => updateAlarm({ ...defaultAlarm, time, enabled: true })}
      />

      <AlarmTriggerModal
        visible={isAlarmTriggered}
        onDismiss={() => {
          setIsAlarmTriggered(false);
          alarmSound.stopSound();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  separator: {
    marginVertical: 16,
    height: 1,
    width: "100%",
  },
  alarmContainer: {
    flex: 1,
    width: "100%",
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  warningText: {
    color: "#ffffff",
    fontSize: 20,
    marginBottom: 16,
  },
  photoButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  photoButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
