import { supabase } from "@/lib/supabase";
import { SessionService } from "./SessionService";
import { format } from "date-fns";

export const AnalyticsService = {
  async getUserDailyGoal(): Promise<number> {
    try {
      // Query user's daily goal from Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data } = await supabase
          .from("users")
          .select("daily_goal_minutes")
          .eq("id", authData.user.id)
          .single();

        if (data && data.daily_goal_minutes) {
          return data.daily_goal_minutes;
        }
      }

      // Default value if no user or no setting
      return 60;
    } catch (error) {
      console.error("Error getting user daily goal:", error);
      return 60; // Default to 60 minutes
    }
  },

  async getTodayStats(): Promise<{
    totalDeepWork: string; // formatted as h:mm:ss
    deepWorkSessions: number;
    deepWorkMinutes: number;
    deepRestSessions: number;
    deepRestMinutes: number;
    goalProgressPercentage: number;
  }> {
    // Get today's date range in user's local timezone
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    let periods = [];

    // Get periods from Supabase if authenticated
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      try {
        // Query periods directly, not sessions
        const { data } = await supabase
          .from("periods")
          .select("*, sessions!inner(user_id, status)")
          .eq("sessions.user_id", authData.user.id)
          .neq("sessions.status", "cancelled")
          .gte("created_at", startOfDay)
          .lte("created_at", endOfDay);

        if (data) periods = data;
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    }

    // Calculate metrics at period level
    const workPeriods = periods.filter(
      (p) => p.type === "work" && p.work_time_completed === true
    ).length;

    const workMinutes = periods
      .filter((p) => p.type === "work" && p.work_time_completed === true)
      .reduce((sum, p) => sum + (p.actual_duration_minutes || 0), 0);

    // Similar for rest periods...

    // Format total deep work time
    const hours = Math.floor(workMinutes / 60);
    const minutes = Math.floor(workMinutes % 60);
    const seconds = Math.round((workMinutes * 60) % 60);
    const formattedTotal = `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    // Get daily goal and calculate percentage
    const dailyGoal = await this.getUserDailyGoal();
    const goalPercentage = Math.min(
      100,
      Math.round((workMinutes / dailyGoal) * 100)
    );

    // Add these calculations before the return statement
    const restPeriods = periods.filter(
      (p) => p.type === "rest" && p.actual_duration_minutes !== null
    ).length;

    const restMinutes = periods
      .filter((p) => p.type === "rest" && p.actual_duration_minutes !== null)
      .reduce((sum, p) => sum + (p.actual_duration_minutes || 0), 0);

    // Then update the return statement
    return {
      totalDeepWork: formattedTotal,
      deepWorkSessions: workPeriods,
      deepWorkMinutes: Math.round(workMinutes),
      deepRestSessions: restPeriods, // Use calculated value
      deepRestMinutes: Math.round(restMinutes), // Use calculated value
      goalProgressPercentage: goalPercentage,
    };
  },

  async forceRefresh(): Promise<void> {
    // Force sync local data to Supabase first
    await SessionService.syncToSupabase(true);
  },
};
