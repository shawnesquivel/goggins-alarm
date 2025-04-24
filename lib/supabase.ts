import { AppState } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

export function getSupabaseKeys() {
  /**
   * Fetch the keys from app.config
   */
  const supabaseUrl = "https://jsgqekncltjwfjggntvx.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZ3Fla25jbHRqd2ZqZ2dudHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzQ0NTYsImV4cCI6MjA1OTI1MDQ1Nn0.xlf0cZzkJwzRpWFvTGbK55EiiJKEWuztlec7Y2_Xwkw";

  if (!supabaseUrl || !supabaseAnonKey) {
    if (__DEV__) {
      console.info({ supabaseUrl, supabaseAnonKey });
    }
    throw new Error(
      "Missing Supabase URL or anonymous key. Please check your environment variables."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

const { supabaseUrl, supabaseAnonKey } = getSupabaseKeys();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
let appStateSubscription: { remove: () => void } | null = null;

try {
  appStateSubscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
} catch (error) {
  console.error("Error setting up AppState listener:", error);
}

// Cleanup function to remove the AppState listener
export function cleanupAppStateListener() {
  if (appStateSubscription) {
    try {
      appStateSubscription.remove();
      appStateSubscription = null;
    } catch (error) {
      console.error("Error cleaning up AppState listener:", error);
    }
  }
}

// Helper functions for database operations
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Creates a user profile in the public.users table for the authenticated user
 * This should be called after successful authentication to ensure the foreign key
 * constraint for projects and other related tables is satisfied
 */
export async function createUserProfile() {
  try {
    // Get the authenticated user
    const user = await getCurrentUser();

    if (!user) {
      console.log("No authenticated user found");
      return null;
    }

    // Check if a profile already exists for this user
    const { data: existingProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      console.log("User profile already exists:", existingProfile.id);
      return existingProfile;
    }

    // Create a new profile
    console.log("Creating user profile for:", user.id);
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }

    console.log("User profile created successfully:", data.id);
    return data;
  } catch (error) {
    console.error("Error in createUserProfile:", error);
    throw error;
  }
}

// Projects
export async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Sessions
export async function getSessions(projectId?: string) {
  let query = supabase
    .from("sessions")
    .select("*, project:projects(*)")
    .order("created_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Periods
export async function getPeriods(sessionId: string) {
  const { data, error } = await supabase
    .from("periods")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

// Analytics
export async function getDailyAnalytics(startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from("daily_analytics")
    .select("*")
    .gte("day", startDate.toISOString().split("T")[0])
    .lte("day", endDate.toISOString().split("T")[0])
    .order("day", { ascending: true });

  if (error) throw error;
  return data;
}

export async function checkConnection() {
  /**
   * Test Supabase connnection with a simple query.
   */
  try {
    const testClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    const { data: usersData, error: usersError } = await testClient
      .from("users")
      .select("id")
      .limit(1);

    if (usersError) {
      console.error(
        "Test connection failed: Users table query failed:",
        usersError
      );
    }

    return true;
  } catch (error) {
    if (__DEV__) {
      console.log(
        "[supabase.ts]: Couldn't connect. Keys: ",
        supabaseUrl,
        supabaseAnonKey
      );
    }

    console.error(
      "Supabase connection check failed. Check database status with `npx supabase status`",
      error
    );
    return false;
  }
}
