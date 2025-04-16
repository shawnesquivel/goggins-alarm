import React, { createContext, useContext, useState, useEffect } from "react";
import { Project } from "@/types/project";
import { PendingOperation, ProjectService } from "@/services/ProjectService";
import { checkConnection } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  pendingOps: any[];
  errorCount: number;
  loadProjects: () => Promise<void>;
  addProject: (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => Promise<Project>;
  updateProject: (project: Project) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  syncProjects: () => Promise<void>;
  clearPendingOperations: () => Promise<PendingOperation[]>;
  resetAllProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeOfflineMode = async () => {
      try {
        const isConnected = await checkConnection();
        if (!isConnected) {
          console.log(
            "Supabase: Failed to connect to Supabase, enabling offline mode"
          );
          await ProjectService.setOfflineMode(true);
        }
      } catch (error) {
        console.log("Network error, enabling offline mode");
        await ProjectService.setOfflineMode(true);
      }
    };

    initializeOfflineMode();
  }, []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingOps, setPendingOps] = useState<any[]>([]);
  const [errorCount, setErrorCount] = useState(0);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const localProjects = await ProjectService.getLocalProjects();
      setProjects(localProjects);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newProject = await ProjectService.createProject(projectData);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError("Failed to add project");
      console.error(err);
      throw err;
    }
  };

  const updateProject = async (project: Project) => {
    try {
      const updatedProject = await ProjectService.updateProject(project);
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
      return updatedProject;
    } catch (err) {
      setError("Failed to update project");
      console.error(err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const result = await ProjectService.deleteProject(id);
      if (result) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
      return result;
    } catch (err) {
      setError("Failed to delete project");
      console.error(err);
      throw err;
    }
  };

  const syncProjects = async () => {
    try {
      setLoading(true);
      await ProjectService.syncProjects();
      await loadProjects(); // Reload after sync
    } catch (err) {
      setError("Failed to sync projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearPendingOperations = async () => {
    try {
      const cleanedOps = await ProjectService.cleanupPendingOperations();
      setPendingOps(cleanedOps);
      // Count potential duplicates (insert operations)
      const insertOps = cleanedOps.filter((op) => op.type === "insert");
      setErrorCount(insertOps.length);
      return cleanedOps;
    } catch (err) {
      setError("Failed to clear pending operations");
      console.error(err);
      throw err;
    }
  };

  const resetAllProjects = async () => {
    console.log("ProjectContext - Resetting all projects");
    try {
      setLoading(true);
      // Clear local storage directly
      await AsyncStorage.setItem("offline_projects", JSON.stringify([]));
      // Clear context state
      setProjects([]);
      console.log("ProjectContext - All projects reset");
    } catch (err) {
      setError("Failed to reset projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize projects
  useEffect(() => {
    loadProjects();

    // Initialize listeners for sync
    ProjectService.initListeners();

    // Sync on initial load
    syncProjects();
  }, []);

  // Add this effect to load pending operations periodically
  useEffect(() => {
    const loadPendingOps = async () => {
      try {
        const ops = await ProjectService.getPendingOperations();
        setPendingOps(ops);
        // Count potential duplicates
        const insertOps = ops.filter((op) => op.type === "insert");
        setErrorCount(insertOps.length);
      } catch (err) {
        console.error("Error loading pending operations:", err);
      }
    };

    loadPendingOps();
    const interval = setInterval(loadPendingOps, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        loadProjects,
        addProject,
        updateProject,
        deleteProject,
        syncProjects,
        pendingOps,
        errorCount,
        clearPendingOperations,
        resetAllProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
