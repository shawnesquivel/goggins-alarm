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
  const { nextScreen } = useOnboarding();

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
      console.log("Starting Google sign-in process");

      // Determine proper redirect URL based on platform
      const redirectUrl = Platform.select({
        web: `${window.location.origin}/login-callback`,
        default: Linking.createURL("login-callback"),
      });

      console.log("Using redirect URL:", redirectUrl);

      // Try the OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      console.log("OAuth response:", { data, error });

      if (error) {
        console.error("OAuth error:", error);
        Alert.alert("Error", error.message);
      } else if (data?.url) {
        console.log("Auth URL:", data.url);

        // Handle differently based on platform
        if (Platform.OS === "web") {
          // For web, just navigate to the URL
          window.location.href = data.url;
        } else {
          // For native, use the WebBrowser
          try {
            const result = await WebBrowser.openAuthSessionAsync(
              data.url,
              redirectUrl
            );

            console.log("Auth session result:", result);

            if (result.type === "success") {
              console.log("Auth success from browser");
              const { data: sessionData } = await supabase.auth.getSession();

              if (sessionData.session) {
                if (isOnboardingFlow) {
                  nextScreen();
                } else {
                  router.replace("/(tabs)");
                }
              }
            }
          } catch (browserError) {
            console.error("Browser error:", browserError);
            Alert.alert("Error", "Could not open the authentication page.");
          }
        }
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
      Alert.alert("Error", error.message || "Error during Google sign in");
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
