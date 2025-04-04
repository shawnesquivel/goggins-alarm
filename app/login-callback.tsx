import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { session, refreshSession } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    console.log("Auth callback page loaded");

    const handleAuthCallback = async () => {
      try {
        // Handle hash fragment for OAuth callbacks
        if (
          window.location.hash &&
          window.location.hash.includes("access_token")
        ) {
          console.log("Found access token in URL hash, setting session");

          // Get the token from the hash
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1) // remove the # at the start
          );

          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            console.log("Setting session from tokens");
            // Set the session manually if needed
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }

        // Give a moment for the session to be established
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Explicitly refresh the session
        await refreshSession();

        // Now check for the session again
        const { data, error } = await supabase.auth.getSession();
        console.log("Session data after refresh:", data);

        if (error) {
          console.error("Error getting session:", error);
          router.replace("/login");
          return;
        }

        // Check if we're coming from onboarding
        const isFromOnboarding = segments.includes("onboarding");

        // Redirect to the appropriate screen
        if (data.session) {
          console.log("Found session, redirecting...");

          if (isFromOnboarding) {
            router.replace("/onboarding");
          } else {
            router.replace("/(tabs)");
          }
        } else {
          // If no session, redirect to login page
          console.log(
            "No session found after all checks, redirecting to login"
          );
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        router.replace("/login");
      }
    };

    handleAuthCallback();
  }, [router, refreshSession]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={{ marginTop: 20 }}>Finishing login...</Text>
    </View>
  );
}
