import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import { OnboardingScreenType } from "@/contexts/OnboardingContext";
import { useAccountSetup } from "@/contexts/AccountSetupContext";
import { supabase } from "@/lib/supabase";
import { usePomodoro } from "@/contexts/AlarmContext";
import OnboardingScreen from "@/components/onboarding/OnboardingScreen";
import {
  useFonts,
  LibreCaslonText_400Regular,
} from "@expo-google-fonts/libre-caslon-text";
import { TextInput } from "react-native";

/**
 * AccountSetupDailyGoal component for setting the user's daily goal
 * during the account setup process
 */
export default function AccountSetupDailyGoal() {
  const { nextStep } = useAccountSetup();
  const { settings, updateSettings } = usePomodoro();
  const [dailyGoal, setDailyGoal] = useState(30); // Default 30 minutes
  const [isSaving, setIsSaving] = useState(false);
  const [fontsLoaded] = useFonts({
    LibreCaslonText_400Regular,
  });

  // Mock screen object to pass to OnboardingScreen
  const mockScreen = {
    id: "setup3",
    type: OnboardingScreenType.SETUP,
    title: "Set your daily intention goal.",
    description:
      "We highly recommend starting at 30-60min per day.\n\nYou can change any time.",
  };

  // Function to verify the daily goal was saved correctly
  const verifyDailyGoalSaved = async (userId: string) => {
    try {
      // Fetch the user's record from the database
      const { data: user, error } = await supabase
        .from("users")
        .select("daily_goal_minutes")
        .eq("id", userId)
        .single();

      if (error) {
        console.error(
          "[AccountSetupDailyGoal] Error fetching user data:",
          error
        );
        return;
      }

      // Log the saved value
      console.log(
        "[AccountSetupDailyGoal] VERIFICATION - Daily goal in database:",
        user?.daily_goal_minutes
      );

      // Check if the saved value matches the expected value
      if (user?.daily_goal_minutes === dailyGoal) {
        console.log(
          "[AccountSetupDailyGoal] VERIFICATION SUCCESSFUL: Daily goal saved correctly"
        );
      } else {
        console.warn(
          "[AccountSetupDailyGoal] VERIFICATION FAILED: Daily goal not saved correctly",
          {
            expectedValue: dailyGoal,
            actualValue: user?.daily_goal_minutes,
          }
        );
      }
    } catch (error) {
      console.error(
        "[AccountSetupDailyGoal] Error during verification:",
        error
      );
    }
  };

  const handleSaveDailyGoal = async () => {
    console.log("[AccountSetupDailyGoal] Setting daily goal to:", dailyGoal);
    setIsSaving(true);

    try {
      // Update local settings via Pomodoro context
      updateSettings({
        ...settings,
        dailyGoal,
      });

      // Save to database
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const userId = sessionData.session.user.id;

        console.log(
          "[AccountSetupDailyGoal] Updating user record with daily_goal_minutes:",
          dailyGoal
        );

        // Update the user's daily_goal_minutes in the database
        const { error } = await supabase
          .from("users")
          .update({ daily_goal_minutes: dailyGoal })
          .eq("id", userId);

        if (error) {
          console.error(
            "[AccountSetupDailyGoal] Error saving daily goal:",
            error
          );
          // Continue anyway since we've updated local state
        } else {
          console.log(
            "[AccountSetupDailyGoal] Successfully saved daily goal to database"
          );

          // Verify the daily goal was saved correctly
          await verifyDailyGoalSaved(userId);
        }
      }

      // Move to next step in account setup flow
      nextStep();
    } catch (error) {
      console.error(
        "[AccountSetupDailyGoal] Error during daily goal setup:",
        error
      );
      // Continue to next step anyway to avoid blocking the user
      nextStep();
    } finally {
      setIsSaving(false);
    }
  };

  const incrementGoal = () => {
    setDailyGoal((prev) => {
      // If less than 60 minutes, increment by 15
      if (prev < 60) {
        return Math.min(prev + 15, 720);
      }
      // If between 1-12 hours, increment by 30
      return Math.min(prev + 30, 720);
    });
  };

  const decrementGoal = () => {
    setDailyGoal((prev) => {
      // If more than 60 minutes, decrement by 30
      if (prev > 60) {
        return Math.max(prev - 30, 15);
      }
      // If less than 60 minutes, decrement by 15
      return Math.max(prev - 15, 15);
    });
  };

  const handleGoalChange = (text: string) => {
    if (text === "") {
      setDailyGoal(0);
      return;
    }

    const value = parseInt(text);
    if (!isNaN(value)) {
      if (text.length === 3) {
        setDailyGoal(Math.min(Math.max(value, 15), 720)); // Max 12 hours (720 minutes)
      } else {
        setDailyGoal(value);
      }
    }
  };

  // Calculate hours and format with 1 decimal place
  const hoursPerDay = (dailyGoal / 60).toFixed(1);

  if (!fontsLoaded) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <OnboardingScreen
          screen={mockScreen}
          currentStep={1}
          totalSteps={3}
          onNext={handleSaveDailyGoal}
        >
          <View className="flex-1 justify-center items-center pt-10">
            <View style={styles.contentWrapper}>
              <View className="flex-col items-center">
                <TouchableOpacity
                  className="w-11 h-11 rounded-full justify-center items-center my-2"
                  onPress={incrementGoal}
                  activeOpacity={0.7}
                >
                  <Text className="text-2xl font-bold text-gray-700">+</Text>
                </TouchableOpacity>

                <View className="w-[150px] h-[150px] bg-white rounded-xl justify-center items-center">
                  <TextInput
                    className="text-[64px] font-bold w-full text-center p-0"
                    style={{ fontFamily: "LibreCaslonText_400Regular" }}
                    value={dailyGoal === 0 ? "" : dailyGoal.toString()}
                    onChangeText={handleGoalChange}
                    keyboardType="number-pad"
                    maxLength={3}
                    textAlign="center"
                    selectTextOnFocus
                  />
                  <View className="items-center">
                    <Text className="text-sm text-gray-600">
                      MINUTES PER DAY
                    </Text>
                    <Text className="text-xs text-gray-400 mt-0.5">
                      ({hoursPerDay} hrs per day)
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  className="w-11 h-11 rounded-full justify-center items-center my-2"
                  onPress={decrementGoal}
                  activeOpacity={0.7}
                >
                  <Text className="text-2xl font-bold text-gray-700">−</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </OnboardingScreen>

        {isSaving && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Saving your daily goal...</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  contentWrapper: {
    width: width * 0.42,
    alignItems: "center",
    marginBottom: 60,
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
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
});
