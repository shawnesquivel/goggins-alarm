import { AppState } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

export function getSupabaseKeys() {
  /**
   * Fetch the keys from app.config
   */
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase URL or anonymous key. Please check your environment variables."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}
if (__DEV__) {
  console.log(
    "Constants.expoConfig:",
    JSON.stringify(Constants.expoConfig?.extra?.supabaseUrl, null, 2),
    "Constants.expoConfig.extra.supabaseAnonKey:",
    JSON.stringify(Constants.expoConfig?.extra?.supabaseAnonKey, null, 2)
  );
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
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

// Helper functions for database operations
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
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
