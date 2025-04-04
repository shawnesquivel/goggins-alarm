import React from "react";
import { View, Text } from "react-native";
import OnboardingScreen from "./OnboardingScreen";
import { OnboardingScreen as OnboardingScreenType } from "@/contexts/OnboardingContext";
import Auth from "@/components/auth/SupabaseLogin";

interface LoginScreenProps {
  screen: OnboardingScreenType;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack?: () => void;
}

export default function LoginScreen({
  screen,
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: LoginScreenProps) {
  // This is a special case where we're using the OnboardingScreen component as a wrapper
  // but customizing the content to include the Auth component
  return (
    <OnboardingScreen
      screen={screen}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={onNext}
      onBack={onBack}
    >
      <View className="my-2.5">
        <Text className="text-xl font-bold mb-2.5 text-center">
          Sign in to continue
        </Text>
        <Text className="text-base mb-5 text-center text-gray-600">
          Choose your preferred login method
        </Text>
        <Auth isOnboardingFlow={true} />
      </View>
    </OnboardingScreen>
  );
}
