import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, Redirect } from "expo-router";
import Auth from "../components/auth/SupabaseLogin";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  // If loading, don't render anything yet
  if (isLoading) {
    return null;
  }

  // If already authenticated, redirect to the main app
  if (session) {
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
