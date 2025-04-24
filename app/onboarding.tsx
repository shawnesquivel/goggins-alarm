import React from "react";
import { View } from "react-native";
import Onboarding from "@/components/onboarding/Onboarding";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function OnboardingScreen() {
  const { isOnboarding } = useOnboarding();

  // Only render content if onboarding is actually active
  if (!isOnboarding) {
    return null;
  }

  return (
    <View className="flex-1 bg-[#f8f8f8]">
      <Onboarding />
    </View>
  );
}
