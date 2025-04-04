import React, { useEffect } from "react";
import { View, Alert, Platform, TouchableOpacity, Text } from "react-native";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { useOnboarding } from "@/contexts/OnboardingContext";
import * as WebBrowser from "expo-web-browser";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function Auth({ isOnboardingFlow = false }) {
  const router = useRouter();
  const { nextScreen } = useOnboarding();

  // Initialize authentication
  useEffect(() => {
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "com.deepwork://login-callback",
        },
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else if (data?.url) {
        // Open the browser for authentication
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
      Alert.alert("Error", error.message || "Error during Google sign in");
      console.error(error);
    }
  };

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
    </View>
  );
}
