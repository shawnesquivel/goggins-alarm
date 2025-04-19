import { supabase } from "@/lib/supabase";
import { SessionService } from "./SessionService";
import { Session } from "@/types/session";
import { startOfWeek, endOfWeek } from "date-fns";

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

      console.warn("No user or daily goal found, using default: 60 minutes");
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
          .in("sessions.status", ["completed", "cancelled"])
          .gte("created_at", startOfDay)
          .lte("created_at", endOfDay);

        if (data) periods = data;
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    }

    // Calculate metrics at period level
    const workPeriods = periods.filter((p) => p.type === "work").length;

    const workMinutes = periods
      .filter((p) => p.type === "work")
      .reduce((sum, p) => sum + (p.actual_duration_minutes || 0), 0);

    // Format total deep work time
    const hours = Math.floor(workMinutes / 60);
    const minutes = Math.floor(workMinutes % 60);
    const seconds = Math.floor((workMinutes * 60) % 60);
    const formattedTotal = `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    // Get daily goal and calculate percentage
    const dailyGoal = await this.getUserDailyGoal();
    const goalPercentage = Math.round((workMinutes / dailyGoal) * 100);

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
      deepWorkMinutes: workMinutes,
      deepRestSessions: restPeriods,
      deepRestMinutes: restMinutes,
      goalProgressPercentage: goalPercentage,
    };
  },

  async getRestStats(
    timeframe: "day" | "week" | "month" = "week",
    selectedDate?: Date
  ): Promise<{
    totalSessions: number;
    totalMinutes: number;
  }> {
    // Get date range based on timeframe and selectedDate
    let now = selectedDate || new Date();
    let startDate = new Date(now);

    switch (timeframe) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        // Always use Sunday to Saturday
        startDate = startOfWeek(now);
        now = endOfWeek(now);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return { totalSessions: 0, totalMinutes: 0 };

      // Query sessions table directly for rest periods
      const { data: sessions, error } = await supabase
        .from("sessions")
        .select("total_deep_rest_minutes")
        .eq("user_id", authData.user.id)
        .in("status", ["completed", "cancelled"])
        .gt("total_deep_rest_minutes", 0)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", now.toISOString());

      if (!sessions) return { totalSessions: 0, totalMinutes: 0 };

      const totalMinutes = sessions.reduce((sum, session) => {
        // Force to number and preserve decimal precision
        const minutes = parseFloat(session.total_deep_rest_minutes) || 0;
        return sum + minutes;
      }, 0);

      return {
        totalSessions: sessions.length,
        totalMinutes: totalMinutes,
      };
    } catch (error) {
      console.error("Error getting rest stats:", error);
      return { totalSessions: 0, totalMinutes: 0 };
    }
  },

  async forceRefresh(): Promise<void> {
    // Force sync local data to Supabase first
    await SessionService.syncToSupabase(true);
  },

  async getProjectTimeStats(
    timeframe: "day" | "week" | "month" = "week",
    selectedDate?: Date
  ): Promise<
    {
      projectId: string;
      name: string;
      color: string;
      totalMinutes: number;
    }[]
  > {
    // Get date range based on timeframe and selectedDate
    let now = selectedDate || new Date();
    let startDate = new Date(now);

    switch (timeframe) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        // Always use Sunday to Saturday
        startDate = startOfWeek(now);
        now = endOfWeek(now);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Get authenticated user
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return [];

    try {
      // Get project stats directly from sessions table
      const { data: projectStats } = await supabase
        .from("sessions")
        .select(
          `
          id,
          project_id,
          total_deep_work_minutes
        `
        )
        .eq("user_id", authData.user.id)
        .in("status", ["completed", "cancelled"])
        .gte("created_at", startDate.toISOString())
        .lte("created_at", now.toISOString());

      if (!projectStats || projectStats.length === 0) return [];

      // Get all referenced projects
      const projectIds = projectStats
        .filter((session) => session.project_id)
        .map((session) => session.project_id);

      // If no project IDs, return empty array
      if (projectIds.length === 0) return [];

      // Fetch project data in a separate query
      const { data: projectData } = await supabase
        .from("projects")
        .select("id, name, color")
        .in("id", projectIds);

      // Create a lookup map for projects
      const projectsMap = (projectData || []).reduce<
        Record<string, { name: string; color: string }>
      >((acc, project) => {
        acc[project.id] = {
          name: project.name,
          color: project.color || "#808080",
        };
        return acc;
      }, {});

      // Aggregate by project
      const aggregatedStats = projectStats.reduce(
        (acc, session) => {
          if (!session.project_id) return acc;

          const projectInfo = projectsMap[session.project_id];

          if (!acc[session.project_id]) {
            acc[session.project_id] = {
              projectId: session.project_id,
              name: projectInfo ? projectInfo.name : "Unknown Project",
              color: projectInfo ? projectInfo.color : "#808080",
              totalMinutes: 0,
            };
          }

          // Parse as float and don't round
          const minutes = parseFloat(session.total_deep_work_minutes) || 0;
          acc[session.project_id].totalMinutes += minutes;

          return acc;
        },
        {} as Record<
          string,
          {
            projectId: string;
            name: string;
            color: string;
            totalMinutes: number;
          }
        >
      );

      return Object.values(aggregatedStats);
    } catch (error) {
      console.error("Error fetching project stats:", error);
      return [];
    }
  },

  async getRecentSessions(limit: number = 20): Promise<Session[]> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return [];

      // Fetch recent sessions with projects information
      const { data, error } = await supabase
        .from("sessions")
        .select(
          `
          id, 
          task, 
          total_deep_work_minutes, 
          created_at, 
          status,
          project_id,
          project:project_id(id, name, color)
        `
        )
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching recent sessions:", error);
        return [];
      }

      // Transform data to match Session type
      return (data || []).map((session) => {
        return {
          id: session.id,
          task: session.task,
          total_deep_work_minutes: session.total_deep_work_minutes,
          created_at: session.created_at,
          status: session.status,
          project_id: session.project_id,
          project: session.project
            ? Array.isArray(session.project)
              ? session.project.length > 0
                ? {
                    name: session.project[0].name,
                    color: session.project[0].color || "#808080",
                  }
                : undefined
              : {
                  name: (session.project as any).name,
                  color: (session.project as any).color || "#808080",
                }
            : undefined,
        };
      });
    } catch (error) {
      console.error("Error in getRecentSessions:", error);
      return [];
    }
  },
};
