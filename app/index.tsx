import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Redirect, useRootNavigationState } from "expo-router";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function InitialRouteScreen() {
  const { isLoading, isOnboarding } = useOnboarding();
  // Get the navigation state to ensure the navigator is ready
  const rootNavigationState = useRootNavigationState();

  console.log("[IndexScreen] Rendering.", {
    isLoading,
    isOnboarding,
    isNavigatorReady: !!rootNavigationState?.key,
  });

  // If navigation system isn't ready yet, return null (or loading indicator)
  if (!rootNavigationState?.key) {
    console.log("[IndexScreen] Navigation not ready yet, waiting...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If still loading onboarding state, show loading indicator
  if (isLoading) {
    console.log("[IndexScreen] Still loading onboarding status...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Now both navigation is ready AND onboarding status is loaded
  // We can safely use the declarative Redirect component

  if (isOnboarding) {
    console.log("[IndexScreen] Navigation ready, redirecting to /onboarding");
    return <Redirect href="/onboarding" />;
  }

  console.log("[IndexScreen] Navigation ready, redirecting to /(tabs)");
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
