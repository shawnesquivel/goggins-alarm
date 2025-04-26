import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import OnboardingScreen from "./OnboardingScreen";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";

interface TrialScreenProps {
  screen: OnboardingScreenType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
}

export default function TrialScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: TrialScreenProps) {
  return (
    <OnboardingScreen
      screen={screen}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={onNext}
      onBack={onBack}
    >
      <View className="my-6 px-2">
        {/* To Do: Link to Revenue Cat */}
        <TouchableOpacity
          className="bg-black rounded-lg py-5 items-center mb-6"
          onPress={onNext}
        >
          <Text className="text-white text-lg font-bold">
            Start 30-Day Free Trial
          </Text>
        </TouchableOpacity>

        <Text className="text-sm text-gray-600 text-center mb-4">
          After the trial ends, you'll be charged $39.99/year.
        </Text>
        <Text className="text-xs text-gray-400 text-center">
          Cancel anytime. 100% satisfaction guaranteed.
        </Text>
      </View>
    </OnboardingScreen>
  );
}
