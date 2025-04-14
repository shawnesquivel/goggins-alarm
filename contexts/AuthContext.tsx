import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
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
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isVisible = useRef(true);

  // Function to log refresh timing
  const logRefreshTiming = (event?: string) => {
    const now = new Date();
    if (lastRefreshTime) {
      const timeSinceLastRefresh =
        (now.getTime() - lastRefreshTime.getTime()) / 1000;
      if (timeSinceLastRefresh > 5) {
        console.log(
          `[Auth] Event: ${
            event || "REFRESH"
          }, Time since last refresh: ${timeSinceLastRefresh.toFixed(
            2
          )} seconds`
        );
        console.log(`[Auth] Session refreshed at: ${now.toLocaleTimeString()}`);
        setLastRefreshTime(now);
      }
    } else {
      console.log(`[Auth] Event: ${event || "REFRESH"}, First refresh`);
      console.log(`[Auth] Session refreshed at: ${now.toLocaleTimeString()}`);
      setLastRefreshTime(now);
    }
  };

  // Function to handle auth state changes with debounce
  const handleAuthChange = (event: string, newSession: Session | null) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      // Skip events if app is not visible
      if (!isVisible.current) {
        console.log(`[Auth] Skipping event ${event} - app not visible`);
        return;
      }

      const now = new Date();
      if (
        lastRefreshTime &&
        (now.getTime() - lastRefreshTime.getTime()) / 1000 < 5
      ) {
        console.log(
          `[Auth] Skipping event ${event} - too soon since last refresh`
        );
        return;
      }

      // Skip INITIAL_SESSION after initialization
      if (event === "INITIAL_SESSION" && isInitialized) {
        console.log("[Auth] Skipping INITIAL_SESSION after initialization");
        return;
      }

      // For the first SIGNED_IN event, treat it as the initial session
      if (event === "SIGNED_IN" && !isInitialized) {
        console.log(
          `[Auth] Auth state change event: ${event} (Initial session)`
        );
        setSession(newSession);
        logRefreshTiming("INITIAL_SESSION");
        setIsInitialized(true);
        return;
      }

      console.log(`[Auth] Auth state change event: ${event}`);
      setSession(newSession);
      logRefreshTiming(event);
    }, 100); // 100ms debounce
  };

  // Handle visibility changes
  useEffect(() => {
    if (Platform.OS === "web") {
      const handleVisibilityChange = () => {
        isVisible.current = !document.hidden;
        if (isVisible.current) {
          console.log("[Auth] App became visible");
        } else {
          console.log("[Auth] App became hidden");
          // Clear any pending auth changes
          if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
          }
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, []);

  // Function to manually refresh the session
  const refreshSession = async () => {
    const now = new Date();
    if (
      lastRefreshTime &&
      (now.getTime() - lastRefreshTime.getTime()) / 1000 < 5
    ) {
      console.log("[Auth] Skipping refresh - too soon since last refresh");
      return;
    }

    console.log("[Auth] Manual refresh requested");
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("[Auth] Error refreshing session:", error);
      } else {
        setSession(data.session);
        logRefreshTiming("MANUAL_REFRESH");
      }
    } catch (err) {
      console.error("[Auth] Error in session refresh:", err);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log("[Auth] Signing out user...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[Auth] Error signing out:", error);
      } else {
        console.log("[Auth] User signed out successfully");
        setSession(null);
      }
    } catch (err) {
      console.error("[Auth] Error in sign out:", err);
    }
  };

  // Initial session check and subscription setup
  useEffect(() => {
    let isMounted = true;
    let authStateSubscription: {
      data: { subscription: { unsubscribe: () => void } };
    } | null = null;

    const checkSession = async () => {
      try {
        setIsLoading(true);

        // Get initial session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[Auth] Error getting session:", error);
        } else if (isMounted) {
          setSession(data.session);
          // Don't log INITIAL_SESSION here - let the onAuthStateChange handle it
          setIsInitialized(true);
        }
      } catch (err) {
        console.error("[Auth] Session check error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // Handle auth state changes
    authStateSubscription = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        handleAuthChange(event, newSession);
      }
    );

    return () => {
      isMounted = false;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (authStateSubscription?.data?.subscription) {
        authStateSubscription.data.subscription.unsubscribe();
      }
      cleanupAppStateListener();
    };
  }, [lastRefreshTime, isInitialized]);

  const value = {
    session,
    isLoading,
    refreshSession,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
