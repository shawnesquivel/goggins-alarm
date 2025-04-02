import React from "react";
import { View, StyleSheet } from "react-native";
import Onboarding from "@/components/onboarding/Onboarding";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const { isOnboarding } = useOnboarding();
  const router = useRouter();

  // If onboarding is complete, redirect to main app
  React.useEffect(() => {
    if (!isOnboarding) {
      router.replace("/");
    }
  }, [isOnboarding, router]);

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
