import React from "react";
import { View } from "react-native";
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
      <View className="my-4">
        <Auth isOnboardingFlow={true} />
      </View>
    </OnboardingScreen>
  );
}
