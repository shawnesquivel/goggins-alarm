import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
  SafeAreaView,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { resetOnboarding } = useOnboarding();
  const { settings, updateSettings } = usePomodoro();
  const { signOut } = useAuth();
  const [showRestartModal, setShowRestartModal] = useState(false);

  const [soundEnabled, setSoundEnabled] = React.useState(
    settings.soundEnabled ?? true
  );
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(
    settings.notificationsEnabled ?? true
  );

  const handleConfirmRestart = async () => {
    try {
      console.log("[SettingsScreen] Calling resetOnboarding...");
      await resetOnboarding();
      console.log(
        "[SettingsScreen] resetOnboarding finished. Navigating to onboarding..."
      );
      setShowRestartModal(false);
      router.push("/onboarding");
    } catch (error) {
      console.error("[SettingsScreen] Error in resetOnboarding:", error);
    }
  };

  const toggleSound = (value: boolean) => {
    setSoundEnabled(value);
    updateSettings({
      ...settings,
      soundEnabled: value,
    });
  };

  const toggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    updateSettings({
      ...settings,
      notificationsEnabled: value,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f0]">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-sm text-gray-600 uppercase">
            ACCOUNT SETTINGS
          </Text>
          <View className="flex-row items-baseline">
            <Text className="text-4xl font-bold">How can we </Text>
            <Text className="text-4xl font-bold italic">help</Text>
            <Text className="text-4xl font-bold">?</Text>
          </View>
        </View>

        {/* Settings Options */}
        <View className="space-y-3">
          <SettingButton
            title="EDIT PROJECTS LIST"
            onPress={() => router.navigate("/projects")}
          />

          <SettingButton
            title="TIMER PREFERENCES"
            onPress={() => router.navigate("/onboarding")}
          />

          <SettingButton
            title="TUTORIAL"
            onPress={() => setShowRestartModal(true)}
          />

          <SettingButton
            title="BILLING"
            onPress={() => console.log("Billing pressed")}
          />

          <SettingButton title="LOG OUT" onPress={signOut} />
        </View>

        {/* Report a Problem */}
        <View className="mt-32 items-center">
          <TouchableOpacity>
            <Text className="text-gray-700 uppercase text-sm">
              REPORT A PROBLEM
            </Text>
          </TouchableOpacity>
        </View>

        {/* Debug Section */}
        <View className="mt-8 p-4 border-t border-gray-200">
          <Text className="text-lg font-semibold mb-4">Debug Options</Text>

          <View className="space-y-3">
            <SettingButton
              title="Restart Onboarding"
              onPress={() => setShowRestartModal(true)}
            />

            <View className="flex-row justify-between items-center bg-white p-4 rounded-md">
              <Text>Sound Alerts</Text>
              <Switch value={soundEnabled} onValueChange={toggleSound} />
            </View>

            <View className="flex-row justify-between items-center bg-white p-4 rounded-md">
              <Text>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showRestartModal}
        onRequestClose={() => setShowRestartModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-xl p-6 w-[80%] items-center">
            <Text className="text-xl font-bold mb-3 text-center">
              Restart Onboarding
            </Text>
            <Text className="text-base mb-5 text-center text-gray-600">
              Are you sure you want to restart the onboarding process?
            </Text>
            <View className="flex-row justify-between w-full">
              <TouchableOpacity
                className="flex-1 py-3 bg-gray-100 rounded-lg mx-1"
                onPress={() => setShowRestartModal(false)}
              >
                <Text className="text-gray-700 text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 bg-black rounded-lg mx-1"
                onPress={handleConfirmRestart}
              >
                <Text className="text-white text-center font-semibold">
                  Yes, Restart
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Setting Button Component
function SettingButton({ title, onPress }) {
  return (
    <TouchableOpacity
      className="bg-white py-4 px-5 rounded-md"
      onPress={onPress}
    >
      <Text className="text-black font-medium">{title}</Text>
    </TouchableOpacity>
  );
}
