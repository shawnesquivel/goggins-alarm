import React, { createContext, useState, useEffect, useContext } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase, cleanupAppStateListener } from "../lib/supabase";
import { Platform } from "react-native";

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  refreshSession: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to manually refresh the session
  const refreshSession = async () => {
    console.log("Manually refreshing session");
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error refreshing session:", error);
      } else {
        setSession(data.session);
      }
    } catch (err) {
      console.error("Error in session refresh:", err);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log("Signing out user...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      } else {
        console.log("User signed out successfully");
        setSession(null);
      }
    } catch (err) {
      console.error("Error in sign out:", err);
    }
  };

  // Initial session check and subscription setup
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);

        // Get initial session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        } else {
          setSession(data.session);
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Handle auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state change event:", event);
      setSession(newSession);

      // For web, we need to handle token refresh differently
      if (Platform.OS === "web" && event === "SIGNED_IN") {
        // Ensure we have the latest session
        setTimeout(() => {
          refreshSession();
        }, 500);
      }
    });

    return () => {
      subscription.unsubscribe();
      cleanupAppStateListener();
    };
  }, []);

  const value = {
    session,
    isLoading,
    refreshSession,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
