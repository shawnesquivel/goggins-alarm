import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import OnboardingScreen from "./OnboardingScreen";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";
import {
  useFonts,
  LibreCaslonText_400Regular,
} from "@expo-google-fonts/libre-caslon-text";
import { usePomodoro } from "@/contexts/AlarmContext";
import { useRouter } from "expo-router";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface DailyGoalScreenProps {
  screen: OnboardingScreenType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
}

const { width } = Dimensions.get("window");

export default function DailyGoalScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: DailyGoalScreenProps) {
  const { settings, updateSettings } = usePomodoro();
  const [dailyGoal, setDailyGoal] = useState(30); // Default 30 minutes
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const [isNavigating, setIsNavigating] = useState(false);
  const [fontsLoaded] = useFonts({
    LibreCaslonText_400Regular,
  });

  const handleUpdateSettings = async () => {
    if (!isNavigating) {
      setIsNavigating(true);
      try {
        // Update settings first
        updateSettings({
          ...settings,
          dailyGoal,
        });

        // Mark onboarding as complete
        await completeOnboarding();
        console.log("[DailyGoalScreen] Onboarding marked as complete");

        // Navigate to tabs screen with a delay to ensure state updates complete
        setTimeout(() => {
          console.log("[DailyGoalScreen] Navigating to tabs screen");
          try {
            router.replace("/(tabs)");
          } catch (navError) {
            console.error("[DailyGoalScreen] Navigation failed:", navError);
            // Fallback navigation attempt
            setTimeout(() => {
              console.log("[DailyGoalScreen] Attempting fallback navigation");
              router.push("/(tabs)");
            }, 500);
          }
        }, 1000);
      } catch (error) {
        console.error("[DailyGoalScreen] Settings update error:", error);
        setIsNavigating(false);

        // Try to navigate anyway as a fallback
        setTimeout(() => {
          console.log("[DailyGoalScreen] Fallback navigation after error");
          router.replace("/");
        }, 1000);
      }
    }
  };

  const handleUpdateGoal = () => {
    // TODO: Save the daily goal to your app's state/context
    onNext();
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
      <OnboardingScreen
        screen={screen}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleUpdateSettings}
        onBack={onBack}
      >
        <View className="flex-1 justify-center items-center pt-10">
          <View className={`w-[${width * 0.42}px] items-center mb-[60px]`}>
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
                  <Text className="text-sm text-gray-600">MINUTES PER DAY</Text>
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
    </TouchableWithoutFeedback>
  );
}
