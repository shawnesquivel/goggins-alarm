import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { usePomodoro } from "@/contexts/AlarmContext";
import { useAccountSetup } from "@/contexts/AccountSetupContext";
import { supabase } from "@/lib/supabase";
import {
  useFonts,
  LibreCaslonText_400Regular,
} from "@expo-google-fonts/libre-caslon-text";

/**
 * AccountSetupTimer component for setting up the user's timer preferences
 * during the account setup process
 */
export default function AccountSetupTimer() {
  const { settings, updateSettings } = usePomodoro();
  const { nextStep } = useAccountSetup();
  const [focusDuration, setFocusDuration] = useState(30);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [fontsLoaded] = useFonts({
    LibreCaslonText_400Regular,
  });

  // Function to verify the timer settings were saved correctly
  const verifyTimerSettingsSaved = async (userId: string) => {
    try {
      // Fetch the user record from the database
      const { data, error } = await supabase
        .from("users")
        .select("default_deep_work_minutes, default_deep_rest_minutes")
        .eq("id", userId)
        .single();

      if (error) {
        console.error(
          "[AccountSetupTimer] Error fetching user data for verification:",
          error
        );
        return;
      }

      // Log the saved timer settings
      console.log(
        "[AccountSetupTimer] VERIFICATION - Timer settings in database:",
        {
          default_deep_work_minutes: data.default_deep_work_minutes,
          default_deep_rest_minutes: data.default_deep_rest_minutes,
        }
      );

      // Check if the saved values match the expected values
      if (
        data &&
        data.default_deep_work_minutes === focusDuration &&
        data.default_deep_rest_minutes === breakDuration
      ) {
        console.log(
          "[AccountSetupTimer] VERIFICATION SUCCESSFUL: Timer settings saved correctly"
        );
      } else {
        console.warn(
          "[AccountSetupTimer] VERIFICATION FAILED: Timer settings mismatch",
          {
            expectedValues: {
              default_deep_work_minutes: focusDuration,
              default_deep_rest_minutes: breakDuration,
            },
            actualValues: {
              default_deep_work_minutes: data?.default_deep_work_minutes,
              default_deep_rest_minutes: data?.default_deep_rest_minutes,
            },
          }
        );
      }
    } catch (error) {
      console.error("[AccountSetupTimer] Error during verification:", error);
    }
  };

  const handleSaveTimerSettings = async () => {
    console.log("[AccountSetupTimer] Saving timer settings:", {
      focusDuration,
      breakDuration,
    });
    setIsSaving(true);

    try {
      // Update local settings via Pomodoro context
      updateSettings({
        ...settings,
        focusDuration,
        breakDuration,
      });

      // Save to database
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const userId = sessionData.session.user.id;

        console.log(
          "[AccountSetupTimer] Updating user record with timer settings:",
          { focusDuration, breakDuration }
        );

        // Update the user's timer settings in the database
        const { error } = await supabase
          .from("users")
          .update({
            default_deep_work_minutes: focusDuration,
            default_deep_rest_minutes: breakDuration,
          })
          .eq("id", userId);

        if (error) {
          console.error(
            "[AccountSetupTimer] Error saving timer settings:",
            error
          );
          // Continue anyway since we've updated local state
        } else {
          console.log(
            "[AccountSetupTimer] Successfully saved timer settings to database"
          );

          // Verify the timer settings were saved correctly
          await verifyTimerSettingsSaved(userId);
        }
      }

      // Move to next step in account setup flow
      nextStep();
    } catch (error) {
      console.error(
        "[AccountSetupTimer] Error during timer settings setup:",
        error
      );
      // Continue to next step anyway to avoid blocking the user
      nextStep();
    } finally {
      setIsSaving(false);
    }
  };

  const incrementFocus = () => {
    setFocusDuration((prev) => Math.min(prev + 5, 180));
  };

  const decrementFocus = () => {
    setFocusDuration((prev) => Math.max(prev - 5, 5));
  };

  const incrementBreak = () => {
    setBreakDuration((prev) => Math.min(prev + 5, 60));
  };

  const decrementBreak = () => {
    setBreakDuration((prev) => Math.max(prev - 5, 5));
  };

  const handleFocusDurationChange = (text: string) => {
    // Allow empty input
    if (text === "") {
      setFocusDuration(0);
      return;
    }

    const value = parseInt(text);
    if (!isNaN(value)) {
      // Only apply min/max when the input is complete (reached max length)
      if (text.length === 3) {
        setFocusDuration(Math.min(Math.max(value, 5), 180));
      } else {
        // Allow any number while typing
        setFocusDuration(value);
      }
    }
  };

  const handleBreakDurationChange = (text: string) => {
    // Allow empty input
    if (text === "") {
      setBreakDuration(0);
      return;
    }

    const value = parseInt(text);
    if (!isNaN(value)) {
      // Only apply min/max when the input is complete (reached max length)
      if (text.length === 2) {
        setBreakDuration(Math.min(Math.max(value, 5), 60));
      } else {
        // Allow any number while typing
        setBreakDuration(value);
      }
    }
  };

  if (!fontsLoaded) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Set Your Default Timer</Text>
          <Text style={styles.subtitle}>
            You can always adjust these for each session
          </Text>
        </View>

        <View style={styles.timersContainer}>
          {/* Deep Work section */}
          <View style={styles.timerSection}>
            <Text style={styles.sectionTitle}>Deep Work</Text>
            <View style={styles.timerContent}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={incrementFocus}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>

              <View style={styles.timerBox}>
                <TextInput
                  style={[
                    styles.timeValue,
                    { fontFamily: "LibreCaslonText_400Regular" },
                  ]}
                  value={focusDuration === 0 ? "" : focusDuration.toString()}
                  onChangeText={handleFocusDurationChange}
                  keyboardType="number-pad"
                  maxLength={3}
                  textAlign="center"
                  selectTextOnFocus
                />
                <Text style={styles.timeUnit}>MINUTES</Text>
                {focusDuration >= 60 && (
                  <Text style={styles.hoursText}>
                    ({(focusDuration / 60).toFixed(1)} hrs)
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={decrementFocus}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>−</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Deep Rest section */}
          <View style={styles.timerSection}>
            <Text style={styles.sectionTitle}>Deep Rest</Text>
            <View style={styles.timerContent}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={incrementBreak}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>

              <View style={[styles.timerBox, styles.restBox]}>
                <TextInput
                  style={[
                    styles.timeValue,
                    { fontFamily: "LibreCaslonText_400Regular" },
                  ]}
                  value={breakDuration === 0 ? "" : breakDuration.toString()}
                  onChangeText={handleBreakDurationChange}
                  keyboardType="number-pad"
                  maxLength={2}
                  textAlign="center"
                  selectTextOnFocus
                />
                <Text style={styles.timeUnit}>MINUTES</Text>
              </View>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={decrementBreak}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>−</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveTimerSettings}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        {isSaving && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Saving your settings...</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  timersContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 60,
  },
  timerSection: {
    alignItems: "center",
    width: "42%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
  },
  timerContent: {
    flexDirection: "column",
    alignItems: "center",
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  timerBox: {
    width: 150,
    height: 150,
    backgroundColor: "white",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  restBox: {
    backgroundColor: "#DDDAD0",
  },
  timeValue: {
    fontSize: 64,
    fontWeight: "bold",
    width: "100%",
    textAlign: "center",
    padding: 0,
  },
  timeUnit: {
    fontSize: 14,
    color: "#505050",
    marginTop: 4,
  },
  hoursText: {
    fontSize: 14,
    color: "#505050",
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: "black",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
});
