import React from "react";
import { View, StyleSheet } from "react-native";
import Onboarding from "@/components/onboarding/Onboarding";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const { isOnboarding } = useOnboarding();
  const router = useRouter();

  console.log("[OnboardingScreen] Rendering. isOnboarding:", isOnboarding);

  // Only render content if onboarding is actually active
  if (!isOnboarding) {
    console.log(
      "[OnboardingScreen] Not rendering content because isOnboarding is false."
    );
    return null;
  }

  return (
    <View style={styles.container}>
      <Onboarding />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
});
