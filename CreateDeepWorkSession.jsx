import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const CreateDeepWorkSession = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [task, setTask] = useState("");
  const [workMinutes, setWorkMinutes] = useState(30);
  const [restMinutes, setRestMinutes] = useState(0.1);
  const [intentionTranscription, setIntentionTranscription] = useState("");

  // Session tracking state
  const [activeSession, setActiveSession] = useState(null);
  const [activePeriod, setActivePeriod] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Fetch user's projects on component mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", userId);

        if (error) throw error;
        setProjects(data || []);

        // Also fetch user defaults
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("default_deep_work_minutes, default_deep_rest_minutes")
          .eq("id", userId)
          .single();

        if (userError) throw userError;

        if (userData) {
          setWorkMinutes(userData.default_deep_work_minutes);
          setRestMinutes(userData.default_deep_rest_minutes);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }

    if (userId) {
      fetchProjects();
    }
  }, [userId]);

  // Timer interval for active sessions
  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTimer((seconds) => seconds + 1);
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, timer]);

  // Create a new session in the database
  const createSession = async () => {
    if (!task) {
      alert("Please enter a task description");
      return;
    }

    try {
      setLoading(true);

      // Create session record
      const { data: session, error } = await supabase
        .from("sessions")
        .insert([
          {
            user_id: userId,
            project_id: selectedProject,
            task: task,
            intention_transcription: intentionTranscription,
            status: "in_progress",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setActiveSession(session);
      setLoading(false);

      // Start the first work period automatically
      startWorkPeriod(session.id);
    } catch (error) {
      console.error("Error creating session:", error);
      setLoading(false);
    }
  };

  // Start a work period
  const startWorkPeriod = async (sessionId) => {
    try {
      const { data: period, error } = await supabase
        .from("periods")
        .insert([
          {
            session_id: sessionId,
            type: "work",
            planned_duration_minutes: workMinutes,
            started_at: new Date().toISOString(),
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setActivePeriod(period);
      setIsRunning(true);
      setTimer(0);
    } catch (error) {
      console.error("Error starting work period:", error);
    }
  };

  // Complete the current work period
  const completeWorkPeriod = async (quality = 4) => {
    if (!activePeriod) return;

    try {
      setIsRunning(false);

      const actualMinutes = Math.round(timer / 60);
      const endedAt = new Date().toISOString();

      // Update the period
      const { error } = await supabase
        .from("periods")
        .update({
          ended_at: endedAt,
          actual_duration_minutes: actualMinutes,
          quality_rating: quality,
          completed: true,
        })
        .eq("id", activePeriod.id);

      if (error) throw error;

      // Update session totals
      const { error: sessionError } = await supabase
        .from("sessions")
        .update({
          total_deep_work_minutes: supabase.rpc("increment", {
            x: actualMinutes,
            column_name: "total_deep_work_minutes",
            id: activeSession.id,
          }),
        })
        .eq("id", activeSession.id);

      if (sessionError) throw sessionError;

      // Start rest period
      startRestPeriod();
    } catch (error) {
      console.error("Error completing work period:", error);
    }
  };

  // Start a rest period
  const startRestPeriod = async () => {
    try {
      const { data: period, error } = await supabase
        .from("periods")
        .insert([
          {
            session_id: activeSession.id,
            type: "rest",
            planned_duration_minutes: restMinutes,
            started_at: new Date().toISOString(),
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setActivePeriod(period);
      setIsRunning(true);
      setTimer(0);
    } catch (error) {
      console.error("Error starting rest period:", error);
    }
  };

  // Complete the current rest period
  const completeRestPeriod = async (activities = ["walking", "hydration"]) => {
    if (!activePeriod) return;

    try {
      setIsRunning(false);

      const actualMinutes = Math.round(timer / 60);
      const endedAt = new Date().toISOString();

      // Update the period
      const { error } = await supabase
        .from("periods")
        .update({
          ended_at: endedAt,
          actual_duration_minutes: actualMinutes,
          rest_activities_selected: activities,
          completed: true,
        })
        .eq("id", activePeriod.id);

      if (error) throw error;

      // Update session totals
      const { error: sessionError } = await supabase
        .from("sessions")
        .update({
          total_deep_rest_minutes: supabase.rpc("increment", {
            x: actualMinutes,
            column_name: "total_deep_rest_minutes",
            id: activeSession.id,
          }),
        })
        .eq("id", activeSession.id);

      if (sessionError) throw sessionError;

      // Reset for next work period
      setActivePeriod(null);
    } catch (error) {
      console.error("Error completing rest period:", error);
    }
  };

  // Complete the entire session
  const completeSession = async () => {
    if (!activeSession) return;

    try {
      // First complete any active period
      if (activePeriod && isRunning) {
        if (activePeriod.type === "work") {
          await completeWorkPeriod();
        } else {
          await completeRestPeriod();
        }
      }

      // Update session to completed status
      const { error } = await supabase
        .from("sessions")
        .update({
          status: "completed",
          completed: true,
        })
        .eq("id", activeSession.id);

      if (error) throw error;

      // Reset component state
      setActiveSession(null);
      setActivePeriod(null);
      setIsRunning(false);
      setTimer(0);
      setTask("");
      setIntentionTranscription("");
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  // Format seconds as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!activePeriod) return 0;
    const totalSeconds = activePeriod.planned_duration_minutes * 60;
    return Math.min(100, (timer / totalSeconds) * 100);
  };

  return (
    <div className="deep-work-container">
      {!activeSession ? (
        <div className="session-setup">
          <h1>Set Up Deep Work Session</h1>

          <div className="form-group">
            <label>Project</label>
            <select
              value={selectedProject || ""}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select a Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Task</label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What will you accomplish?"
            />
          </div>

          <div className="form-group">
            <label>Intention (Optional)</label>
            <textarea
              value={intentionTranscription}
              onChange={(e) => setIntentionTranscription(e.target.value)}
              placeholder="Describe your intentions for this session..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Deep Work Minutes</label>
              <input
                type="number"
                value={workMinutes}
                onChange={(e) => setWorkMinutes(parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>

            <div className="form-group">
              <label>Deep Rest Minutes</label>
              <input
                type="number"
                value={restMinutes}
                onChange={(e) => setRestMinutes(parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>

          <button
            className="start-session-btn"
            onClick={createSession}
            disabled={loading}
          >
            {loading ? "Setting up..." : "Start Deep Work Session"}
          </button>
        </div>
      ) : (
        <div className="active-session">
          <h1>{activePeriod?.type === "work" ? "Deep Work" : "Deep Rest"}</h1>

          <div className="session-info">
            <div
              className="project-tag"
              style={{
                backgroundColor: projects.find((p) => p.id === selectedProject)
                  ?.color,
              }}
            >
              {projects.find((p) => p.id === selectedProject)?.name ||
                "No Project"}
            </div>
            <h2>{task}</h2>
          </div>

          <div className="timer-display">
            <div
              className="progress-ring"
              style={{ "--progress": `${calculateProgress()}%` }}
            >
              <div className="time">{formatTime(timer)}</div>
              <div className="planned-time">
                of {activePeriod?.planned_duration_minutes} min
              </div>
            </div>
          </div>

          {/* Controls for active session */}
          <div className="timer-controls">
            {isRunning ? (
              <>
                <button
                  className="pause-btn"
                  onClick={() => setIsRunning(false)}
                >
                  Pause
                </button>

                {activePeriod?.type === "work" ? (
                  <button
                    className="complete-btn"
                    onClick={() => completeWorkPeriod()}
                  >
                    Complete Work Period
                  </button>
                ) : (
                  <button
                    className="complete-btn"
                    onClick={() => completeRestPeriod()}
                  >
                    Complete Rest Period
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  className="resume-btn"
                  onClick={() => setIsRunning(true)}
                >
                  Resume
                </button>

                {!activePeriod && (
                  <button
                    className="next-btn"
                    onClick={() => startWorkPeriod(activeSession.id)}
                  >
                    Start Next Work Period
                  </button>
                )}
              </>
            )}

            <button className="end-session-btn" onClick={completeSession}>
              End Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDeepWorkSession;
