import React, { createContext, useState, useEffect, useContext } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Platform } from "react-native";

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  refreshSession: async () => {},
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
        console.log("Session refresh result:", !!data.session);
        setSession(data.session);
      }
    } catch (err) {
      console.error("Error in session refresh:", err);
    }
  };

  // Initial session check and subscription setup
  useEffect(() => {
    console.log("AuthProvider initialized");

    const checkSession = async () => {
      try {
        setIsLoading(true);
        console.log("Checking for existing session");

        // Get initial session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        } else {
          console.log("Initial session check:", !!data.session);
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
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    isLoading,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
