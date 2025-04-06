import React, { useEffect } from "react";
import {
  View,
  Alert,
  Platform,
  TouchableOpacity,
  Text,
  Linking as RNLinking,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { useOnboarding } from "@/contexts/OnboardingContext";
import * as WebBrowser from "expo-web-browser";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Constants from "expo-constants";
import * as Linking from "expo-linking";

export default function Auth({ isOnboardingFlow = false }) {
  const router = useRouter();
  const { nextScreen, resetOnboarding } = useOnboarding();

  // Log Supabase configuration on mount
  useEffect(() => {
    console.log("Supabase URL:", Constants.expoConfig?.extra?.supabaseUrl);
    console.log("App URL scheme:", Constants.expoConfig?.scheme);

    // Determine redirect URL based on platform
    const redirectUrl = Platform.select({
      web: `${window.location.origin}/login-callback`,
      default: Linking.createURL("login-callback"),
    });
    console.log("Redirect URL:", redirectUrl);

    // Check if we can reach Supabase
    fetch(`${Constants.expoConfig?.extra?.supabaseUrl}/auth/v1/health`)
      .then((response) => response.json())
      .then((data) => console.log("Supabase health check:", data))
      .catch((error) => console.error("Cannot reach Supabase:", error));

    // Check for existing session if not in onboarding flow
    if (!isOnboardingFlow) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace("/(tabs)");
        }
      });
    }
  }, [router, isOnboardingFlow]);

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = Platform.select({
        web: `${window.location.origin}/login-callback`,
        default: Linking.createURL("login-callback"),
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          // Only skip browser redirect for development
          skipBrowserRedirect: __DEV__,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No auth URL received");

      if (Platform.OS === "web") {
        window.location.href = data.url;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
          {
            showInRecents: true,
            createTask: true,
          }
        );

        if (result.type === "success") {
          // In production, you might want to implement retry logic
          // instead of a fixed delay
          const maxAttempts = 3;
          for (let i = 0; i < maxAttempts; i++) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              return isOnboardingFlow
                ? nextScreen()
                : router.replace("/(tabs)");
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          throw new Error("Failed to get session after successful auth");
        }
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      Alert.alert(
        "Authentication Error",
        "Could not complete sign in. Please try again."
      );
    }
  };

  // Apple sign-in unchanged
  const signInWithApple = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: "com.deepwork://login-callback",
        },
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          "com.deepwork://login-callback"
        );

        if (result.type === "success") {
          // Handle successful authentication
          const { data: sessionData } = await supabase.auth.getSession();

          if (sessionData.session) {
            if (isOnboardingFlow) {
              nextScreen();
            } else {
              router.replace("/(tabs)");
            }
          }
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error during Apple sign in");
      console.error(error);
    }
  };

  const handleGoToOnboarding = async () => {
    console.log("Resetting onboarding flow...");
    await resetOnboarding();
    router.replace("/onboarding");
  };

  return (
    <View className="mt-10 px-3 items-center">
      {/* Google Sign-In Button */}
      <TouchableOpacity
        className="bg-white py-3 px-4 rounded-lg border border-gray-300 mb-4 flex-row items-center w-64 justify-center"
        onPress={signInWithGoogle}
      >
        <FontAwesome
          name="google"
          size={24}
          color="#4285F4"
          style={{ marginRight: 12 }}
        />
        <Text className="text-gray-800 font-medium">Sign in with Google</Text>
      </TouchableOpacity>

      {/* Apple Sign-In Button (shown only on iOS) */}
      {Platform.OS === "ios" && (
        <TouchableOpacity
          className="bg-black py-3 px-4 rounded-lg mb-4 flex-row items-center w-64 justify-center"
          onPress={signInWithApple}
        >
          <FontAwesome
            name="apple"
            size={24}
            color="white"
            style={{ marginRight: 12 }}
          />
          <Text className="text-white font-medium">Sign in with Apple</Text>
        </TouchableOpacity>
      )}

      {/* Go back to onboarding link */}
      <TouchableOpacity className="mt-8" onPress={handleGoToOnboarding}>
        <Text className="text-blue-500 text-center">
          New to Deep Work? Start the tutorial again
        </Text>
      </TouchableOpacity>
    </View>
  );
}
