import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, Redirect } from "expo-router";
import Auth from "../components/auth/SupabaseLogin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  // Add debug logging
  useEffect(() => {
    console.log("Login screen rendered, session state:", !!session);
    console.log("Auth loading state:", isLoading);

    // Double-check session
    supabase.auth.getSession().then(({ data, error }) => {
      console.log("Direct session check:", data);
      if (error) console.error("Session check error:", error);

      if (data.session) {
        console.log("Valid session found directly from Supabase");
      }
    });
  }, [session, isLoading]);

  // If loading, don't render anything yet
  if (isLoading) {
    return null;
  }

  // If already authenticated, redirect to the main app
  if (session) {
    console.log("Session detected, redirecting to main app");
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <Auth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
