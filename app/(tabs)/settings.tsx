import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function SettingsScreen() {
  const router = useRouter();
  const { resetOnboarding } = useOnboarding();
  const { settings, updateSettings } = usePomodoro();

  const [soundEnabled, setSoundEnabled] = React.useState(
    settings.soundEnabled ?? true
  );
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(
    settings.notificationsEnabled ?? true
  );

  const restartOnboarding = () => {
    Alert.alert(
      "Restart Onboarding",
      "Are you sure you want to restart the onboarding process?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Restart",
          onPress: async () => {
            console.log("[SettingsScreen] Calling resetOnboarding...");
            await resetOnboarding();
            console.log(
              "[SettingsScreen] resetOnboarding finished. AppNavigationController will handle navigation."
            );
          },
        },
      ]
    );
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
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timer Settings</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sound Alerts</Text>
          <Switch value={soundEnabled} onValueChange={toggleSound} />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timer Durations</Text>
        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => router.navigate("/onboarding")}
        >
          <View style={styles.settingButtonContent}>
            <Text style={styles.settingButtonText}>Adjust Timer Durations</Text>
            <FontAwesome name="chevron-right" size={16} color="#999" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={restartOnboarding}
        >
          <View style={styles.settingButtonContent}>
            <Text style={styles.settingButtonText}>Restart Onboarding</Text>
            <FontAwesome name="chevron-right" size={16} color="#999" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingButton}>
          <View style={styles.settingButtonContent}>
            <Text style={styles.settingButtonText}>About</Text>
            <FontAwesome name="chevron-right" size={16} color="#999" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    backgroundColor: "#fff",
    marginVertical: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
  },
  settingButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingButtonText: {
    fontSize: 16,
    color: "#333",
  },
});
