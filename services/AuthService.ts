import { supabase, createUserProfile } from "@/lib/supabase";

/**
 * Service for handling authentication-related operations
 */
export const AuthService = {
  /**
   * Get the current authenticated user or null if not authenticated
   */
  async getCurrentUser() {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.user || null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  /**
   * Get the current authenticated user ID or null if not authenticated
   */
  async getCurrentUserId() {
    const user = await this.getCurrentUser();
    return user?.id || null;
  },

  /**
   * Subscribe to auth state changes
   * @param callback Function called when auth state changes
   * @returns Subscription that should be unsubscribed when no longer needed
   */
  onAuthStateChange(callback: (user: any, event: string) => void) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      // If the user just signed in or token refreshed, ensure user profile exists
      if (
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
        session?.user
      ) {
        try {
          await createUserProfile();
        } catch (error) {
          console.error(
            "Error creating user profile during auth state change:",
            error
          );
        }
      }

      callback(session?.user || null, event);
    });
    return data.subscription;
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Create user profile if needed
    if (data.session?.user) {
      try {
        await createUserProfile();
      } catch (profileError) {
        console.error(
          "Error creating user profile after sign in:",
          profileError
        );
        // Continue even if profile creation fails
      }
    }

    return data;
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Create user profile if needed
    // Note: For email confirmation flows, this might happen before user is fully confirmed
    if (data.user) {
      try {
        await createUserProfile();
      } catch (profileError) {
        console.error(
          "Error creating user profile after sign up:",
          profileError
        );
        // Continue even if profile creation fails
      }
    }

    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },
};
