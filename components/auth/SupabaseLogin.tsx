import React, { useEffect, useState } from "react";
import {
  View,
  Alert,
  Platform,
  TouchableOpacity,
  Text,
  TextInput,
} from "react-native";
import { supabase, createUserProfile } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { useOnboarding } from "@/contexts/OnboardingContext";
import * as WebBrowser from "expo-web-browser";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Constants from "expo-constants";
import * as Linking from "expo-linking";

export default function Auth({ isOnboardingFlow = false }) {
  const router = useRouter();
  const { nextScreen, resetOnboarding } = useOnboarding();
  const [email, setEmail] = useState("shawnesquivel24@gmail.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  // Log Supabase configuration on mount
  useEffect(() => {
    console.log("Supabase URL:", Constants.expoConfig?.extra?.supabaseUrl);
    console.log("App URL scheme:", Constants.expoConfig?.scheme);

    // Determine redirect URL based on platform
    const redirectUrl =
      Platform.OS === "web" && typeof window !== "undefined"
        ? `${window.location.origin}/login-callback`
        : Linking.createURL("login-callback");

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
          // Create user profile if needed, then navigate
          createUserProfile()
            .then(() => {
              router.replace("/(tabs)");
            })
            .catch((err) => {
              console.error("Error creating user profile:", err);
              // Still navigate even if profile creation fails
              router.replace("/(tabs)");
            });
        }
      });
    }
  }, [router, isOnboardingFlow]);

  useEffect(() => {
    const debugRedirectUrl =
      Platform.OS === "web" && typeof window !== "undefined"
        ? `${window.location.origin}/login-callback`
        : Linking.createURL("login-callback");

    console.log("OAUTH DEBUG - Platform:", Platform.OS);
    console.log("OAUTH DEBUG - Redirect URL:", debugRedirectUrl);
    console.log(
      "OAUTH DEBUG - Window origin:",
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.origin
        : "N/A"
    );

    console.log("Starting Google sign-in with redirect URL:", debugRedirectUrl);
    console.log("Supabase URL:", Constants.expoConfig?.extra?.supabaseUrl);
  }, []);

  // Helper function to handle post-auth steps
  const handleSuccessfulAuth = async () => {
    try {
      // Try to create user profile
      await createUserProfile();

      // Navigate based on flow
      if (isOnboardingFlow) {
        nextScreen();
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error in post-authentication steps:", error);
      // Still continue with navigation
      if (isOnboardingFlow) {
        nextScreen();
      } else {
        router.replace("/(tabs)");
      }
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Signed in with email:", data.user?.email);
      await handleSuccessfulAuth();
    } catch (error: any) {
      console.error("Email sign-in error:", error);
      Alert.alert(
        "Sign In Error",
        error.message || "Could not sign in with email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user?.identities?.length === 0) {
        Alert.alert(
          "Email Confirmation",
          "A confirmation email has been sent. Please check your inbox."
        );
      } else {
        console.log("Signed up with email:", data.user?.email);
        await handleSuccessfulAuth();
      }
    } catch (error: any) {
      console.error("Email sign-up error:", error);
      Alert.alert(
        "Sign Up Error",
        error.message || "Could not sign up with email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Using localhost:8081 redirect URL which is registered in Google Console
      const redirectUrl =
        Platform.OS === "web" && typeof window !== "undefined"
          ? "http://localhost:8081/login-callback"
          : Linking.createURL("login-callback");

      console.log("OAUTH DEBUG - Platform:", Platform.OS);
      console.log("OAUTH DEBUG - Redirect URL:", redirectUrl);
      console.log(
        "OAUTH DEBUG - Window origin:",
        Platform.OS === "web" && typeof window !== "undefined"
          ? window.location.origin
          : "N/A"
      );

      console.log("Starting Google sign-in with redirect URL:", redirectUrl);
      console.log("Supabase URL:", Constants.expoConfig?.extra?.supabaseUrl);

      // Explicitly use the web client ID
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          scopes: "email profile",
          queryParams: {
            // Force use of the web client ID instead of the iOS one
            client_id:
              "294468100097-e5e9pup377orojsl4ta6orga3n7nkdoq.apps.googleusercontent.com",
            // Help debug OAuth flow
            access_type: "offline",
            prompt: "consent",
            // Add additional debugging parameters
            include_granted_scopes: "true",
          },
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error("OAuth error details:", error);
        throw error;
      }

      if (!data?.url) throw new Error("No auth URL received");

      console.log("OAuth URL received:", data.url);

      if (Platform.OS === "web" && typeof window !== "undefined") {
        // Navigate to the URL
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

        console.log("Auth session result:", result);

        if (result.type === "success") {
          // In production, you might want to implement retry logic
          // instead of a fixed delay
          const maxAttempts = 3;
          for (let i = 0; i < maxAttempts; i++) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              // Create user profile after successful auth
              await handleSuccessfulAuth();
              return;
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

  const handleGoToOnboarding = async () => {
    console.log("Resetting onboarding flow...");
    await resetOnboarding();
    router.replace("/onboarding");
  };

  // Render the email auth form
  const renderEmailForm = () => {
    // Use an actual form element on web for better accessibility
    const EmailForm = Platform.OS === "web" ? "form" : View;
    const formProps =
      Platform.OS === "web"
        ? {
            onSubmit: (e: any) => {
              e.preventDefault();
              mode === "signin" ? handleEmailSignIn() : handleEmailSignUp();
            },
            className: "w-full max-w-md",
          }
        : { className: "w-full max-w-md" };

    return (
      <EmailForm {...formProps}>
        <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </Text>

        <View className="mb-4">
          <TextInput
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete={Platform.OS === "web" ? "email" : "email"}
            editable={!loading}
          />
        </View>

        <View className="mb-6">
          <TextInput
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={
              Platform.OS === "web" ? "current-password" : "password"
            }
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          className={`w-full bg-blue-600 py-3 px-4 rounded-lg items-center mb-4 ${
            loading ? "opacity-70" : ""
          }`}
          onPress={mode === "signin" ? handleEmailSignIn : handleEmailSignUp}
          disabled={loading}
        >
          <Text className="text-white font-semibold text-base">
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Sign In"
              : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mb-6"
        >
          <Text className="text-blue-600 text-center text-sm">
            {mode === "signin"
              ? "Need an account? Sign Up"
              : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </EmailForm>
    );
  };

  return (
    <View className="w-full px-6 items-center">
      {/* Email Authentication Form */}
      {renderEmailForm()}

      {/* Divider */}
      <View className="w-full max-w-md flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-gray-500 font-medium">OR</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Google Sign-In Button */}
      <TouchableOpacity
        className="w-full max-w-md bg-white py-3 px-4 rounded-lg border border-gray-300 mb-8 flex-row items-center justify-center"
        onPress={signInWithGoogle}
      >
        <FontAwesome
          name="google"
          size={20}
          color="#4285F4"
          style={{ marginRight: 12 }}
        />
        <Text className="text-gray-800 font-medium">Continue with Google</Text>
      </TouchableOpacity>

      {/* Go back to onboarding link */}
      <TouchableOpacity onPress={handleGoToOnboarding}>
        <Text className="text-blue-500 text-center text-sm">
          New to Deep Work? Start the tutorial again
        </Text>
      </TouchableOpacity>
    </View>
  );
}
