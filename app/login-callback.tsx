import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { session, refreshSession } = useAuth();
  const segments = useSegments();
  const [status, setStatus] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    console.log("Auth callback page loaded");
    console.log("Current URL hash:", window.location.hash);
    console.log("Full URL:", window.location.href);

    // Display URL parameters for debugging
    const urlParams = new URLSearchParams(window.location.search);
    const urlHash = new URLSearchParams(window.location.hash.replace("#", "?"));

    // Collect all parameters for debugging
    const allParams: Record<string, any> = {};
    urlParams.forEach((value, key) => {
      allParams[key] = value;
    });
    urlHash.forEach((value, key) => {
      allParams[key] = value;
    });

    setDebugInfo(allParams);

    // Handle error parameters
    const errorParam = urlParams.get("error") || urlHash.get("error");
    if (errorParam) {
      const errorDesc =
        urlParams.get("error_description") ||
        urlHash.get("error_description") ||
        "Unknown error";
      const errorCode =
        urlParams.get("error_code") || urlHash.get("error_code") || "unknown";

      console.error("Error in OAuth flow:", errorParam);
      console.error("Error description:", errorDesc);
      console.error("Error code:", errorCode);

      setError(`OAuth Error: ${errorParam} (${errorCode})\n${errorDesc}`);

      // Try to recover by redirecting back to login after a delay
      setTimeout(() => {
        router.replace("/login");
      }, 5000);

      return;
    }

    const handleAuthCallback = async () => {
      try {
        // Check for a code in the URL
        const code = urlParams.get("code");
        if (code) {
          setStatus(`Found authorization code: ${code.substring(0, 8)}...`);
          console.log("Found authorization code:", code);

          // Let Supabase handle the code (this is automatic for most cases)
          // If needed, we could manually implement the token exchange here
        }

        // Handle hash fragment for OAuth callbacks
        if (
          window.location.hash &&
          window.location.hash.includes("access_token")
        ) {
          setStatus("Found access token in URL hash");
          console.log("Found access token in URL hash, setting session");

          // Get the token from the hash
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1) // remove the # at the start
          );

          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          console.log("Access token found:", accessToken ? "Yes" : "No");
          console.log("Refresh token found:", refreshToken ? "Yes" : "No");

          if (accessToken && refreshToken) {
            setStatus("Setting session from tokens");
            console.log("Setting session from tokens");
            // Set the session manually if needed
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

            if (sessionError) {
              console.error("Error setting session:", sessionError);
              setError(`Error setting session: ${sessionError.message}`);
              return;
            }

            console.log(
              "Session set successfully:",
              sessionData.session?.user.email
            );
          }
        } else {
          console.log("No access token found in URL hash");
          setStatus("No access token found in URL hash");
        }

        // Give a moment for the session to be established
        setStatus("Waiting for session to establish...");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Explicitly refresh the session
        setStatus("Refreshing session...");
        await refreshSession();

        // Now check for the session again
        const { data, error } = await supabase.auth.getSession();
        console.log("Session data after refresh:", data);

        if (error) {
          console.error("Error getting session:", error);
          setError(`Error getting session: ${error.message}`);
          setTimeout(() => router.replace("/login"), 3000);
          return;
        }

        // Check if we're coming from onboarding
        const isFromOnboarding = segments.includes("onboarding");

        // Redirect to the appropriate screen
        if (data.session) {
          setStatus("Found session, redirecting...");
          console.log("Found session, redirecting...");

          setTimeout(() => {
            if (isFromOnboarding) {
              router.replace("/onboarding");
            } else {
              router.replace("/(tabs)");
            }
          }, 1000);
        } else {
          // If no session, redirect to login page
          setStatus("No session found, redirecting to login");
          console.log(
            "No session found after all checks, redirecting to login"
          );
          setTimeout(() => router.replace("/login"), 3000);
        }
      } catch (err: any) {
        console.error("Error in auth callback:", err);
        setError(`Auth callback error: ${err.message}`);
        setTimeout(() => router.replace("/login"), 3000);
      }
    };

    // Only proceed with auth callback if no error was detected
    if (!errorParam) {
      handleAuthCallback();
    }
  }, [router, refreshSession]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <ActivityIndicator size="large" color="#000" />
      <Text style={{ marginTop: 20, fontSize: 18, fontWeight: "bold" }}>
        {status}
      </Text>

      {error && (
        <ScrollView
          style={{
            maxHeight: 300,
            marginTop: 20,
            width: "100%",
            padding: 10,
            backgroundColor: "#ffeeee",
          }}
        >
          <Text style={{ color: "red", marginBottom: 10, fontWeight: "bold" }}>
            Error occurred:
          </Text>
          <Text style={{ color: "red" }}>{error}</Text>
          <Text style={{ marginTop: 20, color: "gray" }}>
            Redirecting to login page...
          </Text>
        </ScrollView>
      )}

      {/* Debug Info Section */}
      {Object.keys(debugInfo).length > 0 && (
        <ScrollView
          style={{
            maxHeight: 200,
            marginTop: 20,
            width: "100%",
            padding: 10,
            backgroundColor: "#f0f0f0",
          }}
        >
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Debug Information:
          </Text>
          {Object.entries(debugInfo).map(([key, value]) => (
            <Text key={key} style={{ fontSize: 12 }}>
              <Text style={{ fontWeight: "bold" }}>{key}:</Text> {String(value)}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
