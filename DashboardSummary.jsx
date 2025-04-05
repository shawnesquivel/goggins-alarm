import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // Import your configured client

const DashboardSummary = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Fetch user profile data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (userError) throw userError;

        // Fetch weekly analytics
        const { data: weeklyData, error: weeklyError } = await supabase
          .from("weekly_analytics")
          .select("*")
          .eq("user_id", userId)
          .order("week_start", { ascending: false })
          .limit(1)
          .single();

        if (weeklyError && weeklyError.code !== "PGRST116") throw weeklyError; // PGRST116 is "no rows returned"

        // Fetch recent sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("sessions")
          .select(
            `
            id,
            task,
            total_deep_work_minutes,
            total_deep_rest_minutes,
            status,
            created_at,
            projects (
              name,
              color
            )
          `
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (sessionsError) throw sessionsError;

        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", userId);

        if (projectsError) throw projectsError;

        // Set state with all fetched data
        setUserStats({
          user: userData,
          weeklyStats: weeklyData || {
            total_work_minutes: 0,
            work_periods_count: 0,
            avg_quality_rating: 0,
          },
        });
        setRecentSessions(sessionsData || []);
        setProjects(projectsData || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  if (loading) return <div>Loading dashboard data...</div>;
  if (error) return <div>Error loading dashboard: {error}</div>;
  if (!userStats) return <div>No data available</div>;

  const { user, weeklyStats } = userStats;

  return (
    <div className="dashboard-container">
      <h1>Deep Work Dashboard</h1>

      {/* Weekly Stats Summary */}
      <div className="stats-card">
        <h2>This Week</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">
              {Math.round(weeklyStats.total_work_minutes / 60)}
            </span>
            <span className="stat-label">Hours of Deep Work</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{weeklyStats.work_periods_count}</span>
            <span className="stat-label">Sessions Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {weeklyStats.avg_quality_rating
                ? weeklyStats.avg_quality_rating.toFixed(1)
                : "0.0"}
            </span>
            <span className="stat-label">Avg. Quality Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {Math.round(
                (weeklyStats.total_work_minutes / user.daily_goal_minutes) * 100
              )}
              %
            </span>
            <span className="stat-label">Of Weekly Goal</span>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="projects-section">
        <h2>Your Projects ({projects.length})</h2>
        <div className="projects-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              style={{ borderColor: project.color }}
            >
              <h3>{project.name}</h3>
              <p>{project.goal}</p>
            </div>
          ))}
          <div className="project-card new-project">
            <h3>+ New Project</h3>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="recent-sessions">
        <h2>Recent Sessions</h2>
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Task</th>
              <th>Deep Work</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentSessions.map((session) => (
              <tr key={session.id}>
                <td>
                  <span
                    className="project-dot"
                    style={{ backgroundColor: session.projects?.color }}
                  ></span>
                  {session.projects?.name || "No Project"}
                </td>
                <td>{session.task}</td>
                <td>{session.total_deep_work_minutes} min</td>
                <td>{new Date(session.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`status-${session.status}`}>
                    {session.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Session Button */}
      <button className="new-session-button">
        Start New Deep Work Session
      </button>
    </div>
  );
};

export default DashboardSummary;
