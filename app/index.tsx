import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect, useRootNavigationState } from "expo-router";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";

export default function InitialRouteScreen() {
  const { isOnboarding } = useOnboarding();
  const { session, isLoading: isAuthLoading } = useAuth();
  // Get the navigation state to ensure the navigator is ready
  const rootNavigationState = useRootNavigationState();

  // If navigation system isn't ready yet, return null (or loading indicator)
  if (!rootNavigationState?.key) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If still loading auth status, show loading indicator
  if (isAuthLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Now both navigation is ready AND status is loaded
  // We can safely use the declarative Redirect component

  if (isOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // Only check auth if onboarding is complete
  // Allow unauthenticated users to access the app after skipping onboarding
  if (!session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(tabs)" />;
}
