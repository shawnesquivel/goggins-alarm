import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Redirect, useRootNavigationState } from "expo-router";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";

export default function InitialRouteScreen() {
  const { isLoading: isOnboardingLoading, isOnboarding } = useOnboarding();
  const { session, isLoading: isAuthLoading } = useAuth();
  // Get the navigation state to ensure the navigator is ready
  const rootNavigationState = useRootNavigationState();

  const isLoading = isOnboardingLoading || isAuthLoading;

  console.log("[IndexScreen] Rendering.", {
    isLoading,
    isOnboarding,
    isAuthenticated: !!session,
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

  // If still loading status, show loading indicator
  if (isLoading) {
    console.log("[IndexScreen] Still loading status...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Now both navigation is ready AND status is loaded
  // We can safely use the declarative Redirect component

  if (isOnboarding) {
    console.log("[IndexScreen] Navigation ready, redirecting to /onboarding");
    return <Redirect href="/onboarding" />;
  }

  // Only check auth if onboarding is complete
  if (!session) {
    console.log("[IndexScreen] Not authenticated, redirecting to /login");
    return <Redirect href="/login" />;
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
